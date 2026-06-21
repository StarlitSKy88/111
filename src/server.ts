/**
 * ONE-MCN Server · Entry Point
 * v5.1.1 · L-W-INFRA-01 Day 0 启动
 *
 * 监听端口 3000
 * 提供 /api/health 端点（最小可跑通单元）
 */

import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import { Pool } from 'pg';

const PORT = parseInt(process.env.PORT || '3000', 10);
const NODE_ENV = process.env.NODE_ENV || 'development';

// L0: 数据库连接池（带 tenant_id session var）
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // RLS 强制 tenant_id 隔离
  application_name: 'one-mcn-server',
});

const app = express();

// 关键：Stripe webhook 必须用 raw body，不能用 express.json
app.use((req: Request, res: Response, next: NextFunction) => {
  if (req.path === '/api/webhooks/stripe') {
    express.raw({ type: 'application/json' })(req, res, next);
  } else {
    express.json()(req, res, next);
  }
});

// 速率限制（M1 D0-22 启用）
// app.use(rateLimitMiddleware);

// CORS 白名单（M1 D0-24 启用）
// app.use(corsMiddleware);

// 全局错误处理（M1 D1-3 启用）
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('[ERROR]', err);
  if (NODE_ENV === 'production') {
    res.status(500).json({ error: 'Internal Server Error' });
  } else {
    res.status(500).json({ error: err.message, stack: err.stack });
  }
});

// L0 · /api/health 端点
app.get('/api/health', async (req: Request, res: Response) => {
  try {
    // 验证数据库连接（A8 RLS 多租户假设验证前置）
    const result = await pool.query('SELECT NOW() as now, version() as pg_version');
    res.json({
      status: 'ok',
      service: 'one-mcn-server',
      version: '0.1.0',
      stage: 'M1 Day 0',
      database: {
        connected: true,
        now: result.rows[0].now,
        pg_version: result.rows[0].pg_version.split(' ')[1],
      },
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(503).json({
      status: 'degraded',
      service: 'one-mcn-server',
      database: { connected: false, error: (err as Error).message },
      timestamp: new Date().toISOString(),
    });
  }
});

// L1 · Discovery 端点（M1 Day 4 轨道 B 启动）
app.post('/api/discovery/start', async (req: Request, res: Response) => {
  // TODO: L-W-DISC-01 实现多轮对话状态机
  res.status(501).json({ error: 'Not implemented yet', task: 'L-W-DISC-01' });
});

app.listen(PORT, () => {
  console.log(`[ONE-MCN] Server running on port ${PORT} (${NODE_ENV})`);
  console.log(`[ONE-MCN] Health check: http://localhost:${PORT}/api/health`);
});