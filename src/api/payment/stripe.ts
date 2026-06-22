/**
 * ONE-MCN Stripe 集成（占位 — 测试 key 在 .env）
 * v5.1.4 D2 全部 22 任务占位（真实 Stripe API 需要测试 key 才能跑）
 */
export const STRIPE_CONFIG = {
  products: {
    tier1: process.env.STRIPE_PRICE_TIER1 || 'price_tier1_placeholder',
    tier2: process.env.STRIPE_PRICE_TIER2 || 'price_tier2_placeholder',
    tier3: process.env.STRIPE_PRICE_TIER3 || 'price_tier3_placeholder',
  },
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || 'whsec_placeholder',
  apiVersion: '2025-01-27',
};

// D2-5 ~ D2-12: Webhook 处理（占位）
// D2-13 ~ D2-17: 事件处理（占位）
// D2-18 ~ D2-20: 数据库状态对账（占位）
// D2-21 ~ D2-22: 失败支付 + 退款（占位）
// 真实集成需要从 .env 读取 stripe 的测试 key（待 v5.4 接入）

export const stripeWebhookRoutes = [
  'POST /api/webhooks/stripe',
  'POST /api/webhooks/stripe/test',
];
