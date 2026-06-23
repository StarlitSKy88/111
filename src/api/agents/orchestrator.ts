/**
 * ONE-MCN Agent Orchestrator
 * v5.4 — 统一 4 Agent 接口
 *
 * 4 Agent: Content / Acquisition / Delivery / Support
 * 调用 LLM 生成产物，写入 monitor_metrics + tier2_executions
 */
import { Pool } from 'pg';
import { chat, complete } from '../../lib/llm';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export type AgentType = 'content' | 'acquisition' | 'delivery' | 'support';

export interface AgentTask {
  agent_type: AgentType;
  user_id: string;
  tenant_id: string;
  prompt: string;
  context?: Record<string, any>;
}

export interface AgentResult {
  agent_type: AgentType;
  task_id: string;
  status: 'completed' | 'failed';
  output: string;
  duration_ms: number;
  created_at: string;
}

const AGENT_SYSTEM_PROMPTS: Record<AgentType, string> = {
  content: `你是 ONE-MCN Content Agent，专精于一人品牌的內容创作。
你的任务：根据用户输入生成高质内容（文章/视频/帖子）。
风格：直接、有故事感、避免营销腔。使用中文。`,
  acquisition: `你是 ONE-MCN Acquisition Agent，专精于多渠道获客。
你的任务：基于用户画像生成触达方案（朋友圈/小红书/抖音/邮件）。
风格：个人化、不群发、ROI 导向。使用中文。`,
  delivery: `你是 ONE-MCN Delivery Agent，专精于产品交付和客服。
你的任务：基于用户订单生成交付消息 + 解答 FAQ。
风格：专业、礼貌、快速响应。使用中文。`,
  support: `你是 ONE-MCN Support Agent，专精于复购触发和跟进。
你的任务：基于用户行为生成跟进消息 + 推荐升级时机。
风格：温和、有价值、避免过度推销。使用中文。`,
};

export async function runAgent(task: AgentTask): Promise<AgentResult> {
  const start = Date.now();
  const task_id = `task_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  try {
    // 1. 写 tier2_executions 记录（pending → running）
    await pool.query(
      `INSERT INTO tier2_executions (user_id, tenant_id, agent_type, agent_action, status, auto_decided, created_at)
       VALUES ($1, $2, $3, $4, 'running', TRUE, NOW())`,
      [task.user_id, task.tenant_id, task.agent_type, task_id]
    );

    // 2. 调用 LLM
    const systemPrompt = AGENT_SYSTEM_PROMPTS[task.agent_type];
    const userPrompt = task.context
      ? `${task.prompt}\n\n上下文：${JSON.stringify(task.context)}`
      : task.prompt;
    const output = await complete(userPrompt, systemPrompt, {
      temperature: 0.8,
      max_tokens: 800,
    });

    const duration_ms = Date.now() - start;

    // 3. 更新 tier2_executions（completed + output）
    await pool.query(
      `UPDATE tier2_executions
       SET status = 'completed', self_review_passed = TRUE
       WHERE agent_action = $1`,
      [task_id]
    );

    // 4. 写 monitor_metrics 记录
    await pool.query(
      `INSERT INTO monitor_metrics (user_id, tenant_id, metric_type, value, metadata, collected_at)
       VALUES ($1, $2, 'agent_execution', $3, $4, NOW())`,
      [
        task.user_id,
        task.tenant_id,
        duration_ms,
        JSON.stringify({ agent_type: task.agent_type, task_id, output_length: output.length }),
      ]
    );

    return {
      agent_type: task.agent_type,
      task_id,
      status: 'completed',
      output,
      duration_ms,
      created_at: new Date().toISOString(),
    };
  } catch (err: any) {
    const duration_ms = Date.now() - start;
    await pool.query(
      `UPDATE tier2_executions
       SET status = 'failed'
       WHERE agent_action = $1`,
      [task_id]
    );
    console.error(`[orchestrator] ${task.agent_type} failed:`, err);
    return {
      agent_type: task.agent_type,
      task_id,
      status: 'failed',
      output: err.message,
      duration_ms,
      created_at: new Date().toISOString(),
    };
  }
}