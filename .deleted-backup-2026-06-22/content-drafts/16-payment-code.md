---
node_id: 16
persona: neutral
cta_type: wechat
keywords: [支付, 微信支付, 你的后端, 步骤, 预支付订]
---

# 节点16：支付代码集成

> **面向OPC**：产品做好了，用户也来了，但钱进不来。微信支付是国内OPC绕不开的关卡。本节点用最直白的方式讲清楚：从零到收到第一笔钱，代码该怎么写。

---

## 一、先理解：微信支付的钱是怎么到你账户的

别一头扎进代码。先理解钱流动的过程：

```
用户点击支付
    ↓
你的后端生成"预支付订单"（告诉微信：有人要付多少钱）
    ↓
微信返回一个"支付参数"（一串加密字符串）
    ↓
前端用这个参数唤起微信支付界面（密码/指纹）
    ↓
用户付完款，微信异步回调你的后端（告诉你：钱到了）
    ↓
你的后端验证签名，更新订单状态
    ↓
用户看到"支付成功"
```

**关键认知**：整个流程中，你的后端从来不会"收到钱"。钱是微信代收，T+1结算到你的对公账户。你的后端只负责两件事：**发起支付请求** 和 **确认支付结果**。

---

## 二、2026年微信支付的三条路径

| 路径 | 适用场景 | 开发复杂度 | 费率 |
|---|---|---|---|
| **JSAPI支付** | 微信内网页、公众号 | ⭐⭐ 中 | 0.6% |
| **小程序支付** | 微信小程序内 | ⭐⭐ 中 | 0.6% |
| **Native支付** | PC网页（扫码付） | ⭐ 最低 | 0.6% |
| **H5支付** | 手机浏览器网页 | ⭐⭐⭐ 最高 | 0.6% |

**OPC首推：JSAPI支付（微信内网页）或Native支付（PC网页扫码）。**

- 如果你做了微信小程序 → 小程序支付
- 如果你只做了Web → JSAPI（微信内打开）/ Native（电脑打开扫码）
- 别做H5支付，申请难度大，需要额外资质

---

## 三、微信支付API V3 核心代码（2026年现行版本）

微信支付API V3是2020年推出的，2026年已经是唯一在用的版本。**V2已经完全停用，不要看任何V2教程。**

### 前置条件

1. 微信商户号（在 `pay.weixin.qq.com` 申请）
2. 商户API证书（在商户平台 → 账户中心 → API安全 下载）
3. 商户APIv3密钥（自己设置的32位字符串）

