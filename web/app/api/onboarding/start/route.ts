import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { pool } from '@/lib/db';

export const runtime = 'nodejs';

const schema = z.object({
  user_id: z.string().uuid(),
  email: z.string().email(),
});

export async function POST(req: NextRequest) {
  try {
    const { user_id, email } = schema.parse(await req.json());
    const trial_end = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
    await pool.query(`UPDATE users SET trial_end_at = $1 WHERE id = $2`, [trial_end, user_id]);
    await pool.query(
      `INSERT INTO monitor_metrics (user_id, tenant_id, metric_type, value, metadata, collected_at)
       VALUES ($1, $1, 'onboarding_started', 1, $2, NOW())`,
      [user_id, JSON.stringify({ email, trial_end })]
    );
    return NextResponse.json({
      user_id,
      trial_end_at: trial_end.toISOString(),
      reminder_at: new Date(trial_end.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'trial_active',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
