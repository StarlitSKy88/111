/**
 * ONE-MCN 续费提醒 cron（每日 09:00）
 */
import { Pool } from 'pg';
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
async function main() {
  const r = await pool.query(
    `SELECT user_id, tenant_id, tier, monthly_price_cny,
            (started_at + INTERVAL '30 days') AS next_renewal
     FROM tier_subscriptions
     WHERE status = 'active'
       AND (started_at + INTERVAL '30 days') BETWEEN NOW() AND NOW() + INTERVAL '7 days'`
  );
  console.log(`[renewal-reminder] ${r.rowCount} users due for renewal in 7 days`);
  for (const row of r.rows) {
    console.log(`  - user=${row.user_id} tier=${row.tier} next=${row.next_renewal.toISOString()}`);
  }
  await pool.end();
}
main().catch(console.error);
