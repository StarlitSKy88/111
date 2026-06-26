import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const r = await pool.query('SELECT NOW(), version()');
    return NextResponse.json({
      status: 'ok',
      service: 'one-mcn',
      version: '5.6.0',
      database: {
        connected: true,
        now: r.rows[0].now,
        pg_version: r.rows[0].version.split(' ')[1],
      },
    });
  } catch (err: any) {
    return NextResponse.json({ status: 'degraded', error: err.message }, { status: 503 });
  }
}
