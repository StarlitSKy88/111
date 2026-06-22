/**
 * ONE-MCN Web · 注册页
 * v5.2 — 支持价格弹性测试（5 个价格预选）
 */
'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 价格弹性测试（5 个价格预选，来自 URL ?plan=199/499/999/1499/2999）
  const plan = params.get('plan') || '999';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || '注册失败');
        return;
      }
      // 注册成功 → 跳转到 dashboard
      localStorage.setItem('user_id', data.user.id);
      localStorage.setItem('tenant_id', data.user.tenant_id);
      localStorage.setItem('plan', plan);
      router.push('/dashboard?plan=' + plan);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-orange-50">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-3xl font-bold mb-6 text-center">注册 ONE-MCN</h1>
        <p className="text-sm text-gray-500 text-center mb-6">
          14 天免费试用 · 选 ¥{plan}/月 计划
        </p>
        <input
          type="email"
          placeholder="邮箱"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-4 py-3 border rounded-lg mb-3"
        />
        <input
          type="password"
          placeholder="密码（≥12 字符）"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={12}
          className="w-full px-4 py-3 border rounded-lg mb-3"
        />
        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-3 rounded-lg disabled:opacity-50"
        >
          {loading ? '注册中...' : '开始 14 天试用'}
        </button>
        <p className="text-center text-sm mt-4 text-gray-500">
          已有账号？<a href="/login" className="text-brand-500 underline">登录</a>
        </p>
      </form>
    </main>
  );
}