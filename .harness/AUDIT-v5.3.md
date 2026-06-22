# ONE-MCN v5.3 诚实代码审计

> **作者**：蕾姆（Task #2 执行）
> **日期**：2026-06-22
> **目的**：区分 state.json "completed" 声明 vs 真实代码完成度
> **Lesson**：Lesson 8（先确认代码状态，再优化文档）

## 0. 摘要（TL;DR）

| 维度 | state.json 声称 | 实际代码 | 真相 |
|:---|:---|:---|:---|
| **11 个 L-W-* loop completed** | 全部 ✅ | 大部分仅骨架/配置文件 | **0 个真正端到端完成** |
| **M1-DAY0 24 个原子任务** | 1/24 | D0-1 schema 设计 ✅，其余 23 个 pending | **真实完成 4.2%** |
| **src/ 业务代码** | 完整 | 骨架 + JSON 配置存在 | **scaffold-only** |
| **web/ 前端 UI** | 完整 | Next.js 7 个 route 存在 | **scaffold-only** |
| **数据库运行** | 假设运行 | PostgreSQL 未启动 | **🔴 blocker** |
| **payment 测试** | 占位完成 | stripe/wechat/alipay 文件存在但无 test key | **🔴 blocker** |

**核心结论**：state.json 的"completed loops"是**架构骨架完成**，不是**业务闭环完成**。
蕾姆必须如实区分这两者，避免 /goal 误以为已实现功能。

---

## 1. src/ 实际代码盘点

### ✅ 存在的骨架（28 文件）

```
src/
├── server.ts                       # Express 入口（待 PostgreSQL）
├── auth/password.ts                # bcrypt cost=12 (D0-21 配置文件)
├── db/
│   ├── schema.sql                  # 8 表 schema (D0-1 ✅)
│   └── middleware/tenant.ts        # ORM tenant_id 中间件 (D0-14)
├── api/
│   ├── middleware/
│   │   ├── rateLimit.ts            # D0-22 速率限制
│   │   ├── cors.ts                 # D0-24 CORS
│   │   ├── errorHandler.ts
│   │   └── logger.ts
│   ├── payment/
│   │   ├── stripe.ts               # L-INFRA-03 webhook 框架
│   │   ├── wechat.ts               # L-INFRA-05 微信支付框架
│   │   ├── alipay.ts               # L-INFRA-05 支付宝框架
│   │   └── router.ts
│   └── routes/auth.ts              # 认证路由
├── discovery/
│   ├── state-machine.json          # L-DISC-01 配置
│   └── blueprint/generator.ts      # L-DISC-02 框架
├── agents/
│   ├── content-agent.json          # L-AGENT-01 配置
│   ├── acquisition-agent.json      # L-AGENT-02 配置
│   ├── delivery-agent.json         # L-AGENT-03 配置
│   ├── support-agent.json          # L-AGENT-04 配置
│   └── consistency-agent.json      # L-CONSIST-01 配置
├── monitor/
│   ├── collectors/                 # 5 个采集器（traffic/conversion/revenue/brand/retention）
│   └── alerts/rules.json           # L-MONITOR-02 预警规则
├── monetize/
│   ├── trial.json                  # L-MONETIZE-01
│   ├── renewal.json                # L-MONETIZE-02
│   ├── referral.json               # L-MONETIZE-03
│   └── early-bird.json             # L-MONETIZE-04
├── guard/loop-runner.ts            # Loop Harness runner
├── components/CookieBanner.tsx
└── ops/                            # M1-M6 SOP 占位文档
```

### ❌ 不存在的关键文件

```
src/
├── discovery/examples/             # L-DISC-03 案例库 — 0 个 .md
├── monitor/reports/                # L-MONITOR-03 周报告
├── monitor/optimizer/              # L-MONITOR-04 优化建议
├── api/webhooks/                   # L-INFRA-03/05 真实 webhook handler
├── api/discovery/                  # Stage 1 API 路由
├── api/agents/                     # Stage 2 API 路由
├── api/monitor/                    # Stage 3 API 路由
├── api/monetize/                   # Stage 4 API 路由
└── tier1/ tier2/ tier3/             # Tier 1/2/3 业务模块
```

---

## 2. web/ 实际 UI 盘点

### ✅ 存在（7 个 route + ui components）

```
web/app/
├── page.tsx                        # 首页
├── layout.tsx
├── globals.css
├── agents/                         # Stage 2 4 Agent UI
├── api/                            # Next.js API routes
├── dashboard/                      # Stage 3 Monitor
├── discovery/                      # Stage 1 多轮对话 UI
├── login/                          # 登录
├── register/                       # 注册
└── pricing/                        # 3 Tier 定价展示
```

### ❌ 不存在

```
web/app/
├── blueprint/                      # L-DISC-02 蓝图展示
├── tier1/ tier2/ tier3/            # Tier 产品详情页
└── onboarding/                     # 14 天试用 onboarding
```

---

## 3. scripts/ 实际盘点

```
scripts/
├── backup/                         # D0-15 数据库备份脚本（待运行）
├── db/                             # 数据库脚本
└── ssl/                            # D0-23 HTTPS 配置
```

**关键问题**：scripts/backup 内容未审计，scripts/db 未审计，scripts/ssl 未审计。
**D0-15 备份、D0-17 恢复测试、D0-23 HTTPS 实际未跑过**。

---

## 4. Loop 真实状态映射表

