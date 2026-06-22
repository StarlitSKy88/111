'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Send, Sparkles, CheckCircle2, Target } from 'lucide-react';

const STATES = ['opening', 'capability', 'need', 'direction', 'summary'];

const QUESTIONS: Record<string, string[]> = {
  opening: [
    '你好！我是蕾姆，你的 ONE-MCN AI 合伙人。👋\n\n请先告诉我：你想通过短视频或 OPC 做什么？',
  ],
  capability: [
    '好的。👍\n\n你过去做过什么最有成就感的事？',
    '你的核心技能是什么？可以用 3 个词形容吗？',
  ],
  need: [
    '现在最需要解决什么问题？',
    '你理想中的"成功"是什么样的？',
  ],
  direction: [
    '如果你今天只能做 1 件事，你会做什么？',
    '你愿意为这件事每天花多少时间？',
  ],
  summary: [
    '好的！我正在生成你的品牌蓝图... ✨',
    '📋 蓝图已生成！5 个章节详见下方。',
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
      const q = QUESTIONS[STATES[nextIdx]]?.[Math.floor(Math.random() * 2)] || '继续...';
      setMessages([...newMessages, { role: 'ai' as const, text: q }]);
      setStateIdx(nextIdx);
      setLoading(false);
    }, 800);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-brand-500" />
            Stage 1: Discovery · 多轮 AI 对话
          </h1>
          <div className="flex items-center gap-3 mt-2">
            <Badge variant="default">
              状态: {STATES[stateIdx]} ({stateIdx + 1}/{STATES.length})
            </Badge>
            <span className="text-xs text-gray-500">Tier 1 免费试用</span>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="mb-4">
          <CardContent className="p-0">
            <div className="h-96 overflow-y-auto p-6 space-y-3">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'ai' ? 'justify-start' : 'justify-end'}`}>
                  <div
                    className={`max-w-md px-4 py-2 rounded-lg whitespace-pre-line ${
                      m.role === 'ai'
                        ? 'bg-orange-100 text-gray-800'
                        : 'bg-brand-500 text-white'
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-orange-100 px-4 py-2 rounded-lg">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                </div>
              )}
              {done && (
                <Card className="bg-green-50 border-green-200 mt-4">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-700">
                      <CheckCircle2 className="h-5 w-5" />
                      📋 你的品牌蓝图（5 章节）
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-1">
                    <p>1. <strong>品牌定位</strong>（基于你的能力）</p>
                    <p>2. <strong>目标受众</strong>（你的 ICP）</p>
                    <p>3. <strong>内容策略</strong>（每周 4 条短视频）</p>
                    <p>4. <strong>变现路径</strong>（Tier 2 ¥499 + ¥999/月）</p>
                    <p>5. <strong>里程碑</strong>（30/60/90 天目标）</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </CardContent>
        </Card>

        {!done ? (
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
              placeholder="回复蕾姆..."
              className="flex-1 px-4 py-3 border rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            />
            <Button onClick={send} disabled={!input.trim() || loading}>
              <Send className="h-4 w-4 mr-1" />
              发送
            </Button>
          </div>
        ) : (
          <Button asChild size="lg" className="w-full">
            <Link href="/register?plan=tier2">
              <Target className="h-5 w-5 mr-2" />
              下一步：升级 Tier 2 启动 4 Agent →
            </Link>
          </Button>
        )}
      </div>
    </main>
  );
}