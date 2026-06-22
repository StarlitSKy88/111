/**
 * ONE-MCN Register · v5.4 japanese-ma-minimalism（間）
 */
'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Loader2 } from 'lucide-react';

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
      <div className="w-full max-w-prose mx-auto px-8 py-24 space-y-12">
        <header className="space-y-6">
          <span className="font-mono text-[10px] tracking-[0.15em] text-vermilion uppercase">
            注册
          </span>
          <h1 className="text-display font-mincho">ONE-MCN</h1>
          <div className="flex items-center gap-3">
            <Badge variant="outline">{planInfo.name}</Badge>
            <span className="font-mono text-sm text-ink-secondary">{planInfo.price}</span>
          </div>
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
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-transparent border-ink-line"
            />
          </div>
          <div className="space-y-3">
            <Label htmlFor="password" className="font-mono text-[10px] tracking-[0.15em] uppercase">
              密码（≥12 字符）
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={12}
              className="bg-transparent border-ink-line"
            />
          </div>
          {error && <p className="font-mono text-xs text-vermilion">{error}</p>}
          <div className="pt-4 flex flex-col md:flex-row gap-6 items-start md:items-center">
            <Button type="submit" variant="vermilion" size="lg" disabled={loading}>
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>开始 14 天试用 →</>
              )}
            </Button>
            <p className="text-ink-secondary text-sm">
              已有账号？
              <Link href="/login" className="text-ink-primary border-b border-ink-primary ml-1">
                登录
              </Link>
            </p>
          </div>
        </form>
      </div>
    </main>
  );
}