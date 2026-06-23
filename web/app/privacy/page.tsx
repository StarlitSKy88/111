/**
 * ONE-MCN Privacy Policy
 * v5.4 japanese-ma-minimalism
 */
import Link from 'next/link';

export const metadata = {
  title: '隐私政策 · ONE-MCN',
  description: '一人公司的隐私政策',
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-ink-bg text-ink-primary">
      <article className="max-w-prose mx-auto px-8 py-24 md:py-48 space-y-16">
        <header className="space-y-6">
          <Link href="/" className="font-mono text-[10px] tracking-[0.15em] text-ink-tertiary uppercase hover:text-ink-primary">
            ← 返回
          </Link>
          <span className="font-mono text-[10px] tracking-[0.15em] text-vermilion uppercase">
            隐私
          </span>
          <h1 className="text-display font-mincho">隐私政策</h1>
          <p className="text-ink-tertiary font-mono text-xs">
            最后更新：2026-06-23
          </p>
        </header>

        <section className="space-y-8">
          <h2 className="text-title font-mincho">1. 数据收集</h2>
          <p className="text-ink-secondary leading-loose">
            ONE-MCN 收集以下数据：
            <br />
            — 邮箱（用于登录 + 通知）
            <br />
            — 密码（bcrypt cost=12 哈希存储，原始密码不可逆）
            <br />
            — Discovery 多轮对话内容（用于生成个人品牌蓝图）
            <br />
            — 4 Agent 自动化产物（仅你和授权 Agent 可访问）
          </p>
        </section>

        <section className="space-y-8">
          <h2 className="text-title font-mincho">2. 数据存储</h2>
          <p className="text-ink-secondary leading-loose">
            数据存储在 PostgreSQL 16 数据库（带 RLS 多租户隔离）。
            <br />
            每日加密备份（openssl AES-256-CBC + PBKDF2），30 天滚动保留。
            <br />
            RLS 策略强制隔离：你的数据只能被你自己 + 你的 Agent 访问。
          </p>
        </section>

        <section className="space-y-8">
          <h2 className="text-title font-mincho">3. 数据删除</h2>
          <p className="text-ink-secondary leading-loose">
            你可以随时申请删除你的数据：
            <br />
            — 邮件 privacy@one-mcn.local 申请
            <br />
            — 我们会在 7 天内删除所有相关数据
            <br />
            — 备份数据会在 30 天滚动周期内自动清除
          </p>
        </section>

        <section className="space-y-8">
          <h2 className="text-title font-mincho">4. 第三方服务</h2>
          <p className="text-ink-secondary leading-loose">
            — Stripe（支付，PCI-DSS 合规）
            <br />
            — 微信支付 / 支付宝（支付，中国市场）
            <br />
            — OpenAI / Anthropic（4 Agent LLM 调用，仅 API key 配置）
            <br />
            — Resend / 腾讯云邮件推送（通知）
            <br />
            我们不向任何第三方出售你的数据。
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