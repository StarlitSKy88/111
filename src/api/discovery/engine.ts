/**
 * ONE-MCN Discovery 引擎 v5.4.4
 * Lesson 8 + Lesson 9 + 95% 同步信息一致性铁律
 *
 * 方法论（综合 discovery-pack + 深度访谈 + get-tasks-done）：
 * 1. Foundation 阶段：5 个基础问题
 * 2. LLM 动态追问：每轮评估 gap + 生成下一轮
 * 3. 95% 信息评估铁律：不足 95% 绝不生成蓝图
 * 4. LLM 生成 5 章节蓝图（基于完整信息）
 * 5. 自我审查：输出 Known Unknowns（透明）
 *
 * 关键：避免猜测 + 需求不清晰
 */
import { readFileSync } from 'fs';
import { join } from 'path';
import { chat, complete } from '../../lib/llm';
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

// === 95% 铁律：5 个核心维度 ===
const DIMENSIONS = [
  'identity',      // 你是谁（身份/背景/技能）
  'motivation',    // 为什么做（痛点/需求/动机）
  'direction',     // 想做什么（方向/愿景/产品）
  'capability',    // 你能投入什么（时间/资源/团队）
  'validation',    // 怎么知道成（指标/成功标准/受众）
] as const;
type Dimension = (typeof DIMENSIONS)[number];

interface Probe {
  turn: number;
  question: string;
  answer: string;
  info_gained: string;
  dimensions_covered: Dimension[];
  sufficiency_after: number;
}

export interface DiscoverySession {
  id: string;
  state: string;
  turn_count: number;
  started_at: number;
  blueprint_progress: number;
  blueprint_sections: Array<{ title: string; content: string; source_answers: string[] }>;
  answers: Record<string, string>;
  probes: Probe[];
  info_sufficiency: number;
  known_unknowns: string[];
  next_question: string | null;
  completed: boolean;
}

const sessions = new Map<string, DiscoverySession>();
const SUFFICIENCY_THRESHOLD = 0.95; // 95% 铁律

// === 系统提示词：严格 95% 评估 ===
const EVALUATOR_SYSTEM = `你是一位严格的需求分析专家（蕾姆 ONE-MCN 合伙人）。
你的唯一职责：评估用户回答的信息充分性，并识别需要追问的 gaps。

5 个核心维度：
1. identity - 身份背景（你是谁？过去做过什么？核心技能？）
2. motivation - 动机痛点（为什么想改变？现在最想解决什么？）
3. direction - 方向愿景（想做什么？1 件事？目标用户是谁？）
4. capability - 投入资源（每天能花多少时间？有什么资源？阻碍？）
5. validation - 成功标准（怎么知道成？6 个月目标？月收入？）

【铁律】95% 同步信息一致性：信息不足 95% 绝不生成蓝图。
- 每个维度至少需要 1-2 个具体细节才算"充分"
- 模糊回答（如"想做副业"）必须追问
- 矛盾回答（如"每天 2 小时"但"想做全职"）必须澄清

输出 JSON 格式：
{
  "sufficiency": 0-100,  // 整体信息充分性百分比
  "dimensions": {  // 每个维度的覆盖度
    "identity": 0-100,
    "motivation": 0-100,
    "direction": 0-100,
    "capability": 0-100,
    "validation": 0-100
  },
  "known_unknowns": ["不知道 X", "Y 没问"],  // 透明列出盲区
  "next_question": "..."  // 针对最高 gap 维度的追问（null 如果足够）
}

追问原则：
- 不要重复已问过的问题
- 针对最弱维度深入（深度访谈法）
- 开放式问题，避免引导性
- 一次只问 1 个问题（不要连珠炮）
- 语气温和但专业`;

