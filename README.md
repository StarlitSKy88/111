# OPC 节点百科 3.0 + ONE-MCN 一人 MCN 飞轮

> **项目代号**：opcone（OPC ONE — One Person Company + One-MCN）
> **作者**：蕾姆（中立产品经理 + 资深产品顾问）
> **更新日期**：2026-06-04 02:00
> **架构版本**：v2.0.3（**重大修正**：所有命令对齐真实 Hermes Agent 0.15.1）
> **三视角综合评分**：β 9.0/10 + α 3.5/10 = **6.3/10**（执行中逐步提升）

> ⚠️ **v2.0.2 → v2.0.3 重要变更**：v1 的 4 个核心 md 文档（INSTALL / M1-SOP / AGENT-PROMPTS / DEPLOY.sh）大量使用**虚构命令**，v2.0.3 已全部替换为真实 Hermes 0.15.1 命令。详见 `ONE-MCN-SUMMARY-2026-06-04.md` §A1 + 每个文档的 v1.0→v2.0.3 变更清单。

---

## 🎯 项目定位（2026-06-04 三视角校准）

本项目 = **OPC 节点百科 3.0**（已完成 28%）+ **ONE-MCN 一人 MCN**（新增 v2.0.2）。**两者是飞轮关系，不是主从**。

```
        ┌─────────────┐
        │   ONE-MCN   │  ←  获客引擎
        │  视频/直播  │      公域引流 → 私域沉淀 → 知识付费
        └──────┬──────┘
               ↓ 内容选题
        ┌─────────────┐
        │  OPC 百科   │  ←  信任锚点
        │  57 节点    │      结构化深度内容 + SEO 长尾流量
        └──────┬──────┘
               ↓ 用户决策
        ┌─────────────┐
        │ 课程/咨询/  │  ←  变现载体
        │   社群      │      训练营 + 陪跑 + 合伙人
        └──────┬──────┘
               ↓ 反馈数据
        (回到 ONE-MCN 选题)
```

| 角色 | 模块 | 状态 |
|:---|:---|:---|
| 获客引擎 | **ONE-MCN** | v2.0.2 已闭环 |
| 信任锚点 | **OPC 节点百科 3.0** | 完工 28%（16/57），**关键瓶颈** |
| 变现载体 | 课程 ¥0/¥199/¥999/¥3999/¥4999 | 待 M1 验证 |

> **核心瓶颈**：OPC 百科完工率 28% → **M1 启动前至少补到 50%（30/57）**
> **三视角建议**：29 天内"1 视频号 + 3 短视频 + 1 最小课 + 10 百科节点"——**立刻砍范围跑闭环**

---

## 📂 文档体系（v2.0.3，~5800 行）

