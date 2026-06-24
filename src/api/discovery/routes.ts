/**
 * ONE-MCN Discovery API 路由
 * v5.3.1 — Task #8 修复 L-DISC-01 V4 FAIL
 * 验证：curl -X POST localhost:3000/api/discovery/start | jq .session_id
 */
import { Router, Request, Response } from 'express';
import {
  startSession,
  processMessage,
  getSession,
  getStateMachineConfig,
} from './engine';

export const discoveryRouter = Router();

// POST /api/discovery/start — 启动一个 discovery 会话
discoveryRouter.post('/start', async (_req: Request, res: Response) => {
  try {
    const session = await startSession();
    res.json({
      session_id: session.id,
      state: session.state,
      max_turns: getStateMachineConfig().max_turns,
      states: getStateMachineConfig().states,
      started_at: session.started_at,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/discovery/message — 发送消息推进状态机
discoveryRouter.post('/message', async (req: Request, res: Response) => {
  try {
    const { session_id, message } = req.body;
    if (!session_id || !message) {
      return res.status(400).json({ error: 'session_id and message required' });
    }
    const session = await processMessage(session_id, message);
    if (!session) {
      return res.status(404).json({ error: 'session not found' });
    }
    res.json({
      session_id: session.id,
      state: session.state,
      turn_count: session.turn_count,
      blueprint_progress: session.blueprint_progress,
      completed: session.completed,
      info_sufficiency: session.info_sufficiency,
      known_unknowns: session.known_unknowns,
      next_question: session.next_question,
      probes: session.probes,
      blueprint_sections: session.blueprint_sections,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/discovery/session/:id — 查询会话状态
discoveryRouter.get('/session/:id', (req: Request, res: Response) => {
  const session = getSession(req.params.id);
  if (!session) {
    return res.status(404).json({ error: 'session not found' });
  }
  res.json({
    session_id: session.id,
    state: session.state,
    turn_count: session.turn_count,
    blueprint_progress: session.blueprint_progress,
    completed: session.completed,
    info_sufficiency: session.info_sufficiency,
    known_unknowns: session.known_unknowns,
    next_question: session.next_question,
    probes: session.probes,
    answers: session.answers,
    blueprint_sections: session.blueprint_sections,
  });
});

// GET /api/discovery/state-machine — 查询状态机配置
discoveryRouter.get('/state-machine', (_req: Request, res: Response) => {
  res.json(getStateMachineConfig());
});