import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import { Pool } from 'pg';
import { authRouter } from './api/routes/auth';
import { usersRouter } from './api/routes/users';
import { discoveryRouter } from './api/discovery/routes';
import { dashboardRouter } from './api/dashboard/north-star';
import { onboardingRouter } from './api/onboarding/routes';
import { stripeWebhookRouter } from './api/payment/stripe-webhook';
import { wechatWebhookRouter } from './api/payment/wechat-webhook';
import { alipayWebhookRouter } from './api/payment/alipay-webhook';
import { verifyCodeRouter } from './api/auth/verify-code';
import { referralRouter } from './api/referral/routes';
import { agentRunRouter } from './api/routes/agent-run';
import { errorHandler } from './api/middleware/errorHandler';
import { apiLimiter } from './api/middleware/rateLimit';
import { corsMiddleware } from './api/middleware/cors';

const PORT = parseInt(process.env.PORT || '3000', 10);
const NODE_ENV = process.env.NODE_ENV || 'development';
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const app = express();

// Stripe webhook 必须 raw body
app.use((req, res, next) => {
  if (req.path === '/api/webhooks/stripe') express.raw({ type: 'application/json' })(req, res, next);
  else express.json()(req, res, next);
});

app.use(corsMiddleware);
app.use(apiLimiter);
app.use(express.static('public/legal')); // /privacy /terms

app.get('/api/health', async (req, res) => {
  try {
    const r = await pool.query('SELECT NOW(), version()');
    res.json({ status: 'ok', service: 'one-mcn-server', version: '0.1.0', stage: 'M1 Day 1',
      database: { connected: true, now: r.rows[0].now, pg_version: r.rows[0].version.split(' ')[1] } });
  } catch (err: any) {
    res.status(503).json({ status: 'degraded', error: err.message });
  }
});

app.use('/api/auth', authRouter);
app.use('/api/auth', verifyCodeRouter);
app.use('/api/discovery', discoveryRouter);
app.use('/api/agent-run', agentRunRouter);
app.use('/api/referral', referralRouter);
app.use('/api/users', usersRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/onboarding', onboardingRouter);
app.use('/api/webhooks/stripe', stripeWebhookRouter);
app.use('/api/webhooks/wechat', wechatWebhookRouter);
app.use('/api/webhooks/alipay', alipayWebhookRouter);

app.use(errorHandler);

app.listen(PORT, () => console.log(`[ONE-MCN] v0.1.0 on ${PORT} (${NODE_ENV}) - Day 1`));
