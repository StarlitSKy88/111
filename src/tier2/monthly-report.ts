/**
 * ONE-MCN Tier 2 月度策略报告（每月 1 号自动）
 * v5.3.1 — L-W-TIER2-02 占位
 */
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function generateTier2MonthlyReport(monthStart: Date) {
  const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 1);
  const r = await pool.query(
    `SELECT
       COUNT(DISTINCT ts.user_id) AS active_tier2_users,
       AVG(g.growth_pct) AS avg_growth,
       SUM(ts.monthly_price_cny) AS mrr_cny
     FROM tier_subscriptions ts
     LEFT JOIN tier2_user_growth g ON g.user_id = ts.user_id
     WHERE ts.tier = 'tier2' AND ts.status = 'active'
       AND ts.started_at BETWEEN $1 AND $2`,
    [monthStart, monthEnd]
  );
  return {
    month: `${monthStart.getFullYear()}-${String(monthStart.getMonth() + 1).padStart(2, '0')}`,
    active_tier2_users: parseInt(r.rows[0]?.active_tier2_users || 0),
    avg_growth_pct: parseFloat(r.rows[0]?.avg_growth || 0),
    mrr_cny: parseInt(r.rows[0]?.mrr_cny || 0),
    generated_at: new Date().toISOString(),
  };
}