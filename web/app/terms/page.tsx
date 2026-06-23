/**
 * ONE-MCN Terms of Service
 * v5.4 japanese-ma-minimalism
 */
import Link from 'next/link';

export const metadata = {
  title: '服务条款 · ONE-MCN',
  description: '一人公司的服务条款',
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-ink-bg text-ink-primary">
      <article className="max-w-prose mx-auto px-8 py-24 md:py-48 space-y-16">
        <header className="space-y-6">
          <Link href="/" className="font-mono text-[10px] tracking-[0.15em] text-ink-tertiary uppercase hover:text-ink-primary">
            ← 返回
          </Link>
          <span className="font-mono text-[10px] tracking-[0.15em] text-vermilion uppercase">
            条款
          </span>
          <h1 className="text-display font-mincho">服务条款</h1>
          <p className="text-ink-tertiary font-mono text-xs">
            最后更新：2026-06-23
          </p>
        </header>

        <section className="space-y-8">
          <h2 className="text-title font-mincho">1. 订阅</h2>
          <p className="text-ink-secondary leading-loose">
            ONE-MCN 提供 3 层订阅：
            <br />
            — Tier 1 免费试用（永久免费，Discovery + 蓝图）
            <br />
            — Tier 2 ¥999/月（早鸟 ¥699 锁价，前 100 用户）+ 4 Agent
            <br />
            — Tier 3 ¥50,000 一次性（12 个月 1v1 顾问）
            <br />
            14 天免费试用，到期可续费。
          </p>
        </section>

        <section className="space-y-8">
          <h2 className="text-title font-mincho">2. 退款</h2>
          <p className="text-ink-secondary leading-loose">
            — Tier 2 月费：7 天内可全额退款
            <br />
            — Tier 3 一次性：30 天内可全额退款
            <br />
            — 退款后服务立即停止
            <br />
            申请退款：billing@one-mcn.local
          </p>
        </section>

        <section className="space-y-8">
          <h2 className="text-title font-mincho">3. 数据所有权</h2>
          <p className="text-ink-secondary leading-loose">
            你创建的所有内容（Discovery 对话、蓝图、4 Agent 产物）归你所有。
            ONE-MCN 仅作为工具提供存储和执行，不主张 IP。
          </p>
        </section>

        <section className="space-y-8">
          <h2 className="text-title font-mincho">4. 免责声明</h2>
          <p className="text-ink-secondary leading-loose">
            ONE-MCN 是工具，不保证商业结果。
            <br />
            4 Agent 的产出基于 AI 模型 + 你的输入，蕾姆不对其准确性负责。
            <br />
            你应自行审慎使用 AI 产出。
          </p>
        </section>

        <section className="space-y-8">
          <h2 className="text-title font-mincho">5. 服务变更</h2>
          <p className="text-ink-secondary leading-loose">
            ONE-MCN 保留随时变更服务的权利。
            <br />
            重大变更会提前 30 天通知。
            <br />
            争议按中国法律 + 北京仲裁委员会。
          </p>
        </section>

        <footer className="pt-16 border-t border-ink-line space-y-4">
          <Link href="/" className="font-mono text-[10px] tracking-[0.15em] text-ink-tertiary uppercase hover:text-ink-primary">
            ← 返回首页
          </Link>
          <p className="font-mono text-[10px] tracking-[0.15em] text-ink-tertiary uppercase">
            ONE-MCN · 一人公司 · 间
          </p>
        </footer>
      </article>
    </main>
  );
}