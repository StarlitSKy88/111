import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import nodemailer from 'nodemailer';

export const runtime = 'nodejs';

const schema = z.object({ email: z.string().email() });

const CODES_FILE = join(process.cwd(), 'data/verify-codes.json');

function loadCodes(): any[] {
  if (!existsSync(CODES_FILE)) return [];
  try {
    return JSON.parse(readFileSync(CODES_FILE, 'utf-8'));
  } catch {
    return [];
  }
}

function saveCodes(codes: any[]) {
  const dir = dirname(CODES_FILE);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(CODES_FILE, JSON.stringify(codes, null, 2));
}

function getMailer() {
  const user = process.env.SMTP_USER || 'nodemailer@taomyst.top';
  const pass = process.env.SMTP_PASS;
  if (!pass) return null;
  return nodemailer.createTransport({
    host: 'gz-smtp.qcloudmail.com',
    port: 465,
    secure: true,
    auth: { user, pass },
  });
}

export async function POST(req: NextRequest) {
  try {
    const { email } = schema.parse(await req.json());
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires_at = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    const codes = loadCodes().filter((c) => c.email !== email || c.used);
    codes.push({ email, code, expires_at, used: false });
    saveCodes(codes);

    const mailer = getMailer();
    if (mailer) {
      await mailer.sendMail({
        from: 'ONE-MCN <nodemailer@taomyst.top>',
        to: email,
        subject: 'ONE-MCN 注册验证码',
        text: `您的验证码是：${code}（10 分钟内有效）。`,
      });
    }

    return NextResponse.json({
      sent: true,
      expires_in: 600,
      ...(process.env.NODE_ENV === 'development' ? { dev_code: code } : {}),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
