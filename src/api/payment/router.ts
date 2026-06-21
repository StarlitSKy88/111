/**
 * ONE-MCN 多支付路由（按用户 IP/语言）
 * v5.1.4 D3-11 验证：curl -H 'Accept-Language: zh-CN' 时返回 wechat
 */
import { Request, Response } from 'express';

export function selectPaymentProvider(req: Request): 'stripe' | 'wechat' | 'alipay' {
  const lang = req.headers['accept-language'] || '';
  if (lang.includes('zh')) return 'wechat';
  if (req.ip?.startsWith('127.')) return 'alipay'; // 国内测试
  return 'stripe';
}

export const paymentRouter = {
  selectProvider: selectPaymentProvider,
};
