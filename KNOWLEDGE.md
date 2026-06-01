---
name: "opcone-knowledge"
description: "opcone 项目知识沉淀 - OPC节点百科3.0"
date: "2026-06-01"
status: "持续积累中"
---

# opcone 项目知识沉淀

> 本文档是 opcone 项目的知识积累中心，沉淀蕾姆在项目中发现的坑点、约定、架构决策等，供后续开发复用。
> 与 `CLAUDE.md`（项目规范）不同，这里更侧重**隐性知识**和**踩坑记录**。

---

## 一、项目核心信息

| 项目 | 内容 |
|------|------|
| **项目名** | OPC节点百科3.0 |
| **愿景** | 让一个人公司创业变得简单 |
| **阶段数** | 8个阶段，57个节点 |
| **技术栈** | Vanilla JS + Tailwind CDN / Node.js + Express (CommonJS) / JSON文件持久化 |
| **端口** | 前端 3000，API服务 3001 |

---

## 二、已知卡点（踩坑记录）

### 2.1 邮件模块 ⚠️ 2026-05-27

**问题**：注册流程需要邮箱验证码

**解决方案**：
- 邮件服务：腾讯云邮件推送，SMTP `gz-smtp.qcloudmail.com:465`
- 发件地址：`nodemailer@taomyst.top`
- 验证码存储：`/data/verify-codes.json`
- 用户数据：`/data/users.json`

**相关代码**：
- 邮箱模块：`api/utils/email.js`
- 注册逻辑：`api/auth/index.js` → `handleRegister()`
- API路由：`/api/auth/register`、`/api/auth/send-verify-code`

**注意**：Edit工具修改 `handleRegister` 失败时，用 Write 工具重写整个文件

---

### 2.2 微信支付 ⚠️ 已知卡点

**状态**：主体不一致问题，暂未完全解决

**现状**：
- AppID 主体：肖阳（个人小程序"不吃软饭碳水研究所"）
- 商户号主体：北京抓马提客文化发展有限公司
- 主体不一致导致 JSAPI 权限/退款 API 权限无法完全开通

**不要重复排查此问题** — 解决方案：完成主体一致性确认或修正绑定关系

---

## 三、模块架构速查

### 3.1 数据存储

```
DATA_DIR = /Users/opc-1/Downloads/O/opcone/data/
├── users.json           # 用户数据
├── verify-codes.json    # 邮箱验证码
├── subscriptions.json   # 订阅记录
├── purchases.json      # 购买记录
├── nodes.json          # 57节点数据
├── results.json       # 测试结果
└── payments.json      # 支付记录
```

### 3.2 角色体系

```
ROLES = { guest, free, paid, admin }
ROLE_LEVEL = { guest: 0, free: 1, paid: 2, admin: 99 }
```

- **GUEST（游客）**：未登录，只能看首页
- **FREE（免费用户）**：已注册，基础节点可见
- **PAID（付费用户）**：已订阅，全部节点可见
- **ADMIN（管理员）**：全部权限 + 管理后台

**免费节点白名单**：`FREE_NODES = [1]` — 仅节点01可见

---

### 3.3 API路由

| 路由 | 文件 | 说明 |
|------|------|------|
| `/api/auth/register` | `api/auth/index.js` | 用户注册 |
| `/api/auth/send-verify-code` | `api/auth/index.js` | 发送验证码 |
| `/api/data-store.js` | — | 数据存储通用API |

---

## 四、样式系统

### 4.1 CSS变量（深色主题）

```css
--color-bg: #111110;        /* 深色背景 */
--color-accent: #C0392B;    /* 强调色 - 红色 */
--color-text: #F5F5F5;      /* 主文本 */
--color-muted: #888888;     /* 次要文本 */
```

### 4.2 Tailwind CDN

```html
<script src="https://cdn.tailwindcss.com"></script>
```

---

## 五、坑点记录

| 日期 | 坑点 | 解决方案 |
|------|------|---------|
| 2026-05-27 | 注册流程需先发送验证码再完成注册 | `handleRegister()` 返回 `need_verify: true`，前端跳转验证码确认页 |
| 2026-05-27 | Edit工具修改 handleRegister 有时会失败 | 改用 Write 工具重写整个文件 |
| — | 微信支付主体不一致 | 不要重复排查，已知卡点 |

