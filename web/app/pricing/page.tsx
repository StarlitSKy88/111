/**
 * ONE-MCN Pricing · v5.4 japanese-ma-minimalism（間）
 * 暖墨色 · 不对称 12 列 · 文字 CTA · 1px hairline
 */
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const TIERS = [
  {
    id: 'tier1',
    name: 'Tier 1',
    label: '免费试用',
    price: '¥0',
    period: '永久免费',
    description: 'AI 帮你梳理可做的项目',
    features: [
      'AI 问卷梳理可做项目',
      '5 状态机 Discovery 对话',
      '5 章节品牌蓝图',
      '1 人品牌网站（基础版）',
    ],
    cta: '开始免费试用',
    ctaLink: '/discovery',
    highlight: false,
    span: 4,
  },
  {
    id: 'tier2',
    name: 'Tier 2',
    label: '推荐',
    price: '¥999',
    period: '早鸟 ¥699/月 · 前 100',
    description: '4 Agent 自动化 + 数据监控',
    features: [
      'Tier 1 全部功能',
      '4 Agent 自动搭建',
      '1 人品牌网站（Pro 版）',
      '5 维数据监控',
      '月度报告',
      '推荐奖励（15% 佣金）',
    ],
    cta: '¥699 早鸟起步',
    ctaLink: '/register?plan=tier2',
    highlight: true,
    span: 5,
  },
  {
    id: 'tier3',
    name: 'Tier 3',
    label: '定制',
    price: '¥50,000',
    period: '一次性 · 12 个月 1v1',
    description: '12 个月 1v1 顾问陪跑',
    features: [
      'Tier 2 全部功能',
      '12 个月 1v1 顾问陪跑',
      '定制 Agent（按行业）',
      '行业资源对接',
      '紧急响应 24h',
      '月度深度复盘',
    ],
    cta: '联系顾问',
    ctaLink: '/agents',
    highlight: false,
    span: 3,
  },
];

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-ink-bg text-ink-primary">
      <section className="px-8 md:px-16 py-32 md:py-48 max-w-7xl mx-auto">
        <header className="max-w-prose mb-32 space-y-6">
          <span className="font-mono text-[10px] tracking-[0.15em] text-vermilion uppercase">
            价格
          </span>
          <h1 className="text-display font-mincho">3 层定价</h1>
          <p className="text-ink-secondary text-lg leading-relaxed">
            免费试用 → 自动化搭建 → 定制陪跑
          </p>
        </header>

        <Separator />

        {/* 不对称 12 列 tier 网格 */}
        <div className="grid grid-cols-12 gap-px bg-ink-line border border-ink-line mt-24">
          {TIERS.map((tier) => (
            <article
              key={tier.id}
              className={`col-span-12 md:col-span-${tier.span} bg-ink-bg p-12 space-y-8 ${
                tier.highlight ? 'border border-vermilion -m-px' : ''
              }`}
            >
              <header className="space-y-3">
                <span
                  className={`font-mono text-[10px] tracking-[0.15em] uppercase ${
                    tier.highlight ? 'text-vermilion' : 'text-ink-tertiary'
                  }`}
                >
                  {tier.name} · {tier.label}
                </span>
                <h2 className="text-title font-mincho">{tier.description}</h2>
              </header>

              <div className="space-y-2">
                <div className="text-display font-mincho">{tier.price}</div>
                <p className="text-ink-tertiary font-mono text-xs">{tier.period}</p>
              </div>

              <Separator />

              <ul className="space-y-3 text-ink-secondary">
                {tier.features.map((f, i) => (
                  <li key={i}>— {f}</li>
                ))}
              </ul>

              <div className="pt-8">
                <Button
                  variant={tier.highlight ? 'vermilion' : 'ghost'}
                  size="lg"
                  asChild
                >
                  <Link href={tier.ctaLink}>
                    {tier.cta} →
                  </Link>
                </Button>
              </div>
            </article>
          ))}
        </div>

        <Separator />

        {/* FAQ — 不对称引用块 */}
        <section className="mt-32 space-y-16">
          <header className="space-y-6">
            <span className="font-mono text-[10px] tracking-[0.15em] text-vermilion uppercase">
              FAQ
            </span>
            <h2 className="text-display font-mincho">常见问题</h2>
          </header>

          <div className="space-y-16">
            {[
              {
                q: 'Tier 1 免费试用能做什么？',
                a: 'AI 通过 5-10 轮对话挖掘你的能力、需求、方向，输出 5 章节可执行蓝图。但没有 4 Agent 自动化、数据监控、月度报告。',
              },
              {
                q: 'Tier 2 的 ¥999 是月费还是年费？',
                a: '¥999/月（含早鸟 ¥699 锁价，前 100 用户永久）。包含 4 Agent 持续执行 + 月度报告 + 数据监控。',
              },
              {
                q: 'Tier 3 的 ¥50,000 是一次性吗？',
                a: '一次性付费，包含 12 个月 1v1 顾问陪跑 + 定制 Agent + 行业资源对接。¥999/月运营费减免 50%。',
              },
              {
                q: '35 岁被裁，最适合哪个 Tier？',
                a: '推荐先 Tier 1 免费试用 → 跑通 Discovery 对话 → 确认方向 → Tier 2 ¥699 早鸟起步。每天 ¥33，比一杯咖啡便宜。',
              },
            ].map((item, i) => (
              <article key={i} className="grid grid-cols-12 gap-8 border-t border-ink-line pt-8">
                <h3 className="col-span-12 md:col-span-4 font-mincho text-title">{item.q}</h3>
                <p className="col-span-12 md:col-span-7 md:col-start-6 text-ink-secondary leading-relaxed">
                  {item.a}
                </p>
              </article>
            ))}
          </div>
        </section>

        <Separator />

        <div className="mt-24 text-center">
          <Button variant="ghost" asChild>
            <Link href="/dashboard">已有账号？返回 Dashboard</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}