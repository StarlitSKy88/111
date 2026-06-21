/**
 * ONE-MCN CORS 白名单（只允许 onemcn.com 域名）
 * v5.1.4 D0-24 验证：curl -H "Origin: https://evil.com" 返回的 Access-Control-Allow-Origin 应为空
 */
import cors from 'cors';

const ALLOWED_ORIGINS = [
  'https://onemcn.com',
  'https://www.onemcn.com',
  'https://app.onemcn.com',
  process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : '',
].filter(Boolean) as string[];

export const corsMiddleware = cors({
  origin: (origin, callback) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
});