| 入口 | 文档 | 版本 | 用途 |
|:---:|:---|:---:|:---|
| 🚪 | **[ONE-MCN-README-v2.0.md](ONE-MCN-README-v2.0.md)** | v2.0 | 项目总入口（飞轮架构 + Day 1 启动）|
| 📋 | **[ONE-MCN-SUMMARY-2026-06-04.md](ONE-MCN-SUMMARY-2026-06-04.md)** | **v1.0 NEW** | **7 问题回答 + 资源清单 + 状态总览** |
| 🏗️ | [ONE-MCN-HARNESS-v2.0.md](ONE-MCN-HARNESS-v2.0.md) | v2.0 | 核心架构 + 5 类爆款公式 + 5 阶漏斗 + 24 月路径 |
| 🤖 | [ONE-MCN-AGENT-MATRIX.md](ONE-MCN-AGENT-MATRIX.md) | v2.0 | 12 Agent 详细配置 + Hermes 集成 |
| 📝 | [ONE-MCN-AGENT-PROMPTS.md](ONE-MCN-AGENT-PROMPTS.md) | **v2.0.3** | 16 Skill 索引 + A4 10 变体（**已修正虚构命令**）|
| 🚀 | [ONE-MCN-DEPLOY.sh](ONE-MCN-DEPLOY.sh) | **v2.0.3** | VPS 一键部署脚本（**已修正虚构命令**）|
| 🔧 | [ONE-MCN-INSTALL.md](ONE-MCN-INSTALL.md) | **v2.0.3** | 安装命令清单（**已修正虚构命令**）|
| 📅 | [ONE-MCN-M1-SOP.md](ONE-MCN-M1-SOP.md) | **v2.0.3** | M1 7 天 SOP（**已修正虚构命令**）|
| 🎯 | [ONE-MCN-100-ACCOUNTS-SCAN.md](ONE-MCN-100-ACCOUNTS-SCAN.md) | v2.0 | 30 账号扫描池（M1 阶段）|
| 📊 | [ONE-MCN-EVALUATION-REPORT.md](ONE-MCN-EVALUATION-REPORT.md) | v2.0 | CEO 级评估 |
| 💰 | [ONE-MCN-BUSINESS-PLAN.md](ONE-MCN-BUSINESS-PLAN.md) | v2.0 | 商业计划 + 财务模型 |
| 📋 | [ONE-MCN-PRD.md](ONE-MCN-PRD.md) | v2.0 | 产品需求 |
| 🛠️ | [one-mcn-skills/](one-mcn-skills/) | **v1.0.0 × 16 NEW** | 16 个 Hermes Skill（a1-a7 / b1-b3 / c1-c4 / d1-sop / g0-guard）|

---

## ⚡ 快速启动

```bash
# 1. OPC 节点百科（已上线 https://opc.taomyst.top）
bash start.sh

# 2. ONE-MCN 后台 Hermes Agent
bash ONE-MCN-DEPLOY.sh

# 3. ONE-MCN 前台 HermesPet（Mac 单独装）
# 下载 DMG: https://github.com/basionwang-bot/HermesPet/releases/latest
```

| 服务 | 端口 | 地址 |
|:---|:---:|:---|
| OPC 落地页 | 80 | http://opc.taomyst.top/ |
| OPC API | 3001 | http://opc.taomyst.top/api/ |
| OPC 管理后台 | 80 | http://opc.taomyst.top/admin.html |
| ONE-MCN 控制台 | 8080 | http://43.160.213.118:8080/ |

---

## 🛠️ 技术栈

| 模块 | 技术 |
|:---|:---|
| 前端 | Vanilla JS + Tailwind CDN（OPC 百科）|
| 后端 | Node.js v22.22.2 + Express (CommonJS) |
| 持久化 | JSON 文件（无数据库）|
| AI | DeepSeek V4 Flash + 腾讯 TokenHub |
| 邮件 | 腾讯云邮件推送 (gz-smtp.qcloudmail.com:465) |
| 部署 | PM2 v7.0.1 + Nginx（已在生产）|
| ONE-MCN 后台 | Hermes Agent (NousResearch 178K★, MIT) |
| ONE-MCN 前台 | HermesPet (Basion Wang, 200+★, Apache 2.0) |

---

## 📂 项目结构

