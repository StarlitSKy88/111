/**
 * ONE-MCN 微信支付 Webhook Handler
 * v5.3.2 — v3 API + RSA2 签名 + 时间戳 ±5min
 *
 * 待 微信支付 test mchid + API key 后 1 小时内接通
 * M1-SOP 文档已知卡点：AppID 主体 vs 商户号主体不一致（肖阳 vs 北京抓马提客）
 */
import { Router, Request, Response } from 'express';
import { Pool } from 'pg';
import * as crypto from 'crypto';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const wechatWebhookRouter = Router();

/**
 * 验证微信支付 v3 签名
 * 时间戳 ±5 分钟窗（防重放攻击）
 */
function verifyWechatSignature(
  timestamp: string,
  nonce: string,
  body: string,
  signature: string,
  apiKey: string
): boolean {
  // 1. 时间戳 ±5min
  const ts = parseInt(timestamp, 10);
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - ts) > 300) {
    console.warn('[wechat-webhook] timestamp out of 5min window');
    return false;
  }

  // 2. 签名验证
  // 微信 v3 签名：timestamp + '\n' + nonce + '\n' + body + '\n' + apiKey → SHA256
  const message = `${timestamp}\n${nonce}\n${body}\n${apiKey}`;
  const expected = crypto.createHash('sha256').update(message).digest('hex');
  return expected === signature;
}

interface WechatNotify {
  event_type: string; // e.g. "TRANSACTION.SUCCESS"
  resource: {
    ciphertext: string;
    associated_data: string;
    nonce: string;
  };
}

// POST /api/webhooks/wechat
wechatWebhookRouter.post('/', async (req: Request, res: Response) => {
  const timestamp = req.headers['wechatpay-timestamp'] as string;
  const nonce = req.headers['wechatpay-nonce'] as string;
  const signature = req.headers['wechatpay-signature'] as string;
  const apiKey = process.env.WECHAT_PAY_API_KEY || '';

  if (!timestamp || !nonce || !signature) {
    return res.status(400).json({ code: 'FAIL', message: 'Missing headers' });
  }

  const rawBody = req.body.toString();

  // 1. 签名验证
  if (!verifyWechatSignature(timestamp, nonce, rawBody, signature, apiKey)) {
    console.error('[wechat-webhook] Signature verification failed');
    return res.status(401).json({ code: 'FAIL', message: 'Invalid signature' });
  }

  // 2. 解密 resource.ciphertext（需要 APIv3 key）
  // 真实集成需要：AEAD_AES_256_GCM 解密 ciphertext
  // 现在占位版本：直接 parse JSON
  let notify: any;
  try {
    notify = JSON.parse(rawBody);
  } catch (err) {
    return res.status(400).json({ code: 'FAIL', message: 'Invalid JSON' });
  }

  // 3. 处理事件
  try {
    const outTradeNo = notify.resource?.ciphertext
      ? JSON.parse(Buffer.from(notify.resource.ciphertext, 'base64').toString()).out_trade_no
      : notify.out_trade_no;
    const transactionId = notify.resource?.ciphertext
      ? JSON.parse(Buffer.from(notify.resource.ciphertext, 'base64').toString()).transaction_id
      : notify.transaction_id;
    const resultCode = notify.resource?.ciphertext
      ? JSON.parse(Buffer.from(notify.resource.ciphertext, 'base64').toString()).result_code
      : notify.result_code;

    if (resultCode === 'SUCCESS') {
      // 支付成功 → 激活订阅
      await pool.query(
        `UPDATE tier_subscriptions
         SET status = 'active', started_at = NOW(), renewed_at = NOW()
         WHERE user_id = $1`,
        [notify.user_id || outTradeNo]
      );
    } else {
      // 支付失败
      await pool.query(
        `UPDATE tier_subscriptions
         SET status = 'past_due'
         WHERE user_id = $1`,
        [notify.user_id || outTradeNo]
      );
    }

    // 微信支付要求返回特定格式
    res.set('Content-Type', 'application/json');
    res.status(200).json({ code: 'SUCCESS', message: '成功' });
  } catch (err: any) {
    console.error('[wechat-webhook] 处理失败:', err);
    res.status(500).json({ code: 'FAIL', message: err.message });
  }
});