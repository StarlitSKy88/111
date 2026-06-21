# 1 人 MCN 公司 · 架构文档 v4.2

> **One-Person MCN · Architecture Document**
> **版本**：v4.2（3 Tier 定价 + 4 阶段流水线 + Stage 4 独立商业化框架）
> **创建日期**：2026-06-21
> **更新日期**：2026-06-21（v4.2：修复内部定价冲突）
> **配套**：`ONE-MCN-PRD.md`（产品需求）/ `ONE-MCN-M1-SOP.md`（运营 SOP）/ `ONE-MCN-LOOP-LIST.md`（Loop 清单）/ `ONE-MCN-COMMERCIAL.md`（商业）

---

## 0. 架构总览

```
┌────────────────────────────────────────────────────────────────────────┐
│                       1 人 MCN 公司（4 阶段流水线架构）                  │
├────────────────────────────────────────────────────────────────────────┤
│  L1 · Discovery                                                          │
│      多轮对话引擎 + 能力/需求提取 + 蓝图生成器 + 案例库                 │
│      输入：用户注册 | 输出：个人品牌蓝图                                  │
├────────────────────────────────────────────────────────────────────────┤
│  L2 · Brand Building                                                     │
│      4 Agent 矩阵（内容/获客/产品/售后） + 一致性审查 + MVP 上线         │
│      输入：蓝图 | 输出：4 Agent 可用 + 指标达 baseline                    │
├────────────────────────────────────────────────────────────────────────┤
│  L3 · Monitor                                                            │
│      5 维数据采集 + push/pull 双通道 + 周报告 + 优化建议                 │
│      输入：MVP 上线 | 输出：监控仪表盘 + 异常预警                         │
├────────────────────────────────────────────────────────────────────────┤
│  L4 · Monetize                                                           │
│      试用管理 + 3 阶付费漏斗 + 推荐奖励 + 支付集成                       │
│      输入：监控数据 | 输出：付费转化 + 续费 + 推荐                       │
├────────────────────────────────────────────────────────────────────────┤
│  L0 · 基础设施（贯穿 4 阶段）                                            │
│      数据库 + 认证 + 文件存储 + 飞书/邮件 + Cron 调度                    │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 1. 技术栈

| 层 | 技术 | 版本 | 用途 |
|:---|:---|:---|:---|
| **后端框架** | Node.js + Express | 20.x LTS | API + 流水线编排 |
| **数据库** | PostgreSQL | 16+ | 主数据（用户/蓝图/品牌/Agent/指标） |
| **缓存** | Redis | 7+ | Session + Agent 决策缓存 |
| **前端** | React + TypeScript | 18 + 5.x | 4 阶段 Web 界面 |
| **AI 模型（默认）** | MiniMax-M3 | 1m-context | Discovery 对话 + 蓝图生成 |
| **AI 模型（备份）** | DeepSeek V3 | latest | MiniMax 限流时 fallback |
| **支付** | Stripe + 微信支付 + 支付宝 | — | 3 阶漏斗收款 |
| **推送** | 飞书 Webhook + 邮件 | — | L3 push 通道 |
| **Cron** | 系统 cron | — | 5 维数据采集 |
| **部署** | VPS（24h 后台）+ 本地（开发） | — | 混合部署 |

**架构原则**（ai-pm 方法论）：
- **Workflow before agent**：能用 predefined workflow 不用 agent
- **Measurement before complexity**：每层架构绑定一个 eval 指标
- **Boring tech**：优先选稳定技术，不追新

---

## 2. L1 · Discovery 架构（多轮对话 + 蓝图）

### 2.1 组件结构

```
src/discovery/
├── dialogue-engine.ts          # 对话状态机（5 状态）
├── state-machine.json          # 状态定义
├── capability-extractor.ts     # 能力图谱提取
├── need-extractor.ts           # 需求图谱提取
├── blueprint-generator.ts      # 蓝图生成
├── analytics/
│   └── tracker.ts              # 埋点
├── handoff.ts                  # 阶段 1 → 阶段 2 触发
└── examples/                   # OPC 节点作为展示用案例库
    ├── case-01-content-creator.md
    ├── case-02-consultant.md
    └── ... (20+ 案例)
```

### 2.2 对话状态机

```typescript
type State = 'opening' | 'capability' | 'need' | 'direction' | 'summary';

