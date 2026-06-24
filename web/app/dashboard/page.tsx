/**
 * ONE-MCN Dashboard · v5.5 Semi + Ma 哲学
 */
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button, Tag } from '@douyinfe/semi-ui';

const METRICS = [
  { id: 'traffic', name: '流量', value: '12,847', change: '+23.5%' },
  { id: 'conversion', name: '转化', value: '4.2%', change: '+1.8%' },
  { id: 'revenue', name: '收入', value: '¥87,420', change: '+12.3%' },
  { id: 'brand', name: '品牌', value: '428', change: '+34' },
  { id: 'retention', name: '留存', value: '78.6%', change: '+5.2%' },
];

const AGENTS = [
  { id: 'content', name: '内容', desc: '每天 5+ 条内容自动产出' },
  { id: 'acquisition', name: '获客', desc: '每天 50+ 触达' },
  { id: 'delivery', name: '交付', desc: '订单响应 < 1h' },
  { id: 'support', name: '售后', desc: '7×24 自动回复' },
];

export default function DashboardPage() {
  const [userId, setUserId] = useState('');
  const [plan, setPlan] = useState('tier1');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const storedPlan = localStorage.getItem('plan');
    const storedUser = localStorage.getItem('user_id');
    if (params.get('plan')) setPlan(params.get('plan')!);
    else if (storedPlan) setPlan(storedPlan);
    if (storedUser) setUserId(storedUser);
  }, []);

  return (
    <main className="min-h-screen bg-ink-bg text-ink-primary">
      <header className="border-b border-ink-line sticky top-0 z-50 bg-ink-bg/95">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-6 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <span className="font-mincho text-lg">ONE-MCN</span>
            <span className="font-mono text-[10px] tracking-[0.15em] text-ink-tertiary uppercase">
              Dashboard
            </span>
          </div>
          <Tag style={{ color: '#7A7670', borderColor: '#2A2825', background: 'transparent' }}>
            {plan}
          </Tag>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 md:px-12 py-24 space-y-24">
        {/* 升级提示 */}
        {plan === 'tier1' && (
          <section className="border border-vermilion p-12 grid grid-cols-12 gap-8">
            <div className="col-span-12 md:col-span-8 space-y-4">
              <Tag style={{ color: '#E05A47', borderColor: '#E05A47', background: 'transparent' }}>
                Tier 1 限制
              </Tag>
              <h2 className="text-title font-mincho">升级到 Tier 2，解锁 4 Agent</h2>
              <p className="text-ink-secondary leading-relaxed max-w-prose">
                你现在用的是 Tier 1 免费试用。4 Agent 自动运营 + 5 维数据监控需要 Tier 2
                （¥999/月，早鸟 ¥699 锁价）。
              </p>
            </div>
            <div className="col-span-12 md:col-span-4 flex md:justify-end items-start">
              <Button type="warning" size="large" as="a" href="/register?plan=tier2">
                ¥699 早鸟起步 →
              </Button>
            </div>
          </section>
        )}

        {/* 5 维数据 */}
        <section>
          <header className="mb-16 grid grid-cols-12 gap-8 items-end">
            <div className="col-span-12 md:col-span-6 space-y-3">
              <Tag style={{ color: '#E05A47', borderColor: '#E05A47', background: 'transparent' }}>
                01 — 数据
              </Tag>
              <h2 className="text-display font-mincho">5 维监控</h2>
            </div>
          </header>
          <div className="grid grid-cols-12 gap-px bg-ink-line border border-ink-line">
            {METRICS.map((m, i) => {
              const spans = [5, 4, 3, 5, 5];
              return (
                <article
                  key={m.id}
                  className={`col-span-12 md:col-span-${spans[i]} bg-ink-bg p-12 space-y-4`}
                >
                  <span className="font-mono text-[10px] tracking-[0.15em] text-ink-tertiary uppercase">
                    0{i + 1} · {m.name}
                  </span>
                  <div className="text-title font-mincho">{m.value}</div>
                  <span className="font-mono text-xs" style={{ color: '#E05A47' }}>
                    {m.change}
                  </span>
                </article>
              );
            })}
          </div>
        </section>

        <div className="border-t border-ink-line" />

        {/* 4 Agent */}
        <section>
          <header className="mb-16 space-y-3">
            <Tag style={{ color: '#E05A47', borderColor: '#E05A47', background: 'transparent' }}>
              02 — Agent
            </Tag>
            <h2 className="text-display font-mincho">4 Agent 控制台</h2>
          </header>
          <div className="grid grid-cols-12 gap-px bg-ink-line border border-ink-line">
            {AGENTS.map((a, i) => {
              const span = i % 2 === 0 ? 7 : 5;
              return (
                <article
                  key={a.id}
                  className={`col-span-12 md:col-span-${span} bg-ink-bg p-12 space-y-4`}
                >
                  <span className="font-mono text-[10px] tracking-[0.15em] text-ink-tertiary uppercase">
                    0{i + 1} · {a.name}
                  </span>
                  <p className="text-ink-secondary">{a.desc}</p>
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}