import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET(_req: NextRequest, { params }: { params: { user_id: string } }) {
  try {
    const r = await pool.query(
      `SELECT id, email, trial_end_at, paid_user FROM users WHERE id = $1`,
      [params.user_id]
    );
    if (r.rowCount === 0) {
      return NextResponse.json({ error: 'user not found' }, { status: 404 });
    }
    const u = r.rows[0];
    const days_remaining = u.trial_end_at
      ? Math.max(0, Math.ceil((new Date(u.trial_end_at).getTime() - Date.now()) / 86400000))
      : 0;
    return NextResponse.json({
      user_id: u.id,
      email: u.email,
      trial_end_at: u.trial_end_at,
      days_remaining,
      paid_user: u.paid_user,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