interface DialogueConfig {
  max_turns: number;           // = 10
  states: State[];             // = 5
  blue_print_trigger: {
    conditions: string[];      // >= 3 个条件满足才能生成蓝图
  };
}
```

### 2.3 关键 API

| API | 方法 | 入参 | 出参 |
|:---|:---|:---|:---|
| `/api/discovery/start` | POST | `{}` | `{ session_id, first_prompt }` |
| `/api/discovery/turn` | POST | `{ session_id, user_input }` | `{ next_prompt, state, progress }` |
| `/api/discovery/blueprint` | GET | `{ session_id }` | `{ blueprint_id, sections, completeness }` |
| `/api/discovery/handoff` | POST | `{ blueprint_id }` | `{ stage_2_ready: true }` |

### 2.4 Eval 集成

每个 Discovery API 调用都触发埋点 → 数据进入 monitor_metrics 表。

### 2.5 失败模式 + 回滚（v4.2 新增）

| 失败模式 | 检测 | 回滚方案 | 验证命令 |
|:---|:---|:---|:---|
| 状态机卡死（某状态无法前进）| Discovery 5 状态切换异常 | 强制重置到 `opening` | `psql -c "SELECT COUNT(*) FILTER (WHERE state='stuck') FROM discovery_sessions WHERE started_at < NOW() - INTERVAL '1 hour'"` 必须 = 0 |
| max_turns 触发后用户卡住 | 用户在 10 轮后无法获取蓝图 | 自动降级到结构化问卷 | `grep "fallback_to_survey" src/discovery/state-machine.ts` ≥ 1 |
| MiniMax M3 API 超时 | 5 秒无响应 | 切换 DeepSeek V3 备份 | `psql -c "SELECT COUNT(*) FILTER (WHERE model_used='minimax_timeout_fallback') FROM discovery_logs WHERE created_at > NOW() - INTERVAL '1 day'"` ≥ 1 |
| 上下文窗口超 1M token | prompt > 950K | 截断早期 turns | `grep "truncate_oldest_turns" src/discovery/context.ts` ≥ 1 |
| 蓝图生成失败 | 3 次重试仍失败 | 标记 incomplete 让用户手动 | `psql -c "SELECT COUNT(*) FILTER (WHERE generation_failed=true AND created_at < NOW() - INTERVAL '24 hours') FROM blueprints"` |

---

## 3. L2 · Brand Building 架构（4 Agent 矩阵）

### 3.1 4 Agent 角色定义

| Agent | 角色 | 输入 | 输出 | 决策权限 |
|:---|:---|:---|:---|:---|
| **content-agent** | 内容生产 | 蓝图 + 主题 | 文章/视频/帖子 | 自动（周 review）|
| **acquisition-agent** | 获客触达 | 蓝图 + 目标人群 | 触达消息 + 跟进 | 首轮自动，重复确认 |
| **delivery-agent** | 产品交付 | 用户订单 | 交付内容 + 客服 | 用户确认 |
| **support-agent** | 售后跟进 | 用户行为 | 跟进消息 + 复购触发 | 自动（用户 review）|

### 3.2 组件结构

```
src/agents/
├── content-agent/
│   ├── agent.json              # 配置
│   ├── prompts/                # prompt 模板
│   └── executor.ts             # 执行器
├── acquisition-agent/
├── delivery-agent/
├── support-agent/
├── consistency-agent.ts        # 一致性审查（红线 7 条）
└── orchestrator.ts            # 4 Agent 调度
```

### 3.3 Agent 决策边界

```typescript
interface AgentBoundary {
  auto_actions: string[];      // 全自动
  user_confirm_actions: string[]; // 必须用户确认
  kill_switch: string;          // 一键叫停 endpoint
}
```

**4 Agent 边界表**：

| 动作 | content | acquisition | delivery | support |
|:---|:---|:---|:---|:---|
| 内容起草 | ✅ auto | — | — | — |
| 内容发布 | ✅ auto（小）| — | — | — |
| 触达首轮 | — | ✅ auto | — | — |
| 触达重复 | — | ❌ confirm | — | — |
| 客服回复 | — | — | ✅ auto | — |
| 订单创建 | — | — | ❌ confirm | — |
| 复购触发 | — | — | — | ✅ auto |
| 退款 | ❌ confirm | — | ❌ confirm | — |

### 3.4 MVP 上线流程

```
蓝图确认 → 选 4 Agent 配置 → 上线 MVP → 数据采集启动
   ↓
7 天后指标采集 → 触发 baseline 评估
   ↓ (达标)
