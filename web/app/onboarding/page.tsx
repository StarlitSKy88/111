/**
 * ONE-MCN Design Partner Onboarding 页面
 * v5.4 japanese-ma-minimalism（間）
 * 6 步：欢迎 → 注册 → Discovery → 蓝图 → 4 Agent → Dashboard
 * 墨色基底 · 1px hairline · 文字 CTA · 零 emoji · 零药丸
 */
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Loader2, ArrowRight } from 'lucide-react';

type Step = 1 | 2 | 3 | 4 | 5 | 6;

const STEPS = [
  { num: 1, label: '欢迎', duration: '30秒' },
  { num: 2, label: '注册', duration: '1分钟' },
  { num: 3, label: 'Discovery', duration: '5分钟' },
  { num: 4, label: '蓝图', duration: '30秒' },
  { num: 5, label: '4 Agent', duration: '1分钟' },
  { num: 6, label: '试用', duration: '14天' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userId, setUserId] = useState('');
  const [blueprint, setBlueprint] = useState<any>(null);
  const [dailyFeedback, setDailyFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const progress = (step / 6) * 100;

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, plan: 'tier1' }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || '注册失败');
        return;
      }
      setUserId(data.user.id);
      localStorage.setItem('user_id', data.user.id);
      localStorage.setItem('tenant_id', data.user.tenant_id);

      await fetch('http://localhost:3000/api/onboarding/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: data.user.id, email }),
      });
      setStep(3);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function startDiscovery() {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3000/api/discovery/start', { method: 'POST' });
      const data = await res.json();
      const messages = [
        '我有 10 年产品经理经验，做过 3 个 SaaS',
        '想做个人品牌，但没方向',
        '希望在朋友圈变现',
        '愿意每周发 1 篇深度文章',
        '目标 6 个月内月入 ¥50000',
      ];
      for (const msg of messages) {
        await fetch('http://localhost:3000/api/discovery/message', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ session_id: data.session_id, message: msg }),
        });
      }
      const finalRes = await fetch(`http://localhost:3000/api/discovery/session/${data.session_id}`);
      const finalData = await finalRes.json();
      setBlueprint(finalData);
      setStep(4);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function submitDailyFeedback() {
    if (!dailyFeedback.trim()) return;
    setLoading(true);
    try {
      await fetch('http://localhost:3000/api/onboarding/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          feedback_type: 'daily',
          content: dailyFeedback,
        }),
      });
      setDailyFeedback('');
      alert('感谢反馈');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-ink-bg text-ink-primary relative">
      <div className="max-w-prose mx-auto px-8 py-24">
        {/* 进度条 — 1px hairline */}
        <div className="mb-16">
          <Progress value={progress} className="mb-8" />
          <div className="flex justify-between items-baseline">
            {STEPS.map((s) => (
              <div key={s.num} className="flex flex-col gap-1">
                <span
                  className={`font-mono text-[10px] tracking-[0.15em] ${
                    step >= s.num ? 'text-ink-primary' : 'text-ink-tertiary'
                  }`}
                >
                  0{s.num}
                </span>
                <span
                  className={`text-xs uppercase tracking-[0.08em] ${
                    step >= s.num ? 'text-ink-primary' : 'text-ink-tertiary'
                  }`}
                >
                  {s.label}
                </span>
                <span className="font-mono text-[10px] text-ink-tertiary">
                  {s.duration}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: 欢迎 */}
        {step === 1 && (
          <section className="space-y-12">
            <header className="space-y-6">
              <span className="font-mono text-[10px] tracking-[0.15em] text-vermilion uppercase">
                00 — 欢迎
              </span>
              <h1 className="text-display font-mincho">
                Design Partner
              </h1>
              <p className="text-ink-secondary max-w-prose leading-relaxed">
                14 天免费试用 + 1v1 反馈通道。
                <br />
                不是工具，是合伙人。
              </p>
            </header>

            <Separator />

            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-xs font-mono tracking-[0.15em] uppercase text-ink-secondary">
                  你将获得
                </h2>
                <ul className="space-y-2 text-ink-primary">
                  <li>— 14 天全功能免费试用（价值 ¥999/月）</li>
                  <li>— 1v1 优化你的个人品牌蓝图</li>
                  <li>— 终身 8 折优惠（如果产品上线）</li>
                </ul>
              </div>

              <div className="space-y-4">
                <h2 className="text-xs font-mono tracking-[0.15em] uppercase text-ink-secondary">
                  你的投入
                </h2>
                <ul className="space-y-2 text-ink-secondary">
                  <li>— 每天 30 分钟试用</li>
                  <li>— 每周 1 次 30 分钟 1v1 反馈</li>
                  <li>— 14 天后告诉我：愿不愿每月付 ¥999 继续用？</li>
                </ul>
              </div>
            </div>

            <div className="pt-8">
              <Button variant="primary" size="lg" onClick={() => setStep(2)}>
                我准备好了
                <ArrowRight className="ml-3 w-4 h-4" />
              </Button>
            </div>
          </section>
        )}

        {/* Step 2: 注册 */}
        {step === 2 && (
          <section className="space-y-12">
            <header className="space-y-6">
              <span className="font-mono text-[10px] tracking-[0.15em] text-vermilion uppercase">
                01 — 注册
              </span>
              <h1 className="text-display font-mincho">1 分钟</h1>
              <p className="text-ink-secondary">邮箱 + 密码即可</p>
            </header>

            <Separator />

            <form onSubmit={handleRegister} className="space-y-8">
              <div className="space-y-3">
                <Label htmlFor="email" className="text-xs font-mono tracking-[0.15em] uppercase">
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
                <Label htmlFor="password" className="text-xs font-mono tracking-[0.15em] uppercase">
                  密码
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
              {error && (
                <p className="font-mono text-xs text-vermilion">{error}</p>
              )}
              <div className="pt-4">
                <Button type="submit" variant="primary" size="lg" disabled={loading}>
                  {loading ? (
                    <Loader2 className="animate-spin w-4 h-4" />
                  ) : (
                    <>
                      创建账号 + 启动 14 天试用
                      <ArrowRight className="ml-3 w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </section>
        )}

        {/* Step 3: Discovery */}
        {step === 3 && (
          <section className="space-y-12">
            <header className="space-y-6">
              <span className="font-mono text-[10px] tracking-[0.15em] text-vermilion uppercase">
                02 — Discovery
              </span>
              <h1 className="text-display font-mincho">5 轮对话</h1>
              <p className="text-ink-secondary max-w-prose">
                5 状态机自动推进：opening → capability → need → direction → summary
              </p>
            </header>

            <Separator />

            <div className="space-y-6">
              <h2 className="text-xs font-mono tracking-[0.15em] uppercase text-ink-secondary">
                系统将自动完成 5 轮示例对话
              </h2>
              <ol className="space-y-3 text-ink-primary list-none">
                {[
                  '"我有 10 年产品经理经验，做过 3 个 SaaS"',
                  '"想做个人品牌，但没方向"',
                  '"希望在朋友圈变现"',
                  '"愿意每周发 1 篇深度文章"',
                  '"目标 6 个月内月入 ¥50000"',
                ].map((m, i) => (
                  <li key={i} className="border-l border-ink-line pl-6 font-gothic">
                    <span className="font-mono text-[10px] tracking-[0.15em] text-ink-tertiary mr-4">
                      0{i + 1}
                    </span>
                    {m}
                  </li>
                ))}
              </ol>
            </div>

            <div className="pt-4">
              <Button onClick={startDiscovery} variant="primary" size="lg" disabled={loading}>
                {loading ? (
                  <Loader2 className="animate-spin w-4 h-4" />
                ) : (
                  <>
                    开始 Discovery
                    <ArrowRight className="ml-3 w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </section>
        )}

        {/* Step 4: 蓝图 */}
        {step === 4 && (
          <section className="space-y-12">
            <header className="space-y-6">
              <span className="font-mono text-[10px] tracking-[0.15em] text-vermilion uppercase">
                03 — 蓝图
              </span>
              <h1 className="text-display font-mincho">已生成</h1>
              <p className="text-ink-secondary">5 章节 · 可读可执行</p>
            </header>

            <Separator />

            <div className="space-y-8">
              {blueprint?.blueprint_sections?.length > 0 ? (
                blueprint.blueprint_sections.map((s: any, i: number) => (
                  <article key={i} className="border-l border-vermilion pl-6 space-y-2">
                    <h3 className="font-mono text-[10px] tracking-[0.15em] text-ink-tertiary uppercase">
                      0{i + 1}
                    </h3>
                    <h2 className="text-title font-mincho">{s.title}</h2>
                    <p className="text-ink-secondary leading-relaxed">{s.content}</p>
                  </article>
                ))
              ) : (
                <p className="text-ink-tertiary font-mono text-xs">蓝图生成中…</p>
              )}
            </div>

            <div className="pt-4">
              <Button onClick={() => setStep(5)} variant="primary" size="lg">
                激活 4 Agent
                <ArrowRight className="ml-3 w-4 h-4" />
              </Button>
            </div>
          </section>
        )}

        {/* Step 5: 4 Agent */}
        {step === 5 && (
          <section className="space-y-12">
            <header className="space-y-6">
              <span className="font-mono text-[10px] tracking-[0.15em] text-vermilion uppercase">
                04 — 4 Agent
              </span>
              <h1 className="text-display font-mincho">已激活</h1>
              <p className="text-ink-secondary">全权自动执行 + weekly review</p>
            </header>

            <Separator />

            <div className="space-y-6">
              {[
                { name: 'Content', desc: '每天 5+ 条内容自动产出' },
                { name: 'Acquisition', desc: '每天 50+ 触达 + 复购' },
                { name: 'Delivery', desc: '订单响应 < 1h' },
                { name: 'Support', desc: '7×24 自动回复' },
              ].map((a) => (
                <div key={a.name} className="grid grid-cols-12 gap-6 py-4 border-t border-ink-line">
                  <div className="col-span-3 font-mono text-[10px] tracking-[0.15em] text-ink-secondary uppercase">
                    {a.name}
                  </div>
                  <div className="col-span-9 text-ink-primary">{a.desc}</div>
                </div>
              ))}
            </div>

            <div className="pt-4">
              <Button onClick={() => setStep(6)} variant="primary" size="lg">
                进入试用 Dashboard
                <ArrowRight className="ml-3 w-4 h-4" />
              </Button>
            </div>
          </section>
        )}

        {/* Step 6: 试用 Dashboard */}
        {step === 6 && (
          <section className="space-y-12">
            <header className="space-y-6">
              <span className="font-mono text-[10px] tracking-[0.15em] text-vermilion uppercase">
                05 — 试用
              </span>
              <h1 className="text-display font-mincho">14 天</h1>
              <p className="text-ink-secondary max-w-prose">
                每天花 30 分钟，每天告诉我们一次反馈
              </p>
            </header>

            <Separator />

            <div className="space-y-12">
              <div className="space-y-4">
                <h2 className="font-mono text-[10px] tracking-[0.15em] uppercase text-ink-secondary">
                  试用倒计时
                </h2>
                <div className="text-hero font-mincho text-ink-primary">14 天</div>
                <p className="text-ink-secondary">
                  到期前 3 天提醒 · 到期可续 8 折
                </p>
              </div>

              <div className="space-y-4">
                <Label htmlFor="feedback" className="font-mono text-[10px] tracking-[0.15em] uppercase">
                  今日反馈（30 秒）
                </Label>
                <textarea
                  id="feedback"
                  value={dailyFeedback}
                  onChange={(e) => setDailyFeedback(e.target.value)}
                  placeholder="今天用了什么功能？感觉如何？最大疑问是什么？"
                  rows={4}
                  className="flex min-h-[96px] w-full bg-ink-surface border border-ink-line px-4 py-3 text-sm text-ink-primary placeholder:text-ink-tertiary focus:outline-none focus:border-ink-secondary"
                />
                <Button
                  onClick={submitDailyFeedback}
                  disabled={loading || !dailyFeedback.trim()}
                  variant="outline"
                  size="lg"
                >
                  提交今日反馈
                </Button>
              </div>

              <div className="space-y-4 pt-8 border-t border-ink-line">
                <h2 className="font-mono text-[10px] tracking-[0.15em] uppercase text-ink-secondary">
                  试用期内每周任务
                </h2>
                <ul className="space-y-2 text-ink-secondary">
                  <li>— 每周一查看自动生成的周报告</li>
                  <li>— 每周 1 次 30 分钟 1v1 视频反馈</li>
                  <li>— 14 天后给一个明确答案：愿不愿每月付 ¥999 继续用？</li>
                </ul>
              </div>
            </div>

            <div className="pt-8">
              <Button onClick={() => router.push('/dashboard')} variant="ghost">
                进入完整 Dashboard
              </Button>
            </div>
          </section>
        )}

        <footer className="mt-32 pt-8 border-t border-ink-line">
          <p className="font-mono text-[10px] tracking-[0.15em] text-ink-tertiary uppercase">
            Rem · 一人公司 · 14 天试用
          </p>
        </footer>
      </div>
    </main>
  );
}