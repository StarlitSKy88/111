/**
 * ONE-MCN ORM 中间件：每事务 SET LOCAL app.tenant_id
 * v5.1.4 D0-14 验证：grep -r "SET LOCAL app.tenant_id" src/db/middleware.ts >= 1
 */
import { Pool, PoolClient } from 'pg';

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

/**
 * 在事务中设置 tenant_id（关键 RLS 实现）
 * 使用 SET LOCAL = 仅当前事务有效（安全）
 */
export async function withTenant<T>(
  tenantId: string,
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('SET LOCAL app.tenant_id = $1', [tenantId]);
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
