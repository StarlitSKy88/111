/**
 * ONE-MCN 用户路由
 * v5.3.1 — L-W-CROSS-01
 */
import { Router } from 'express';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const usersRouter = Router();

usersRouter.get('/journey', async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT stage, COUNT(*) AS count FROM users GROUP BY stage ORDER BY stage`
    );
    res.json({ journey: r.rows, generated_at: new Date().toISOString() });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});