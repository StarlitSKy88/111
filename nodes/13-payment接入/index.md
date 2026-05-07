# 国内支付接入

## 需求文档

### 基本信息
- **节点ID**: 13
- **slug**: payment接入
- **分类**: 0-1
- **难度**: 进阶
- **咨询价格**: ¥299

## 当前内容

### 概述

做互联网生意，收钱是核心能力。国内移动支付已经被微信和支付宝垄断，这两家的商户号覆盖率超过95%。对于OPC来说，接入支付不是技术问题，而是资质和流程问题。本节点详解微信支付和支付宝的接入方案，以及如何选择适合自己的支付产品。

### 详细说明

#### 一、支付产品类型选择

**1.1 扫码支付 vs API支付**

| 类型 | 适用场景 | 特点 |
|:---|:---|:---|
| **扫码支付（面对面）** | 线下展示二维码，用户扫码付款 | 无需技术对接，用户扫商户二维码 |
| **H5支付** | 移动端网页 | 唤起微信/支付宝APP支付 |
| **JSAPI支付** | 微信公众号内 | 需绑定公众号 |
| **App支付** | 移动APP内 | 唤起支付APP |
| **Native支付** | PC网站 | 生成二维码让用户扫码 |

**OPC最常用的组合**：Native支付（PC网站）+ H5支付（移动端）

**1.2 聚合支付是什么**

聚合支付（如收钱吧、拉卡拉）将微信、支付宝、云闪付等多个通道整合成一个接口，让商户只需对接一次。适合有多种支付需求的场景，但需要注意资金安全（聚合支付商会代付，存在资金池风险）。

**不建议OPC使用**：聚合支付商会增加一层资金风险，且费率通常比直连微信/支付宝高0.1-0.2%。

#### 二、微信支付接入全流程

**2.1 前置条件**

接入微信支付必须具备：
- 已认证的微信公众号（订阅号/服务号）或微信小程序
- 已备案的域名（用于支付回调）
- 对公银行账户（收款账户）

**2.2 申请流程**

1. **登录微信支付商户平台**：https://pay.weixin.qq.com
2. **进入"产品中心"→"接入微信支付"**
3. **选择商户类型**（普通商户，最常见）
4. **填写商户信息**：营业执照、法人信息、对公账户
5. **等待审核**：通常1-3个工作日
6. **签署协议**：审核通过后在线签署《微信支付服务协议》
7. **获取商户号和API密钥**：在商户平台 → 账户中心 → API密钥

**2.3 技术对接：Native支付示例**

```javascript
// 微信Native支付下单（Node.js示例）
const crypto = require('crypto');

function createNativeOrder(orderId, totalAmount, notifyUrl) {
  const params = {
    appid: 'your_app_id',
    mch_id: 'your_mch_id',
    nonce_str: crypto.randomBytes(16).toString('hex'),
    body: 'OPC咨询服务-订单' + orderId,
    out_trade_no: orderId,
    total_fee: totalAmount * 100, // 单位：分
    spbill_create_ip: '用户IP',
    notify_url: notifyUrl,
    trade_type: 'NATIVE'
  };

  // 生成签名
  const sign = generateSign(params, 'your_api_key');
  params.sign = sign;

  // 发送请求
  const xml = arrayToXml(params);
  const response = await axios.post('https://api.mch.weixin.qq.com/pay/unifiedorder', xml);

  // 返回code_url用于生成二维码
  return parseXml(response.data).code_url;
}
```

**2.4 支付回调处理**

用户支付成功后，微信会发送异步通知到你的 notify_url。需要：
1. 验证签名
2. 检查订单状态
3. 更新本地订单
4. 返回 SUCCESS 表示已处理

