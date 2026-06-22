/**
 * ONE-MCN Login · v5.4 japanese-ma-minimalism（間）
 * 暖墨色 · 1px hairline · 文字 CTA
 */
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Loader2 } from 'lucide-react';

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
      <div className="w-full max-w-prose mx-auto px-8 py-24 space-y-12">
        <header className="space-y-6">
          <span className="font-mono text-[10px] tracking-[0.15em] text-vermilion uppercase">
            登录
          </span>
          <h1 className="text-display font-mincho">
            欢迎回来
          </h1>
          <p className="text-ink-secondary leading-relaxed">
            继续你的 1 人 MCN 业务。
          </p>
        </header>

        <Separator />

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-3">
            <Label htmlFor="email" className="font-mono text-[10px] tracking-[0.15em] uppercase">
              邮箱
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-transparent border-ink-line"
            />
          </div>
          <div className="space-y-3">
            <Label htmlFor="password" className="font-mono text-[10px] tracking-[0.15em] uppercase">
              密码
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-transparent border-ink-line"
            />
          </div>
          {error && <p className="font-mono text-xs text-vermilion">{error}</p>}
          <div className="pt-4 flex flex-col md:flex-row gap-6 items-start md:items-center">
            <Button type="submit" variant="primary" size="lg" disabled={loading}>
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>登录 →</>
              )}
            </Button>
            <p className="text-ink-secondary text-sm">
              没账号？
              <Link href="/register" className="text-ink-primary border-b border-ink-primary ml-1">
                注册
              </Link>
            </p>
          </div>
        </form>
      </div>
    </main>
  );
}