阶段 2 → 阶段 3 handoff
```

### 3.5 失败模式 + 回滚（v4.2 新增）

| 失败模式 | 检测 | 回滚方案 | 验证命令 |
|:---|:---|:---|:---|
| Agent 执行失败（外部 API 异常）| 3 次重试仍失败 | 标记 degraded + 通知用户 | `psql -c "SELECT COUNT(*) FILTER (WHERE status='failed_after_3_retries') FROM agent_executions WHERE created_at > NOW() - INTERVAL '1 day'"` |
| Agent 输出触发 7 红线 | red_lines_check 拒绝 | 阻止输出 + 通知 user + review | `psql -c "SELECT COUNT(*) FROM consistency_violations WHERE blocked=true AND created_at > NOW() - INTERVAL '7 days'"` |
| Agent 全权决策出错 | 用户叫停 | 立即回滚 + 用户 review | `test -f src/agents/kill-switch.ts` |
| Tier 3 越界动作（如退款 confirm 被绕过）| 服务端 CHECK 拦截 | 强制 confirm gate | `psql -c "INSERT INTO tier3_actions(user_id,action) VALUES ('u1','refund_auto')" \| grep -c "violates"` 必须 > 0 |
| 4 Agent 同时罢工 | 心跳超时 5min | 自动重启 + 通知 ops | `find src/monitor/agents/heartbeat.log -mmin -5` |

---

## 4. L3 · Monitor 架构（5 维数据 + push/pull）

### 4.1 5 维数据采集

| 维度 | 数据源 | 采集频率 | 存储 |
|:---|:---|:---|:---|
| **流量** | 4 平台 API + 网站 analytics | 每小时 | monitor_traffic |
| **转化** | 落地页 + 客服系统 | 实时 | monitor_conversion |
| **收入** | Stripe/微信/支付宝 webhook | 实时 | monitor_revenue |
| **品牌** | 社交媒体 mention + 搜索 | 每 6 小时 | monitor_brand |
| **留存** | 用户行为日志 | 实时 | monitor_retention |

### 4.2 组件结构

```
src/monitor/
├── collectors/                # 5 个采集器
│   ├── traffic.ts
│   ├── conversion.ts
│   ├── revenue.ts
│   ├── brand.ts
│   └── retention.ts
├── dashboard/                 # Web 仪表盘
├── alerts/
│   ├── rules.json             # 10+ 异常规则
│   └── push.ts                # 飞书 + 邮件 push
├── reports/
│   └── weekly.ts              # 周报告生成
└── optimizer/
    └── suggestions.ts        # 优化建议
```

### 4.3 push vs pull 策略

```typescript
interface PushChannel {
  trigger: 'auto' | 'manual';
  frequency: 'immediate' | 'daily' | 'weekly';
  threshold: number;          // 触发阈值
  throttling: {               // 智能降频
    based_on: 'user_active_level' | 'time_of_day';
    cooldown_minutes: number;
  };
}
```

**push 触发场景**：
- 异常指标（立即 push）
- 周报告（每周一 09:00 push）
- 阶段 2 → 阶段 3 转换（立即 push）

**pull 场景**：
- 用户主动查看仪表盘
- 用户点击周报告

### 4.4 失败模式 + 回滚（v4.2 新增）

| 失败模式 | 检测 | 回滚方案 | 验证命令 |
|:---|:---|:---|:---|
| 5 维数据采集延迟 > 5min | cron 调度失败 | 立即手工触发 + 调查 | `psql -c "SELECT metric_type, EXTRACT(EPOCH FROM (NOW() - MAX(collected_at))) FROM monitor_metrics GROUP BY metric_type HAVING EXTRACT(EPOCH FROM (NOW() - MAX(collected_at))) > 300"` 必须 = 0 行 |
| 异常预警误报轰炸 | 5 分钟内同规则 > 3 次 | 自动降频（dedup 5min）| `grep "dedup_minutes\|cooldown" src/monitor/alerts/engine.ts` ≥ 1 |
| 飞书 webhook 失败 | 推送 500 | 自动转邮件 fallback | `grep "fallback.*email" src/feishu/push.ts` ≥ 1 |
| 用户删除 webhook（飞书/邮件都失败）| 双重失败 | 暂停推送 + 通知 ops | `psql -c "SELECT COUNT(*) FILTER (WHERE status='double_failure') FROM push_failures WHERE created_at > NOW() - INTERVAL '1 hour'"` |

---

## 5. L4 · Monetize 架构（试用 + 转化漏斗）

### 5.1 3 Tier + Stage 4 商业化体系

```
Stage 4 独立框架（与 Tier 解耦）：
   免费试用（14 天）
      ↓
   早鸟锁价 ¥699/月（前 100 用户永久）
      ↓
   标准订阅 ¥999/月

