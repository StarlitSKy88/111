import { NextRequest, NextResponse } from 'next/server';
import * as crypto from 'crypto';
import { pool } from '@/lib/db';

export const runtime = 'nodejs';

function verifyWechatSignature(
  timestamp: string,
  nonce: string,
  body: string,
  signature: string,
  apiKey: string
): boolean {
  const ts = parseInt(timestamp, 10);
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - ts) > 300) return false;
  const message = `${timestamp}\n${nonce}\n${body}\n${apiKey}`;
  const expected = crypto.createHash('sha256').update(message).digest('hex');
  return expected === signature;
}

export async function POST(req: NextRequest) {
  try {
    const timestamp = req.headers.get('wechatpay-timestamp') || '';
    const nonce = req.headers.get('wechatpay-nonce') || '';
    const signature = req.headers.get('wechatpay-signature') || '';
    const apiKey = process.env.WECHAT_PAY_API_KEY || '';
    const rawBody = await req.text();

    if (!verifyWechatSignature(timestamp, nonce, rawBody, signature, apiKey)) {
      return new NextResponse('Invalid signature', { status: 401 });
    }

    const notify = JSON.parse(rawBody);
    const outTradeNo = notify.out_trade_no;
    const resultCode = notify.result_code;

    if (resultCode === 'SUCCESS') {
      await pool.query(
        `UPDATE tier_subscriptions SET status = 'active', started_at = NOW(), renewed_at = NOW() WHERE user_id = $1`,
        [outTradeNo]
      );
    } else {
      await pool.query(
        `UPDATE tier_subscriptions SET status = 'past_due' WHERE user_id = $1`,
        [outTradeNo]
      );
    }
    return new NextResponse('SUCCESS', { status: 200 });
  } catch (err: any) {
    return new NextResponse('fail', { status: 500 });
  }
}
