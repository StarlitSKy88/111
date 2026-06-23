/**
 * ONE-MCN /api/agent-run 端点
 * v5.4 — dashboard 调用此端点触发 4 Agent
 *
 * POST /api/agent-run
 * body: { agent_id: 'content' | 'acquisition' | 'delivery' | 'support', user_id: uuid }
 * returns: AgentResult
 */
import { Router, Request, Response } from 'express';
import { runAgent, AgentType } from '../agents/orchestrator';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const agentRunRouter = Router();

const VALID_AGENTS: AgentType[] = ['content', 'acquisition', 'delivery', 'support'];

agentRunRouter.post('/', async (req: Request, res: Response) => {
  const { agent_id, user_id, prompt, context } = req.body;

  if (!VALID_AGENTS.includes(agent_id)) {
    return res.status(400).json({
      error: `Invalid agent_id. Must be one of: ${VALID_AGENTS.join(', ')}`,
    });
  }

  if (!user_id) {
    return res.status(400).json({ error: 'user_id required' });
  }

  try {
    // 取 user 的 tenant_id
    const u = await pool.query('SELECT tenant_id FROM users WHERE id = $1', [user_id]);
    if (u.rowCount === 0) {
      return res.status(404).json({ error: 'user not found' });
    }
    const tenant_id = u.rows[0].tenant_id;

    // 默认 prompt 基于 agent 类型生成
    const defaultPrompts: Record<AgentType, string> = {
      content: '为我的一人公司生成今天的 1 篇朋友圈短文 + 3 条小红书笔记',
      acquisition: '基于我最近发布的内容，生成今天 5 条个性化朋友圈触达',
      delivery: '为本周新订单生成交付消息 + 跟进话术',
      support: '基于过去 30 天用户行为，生成 3 条复购触发消息',
    };

    const result = await runAgent({
      agent_type: agent_id,
      user_id,
      tenant_id,
      prompt: prompt || defaultPrompts[agent_id],
      context,
    });

    res.json(result);
  } catch (err: any) {
    console.error('[agent-run] error:', err);
    res.status(500).json({ error: err.message });
  }
});