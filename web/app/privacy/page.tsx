/**
 * ONE-MCN Privacy · v5.5 Semi + Ma 哲学
 */
'use client';

import Link from 'next/link';
import { Tag } from '@douyinfe/semi-ui';

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-ink-bg text-ink-primary">
      <article className="max-w-prose mx-auto px-8 py-24 md:py-48 space-y-16">
        <header className="space-y-6">
          <Link
            href="/"
            className="font-mono text-[10px] tracking-[0.15em] text-ink-tertiary uppercase"
            style={{ color: '#3A3835' }}
          >
            ← 返回
          </Link>
          <Tag style={{ color: '#E05A47', borderColor: '#E05A47', background: 'transparent' }}>
            隐私
          </Tag>
          <h1 className="text-display font-mincho">隐私政策</h1>
          <p className="font-mono text-xs text-ink-tertiary">最后更新：2026-06-23</p>
        </header>

        {[
          { title: '1. 数据收集', content: '邮箱 + 密码（bcrypt cost=12 哈希存储）+ Discovery 多轮对话 + 4 Agent 自动化产物' },
          { title: '2. 数据存储', content: 'PostgreSQL 16 + RLS 多租户隔离。每日加密备份（openssl AES-256-CBC），30 天滚动保留' },
          { title: '3. 数据删除', content: '邮件 privacy@one-mcn.local 申请 → 7 天内删除 + 30 天滚动清除' },
          { title: '4. 第三方服务', content: 'Stripe / 微信支付 / 支付宝 / OpenAI / Anthropic / Resend / 腾讯云 SMTP' },
        ].map((s) => (
          <section key={s.title} className="space-y-6">
            <h2 className="text-title font-mincho">{s.title}</h2>
            <p className="text-ink-secondary leading-loose">{s.content}</p>
          </section>
        ))}

        <footer className="pt-16 border-t border-ink-line">
          <Link
            href="/"
            className="font-mono text-[10px] tracking-[0.15em] text-ink-tertiary uppercase"
            style={{ color: '#3A3835' }}
          >
            ← 返回首页
          </Link>
        </footer>
      </article>
    </main>
  );
}