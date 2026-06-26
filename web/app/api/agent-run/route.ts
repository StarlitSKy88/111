import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { complete } from '@/lib/llm';
import { pool } from '@/lib/db';

export const runtime = 'nodejs';

const schema = z.object({
  agent_id: z.enum(['content', 'acquisition', 'delivery', 'support']),
  user_id: z.string().uuid(),
  prompt: z.string().optional(),
  context: z.record(z.any()).optional(),
});

const AGENT_SYSTEMS: Record<string, string> = {
  content: '你是 ONE-MCN Content Agent，专精一人品牌内容创作（文章/视频/帖子）。风格直接、有故事感。中文。',
  acquisition: '你是 ONE-MCN Acquisition Agent，专精多渠道获客。生成 ROI 导向的触达方案。中文。',
  delivery: '你是 ONE-MCN Delivery Agent，专精产品交付和客服。生成交付方案 + FAQ。中文。',
  support: '你是 ONE-MCN Support Agent，专精复购触发和跟进。中文。',
};

const DEFAULT_PROMPTS: Record<string, string> = {
  content: '为我的用户生成今天的 1 条朋友圈短文 + 3 条小红书笔记',
  acquisition: '基于我最近发布的内容，生成今天 5 条个性化朋友圈触达',
  delivery: '为本周新订单生成交付消息 + 跟进话术',
  support: '基于过去 30 天用户行为，生成 3 条复购触发消息',
};

export async function POST(req: NextRequest) {
  try {
    const { agent_id, user_id, prompt, context } = schema.parse(await req.json());
    const u = await pool.query('SELECT tenant_id FROM users WHERE id = $1', [user_id]);
    if (u.rowCount === 0) {
      return NextResponse.json({ error: 'user not found' }, { status: 404 });
    }
    const tenant_id = u.rows[0].tenant_id;
    const task_id = `task_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const start = Date.now();
    const userPrompt = prompt || DEFAULT_PROMPTS[agent_id];
    const finalPrompt = context ? `${userPrompt}\n\n上下文：${JSON.stringify(context)}` : userPrompt;

    const output = await complete(finalPrompt, AGENT_SYSTEMS[agent_id], { temperature: 0.8, max_tokens: 800 });
    const duration_ms = Date.now() - start;

    await pool.query(
      `INSERT INTO tier2_executions (user_id, tenant_id, agent_type, agent_action, status, auto_decided, created_at)
       VALUES ($1, $2, $3, $4, 'completed', TRUE, NOW())`,
      [user_id, tenant_id, agent_id, task_id]
    );
    await pool.query(
      `INSERT INTO monitor_metrics (user_id, tenant_id, metric_type, value, metadata, collected_at)
       VALUES ($1, $2, 'agent_execution', $3, $4, NOW())`,
      [user_id, tenant_id, duration_ms, JSON.stringify({ agent_id, task_id, output_length: output.length })]
    );

    return NextResponse.json({
      agent_type: agent_id,
      task_id,
      status: 'completed',
      output,
      duration_ms,
      created_at: new Date().toISOString(),
    });
  } catch (err: any) {
    if (err.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid request', details: err.flatten() }, { status: 400 });
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