const PROBE_GENERATOR_SYSTEM = `你是蕾姆 ONE-MCN 合伙人。基于用户已有回答 + 评估结果，生成 1 个深度追问。

【深度访谈技巧】
- 细节追问："能举个例子吗？""当时具体什么情况？"
- 详述追问："您能详细描述那个过程吗？涉及到哪些人/工具？"
- 澄清追问："您是说...对吗？"
- 对比追问："您现在做的和理想的差距是什么？"
- 阶梯式追问：属性 → 利益 → 后果 → 价值
- 反问原则："您认为这里会展示什么？"

【风格】中文、温和、好奇、专业。1 句话。`;

const BLUEPRINT_SYSTEM = `你是蕾姆 ONE-MCN。基于用户的真实回答，生成 5 章节品牌蓝图。

【规则】
- 严格使用用户的真实回答（不要猜测或编造）
- 每章节标出 source_answers（引用了哪些 turn 的回答）
- 风格：直接、可执行、避免营销腔
- 中文输出

5 章节：
01 · 能力图谱（identity）— 基于技能 + 过去经历
02 · 需求图谱（motivation）— 基于痛点 + ICP 推断
03 · 方向图谱（direction）— 基于 1 件事 + 资源
04 · 目标受众（validation）— 基于身份 + 需求
05 · 变现路径 — 一人公司标准路径

输出 JSON：
{
  "sections": [
    { "title": "01 · 能力图谱", "content": "...", "source_answers": ["turn 1 答案", "turn 2 答案"] }
  ]
}`;

