/**
 * ONE-MCN Login · v5.5 Semi + Ma 哲学
 */
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button, Input, Tag } from '@douyinfe/semi-ui';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || '登录失败');
        return;
      }
      localStorage.setItem('user_id', data.user_id);
      localStorage.setItem('tenant_id', data.tenant_id);
      router.push('/dashboard');
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
            登录
          </Tag>
          <h1 className="text-display font-mincho">欢迎回来</h1>
          <p className="text-ink-secondary">继续你的 1 人 MCN 业务。</p>
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
              密码
            </label>
            <Input
              value={password}
              onChange={(v) => setPassword(v)}
              type="password"
              size="large"
            />
          </div>
          {error && <p className="font-mono text-xs" style={{ color: '#E05A47' }}>{error}</p>}
          <div className="pt-4 flex flex-col md:flex-row gap-6 items-start md:items-center">
            <Button htmlType="submit" type="primary" size="large" loading={loading}>
              登录 →
            </Button>
            <p className="text-ink-secondary text-sm">
              没账号？
              <Link href="/register" className="ml-1" style={{ color: '#F0EDE6', borderBottom: '1px solid #F0EDE6' }}>
                注册
              </Link>
            </p>
          </div>
        </form>
      </article>
    </main>
  );
}