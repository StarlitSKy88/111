/**
 * ONE-MCN 业务北极星指标
 * v5.3.1 — L-W-CROSS-02
 */
import { Router } from 'express';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const dashboardRouter = Router();

dashboardRouter.get('/north-star', async (_req, res) => {
  try {
    const mau = await pool.query(
      `SELECT COUNT(DISTINCT user_id) AS mau
       FROM monitor_metrics WHERE collected_at > NOW() - INTERVAL '30 days'`
    );
    const paid = await pool.query(
      `SELECT COUNT(*) AS paid_users, SUM(monthly_price_cny) AS mrr
       FROM tier_subscriptions WHERE status = 'active'`
    );
    const trials = await pool.query(
      `SELECT COUNT(*) AS trials FROM users WHERE trial_end_at > NOW() AND paid_user = FALSE`
    );
    const tiers = await pool.query(
      `SELECT tier, COUNT(*) AS count FROM tier_subscriptions WHERE status='active' GROUP BY tier`
    );
    res.json({
      metrics: {
        mau: parseInt(mau.rows[0].mau),
        paid_users: parseInt(paid.rows[0].paid_users),
        mrr_cny: parseInt(paid.rows[0].mrr || 0),
        active_trials: parseInt(trials.rows[0].trials),
        tiers_distribution: tiers.rows,
      },
      generated_at: new Date().toISOString(),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});