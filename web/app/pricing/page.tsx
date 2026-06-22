/**
 * ONE-MCN Pricing Page (含价格弹性测试)
 * v5.2 — 5 个价格让用户选
 */
export default function PricingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-orange-50 to-white py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-bold text-center mb-4">价格弹性测试</h1>
        <p className="text-center text-gray-600 mb-12">
          你觉得 ONE-MCN 值多少？选 1 个价格，14 天免费试用
        </p>

        <div className="grid md:grid-cols-5 gap-4">
          {[
            { price: 199, note: '最低验证', recommend: false },
            { price: 499, note: '中位弹性', recommend: false },
            { price: 999, note: '标准价', recommend: true },
            { price: 1499, note: '高价位', recommend: false },
            { price: 2999, note: '极限价', recommend: false },
          ].map((p) => (
            <a
              key={p.price}
              href={`/register?plan=${p.price}`}
              className={`bg-white p-6 rounded-lg shadow text-center transition ${
                p.recommend ? 'border-4 border-brand-500 relative' : 'border border-gray-200 hover:border-brand-500'
              }`}
            >
              {p.recommend && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-500 text-white text-xs px-3 py-1 rounded-full">
                  推荐
                </span>
              )}
              <div className="text-3xl font-bold text-brand-500">¥{p.price}</div>
              <div className="text-sm text-gray-500 mt-2">/月</div>
              <div className="text-xs text-gray-400 mt-2">{p.note}</div>
            </a>
          ))}
        </div>

        <div className="mt-12 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-3">💡 为什么有 5 个价格？</h2>
          <p className="text-gray-600 mb-3">
            这是 YC 标准的 price discovery 实验。我们不是想"卖更贵"，
            而是想知道<strong>你</strong>觉得 ONE-MCN 值多少。
          </p>
          <ul className="list-disc pl-6 text-gray-600 space-y-1">
            <li>选 ¥199：你觉得"试一下"很合理</li>
            <li>选 ¥999：你相信这是"标准价值"</li>
            <li>选 ¥2999：你相信这是"高价值投资"</li>
            <li>不选：欢迎告诉我们为什么</li>
          </ul>
        </div>

        <div className="mt-8 text-center">
          <a href="/dashboard" className="text-brand-500 underline">
            已有账号？返回 Dashboard
          </a>
        </div>
      </div>
    </main>
  );
}