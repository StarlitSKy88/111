/**
 * ONE-MCN 全局错误处理（4xx/5xx 分类）
 * v5.1.4 D1-3 验证：curl localhost:3000/api/nonexistent 返回 4xx
 */
import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string
  ) {
    super(message);
  }
}

export function errorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message,
      code: err.code,
    });
  }
  console.error('[UNCAUGHT]', err);
  res.status(500).json({ error: 'Internal Server Error' });
}
