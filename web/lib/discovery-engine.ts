/**
 * ONE-MCN Discovery Engine (Next.js + DB)
 * v5.6 — sessions 存 DB（in-memory 不能跨 Edge Function 共享）
 */
import * as crypto from 'crypto';
import { pool } from './db';
import { complete } from './llm';

const SUFFICIENCY_THRESHOLD = 0.95;
const MAX_TURNS = 8;

const EVALUATOR_SYSTEM = `你是一位严格的需求分析专家。基于用户所有回答，评估信息充分性。
5 维度：identity(身份)/motivation(动机)/direction(方向)/capability(投入)/validation(成功标准)

【铁律】95% 同步信息一致性：< 95% 绝不生成蓝图。
- 每个维度需 1-2 个具体细节才算充分
- 模糊回答必须追问
- 矛盾必须澄清

输出 JSON：{"sufficiency": 0-100, "dimensions": {...}, "known_unknowns": [...], "next_question": "..."}
追问原则：开放式、一次 1 个、避免引导性、细节追问。`;

const BLUEPRINT_SYSTEM = `基于用户所有真实回答生成 5 章节品牌蓝图。
严格使用真实回答（不猜测）。中文。5 章节：能力/需求/方向/目标受众/变现。
输出 JSON：{"sections": [{"title", "content", "source_answers"}]}`;

export interface DiscoverySession {
  id: string;
  state: string;
  turn_count: number;
  blueprint_progress: number;
  blueprint_sections: Array<{ title: string; content: string }>;
  answers: Record<string, string>;
  probes: any[];
  info_sufficiency: number;
  known_unknowns: string[];
  next_question: string | null;
  completed: boolean;
}

// 固定的 system user UUID（用于 discovery_sessions 等无 user 上下文的场景）
// monitor_metrics.user_id REFERENCES users(id) FK，所以 sessions 必须有有效 user_id
// 这是 schema 的简化（用 system user 占位）。生产环境应该用 user_id 真正传入。
const SYSTEM_USER_ID = '00000000-0000-0000-0000-000000000001';

function generateId(): string {
  return crypto.randomUUID();
}

async function ensureSystemUser(): Promise<void> {
  // 确保 system user 存在（首次跑 startSession 时）
  await pool.query(
    `INSERT INTO users (id, email, password_hash, tenant_id)
     VALUES ($1, 'system@one-mcn.local', 'noop', $1)
     ON CONFLICT (id) DO NOTHING`,
    [SYSTEM_USER_ID]
  );
}

export async function startSession(): Promise<DiscoverySession> {
  await ensureSystemUser();
  const id = generateId();
  const initial = {
    id,
    state: 'foundation',
    turn_count: 0,
    blueprint_progress: 0,
    blueprint_sections: [],
    answers: {},
    probes: [],
    info_sufficiency: 0,
    known_unknowns: [],
    next_question: '你过去做过什么最有成就感的事？（1-2 句）',
    completed: false,
  };
  // user_id = SYSTEM_USER_ID（FK 满足），id 存在 metadata JSONB 里
  await pool.query(
    `INSERT INTO monitor_metrics (user_id, tenant_id, metric_type, value, metadata, collected_at)
     VALUES ($1, $1, 'discovery_session', 0, $2, NOW())`,
    [SYSTEM_USER_ID, JSON.stringify(initial)]
  );
  return initial;
}

async function loadSession(id: string): Promise<DiscoverySession | null> {
  // 用 metadata->>'id' 查（而不是 user_id，因为所有 session 共用 system user）
  const r = await pool.query(
    `SELECT metadata FROM monitor_metrics
     WHERE metric_type = 'discovery_session'
       AND user_id = $1::uuid
       AND metadata->>'id' = $2
     ORDER BY collected_at DESC LIMIT 1`,
    [SYSTEM_USER_ID, id]
  );
  return r.rowCount ? r.rows[0].metadata : null;
}

