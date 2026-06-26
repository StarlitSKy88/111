import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const [mau, paid, trials, tiers] = await Promise.all([
      pool.query(`SELECT COUNT(DISTINCT user_id) AS mau FROM monitor_metrics WHERE collected_at > NOW() - INTERVAL '30 days'`),
      pool.query(`SELECT COUNT(*) AS paid_users, COALESCE(SUM(monthly_price_cny), 0) AS mrr FROM tier_subscriptions WHERE status = 'active'`),
      pool.query(`SELECT COUNT(*) AS trials FROM users WHERE trial_end_at > NOW() AND paid_user = FALSE`),
      pool.query(`SELECT tier, COUNT(*) AS count FROM tier_subscriptions WHERE status='active' GROUP BY tier`),
    ]);
    return NextResponse.json({
      metrics: {
        mau: parseInt(mau.rows[0].mau),
        paid_users: parseInt(paid.rows[0].paid_users),
        mrr_cny: parseInt(paid.rows[0].mrr),
        active_trials: parseInt(trials.rows[0].trials),
        tiers_distribution: tiers.rows,
      },
      generated_at: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
