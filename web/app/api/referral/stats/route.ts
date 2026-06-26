import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const user_id = req.nextUrl.searchParams.get('user_id');
  if (!user_id) {
    return NextResponse.json({ error: 'user_id required' }, { status: 400 });
  }
  try {
    const [codes, attrs, total] = await Promise.all([
      pool.query(
        `SELECT code, used_count, total_revenue_cny, total_commission_cny, created_at
         FROM referral_codes WHERE user_id = $1 ORDER BY created_at DESC`,
        [user_id]
      ),
      pool.query(
        `SELECT ra.referred_user_id, u.email AS referred_email, ra.status, ra.total_payment_cny, ra.commission_paid_cny, ra.created_at
         FROM referral_attributions ra
         JOIN users u ON u.id = ra.referred_user_id
         WHERE ra.referrer_id = $1
         ORDER BY ra.created_at DESC LIMIT 50`,
        [user_id]
      ),
      pool.query(
        `SELECT
           COUNT(*) AS total_referrals,
           SUM(CASE WHEN status = 'converted' THEN 1 ELSE 0 END) AS converted,
           COALESCE(SUM(total_payment_cny), 0) AS total_revenue,
           COALESCE(SUM(commission_paid_cny), 0) AS total_commission
         FROM referral_attributions WHERE referrer_id = $1`,
        [user_id]
      ),
    ]);
    return NextResponse.json({
      codes: codes.rows,
      referrals: attrs.rows,
      summary: total.rows[0],
      commission_rate: 0.15,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
