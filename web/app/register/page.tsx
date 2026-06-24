/**
 * ONE-MCN Register · v5.5 Semi + Ma 哲学
 */
'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button, Input, Tag } from '@douyinfe/semi-ui';

const PLAN_LABELS: Record<string, { name: string; price: string }> = {
  tier1: { name: 'Tier 1 · 免费试用', price: '¥0' },
  tier2: { name: 'Tier 2 · 自动化搭建', price: '¥999/月' },
  tier3: { name: 'Tier 3 · 定制陪跑', price: '¥50,000' },
};

export default function RegisterPage() {
  const router = useRouter();
  const params = useSearchParams();
  const plan = params.get('plan') || 'tier1';
  const planInfo = PLAN_LABELS[plan] || PLAN_LABELS.tier1;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, plan }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || '注册失败');
        return;
      }
      localStorage.setItem('user_id', data.user.id);
      localStorage.setItem('tenant_id', data.user.tenant_id);
      localStorage.setItem('plan', plan);
      router.push(plan === 'tier1' ? '/onboarding' : '/dashboard?plan=' + plan);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-ink-bg text-ink-primary flex items-center">
      <div className="washi-texture" aria-hidden="true" />
      <article className="w-full max-w-prose mx-auto px-8 py-24 space-y-12 relative z-10">
        <header className="space-y-6">
          <Tag style={{ color: '#E05A47', borderColor: '#E05A47', background: 'transparent' }}>
            注册
          </Tag>
          <h1 className="text-display font-mincho">ONE-MCN</h1>
          <div className="flex items-center gap-3">
            <Tag style={{ color: '#7A7670', borderColor: '#2A2825', background: 'transparent' }}>
              {planInfo.name}
            </Tag>
            <span className="font-mono text-sm text-ink-secondary">{planInfo.price}</span>
          </div>
        </header>
        <div className="border-t border-ink-line" />
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-3">
            <label className="font-mono text-[10px] tracking-[0.15em] uppercase text-ink-secondary">
              邮箱
            </label>
            <Input
              value={email}
              onChange={(v) => setEmail(v)}
              type="email"
              size="large"
            />
          </div>
          <div className="space-y-3">
            <label className="font-mono text-[10px] tracking-[0.15em] uppercase text-ink-secondary">
              密码（≥12 字符）
            </label>
            <Input
              value={password}
              onChange={(v) => setPassword(v)}
              type="password"
              minLength={12}
              size="large"
            />
          </div>
          {error && <p className="font-mono text-xs" style={{ color: '#E05A47' }}>{error}</p>}
          <div className="pt-4 flex flex-col md:flex-row gap-6 items-start md:items-center">
            <Button htmlType="submit" type="warning" size="large" loading={loading}>
              开始 14 天试用 →
            </Button>
            <p className="text-ink-secondary text-sm">
              已有账号？
              <Link href="/login" className="ml-1" style={{ color: '#F0EDE6', borderBottom: '1px solid #F0EDE6' }}>
                登录
              </Link>
            </p>
          </div>
        </form>
      </article>
    </main>
  );
}