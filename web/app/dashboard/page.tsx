/**
 * ONE-MCN Dashboard · v5.4 japanese-ma-minimalism（間）
 * 5 维数据 + 4 Agent · 不对称 12 列 · 墨色基底 · 1px hairline
 */
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Loader2 } from 'lucide-react';

const AGENTS = [
  { id: 'content', name: 'Content', desc: '文章 / 视频 / 帖子自动生产' },
  { id: 'acquisition', name: 'Acquisition', desc: '多渠道触达 + 私域引流' },
  { id: 'delivery', name: 'Delivery', desc: '产品交付 + 客服' },
  { id: 'support', name: 'Support', desc: '复购触发 + 跟进' },
];

const PLAN_LIMITS: Record<
  string,
  { name: string; price: string; maxAgents: number }
> = {
  tier1: { name: 'Tier 1 · 免费试用', price: '¥0', maxAgents: 0 },
  tier2: { name: 'Tier 2 · 自动化搭建', price: '¥999/月', maxAgents: 4 },
  tier3: { name: 'Tier 3 · 定制陪跑', price: '¥50,000', maxAgents: 4 },
};

const METRICS = [
  { id: 'traffic', name: '流量', value: '12,847', change: '+23.5%' },
  { id: 'conversion', name: '转化', value: '4.2%', change: '+1.8%' },
  { id: 'revenue', name: '收入', value: '¥87,420', change: '+12.3%' },
  { id: 'brand', name: '品牌', value: '428', change: '+34' },
  { id: 'retention', name: '留存', value: '78.6%', change: '+5.2%' },
];