```javascript
// 微信支付回调处理
app.post('/api/pay/wx-notify', (req, res) => {
  const xml = req.body;
  const params = parseXml(xml);

  // 验证签名
  if (!verifySign(params, 'your_api_key')) {
    return res.send('FAIL');
  }

  // 处理订单
  if (params.result_code === 'SUCCESS') {
    updateOrderStatus(params.out_trade_no, 'paid');
  }

  res.send('SUCCESS');
});
```

#### 三、支付宝接入全流程

**3.1 前置条件**

- 企业支付宝账号（需要营业执照认证）
- 对公银行账户
- 已备案域名

**3.2 申请流程**

1. **登录支付宝商家中心**：https://b.alipay.com
2. **选择"产品中心"→"支付产品"**
3. **选择需要的产品**（电脑网站支付/手机网站支付/App支付）
4. **提交资料**：营业执照、法人信息、对公账户
5. **审核**：1-3个工作日
6. **获取AppID和密钥**：在开放平台创建应用

**3.3 技术对接：电脑网站支付示例**

```javascript
// 支付宝电脑网站支付（Node.js示例）
const AlipaySDK = require('alipay-sdk').default;

const alipay = new AlipaySDK({
  appId: 'your_app_id',
  privateKey: 'your_private_key',
  alipayPublicKey: 'alipay_public_key'
});

async function createDesktopPayOrder(orderId, amount) {
  const result = await alipay.exec('alipay.trade.page.pay', {
    outTradeNo: orderId,
    productCode: 'FAST_INSTANT_TRADE_PAY',
    totalAmount: amount.toString(),
    subject: 'OPC咨询服务-订单' + orderId,
    returnUrl: 'https://your-domain.com/pay/return'
  });
  return result;
}
```

#### 四、支付安全与合规

**4.1 资金安全**

- **交易限额**：新商户初期有限额，随着交易量增加逐渐提升
- **T+1结算**：资金第二个工作日到账，防范欺诈
- **风控**：大额或异常交易会被微信/支付宝延迟或拦截

**4.2 税务合规**

- 所有收款必须入账到公司对公账户
- 保留完整的交易记录至少5年
- 年度结算时，微信/支付宝提供的账单可作为报税凭证

**4.3 防诈骗注意事项**

- 不要相信"低费率"诈骗（正规渠道费率0.6%，过低可能是诈骗）
- 官方不会索要你的支付密钥
- 资金结算到账才是真正的到账，不要轻信"冻结"等说辞

### 常见问题

**Q1: 微信支付和支付宝哪个先申请？**

A: 建议先申请微信支付（用户覆盖广），再申请支付宝（电商用户多）。两者不冲突，可以同时开通。

**Q2: 支付费率能谈低吗？**

A: 月交易量超过10万可以联系客户经理申请降低费率，最低可到0.38%。

**Q3: 技术对接复杂吗？**

A: 微信和支付宝都提供完整的SDK和文档，有一定开发经验的话1-2天可以完成对接。

**Q4: 遇到支付投诉怎么办？**

A: 在商户平台处理，保留好发货凭证和沟通记录。恶意投诉可以申诉。

**Q5: 资金多久到账？**

A: 标准T+1结算。优质商户可申请T+0（当日到账）。

**Q6: 没有技术能接入支付吗？**

A: 可以使用SaaS版支付工具（如有赞、微店），无需技术对接，但需要支付额外服务费。

**Q7: 支付接口需要收费吗？**

A: 申请本身不收费，按交易额收取手续费（标准0.6%）。

**Q8: 遇到系统维护怎么办？**

A: 关注微信支付和支付宝的官方公告，通常维护会提前通知。

### 相关资源

- [OPC节点百科·完整地图](index.html)
- [GStack需求梳理方法论](https://gstack.cn)
- [一人公司创业模型白皮书2026](docs/opc-whitepaper-2026.pdf)

---

*本文档由 OPC节点百科 AI内容引擎 生成*
*版本: v1.0*
*最后更新: 2026-05-07*
*AI模型: deepseek-v4-flash*
*审核状态: 待人工审核*