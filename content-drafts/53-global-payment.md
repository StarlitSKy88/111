---
node_id: 53
persona: neutral
cta_type: wechat
keywords: [海外, 支付, Stripe, PayPal, 跨境]
---

# 节点53：海外支付方案

> **面向OPC**：海外用户的支付 = 美元 / 欧元 / 信用卡。**OPC 90% 选 Stripe**（最简单）+ 1 个备选（PayPal / 加密货币）。本节点教你怎么 1 天接入。

---

## 一、海外 3 个主流支付通道

| 通道 | 手续费 | 覆盖 | OPC 难度 |
|:---|:---|:---|:---:|
| **Stripe** | 2.9% + $0.30 | 全球 195 国家 | ⭐⭐⭐⭐⭐ |
| **PayPal** | 3.5% + $0.30 | 200 国家 | ⭐⭐⭐⭐ |
| **Paddle** | 5% + $0.50 | 全球（含税务）| ⭐⭐⭐ |

**OPC 必接**：Stripe（主）+ PayPal（备选）。

---

## 二、Stripe 接入 5 步

### Step 1：注册 Stripe

1. 打开 stripe.com → 注册
2. 选地区：**美国 / 香港**（个人开发者推荐香港）
3. 验证：身份证 + 银行卡 + 商业信息
4. 1-3 天审核通过

**OPC 注意**：中国大陆身份证可以注册，但需要 ITIN / EIN 税号。

### Step 2：拿 API 密钥

```
Dashboard → Developers → API keys
- Publishable key: pk_live_xxx
- Secret key: sk_live_xxx
```

### Step 3：服务端集成

```bash
npm install stripe
```

```javascript
// api/stripe/create-checkout.js
const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

app.post('/api/stripe/create-checkout', async (req, res) => {
  const session = await stripe.checkout.sessions.create({
    line_items: [{
      price_data: {
        currency: 'usd',
        product_data: { name: 'OPC Premium' },
        unit_amount: 2900,  // $29.00
        recurring: { interval: 'month' },
      },
      quantity: 1,
    }],
    mode: 'subscription',
    success_url: 'https://yourdomain.com/success?session_id={CHECKOUT_SESSION_ID}',
    cancel_url: 'https://yourdomain.com/cancel',
    customer_email: req.body.email,
  });
  res.json({ url: session.url });
});
```

### Step 4：前端跳转

```typescript
const res = await fetch('/api/stripe/create-checkout', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email }),
});
const { url } = await res.json();
window.location.href = url;  // 跳到 Stripe 托管页
```

### Step 5：处理 Webhook

```javascript
// api/stripe/webhook.js
app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case 'customer.subscription.created':
      // 标记用户为付费
      break;
    case 'invoice.payment_failed':
      // 邮件提醒用户
      break;
  }
  res.json({ received: true });
});
```

---

## 三、3 个 Stripe 必装的工具

### 1. Stripe Tax

自动算各国税率（VAT / GST / Sales Tax），免 OPC 自己研究税法。

### 2. Stripe Customer Portal

用户**自助管理订阅**（改卡、退订、下载发票），免去 OPC 客服工作。

### 3. Stripe Radar

AI 反欺诈，自动拦截可疑交易。

**OPC 推荐**：全部开起来。

---

## 四、3 个税务 / 合规问题

### 1. 美国销售税（Sales Tax）

**触发条件**：年营收 > $100,000 OR 200 笔交易。
**解法**：开 Stripe Tax，让 Stripe 自动算。

### 2. 欧盟 VAT

**触发条件**：欧盟用户。
**解法**：注册欧盟 VAT 号 OR 用 Stripe Tax + OSS 申报。

### 3. 数据合规（GDPR）

**触发条件**：欧盟用户。
**解法**：用户协议 + 隐私政策 + 数据删除功能 + DPO（数据保护官）。

---

## 五、PayPal（备份 + 部分用户偏好）

### 集成

```bash
npm install @paypal/checkout-server-sdk
```

```javascript
const checkoutNodeJssdk = require('@paypal/checkout-server-sdk');

app.post('/api/paypal/create-order', async (req, res) => {
  const request = new checkoutNodeJssdk.orders.OrdersCreateRequest();
  request.prefer('return=representation');
  request.requestBody({
    intent: 'CAPTURE',
    purchase_units: [{
      amount: { currency_code: 'USD', value: '29.00' },
    }],
  });
  const order = await client().execute(request);
  res.json({ id: order.result.id });
});
```

### 优势

- 中国用户也能用（绑银联卡）
- 部分海外用户只信 PayPal
- 月费 0（按交易费）

### 劣势

- 手续费高（3.5% vs Stripe 2.9%）
- 拒付 / 争议流程对商家不利
- 文档比 Stripe 差

---

## 六、3 个真实成本对比

| 通道 | 月收入 $1000 时手续费 |
|:---|:---:|
| Stripe | $32（2.9% + 30¢）|
| PayPal | $38（3.5% + 30¢）|
| Paddle | $50（5%）+ 处理税务 |

**OPC 永远 Stripe 优先**。

---

## 七、3 个海外收款必备

| 必备 | 用途 |
|:---|:---|
| **香港银行账户 / Wise** | 收款 + 结汇 |
| **美国银行账户（Mercury）** | 美元收款（推荐）|
| **身份证 + 地址证明** | KYC 验证用 |

**Mercury 银行**：美国数字银行，OPC 申请 1 周通过，美元收款 + 转账到中国账户。

---

## 八、检查清单

- [ ] 注册 Stripe + 验证通过
- [ ] 接入订阅 / 一次性支付
- [ ] 启用 Stripe Tax
- [ ] Webhook 处理 + 幂等
- [ ] 准备海外收款账户（Wise / Mercury）
- [ ] 隐私政策 / GDPR 合规

---

## 节点资源链接

- 节点17：国内支付接入
- 节点44：银行开户与商户号
- 节点47：企业邮箱搭建
