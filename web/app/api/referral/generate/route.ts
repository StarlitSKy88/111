import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { pool } from '@/lib/db';

export const runtime = 'nodejs';

const schema = z.object({ user_id: z.string().uuid() });

function generateCode() {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export async function POST(req: NextRequest) {
  try {
    const { user_id } = schema.parse(await req.json());
    const u = await pool.query('SELECT tenant_id FROM users WHERE id = $1', [user_id]);
    if (u.rowCount === 0) {
      return NextResponse.json({ error: 'user not found' }, { status: 404 });
    }
    const tenant_id = u.rows[0].tenant_id;
    const existing = await pool.query(
      `SELECT code FROM referral_codes WHERE user_id = $1 AND is_active = TRUE LIMIT 1`,
      [user_id]
    );
    if (existing.rowCount && existing.rowCount > 0) {
      return NextResponse.json({
        user_id,
        code: existing.rows[0].code,
        link: `${process.env.PUBLIC_URL || 'http://localhost:3000'}/onboarding?ref=${existing.rows[0].code}`,
        reused: true,
      });
    }
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
    return NextResponse.json({
      user_id,
      code,
      link: `${process.env.PUBLIC_URL || 'http://localhost:3000'}/onboarding?ref=${code}`,
      reused: false,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
