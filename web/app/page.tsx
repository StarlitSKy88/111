/**
 * ONE-MCN Landing Page · v5.4 japanese-ma-minimalism（間）
 * v5.4.1 — 修复：
 *   1. 加 lg: 桌面适配（≥1024px）
 *   2. Hero 加明确"做什么"+ 4 个核心能力点
 *   3. 加 social proof + 三阶段流程
 *   4. 全文 max-w-2xl 正文宽度
 */
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-ink-bg text-ink-primary">
      {/* HERO — 明确告诉用户 ONE-MCN 是什么 */}
      <section className="px-6 md:px-12 lg:px-16 py-24 md:py-32 lg:py-48 max-w-7xl mx-auto">
        <div className="grid grid-cols-12 gap-6 md:gap-8 lg:gap-12">
          <div className="col-span-12 md:col-span-9 lg:col-span-8 space-y-12">
            <Badge variant="vermilion" className="font-mono">
              早鸟 ¥699/月 · 前 100 用户锁价
            </Badge>

            <h1 className="text-hero font-mincho leading-[1.05]">
              <span className="block">一人公司</span>
              <span className="block text-ink-secondary">的</span>
              <span className="block">AI 合伙人</span>
            </h1>

            <p className="text-ink-secondary text-xl leading-relaxed max-w-prose">
              ONE-MCN = 4 个 AI Agent + 多轮对话 + 14 天免费试用
              <br />
              帮你从「想到」走到「赚到」，不需要招人。
            </p>

            {/* 4 个核心能力（一目了然） */}
            <div className="space-y-4 pt-4">
              <h2 className="font-mono text-[10px] tracking-[0.15em] text-ink-tertiary uppercase">
                ONE-MCN 做什么
              </h2>
              <ul className="space-y-3 text-ink-primary text-base leading-relaxed">
                <li>
                  <span className="text-vermilion font-mono mr-3">01</span>
                  多轮 AI 对话 — 5 轮挖掘你的能力 + 需求 + 方向
                </li>
                <li>
                  <span className="text-vermilion font-mono mr-3">02</span>
                  5 章节品牌蓝图 — 可执行的方向 + 变现路径
                </li>
                <li>
                  <span className="text-vermilion font-mono mr-3">03</span>
                  4 Agent 自动化 — 内容 / 获客 / 交付 / 售后
                </li>
                <li>
                  <span className="text-vermilion font-mono mr-3">04</span>
                  14 天免费试用 — 不需要信用卡，到期不强转
                </li>
              </ul>
            </div>

            <div className="flex flex-col md:flex-row gap-8 pt-4">
              <Button variant="primary" size="lg" asChild>
                <Link href="/onboarding">
                  免费试用 14 天
                  <span className="ml-3">→</span>
                </Link>
              </Button>
              <Button variant="ghost" size="lg" asChild>
                <Link href="/pricing">查看 3 层定价</Link>
              </Button>
            </div>

            {/* Social proof */}
            <div className="pt-12 border-t border-ink-line">
              <p className="font-mono text-[10px] tracking-[0.15em] text-ink-tertiary uppercase">
                已有 1 人完成试用 · 5 章节蓝图已生成 · 14 天反馈机制跑通
              </p>
            </div>
          </div>

          <aside className="hidden lg:flex col-span-4 flex-col justify-end">
            <div className="text-[20vw] font-mincho text-ink-line leading-none select-none">
              間
            </div>
          </aside>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16">
        <Separator />
      </div>

      {/* 三阶段流程 */}
      <section className="px-6 md:px-12 lg:px-16 py-24 md:py-32 lg:py-48 max-w-7xl mx-auto">
        <header className="max-w-prose mb-24 space-y-6">
          <span className="font-mono text-[10px] tracking-[0.15em] text-ink-tertiary uppercase">
            流程
          </span>
          <h2 className="text-display font-mincho">怎么用 ONE-MCN</h2>
          <p className="text-ink-secondary text-lg leading-relaxed">
            3 步走，从 0 到 1 跑通一人品牌。
            <br />
            每天 30 分钟，14 天后你会有完整的品牌蓝图。
          </p>
        </header>

        {/* 不对称 12 列 3 阶段 */}
        <div className="grid grid-cols-12 gap-px bg-ink-line border border-ink-line">
          {/* Stage 1 */}
          <article className="col-span-12 md:col-span-5 bg-ink-bg p-8 md:p-12 space-y-6">
            <span className="font-mono text-[10px] tracking-[0.15em] text-vermilion uppercase">
              Stage 1 · 5 分钟
            </span>
            <h3 className="text-title font-mincho">Discovery 多轮对话</h3>
            <p className="text-ink-secondary leading-relaxed">
              5 轮 AI 对话：opening → capability → need → direction → summary
              <br />
              输出 5 章节可执行品牌蓝图
            </p>
            <p className="font-mono text-xs text-ink-tertiary">免费 · 14 天</p>
          </article>

          {/* Stage 2 */}
          <article className="col-span-12 md:col-span-4 bg-ink-bg p-8 md:p-12 space-y-6">
            <span className="font-mono text-[10px] tracking-[0.15em] text-vermilion uppercase">
              Stage 2 · 每天 30 分钟
            </span>
            <h3 className="text-title font-mincho">4 Agent 自动化</h3>
            <p className="text-ink-secondary leading-relaxed">
              内容 / 获客 / 交付 / 售后 7×24
              <br />
              全权自动执行 + weekly review
            </p>
            <p className="font-mono text-xs text-ink-tertiary">¥999/月 · 早鸟 ¥699</p>
          </article>

          {/* Stage 3 */}
          <article className="col-span-12 md:col-span-3 bg-ink-bg p-8 md:p-12 space-y-6">
            <span className="font-mono text-[10px] tracking-[0.15em] text-vermilion uppercase">
              Stage 3 · 持续
            </span>
            <h3 className="text-title font-mincho">监控 + 变现</h3>
            <p className="text-ink-secondary leading-relaxed">
              5 维数据 + 异常预警
              <br />
              月度报告 + 推荐佣金 15%
            </p>
            <p className="font-mono text-xs text-ink-tertiary">含在 Tier 2 内</p>
          </article>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16">
        <Separator />
      </div>

      {/* 适合谁 — ICP */}
      <section className="px-6 md:px-12 lg:px-16 py-24 md:py-32 lg:py-48 max-w-5xl mx-auto">
        <blockquote className="border-l border-vermilion pl-12 space-y-8">
          <span className="font-mono text-[10px] tracking-[0.15em] text-vermilion uppercase">
            适合
          </span>
          <h2 className="text-display font-mincho leading-tight">
            写给 35 岁上下
            <br />
            想搞副业的你
          </h2>
          <div className="space-y-4 text-ink-secondary text-lg leading-loose max-w-prose">
            <p>ONE-MCN 适合：</p>
            <ul className="space-y-2 list-none">
              <li>— 35 岁上下被裁过 / 想搞副业</li>
              <li>— 有产品或技能想变现，但不知道怎么做</li>
              <li>— 试过抖音 / 小红书 / 朋友圈，0 收入</li>
              <li>— 想建立个人品牌，但没时间学技术</li>
              <li>— 愿意每天花 30 分钟 + 14 天认真试用</li>
            </ul>
          </div>
          <p className="text-ink-primary text-title font-mincho pt-8">
            不需要招人，不需要写代码。
            <br />
            你只负责想，AI 负责做。
          </p>
        </blockquote>
      </section>

      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16">
        <Separator />
      </div>

      {/* Final CTA */}
      <section className="px-6 md:px-12 lg:px-16 py-24 md:py-32 lg:py-48 max-w-3xl mx-auto text-center">
        <h2 className="text-display font-mincho leading-tight mb-12">
          今天就开始
          <br />
          比明天多 24 小时
        </h2>
        <p className="text-ink-secondary leading-relaxed mb-16 max-w-prose mx-auto">
          免费 14 天试用 · 不需要信用卡 · 1 分钟跑通 Discovery 对话
        </p>
        <Button variant="vermilion" size="lg" asChild>
          <Link href="/onboarding">
            免费试用 14 天 →
          </Link>
        </Button>
        <p className="font-mono text-[10px] tracking-[0.15em] text-ink-tertiary uppercase pt-12">
          前 100 用户早鸟 ¥699/月锁价 · 标准 ¥999/月
        </p>
      </section>

      {/* Footer */}
      <footer className="border-t border-ink-line py-16">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16 flex flex-col md:flex-row justify-between gap-6">
          <p className="font-mono text-[10px] tracking-[0.15em] text-ink-tertiary uppercase">
            ONE-MCN · 一人公司 · vibcoding
          </p>
          <nav className="flex flex-wrap gap-x-8 gap-y-2 text-xs">
            <Link href="/pricing" className="text-ink-secondary hover:text-ink-primary transition-opacity duration-300">价格</Link>
            <Link href="/onboarding" className="text-ink-secondary hover:text-ink-primary transition-opacity duration-300">试用</Link>
            <Link href="/discovery" className="text-ink-secondary hover:text-ink-primary transition-opacity duration-300">Discovery</Link>
            <Link href="/agents" className="text-ink-secondary hover:text-ink-primary transition-opacity duration-300">4 Agent</Link>
            <Link href="/privacy" className="text-ink-secondary hover:text-ink-primary transition-opacity duration-300">隐私</Link>
            <Link href="/terms" className="text-ink-secondary hover:text-ink-primary transition-opacity duration-300">条款</Link>
          </nav>
        </div>
      </footer>
    </main>
  );
}