| Loop ID | state.json | 真实状态 | 待执行 |
|:---|:---|:---|:---|
| **L-W-INFRA-01** | completed | **scaffold-only** — schema.sql 存在但 23 个 D0 任务 pending | D0-2 ~ D0-24（缺 PostgreSQL） |
| **L-W-INFRA-02** | completed | **scaffold-only** — tenant.ts middleware 存在但 RLS 未启用 | D0-9 ~ D0-14（缺 PostgreSQL） |
| **L-W-DISC-01** | completed | **config-only** — state-machine.json 存在但无 engine | L-DISC-01 5 状态机 + max_turns=10 + 埋点 + curl |
| **L-W-DISC-02** | completed | **scaffold-only** — generator.ts 存在但未跑过 | L-DISC-02 蓝图生成器测试 |
| **L-W-DISC-03** | completed | ❌ **未开始** — examples/ 不存在 | L-DISC-03 20+ 案例库 |
| **L-W-MONITOR-01** | completed | **scaffold-only** — 5 个 collector 存在 | L-MONITOR-01 采集延迟 < 5min 验证 |
| **L-W-MONITOR-02** | completed | **config-only** — rules.json 存在但 channels 待配 | L-MONITOR-02 飞书 + 邮件 push |
| **L-W-MONITOR-03** | completed | ❌ **未开始** — reports/ 不存在 | L-MONITOR-03 周一 09:00 自动生成 |
| **L-W-MONITOR-04** | completed | ❌ **未开始** — optimizer/ 不存在 | L-MONITOR-04 5+ 建议类型 |
| **L-W-AGENT-01~04** | completed | **config-only** — 5 个 agent JSON 配置但无 orchestrator | L-AGENT-01~04 4 Agent 矩阵 + orchestrator |
| **L-W-CONSIST-01** | completed | **config-only** — 7 红线 JSON 但无执行 | L-CONSIST-01 7 红线审查 |
| **L-W-MVP-01** | 未声明 | ❌ **未开始** — mvp-launch/ 不存在 | L-MVP-01 MVP 上线流程 |
| **L-W-MONETIZE-01~05** | completed | **config-only** — 4 个 JSON 配置但无 API | L-MONETIZE-01~05 Stage 4 通用基础设施 |
| **L-W-INFRA-03** | completed | **scaffold-only** — stripe.ts 存在但无 webhook handler | L-INFRA-03 Stripe webhook 幂等性（缺 test key） |
| **L-W-INFRA-05** | completed | **scaffold-only** — wechat/alipay.ts 存在 | L-INFRA-05 微信/支付宝（缺 test mchid） |

---

## 5. 待执行 Loop 优先级（基于依赖）

### 🔴 P0：阻塞所有 L0 Loop

| Loop | 依赖 | 说明 |
|:---|:---|:---|
| **L-W-INFRA-01 续** | PostgreSQL 启动 | D0-2~D0-24 全部 pending |
| **L-W-INFRA-02 续** | PostgreSQL 启动 | RLS 启用 + 测试 |

### 🟡 P1：Stage 1 起点

| Loop | 依赖 | 说明 |
|:---|:---|:---|
| **L-W-DISC-01** | 无 | 手动 demo 起点，建议先跑通 |
| **L-W-DISC-02** | L-W-DISC-01 | 蓝图生成器 |
| **L-W-DISC-03** | 无 | 案例库（可并行）|

### 🟢 P2：Stage 2/3/4

| Loop | 依赖 | 说明 |
|:---|:---|:---|
| **L-W-AGENT-01~05 + L-W-CONSIST-01** | L-W-DISC-02 | 4 Agent 矩阵 + 一致性 |
| **L-W-MONITOR-01~04** | L-W-AGENT-01 | 5 维采集 + 预警 + 周报 + 建议 |
| **L-W-MONETIZE-01~05** | L-W-MONITOR-01 | Stage 4 通用基础设施 |

### 🔵 P3：Tier 1/2/3 + Stage 4 独立 + Cross

| Loop | 依赖 | 说明 |
|:---|:---|:---|
| **L-W-MVP-01** | L-W-AGENT-01 | MVP 上线流程 |
| **L-TIER1-01/02/03** | L-W-MVP-01 | Tier 1 ¥999/月 |
| **L-TIER2-01/02/03** | L-TIER1-01 | Tier 2 ¥999/月 |
| **L-TIER3-01~04** | L-TIER2-01 | Tier 3 ¥50,000/次 |
| **L-MONETIZE-S4-01~05** | L-W-MONETIZE-01 | Stage 4 独立 |
| **L-CROSS-01/02** | L-W-MONETIZE-01 | 用户旅程 + 北极星指标 |
| **L-W-INFRA-04** | PostgreSQL | 数据库备份恢复 |
| **L-W-INFRA-03/05** | test key | Stripe/微信/支付宝 |

### 🟣 P4：商业层（必须 design partner）

| Loop | 依赖 | 说明 |
|:---|:---|:---|
| **B1-B8 商业假设验证** | design partner 上线 + M1 启动日 2026-07-03 | 不能由 AI 替代 |

---

## 6. 蕾姆的诚实建议

1. **不要相信 state.json 的 "completed"** —— 那是骨架完成度，不是业务闭环完成度
2. **/goal 跑剩余 loop 前，必须先做两件事**：
   - 🔴 启动 PostgreSQL + 配置 test key（P0 blocker）
   - 🟡 手动跑通 L-W-DISC-01 demo（验证 harness 链路）
3. **每个 loop 完成后必须三段式闭环**：Writer → Reviewer → Verifier → 人工拍板
4. **商业假设 B1-B8 必须等 design partner** —— AI 不能替代

---

## 7. 变更记录

| 日期 | 版本 | 变更 |
|:---|:---|:---|
| 2026-06-22 | v5.3.1 | **蕾姆诚实审计**：区分 state-claimed vs 真实代码完成度 |