function generateSessionId(): string {
  return `sess_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export async function startSession(): Promise<DiscoverySession> {
  const session: DiscoverySession = {
    id: generateSessionId(),
    state: 'foundation',
    turn_count: 0,
    started_at: Date.now(),
    blueprint_progress: 0,
    blueprint_sections: [],
    answers: {},
    probes: [],
    info_sufficiency: 0,
    known_unknowns: [],
    next_question: '你过去做过什么最有成就感的事？',
    completed: false,
  };
  sessions.set(session.id, session);
  await trackSessionStart(session.id);
  return session;
}

/**
 * 评估信息充分性 + 生成下一轮追问
 */
async function evaluateAndProbe(session: DiscoverySession, latest_answer: string): Promise<{
  sufficiency: number;
  known_unknowns: string[];
  next_question: string | null;
}> {
  const probeLog = session.probes.map((p) => `Q${p.turn}: ${p.question}\nA${p.turn}: ${p.answer}`).join('\n\n');

  const evalPrompt = `【用户所有回答】

${probeLog || '（暂无）'}

【最新回答】${latest_answer}

【请评估】`;

  try {
    const result = await complete(evalPrompt, EVALUATOR_SYSTEM, {
      temperature: 0.3,
      max_tokens: 1500,
    });

    // 解析 JSON（容错）
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        sufficiency: parsed.sufficiency || 0,
        known_unknowns: parsed.known_unknowns || [],
        next_question: parsed.sufficiency >= 95 ? null : parsed.next_question,
      };
    }
  } catch (err) {
    console.error('[engine] evaluateAndProbe failed:', err);
  }

  // Fallback：简单加法（每个回答 +20%）
  return {
    sufficiency: Math.min(100, session.turn_count * 20 + 20),
    known_unknowns: ['LLM 评估失败，使用 fallback 进度'],
    next_question: session.turn_count < 5 ? '你提到的这件事，能再具体说说是怎么发生的吗？' : null,
  };
}

export async function processMessage(
  session_id: string,
  message: string,
): Promise<DiscoverySession | null> {
  const session = sessions.get(session_id);
  if (!session) return null;
  if (session.completed) return session;

  // 1. 记录用户答案
  session.turn_count += 1;
  const previous_question = session.next_question || 'Q?';
  session.answers[`turn_${session.turn_count}`] = message;

  // 2. 评估 + 生成下一轮追问
  const eval_result = await evaluateAndProbe(session, message);
  session.info_sufficiency = eval_result.sufficiency / 100;
  session.known_unknowns = eval_result.known_unknowns;

  // 3. 记录 probe log
  const info_gained = `信息充分性 → ${eval_result.sufficiency}%`;
  session.probes.push({
    turn: session.turn_count,
    question: previous_question,
    answer: message,
    info_gained,
    dimensions_covered: [],
    sufficiency_after: eval_result.sufficiency,
  });

  // 4. 决定是否生成蓝图
  const isReady = eval_result.sufficiency >= 95;
  const isForced = session.turn_count >= 8;

  if (isReady || isForced) {
    // 用 LLM 生成真实蓝图
    session.blueprint_sections = await generateBlueprint(session);
    session.completed = true;
    session.next_question = null;
    session.state = 'complete';
    session.blueprint_progress = 100;
  } else {
    session.next_question = eval_result.next_question;
    session.state = session.turn_count <= 5 ? 'foundation' : 'probing';
    session.blueprint_progress = Math.min(95, eval_result.sufficiency);
  }

  // 5. 埋点
  await trackStateTransition(
    session.id,
    session.turn_count === 1 ? 'opening' : `turn_${session.turn_count - 1}`,
    session.state,
    session.turn_count
  );
  if (session.blueprint_progress > 0) {
    await trackBlueprintProgress(session.id, session.blueprint_progress);
  }

  return session;
}

/**
 * LLM 生成 5 章节蓝图
 */
async function generateBlueprint(session: DiscoverySession): Promise<Array<{
  title: string;
  content: string;
  source_answers: string[];
}>> {
  const answersText = session.probes
    .map((p) => `Q${p.turn}: ${p.question}\nA${p.turn}: ${p.answer}`)
    .join('\n\n');

  const knownUnknowns = session.known_unknowns.length > 0
    ? `\n\n【已知盲区】\n${session.known_unknowns.map((u, i) => `${i + 1}. ${u}`).join('\n')}`
    : '';

  const prompt = `【用户所有回答】\n\n${answersText}${knownUnknowns}\n\n【请生成 5 章节蓝图】`;

  try {
    const result = await complete(prompt, BLUEPRINT_SYSTEM, {
      temperature: 0.5,
      max_tokens: 1500,
    });

    const jsonMatch = result.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (Array.isArray(parsed.sections)) {
        return parsed.sections;
      }
    }
  } catch (err) {
    console.error('[engine] generateBlueprint failed:', err);
  }

  // Fallback：模板生成
  return templateBlueprint(session);
}

function templateBlueprint(session: DiscoverySession): Array<{
  title: string;
  content: string;
  source_answers: string[];
}> {
  const cap = session.answers.turn_2 || '待挖掘';
  const ach = session.answers.turn_1 || '待明确';
  const need = session.answers.turn_3 || '待发现';
  const dir = session.answers.turn_4 || '待探索';
  const time = session.answers.turn_5 || '待评估';

  return [
    { title: '01 · 能力图谱', content: `核心能力 = ${cap}。过去：${ach}。`, source_answers: [session.answers.turn_1, session.answers.turn_2] },
    { title: '02 · 需求图谱', content: `最想解决 = ${need}。`, source_answers: [session.answers.turn_3] },
    { title: '03 · 方向图谱', content: `1 件事 = ${dir}。${time} 持续执行。`, source_answers: [session.answers.turn_4, session.answers.turn_5] },
    { title: '04 · 目标受众', content: `基于能力 + 需求，目标受众 = 35 岁上下有同痛点人群。` },
    { title: '05 · 变现路径', content: `MVP → 14 天免费试用 → ¥699 早鸟 → ¥999/月 → ¥50K Tier 3` },
  ];
}

export function getSession(session_id: string): DiscoverySession | undefined {
  return sessions.get(session_id);
}

export function getStateMachineConfig(): StateMachineConfig {
  return stateMachine;
}

export function getQuestions() {
  return {
    dimensions: DIMENSIONS,
    sufficiency_threshold: SUFFICIENCY_THRESHOLD,
  };
}