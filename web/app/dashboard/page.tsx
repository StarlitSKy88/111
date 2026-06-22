'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bot, CheckCircle2, Loader2, Sparkles, BarChart3, Users, Wallet } from 'lucide-react';

const AGENTS = [
  { id: 'content', name: '内容 Agent', desc: '文章/视频/帖子自动生产', icon: '✍️' },
  { id: 'acquisition', name: '获客 Agent', desc: '多渠道触达 + 私域引流', icon: '🎯' },
  { id: 'delivery', name: '交付 Agent', desc: '产品交付 + 客服', icon: '📦' },
  { id: 'support', name: '售后 Agent', desc: '复购触发 + 跟进', icon: '💬' },
];

const PLAN_LIMITS: Record<string, { name: string; price: string; maxAgents: number }> = {
  tier1: { name: 'Tier 1 · 免费试用', price: '¥0', maxAgents: 0 },
  tier2: { name: 'Tier 2 · 自动化搭建', price: '¥499 + ¥999/月', maxAgents: 4 },
  tier3: { name: 'Tier 3 · 定制陪跑', price: '¥1万-5万', maxAgents: 4 },
};

export default function DashboardPage() {
  const [userId, setUserId] = useState('');
  const [plan, setPlan] = useState('tier1');
  const [agentStatus, setAgentStatus] = useState<Record<string, string>>({});

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const storedPlan = localStorage.getItem('plan');
    const storedUser = localStorage.getItem('user_id');
    if (params.get('plan')) setPlan(params.get('plan')!);
    else if (storedPlan) setPlan(storedPlan);
    if (storedUser) setUserId(storedUser);
  }, []);

  const planInfo = PLAN_LIMITS[plan] || PLAN_LIMITS.tier1;
  const canUseAgents = planInfo.maxAgents > 0;

  async function runAgent(agentId: string) {
    if (!canUseAgents) return;
    setAgentStatus((p) => ({ ...p, [agentId]: 'running' }));
    try {
      await fetch('http://localhost:3000/api/agent-run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agent_id: agentId, user_id: userId }),
      });
    } catch (e) {
      console.error(e);
    }
    setTimeout(() => {
      setAgentStatus((p) => ({ ...p, [agentId]: 'completed' }));
    }, 2000);
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">ONE-MCN Dashboard</h1>
          <Badge variant={plan === 'tier1' ? 'secondary' : 'default'}>
            {planInfo.name} · {planInfo.price}
          </Badge>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Tier 1 升级提示 */}
        {plan === 'tier1' && (
          <Card className="mb-8 border-brand-500 bg-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-brand-500" />
                升级到 Tier 2，解锁 4 Agent 自动化
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                你现在用的是 <strong>Tier 1 免费试用</strong>，可以做 Discovery 多轮对话梳理方向。
                但 4 Agent 自动运营 + 数据监控需要 Tier 2（¥499 起步搭建 + ¥999/月）。
              </p>
              <Button asChild>
                <Link href="/register?plan=tier2">升级到 Tier 2 · ¥499 起步 →</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* 4 Agent 控制台 */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">4 Agent 控制台</h2>
          {!canUseAgents && (
            <p className="text-gray-500 mb-4">升级到 Tier 2 即可解锁 4 Agent</p>
          )}
          <div className="grid md:grid-cols-2 gap-4">
            {AGENTS.map((agent) => (
              <Card key={agent.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-lg">
                    <span>{agent.icon} {agent.name}</span>
                    <Badge
                      variant={
                        agentStatus[agent.id] === 'completed' ? 'default' :
                        agentStatus[agent.id] === 'running' ? 'secondary' : 'outline'
                      }
                    >
                      {agentStatus[agent.id] === 'completed' ? (
                        <><CheckCircle2 className="h-3 w-3 mr-1" />已完成</>
                      ) : agentStatus[agent.id] === 'running' ? (
                        <><Loader2 className="h-3 w-3 mr-1 animate-spin" />运行中</>
                      ) : (
                        '待启动'
                      )}
                    </Badge>
                  </CardTitle>
                  <CardDescription>{agent.desc}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => runAgent(agent.id)}
                    disabled={!canUseAgents || agentStatus[agent.id] === 'running'}
                    className="w-full"
                  >
                    {agentStatus[agent.id] === 'running' ? '运行中...' : canUseAgents ? '运行' : '需升级 Tier 2'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* 快捷入口 */}
        <div>
          <h2 className="text-2xl font-bold mb-4">快捷入口</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <Sparkles className="h-6 w-6 text-brand-500 mb-2" />
                <CardTitle className="text-base">🎯 Stage 1: Discovery</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-3">5-10 轮 AI 对话，生成你的品牌蓝图</p>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/discovery">进入 Discovery →</Link>
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <BarChart3 className="h-6 w-6 text-brand-500 mb-2" />
                <CardTitle className="text-base">📊 5 维数据监控</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-3">流量/转化/收入/品牌/留存</p>
                <Button asChild variant="outline" className="w-full" disabled={!canUseAgents}>
                  <Link href="/monitor">{canUseAgents ? '查看数据 →' : '需升级 Tier 2'}</Link>
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Users className="h-6 w-6 text-brand-500 mb-2" />
                <CardTitle className="text-base">🤖 4 Agent 详情</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-3">内容/获客/交付/售后 详细配置</p>
                <Button asChild variant="outline" className="w-full" disabled={!canUseAgents}>
                  <Link href="/agents">{canUseAgents ? '配置 Agent →' : '需升级 Tier 2'}</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}