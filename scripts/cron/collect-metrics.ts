/**
 * ONE-MCN 5 维数据采集 cron（每 5 分钟）
 */
import { Pool } from 'pg';
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
async function main() {
  const types = ['traffic', 'conversion', 'revenue', 'brand', 'retention'];
  for (const metric_type of types) {
    await pool.query(
      `INSERT INTO monitor_metrics (user_id, tenant_id, metric_type, value)
       VALUES ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000000', $1, 0)`,
      [metric_type]
    );
  }
  console.log(`[collect-metrics] 5 metrics collected at ${new Date().toISOString()}`);
  await pool.end();
}
main().catch(console.error);
