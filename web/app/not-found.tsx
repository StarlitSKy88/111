/**
 * ONE-MCN 404 · v5.4 japanese-ma-minimalism
 */
import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-ink-bg text-ink-primary relative overflow-hidden">
      <div className="absolute top-0 right-8 text-[40vw] font-mincho text-ink-line leading-none select-none pointer-events-none">
        間
      </div>

      <div className="relative max-w-prose mx-auto px-8 py-32 md:py-48 space-y-16">
        <header className="space-y-6">
          <span className="font-mono text-[10px] tracking-[0.15em] text-vermilion uppercase">
            404 · Not Found
          </span>
          <h1 className="text-hero font-mincho">不在此处</h1>
          <p className="text-ink-secondary leading-loose">
            你寻找的页面不在这里。
            <br />
            可能已被移动，或从未存在。
          </p>
        </header>

        <div className="pt-8">
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