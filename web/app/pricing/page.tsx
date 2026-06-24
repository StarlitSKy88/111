/**
 * ONE-MCN Pricing · v5.5 Semi + Ma 哲学
 */
'use client';

import { Button, Tag } from '@douyinfe/semi-ui';

const TIERS = [
  {
    id: 'tier1', name: 'Tier 1', label: '免费试用', price: '¥0', period: '永久免费',
    desc: 'AI 帮你梳理可做的项目', features: ['AI 问卷梳理可做项目', '5 状态机 Discovery 对话', '5 章节品牌蓝图', '1 人品牌网站（基础版）'],
    highlight: false, cta: '开始免费试用', ctaLink: '/onboarding',
  },
  {
    id: 'tier2', name: 'Tier 2', label: '推荐', price: '¥999', period: '早鸟 ¥699/月 · 前 100',
    desc: '4 Agent 自动化 + 数据监控', features: ['Tier 1 全部功能', '4 Agent 自动搭建', '1 人品牌网站（Pro 版）', '5 维数据监控', '月度报告', '推荐奖励（15% 佣金）'],
    highlight: true, cta: '¥699 早鸟起步', ctaLink: '/register?plan=tier2',
  },
  {
    id: 'tier3', name: 'Tier 3', label: '定制', price: '¥50,000', period: '一次性 · 12 个月',
    desc: '12 个月 1v1 顾问陪跑', features: ['Tier 2 全部功能', '12 个月 1v1 顾问陪跑', '定制 Agent（按行业）', '行业资源对接', '紧急响应 24h', '月度深度复盘'],
    highlight: false, cta: '联系顾问', ctaLink: '/agents',
  },
];

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-ink-bg text-ink-primary relative">
      <div className="washi-texture" aria-hidden="true" />
      <article className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16 py-24 md:py-32 relative z-10">
        <header className="max-w-prose mb-24 space-y-6">
          <Tag style={{ color: '#E05A47', borderColor: '#E05A47', background: 'transparent' }}>
            价格
          </Tag>
          <h1 className="text-display font-mincho">3 层定价</h1>
          <p className="text-ink-secondary text-lg leading-relaxed">
            免费试用 → 自动化搭建 → 定制陪跑
          </p>
        </header>
        <div className="border-t border-ink-line mb-24" />

        <div className="grid grid-cols-12 gap-px bg-ink-line border border-ink-line">
          {TIERS.map((tier) => (
            <article
              key={tier.id}
              className={`col-span-12 md:col-span-${tier.id === 'tier2' ? 5 : tier.id === 'tier1' ? 4 : 3} bg-ink-bg p-8 md:p-12 space-y-8 ${
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
                <h2 className="text-title font-mincho">{tier.desc}</h2>
              </header>
              <div className="space-y-2">
                <div className="text-display font-mincho">{tier.price}</div>
                <p className="font-mono text-xs text-ink-tertiary">{tier.period}</p>
              </div>
              <div className="border-t border-ink-line" />
              <ul className="space-y-3 text-ink-secondary">
                {tier.features.map((f, i) => (
                  <li key={i}>— {f}</li>
                ))}
              </ul>
              <div className="pt-8">
                <Button
                  type={tier.highlight ? 'warning' : 'default'}
                  size="large"
                  onClick={() => (window.location.href = tier.ctaLink)}
                >
                  {tier.cta} →
                </Button>
              </div>
            </article>
          ))}
        </div>
      </article>
    </main>
  );
}