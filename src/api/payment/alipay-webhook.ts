/**
 * ONE-MCN 支付宝 Webhook Handler
 * v5.3.2 — RSA2 签名验证 + 异步通知
 *
 * 待 支付宝 test key（应用 ID + 私钥 + 公钥）后 1 小时内接通
 */
import { Router, Request, Response } from 'express';
import { Pool } from 'pg';
import * as crypto from 'crypto';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const alipayWebhookRouter = Router();

/**
 * 验证支付宝 RSA2 签名
 */
function verifyAlipaySign(
  params: Record<string, string>,
  sign: string,
  alipayPublicKey: string
): boolean {
  // 1. 按 key 排序 + 拼接
  const sortedKeys = Object.keys(params)
    .filter((k) => k !== 'sign' && k !== 'sign_type' && params[k])
    .sort();
  const signStr = sortedKeys.map((k) => `${k}=${params[k]}`).join('&');

  // 2. RSA2 验签
  try {
    const verifier = crypto.createVerify('RSA-SHA256');
    verifier.update(signStr, 'utf8');
    return verifier.verify(alipayPublicKey, sign, 'base64');
  } catch (err) {
    console.error('[alipay-webhook] verifySign error:', err);
    return false;
  }
}

// POST /api/webhooks/alipay
alipayWebhookRouter.post('/', async (req: Request, res: Response) => {
  const params = req.body;
  const sign = params.sign;
  const alipayPublicKey = process.env.ALIPAY_PUBLIC_KEY || '';

  if (!sign) {
    return res.send('fail');
  }

  // 1. 验签
  if (!verifyAlipaySign(params, sign, alipayPublicKey)) {
    console.error('[alipay-webhook] Signature verification failed');
    return res.send('fail');
  }

  // 2. 处理通知
  try {
    const { out_trade_no, trade_status, total_amount } = params;

    if (trade_status === 'TRADE_SUCCESS' || trade_status === 'TRADE_FINISHED') {
      // 支付成功
      await pool.query(
        `UPDATE tier_subscriptions
         SET status = 'active', started_at = NOW(), renewed_at = NOW(), monthly_price_cny = $2
         WHERE user_id = $1`,
        [out_trade_no, parseFloat(total_amount || '999')]
      );
    } else if (trade_status === 'TRADE_CLOSED') {
      // 交易关闭（退款等）
      await pool.query(
        `UPDATE tier_subscriptions
         SET status = 'canceled', ended_at = NOW()
         WHERE user_id = $1`,
        [out_trade_no]
      );
    }

    // 支付宝要求返回纯文本 "success"
    res.send('success');
  } catch (err: any) {
    console.error('[alipay-webhook] 处理失败:', err);
    res.send('fail');
  }
});