/**
 * ONE-MCN API 速率限制（100 req/min per IP）
 * v5.1.4 D0-22 验证：101 次连续请求后第 101 次返回 429
 */
import rateLimit from 'express-rate-limit';

export const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 分钟
  max: 100, // 100 req/min/IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});
