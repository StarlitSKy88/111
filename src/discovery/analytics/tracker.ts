/**
 * ONE-MCN Discovery 埋点追踪器
 * v5.3.1 — Task #8 修复 L-DISC-01 V3 FAIL
 * 验证：test -f src/discovery/analytics/tracker.ts
 */
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export interface DiscoveryEvent {
  session_id: string;
  user_id?: string;
  tenant_id?: string;
  event_type: 'state_entered' | 'turn_completed' | 'session_started' | 'session_completed' | 'blueprint_progress';
  from_state?: string;
  to_state?: string;
  turn_count?: number;
  duration_ms?: number;
  blueprint_progress?: number;
  metadata?: Record<string, unknown>;
}

export async function trackEvent(event: DiscoveryEvent): Promise<void> {
  try {
    await pool.query(
      `INSERT INTO monitor_metrics (user_id, tenant_id, metric_type, value, metadata, collected_at)
       VALUES ($1, $2, $3, $4, $5, NOW())`,
      [
        event.user_id ?? '00000000-0000-0000-0000-000000000000',
        event.tenant_id ?? '00000000-0000-0000-0000-000000000000',
        `discovery.${event.event_type}`,
        event.turn_count ?? event.blueprint_progress ?? 0,
        JSON.stringify(event),
      ]
    );
  } catch (err) {
    // 埋点失败不应阻塞主流程
    console.error('[tracker] failed to track event:', err);
  }
}

export async function trackSessionStart(session_id: string): Promise<void> {
  await trackEvent({
    session_id,
    event_type: 'session_started',
    duration_ms: 0,
  });
}

export async function trackStateTransition(
  session_id: string,
  from_state: string,
  to_state: string,
  turn_count: number,
): Promise<void> {
  await trackEvent({
    session_id,
    event_type: 'state_entered',
    from_state,
    to_state,
    turn_count,
  });
}

export async function trackBlueprintProgress(
  session_id: string,
  progress: number,
): Promise<void> {
  await trackEvent({
    session_id,
    event_type: 'blueprint_progress',
    blueprint_progress: progress,
  });
}