3 Tier 产品包（与 Stage 4 正交）：
   Tier 1（¥999/月）：MVP 助推器（4 Agent + 模板 + 数据接入）
      ↓ 用户成熟度提升
   Tier 2（¥999/月）：产品放大器（持续运营 + 多渠道获客）
      ↓ 用户收入提升
   Tier 3（¥50,000/次）：系统性陪跑（12 个月 1v1 顾问）
```

### 5.2 组件结构

```
src/monetize/
├── trial.ts                   # 试用管理
├── tiers.json                 # 3 阶定价
├── renewal.ts                 # 续费提醒（到期前 7/1/0 天）
├── referral.ts                # 推荐奖励
├── payment/
│   ├── stripe.ts
│   ├── wechat.ts
│   └── alipay.ts
└── dashboard.ts              # 转化漏斗仪表盘
```

### 5.3 推荐奖励算法（Stage 4 通用规则）

```
推荐人佣金 = 被推荐人月费 × 15%
被推荐人折扣 = 无（保持简单）
适用：所有付费项（Stage 4 通用）
```

---

## 6. L0 · 基础设施（贯穿 4 阶段）

### 6.1 数据库 Schema（PostgreSQL）

```sql
-- 用户与旅程
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  stage INT DEFAULT 1,           -- 当前阶段 1-4
  stage_1_completed_at TIMESTAMP,
  stage_2_completed_at TIMESTAMP,
  stage_3_completed_at TIMESTAMP,
  paid_user BOOLEAN DEFAULT FALSE,
  trial_end_at TIMESTAMP
);

