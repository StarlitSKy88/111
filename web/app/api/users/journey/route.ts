import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const r = await pool.query(
      `SELECT stage, COUNT(*) AS count FROM users GROUP BY stage ORDER BY stage`
    );
    return NextResponse.json({ journey: r.rows, generated_at: new Date().toISOString() });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
