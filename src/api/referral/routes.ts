/**
 * ONE-MCN Referral API · v5.4
 * 推荐链接生成 + 跟踪 + 佣金
 */
import { Router, Request, Response } from 'express';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const referralRouter = Router();

function generateCode(): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // 排除易混淆字符
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// POST /api/referral/generate — 给当前用户生成推荐码
referralRouter.post('/generate', async (req: Request, res: Response) => {
  const { user_id } = req.body;
  if (!user_id) {
    return res.status(400).json({ error: 'user_id required' });
  }

  try {
    const u = await pool.query('SELECT tenant_id FROM users WHERE id = $1', [user_id]);
    if (u.rowCount === 0) {
      return res.status(404).json({ error: 'user not found' });
    }
    const tenant_id = u.rows[0].tenant_id;

    // 检查是否已有激活的 code
    const existing = await pool.query(
      `SELECT code FROM referral_codes WHERE user_id = $1 AND is_active = TRUE LIMIT 1`,
      [user_id]
    );

    if (existing.rowCount && existing.rowCount > 0) {
      return res.json({
        user_id,
        code: existing.rows[0].code,
        link: `${process.env.PUBLIC_URL || 'http://localhost:3001'}/onboarding?ref=${existing.rows[0].code}`,
        reused: true,
      });
    }

    // 生成新 code（避免冲突重试 5 次）
    let code = generateCode();
    for (let i = 0; i < 5; i++) {
      const dup = await pool.query('SELECT 1 FROM referral_codes WHERE code = $1', [code]);
      if (dup.rowCount === 0) break;
      code = generateCode();
    }

    await pool.query(
      `INSERT INTO referral_codes (user_id, tenant_id, code) VALUES ($1, $2, $3)`,
      [user_id, tenant_id, code]
    );

    res.json({
      user_id,
      code,
      link: `${process.env.PUBLIC_URL || 'http://localhost:3001'}/onboarding?ref=${code}`,
      reused: false,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/referral/stats?user_id=xxx — 查询推荐统计
referralRouter.get('/stats', async (req: Request, res: Response) => {
  const user_id = req.query.user_id as string;
  if (!user_id) {
    return res.status(400).json({ error: 'user_id required' });
  }

  try {
    const codes = await pool.query(
      `SELECT code, used_count, total_revenue_cny, total_commission_cny, created_at
       FROM referral_codes WHERE user_id = $1 ORDER BY created_at DESC`,
      [user_id]
    );

    const attrs = await pool.query(
      `SELECT ra.referred_user_id, u.email AS referred_email, ra.status, ra.total_payment_cny, ra.commission_paid_cny, ra.created_at
       FROM referral_attributions ra
       JOIN users u ON u.id = ra.referred_user_id
       WHERE ra.referrer_id = $1
       ORDER BY ra.created_at DESC LIMIT 50`,
      [user_id]
    );

    const total = await pool.query(
      `SELECT
         COUNT(*) AS total_referrals,
         SUM(CASE WHEN status = 'converted' THEN 1 ELSE 0 END) AS converted,
         COALESCE(SUM(total_payment_cny), 0) AS total_revenue,
         COALESCE(SUM(commission_paid_cny), 0) AS total_commission
       FROM referral_attributions WHERE referrer_id = $1`,
      [user_id]
    );

    res.json({
      codes: codes.rows,
      referrals: attrs.rows,
      summary: total.rows[0],
      commission_rate: 0.15, // 15% per PRD
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/referral/track?code=xxx — 跟踪访问
referralRouter.get('/track', async (req: Request, res: Response) => {
  const code = req.query.code as string;
  if (!code) {
    return res.status(400).json({ error: 'code required' });
  }

  try {
    const r = await pool.query(
      `SELECT user_id, tenant_id, code FROM referral_codes WHERE code = $1 AND is_active = TRUE`,
      [code]
    );

    if (r.rowCount === 0) {
      return res.status(404).json({ valid: false });
    }

    // 增加 used_count（不阻塞）
    pool.query(
      `UPDATE referral_codes SET used_count = used_count + 1, updated_at = NOW() WHERE code = $1`,
      [code]
    ).catch(console.error);

    res.json({
      valid: true,
      referrer_id: r.rows[0].user_id,
      code: r.rows[0].code,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});