/**
 * ONE-MCN Design Partner Onboarding 页面
 * v5.5 — Semi Design + Ma 哲学
 * 6 步：欢迎 → 注册 → Discovery(用户回答) → 蓝图 → 4 Agent → Dashboard
 *
 * 策略：只使用确认存在的 Semi 组件（Button/Input/TextArea/Tag）
 * 其他用 HTML + Ma 哲学 className
 */
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, TextArea, Tag } from '@douyinfe/semi-ui';
import { Loader2 } from 'lucide-react';

type Step = 1 | 2 | 3 | 4 | 5 | 6;

const STEPS = [
  { num: 1, label: '欢迎' },
  { num: 2, label: '注册' },
  { num: 3, label: 'Discovery' },
  { num: 4, label: '蓝图' },
  { num: 5, label: '4 Agent' },
  { num: 6, label: '试用' },
];

const QUESTIONS = [
  { key: 'opening', question: 'Q1 · 你过去做过什么最有成就感的事？', placeholder: '例如：做过 3 个 SaaS / 帮朋友开咖啡店 / 写过小说...' },
  { key: 'capability', question: 'Q2 · 你的核心技能可以用 3 个词形容吗？', placeholder: '例如：产品 / 数据 / 内容' },
  { key: 'need', question: 'Q3 · 现在最想解决什么问题？', placeholder: '例如：想搞副业 / 想建个人品牌 / 想月入 5 万' },
  { key: 'direction', question: 'Q4 · 如果今天只能做 1 件事，你会做什么？', placeholder: '例如：用 AI 帮中小企业做营销' },
  { key: 'summary', question: 'Q5 · 你愿意为这件事每天花多少时间？', placeholder: '例如：30 分钟 / 2 小时 / 全职' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userId, setUserId] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [currentQ, setCurrentQ] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState('');
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
      const r = await fetch('http://localhost:3000/api/discovery/start', { method: 'POST' });
      const data = await r.json();
      setSessionId(data.session_id);
      setCurrentQ(0);
      setCurrentAnswer('');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function submitAnswer() {
    if (!currentAnswer.trim() || loading) return;
    setLoading(true);
    try {
      const r = await fetch('http://localhost:3000/api/discovery/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, message: currentAnswer }),
      });
      const data = await r.json();
      setCurrentAnswer('');
      if (data.completed || data.state === 'complete' || data.state === 'summary') {
        const finalR = await fetch(`http://localhost:3000/api/discovery/session/${sessionId}`);
        const finalData = await finalR.json();
        setBlueprint(finalData);
        setStep(4);
      } else {
        setCurrentQ(currentQ + 1);
      }
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
      <div className="washi-texture" aria-hidden="true" />
      <div className="max-w-prose mx-auto px-8 py-24 space-y-16 relative z-10">
        {/* 进度条 */}
        <div>
          <div className="progress-ma mb-6">
            <div className="progress-ma-fill" style={{ width: `${progress}%` }} />
          </div>
          <div className="grid grid-cols-6 gap-2">
            {STEPS.map((s) => (
              <div key={s.num} className="text-center">
                <span
                  className={`block font-mono text-[10px] tracking-[0.15em] mb-1 ${
                    step >= s.num ? 'text-ink-primary' : 'text-ink-tertiary'
                  }`}
                >
                  0{s.num}
                </span>
                <span
                  className={`block text-[10px] uppercase tracking-[0.05em] ${
                    step >= s.num ? 'text-ink-primary' : 'text-ink-tertiary'
                  }`}
                >
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: 欢迎 */}
        {step === 1 && (
          <section className="space-y-12">
            <header className="space-y-6">
              <Tag style={{ color: '#E05A47', borderColor: '#E05A47', background: 'transparent' }}>
                00 — 欢迎
              </Tag>
              <h1 className="text-display font-mincho">14 天试用</h1>
              <p className="text-ink-secondary leading-relaxed max-w-prose">
                蕾姆将陪你完成 5 个真实问题，生成 5 章节品牌蓝图。
                <br />
                不是模拟，是真做。
              </p>
            </header>
            <div className="border-t border-ink-line" />
            <ul className="space-y-2 text-ink-secondary text-sm">
              <li>— 注册 1 分钟</li>
              <li>— Discovery 5 个问题 5 分钟</li>
              <li>— 蓝图生成 30 秒</li>
              <li>— 试用 14 天</li>
            </ul>
            <Button type="primary" size="large" onClick={() => setStep(2)}>
              开始 →
            </Button>
          </section>
        )}

        {/* Step 2: 注册 */}
        {step === 2 && (
          <section className="space-y-12">
            <header className="space-y-6">
              <Tag style={{ color: '#E05A47', borderColor: '#E05A47', background: 'transparent' }}>
                01 — 注册
              </Tag>
              <h1 className="text-display font-mincho">1 分钟</h1>
              <p className="text-ink-secondary">邮箱 + 密码（≥12 字符）</p>
            </header>
            <div className="border-t border-ink-line" />
            <form onSubmit={handleRegister} className="space-y-8">
              <div className="space-y-3">
                <label className="font-mono text-[10px] tracking-[0.15em] uppercase text-ink-secondary">
                  邮箱
                </label>
                <Input
                  value={email}
                  onChange={(v) => setEmail(v)}
                  type="email"
                  required
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
                  required
                  minLength={12}
                  size="large"
                />
                <p className="text-xs text-ink-tertiary">12 字符以上</p>
              </div>
              {error && (
                <p className="font-mono text-xs" style={{ color: '#E05A47' }}>
                  {error}
                </p>
              )}
              <Button htmlType="submit" type="primary" size="large" loading={loading}>
                创建账号
              </Button>
            </form>
          </section>
        )}

        {/* Step 3: Discovery — 用户手动回答 5 问题 */}
        {step === 3 && (
          <section className="space-y-12">
            <header className="space-y-6">
              <Tag style={{ color: '#E05A47', borderColor: '#E05A47', background: 'transparent' }}>
                02 — Discovery
              </Tag>
              <h1 className="text-display font-mincho">5 个真实问题</h1>
              <p className="text-ink-secondary leading-relaxed max-w-prose">
                不是 mock，是您的真实回答。
                <br />
                蕾姆会基于这 5 个回答生成 5 章节蓝图。
              </p>
            </header>
            <div className="border-t border-ink-line" />

            {!sessionId ? (
              <div className="space-y-6">
                <p className="text-ink-secondary">点击开始，启动 Discovery session。</p>
                <Button type="primary" size="large" onClick={startDiscovery} loading={loading}>
                  开始 Discovery
                </Button>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="flex items-baseline justify-between">
                  <span className="font-mono text-[10px] tracking-[0.15em] text-ink-tertiary uppercase">
                    问题 {currentQ + 1} / {QUESTIONS.length}
                  </span>
                  <span className="font-mono text-xs" style={{ color: '#E05A47' }}>
                    {Math.round((currentQ / QUESTIONS.length) * 100)}%
                  </span>
                </div>
                <div className="space-y-4">
                  <h2 className="text-title font-mincho">{QUESTIONS[currentQ].question}</h2>
                  <TextArea
                    value={currentAnswer}
                    onChange={(v) => setCurrentAnswer(v)}
                    placeholder={QUESTIONS[currentQ].placeholder}
                    rows={4}
                    autosize
                  />
                </div>
                <div className="flex gap-4 items-center">
                  <Button
                    type="primary"
                    size="large"
                    onClick={submitAnswer}
                    loading={loading}
                    disabled={!currentAnswer.trim()}
                  >
                    {currentQ < QUESTIONS.length - 1 ? '下一题 →' : '生成蓝图'}
                  </Button>
                  <span className="font-mono text-xs text-ink-tertiary">Enter 提交</span>
                </div>
              </div>
            )}
            {error && <p className="font-mono text-xs" style={{ color: '#E05A47' }}>{error}</p>}
          </section>
        )}

        {/* Step 4: 蓝图 */}
        {step === 4 && (
          <section className="space-y-12">
            <header className="space-y-6">
              <Tag style={{ color: '#E05A47', borderColor: '#E05A47', background: 'transparent' }}>
                03 — 蓝图
              </Tag>
              <h1 className="text-display font-mincho">5 章节</h1>
              <p className="text-ink-secondary">基于您的真实回答</p>
            </header>
            <div className="border-t border-ink-line" />
            <div className="space-y-12">
              {blueprint?.blueprint_sections?.map((s: any, i: number) => (
                <article
                  key={i}
                  className="border-l-2 pl-6 space-y-2"
                  style={{ borderColor: '#E05A47' }}
                >
                  <h3 className="text-title font-mincho">{s.title}</h3>
                  <p className="text-ink-secondary leading-relaxed">{s.content}</p>
                </article>
              ))}
            </div>
            <Button type="primary" size="large" onClick={() => setStep(5)}>
              激活 4 Agent →
            </Button>
          </section>
        )}

        {/* Step 5: 4 Agent */}
        {step === 5 && (
          <section className="space-y-12">
            <header className="space-y-6">
              <Tag style={{ color: '#E05A47', borderColor: '#E05A47', background: 'transparent' }}>
                04 — 4 Agent
              </Tag>
              <h1 className="text-display font-mincho">已激活</h1>
              <p className="text-ink-secondary leading-relaxed max-w-prose">
                Content / Acquisition / Delivery / Support 4 Agent 将在试用期内持续工作。
              </p>
            </header>
            <div className="border-t border-ink-line" />
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
            <Button type="primary" size="large" onClick={() => setStep(6)}>
              进入试用 Dashboard →
            </Button>
          </section>
        )}

        {/* Step 6: 试用 */}
        {step === 6 && (
          <section className="space-y-12">
            <header className="space-y-6">
              <Tag style={{ color: '#E05A47', borderColor: '#E05A47', background: 'transparent' }}>
                05 — 试用
              </Tag>
              <h1 className="text-display font-mincho">14 天</h1>
              <p className="text-ink-secondary leading-relaxed max-w-prose">
                每天 30 分钟，每天告诉我们一次反馈。
              </p>
            </header>
            <div className="border-t border-ink-line" />
            <div className="space-y-12">
              <div className="space-y-4">
                <h2 className="font-mono text-[10px] tracking-[0.15em] uppercase text-ink-secondary">
                  试用倒计时
                </h2>
                <div className="text-hero font-mincho text-ink-primary">14 天</div>
                <p className="text-ink-secondary">到期前 3 天提醒 · 到期不强转</p>
              </div>
              <div className="space-y-4">
                <label className="font-mono text-[10px] tracking-[0.15em] uppercase text-ink-secondary">
                  今日反馈（30 秒）
                </label>
                <TextArea
                  value={dailyFeedback}
                  onChange={(v) => setDailyFeedback(v)}
                  placeholder="今天用了什么功能？感觉如何？最大疑问是什么？"
                  rows={4}
                />
                <Button
                  onClick={submitDailyFeedback}
                  disabled={!dailyFeedback.trim()}
                  size="large"
                >
                  提交今日反馈
                </Button>
              </div>
            </div>
            <div className="pt-8">
              <Button onClick={() => router.push('/dashboard')}>进入完整 Dashboard</Button>
            </div>
          </section>
        )}

        <footer className="pt-16 border-t border-ink-line">
          <p className="font-mono text-[10px] tracking-[0.15em] text-ink-tertiary uppercase">
            Rem · 一人公司 · v5.5 Semi + Ma
          </p>
        </footer>
      </div>
    </main>
  );
}