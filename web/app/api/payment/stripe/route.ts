import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const raw = await req.text();
    const event = JSON.parse(raw);
    const tenantId = event.data?.object?.metadata?.tenant_id || '00000000-0000-0000-0000-000000000001';
    const userId = event.data?.object?.metadata?.user_id || null;

    await pool.query(
      `INSERT INTO stripe_events (event_id, tenant_id, user_id, event_type, payload, signature_verified, processed)
       VALUES ($1, $2, $3, $4, $5, $6, FALSE)
       ON CONFLICT (event_id) DO NOTHING`,
      [event.id, tenantId, userId, event.type, raw, true]
    );

    if (event.type === 'checkout.session.completed') {
      await pool.query(
        `UPDATE tier_subscriptions SET status = 'active', started_at = NOW() WHERE user_id = $1 AND status = 'pending'`,
        [userId]
      );
    } else if (event.type === 'invoice.payment_succeeded') {
      await pool.query(
        `UPDATE tier_subscriptions SET renewed_at = NOW() WHERE user_id = $1`,
        [userId]
      );
    } else if (event.type === 'customer.subscription.deleted') {
      await pool.query(
        `UPDATE tier_subscriptions SET status = 'canceled', ended_at = NOW() WHERE user_id = $1`,
        [userId]
      );
    } else if (event.type === 'customer.subscription.updated') {
      await pool.query(
        `UPDATE tier_subscriptions SET tier = $2 WHERE user_id = $1`,
        [userId, event.data?.object?.metadata?.tier]
      );
    }

    await pool.query(`UPDATE stripe_events SET processed = TRUE WHERE event_id = $1`, [event.id]);
    return NextResponse.json({ received: true, processed: true });
  } catch (err: any) {
    if (err.code === '23505') {
      return NextResponse.json({ received: true, duplicate: true });
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
