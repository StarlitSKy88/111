/**
 * ONE-MCN 周报告生成（每周一 09:00 自动）
 * v5.3.1 — L-W-MONITOR-03 占位
 */
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function generateWeeklyReport(weekStart: Date): Promise<{
  week_start: string;
  week_end: string;
  total_users: number;
  new_users: number;
  active_users: number;
  paid_users: number;
  trials_converted: number;
  recommendations: string[];
}> {
  const week_end = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
  const total_users = await pool.query('SELECT COUNT(*) FROM users');
  const new_users = await pool.query(
    'SELECT COUNT(*) FROM users WHERE created_at BETWEEN $1 AND $2',
    [weekStart, week_end]
  );
  const active_users = await pool.query(
    'SELECT COUNT(DISTINCT user_id) FROM monitor_metrics WHERE collected_at > NOW() - INTERVAL \'7 days\''
  );
  const paid_users = await pool.query(
    'SELECT COUNT(*) FROM tier_subscriptions WHERE status = \'active\''
  );

  return {
    week_start: weekStart.toISOString().split('T')[0],
    week_end: week_end.toISOString().split('T')[0],
    total_users: parseInt(total_users.rows[0].count),
    new_users: parseInt(new_users.rows[0].count),
    active_users: parseInt(active_users.rows[0].count),
    paid_users: parseInt(paid_users.rows[0].count),
    trials_converted: 0,
    recommendations: [
      '本周新增 X 用户，建议推送 design partner onboarding',
      '试用转化率 Y%，目标 Z%',
    ],
  };
}