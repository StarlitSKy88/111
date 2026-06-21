---
node_id: 47
persona: neutral
cta_type: wechat
keywords: [企业, 邮箱, 域名, 邮件, 腾讯企业邮]
---

# 节点47：企业邮箱搭建

> **面向OPC**：用 QQ/163 邮箱给客户发报价 = 看起来不专业。**企业邮箱** = 域名后缀的邮箱（`you@yourdomain.com`），专业度立刻提升 80%。

---

## 一、为什么必须用企业邮箱

| 维度 | QQ/163 邮箱 | 企业邮箱 |
|:---|:---|:---|
| 专业度 | ❌ 像个人 | ✅ 看起来正规公司 |
| 送达率 | 容易被拦 | 高（白名单）|
| 容量 | 有限 | 通常无限 |
| 管理 | 自己用 | 全员可管 |
| **OPC 推荐** | ❌ 客户沟通禁用 | ✅ 必用 |

**成本**：5-10 用户 = 600-1500 元/年（30% 的客户咨询费就能覆盖）。

---

## 二、3 个主流企业邮箱对比

| 服务 | 价格（5 用户）| 易用性 | 适合 |
|:---|:---|:---|:---|
| **腾讯企业邮** | 600 元/年 | ⭐⭐⭐⭐⭐ | 国内首选 |
| **阿里云邮箱** | 600 元/年 | ⭐⭐⭐⭐ | 阿里云用户 |
| **Google Workspace** | $6/月/人（≈ 2600/年）| ⭐⭐⭐⭐⭐ | 海外用户多 |

**OPC 默认选腾讯企业邮**：国内送达率最高 + 中文支持 + 微信集成。

---

## 三、腾讯企业邮 5 步配置

### Step 1：注册 + 验证域名

1. 打开 exmail.qq.com → 立即开通
2. 选"基础版"（免费 5 用户）或"专业版"（¥100/用户/年）
3. 添加你的域名（如 `yourdomain.com`）

### Step 2：DNS 解析

去域名服务商（阿里云/腾讯云/Cloudflare）加 3 条记录：

```
类型: MX, 主机: @, 值: mxbiz1.qq.com., 优先级: 5
类型: MX, 主机: @, 值: mxbiz2.qq.com., 优先级: 10
类型: TXT, 主机: @, 值: v=spf1 include:spf.mail.qq.com ~all
```

### Step 3：添加成员

- 管理员后台 → 成员管理 → 添加成员
- 设置：`you@yourdomain.com`

### Step 4：客户端配置

| 协议 | 服务器 | 端口 |
|:---|:---|:---:|
| IMAP | imap.exmail.qq.com | 993 |
| SMTP | smtp.exmail.qq.com | 465 |
| POP3 | pop.exmail.qq.com | 995 |

### Step 5：发送测试

```bash
# 用 swaks 测试 SMTP
swaks --to test@gmail.com \
      --from you@yourdomain.com \
      --server smtp.exmail.qq.com:465 \
      --auth-user you@yourdomain.com \
      --auth-password '授权码' \
      --tls
```

---

## 四、3 个高级设置

### 1. SPF / DKIM / DMARC

| 记录 | 作用 |
|:---|:---|
| **SPF** | 防止伪造发件人 |
| **DKIM** | 邮件签名验证 |
| **DMARC** | 失败处理策略 |

3 条都配 = 邮件送达率从 80% 提升到 99%。

### 2. 群组 / 邮件列表

```
sales@yourdomain.com  → 转发给 3 个销售
support@yourdomain.com → 转发给 1 个客服
```

### 3. 自动回复

新询盘自动回复：
```
感谢您的来信，我会在 24 小时内回复您。
```

**OPC 必备**：节假日、休息时段也要有自动回复。

---

## 五、用企业邮箱发应用的 3 个配置

### 1. 应用 SMTP 发邮件

```javascript
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  host: 'smtp.exmail.qq.com',
  port: 465,
  secure: true,
  auth: {
    user: 'noreply@yourdomain.com',
    pass: '授权码',  // 不是登录密码！
  },
});

await transporter.sendMail({
  from: '"OPC" <noreply@yourdomain.com>',
  to: 'user@example.com',
  subject: '欢迎注册',
  html: '<h1>欢迎！</h1>',
});
```

### 2. 申请"授权码"（不是登录密码）

腾讯企业邮后台 → 设置 → 客户端专用密码 → 生成新密码。

### 3. 不要用 25 端口

云厂商（阿里云/腾讯云）默认封 25 端口，**必须用 465（SSL）或 587（STARTTLS）**。

---

## 六、3 个常见错误

### 错误 1：域名没备案就发邮件

国内邮箱**要求域名备案**才能正常发。海外邮箱不需要。

### 错误 2：把授权码推到 GitHub

**绝对禁止**。授权码 = 邮件账号密码 = 任何人都能发邮件。

### 错误 3：每天发 100 封营销邮件

**后果**：进垃圾箱 + 域名被标记。
**OPC 解法**：营销用第三方（如 Mailchimp），不要用企业邮箱。

---

## 七、检查清单

- [ ] 买了 1 个域名（如果没有）
- [ ] 注册腾讯企业邮 / 阿里云邮箱
- [ ] DNS 解析（MX + SPF）
- [ ] 创建 `you@yourdomain.com`
- [ ] 客户端测试收发
- [ ] 应用 SMTP 配置好
- [ ] 授权码存到环境变量

---

## 节点资源链接

- 节点24：域名购买与ICP备案
- 节点50：广告合规
- 节点52：服务器安全防护
