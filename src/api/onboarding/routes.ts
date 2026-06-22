/**
 * ONE-MCN Design Partner Onboarding API
 * v5.3.1 — Task #7 onboarding 路由
 */
import { Router, Request, Response } from 'express';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const onboardingRouter = Router();

// POST /api/onboarding/start — 启动 14 天试用
onboardingRouter.post('/start', async (req: Request, res: Response) => {
  try {
    const { user_id, email } = req.body;
    if (!user_id || !email) {
      return res.status(400).json({ error: 'user_id and email required' });
    }
    const trial_end = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
    await pool.query(
      `UPDATE users SET trial_end_at = $1 WHERE id = $2`,
      [trial_end, user_id]
    );
    await pool.query(
      `INSERT INTO monitor_metrics (user_id, tenant_id, metric_type, value, metadata, collected_at)
       VALUES ($1, '00000000-0000-0000-0000-000000000000', 'onboarding_started', 1, $2, NOW())`,
      [user_id, JSON.stringify({ email, trial_end })]
    );
    res.json({
      user_id,
      trial_end_at: trial_end.toISOString(),
      reminder_at: new Date(trial_end.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'trial_active',
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/onboarding/feedback — 每日/每周反馈
onboardingRouter.post('/feedback', async (req: Request, res: Response) => {
  try {
    const { user_id, feedback_type, content } = req.body;
    if (!user_id || !feedback_type || !content) {
      return res.status(400).json({ error: 'user_id, feedback_type, content required' });
    }
    await pool.query(
      `INSERT INTO monitor_metrics (user_id, tenant_id, metric_type, value, metadata, collected_at)
       VALUES ($1, '00000000-0000-0000-0000-000000000000', $2, 1, $3, NOW())`,
      [user_id, `design_partner_${feedback_type}`, JSON.stringify({ content, submitted_at: new Date().toISOString() })]
    );
    res.json({ status: 'feedback_recorded', feedback_type, submitted_at: new Date().toISOString() });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/onboarding/trial/:user_id — 查询试用状态
onboardingRouter.get('/trial/:user_id', async (req: Request, res: Response) => {
  try {
    const r = await pool.query(
      `SELECT id, email, trial_end_at, paid_user FROM users WHERE id = $1`,
      [req.params.user_id]
    );
    if (r.rowCount === 0) {
      return res.status(404).json({ error: 'user not found' });
    }
    const user = r.rows[0];
    const days_remaining = user.trial_end_at
      ? Math.max(0, Math.ceil((new Date(user.trial_end_at).getTime() - Date.now()) / (24 * 60 * 60 * 1000)))
      : 0;
    res.json({
      user_id: user.id,
      email: user.email,
      trial_end_at: user.trial_end_at,
      days_remaining,
      paid_user: user.paid_user,
      will_renew_probability: days_remaining > 0 ? 'TBD' : 'expired',
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});