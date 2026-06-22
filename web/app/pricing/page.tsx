/**
 * ONE-MCN Pricing Page v5.3
 * 3 层定价：Free / ¥499+¥999/月 / ¥1万-5万定制
 */
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, X, Sparkles, Bot, BarChart3, Wallet, ShieldCheck, Crown, ArrowRight } from 'lucide-react';

const TIERS = [
  {
    id: 'tier1',
    name: 'Tier 1',
    badge: '免费试用',
    price: '¥0',
    period: '永久免费',
    description: 'AI 帮你梳理可做的项目',
    features: [
      { text: 'AI 问卷梳理可做项目', included: true },
      { text: '5 状态机 Discovery 对话', included: true },
      { text: '5 章节品牌蓝图', included: true },
      { text: '1 人品牌网站（基础版）', included: true },
      { text: '4 Agent 自动化', included: false },
      { text: '5 维数据监控', included: false },
      { text: '月度报告', included: false },
    ],
    cta: '开始免费试用',
    ctaLink: '/discovery',
    ctaVariant: 'outline' as const,
    highlight: false,
  },
  {
    id: 'tier2',
    name: 'Tier 2',
    badge: '最受欢迎',
    price: '¥499',
    period: '一次性搭建 + ¥999/月',
    description: '4 Agent 自动化 + 数据监控',
    features: [
      { text: 'Tier 1 全部功能', included: true },
      { text: '4 Agent 自动搭建', included: true },
      { text: '1 人品牌网站（Pro 版）', included: true },
      { text: '5 维数据监控', included: true },
      { text: '月度报告', included: true },
      { text: '推荐奖励（15% 佣金）', included: true },
      { text: '定制 Agent', included: false },
    ],
    cta: '¥499 起步自动化搭建',
    ctaLink: '/register?plan=tier2',
    ctaVariant: 'default' as const,
    highlight: true,
  },
  {
    id: 'tier3',
    name: 'Tier 3',
    badge: '高端定制',
    price: '¥1万-5万',
    period: '按需付费',
    description: '12 个月 1v1 顾问陪跑',
    features: [
      { text: 'Tier 2 全部功能', included: true },
      { text: '12 个月 1v1 顾问陪跑', included: true },
      { text: '定制 Agent（按行业）', included: true },
      { text: '行业资源对接（投资人/媒体）', included: true },
      { text: '紧急响应 24h', included: true },
      { text: '月度深度复盘', included: true },
      { text: '¥999/月运营费减免 50%', included: true },
    ],
    cta: '联系顾问',
    ctaLink: '/tier3',
    ctaVariant: 'outline' as const,
    highlight: false,
  },
];

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-orange-50 to-white py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-12">
          <Badge variant="default" className="mb-4">价格方案</Badge>
          <h1 className="text-4xl font-bold mb-4">3 层定价 · 按需选</h1>
          <p className="text-xl text-gray-600">
            免费试用 → 自动化搭建 → 定制陪跑
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {TIERS.map((tier) => (
            <Card
              key={tier.id}
              className={tier.highlight ? 'border-2 border-brand-500 relative' : ''}
            >
              {tier.badge && (
                <Badge
                  variant={tier.highlight ? 'default' : 'secondary'}
                  className="absolute -top-3 left-1/2 -translate-x-1/2"
                >
                  {tier.badge}
                </Badge>
              )}
              <CardHeader>
                <CardTitle className="text-2xl">{tier.name}</CardTitle>
                <CardDescription>{tier.description}</CardDescription>
                <div className="mt-4">
                  <div className={`text-4xl font-bold ${tier.highlight ? 'text-brand-500' : ''}`}>
                    {tier.price}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">{tier.period}</div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {tier.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      {f.included ? (
                        <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      ) : (
                        <X className="h-5 w-5 text-gray-300 flex-shrink-0 mt-0.5" />
                      )}
                      <span className={f.included ? 'text-gray-700' : 'text-gray-400 line-through'}>
                        {f.text}
                      </span>
                    </li>
                  ))}
                </ul>
                <Button
                  asChild
                  variant={tier.ctaVariant}
                  size="lg"
                  className="w-full mt-6"
                >
                  <Link href={tier.ctaLink}>
                    {tier.cta}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ */}
        <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">常见问题</h2>
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Q: Tier 1 免费试用能做什么？</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  AI 通过 5-10 轮对话挖掘你的能力、需求、方向，输出 5 章节可执行蓝图。
                  但没有 4 Agent 自动化、数据监控、月度报告。
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Q: Tier 2 的 ¥499 是一次性还是月费？</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  ¥499 是<strong>一次性</strong>搭建费（AI 自动搭建你的 1 人品牌网站 + 4 Agent + 数据看板）。
                  之后 <strong>¥999/月</strong>是运营费（4 Agent 持续执行 + 月度报告）。
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Q: Tier 3 的 ¥1万-5万 是怎么定的？</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  按需付费，根据你需要的定制 Agent 数量、行业资源对接范围、紧急响应频率定价。
                  一般 ¥1万（基础定制）到 ¥5万（深度陪跑 + 行业资源）不等。
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Q: 35 岁被裁，最适合哪个 Tier？</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  推荐先 <strong>Tier 1 免费试用</strong> → 跑通 Discovery 对话 → 确认方向 → ¥499 起步搭建。
                  ¥999/月 运营费 = 每天 ¥33，比一杯咖啡便宜。Tier 3 是月入 ≥ 5 万后再考虑。
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-12 text-center">
          <Button asChild variant="ghost">
            <Link href="/dashboard">已有账号？返回 Dashboard</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}