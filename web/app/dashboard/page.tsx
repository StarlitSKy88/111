/**
 * ONE-MCN Web · Dashboard
 * v5.2 — 4 Agent 控制台
 */
'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function DashboardPage() {
  const [userId, setUserId] = useState('');
  const [plan, setPlan] = useState('999');
  const [agents, setAgents] = useState([
    { id: 'content', name: '内容 Agent', status: 'idle', desc: '文章/视频/帖子' },
    { id: 'acquisition', name: '获客 Agent', status: 'idle', desc: '多渠道触达' },
    { id: 'delivery', name: '交付 Agent', status: 'idle', desc: '产品交付 + 客服' },
    { id: 'support', name: '售后 Agent', status: 'idle', desc: '复购触发 + 跟进' },
  ]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const stored = localStorage.getItem('user_id');
    const storedPlan = localStorage.getItem('plan');
    if (params.get('plan')) setPlan(params.get('plan')!);
    else if (storedPlan) setPlan(storedPlan);
    if (stored) setUserId(stored);
  }, []);

  async function runAgent(agentId: string) {
    setAgents((prev) =>
      prev.map((a) => (a.id === agentId ? { ...a, status: 'running' } : a))
    );
    try {
      const res = await fetch(`http://localhost:3000/api/agent-run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agent_id: agentId, user_id: userId }),
      });
      await res.json();
    } catch (e) {
      console.error(e);
    }
    setTimeout(() => {
      setAgents((prev) =>
        prev.map((a) => (a.id === agentId ? { ...a, status: 'completed' } : a))
      );
    }, 2000);
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">ONE-MCN Dashboard</h1>
          <div className="text-sm text-gray-600">
            Plan: <span className="font-bold text-brand-500">¥{plan}/月</span>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* 4 Agent 控制台 */}
        <h2 className="text-2xl font-bold mb-4">4 Agent 控制台</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {agents.map((agent) => (
            <div key={agent.id} className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-bold text-lg">{agent.name}</h3>
                <span
                  className={`px-2 py-1 text-xs rounded ${
                    agent.status === 'idle'
                      ? 'bg-gray-100 text-gray-600'
                      : agent.status === 'running'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-green-100 text-green-700'
                  }`}
                >
                  {agent.status}
                </span>
              </div>
              <p className="text-gray-600 text-sm mb-4">{agent.desc}</p>
              <button
                onClick={() => runAgent(agent.id)}
                disabled={agent.status === 'running'}
                className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-2 rounded disabled:opacity-50"
              >
                {agent.status === 'running' ? '运行中...' : '运行'}
              </button>
            </div>
          ))}
        </div>

        {/* 快捷入口 */}
        <div className="mt-12 grid md:grid-cols-3 gap-4">
          <Link href="/discovery" className="bg-white p-6 rounded-lg shadow hover:shadow-md transition">
            <h3 className="font-bold mb-2">🎯 Stage 1: Discovery</h3>
            <p className="text-sm text-gray-600">5-10 轮 AI 对话，生成你的品牌蓝图</p>
          </Link>
          <Link href="/pricing" className="bg-white p-6 rounded-lg shadow hover:shadow-md transition">
            <h3 className="font-bold mb-2">💰 价格管理</h3>
            <p className="text-sm text-gray-600">查看订阅 + 续费 + 推荐佣金</p>
          </Link>
          <Link href="/agents" className="bg-white p-6 rounded-lg shadow hover:shadow-md transition">
            <h3 className="font-bold mb-2">🤖 4 Agent 详情</h3>
            <p className="text-sm text-gray-600">内容/获客/交付/售后 详细配置</p>
          </Link>
        </div>
      </div>
    </main>
  );
}