/**
 * ONE-MCN CORS 白名单（只允许 onemcn.com 域名）
 * v5.1.4 D0-24 验证：curl -H "Origin: https://evil.com" 返回的 Access-Control-Allow-Origin 应为空
 */
import cors from 'cors';

const ALLOWED_ORIGINS = [
  'https://onemcn.com',
  'https://www.onemcn.com',
  'https://app.onemcn.com',
  // dev 模式允许所有 localhost 端口
  process.env.NODE_ENV === 'development' ? /^http:\/\/localhost:\d+$/ : null,
  // dev 模式允许局域网 IP
  process.env.NODE_ENV === 'development' ? /^http:\/\/127\.0\.0\.1:\d+$/ : null,
].filter(Boolean) as (string | RegExp)[];

function isAllowed(origin: string): boolean {
  if (!origin) return true; // 同源/无 origin 允许
  return ALLOWED_ORIGINS.some((rule) => {
    if (typeof rule === 'string') return rule === origin;
    if (rule instanceof RegExp) return rule.test(origin);
    return false;
  });
}

export const corsMiddleware = cors({
  origin: (origin, callback) => {
    if (isAllowed(origin || '')) {
      callback(null, true);
    } else {
      console.warn(`[CORS] Rejected origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
});
