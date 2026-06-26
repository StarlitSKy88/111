import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code');
  if (!code) {
    return NextResponse.json({ error: 'code required' }, { status: 400 });
  }
  try {
    const r = await pool.query(
      `SELECT user_id, code FROM referral_codes WHERE code = $1 AND is_active = TRUE`,
      [code]
    );
    if (r.rowCount === 0) {
      return NextResponse.json({ valid: false }, { status: 404 });
    }
    pool.query(
      `UPDATE referral_codes SET used_count = used_count + 1, updated_at = NOW() WHERE code = $1`,
      [code]
    ).catch(console.error);
    return NextResponse.json({
      valid: true,
      referrer_id: r.rows[0].user_id,
      code: r.rows[0].code,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