-- 蓝图（阶段 1 输出）
CREATE TABLE blueprints (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  capabilities JSONB,
  needs JSONB,
  sections JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 品牌建设（阶段 2 输出）
CREATE TABLE brand_buildings (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  blueprint_id UUID REFERENCES blueprints(id),
  mvp_live BOOLEAN DEFAULT FALSE,
  validated_at TIMESTAMP,
  agents_active JSONB,           -- 4 个 Agent 状态
  baseline_metrics JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 监控指标（阶段 3）
CREATE TABLE monitor_metrics (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  metric_type VARCHAR,           -- traffic/conversion/revenue/brand/retention
  value NUMERIC,
  collected_at TIMESTAMP DEFAULT NOW()
);

-- 付费记录（阶段 4）
CREATE TABLE paid_users (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  tier VARCHAR,                  -- basic/pro/flagship
  amount_cny NUMERIC,
  paid_at TIMESTAMP DEFAULT NOW(),
  renewed_at TIMESTAMP,
  referrer_id UUID
);
```

### 6.2 关键 API（贯穿）

| API | 方法 | 用途 | 阶段 |
|:---|:---|:---|:---|
| `/api/auth/register` | POST | 邮箱注册 | 1 |
| `/api/auth/login` | POST | 登录 | 1-4 |
| `/api/users/me` | GET | 当前用户 | 1-4 |
| `/api/users/stage` | GET | 当前阶段 | 1-4 |

### 6.3 Cron 调度

| 任务 | 频率 | 阶段 |
|:---|:---|:---|
| 数据采集（流量/品牌） | 每小时 | 3 |
| 数据采集（转化/收入/留存） | 实时 | 3 |
| 周报告生成 | 每周一 09:00 | 3 |
| 续费提醒 | 每天 09:00 | 4 |
| Agent 决策 review 摘要 | 每周日 22:00 | 2 |

---

## 7. 3 Tier 定价模块架构（v4.1 新增）

> **核心原则**：3 Tier 与 Stage 1-3 业务模块**部分耦合**（Tier 1 包含 Stage 2 配置，Tier 2 包含 Stage 3 持续运营），但 Stage 4 商业化框架**与 Tier 完全解耦**。

### 7.1 Tier 1 · MVP 助推器（¥999/月）

```
src/tier1/
├── mvp-package/
│   ├── 4-agents-config.json       # 4 Agent 标准配置
│   ├── templates.json             # 标准模板库
│   ├── data-integration.json      # 数据接入配置
│   └── delivery-manifest.json     # 交付清单
├── onboarding-flow.ts            # 用户加入 Tier 1 流程
├── monthly-billing.ts            # ¥999/月 计费
└── support-tracker.ts            # 30/60/90 天支持追踪
```

**Tier 1 与 Stage 的关系**：
- 包含 Stage 1 Discovery 完整蓝图
- 包含 Stage 2 Brand Building 4 Agent 配置
- 包含 Stage 3 Monitor 基础数据接入
- **不**包含 Stage 2 持续运营（这是 Tier 2）
- **不**包含 Stage 3 持续监控（这是 Tier 2）

### 7.2 Tier 2 · 产品放大器（¥999/月）

```
src/tier2/
├── operations-engine.ts          # 4 Agent 持续执行引擎
├── marketing-amplifier.ts        # 多渠道获客自动化
├── optimization-engine.ts        # 数据驱动的产品优化
├── monthly-report.ts             # 月度策略报告
└── tier1-to-tier2-migration.ts   # Tier 1 → Tier 2 平滑迁移
```

**Tier 2 与 Stage 的关系**：
- 持续运营 Stage 2 4 Agent（不只是配置）
- 持续监控 Stage 3 数据
- 提供 Stage 4 的多渠道获客自动化（这是与 Stage 4 唯一的耦合点）
- **不**做计费管理（这是 Stage 4 独立层）

### 7.3 Tier 3 · 系统性陪跑（¥50,000/次）

**v5.1 新增 · 0 员工下的角色定义**：

| 角色 | 实际承担者 | 职责 |
|:---|:---|:---|
| **1v1 顾问交付** | 蕾姆 / Codex agent | Codex session + 文档交付 + 代码示例 + 提示词 |
| **关键节点 review** | 昴君 | 月度复盘签字 + Tier 3 入学审核 + 紧急响应判断 |
| **Tier 3 招生上限** | M1-M3 ≤ 1 人 / M3-M6 ≤ 3 人 | 避免 0 员工超负荷 |

```
src/tier3/
├── consultant-pool.json          # 1v1 顾问资源池（蕾姆 + Codex 视为 1 个虚拟顾问）
├── custom-agent-builder.ts       # 定制 Agent 构建（Codex 生成）
├── industry-resources.json       # 行业资源库（蕾姆维护 + Codex 补充）
├── session-booking.ts            # 12 个月陪跑 session 预订
├── monthly-review.ts             # 月度深度复盘（Codex 报告 + 昴君签字）
└── emergency-response.ts         # 24h 紧急响应（蕾姆即响应 + Codex 文档支持）
```

**Tier 3 与 Stage 的关系**：
- 包含 Tier 1 + Tier 2 全部功能
- 提供 Stage 1-2 的 1v1 定制服务（蕾姆/Codex 交付）
- 提供 Stage 3 的深度复盘（Codex 报告 + 昴君 review）
- **不**包含日常运营（这是 Tier 2）
- **关键约束**：Tier 3 用户数 ≤ 3（M3-M6 阶段，避免 0 员工超负荷）

### 7.4 Stage 4 · 独立商业化框架（与 Tier 解耦）

```
src/monetize/                    # 独立目录，不在 tier1/2/3/ 内
├── trial-manager.ts              # 14 天试用
├── pricing-config.json           # 3 Tier + 早鸟价
├── payment-processor.ts         # 支付集成（Stripe/微信/支付宝）
├── renewal-reminder.ts          # 续费提醒（到期前 7/1/0 天）
├── referral-engine.ts            # 推荐奖励（推荐人 15%）
├── billing-webhook.ts            # 支付 webhook 接收
└── invoice-generator.ts          # 发票生成
```

**Stage 4 的关键不变量**：
- ✅ **不**与任何 Tier 内部逻辑耦合
- ✅ **不**知道 Tier 1/2/3 的具体功能
- ✅ 只管理"试用→付费→续费→推荐"通用商业化基础设施
- ✅ 早鸟价、折扣、推荐奖励都在这里集中管理

### 7.5 3 Tier 定价矩阵

| 用户 | 推荐订阅 | 月费 | 一次性 |
|:---|:---|:---|:---|
| 刚入门 | Tier 1 | ¥999/月 | — |
| 月入 ¥5K+ | Tier 1 + Tier 2 | ¥1,998/月 | — |
| 月入 ¥30K+ | Tier 1 + Tier 2 + Tier 3 | ¥1,998/月 | ¥50,000/次 |
| 早鸟（前 100 用户） | 锁价 ¥699/月 | — | — |

### 7.6 数据库 Schema 扩展（v4.1 新增）

```sql
-- Tier 订阅
CREATE TABLE tier_subscriptions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  tier VARCHAR,                  -- tier1/tier2/tier3
  status VARCHAR,                -- active/cancelled/trial
  monthly_price_cny NUMERIC,     -- 默认 999
  started_at TIMESTAMP,
  ended_at TIMESTAMP,
  is_early_bird BOOLEAN DEFAULT FALSE
);

-- Tier 3 咨询陪跑 sessions
CREATE TABLE tier3_sessions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  session_date TIMESTAMP,
  consultant_id VARCHAR,
  notes TEXT,
  action_items JSONB
);

