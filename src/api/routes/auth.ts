/**
 * ONE-MCN 用户注册 + 登录 API
 * v5.1.4 D1-5~D1-9 + D1-18 (用户删除 API)
 */
import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { pool } from '../../db/middleware/tenant';
import { hashPassword, verifyPassword } from '../../auth/password';

export const authRouter = Router();

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(12, 'Password must be >= 12 chars'),
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

/**
 * POST /api/auth/register
 * 弱密码（如 "123"）返回 400
 */
authRouter.post('/register', async (req: Request, res: Response) => {
  const parsed = RegisterSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: 'Validation failed',
      details: parsed.error.flatten().fieldErrors,
    });
  }
  const { email, password } = parsed.data;
  const tenantId = req.body.tenant_id || crypto.randomUUID();

  const passwordHash = await hashPassword(password);
  try {
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, tenant_id)
       VALUES ($1, $2, $3)
       RETURNING id, email, tenant_id, created_at`,
      [email, passwordHash, tenantId]
    );
    res.status(201).json({ user: result.rows[0] });
  } catch (err: any) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Email already registered' });
    }
    throw err;
  }
});

/**
 * POST /api/auth/login
 * 登录限流由 D0-22 全局 rate-limit 中间件处理
 */
authRouter.post('/login', async (req: Request, res: Response) => {
  const parsed = LoginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Validation failed' });
  }
  const { email, password } = parsed.data;
  const result = await pool.query(
    `SELECT id, email, password_hash, tenant_id FROM users WHERE email = $1`,
    [email]
  );
  if (result.rows.length === 0) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const user = result.rows[0];
  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  res.json({ user_id: user.id, tenant_id: user.tenant_id });
});

/**
 * DELETE /api/users/me（GDPR right to erasure）
 */
authRouter.delete('/users/me', async (req: Request, res: Response) => {
  const userId = req.body.user_id;
  if (!userId) {
    return res.status(400).json({ error: 'user_id required' });
  }
  await pool.query(`DELETE FROM users WHERE id = $1`, [userId]);
  res.json({ deleted: true });
});
