import { NextRequest, NextResponse } from 'next/server';
import * as crypto from 'crypto';
import { pool } from '@/lib/db';

export const runtime = 'nodejs';

function verifyAlipaySign(params: Record<string, string>, sign: string, publicKey: string): boolean {
  const sortedKeys = Object.keys(params)
    .filter((k) => k !== 'sign' && k !== 'sign_type' && params[k])
    .sort();
  const signStr = sortedKeys.map((k) => `${k}=${params[k]}`).join('&');
  try {
    const verifier = crypto.createVerify('RSA-SHA256');
    verifier.update(signStr, 'utf8');
    return verifier.verify(publicKey, sign, 'base64');
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    const params = Object.fromEntries(await req.formData());
    const sign = params.sign as string;
    const publicKey = process.env.ALIPAY_PUBLIC_KEY || '';
    if (!verifyAlipaySign(params, sign, publicKey)) {
      return new NextResponse('fail', { status: 401 });
    }
    const { out_trade_no, trade_status, total_amount } = params;
    if (trade_status === 'TRADE_SUCCESS' || trade_status === 'TRADE_FINISHED') {
      await pool.query(
        `UPDATE tier_subscriptions SET status = 'active', started_at = NOW(), renewed_at = NOW(), monthly_price_cny = $2 WHERE user_id = $1`,
        [out_trade_no, parseFloat(total_amount || '999')]
      );
    } else if (trade_status === 'TRADE_CLOSED') {
      await pool.query(`UPDATE tier_subscriptions SET status = 'canceled', ended_at = NOW() WHERE user_id = $1`, [out_trade_no]);
    }
    return new NextResponse('success', { status: 200 });
  } catch {
    return new NextResponse('fail', { status: 500 });
  }
}
