import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import { pool } from '@/lib/db';

export const runtime = 'nodejs';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(12),
  plan: z.enum(['tier1', 'tier2', 'tier3']).default('tier1'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, plan } = schema.parse(body);
    const password_hash = await bcrypt.hash(password, 12);
    const r = await pool.query(
      `INSERT INTO users (email, password_hash, tenant_id)
       VALUES ($1, $2, gen_random_uuid())
       ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash
       RETURNING id, email, tenant_id, created_at`,
      [email, password_hash]
    );
    const user = r.rows[0];
    if (plan !== 'tier1') {
      await pool.query(
        `INSERT INTO tier_subscriptions (user_id, tenant_id, tier, status, monthly_price_cny)
         VALUES ($1, $2, $3, 'active', $4)
         ON CONFLICT DO NOTHING`,
        [user.id, user.tenant_id, plan, plan === 'tier2' ? 999 : 50000]
      );
    }
    return NextResponse.json({ user }, { status: 201 });
  } catch (err: any) {
    if (err.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation failed', details: err.flatten() }, { status: 400 });
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
