/**
 * ONE-MCN Discovery · v5.4 japanese-ma-minimalism（間）
 * 5 状态机多轮对话 · 墨色基底 · 1px hairline · 文字 CTA · 零 emoji
 */
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Loader2, Send } from 'lucide-react';

const STATES = ['opening', 'capability', 'need', 'direction', 'summary'];

const QUESTIONS: Record<string, string[]> = {
  opening: [
    '你好，我是蕾姆，你的 ONE-MCN AI 合伙人。\n\n请先告诉我：你想通过短视频或 OPC 做什么？',
  ],
  capability: [
    '好的。\n\n你过去做过什么最有成就感的事？',
    '你的核心技能是什么？可以用 3 个词形容吗？',
  ],
  need: [
    '现在最需要解决什么问题？',
    '你理想中的「成功」是什么样的？',
  ],
  direction: [
    '如果你今天只能做 1 件事，你会做什么？',
    '你愿意为这件事每天花多少时间？',
  ],
  summary: [
    '好的，我正在生成你的品牌蓝图……',
    '蓝图已生成。5 个章节详见下方。',
  ],
};

export default function DiscoveryPage() {
  const [stateIdx, setStateIdx] = useState(0);
  const [messages, setMessages] = useState<{ role: 'ai' | 'user'; text: string }[]>([
    { role: 'ai', text: QUESTIONS.opening[0] },
  ]);
  const [input, setInput] = useState('');
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const send = async () => {
    if (!input.trim() || loading) return;
    const newMessages = [...messages, { role: 'user' as const, text: input }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    setTimeout(() => {
      const nextIdx = stateIdx + 1;
      if (nextIdx >= STATES.length) {
        setDone(true);
        setLoading(false);
        return;
      }
      const q =
        QUESTIONS[STATES[nextIdx]]?.[Math.floor(Math.random() * 2)] || '继续……';
      setMessages([...newMessages, { role: 'ai' as const, text: q }]);
      setStateIdx(nextIdx);
      setLoading(false);
    }, 800);
  };

  return (
    <main className="min-h-screen bg-ink-bg text-ink-primary">
      <div className="px-8 md:px-16 py-24 md:py-32 max-w-prose mx-auto">
        <header className="space-y-6 mb-16">
          <span className="font-mono text-[10px] tracking-[0.15em] text-vermilion uppercase">
            Stage 1 — Discovery
          </span>
          <h1 className="text-display font-mincho">多轮 AI 对话</h1>
          <p className="text-ink-secondary">
            <span className="font-mono text-xs">
              状态：{STATES[stateIdx]} ({stateIdx + 1}/{STATES.length})
            </span>
          </p>
        </header>

        <Separator />

        {/* 对话区 */}
        <div className="my-16 space-y-12 min-h-[480px]">
          {messages.map((m, i) => (
            <article
              key={i}
              className={`grid grid-cols-12 gap-6 ${
                m.role === 'ai' ? 'border-l border-ink-line pl-8' : 'border-l border-vermilion pl-8'
              }`}
            >
              <span
                className={`col-span-2 font-mono text-[10px] tracking-[0.15em] uppercase ${
                  m.role === 'ai' ? 'text-ink-tertiary' : 'text-vermilion'
                }`}
              >
                {m.role === 'ai' ? '蕾姆' : '你'}
              </span>
              <p className="col-span-10 text-ink-primary leading-loose whitespace-pre-line">
                {m.text}
              </p>
            </article>
          ))}
          {loading && (
            <div className="grid grid-cols-12 gap-6 border-l border-ink-line pl-8">
              <span className="col-span-2 font-mono text-[10px] tracking-[0.15em] uppercase text-ink-tertiary">
                蕾姆
              </span>
              <Loader2 className="col-span-10 w-4 h-4 animate-spin text-ink-secondary" />
            </div>
          )}

          {done && (
            <section className="border border-vermilion p-12 space-y-8 mt-16">
              <span className="font-mono text-[10px] tracking-[0.15em] text-vermilion uppercase">
                蓝图 · 5 章节
              </span>
              <ol className="space-y-6">
                {[
                  { title: '品牌定位', desc: '基于你的能力' },
                  { title: '目标受众', desc: '你的 ICP' },
                  { title: '内容策略', desc: '每周 4 条短视频' },
                  { title: '变现路径', desc: 'Tier 2 ¥999/月 + 推荐 15%' },
                  { title: '里程碑', desc: '30 / 60 / 90 天目标' },
                ].map((s, i) => (
                  <li key={i} className="border-l border-vermilion pl-6">
                    <span className="font-mono text-[10px] tracking-[0.15em] text-ink-tertiary mr-4">
                      0{i + 1}
                    </span>
                    <span className="font-mincho text-title">{s.title}</span>
                    <span className="text-ink-secondary ml-4">— {s.desc}</span>
                  </li>
                ))}
              </ol>
            </section>
          )}
        </div>

        <Separator />

        {!done ? (
          <div className="mt-16 space-y-6">
            <span className="font-mono text-[10px] tracking-[0.15em] text-ink-tertiary uppercase">
              回复蕾姆
            </span>
            <div className="flex gap-6 items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && send()}
                placeholder="输入你的回复…"
                className="flex-1 bg-transparent border-b border-ink-line py-3 text-ink-primary placeholder:text-ink-tertiary focus:outline-none focus:border-ink-secondary transition-colors duration-300"
              />
              <Button onClick={send} variant="ghost" size="lg" disabled={!input.trim() || loading}>
                <Send className="w-4 h-4 mr-2" />
                发送
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-16">
            <Button variant="vermilion" size="lg" asChild>
              <Link href="/register?plan=tier2">
                下一步：升级 Tier 2 启动 4 Agent →
              </Link>
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}