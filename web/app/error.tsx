/**
 * ONE-MCN Error Page · v5.4 japanese-ma-minimalism
 */
'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[one-mcn] error boundary:', error);
  }, [error]);

  return (
    <main className="min-h-screen bg-ink-bg text-ink-primary">
      <div className="max-w-prose mx-auto px-8 py-32 md:py-48 space-y-16">
        <header className="space-y-6">
          <span className="font-mono text-[10px] tracking-[0.15em] text-vermilion uppercase">
            ERROR
          </span>
          <h1 className="text-display font-mincho">出错了</h1>
          <p className="text-ink-secondary leading-loose">
            {error.message || '发生了未知错误'}
          </p>
          {error.digest && (
            <p className="font-mono text-xs text-ink-tertiary">
              {error.digest}
            </p>
          )}
        </header>

        <div className="flex gap-8 pt-8">
          <button
            onClick={reset}
            className="inline-flex items-center gap-3 text-sm tracking-[0.08em] uppercase border-b border-current pb-0.5 hover:opacity-60 transition-opacity duration-300"
          >
            重试
            <span className="text-[10px]">↻</span>
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-3 text-sm tracking-[0.08em] uppercase border-b border-current pb-0.5 hover:opacity-60 transition-opacity duration-300"
          >
            返回首页
            <span className="text-[10px]">→</span>
          </Link>
        </div>
      </div>
    </main>
  );
}