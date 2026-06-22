/**
 * ONE-MCN Landing Page (v5.2)
 * 目标用户：35 岁上下被裁的中年人，想通过短视频/OPC 快速赚钱
 * 核心：1 个 CTA + 价格弹性测试入口
 */

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
          被裁了？35 岁？
          <br />
          <span className="text-brand-500">60 天用 AI 跑通你的 1 人品牌</span>
        </h1>
        <p className="mt-6 text-xl text-gray-700 max-w-2xl mx-auto">
          ONE-MCN 不是课程，不是工具。是一个 <strong>AI 合伙人</strong>，
          帮你从"裁员通知"走到"第一个付费用户"，
          全程 <strong>¥999/月</strong>。
        </p>
        <div className="mt-10 flex flex-col md:flex-row gap-4 justify-center">
          <a
            href="/register"
            className="bg-brand-500 hover:bg-brand-600 text-white font-bold py-4 px-8 rounded-lg text-lg transition"
          >
            免费 14 天试用 →
          </a>
          <a
            href="/pricing"
            className="border-2 border-brand-500 text-brand-500 hover:bg-orange-50 font-bold py-4 px-8 rounded-lg text-lg transition"
          >
            价格弹性测试（5 个价格）
          </a>
        </div>
        <p className="mt-4 text-sm text-gray-500">
          ⚠️ 本月仅前 100 用户享早鸟 ¥699/月锁价
        </p>
      </section>

      {/* 5 价值点 */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          你将得到的 5 个东西
        </h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {[
            { icon: '🎯', title: '1. 品牌蓝图', desc: 'AI 通过 5-10 轮对话挖掘你的能力、需求、方向，输出 5 章节可执行蓝图。' },
            { icon: '🤖', title: '2. 4 Agent 矩阵', desc: '内容/获客/交付/售后 4 个 Agent 7×24 自动化运营你的 1 人 MCN 业务。' },
            { icon: '📊', title: '3. 5 维数据监控', desc: '流量/转化/收入/品牌/留存 5 维度实时监控 + push 预警 + 周报。' },
            { icon: '💰', title: '4. Stage 4 商业化', desc: '14 天试用 → ¥699 早鸟 → ¥999 标准，月订阅 + 推荐 15% 佣金。' },
            { icon: '🛡️', title: '5. AI 合伙人审查', desc: '7 红线一致性 Agent + Agent 自我 review，避免内容违规 + 月度报告瓶颈。' },
          ].map((v) => (
            <div key={v.title} className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-4xl mb-3">{v.icon}</div>
              <h3 className="font-bold text-xl mb-2">{v.title}</h3>
              <p className="text-gray-600">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ICP 共情段落 */}
      <section className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold mb-8 text-center">写给 35 岁上下被裁的你</h2>
          <div className="prose prose-invert text-lg space-y-4">
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

      {/* 价格弹性测试入口 */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl font-bold mb-6">不知道 ¥999/月值不值？</h2>
        <p className="text-xl text-gray-700 mb-8">
          我们给你 <strong>5 个价格</strong>选择 — 你觉得值多少就付多少
        </p>
        <div className="grid md:grid-cols-5 gap-4 max-w-4xl mx-auto">
          {[
            { price: '¥199', note: '最低验证' },
            { price: '¥499', note: '中位弹性' },
            { price: '¥999', note: '标准价' },
            { price: '¥1,499', note: '高价位' },
            { price: '¥2,999', note: '极限价' },
          ].map((p) => (
            <a
              key={p.price}
              href={`/register?plan=${p.price.replace('¥', '')}`}
              className="bg-white border-2 border-gray-200 hover:border-brand-500 p-6 rounded-lg transition"
            >
              <div className="text-3xl font-bold text-brand-500">{p.price}</div>
              <div className="text-sm text-gray-500 mt-2">/月</div>
              <div className="text-xs text-gray-400 mt-1">{p.note}</div>
            </a>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-brand-500 text-white py-16 text-center">
        <h2 className="text-4xl font-bold mb-6">
          今天就开始，比明天多 24 小时
        </h2>
        <a
          href="/register"
          className="inline-block bg-white text-brand-500 hover:bg-gray-100 font-bold py-4 px-12 rounded-lg text-lg transition"
        >
          免费 14 天试用 →
        </a>
      </section>

      {/* Footer */}
      <footer className="bg-gray-100 py-8 text-center text-sm text-gray-600">
        <p>ONE-MCN · 1 人 MCN 公司 · vibcoding roadmap</p>
        <p className="mt-2">
          <a href="/privacy" className="underline">隐私政策</a> ·{' '}
          <a href="/terms" className="underline">服务条款</a> ·{' '}
          <a href="/pricing" className="underline">价格</a>
        </p>
      </footer>
    </main>
  );
}