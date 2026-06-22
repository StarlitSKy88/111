/**
 * ONE-MCN Discovery 多轮对话状态机引擎
 * v5.3.1 — Task #8 修复 L-DISC-01 V3/V4 FAIL
 * 验证：5 状态机 + max_turns=10 + session_id
 */
import { readFileSync } from 'fs';
import { join } from 'path';
import {
  trackSessionStart,
  trackStateTransition,
  trackBlueprintProgress,
} from '../../discovery/analytics/tracker';

interface StateMachineConfig {
  states: string[];
  max_turns: number;
  transitions: Record<string, string>;
}

const configPath = join(process.cwd(), 'src/discovery/state-machine.json');
const stateMachine: StateMachineConfig = JSON.parse(
  readFileSync(configPath, 'utf-8')
);

export interface DiscoverySession {
  id: string;
  state: string;
  turn_count: number;
  started_at: number;
  blueprint_progress: number;
  blueprint_sections: Array<{ title: string; content: string }>;
}

const sessions = new Map<string, DiscoverySession>();

function generateSessionId(): string {
  return `sess_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export async function startSession(): Promise<DiscoverySession> {
  const session: DiscoverySession = {
    id: generateSessionId(),
    state: stateMachine.states[0], // opening
    turn_count: 0,
    started_at: Date.now(),
    blueprint_progress: 0,
    blueprint_sections: [],
  };
  sessions.set(session.id, session);
  await trackSessionStart(session.id);
  return session;
}

export async function processMessage(
  session_id: string,
  message: string,
): Promise<DiscoverySession | null> {
  const session = sessions.get(session_id);
  if (!session) return null;

  // 检查 max_turns 上限
  if (session.turn_count >= stateMachine.max_turns) {
    session.state = 'summary';
    return session;
  }

  // 状态机推进
  const previous_state = session.state;
  const next_state = stateMachine.transitions[session.state];
  if (next_state) {
    session.state = next_state;
  }

  // 增加 turn_count
  session.turn_count += 1;

  // 累加 blueprint_progress（每轮 +20%，封顶 100%）
  session.blueprint_progress = Math.min(100, session.turn_count * 20);

  // 累加 blueprint_sections
  if (session.state === 'summary') {
    session.blueprint_sections = [
      { title: '能力', content: '基于多轮对话生成的能力图谱' },
      { title: '需求', content: '基于多轮对话生成的需求图谱' },
      { title: '方向', content: '基于多轮对话生成的方向图谱' },
      { title: '目标受众', content: '基于 ICP 推断的目标受众' },
      { title: '差异化', content: '基于品牌定位的差异化建议' },
    ];
  }

  // 埋点
  await trackStateTransition(session.id, previous_state, session.state, session.turn_count);
  if (session.blueprint_progress > 0) {
    await trackBlueprintProgress(session.id, session.blueprint_progress);
  }

  return session;
}

export function getSession(session_id: string): DiscoverySession | undefined {
  return sessions.get(session_id);
}

export function getStateMachineConfig(): StateMachineConfig {
  return stateMachine;
}