async function saveSession(s: DiscoverySession) {
  await pool.query(
    `INSERT INTO monitor_metrics (user_id, tenant_id, metric_type, value, metadata, collected_at)
     VALUES ($1, $1, 'discovery_session', $2, $3, NOW())`,
    [SYSTEM_USER_ID, s.turn_count, JSON.stringify(s)]
  );
}

async function evaluate(session: DiscoverySession, latest: string) {
  const log = session.probes
    .map((p: any) => `Q${p.turn}: ${p.question}\nA${p.turn}: ${p.answer}`)
    .join('\n\n');
  const prompt = `【用户所有回答】\n\n${log}\n\n【最新回答】${latest}\n\n【请评估】`;
  try {
    const result = await complete(prompt, EVALUATOR_SYSTEM, { temperature: 0.3, max_tokens: 1500 });
    const m = result.match(/\{[\s\S]*\}/);
    if (m) {
      const p = JSON.parse(m[0]);
      return {
        sufficiency: p.sufficiency || 0,
        known_unknowns: p.known_unknowns || [],
        next_question: p.sufficiency >= 95 ? null : p.next_question,
      };
    }
  } catch (err) {
    console.error('[engine] evaluate failed:', err);
  }
  return {
    sufficiency: Math.min(100, session.turn_count * 20 + 20),
    known_unknowns: ['LLM 评估失败'],
    next_question: session.turn_count < 5 ? '能再具体说说是怎么发生的吗？' : null,
  };
}

export async function processMessage(id: string, message: string) {
  const session = await loadSession(id);
  if (!session || session.completed) return session;
  session.turn_count += 1;
  const previous_question = session.next_question || 'Q?';
  session.answers[`turn_${session.turn_count}`] = message;

  const ev = await evaluate(session, message);
  session.info_sufficiency = ev.sufficiency / 100;
  session.known_unknowns = ev.known_unknowns;
  session.probes.push({
    turn: session.turn_count,
    question: previous_question,
    answer: message,
    info_gained: `信息充分性 → ${ev.sufficiency}%`,
    sufficiency_after: ev.sufficiency,
  });

  if (ev.sufficiency >= 95 || session.turn_count >= MAX_TURNS) {
    try {
      const log = session.probes.map((p: any) => `Q${p.turn}: ${p.question}\nA${p.turn}: ${p.answer}`).join('\n\n');
      const result = await complete(log, BLUEPRINT_SYSTEM, { temperature: 0.5, max_tokens: 1500 });
      const m = result.match(/\{[\s\S]*\}/);
      if (m) {
        const p = JSON.parse(m[0]);
        if (Array.isArray(p.sections)) session.blueprint_sections = p.sections;
      }
    } catch (err) {
      console.error('[engine] blueprint failed:', err);
      session.blueprint_sections = templateBlueprint(session.answers);
    }
    session.completed = true;
    session.state = 'complete';
    session.next_question = null;
    session.blueprint_progress = 100;
  } else {
    session.next_question = ev.next_question;
    session.state = session.turn_count <= 5 ? 'foundation' : 'probing';
    session.blueprint_progress = Math.min(95, ev.sufficiency);
  }

  await saveSession(session);
  return session;
}

function templateBlueprint(answers: Record<string, string>) {
  return [
    { title: '01 · 能力图谱', content: `核心能力 = ${answers.turn_2 || '待挖掘'}。过去：${answers.turn_1 || '待明确'}。` },
    { title: '02 · 需求图谱', content: `最想解决 = ${answers.turn_3 || '待发现'}。` },
    { title: '03 · 方向图谱', content: `1 件事 = ${answers.turn_4 || '待探索'}。${answers.turn_5 || '待评估'} 持续执行。` },
    { title: '04 · 目标受众', content: '基于能力 + 需求，目标受众 = 35 岁上下有同痛点人群。' },
    { title: '05 · 变现路径', content: 'MVP → 14 天免费试用 → ¥699 早鸟 → ¥999/月 → ¥50K Tier 3' },
  ];
}
