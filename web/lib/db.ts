/**
 * ONE-MCN DB Pool (Next.js API Routes)
 * v5.6 — EdgeOne 全栈部署
 */
import { Pool } from 'pg';

const globalForPool = globalThis as unknown as { pool: Pool | undefined };

export const pool =
  globalForPool.pool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,
    idleTimeoutMillis: 30000,
  });

if (process.env.NODE_ENV !== 'production') globalForPool.pool = pool;
