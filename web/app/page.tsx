/**
 * ONE-MCN Landing Page · v5.4 japanese-ma-minimalism（間）
 * 暖墨色 · 衬线明朝体 · 1px hairline · 文字 CTA · 零渐变 · 零玻璃
 */
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-ink-bg text-ink-primary">
      {/* Hero */}
      <section className="px-8 md:px-16 py-32 md:py-48 max-w-7xl mx-auto">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 md:col-span-9 space-y-12">
            <Badge variant="vermilion" className="font-mono">
              早鸟 ¥699/月 · 前 100 用户锁价
            </Badge>

            <h1 className="text-hero font-mincho leading-[1.05]">
              <span className="block">被裁了？</span>
              <span className="block">35 岁？</span>
              <span className="block text-ink-secondary mt-4">
                60 天
              </span>
              <span className="block">用 AI 跑通</span>
              <span className="block">一人品牌</span>
            </h1>

            <p className="text-ink-secondary text-lg leading-relaxed max-w-prose">
              ONE-MCN 不是课程，不是工具。
              <br />
              是一个 <span className="text-ink-primary">AI 合伙人</span>，
              帮你从「裁员通知」走到「第一个付费用户」。
            </p>

            <div className="flex flex-col md:flex-row gap-8 pt-8">
              <Button variant="primary" size="lg" asChild>
                <Link href="/discovery">
                  免费试用 AI 问卷
                  <span className="ml-3">→</span>
                </Link>
              </Button>
              <Button variant="ghost" size="lg" asChild>
                <Link href="/pricing">查看 3 层定价</Link>
              </Button>
            </div>

            <p className="font-mono text-xs tracking-[0.15em] text-ink-tertiary uppercase">
              Tier 1 免费 · Tier 2 ¥999/月 · Tier 3 ¥50,000
            </p>
          </div>

          <aside className="col-span-12 md:col-span-3 hidden md:flex flex-col justify-end">
            <div className="text-[20vw] font-mincho text-ink-line leading-none select-none">
              間
            </div>
          </aside>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-8 md:px-16">
        <Separator />
      </div>

      {/* 5 价值点 — 不对称 Bento */}
      <section className="px-8 md:px-16 py-32 md:py-48 max-w-7xl mx-auto">
        <header className="max-w-prose mb-24 space-y-6">
          <span className="font-mono text-[10px] tracking-[0.15em] text-ink-tertiary uppercase">
            01 — 你将得到
          </span>
          <h2 className="text-display font-mincho">5 个东西</h2>
          <p className="text-ink-secondary text-lg leading-relaxed">
            ONE-MCN 是 4 Agent + AI 合伙人的完整 1 人 MCN 操作系统。
            <span className="text-ink-tertiary">不是工具箱，是合伙人。</span>
          </p>
        </header>

        {/* 不对称 12 列 Bento */}
        <div className="grid grid-cols-12 gap-px bg-ink-line border border-ink-line">
          {/* 大卡 — AI 合伙人 */}
          <article className="col-span-12 md:col-span-7 bg-ink-bg p-12 space-y-6">
            <span className="font-mono text-[10px] tracking-[0.15em] text-vermilion uppercase">
              A — 合伙人
            </span>
            <h3 className="text-title font-mincho">AI 合伙人</h3>
            <p className="text-ink-secondary leading-relaxed max-w-prose">
              5-10 轮 AI 对话挖掘你的能力、需求、方向，输出 5 章节可执行蓝图。
            </p>
          </article>

          {/* 小卡 — 4 Agent */}
          <article className="col-span-12 md:col-span-5 bg-ink-bg p-12 space-y-6">
            <span className="font-mono text-[10px] tracking-[0.15em] text-vermilion uppercase">
              B — Agent
            </span>
            <h3 className="text-title font-mincho">4 Agent 矩阵</h3>
            <p className="text-ink-secondary leading-relaxed">
              内容 / 获客 / 交付 / 售后 7×24 自动化运营
            </p>
          </article>

          {/* 中卡 — 5 维数据 */}
          <article className="col-span-12 md:col-span-5 bg-ink-bg p-12 space-y-6">
            <span className="font-mono text-[10px] tracking-[0.15em] text-vermilion uppercase">
              C — 数据
            </span>
            <h3 className="text-title font-mincho">5 维数据</h3>
            <p className="text-ink-secondary leading-relaxed">
              流量 / 转化 / 收入 / 品牌 / 留存
            </p>
          </article>

          {/* 中卡 — 自动化搭建 */}
          <article className="col-span-12 md:col-span-3 bg-ink-bg p-12 space-y-6">
            <span className="font-mono text-[10px] tracking-[0.15em] text-vermilion uppercase">
              D — 搭建
            </span>
            <h3 className="text-title font-mincho">¥999 起步</h3>
            <p className="text-ink-secondary leading-relaxed">
              AI 自动搭建 1 人品牌网站
            </p>
          </article>

          {/* 小卡 — 35 岁优化 */}
          <article className="col-span-12 md:col-span-4 bg-ink-bg p-12 space-y-6">
            <span className="font-mono text-[10px] tracking-[0.15em] text-vermilion uppercase">
              E — ICP
            </span>
            <h3 className="text-title font-mincho">35 岁优化</h3>
            <p className="text-ink-secondary leading-relaxed">
              针对被裁中年人快速变现
            </p>
          </article>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-8 md:px-16">
        <Separator />
      </div>

      {/* 3 层定价入口 — 不对称 */}
      <section className="px-8 md:px-16 py-32 md:py-48 max-w-7xl mx-auto">
        <header className="max-w-prose mb-24 space-y-6">
          <span className="font-mono text-[10px] tracking-[0.15em] text-ink-tertiary uppercase">
            02 — 价格
          </span>
          <h2 className="text-display font-mincho">3 层</h2>
          <p className="text-ink-secondary text-lg leading-relaxed">
            免费试用 → 自动化搭建 → 定制陪跑
          </p>
        </header>

        <div className="grid grid-cols-12 gap-px bg-ink-line border border-ink-line">
          {/* Tier 1 */}
          <article className="col-span-12 md:col-span-4 bg-ink-bg p-12 space-y-6">
            <span className="font-mono text-[10px] tracking-[0.15em] text-ink-tertiary uppercase">
              Tier 1
            </span>
            <h3 className="text-title font-mincho">免费试用</h3>
            <div className="text-display font-mincho">¥0</div>
            <p className="text-ink-tertiary font-mono text-xs">永久免费</p>
            <ul className="text-sm text-ink-secondary space-y-2 pt-4">
              <li>— AI 问卷梳理可做项目</li>
              <li>— 5 状态机 Discovery</li>
              <li>— 5 章节品牌蓝图</li>
            </ul>
            <Button variant="ghost" size="lg" asChild className="pt-4">
              <Link href="/discovery">
                开始免费试用 →
              </Link>
            </Button>
          </article>

          {/* Tier 2 — 推荐（朱红强调） */}
          <article className="col-span-12 md:col-span-5 bg-ink-bg p-12 space-y-6 border-vermilion border">
            <span className="font-mono text-[10px] tracking-[0.15em] text-vermilion uppercase">
              Tier 2 · 推荐
            </span>
            <h3 className="text-title font-mincho">自动化搭建 + 运营</h3>
            <div className="text-display font-mincho">
              ¥999<span className="text-ink-secondary text-base">/月</span>
            </div>
            <p className="text-ink-tertiary font-mono text-xs">早鸟 ¥699 锁价 · 前 100</p>
            <ul className="text-sm text-ink-secondary space-y-2 pt-4">
              <li>— Tier 1 全部</li>
              <li>— 4 Agent 自动搭建</li>
              <li>— 1 人品牌网站 Pro</li>
              <li>— 5 维数据监控</li>
              <li>— 月度报告 + 推荐 15%</li>
            </ul>
            <Button variant="vermilion" size="lg" asChild className="pt-4">
              <Link href="/register?plan=tier2">
                ¥699 早鸟起步 →
              </Link>
            </Button>
          </article>

          {/* Tier 3 */}
          <article className="col-span-12 md:col-span-3 bg-ink-bg p-12 space-y-6">
            <span className="font-mono text-[10px] tracking-[0.15em] text-ink-tertiary uppercase">
              Tier 3
            </span>
            <h3 className="text-title font-mincho">定制陪跑</h3>
            <div className="text-title font-mincho">¥50,000</div>
            <p className="text-ink-tertiary font-mono text-xs">一次性 · 12 个月 1v1</p>
            <Button variant="ghost" size="lg" asChild className="pt-4">
              <Link href="/agents">联系顾问 →</Link>
            </Button>
          </article>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-8 md:px-16">
        <Separator />
      </div>

      {/* ICP 共情 — 引用块 */}
      <section className="px-8 md:px-16 py-32 md:py-48 max-w-5xl mx-auto">
        <blockquote className="border-l border-vermilion pl-12 space-y-8">
          <span className="font-mono text-[10px] tracking-[0.15em] text-vermilion uppercase">
            03 — ICP
          </span>
          <h2 className="text-display font-mincho leading-tight">
            写给 35 岁上下
            <br />
            被裁的你
          </h2>
          <div className="space-y-4 text-ink-secondary text-lg leading-loose max-w-prose">
            <p>我知道你现在的心情：</p>
            <ul className="space-y-2 list-none">
              <li>— 刚收到裁员通知（N+1 不够花）</li>
              <li>— 投了 200 份简历没回音</li>
              <li>— 35 岁焦虑 + 房贷 + 育儿</li>
              <li>— 想找新出路，但不知道做什么</li>
              <li>— 试过抖音/小红书/朋友圈卖货，0 收入</li>
            </ul>
          </div>
          <p className="text-ink-primary text-title font-mincho pt-8">
            ONE-MCN 不是帮你「找新工作」——
            <br />
            是帮你「成为自己的老板」。
          </p>
        </blockquote>
      </section>

      <div className="max-w-7xl mx-auto px-8 md:px-16">
        <Separator />
      </div>

      {/* Final CTA */}
      <section className="px-8 md:px-16 py-32 md:py-48 max-w-3xl mx-auto text-center">
        <h2 className="text-display font-mincho leading-tight mb-12">
          今天就开始
          <br />
          比明天多 24 小时
        </h2>
        <p className="text-ink-secondary leading-relaxed mb-16 max-w-prose mx-auto">
          免费 14 天试用 · 不需要信用卡 · 1 分钟跑通 Discovery 对话
        </p>
        <Button variant="vermilion" size="lg" asChild>
          <Link href="/discovery">
            免费试用 AI 问卷 →
          </Link>
        </Button>
      </section>

      {/* Footer */}
      <footer className="border-t border-ink-line py-16">
        <div className="max-w-7xl mx-auto px-8 md:px-16 flex flex-col md:flex-row justify-between gap-6">
          <p className="font-mono text-[10px] tracking-[0.15em] text-ink-tertiary uppercase">
            ONE-MCN · 一人公司 · vibcoding
          </p>
          <nav className="space-x-8 text-xs">
            <Link href="/pricing" className="text-ink-secondary hover:text-ink-primary transition-opacity duration-300">价格</Link>
            <Link href="/onboarding" className="text-ink-secondary hover:text-ink-primary transition-opacity duration-300">试用</Link>
            <Link href="/discovery" className="text-ink-secondary hover:text-ink-primary transition-opacity duration-300">Discovery</Link>
          </nav>
        </div>
      </footer>
    </main>
  );
}