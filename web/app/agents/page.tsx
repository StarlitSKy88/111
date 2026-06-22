/**
 * ONE-MCN Agents · v5.4 japanese-ma-minimalism（間）
 * 4 Agent 配置展示 + 顾问资源池
 */
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const AGENTS = [
  {
    id: 'content',
    name: 'Content Agent',
    role: '内容',
    desc: '文章 / 视频 / 帖子自动生产',
    config: 'auto_decided=true · v1',
    span: 7,
  },
  {
    id: 'acquisition',
    name: 'Acquisition Agent',
    role: '获客',
    desc: '多渠道触达 + 私域引流',
    config: 'auto_decided=true · v1',
    span: 5,
  },
  {
    id: 'delivery',
    name: 'Delivery Agent',
    role: '交付',
    desc: '产品交付 + 客服',
    config: 'auto_decided=true · v1',
    span: 5,
  },
  {
    id: 'support',
    name: 'Support Agent',
    role: '售后',
    desc: '复购触发 + 跟进',
    config: 'auto_decided=true · v1',
    span: 7,
  },
];

export default function AgentsPage() {
  return (
    <main className="min-h-screen bg-ink-bg text-ink-primary">
      <section className="px-8 md:px-16 py-32 md:py-48 max-w-7xl mx-auto">
        <header className="max-w-prose mb-32 space-y-6">
          <span className="font-mono text-[10px] tracking-[0.15em] text-vermilion uppercase">
            04 — Agent
          </span>
          <h1 className="text-display font-mincho">4 Agent 矩阵</h1>
          <p className="text-ink-secondary text-lg leading-relaxed">
            内容 / 获客 / 交付 / 售后 · 全权自动执行 + weekly review。
            <br />
            不是助手，是合伙人。
          </p>
        </header>

        <Separator />

        {/* 不对称 12 列 Agent 网格 */}
        <div className="grid grid-cols-12 gap-px bg-ink-line border border-ink-line mt-24">
          {AGENTS.map((agent) => (
            <article
              key={agent.id}
              className={`col-span-12 md:col-span-${agent.span} bg-ink-bg p-12 space-y-6`}
            >
              <div className="flex items-baseline gap-4">
                <span className="font-mincho text-display">{agent.role}</span>
                <Badge variant="outline" className="font-mono text-[10px]">
                  {agent.config}
                </Badge>
              </div>
              <h3 className="text-title font-mincho">{agent.name}</h3>
              <p className="text-ink-secondary leading-relaxed max-w-prose">
                {agent.desc}
              </p>
            </article>
          ))}
        </div>

        <Separator />

        {/* 顾问资源池（Tier 3） */}
        <section className="mt-32">
          <header className="mb-16 space-y-3">
            <span className="font-mono text-[10px] tracking-[0.15em] text-vermilion uppercase">
              Tier 3
            </span>
            <h2 className="text-display font-mincho">顾问资源池</h2>
            <p className="text-ink-secondary leading-relaxed max-w-prose">
              12 个月 1v1 顾问陪跑 · 紧急响应 24h · 月度深度复盘。
            </p>
          </header>

          <div className="grid grid-cols-12 gap-px bg-ink-line border border-ink-line">
            <article className="col-span-12 md:col-span-4 bg-ink-bg p-12 space-y-6">
              <span className="font-mono text-[10px] tracking-[0.15em] text-ink-tertiary uppercase">
                01 — 价格
              </span>
              <div className="text-display font-mincho">¥50,000</div>
              <p className="text-ink-tertiary font-mono text-xs">一次性 · 12 个月</p>
              <p className="text-ink-secondary leading-relaxed">
                Tier 2 → Tier 3 转化必须。每名顾问 12 个月可服务 ≤ 5 个客户。
              </p>
            </article>

            <article className="col-span-12 md:col-span-8 bg-ink-bg p-12 space-y-6">
              <span className="font-mono text-[10px] tracking-[0.15em] text-ink-tertiary uppercase">
                02 — 入学门槛
              </span>
              <h3 className="text-title font-mincho">必须从 Tier 2 转化</h3>
              <p className="text-ink-secondary leading-relaxed max-w-prose">
                不允许直接进 Tier 3。需要 Tier 2 用户跑完 ≥ 60 天，证明有月入 ≥ ¥10K 的能力。
                Tier 3 顾问陪跑目标是 12 个月内月入 ≥ ¥100K（30% 用户达成）。
              </p>
              <Button variant="vermilion" size="lg" asChild className="pt-4">
                <Link href="/register?plan=tier3">
                  联系顾问 →
                </Link>
              </Button>
            </article>
          </div>
        </section>

        <Separator />

        {/* Footer CTA */}
        <div className="mt-24 text-center">
          <Button variant="ghost" asChild>
            <Link href="/dashboard">返回 Dashboard</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}