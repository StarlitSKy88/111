---
node_id: 6
persona: ranmu
cta_type: wechat
keywords: [技术, 选型, 框架, 工具, 零基础]
---

# 节点06：技术选型（零基础专属）

> **面向OPC**：如果你不是程序员出身，技术选型 = **降低你放弃的概率**。选错框架 = 6 个月后你卡在一个小问题上就放弃了。本节点只推荐**最不容易让你放弃**的栈。

---

## 一、零基础的 3 个铁律

1. **不要选最"先进"的栈** — 选社区最大、教程最多的
2. **不要用 5 个工具拼一个产品** — 用一个全栈框架
3. **不要为了省钱用免费方案** — 一年 1000 元的成本不要省

---

## 二、推荐栈：3 个组合（按场景选）

### 组合 A：纯前端 / 落地页（最快上线）

| 层 | 工具 | 成本 |
|:---|:---|:---|
| 前端 | HTML + Tailwind CSS | 免费 |
| 后端 | 无 / 第三方 API | 免费 |
| 部署 | Vercel / Netlify | 免费 |
| 数据 | Airtable | 免费 |
| **学习时间** | **3 天** | |

适用场景：MVP 验证、Landing Page、内容站

### 组合 B：全栈 Web 应用（推荐，80% 适用）

| 层 | 工具 | 成本 |
|:---|:---|:---|
| 前端 | Next.js (React) | 免费 |
| 后端 | Next.js API Routes | 免费 |
| 数据库 | Supabase (PostgreSQL) | 免费额度 |
| 认证 | Supabase Auth | 免费 |
| 部署 | Vercel | 免费 |
| **学习时间** | **2-4 周** | |

适用场景：SaaS 工具、订阅产品、CMS

### 组合 C：AI 应用（2026 年首选）

| 层 | 工具 | 成本 |
|:---|:---|:---|
| 前端 | Next.js + shadcn/ui | 免费 |
| AI | MiniMax-M3 / Claude | 按 token |
| 后端 | Next.js + Python (FastAPI) | 免费 |
| 数据 | Supabase | 免费额度 |
| 部署 | Vercel + Railway | 50 元/月 |
| **学习时间** | **4-6 周** | |

适用场景：AI 工具、智能客服、内容生成

---

## 三、不要用的栈（OPC 死亡组合）

- ❌ **WordPress + 各种插件** — 1 年后维护地狱
- ❌ **自己搭服务器 + Nginx + MySQL** — 不是程序员的 OPC 千万别
- ❌ **微服务架构** — 1 个用户都没有就上微服务 = 找死
- ❌ **3 个编程语言混用** — Python + Go + Rust = 永远学不完

---

## 四、3 个工具选择的具体建议

### 数据库：Supabase 而不是 MongoDB

| 维度 | Supabase (Postgres) | MongoDB |
|:---|:---|:---|
| 学习曲线 | SQL 通用，教程多 | 文档型，新概念多 |
| 免费额度 | 500MB | 512MB |
| 真实项目使用率 | 80% | 15% |
| **OPC 推荐** | ✅ | ❌ |

### 部署：Vercel 而不是自建

| 维度 | Vercel | 自建服务器 |
|:---|:---|:---|
| 难度 | 1 命令部署 | 要懂 Linux |
| HTTPS | 自动 | 自己配 |
| 扩容 | 自动 | 自己配 |
| **OPC 推荐** | ✅ | ❌ |

### 认证：Clerk 或 Supabase Auth

Clerk 现成 UI 漂亮，Supabase Auth 集成深。两者二选一，**不要用 firebase auth**（国内访问慢）。

---

## 五、检查清单

- [ ] 选定一个组合（A/B/C）
- [ ] 装好 Node.js 20 LTS
- [ ] 注册 Vercel / Supabase 账号
- [ ] 用 Next.js 创建一个 hello world 页面并部署
- [ ] 选型已写在 CLAUDE.md 或决策文档

---

## 节点资源链接

- 节点07：开发环境安装
- 节点08：Hello World 启动
- 节点55：外包策略与执行
