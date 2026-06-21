---
node_id: 17
persona: neutral
cta_type: wechat
keywords: [支付, 微信, 支付宝, 商户号, 接入]
---

# 节点17：国内支付接入

> **面向OPC**：国内支付= 微信支付 + 支付宝 + 银联。OPC 90% 的产品只用前两个。本节点告诉你**最少的钱、最快的速度**接入。

---

## 一、3 个国内支付通道的对比

| 通道 | 手续费 | 提现时间 | 接入难度 | 适用场景 |
|:---|:---|:---|:---|:---|
| **微信支付** | 0.6% | T+1 | 中（需商户号）| C 端 / 小程序 |
| **支付宝** | 0.6% | T+1 | 中 | C 端 / 电商 |
| **银联** | 0.6% | T+1 | 高 | B 端 / 大额 |

**OPC 必接**：微信 + 支付宝，二者覆盖国内 95% 用户。

---

## 二、3 步走通微信支付（OPC 极简版）

### Step 1：注册商户号（个人可办）

| 主体类型 | 需要的材料 | 时间 |
|:---|:---|:---|
| **个体工商户** | 营业执照 + 法人身份证 + 银行账户 | 1-2 周 |
| **企业** | 营业执照 + 对公账户 + 法人身份证 | 2-3 周 |
| **个人（受限）** | 仅支持部分场景 | — |

**OPC 强烈建议**：办**个体工商户**，成本 200-500 元，1 周拿到。

### Step 2：拿到 API 凭证

登录 pay.weixin.qq.com → 账户中心 → API 安全：
- `AppID`（小程序 ID）
- `mch_id`（商户号）
- `API Key`（API 密钥 V2 / V3）
- `API 证书`（退款用）

### Step 3：服务端生成支付订单

```javascript
// 用官方 SDK：wechatpay-node-v3
const WxPay = require('wechatpay-node-v3').default;
const pay = new WxPay({
  appid: 'wx...',
  mchid: '16...',
  publicKey: fs.readFileSync('./apiclient_cert.pem'),
  privateKey: fs.readFileSync('./apiclient_key.pem'),
});

const result = await pay.transactions_native({
  description: 'OPC产品-月卡',
  out_trade_no: 'ORDER_' + Date.now(),
  notify_url: 'https://yourdomain.com/api/pay/wechat/notify',
  amount: { total: 9900, currency: 'CNY' },  // 99.00 元 = 9900 分
});
```

返回 `code_url`，前端用 `qrcode.js` 渲染成二维码，用户扫码支付。

---

## 三、回调验证（最容易出 bug 的地方）

```javascript
// /api/pay/wechat/notify
app.post('/api/pay/wechat/notify', async (req, res) => {
  // 1. 验证签名（用微信的 callback 头里的 signature）
  // 2. 解密回调数据
  // 3. 检查 out_trade_no 是否已处理（防重复）
  // 4. 业务处理：标记订单已支付
  // 5. 返回 { code: 'SUCCESS', message: '成功' }
});
```

**4 步不能省**：
1. 验证签名 = 防止假回调
2. 解密 = V3 是 AES-256-GCM 加密
3. 幂等检查 = 防止重复发货
4. 返回 SUCCESS = 否则微信会重试 5 次

---

## 四、支付宝（比微信简单 50%）

| 维度 | 微信 | 支付宝 |
|:---|:---|:---|
| 个人开发者支持 | ❌ 必须商户号 | ✅ 沙箱测试友好 |
| 沙箱 | 难申请 | 1 分钟开 |
| 文档质量 | 一般 | 极好 |
| **接入速度** | **1-2 天** | **2-4 小时** |

**OPC 技巧**：先接支付宝跑通流程，再接微信。

---

## 五、3 个常见坑

### 坑 1：回调 URL 用 http

微信/支付宝**只接受 https**。本地开发用 `ngrok` 或 `frp` 临时映射。

### 坑 2：金额用元而不是分

```javascript
// 错：amount: { total: 99 }     // 0.99 元
// 对：amount: { total: 9900 }   // 99.00 元 = 9900 分
```

### 坑 3：忘记对账

**每天对账**：`/api/pay/wechat/query` 查当天订单，发现异常订单手动处理。

---

## 六、检查清单

- [ ] 办完个体工商户营业执照
- [ ] 拿到微信支付商户号
- [ ] 接入支付（沙箱测试通过）
- [ ] 回调通知能验证签名 + 幂等
- [ ] 退款流程测试过
- [ ] 每天对账脚本在跑

---

## 节点资源链接

- 节点16：支付代码集成
- 节点44：银行开户与商户号
- 节点53：海外支付方案