```
opcone/
├── 入口文档
│   ├── README.md                      # 本文件（项目总入口 v2.0.2）
│   ├── CLAUDE.md                      # AI 上下文（含 57 节点 + 设计规范）
│   ├── KNOWLEDGE.md                   # 隐性知识沉淀
│   ├── AGENTS.md                      # 内存上下文
│   ├── CHANGELOG.md                   # 变更日志
│   ├── TOOLS-TASKS.md                 # 工具教程原子任务
│   └── DESIGN-AUDIT.md                # Ma 极简主义审计
│
├── ONE-MCN 一人 MCN（v2.0.2）
│   ├── ONE-MCN-README-v2.0.md         # 飞轮架构 + Day 1 启动
│   ├── ONE-MCN-HARNESS-v2.0.md        # 核心架构
│   ├── ONE-MCN-AGENT-MATRIX.md        # 12 Agent 配置
│   ├── ONE-MCN-AGENT-PROMPTS.md       # 15 prompt 模板
│   ├── ONE-MCN-DEPLOY.sh              # 一键部署脚本
│   ├── ONE-MCN-INSTALL.md             # 安装命令清单
│   ├── ONE-MCN-M1-SOP.md              # M1 7 天 SOP
│   ├── ONE-MCN-100-ACCOUNTS-SCAN.md   # 扫描池
│   ├── ONE-MCN-EVALUATION-REPORT.md   # 评估
│   ├── ONE-MCN-BUSINESS-PLAN.md       # 商业计划
│   ├── ONE-MCN-PRD.md                 # PRD
│   └── ONE-MCN-HARNESS-v1.0-archived.md  # 旧版归档
│
├── OPC 节点百科 3.0（已上线）
│   ├── index.html                     # 落地页
│   ├── graph.html                     # 图谱视图
│   ├── admin.html                     # 管理后台
│   ├── app.js                         # 前端逻辑
│   ├── api/                           # Express API
│   │   ├── analyze.js                 # AI 分析
│   │   ├── auth/                      # 认证（邮箱注册/验证码）
│   │   ├── data-store.js              # 数据存储
│   │   ├── db/                        # DB helpers
│   │   ├── middleware/                # 中间件
│   │   └── utils/                     # 工具（含 email.js）
│   ├── data/                          # JSON 数据（57 节点/用户/订单）
│   ├── content-drafts/                # 节点内容草稿（29 个）
│   ├── questions.json                 # OPC 适配测试
│   └── nodes/                         # 57 个节点内容页（已建 16 个）
│
├── 部署与运维
│   ├── deploy.sh                      # git push + rsync 到 VPS
│   ├── start.sh                       # 本地启动
│   └── package.json
│
└── 截图/历史
    ├── node*.png                      # 节点截图（待清理）
    └── archive/                       # 归档
```

---

## 🚀 M1 启动倒计时

| Day | 日期 | 主题 | 详细 |
|:---:|:---|:---|:---|
| **D1** | 2026-07-03 | 安装 + 开通 | [M1-SOP §2](ONE-MCN-M1-SOP.md#2-day-1) |
| **D2** | 2026-07-04 | 首轮扫描 | [M1-SOP §3](ONE-MCN-M1-SOP.md#3-day-2) |
| **D3** | 2026-07-05 | **G0 早期熔断验证** | [M1-SOP §4](ONE-MCN-M1-SOP.md#4-day-3) |
| **D4** | 2026-07-06 | 数据复盘 + OPC 10 节点开工 | [M1-SOP §5](ONE-MCN-M1-SOP.md#5-day-4) |
| **D5** | 2026-07-07 | Plan B 决策日 | [M1-SOP §6](ONE-MCN-M1-SOP.md#6-day-5) |
| **D6** | 2026-07-08 | 内容迭代 | [M1-SOP §7](ONE-MCN-M1-SOP.md#7-day-6) |
| **D7** | 2026-07-09 | **G1 完整验证 + 5 页周报** | [M1-SOP §8](ONE-MCN-M1-SOP.md#8-day-7) |

---

## 💙 蕾姆的话

> 1. 本项目已完成"**文档型创始人**"阶段（v1.0 → v2.0.2 写满 ~5500 行文档），现在切换到"**执行型创始人**"阶段。
> 2. **M1 7 天 SOP 已砍范围 80%**：1 视频号 + 2 人设 + 10 OPC 节点 + 1 最小课 = 最小闭环。
> 3. **G0/G1 熔断是核心安全网**：哪怕 0 播放，也比继续写文档强 100 倍。
> 4. **OPC 百科 28% → 50% 是 M1 启动的硬性前置**：D4-D7 同步开工 10 核心节点。
> 5. **复用现有 VPS**（43.160.213.118），不重新买服务器，与 OPC 网站同栈。

---

*OPC + ONE-MCN · v2.0.2 · 飞轮架构 · 12 Agent + HermesPet · 24 月 ¥500 万*
