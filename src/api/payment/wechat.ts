/**
 * ONE-MCN 微信支付 v3（占位 — 需要 WECHAT_PAY_MCH_ID 测试）
 * v5.1.4 D3 全部 14 任务占位
 */
export const WECHAT_CONFIG = {
  mchId: process.env.WECHAT_PAY_MCH_ID || 'placeholder',
  apiKey: process.env.WECHAT_PAY_API_KEY || 'placeholder',
  apiVersion: 'v3',
  callbackUrl: '/api/webhooks/wechat',
};

// D3-5: 仅支持年度方案（微信无原生 recurring）
export const WECHAT_PRODUCT_TYPE = 'yearly';

// D3-3: 回调验证（时间戳 ±5min）
export function verifyWechatTimestamp(timestamp: number): boolean {
  const now = Math.floor(Date.now() / 1000);
  return Math.abs(now - timestamp) <= 300; // 5 分钟
}
