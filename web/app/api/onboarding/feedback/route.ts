import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { pool } from '@/lib/db';

export const runtime = 'nodejs';

const schema = z.object({
  user_id: z.string().uuid(),
  feedback_type: z.string().min(1),
  content: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const { user_id, feedback_type, content } = schema.parse(await req.json());
    await pool.query(
      `INSERT INTO monitor_metrics (user_id, tenant_id, metric_type, value, metadata, collected_at)
       VALUES ($1, $1, $2, 1, $3, NOW())`,
      [user_id, `design_partner_${feedback_type}`, JSON.stringify({ content, submitted_at: new Date().toISOString() })]
    );
    return NextResponse.json({ status: 'feedback_recorded', feedback_type });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
