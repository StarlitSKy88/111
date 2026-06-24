/**
 * ONE-MCN Terms · v5.5 Semi + Ma 哲学
 */
'use client';

import Link from 'next/link';
import { Tag } from '@douyinfe/semi-ui';

export default function TermsPage() {
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
            条款
          </Tag>
          <h1 className="text-display font-mincho">服务条款</h1>
          <p className="font-mono text-xs text-ink-tertiary">最后更新：2026-06-23</p>
        </header>

        {[
          { title: '1. 订阅', content: 'Tier 1 免费 / Tier 2 ¥999/月（早鸟 ¥699 前 100 锁价）/ Tier 3 ¥50,000 一次性 12 个月 1v1 顾问' },
          { title: '2. 退款', content: 'Tier 2 月费：7 天内全额退款 / Tier 3 一次性：30 天内全额退款 / 申请：billing@one-mcn.local' },
          { title: '3. 数据所有权', content: '你创建的所有内容（Discovery 对话、蓝图、4 Agent 产物）归你所有' },
          { title: '4. 免责声明', content: '4 Agent 产出基于 AI 模型 + 你的输入，不保证准确性。你应自行审慎使用' },
          { title: '5. 服务变更', content: '重大变更提前 30 天通知。争议按中国法律 + 北京仲裁委员会' },
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