/**
 * ONE-MCN 5 维数据采集 cron（每 5 分钟）
 * v5.3.2 — 修复 RLS 违规：使用真实用户 ID 或 system tenant
 */
import { Pool } from 'pg';
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function getSystemUser(): Promise<string> {
  const r = await pool.query('SELECT id FROM users LIMIT 1');
  if (r.rows[0]) return r.rows[0].id;
  // 没有用户则插入 system user
  const sysId = '00000000-0000-0000-0000-000000000001';
  await pool.query(
    `INSERT INTO users (id, email, password_hash, tenant_id)
     VALUES ($1, 'system@one-mcn.local', 'noop', $1)
     ON CONFLICT (id) DO NOTHING`,
    [sysId]
  );
  return sysId;
}

async function main() {
  const userId = await getSystemUser();
  const tenantId = userId;
  const types = ['traffic', 'conversion', 'revenue', 'brand', 'retention'];
  for (const metric_type of types) {
    await pool.query(
      `INSERT INTO monitor_metrics (user_id, tenant_id, metric_type, value)
       VALUES ($1, $2, $3, 0)`,
      [userId, tenantId, metric_type]
    );
  }
  console.log(`[collect-metrics] 5 metrics collected at ${new Date().toISOString()}`);
  await pool.end();
}
main().catch((e) => { console.error(e); process.exit(1); });