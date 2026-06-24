/**
 * ONE-MCN Discovery · v5.5 Semi + Ma 哲学
 * 5 状态机多轮对话
 */
'use client';

import { useEffect, useState } from 'react';
import { Button, Tag } from '@douyinfe/semi-ui';
import { Send } from 'lucide-react';

const STATES = ['opening', 'capability', 'need', 'direction', 'summary'];

export default function DiscoveryPage() {
  const [stateIdx, setStateIdx] = useState(0);
  const [messages, setMessages] = useState<{ role: 'ai' | 'user'; text: string }[]>([
    { role: 'ai', text: '你好，我是蕾姆。请先告诉我：你最想解决什么问题？' },
  ]);
  const [input, setInput] = useState('');
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function send() {
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
      setMessages([
        ...newMessages,
        { role: 'ai' as const, text: '收到。基于这个回答，你想做什么方向？' },
      ]);
      setStateIdx(nextIdx);
      setLoading(false);
    }, 600);
  }

  return (
    <main className="min-h-screen bg-ink-bg text-ink-primary relative">
      <div className="washi-texture" aria-hidden="true" />
      <div className="max-w-prose mx-auto px-6 md:px-8 py-24 md:py-32 relative z-10">
        <header className="space-y-6 mb-16">
          <Tag style={{ color: '#E05A47', borderColor: '#E05A47', background: 'transparent' }}>
            Stage 1
          </Tag>
          <h1 className="text-display font-mincho">Discovery 多轮对话</h1>
          <div className="flex gap-3 items-center">
            <span className="font-mono text-xs text-ink-secondary">
              状态: {STATES[stateIdx]} ({stateIdx + 1}/{STATES.length})
            </span>
          </div>
        </header>
        <div className="border-t border-ink-line mb-12" />
        <div className="space-y-8 min-h-[400px]">
          {messages.map((m, i) => (
            <article
              key={i}
              className={`border-l-2 pl-6 space-y-2 ${
                m.role === 'ai' ? 'border-ink-line' : 'border-vermilion'
              }`}
            >
              <span
                className={`font-mono text-[10px] tracking-[0.15em] uppercase ${
                  m.role === 'ai' ? 'text-ink-tertiary' : 'text-vermilion'
                }`}
              >
                {m.role === 'ai' ? '蕾姆' : '你'}
              </span>
              <p className="text-ink-primary leading-loose whitespace-pre-line">{m.text}</p>
            </article>
          ))}
        </div>
        <div className="border-t border-ink-line" />
        {!done ? (
          <div className="mt-12 flex gap-3 items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
              placeholder="回复蕾姆..."
              className="flex-1 bg-transparent border-b border-ink-line py-3 text-ink-primary placeholder:text-ink-tertiary focus:outline-none focus:border-ink-secondary transition-colors duration-300"
            />
            <Button type="primary" onClick={send} disabled={!input.trim() || loading}>
              <Send className="w-4 h-4 mr-2" />
              发送
            </Button>
          </div>
        ) : (
          <div className="mt-12">
            <Button type="warning" size="large" href="/register?plan=tier2">
              下一步：升级 Tier 2 启动 4 Agent →
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}