**官方文档入口**：[pay.weixin.qq.com/wiki/doc/apiv3](https://pay.weixin.qq.com/wiki/doc/apiv3)

### 步骤1：后端生成预支付订单（Node.js）

```javascript
// 2026年微信支付API V3 JSAPI下单
const axios = require('axios');
const crypto = require('crypto');

async function createOrder(amount, description, openid) {
  // 1. 构造请求体（必填字段就这些）
  const body = {
    appid: process.env.WECHAT_APPID,       // 公众号/小程序AppID
    mchid: process.env.WECHAT_MCHID,        // 商户号
    description: description,                // 商品描述（如"OPC节点百科会员"）
    out_trade_no: generateOrderNo(),         // 你的订单号（唯一）
    notify_url: 'https://你的域名.com/api/pay/notify',  // 回调地址
    amount: {
      total: amount,                         // 金额（单位：分）
      currency: 'CNY'
    },
    payer: {
      openid: openid                         // 用户的微信openid
    }
  };

  // 2. 生成签名（微信支付V3的签名算法）
  const nonceStr = crypto.randomBytes(16).toString('hex');
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = signRequest('POST', '/v3/pay/transactions/jsapi', timestamp, nonceStr, body);

  // 3. 发送请求
  const response = await axios.post(
    'https://api.mch.weixin.qq.com/v3/pay/transactions/jsapi',
    body,
    {
      headers: {
        'Authorization': `WECHATPAY2-SHA256-RSA2048 mchid="${process.env.WECHAT_MCHID}",nonce_str="${nonceStr}",timestamp="${timestamp}",signature="${signature}",serial_no="${process.env.WECHAT_SERIAL_NO}"`,
        'Content-Type': 'application/json'
      }
    }
  );

  // 4. 返回 prepay_id（前端用这个唤起支付）
  return response.data.prepay_id;
}
```

### 步骤2：前端唤起微信支付

```javascript
// 微信JSAPI支付前端代码（在微信内置浏览器中运行）
async function invokeWechatPay(prepay_id) {
  // 后端返回的支付参数（需要后端再次签名）
  const payParams = await fetch('/api/pay/jsapi-params', {
    method: 'POST',
    body: JSON.stringify({ prepay_id })
  }).then(r => r.json());

  // 调起微信支付
  WeixinJSBridge.invoke('getBrandWCPayRequest', {
    appId: payParams.appId,
    timeStamp: payParams.timeStamp,
    nonceStr: payParams.nonceStr,
    package: payParams.package,
    signType: 'RSA',
    paySign: payParams.paySign
  }, function(res) {
    if (res.err_msg === 'get_brand_wcpay_request:ok') {
      // 支付成功 → 跳转到成功页
      window.location.href = '/pay-success';
    } else {
      // 用户取消或失败
      alert('支付未完成');
    }
  });
}
```

### 步骤3：后端接收支付回调（最关键的一步）

```javascript
// Express路由：接收微信支付的异步通知
app.post('/api/pay/notify', async (req, res) => {
  // 1. 验证签名（防止伪造回调）
  const isValid = verifyWechatSignature(req.headers, req.body);
  if (!isValid) {
    return res.status(400).json({ code: 'FAIL', message: '签名验证失败' });
  }

  // 2. 解密回调数据
  const decrypted = decryptWechatNotify(req.body.resource);
  const { out_trade_no, transaction_id, trade_state } = decrypted;

  // 3. 更新订单状态（幂等处理：同一订单号只处理一次）
  const existing = await db.getPayment(out_trade_no);
  if (existing && existing.status !== 'pending') {
    return res.json({ code: 'SUCCESS' }); // 已处理过，直接返回成功
  }

  await db.updatePayment(out_trade_no, {
    status: 'paid',
    transaction_id: transaction_id,
    paid_at: new Date()
  });

  // 4. 业务处理：开通会员/发放权益
  await activateUserService(out_trade_no);

  // 5. 必须返回成功，否则微信会重复回调
  res.json({ code: 'SUCCESS' });
});
```

### 步骤4：订单查询（主动查询支付状态）

```javascript
// 用户关闭支付页面后回来，你需要主动查一下付没付
async function checkOrderStatus(out_trade_no) {
  const response = await axios.get(
    `https://api.mch.weixin.qq.com/v3/pay/transactions/out-trade-no/${out_trade_no}?mchid=${process.env.WECHAT_MCHID}`,
    { headers: { 'Authorization': generateAuthHeader('GET', `/v3/pay/transactions/out-trade-no/${out_trade_no}`) } }
  );
  return response.data.trade_state; // SUCCESS / NOTPAY / CLOSED
}
```

---

## 四、OPC支付系统的安全铁律

### 必须遵守的5条

1. **金额在后端计算，前端只传productId**。永远不要让前端传金额，用户可以改。
2. **所有签名在服务端生成**。APIv3密钥绝对不能出现在前端代码中。
3. **回调接口必须验证签名**。不验证 = 任何人可以伪造"支付成功"。
4. **订单状态变更必须幂等**。同一个订单的同一个回调可能被微信重复发送。
5. **用HTTPS**。支付相关的所有请求必须走HTTPS。

### 测试环境

微信支付提供了沙箱环境（`https://api.mch.weixin.qq.com/sandboxnew/`），但2026年沙箱已经逐步废弃。**建议直接在正式环境做1分钱测试。**

---

## 五、常见翻车与解决

| 翻车 | 现象 | 根因 | 解决 |
|---|---|---|---|
| **signature error** | 预支付订单创建失败 | 签名算法有误或证书路径不对 | 用微信官方调试工具验证签名 |
| **回调收不到** | 用户付了钱订单状态不变 | notify_url不可达或没有公网IP | 本地开发用ngrok穿透；生产环境检查防火墙 |
| **重复支付** | 同一个订单用户付了两次 | 未做幂等处理 | 回调入口第一行就查订单状态 |
| **金额不对** | 用户付了1分钱获得999元的会员 | 前端传了amount参数 | 从前端只接收productId，后端查数据库获取价格 |
| **openid获取失败** | JSAPI支付无法发起 | 未在微信内打开或未授权 | 确保页面在微信内打开，已完成网页授权 |

---

## 六、检查清单

- [ ] 微信商户号已申请
- [ ] APIv3证书已下载并配置到服务器环境变量
- [ ] 金额完全在后端计算
- [ ] 回调接口已验证能正常接收+验签
- [ ] 订单状态变更有幂等保护
- [ ] 做过1分钱真实支付测试
- [ ] HTTPS已配置
- [ ] 前端从未出现API密钥

---

## 节点资源链接

- 节点15：核心功能3开发
- 节点17：国内支付接入
- 节点18：开发者自测流程