export default function DashboardPage() {
  const [userId, setUserId] = useState('');
  const [plan, setPlan] = useState('tier1');
  const [agentStatus, setAgentStatus] = useState<Record<string, string>>({});

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const storedPlan = localStorage.getItem('plan');
    const storedUser = localStorage.getItem('user_id');
    if (params.get('plan')) setPlan(params.get('plan')!);
    else if (storedPlan) setPlan(storedPlan);
    if (storedUser) setUserId(storedUser);
  }, []);

  const planInfo = PLAN_LIMITS[plan] || PLAN_LIMITS.tier1;
  const canUseAgents = planInfo.maxAgents > 0;

  async function runAgent(agentId: string) {
    if (!canUseAgents) return;
    setAgentStatus((p) => ({ ...p, [agentId]: 'running' }));
    try {
      await fetch('http://localhost:3000/api/agent-run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agent_id: agentId, user_id: userId }),
      });
    } catch (e) {
      console.error(e);
    }
    setTimeout(() => {
      setAgentStatus((p) => ({ ...p, [agentId]: 'completed' }));
    }, 2000);
  }

  return (
    <main className="min-h-screen bg-ink-bg text-ink-primary">
      {/* Header — 1px hairline */}
      <header className="border-b border-ink-line sticky top-0 z-50 bg-ink-bg/95">
        <div className="max-w-7xl mx-auto px-8 py-6 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <span className="font-mincho text-lg">ONE-MCN</span>
            <span className="font-mono text-[10px] tracking-[0.15em] text-ink-tertiary uppercase">
              Dashboard
            </span>
          </div>
          <Badge variant="outline">{planInfo.name}</Badge>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-8 py-24">
        {/* Tier 1 升级提示 */}
        {plan === 'tier1' && (
          <section className="border border-vermilion p-12 mb-24 grid grid-cols-12 gap-8">
            <div className="col-span-12 md:col-span-8 space-y-4">
              <span className="font-mono text-[10px] tracking-[0.15em] text-vermilion uppercase">
                Tier 1 限制
              </span>
              <h2 className="text-title font-mincho">
                升级到 Tier 2，解锁 4 Agent 自动化
              </h2>
              <p className="text-ink-secondary leading-relaxed max-w-prose">
                你现在用的是 Tier 1 免费试用，可以做 Discovery 多轮对话梳理方向。
                但 4 Agent 自动运营 + 5 维数据监控需要 Tier 2（¥999/月，早鸟 ¥699 锁价）。
              </p>
            </div>
            <div className="col-span-12 md:col-span-4 flex md:justify-end items-start">
              <Button variant="vermilion" size="lg" asChild>
                <Link href="/register?plan=tier2">¥699 早鸟起步 →</Link>
              </Button>
            </div>
          </section>
        )}

        {/* 5 维数据 — 不对称 12 列（5 个 metric 用 4+4+2+2 错位） */}
        <section className="mb-32">
          <header className="mb-16 grid grid-cols-12 gap-8 items-end">
            <div className="col-span-12 md:col-span-6 space-y-3">
              <span className="font-mono text-[10px] tracking-[0.15em] text-ink-tertiary uppercase">
                01 — 数据
              </span>
              <h2 className="text-display font-mincho">5 维监控</h2>
            </div>
            {!canUseAgents && (
              <div className="col-span-12 md:col-span-6 md:text-right">
                <Badge variant="outline" className="font-mono text-[10px]">
                  需升级 Tier 2
                </Badge>
              </div>
            )}
          </header>

          <div className="grid grid-cols-12 gap-px bg-ink-line border border-ink-line">
            {METRICS.map((m, i) => {
              // 不对称 span: 4, 4, 2, 2, 4（合计 16，但 grid-cols-12 所以重新分配）
              const span = i === 0 ? 5 : i === 1 ? 4 : i === 2 ? 3 : i === 3 ? 5 : 5;
              return (
                <article
                  key={m.id}
                  className={`col-span-12 md:col-span-${span} bg-ink-bg p-12 space-y-4`}
                >
                  <span className="font-mono text-[10px] tracking-[0.15em] text-ink-tertiary uppercase">
                    0{i + 1} · {m.name}
                  </span>
                  <div className="text-title font-mincho">{m.value}</div>
                  <span className="font-mono text-xs text-vermilion">{m.change}</span>
                </article>
              );
            })}
          </div>
        </section>

        <Separator />

        {/* 4 Agent 控制台 */}
        <section className="my-32">
          <header className="mb-16 space-y-3">
            <span className="font-mono text-[10px] tracking-[0.15em] text-ink-tertiary uppercase">
              02 — Agent
            </span>
            <h2 className="text-display font-mincho">4 Agent 控制台</h2>
          </header>

          <div className="grid grid-cols-12 gap-px bg-ink-line border border-ink-line">
            {AGENTS.map((agent, i) => {
              const span = i % 2 === 0 ? 7 : 5;
              const status = agentStatus[agent.id];
              return (
                <article
                  key={agent.id}
                  className={`col-span-12 md:col-span-${span} bg-ink-bg p-12 space-y-6`}
                >
                  <div className="flex justify-between items-start">
                    <span className="font-mono text-[10px] tracking-[0.15em] text-ink-tertiary uppercase">
                      0{i + 1} · {agent.name}
                    </span>
                    <Badge
                      variant={
                        status === 'completed'
                          ? 'vermilion'
                          : status === 'running'
                          ? 'outline'
                          : 'outline'
                      }
                      className="font-mono text-[10px]"
                    >
                      {status === 'completed'
                        ? '已完成'
                        : status === 'running'
                        ? '运行中'
                        : '待启动'}
                    </Badge>
                  </div>
                  <p className="text-ink-secondary leading-relaxed">{agent.desc}</p>
                  <Button
                    onClick={() => runAgent(agent.id)}
                    disabled={!canUseAgents || status === 'running'}
                    variant="outline"
                    size="lg"
                  >
                    {status === 'running' ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : canUseAgents ? (
                      <>运行 →</>
                    ) : (
                      '需升级 Tier 2'
                    )}
                  </Button>
                </article>
              );
            })}
          </div>
        </section>

        <Separator />

        {/* 快捷入口 */}
        <section>
          <header className="mb-16 space-y-3">
            <span className="font-mono text-[10px] tracking-[0.15em] text-ink-tertiary uppercase">
              03 — 入口
            </span>
            <h2 className="text-display font-mincho">快捷入口</h2>
          </header>

          <div className="grid grid-cols-12 gap-px bg-ink-line border border-ink-line">
            {[
              { href: '/discovery', title: 'Stage 1', desc: '5-10 轮 AI 对话，生成品牌蓝图', span: 5 },
              { href: '/pricing', title: '价格管理', desc: '3 层定价 + 推荐佣金', span: 4 },
              { href: '/agents', title: '4 Agent 详情', desc: '内容/获客/交付/售后 配置', span: 3 },
            ].map((entry) => (
              <Link
                key={entry.href}
                href={entry.href}
                className={`col-span-12 md:col-span-${entry.span} bg-ink-bg p-12 space-y-3 hover:bg-ink-surface transition-colors duration-300`}
              >
                <span className="font-mono text-[10px] tracking-[0.15em] text-ink-tertiary uppercase">
                  {entry.title}
                </span>
                <p className="text-ink-secondary leading-relaxed">{entry.desc}</p>
                <span className="font-mono text-xs text-vermilion">→</span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}