-- 早鸟窗口
CREATE TABLE early_bird_quota (
  id INT PRIMARY KEY,
  quota_total INT DEFAULT 100,
  quota_used INT DEFAULT 0,
  locked_price_cny NUMERIC DEFAULT 699
);
```

### 7.7 关键 API（v4.1 新增）

| API | 方法 | 入参 | 出参 |
|:---|:---|:---|:---|
| `/api/tier1/subscribe` | POST | `{user_id}` | `{subscription_id, amount: 999}` |
| `/api/tier2/subscribe` | POST | `{user_id}` | `{subscription_id, amount: 999}` |
| `/api/tier3/enroll` | POST | `{user_id, payment_proof}` | `{enrollment_id, amount: 50000}` |
| `/api/monetize/trial/start` | POST | `{user_id, tier}` | `{trial_id, end_at}` |
| `/api/monetize/early-bird/check` | GET | — | `{quota_remaining, price_cny}` |

---

## 8. 4 阶段衔接（v4.0 保留）

### 8.1 阶段 handoff 触发器

```typescript
interface HandoffTrigger {
  from: 1 | 2 | 3;
  to: 2 | 3 | 4;
  conditions: string[];          // 全部满足才能 handoff
}

const handoffs = {
  '1→2': { conditions: ['blueprint_confirmed', 'user_consent', 'first_payment_method_added'] },
  '2→3': { conditions: ['mvp_live', '7d_metrics_met_baseline', 'user_review_completed'] },
  '3→4': { conditions: ['14d_active_data', 'conversion_funnel_observed'] }
};
```

### 8.2 失败回退

如果某阶段 handoff 失败 → 用户回到上一阶段 + 重新启动。

---

## 8. 与 v3.0 的差异

| 维度 | v3.0（错）| v4.0（对）|
|:---|:---|:---|
| 产品形态 | 32 Skill 框架 | 4 阶段流水线 |
| Agent 角色 | Skill 脚手架 | 合伙人（全权决策+review）|
| OPC 节点 | 独立免费层产品 | 整合进知识图谱 |
| 商业模式 | 免费+付费+企业三轨 | 试用+转化（Pieter Levels）|
| Discovery | 没有 | 多轮 AI 对话（核心入口）|
| 阶段关系 | 9 赛道并行 | 严格串行 1→2→3→4 |
| 双线结构 | 没区分 | 主线（线性成长）+ 辅线（产品模块）|

---

## 9. 关联文档

- 产品需求：`ONE-MCN-PRD.md`
- 运营 SOP：`ONE-MCN-M1-SOP.md`
- Loop 清单：`ONE-MCN-LOOP-LIST.md`

---

## 10. 变更记录

| 日期 | 版本 | 变更 |
|:---|:---|:---|
| 2026-06-21 | v4.0 | 4 阶段流水线架构（与 PRD v4.0 对齐）|
| 2026-06-21 | v4.1 | 3 Tier 定价 + Stage 4 解耦 |
| **2026-06-21** | **v4.2** | **修复内部定价冲突（3 阶漏斗 ¥199→¥999→¥4999 → Stage 4 独立 + 3 Tier 产品包；推荐 20%→15%）** |
| **2026-06-22** | **v5.0** | **OPC 节点百科全部删除（本地 + VPS）+ ONE-MCN 定位 = vibcoding roadmap + 0 员工 + 100% Loop Engineering 推进** |

---

*本架构文档 v4.2 与 PRD v4.2 对齐。*
*每个组件对应 1 个原子级验证命令，可被 Loop Engineering 直接执行。*
