---
node_id: 31
persona: neutral
cta_type: wechat
keywords: [数据, 监控, GA, 分析, 埋点]
---

# 节点31：数据监控

> **面向OPC**：上线 1 周后，你会问"有人用我的产品吗？"。没数据监控 = 蒙眼走路。本节点用最低成本接入 3 个工具，让你**每天早上 9 点知道昨天的全部数据**。

---

## 一、OPC 必装的 3 个数据工具

| 工具 | 用途 | 成本 | 接入难度 |
|:---|:---|:---|:---|
| **Google Analytics 4 (GA4)** | 流量分析 | 免费 | 1 小时 |
| **PostHog / Plausible** | 行为分析 | 免费 10k events | 2 小时 |
| **自建业务埋点** | 业务指标（付费、留存）| 免费 | 1 天 |

**优先级**：GA4 → 业务埋点 → PostHog。

---

## 二、GA4 接入（5 分钟）

### Next.js 集成

```bash
npm install @next/third-parties
```

```typescript
// app/layout.tsx
import { GoogleAnalytics } from '@next/third-parties/google'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>{children}</body>
      <GoogleAnalytics gaId="G-XXXXXXXXXX" />
    </html>
  )
}
```

去 analytics.google.com 注册 → 拿到 `G-XXXXXXXXXX` 填进去。

### 自定义事件

```typescript
import { sendGAEvent } from '@next/third-parties/google'

// 关键业务事件
sendGAEvent({ event: 'signup', value: 'email' })
sendGAEvent({ event: 'purchase', value: 99, currency: 'CNY' })
```

---

## 三、业务埋点（OPC 必看的 5 个指标）

不要看 DAU / MAU 这种虚荣指标，OPC 看这 5 个：

| 指标 | 公式 | 健康值 |
|:---|:---|:---|
| **日活转化率** | 付费用户 / 总注册 | > 2% |
| **7 日留存** | 第 7 天还登录 / 总注册 | > 20% |
| **LTV** | 用户终身价值 | > CAC 3 倍 |
| **CAC** | 获客成本 | < 月费 1/3 |
| **NRR** | 老用户续费/升级 | > 100% |

---

## 四、3 种埋点方法

### 1. 服务端埋点（最准）

```javascript
// api/events.js
app.post('/api/events', (req, res) => {
  const { user_id, event, properties } = req.body;
  // 写入数据库
  await db.query(
    'INSERT INTO events (user_id, event, properties, created_at) VALUES ($1, $2, $3, NOW())',
    [user_id, event, JSON.stringify(properties)]
  );
  res.json({ success: true });
});
```

### 2. 客户端埋点（覆盖全）

```javascript
// lib/tracker.js
export function track(event, properties = {}) {
  fetch('/api/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_id: getUserId(),
      event,
      properties,
    }),
  });
}
```

### 3. 第三方 SaaS（最快）

PostHog / Plausible / Mixpanel 都行，免费额度够 OPC 用 2 年。

---

## 五、自建仪表盘（1 个就够）

用 **Metabase**（免费）连接 Supabase Postgres，5 个核心图表：

1. **每日新增用户**（柱状图）
2. **每日付费金额**（折线图）
3. **7 日留存漏斗**（漏斗图）
4. **来源分布**（饼图）
5. **关键路径转化**（漏斗图）

**每天早上 9 点看 1 次** = 知道产品是否健康。

---

## 六、3 个常见错误

### 错误 1：装 5 个分析工具

**错**。GA4 + 业务埋点 = 足够。装多了用户被追踪 5 次，违反 GDPR。

### 错误 2：埋点完从不看

**错**。装 100 个事件但从不开 dashboard = 0 价值。**每天 1 次 5 分钟**。

### 错误 3：自己埋 PII 数据

**错**。身份证、手机号绝不上报到 GA4，违反隐私法规。

---

## 七、检查清单

- [ ] GA4 接入并能看到 PV/UV
- [ ] 5 个核心业务事件埋点
- [ ] Metabase / PostHog 仪表盘能打开
- [ ] 每天 9 点看 5 分钟数据
- [ ] 异常告警（活跃用户 < 50% 时邮件提醒）

---

## 节点资源链接

- 节点30：正式发布
- 节点32：冷启动获客
- 节点34：用户反馈收集
