/**
 * ONE-MCN 试用到期提醒 cron（每日 09:00，trial_end 前 3 天）
 */
import { Pool } from 'pg';
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
async function main() {
  const r = await pool.query(
    `SELECT id, trial_end_at
     FROM users
     WHERE paid_user = FALSE
       AND trial_end_at BETWEEN NOW() AND NOW() + INTERVAL '3 days'`
  );
  console.log(`[trial-reminder] ${r.rowCount} users trial ending in 3 days`);
  await pool.end();
}
main().catch(console.error);
