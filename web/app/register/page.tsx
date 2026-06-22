'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const params = useSearchParams();
  const plan = params.get('plan') || 'tier1'; // tier1 / tier2 / tier3

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const planLabels: Record<string, { name: string; price: string }> = {
    tier1: { name: 'Tier 1 · 免费试用', price: '¥0' },
    tier2: { name: 'Tier 2 · 自动化搭建', price: '¥499 + ¥999/月' },
    tier3: { name: 'Tier 3 · 定制陪跑', price: '¥1万-5万' },
  };
  const planInfo = planLabels[plan] || planLabels.tier1;

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
      router.push(plan === 'tier1' ? '/discovery' : '/dashboard?plan=' + plan);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-orange-50 px-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <Sparkles className="h-8 w-8 text-brand-500 mx-auto mb-2" />
          <CardTitle className="text-2xl">注册 ONE-MCN</CardTitle>
          <CardDescription>
            <Badge variant="default" className="mt-2">
              {planInfo.name} · {planInfo.price}
            </Badge>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">邮箱</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">密码（≥12 字符）</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={12}
              />
            </div>
            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}
            <Button type="submit" disabled={loading} className="w-full" size="lg">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  注册中...
                </>
              ) : (
                '开始 14 天试用'
              )}
            </Button>
            <p className="text-center text-sm text-gray-500">
              已有账号？<Link href="/login" className="text-brand-500 underline">登录</Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}