---

## 六、待验证项

| 节点 | 待验证内容 | 状态 |
|------|-----------|------|
| 节点06 | 核心功能开发 - 待验证 | 🟡 进行中 |
| 节点20 | Bug修复 - 待验证 | 🟡 进行中 |
| 节点22 | 启动内容 - 待验证 | 🟡 进行中 |

---

## 七、AI模型配置

```
OPENAI_API_KEY / DEEPSEEK_API_KEY - AI模型API密钥（见 api/.env）
TOKEN_HUB_APP_ID / TOKEN_HUB_API_KEY - 腾讯TokenHub配置
```

---

## 八、副业知识库（附录）📚

> 本节是 opcone 项目的"知识外延"——为用户提供的副业/创业资料索引。
> 不是项目代码的一部分，但是蕾姆在回答"如何用 AI 赚钱"相关问题时的参考。

### 8.1 ai-money-maker-handbook（AI 副业赚钱大集合）

| 维度 | 信息 |
|------|------|
| **GitHub** | [XiaomingX/ai-money-maker-handbook](https://github.com/XiaomingX/ai-money-maker-handbook) |
| **Stars** | 2.5K |
| **License** | Apache 2.0 |
| **官网** | https://mp.jobleap4u.com/ |
| **更新** | 2026-06-01（持续活跃）|

**三大核心板块**：

1. **程序员的副业赚钱宝典**（425 章）—— 副业实操 + 财务计算
2. **创业者早期的烦恼树洞**（39 章）—— 融资/股权/合规 Q&A
3. **专题合集** —— 出海技术栈、1000 个独立开发者项目

**8 大核心话题（与 opcone 用户强相关）**：
- MAU/ARR/PMF 指标
- 可转债 vs 可转换优先股
- SAFE 协议
- 出海推广渠道
- 应用上线自查清单
- 出海技术栈
- 天使/A/B 轮融资
- GDPR/CCPA 合规

**6 大搞钱原则**：
1. 做垂类而非平台
2. 顺应人性
3. 从小切入
4. 开源赚流量
5. 做国外市场
6. 赚有钱人的钱

### 8.2 show-me-the-money（24/7 自动化经营 skill 套件）

| 维度 | 信息 |
|------|------|
| **GitHub** | [evsong/show-me-the-money](https://github.com/evsong/show-me-the-money) |
| **形态** | Claude Code skill 套件 |
| **License** | CC BY-NC 4.0（非商业）|
| **核心 slogan** | "from idea to revenue, 24/7" |

**自动化经营命令**：

| 命令 | 功能 |
|------|------|
| `/money-discover` | 找创意 + 竞品分析 |
| `/money-validate` | 6 问需求验证 + 5 维评分 |
| `/money-build` | MVP 构建、部署、QA、监控 |
| `/money-content` | 12 信号真实性审计 |
| `/money-outreach` | 冷邮件 + 合作外联 |
| `/money-social` | 社媒 + hook 写作 |
| `/money-seo` | SEO + GEO 优化 |
| `/money-ads` | Google/Meta Ads 投放 |
| `/money-ops` | 24/7 自动化运营 |

### 8.3 与 opcone 的协同点

| 节点 | 关联资源 |
|------|---------|
| **节点 01** OPC 适配测试 | show-me-the-money: `/money-validate` |
| **节点 03-04** 想法筛选 / 原型 | show-me-the-money: `/money-discover` |
| **节点 17-25** 支付/公司/合规 | ai-money-maker-handbook: GDPR/CCPA 章节 |
| **节点 38-42** 定价/广告/转介绍/复盘 | show-me-the-money: `/money-ads` + `/money-content` |
| **节点 53** 海外支付 | ai-money-maker-handbook: 出海技术栈 |

### 8.4 阅读路径建议

为 opcone 用户推荐：

1. **基础认知** → AI 搞钱原则手册
2. **产品指标** → MAU/ARR/PMF 章节
3. **出海准备** → 出海合规 + 出海技术栈
4. **融资知识** → 融资轮次 + SAFE + 动态股权分配
5. **实操** → 1000 个独立开发者项目（找对标）

---

*最后更新：2026-06-01 by 蕾姆*