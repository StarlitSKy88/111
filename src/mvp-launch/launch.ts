/**
 * ONE-MCN MVP 上线流程
 * v5.3.1 — Task #6 MVP launch 占位
 */
import { Pool } from 'pg';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export interface MVPLaunchChecklist {
  brand_building_validated: boolean;
  mvp_url_accessible: boolean;
  baseline_metrics_recorded: boolean;
  consistency_review_passed: boolean;
  agents_active: boolean;
}

export async function runMVPLaunchChecklist(user_id: string): Promise<MVPLaunchChecklist> {
  const checklist: MVPLaunchChecklist = {
    brand_building_validated: false,
    mvp_url_accessible: false,
    baseline_metrics_recorded: false,
    consistency_review_passed: false,
    agents_active: false,
  };

  try {
    const bb = await pool.query(
      'SELECT validated_at, agents_active FROM brand_buildings WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
      [user_id]
    );
    if (bb.rows[0]?.validated_at) {
      checklist.brand_building_validated = true;
      if (bb.rows[0].agents_active && Object.keys(bb.rows[0].agents_active).length >= 4) {
        checklist.agents_active = true;
      }
    }
  } catch {}

  return checklist;
}

export function isMVPReady(checklist: MVPLaunchChecklist): boolean {
  return Object.values(checklist).every(v => v === true);
}