/**
 * ONE-MCN 支付宝（占位）
 */
export const ALIPAY_CONFIG = {
  appId: process.env.ALIPAY_APP_ID || 'placeholder',
  privateKey: process.env.ALIPAY_PRIVATE_KEY || 'placeholder',
  callbackUrl: '/api/webhooks/alipay',
};
