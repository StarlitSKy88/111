/**
 * ONE-MCN Auth Verify Code
 * v5.4 — 邮箱验证码（基于 data/verify-codes.json + 腾讯云 SMTP）
 *
 * 复用现有 CLAUDE.md 决策：
 *   - 邮件服务：腾讯云邮件推送
 *   - SMTP: gz-smtp.qcloudmail.com:465
 *   - 发件地址: nodemailer@taomyst.top
 *   - 验证码存储: data/verify-codes.json
 */
import { Router, Request, Response } from 'express';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import * as nodemailer from 'nodemailer';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const verifyCodeRouter = Router();

interface VerifyCode {
  email: string;
  code: string;
  expires_at: string;
  used: boolean;
}

const CODES_FILE = join(process.cwd(), 'data/verify-codes.json');

function loadCodes(): VerifyCode[] {
  if (!existsSync(CODES_FILE)) return [];
  try {
    return JSON.parse(readFileSync(CODES_FILE, 'utf-8'));
  } catch {
    return [];
  }
}

function saveCodes(codes: VerifyCode[]) {
  // 确保 data/ 目录存在
  const dir = dirname(CODES_FILE);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  writeFileSync(CODES_FILE, JSON.stringify(codes, null, 2));
}

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function getMailer() {
  const user = process.env.QCLOUD_MAIL_USER || 'nodemailer@taomyst.top';
  const pass = process.env.QCLOUD_MAIL_PASS;
  if (!pass) return null;
  return nodemailer.createTransport({
    host: 'gz-smtp.qcloudmail.com',
    port: 465,
    secure: true,
    auth: { user, pass },
  });
}

// POST /api/auth/send-verify-code
verifyCodeRouter.post('/send-verify-code', async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Invalid email' });
  }

  const code = generateCode();
  const expires_at = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 分钟

  const codes = loadCodes().filter((c) => c.email !== email || c.used);
  codes.push({ email, code, expires_at, used: false });
  saveCodes(codes);

  // 发邮件
  const mailer = getMailer();
  if (mailer) {
    try {
      await mailer.sendMail({
        from: 'ONE-MCN <nodemailer@taomyst.top>',
        to: email,
        subject: 'ONE-MCN 注册验证码',
        text: `您的验证码是：${code}（10 分钟内有效）。`,
        html: `<p>您的验证码是：<strong>${code}</strong></p><p>10 分钟内有效。</p>`,
      });
    } catch (err) {
      console.error('[verify-code] 邮件发送失败:', err);
      // 不阻塞：开发模式下仍返回 code（仅 console.error）
    }
  }

  res.json({
    sent: true,
    expires_in: 600, // 秒
    // dev 模式返回 code（生产环境删除）
    ...(process.env.NODE_ENV === 'development' ? { dev_code: code } : {}),
  });
});

// POST /api/auth/verify-code — 校验验证码
verifyCodeRouter.post('/verify-code', async (req: Request, res: Response) => {
  const { email, code } = req.body;
  if (!email || !code) {
    return res.status(400).json({ error: 'email and code required' });
  }

  const codes = loadCodes();
  const record = codes.find(
    (c) => c.email === email && c.code === code && !c.used && new Date(c.expires_at) > new Date()
  );

  if (!record) {
    return res.status(401).json({ error: '验证码无效或已过期' });
  }

  // 标记已用
  record.used = true;
  saveCodes(codes);

  res.json({ verified: true });
});