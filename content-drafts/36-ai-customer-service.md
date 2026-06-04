---
node_id: 36
persona: neutral
cta_type: wechat
keywords: [AI, 客服, 自动, 答疑, 机器人]
---

# 节点36：AI 客户服务

> **面向OPC**：OPC 的客服时间最多 1 小时/天，超时就必须用 AI 自动化。本节点教你用 **Coze / Dify** 等工具，1 周内让 AI 客服覆盖 80% 常见问题。

---

## 一、AI 客服的 3 个适用场景

| 场景 | 自动化收益 | 难度 |
|:---|:---|:---:|
| **常见问题 FAQ** | 节省 70% 时间 | 简单 |
| **产品使用引导** | 节省 50% 时间 | 中等 |
| **投诉/退款处理** | 节省 30% 时间 | 困难 |

**OPC 优先做 FAQ 自动化**，投诉仍由人工处理。

---

## 二、3 个工具对比（OPC 推荐）

| 工具 | 价格 | 易用性 | 适合场景 |
|:---|:---|:---|:---|
| **Coze（字节）** | 免费 1 万次/月 | ⭐⭐⭐⭐⭐ | 中文客服首选 |
| **Dify** | 开源免费 | ⭐⭐⭐⭐ | 自部署 / 数据安全 |
| **ChatGPT API** | $0.01/1k tokens | ⭐⭐⭐ | 英文 / 复杂对话 |

**OPC 推荐 Coze**：免费额度够用 6 个月 + 拖拽式搭建 + 微信/网站集成。

---

## 三、Coze 搭建 AI 客服（1 小时）

### Step 1：注册 + 创建 Bot

1. 打开 coze.cn → 注册（用手机号）
2. 工作空间 → 创建 Bot
3. 选 LLM：`MiniMax-M3` 或系统默认

### Step 2：写人设 + 知识库

```
人设：
你叫"小助手"，是 [产品名] 的 AI 客服。
回答限制在 50 字内，不要瞎编。
不确定时回复"请联系人工：微信号 xxx"。

知识库（上传）：
- 产品使用手册 PDF
- FAQ 表格
- 历史客服对话
```

### Step 3：配置触发器

| 渠道 | 配置 |
|:---|:---|
| **网站** | 嵌入 JS 代码，3 行 |
| **微信公众号** | 服务号 → 客服消息 |
| **微信小程序** | Coze 提供 SDK |
| **微信群** | 接入机器人 webhook |

### Step 4：上线 + 监控

- 先小流量（10% 用户）
- 每天看 5 条 AI 对话，标记"答错"
- 答错的内容加入"知识库"或设"触发人工"

---

## 四、3 个让 AI 客服变聪明的技巧

### 1. 知识库 > Prompt

**AI 答得好不好 = 知识库全不全**。把 100 篇历史客服对话都喂给它。

### 2. 设置"兜底"

```yaml
如果用户问到以下话题：
- 退款
- 法律纠纷
- 投诉
→ 触发人工客服
```

### 3. 持续迭代

每周看 10 条 AI 对话，把"答错"的整理成新 FAQ。

---

## 五、OPC 私域 AI 客服的 3 种实现

### 1. 微信群机器人（最常见）

用 **Wechaty** + Coze API：
```javascript
const { WechatyBuilder } = require('wechaty');
const axios = require('axios');

const bot = WechatyBuilder.build({ puppet: 'wechaty-puppet-wechat' });

bot.on('message', async (msg) => {
  if (msg.room() || !msg.text().startsWith('@AI')) return;
  const question = msg.text().replace('@AI', '').trim();
  const res = await axios.post('https://api.coze.cn/v3/chat', {
    bot_id: 'xxx',
    user_id: msg.talker().id,
    query: question,
  }, { headers: { Authorization: 'Bearer xxx' } });
  await msg.say(res.data.messages[0].content);
});
```

### 2. 公众号自动回复

- 服务号 → 客服消息 → 接入 Coze webhook
- 关注自动回复 + 关键词回复

### 3. 网站悬浮客服

- 用 **Crisp / Tawk** 集成 Coze
- 网页右下角弹气泡

---

## 六、3 个常见错误

### 错误 1：AI 全自动，0 人工

**错**。AI 答错率 20%，必须有 1V1 兜底。

### 错误 2：知识库 = 整本产品文档

**错**。AI 看 1000 页文档 = 找不到重点。**只放 FAQ + 关键功能说明**。

### 错误 3：忽略数据隐私

**错**。用户手机号、订单号不要喂给 AI 训练。先脱敏。

---

## 七、检查清单

- [ ] 选了 1 个 AI 客服工具（推荐 Coze）
- [ ] 知识库至少 30 条 FAQ
- [ ] 接入 1 个渠道（网站/微信/小程序）
- [ ] 设置"兜底转人工"规则
- [ ] 每周看 10 条对话 + 迭代

---

## 节点资源链接

- 节点34：用户反馈收集
- 节点35：社群与私域运营
- 节点37：客户异议应对
