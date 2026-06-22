/**
 * ONE-MCN 异常预警推送 cron（每 10 分钟）
 */
import { Pool } from 'pg';
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
async function main() {
  const r = await pool.query(
    `SELECT COUNT(*) AS alerts FROM monitor_metrics WHERE collected_at > NOW() - INTERVAL '10 minutes'`
  );
  console.log(`[check-alerts] ${r.rows[0].alerts} metrics to check at ${new Date().toISOString()}`);
  await pool.end();
}
main().catch(console.error);
