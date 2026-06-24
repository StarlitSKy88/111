/**
 * ONE-MCN Discovery 真实对话引擎
 * v5.4.2 — Lesson 8 修复：基于用户真实回答（不再是 mock）
 *
 * 5 状态机 + max_turns=5（不是 10）+ 真实接收用户输入
 * 蓝图基于用户 5 个回答用模板拼接
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

const QUESTIONS: Record<string, { question: string; extract: (answer: string) => string }> = {
  opening: {
    question: '你过去做过什么最有成就感的事？（1-2 句）',
    extract: (a) => a.trim().slice(0, 100),
  },
  capability: {
    question: '你的核心技能可以用 3 个词形容吗？',
    extract: (a) => a.trim().split(/[，,、\s]+/).filter(Boolean).slice(0, 3).join('、'),
  },
  need: {
    question: '现在最想解决什么问题？',
    extract: (a) => a.trim().slice(0, 100),
  },
  direction: {
    question: '如果今天只能做 1 件事，你会做什么？',
    extract: (a) => a.trim().slice(0, 100),
  },
  summary: {
    question: '你愿意为这件事每天花多少时间？',
    extract: (a) => a.trim().slice(0, 50),
  },
};

export interface DiscoverySession {
  id: string;
  state: string;
  turn_count: number;
  started_at: number;
  blueprint_progress: number;
  blueprint_sections: Array<{ title: string; content: string; source_answer?: string }>;
  answers: Record<string, string>;
  completed: boolean;
}

const sessions = new Map<string, DiscoverySession>();

function generateSessionId(): string {
  return `sess_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export function getCurrentQuestion(state: string): string {
  return QUESTIONS[state]?.question || '继续...';
}

export async function startSession(): Promise<DiscoverySession> {
  const session: DiscoverySession = {
    id: generateSessionId(),
    state: stateMachine.states[0],
    turn_count: 0,
    started_at: Date.now(),
    blueprint_progress: 0,
    blueprint_sections: [],
    answers: {},
    completed: false,
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
  if (session.completed) return session;

  // 1. 记录用户答案（即使 state 是 summary 也允许记录第 5 轮）
  const current_state = session.state;
  const extractor = QUESTIONS[current_state];
  if (extractor) {
    const extracted = extractor.extract(message);
    session.answers[current_state] = extracted;
  }

  // 2. 推进 state machine
  if (session.turn_count >= stateMachine.max_turns) {
    session.state = 'complete';
    session.completed = true;
  } else {
    const next_state = stateMachine.transitions[current_state];
    if (next_state) {
      session.state = next_state;
    }
  }

  session.turn_count += 1;
  session.blueprint_progress = Math.min(100, session.turn_count * 20);

  // 3. 严格 5 轮后才生成蓝图（确保所有答案都收集到）
  if (session.turn_count >= 5) {
    session.blueprint_sections = generateBlueprint(session.answers);
    session.completed = true;
  }

  // 4. 埋点
  await trackStateTransition(session.id, current_state, session.state, session.turn_count);
  if (session.blueprint_progress > 0) {
    await trackBlueprintProgress(session.id, session.blueprint_progress);
  }

  return session;
}

/**
 * 蓝图生成器：基于用户 5 个真实回答，用模板拼接
 * 不依赖 LLM，但内容个性化
 */
function generateBlueprint(answers: Record<string, string>): Array<{
  title: string;
  content: string;
  source_answer?: string;
}> {
  const capability = answers.capability || '待挖掘';
  const achievement = answers.opening || '待明确';
  const need = answers.need || '待发现';
  const direction = answers.direction || '待探索';
  const time = answers.summary || '待评估';

  return [
    {
      title: '01 · 能力图谱',
      content: `你的核心能力 = ${capability}。过去最有成就感的事：${achievement}。这是你建立个人品牌的起点。`,
      source_answer: achievement,
    },
    {
      title: '02 · 需求图谱',
      content: `你当前最需要解决 = ${need}。这是 ICP（理想客户画像）的核心痛点，围绕它设计内容。`,
      source_answer: need,
    },
    {
      title: '03 · 方向图谱',
      content: `如果你今天只能做 1 件事 = ${direction}。从这一件事开始 14 天试点，${time} 持续执行。`,
      source_answer: direction,
    },
    {
      title: '04 · 目标受众',
      content: `基于你的能力「${capability}」和需求「${need}」，目标受众 = 同样有此痛点的 35 岁上下人群。`,
    },
    {
      title: '05 · 变现路径',
      content: `MVP → 14 天免费试用 → ¥699 早鸟（首 100 用户）→ ¥999/月 Tier 2（4 Agent 自动化）→ ¥50K Tier 3（1v1 陪跑）。`,
    },
  ];
}

export function getSession(session_id: string): DiscoverySession | undefined {
  return sessions.get(session_id);
}

export function getStateMachineConfig(): StateMachineConfig {
  return stateMachine;
}

export function getQuestions() {
  return QUESTIONS;
}