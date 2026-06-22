'use client';
import { useState } from 'react';

/**
 * ONE-MCN Discovery 多轮对话 UI
 * v5.2 — 5 状态机（opening/capability/need/direction/summary）
 */
const STATES = ['opening', 'capability', 'need', 'direction', 'summary'];

const QUESTIONS: Record<string, string[]> = {
  opening: ['你好！我是蕾姆，你的 ONE-MCN AI 合伙人。请先告诉我：你想通过短视频或 OPC 做什么？'],
  capability: ['好的。你过去做过什么最有成就感的事？', '你的核心技能是什么？可以用 3 个词形容吗？'],
  need: ['现在最需要解决什么问题？', '你理想中的"成功"是什么样的？'],
  direction: ['如果你今天只能做 1 件事，你会做什么？', '你愿意为这件事每天花多少时间？'],
  summary: ['好的！我正在生成你的品牌蓝图...', '📋 蓝图已生成！5 个章节详见下方'],
};

export default function DiscoveryPage() {
  const [stateIdx, setStateIdx] = useState(0);
  const [messages, setMessages] = useState<{ role: 'ai' | 'user'; text: string }[]>([
    { role: 'ai', text: QUESTIONS.opening[0] },
  ]);
  const [input, setInput] = useState('');
  const [done, setDone] = useState(false);

  const send = () => {
    if (!input.trim()) return;
    const newMessages = [...messages, { role: 'user' as const, text: input }];
    setMessages(newMessages);
    setInput('');

    setTimeout(() => {
      const nextIdx = stateIdx + 1;
      if (nextIdx >= STATES.length) {
        setDone(true);
        return;
      }
      const q = QUESTIONS[STATES[nextIdx]]?.[Math.floor(Math.random() * 2)] || '继续...';
      setMessages([...newMessages, { role: 'ai' as const, text: q }]);
      setStateIdx(nextIdx);
    }, 800);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-xl font-bold">🎯 Stage 1: Discovery · 多轮 AI 对话</h1>
          <p className="text-sm text-gray-600 mt-1">
            当前状态: <span className="font-bold text-brand-500">{STATES[stateIdx]}</span> ({stateIdx + 1}/{STATES.length})
          </p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="bg-white rounded-lg shadow p-6 mb-4 h-96 overflow-y-auto">
          {messages.map((m, i) => (
            <div key={i} className={`mb-3 ${m.role === 'ai' ? 'text-left' : 'text-right'}`}>
              <div
                className={`inline-block px-4 py-2 rounded-lg max-w-md ${
                  m.role === 'ai' ? 'bg-orange-100 text-gray-800' : 'bg-brand-500 text-white'
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}
          {done && (
            <div className="bg-green-50 border border-green-200 rounded p-4 mt-4">
              <h3 className="font-bold text-green-700 mb-2">📋 你的品牌蓝图（5 章节）</h3>
              <ul className="text-sm space-y-1">
                <li>1. 品牌定位（基于你的能力）</li>
                <li>2. 目标受众（你的 ICP）</li>
                <li>3. 内容策略（每周 4 条短视频）</li>
                <li>4. 变现路径（¥999/月订阅 + 推荐 15%）</li>
                <li>5. 里程碑（30/60/90 天目标）</li>
              </ul>
            </div>
          )}
        </div>

        {!done ? (
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
              placeholder="回复蕾姆..."
              className="flex-1 px-4 py-3 border rounded-lg"
            />
            <button
              onClick={send}
              className="bg-brand-500 hover:bg-brand-600 text-white font-bold px-6 py-3 rounded-lg"
            >
              发送
            </button>
          </div>
        ) : (
          <a
            href="/dashboard"
            className="block text-center bg-brand-500 hover:bg-brand-600 text-white font-bold py-3 rounded-lg"
          >
            下一步：进入 Dashboard 启动 4 Agent →
          </a>
        )}
      </div>
    </main>
  );
}