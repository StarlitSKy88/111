/**
 * ONE-MCN Landing Page v5.3
 * shadcn/ui + 3 层定价
 */
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Target, Bot, BarChart3, Wallet, ShieldCheck, ArrowRight } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <Badge variant="default" className="mb-6">
          ⚠️ 本月仅前 100 用户享早鸟 ¥499 锁价
        </Badge>
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight tracking-tight">
          被裁了？35 岁？
          <br />
          <span className="text-brand-500">60 天用 AI 跑通你的 1 人品牌</span>
        </h1>
        <p className="mt-6 text-xl text-gray-700 max-w-2xl mx-auto">
          ONE-MCN 不是课程，不是工具。是一个 <strong>AI 合伙人</strong>，
          帮你从"裁员通知"走到"第一个付费用户"。
        </p>
        <div className="mt-10 flex flex-col md:flex-row gap-4 justify-center">
          <Button asChild size="lg" className="text-lg px-8">
            <Link href="/discovery">
              免费试用 AI 问卷 →
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="text-lg px-8">
            <Link href="/pricing">查看 3 层定价</Link>
          </Button>
        </div>
        <p className="mt-4 text-sm text-gray-500">
          ✨ Tier 1 免费 · Tier 2 ¥499 自动化搭建 · Tier 3 定制陪跑
        </p>
      </section>

      {/* 5 价值点 */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-4">你将得到的 5 个东西</h2>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          ONE-MCN 是 4 Agent + AI 合伙人的完整 1 人 MCN 操作系统
        </p>
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {[
            { icon: Sparkles, title: '1. AI 合伙人', desc: '5-10 轮 AI 对话，挖掘你的能力、需求、方向，输出 5 章节可执行蓝图。' },
            { icon: Bot, title: '2. 4 Agent 矩阵', desc: '内容/获客/交付/售后 4 个 Agent 7×24 自动化运营你的 1 人 MCN 业务。' },
            { icon: BarChart3, title: '3. 5 维数据监控', desc: '流量/转化/收入/品牌/留存 5 维度实时监控 + push 预警 + 周报。' },
            { icon: Wallet, title: '4. ¥499 自动化搭建', desc: 'AI 自动搭建你的 1 人品牌网站 + 4 Agent + 数据看板。一次性投入，长期运营。' },
            { icon: ShieldCheck, title: '5. AI 合伙人审查', desc: '7 红线一致性 Agent + Agent 自我 review，避免内容违规 + 月度报告瓶颈。' },
            { icon: Target, title: '6. 35 岁特别优化', desc: '针对被裁中年人的快速变现路径设计，60 天跑通 ROI。' },
          ].map((v) => (
            <Card key={v.title}>
              <CardHeader>
                <v.icon className="h-10 w-10 text-brand-500 mb-3" />
                <CardTitle className="text-lg">{v.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm">{v.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* 3 层定价入口 */}
      <section className="bg-gradient-to-b from-white to-orange-50 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">3 层定价 · 按需选</h2>
          <p className="text-gray-600 mb-12">免费试用 → 自动化搭建 → 定制陪跑</p>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Tier 1</CardTitle>
                <CardDescription>免费试用</CardDescription>
                <div className="text-4xl font-bold mt-2">¥0</div>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-2 text-left">
                  <li>✓ AI 问卷梳理可做项目</li>
                  <li>✓ 5 状态机 Discovery</li>
                  <li>✓ 5 章节品牌蓝图</li>
                  <li>✗ 4 Agent 自动化</li>
                  <li>✗ 数据监控</li>
                </ul>
                <Button asChild className="w-full mt-6" variant="outline">
                  <Link href="/discovery">开始免费试用</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 border-brand-500 relative">
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">最受欢迎</Badge>
              <CardHeader>
                <CardTitle className="text-2xl">Tier 2</CardTitle>
                <CardDescription>自动化搭建 + 运营</CardDescription>
                <div className="text-4xl font-bold mt-2 text-brand-500">
                  ¥499
                  <span className="text-sm text-gray-500 font-normal"> + ¥999/月</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-2 text-left">
                  <li>✓ Tier 1 全部</li>
                  <li>✓ 4 Agent 自动搭建</li>
                  <li>✓ 1 人品牌网站</li>
                  <li>✓ 5 维数据监控</li>
                  <li>✓ 月度报告</li>
                </ul>
                <Button asChild className="w-full mt-6">
                  <Link href="/register?plan=tier2">¥499 起步</Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Tier 3</CardTitle>
                <CardDescription>定制化陪跑</CardDescription>
                <div className="text-4xl font-bold mt-2">¥1万-5万</div>
                <CardDescription>按需付费</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-2 text-left">
                  <li>✓ Tier 2 全部</li>
                  <li>✓ 12 个月 1v1 顾问</li>
                  <li>✓ 定制 Agent</li>
                  <li>✓ 行业资源对接</li>
                  <li>✓ 紧急响应 24h</li>
                </ul>
                <Button asChild className="w-full mt-6" variant="outline">
                  <Link href="/tier3">联系顾问</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ICP 共情 */}
      <section className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold mb-8 text-center">写给 35 岁上下被裁的你</h2>
          <div className="space-y-4 text-lg text-gray-300">
            <p>我知道你现在的心情：</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>刚收到裁员通知（N+1 不够花）</li>
              <li>投了 200 份简历没回音</li>
              <li>35 岁焦虑 + 房贷 + 育儿</li>
              <li>想找新出路，但不知道做什么</li>
              <li>试过抖音/小红书/朋友圈卖货，0 收入</li>
            </ul>
            <p className="mt-6">
              ONE-MCN 不是帮你"找新工作"——<strong className="text-brand-500">是帮你"成为自己的老板"</strong>。
              用 AI 4 Agent 跑通一个 1 人 MCN 业务，从内容生产到变现，全自动化。
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-brand-500 text-white py-16 text-center">
        <h2 className="text-4xl font-bold mb-6">今天就开始，比明天多 24 小时</h2>
        <Button asChild size="lg" variant="secondary" className="text-lg px-12">
          <Link href="/discovery">
            免费试用 AI 问卷 →
          </Link>
        </Button>
      </section>

      {/* Footer */}
      <footer className="bg-gray-100 py-8 text-center text-sm text-gray-600">
        <p>ONE-MCN · 1 人 MCN 公司 · vibcoding roadmap</p>
        <p className="mt-2 space-x-4">
          <Link href="/privacy" className="underline hover:text-brand-500">隐私政策</Link>
          <Link href="/terms" className="underline hover:text-brand-500">服务条款</Link>
          <Link href="/pricing" className="underline hover:text-brand-500">价格</Link>
        </p>
      </footer>
    </main>
  );
}