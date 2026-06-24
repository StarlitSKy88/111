/**
 * ONE-MCN Agents · v5.5 Semi + Ma 哲学
 */
'use client';

import { Tag } from '@douyinfe/semi-ui';

const AGENTS = [
  { id: 'content', name: 'Content', role: '内容', desc: '每天 5+ 条内容自动产出' },
  { id: 'acquisition', name: 'Acquisition', role: '获客', desc: '每天 50+ 触达' },
  { id: 'delivery', name: 'Delivery', role: '交付', desc: '订单响应 < 1h' },
  { id: 'support', name: 'Support', role: '售后', desc: '7×24 自动回复' },
];

export default function AgentsPage() {
  return (
    <main className="min-h-screen bg-ink-bg text-ink-primary relative">
      <div className="washi-texture" aria-hidden="true" />
      <article className="max-w-7xl mx-auto px-6 md:px-12 py-24 md:py-32 relative z-10">
        <header className="max-w-prose mb-24 space-y-6">
          <Tag style={{ color: '#E05A47', borderColor: '#E05A47', background: 'transparent' }}>
            04 — Agent
          </Tag>
          <h1 className="text-display font-mincho">4 Agent 矩阵</h1>
          <p className="text-ink-secondary text-lg leading-relaxed max-w-prose">
            内容 / 获客 / 交付 / 售后 · 全权自动执行 + weekly review。
          </p>
        </header>
        <div className="border-t border-ink-line mb-24" />
        <div className="grid grid-cols-12 gap-px bg-ink-line border border-ink-line">
          {AGENTS.map((agent) => (
            <article
              key={agent.id}
              className={`col-span-12 md:col-span-${agent.id === 'content' ? 7 : 5} bg-ink-bg p-12 space-y-6`}
            >
              <div className="flex items-baseline gap-4">
                <span className="font-mincho text-display">{agent.role}</span>
                <Tag style={{ color: '#7A7670', borderColor: '#2A2825', background: 'transparent' }}>
                  {agent.name}
                </Tag>
              </div>
              <p className="text-ink-secondary leading-relaxed max-w-prose">{agent.desc}</p>
            </article>
          ))}
        </div>
      </article>
    </main>
  );
}