import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import { pool } from '@/lib/db';

export const runtime = 'nodejs';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const { email, password } = schema.parse(await req.json());
    const r = await pool.query(
      `SELECT id, email, tenant_id, password_hash FROM users WHERE email = $1`,
      [email]
    );
    if (r.rowCount === 0) {
      return NextResponse.json({ error: '邮箱或密码错误' }, { status: 401 });
    }
    const user = r.rows[0];
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return NextResponse.json({ error: '邮箱或密码错误' }, { status: 401 });
    }
    return NextResponse.json({
      user_id: user.id,
      email: user.email,
      tenant_id: user.tenant_id,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
