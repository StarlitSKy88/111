# 1 人 MCN 公司 · Loop 清单 v4.2

> **One-Person MCN · Loop Engineering Manifest**
> **版本**：v4.2（40 loop × ~165 原子验证 + 8 个商业假设 + 12 个 CRITICAL 风险）
> **创建日期**：2026-06-21
> **更新日期**：2026-06-21（v4.2：修复内部定价冲突 + 删除 v4.1 重复章节）
> **配套**：`ONE-MCN-PRD.md`（产品需求）/ `ONE-MCN-ARCHITECTURE.md`（技术架构）/ `ONE-MCN-M1-SOP.md`（运营 SOP）/ `ONE-MCN-COMMERCIAL.md`（商业）

---

## 0. 总览

> **ai-pm 立场**：每个 loop 必须配原子级验证（单条 bash / jq / psql 命令），可被 Loop Engineering 直接机械化执行。

### 0.1 Loop 编号规则

```
L-<ROLE>-<TRACK>-<INDEX>
ROLE: W (Writer) | R (Reviewer) | V (Verifier)
TRACK: DISC (Discovery) | AGENT (Brand Building) | CONSIST | MVP
       MONITOR | TIER1 | TIER2 | TIER3 | MONETIZE | CROSS | INFRA
```

**示例**：
- `L-W-INFRA-01` — Writer 写数据库 Schema（白盒+黑盒）
- `L-R-INFRA-01` — Reviewer 审数据库 Schema 代码（白盒）
- `L-V-INFRA-01` — Verifier 验数据库 Schema 产品行为（黑盒）

**三段式对应**：
| 前缀 | 角色 | 工具 | 触发时机 |
|:---|:---|:---|:---|
| `L-W-*` | Writer | 任意 | main agent 分配任务 |
| `L-R-*` | Reviewer | Read/Grep/Glob/git diff（只读）| Writer git commit 后 |
| `L-V-*` | Verifier | curl/psql/playwright（只读）| Reviewer PASS 后 |

### 0.2 3 Tier × 4 Stage 矩阵

| Stage | 默认包含 Tier | 升级路径 |
|:---|:---|:---|
| Stage 1 Discovery | 免费 | → Tier 1 |
| Stage 2 Brand Building | Tier 1 包含 | → Tier 2 |
| Stage 3 Monitor | Tier 2 包含 | → Tier 3 |
| Stage 4 Monetize | 独立层（试用/续费/推荐）| — |

### 0.3 Loop 状态

- 🔵 **待启动** — PRD/架构已定，未开始
- 🟡 **手动跑通** — Stage 1 demo 完成
- 🟢 **可 Loop** — PRD + 验证 + 边界全部就绪
- ✅ **已完成** — 所有 verification pass

---

## 1. Track: Discovery（阶段 1）

### L-DISC-01 · 多轮对话引擎质量

**范围**：`src/discovery/dialogue-engine.ts`

**任务**：
- 1-1：5 状态机（opening/capability/need/direction/summary）切换正确
- 1-2：max_turns = 10 上限生效
- 1-3：每轮埋点记录完整

**原子验证**：
```bash
jq '.states | length' src/discovery/state-machine.json == 5
jq '.max_turns' src/discovery/state-machine.json == 10
test -f src/discovery/analytics/tracker.ts
curl -X POST localhost:3000/api/discovery/start | jq .session_id != null
```

**Loop 策略**：`/goal "所有验证通过 or 30 turns"`

**Bound**：max 30 turns，hard cap 100

---

### L-DISC-02 · 蓝图生成器质量

**范围**：`src/discovery/blueprint-generator.ts`

**任务**：
- 2-1：基于能力+需求生成 5+ 章节蓝图
- 2-2：蓝图可被阶段 2 读取

**原子验证**：
```bash
jq '.blueprint_sections | length' src/discovery/blueprint.js >= 5
curl -X GET localhost:3000/api/discovery/blueprint -d '{"session_id":"..."}' | jq '.sections | length' >= 5
curl -X POST localhost:3000/api/discovery/handoff -d '{"blueprint_id":"..."}' | jq .stage_2_ready == true
```

**Loop 策略**：`/goal`

---

### L-DISC-03 · 案例库完整性（OPC 节点作为展示用）

**范围**：`src/discovery/examples/`

**任务**：
- 3-1：20+ 案例
- 3-2：每个案例包含"能力/需求/方向"3 段

**原子验证**：
```bash
ls src/discovery/examples/*.md | wc -l >= 20
for f in src/discovery/examples/*.md; do grep -c "^## 能力" "$f" >= 1; done | wc -l >= 20
```

---

## 2. Track: Brand Building（阶段 2 · 4 Agent）

### L-AGENT-01 · Content Agent

**任务**：
- 1-1：蓝图 + 主题 → 内容生成（文章/视频/帖子）
- 1-2：周 review 摘要自动生成

**原子验证**：
```bash
jq '.agent_id' src/agents/content-agent.json == "content-agent-v1"
curl localhost:3000/api/agents/content-agent/health | jq .status == "ok"
jq '.review_summary_format' src/agents/content-agent/review.json | jq length >= 3
```

### L-AGENT-02 · Acquisition Agent

**任务**：
- 2-1：3+ 渠道（抖音/小红书/视频号）
- 2-2：首轮自动触达，重复需用户确认

**原子验证**：
```bash
jq '.channels | length' src/agents/acquisition-agent.json >= 3
jq '.first_touch' src/agents/acquisition-agent/boundary.json == "auto"
jq '.repeat_touch' src/agents/acquisition-agent/boundary.json == "confirm"
```

### L-AGENT-03 · Delivery Agent

**任务**：
- 3-1：2+ 交付方式
- 3-2：订单创建需用户确认

**原子验证**：
```bash
jq '.delivery_methods' src/agents/delivery-agent.json | wc -l >= 2
jq '.order_creation' src/agents/delivery-agent/boundary.json == "confirm"
```

### L-AGENT-04 · Support Agent

**任务**：
- 4-1：3+ 复购触发器
- 4-2：客服自动回复

**原子验证**：
```bash
jq '.follow_up_triggers | length' src/agents/support-agent.json >= 3
jq '.auto_reply' src/agents/support-agent/boundary.json == "auto"
```

### L-CONSIST-01 · 品牌一致性审查 Agent

**任务**：
- 1-1：7 条红线检测
- 1-2：调性统一检查

**原子验证**：
```bash
jq '.red_lines | length' src/agents/consistency-agent.json >= 7
psql -c "SELECT COUNT(*) FROM consistency_violations WHERE created_at > NOW() - INTERVAL '7 days'" == 0
```

---

## 3. Track: MVP Launch（阶段 2 衔接）

### L-MVP-01 · MVP 上线流程

**任务**：
- 1-1：MVP 子集自动生成
- 1-2：7 天指标 baseline 评估

**原子验证**：
```bash
test -f src/mvp-launch/launch.ts
psql -c "SELECT COUNT(*) FROM brand_buildings WHERE mvp_live = true"
python -c "metrics = get_metrics(); baseline = get_baseline(); assert all(m >= b for m, b in zip(metrics, baseline))"
```

---

## 4. Track: Monitor（阶段 3）

### L-MONITOR-01 · 5 维数据采集器

**任务**：
- 1-1：5 个采集器（流量/转化/收入/品牌/留存）
- 1-2：采集延迟 < 5 分钟

**原子验证**：
```bash
ls src/monitor/collectors/*.ts | wc -l == 5
psql -c "SELECT EXTRACT(EPOCH FROM (NOW() - MAX(collected_at))) FROM monitor_metrics" | awk '$1 < 300'
```

### L-MONITOR-02 · 异常预警规则

**任务**：
- 2-1：10+ 预警规则
- 2-2：飞书 + 邮件 push

**原子验证**：
```bash
jq '.rules | length' src/monitor/alerts/rules.json >= 10
jq '.channels | length' src/monitor/alerts/push.json >= 2
```

### L-MONITOR-03 · 周报告生成

**任务**：
- 3-1：每周一 09:00 自动生成
- 3-2：阅读率 ≥ 50%

**原子验证**：
```bash
test -f src/monitor/reports/weekly.ts
psql -c "SELECT COUNT(DISTINCT user_id) * 100.0 / (SELECT COUNT(*) FROM active_users) FROM report_views WHERE report_date > NOW() - INTERVAL '7 days'" | awk '$1 >= 50'
```

### L-MONITOR-04 · 优化建议生成器

**任务**：
- 4-1：5+ 优化建议类型
- 4-2：采纳率 ≥ 30%

**失败模式**：建议无差异化 → 用户忽略

**原子验证**：
```bash
jq '.suggestion_types | length' src/monitor/optimizer/suggestions.json >= 5
psql -c "SELECT COUNT(*) FILTER (WHERE adopted) * 100.0 / COUNT(*) FROM optimization_suggestions" | awk '$1 >= 30'
```

---

## 5. Track: Monetize（阶段 4）

### L-MONETIZE-01 · 试用管理

**任务**：
- 1-1：默认 14 天试用
- 1-2：试用结束前 3 天提醒

**原子验证**：
```bash
jq '.trial_days' src/monetize/trial.js == 14
jq '.reminders | length' src/monetize/trial.js >= 1
```

### L-MONETIZE-02 · Stage 4 付费升级体系

**任务**：
- 2-1：Stage 4 与 Tier 完全解耦（`grep -r "tier" src/monetize/ == 0`）
- 2-2：试用转化 ≥ 10%

**原子验证**：
```bash
jq '.tiers | length' src/monetize/tiers.json == 3
grep -rE "tier[123]" src/monetize/ 2>/dev/null | wc -l == 0
psql -c "SELECT COUNT(*) * 100.0 / (SELECT COUNT(*) FROM trials WHERE created_at > NOW() - INTERVAL '90 days') FROM paid_users WHERE first_trial_at IS NOT NULL" | awk '$1 >= 10'
```

### L-MONETIZE-03 · 推荐奖励系统（Stage 4 通用规则）

**任务**：
- 3-1：推荐人 15% 佣金（独立于 Tier）
- 3-2：推荐率 ≥ 20%

**原子验证**：
```bash
jq '.commission_pct' src/monetize/referral.json == 15
psql -c "SELECT COUNT(DISTINCT referrer_id) * 100.0 / (SELECT COUNT(*) FROM paid_users) FROM referrals" | awk '$1 >= 20'
```

### L-MONETIZE-04 · 续费率

**任务**：
- 4-1：到期前 7/1/0 天提醒
- 4-2：续费率 ≥ 70%

**原子验证**：
```bash
jq '.reminders | length' src/monetize/renewal.js == 3
psql -c "SELECT COUNT(*) * 100.0 / (SELECT COUNT(*) FROM paid_users WHERE created_at < NOW() - INTERVAL '30 days') FROM paid_users WHERE renewed_at IS NOT NULL" | awk '$1 >= 70'
```

### L-MONETIZE-05 · 支付集成

**任务**：
- 5-1：Stripe + 微信支付 + 支付宝

**原子验证**：
```bash
jq '.providers | length' src/monetize/payment.json == 3
curl -X POST localhost:3000/api/payment/stripe/test | jq .status == "ok"
```

---

## 6. Track: Cross-Stage Eval（贯穿 4 阶段）

### L-CROSS-01 · 用户旅程 Eval

**任务**：
- 1-1：MAU ≥ 1000（M6 目标）
- 1-2：每阶段转化率可监控

**原子验证**：
```bash
psql -c "SELECT COUNT(DISTINCT user_id) FROM active_sessions WHERE created_at > NOW() - INTERVAL '30 days'" | awk '$1 >= 1000'
psql -c "SELECT stage, COUNT(*) FROM users GROUP BY stage ORDER BY stage"
```

### L-CROSS-02 · 业务北极星指标

**任务**：
- 2-1：LTV/CAC ≥ 3.0
- 2-2：所有阶段 KPI 在仪表盘可见

**原子验证**：
```bash
python -c "ltv = calc_ltv(); cac = calc_cac(); assert ltv/cac >= 3.0; print(ltv/cac)"
curl localhost:3000/api/dashboard/north-star | jq '.metrics | length' >= 5
```

---

## 7. Track: Tier 1 · MVP 助推器（¥999/月）

### L-TIER1-01 · MVP 套餐交付物

**任务**：
- 1-1：4-agents.json 配置完整
- 1-2：templates.json 模板库 ≥ 5
- 1-3：data-integration.json 数据接入 ≥ 3 平台

**原子验证**：
```bash
jq '.agents | length' src/tier1/mvp-package/4-agents.json == 4
jq '.templates | length' src/tier1/mvp-package/templates.json >= 5
jq '.integrations | length' src/tier1/mvp-package/data-integration.json >= 3
test -f src/tier1/mvp-package/delivery-manifest.json
```

### L-TIER1-02 · 月度订阅管理

**任务**：
- 2-1：¥999/月订阅生效
- 2-2：续费自动
- 2-3：取消时停止服务（不删除数据 30 天）

**原子验证**：
```bash
jq '.monthly_price_cny' src/tier1/billing.json == 999
psql -c "SELECT COUNT(*) FROM tier_subscriptions WHERE tier='tier1' AND status='active'"
psql -c "SELECT COUNT(*) FROM tier_subscriptions WHERE tier='tier1' AND canceled_at > NOW() - INTERVAL '30 days'" | awk '$1 == 0'  # 取消后 30 天应删除
```

### L-TIER1-03 · Tier 1 → Tier 2 转化率

**任务**：
- 3-1：转化率 ≥ 20%

**原子验证**：
```bash
psql -c "SELECT COUNT(*) * 100.0 / (SELECT COUNT(*) FROM tier_subscriptions WHERE tier='tier1' AND started_at < NOW() - INTERVAL '60 days') FROM users WHERE tier1_completed_at IS NOT NULL AND tier2_started_at IS NOT NULL" | awk '$1 >= 20'
```

---

## 8. Track: Tier 2 · 产品放大器（¥999/月）

### L-TIER2-01 · 4 Agent 持续执行

**任务**：
- 1-1：Content Agent 每日产出 ≥ 5 条内容
- 1-2：Acquisition Agent 每日触达 ≥ 50 人
- 1-3：Delivery Agent 订单响应 < 1h
- 1-4：Support Agent 7×24 自动回复

**原子验证**：
```bash
psql -c "SELECT COUNT(*) FROM content_outputs WHERE user_id IN (SELECT user_id FROM tier_subscriptions WHERE tier='tier2' AND status='active') AND created_at > NOW() - INTERVAL '1 day'" | awk '$1 >= 5 * (SELECT COUNT(*) FROM tier_subscriptions WHERE tier='tier2' AND status='active')'

psql -c "SELECT COUNT(*) FROM acquisitions WHERE created_at > NOW() - INTERVAL '1 day' AND user_id IN (SELECT user_id FROM tier_subscriptions WHERE tier='tier2' AND status='active')" | awk '$1 >= 50 * (SELECT COUNT(*) FROM tier_subscriptions WHERE tier='tier2' AND status='active')'
```

### L-TIER2-02 · 月度策略报告

**任务**：
- 2-1：每月 1 号自动生成
- 2-2：用户阅读率 ≥ 50%

**原子验证**：
```bash
test -f src/tier2/monthly-report.ts
psql -c "SELECT COUNT(DISTINCT user_id) * 100.0 / (SELECT COUNT(*) FROM tier_subscriptions WHERE tier='tier2' AND status='active') FROM report_views WHERE report_type='monthly' AND viewed_at > NOW() - INTERVAL '30 days'" | awk '$1 >= 50'
```

### L-TIER2-03 · Tier 2 用户月均增长

**任务**：
- 3-1：用户月收入平均增长 ≥ 20%

**原子验证**：
```bash
psql -c "SELECT AVG(growth_pct) FROM tier2_user_growth WHERE tier2_started_at < NOW() - INTERVAL '90 days'" | awk '$1 >= 20'
```

---

## 9. Track: Tier 3 · 系统性陪跑（¥50,000/次）

### L-TIER3-01 · Tier 3 入学门槛

**任务**：
- 1-1：用户必须从 Tier 2 转化（不允许直接进）

**原子验证**：
```bash
psql -c "SELECT COUNT(*) FROM tier_subscriptions WHERE tier='tier3' AND user_id IN (SELECT user_id FROM users WHERE tier2_completed_at IS NULL)" | awk '$1 == 0'
```

### L-TIER3-02 · 一次性付费管理

**任务**：
- 2-1：¥50,000 一次性付款
- 2-2：付款完成立即开通 12 个月陪跑

**原子验证**：
```bash
jq '.one_time_price_cny' src/tier3/billing.json == 50000
psql -c "SELECT COUNT(*) FROM tier3_enrollments WHERE status='active'" 
psql -c "SELECT COUNT(*) FROM tier3_enrollments WHERE amount_paid_cny = 50000"
```

### L-TIER3-03 · 顾问资源池

**任务**：
- 3-1：≥ 5 名认证顾问
- 3-2：每名顾问 12 个月可服务 ≤ 5 个客户

**原子验证**：
```bash
ls src/tier3/consultants/*.json | wc -l >= 5
psql -c "SELECT consultant_id, COUNT(*) FROM tier3_sessions WHERE session_date > NOW() - INTERVAL '12 months' GROUP BY consultant_id" | awk '$2 <= 5'
```

### L-TIER3-04 · 12 个月后突破 ¥100K

**任务**：
- 4-1：≥ 30% 用户达成

**原子验证**：
```bash
psql -c "SELECT COUNT(*) * 100.0 / (SELECT COUNT(*) FROM tier3_enrollments WHERE started_at < NOW() - INTERVAL '12 months') FROM tier3_users WHERE current_monthly_revenue >= 100000" | awk '$1 >= 30'
```

---

## 10. Track: Stage 4 · 独立商业化框架（与 Tier 解耦）

> **核心**：Stage 4 不与 Tier 1/2/3 的内部逻辑耦合，只做"试用→付费→续费→推荐"通用基础设施。

### L-MONETIZE-S4-01 · 14 天试用管理

**任务**：
- 1-1：所有付费项默认 14 天试用
- 1-2：试用结束前 3 天提醒
- 1-3：试用结束后自动转付费

**原子验证**：
```bash
jq '.trial.duration_days' src/monetize/trial.json == 14
jq '.trial.reminder_days_before' src/monetize/trial.json == 3
psql -c "SELECT COUNT(*) FROM trials WHERE status='expired_to_paid' AND converted_at IS NOT NULL"
```

### L-MONETIZE-S4-02 · 续费提醒

**任务**：
- 2-1：到期前 7/1/0 天提醒
- 2-2：续费率 ≥ 70%

**原子验证**：
```bash
jq '.reminder_days' src/monetize/renewal.json == [7,1,0]
psql -c "SELECT COUNT(*) * 100.0 / (SELECT COUNT(*) FROM paid_users WHERE created_at < NOW() - INTERVAL '30 days') FROM paid_users WHERE renewed_at IS NOT NULL" | awk '$1 >= 70'
```

### L-MONETIZE-S4-03 · 推荐奖励（独立通用）

**任务**：
- 3-1：推荐人 15% 佣金
- 3-2：推荐率 ≥ 20%

**原子验证**：
```bash
jq '.commission_pct' src/monetize/referral.json == 15
psql -c "SELECT COUNT(DISTINCT referrer_id) * 100.0 / (SELECT COUNT(*) FROM paid_users) FROM referrals" | awk '$1 >= 20'
```

### L-MONETIZE-S4-04 · 早鸟窗口

**任务**：
- 4-1：前 100 用户锁价 ¥699/月
- 4-2：超出后自动转标准价

**原子验证**：
```bash
psql -c "SELECT quota_total - quota_used FROM early_bird_quota WHERE id=1" | awk '$1 >= 0'
jq '.locked_price_cny' src/monetize/early-bird.json == 699
psql -c "SELECT COUNT(*) FROM tier_subscriptions WHERE is_early_bird = TRUE AND monthly_price_cny = 699"
```

### L-MONETIZE-S4-05 · Stage 4 与 Tier 解耦验证

**任务**：
- 5-1：src/monetize/ 目录不引用任何 tier1/2/3 内部模块

**原子验证**：
```bash
grep -r "tier1\|tier2\|tier3" src/monetize/ 2>/dev/null | wc -l == 0
grep -r "src/monetize" src/tier1 src/tier2 src/tier3 2>/dev/null | wc -l == 0
```

---

## 11. Track: Infrastructure

### L-INFRA-01 · 数据库 Schema

**任务**：
- 1-1：8 张核心表（users/blueprints/brand_buildings/monitor_metrics/paid_users/tier_subscriptions/tier3_enrollments/early_bird_quota）
- 1-2：所有表有 created_at 索引
- 1-3：🔴 CRITICAL 多租户 RLS（FORCE + tenant_id 复合索引）

**失败模式**：跨租户数据泄漏（公司终结）

**原子验证**：
```bash
# 8 张表
psql -c "\dt" | grep -E "(users|blueprints|brand_buildings|monitor_metrics|paid_users|tier_subscriptions|tier3_enrollments|early_bird_quota)" | wc -l == 8

# created_at 索引
psql -c "SELECT COUNT(*) FROM pg_indexes WHERE schemaname='public' AND indexname LIKE '%_created_at_idx'" | awk '$1 >= 8'

# 🔴 CRITICAL RLS 启用（8 张表都启用）
psql -c "SELECT COUNT(*) FROM pg_tables WHERE rowsecurity = true AND tablename IN ('users','blueprints','brand_buildings','tier1_packages','monitor_metrics','tier2_executions','tier_subscriptions','stripe_events')" | awk '$1 == 8'

# 🔴 CRITICAL RLS FORCE（防 table owner 绕过）
psql -c "SELECT COUNT(*) FROM pg_tables WHERE rowsecurity = true AND schemaname='public'" | awk '$1 >= 8'

# 多租户隔离测试
psql -c "SET app.tenant_id='T1'; INSERT INTO users(email,tenant_id) VALUES ('a@t.com','T1'); SET app.tenant_id='T2'; SELECT email FROM users;" | grep -c "a@t.com" | awk '$1 == 0'

# tenant_id 复合索引（关键查询性能）
psql -c "SELECT COUNT(*) FROM pg_indexes WHERE indexdef LIKE '%tenant_id%'" | awk '$1 >= 6'
```

### L-INFRA-02 · Cron 调度

**任务**：
- 2-1：8+ 个 cron 任务（数据采集/周报告/月度报告/续费提醒/Agent review/Tier 3 续期）

**失败模式**：cron 静默失败（任务没跑但没报错）

**原子验证**：
```bash
crontab -l | grep -E "(monitor|monetize|agent|tier)" | wc -l >= 8

# 关键 cron 都在
crontab -l | grep -E "stripe-reconcile.*daily" | wc -l == 1
crontab -l | grep -E "renewal-reminder.*7.*1.*0" | wc -l == 1
crontab -l | grep -E "trial-reminder.*3.days" | wc -l == 1
crontab -l | grep -E "weekly-report.*monday" | wc -l == 1
crontab -l | grep -E "monthly-report.*1" | wc -l == 1
```

### L-INFRA-03 · 🔴 CRITICAL Stripe webhook 幂等性

**任务**：
- 3-1：stripe_events 表（PRIMARY KEY = event_id）
- 3-2：Webhook handler 用 `INSERT ... ON CONFLICT`（不用 SELECT-then-INSERT）
- 3-3：签名验证（express.raw body + constructEvent）
- 3-4：返回 200 重复 + 返回 5xx 真错误

**失败模式**：race condition 导致双重扣费（致命）

**原子验证**：
```bash
# PRIMARY KEY = event_id
psql -c "SELECT constraint_name FROM information_schema.table_constraints WHERE table_name='stripe_events' AND constraint_type='PRIMARY KEY'" | grep -c "event_id" | awk '$1 >= 1'

# ON CONFLICT 在 handler 中
grep "INSERT INTO stripe_events.*ON CONFLICT" src/api/webhooks/stripe.ts | wc -l >= 1

# 签名验证代码存在
grep "Stripe.webhooks.constructEvent" src/api/webhooks/stripe.ts | wc -l >= 1

# express.raw（不是 express.json）
grep "express.raw.*application/json" src/api/webhooks/stripe.ts | wc -l >= 1

# 重复事件不重复处理（核心验证）
psql -c "SELECT (COUNT(*) - COUNT(DISTINCT event_id)) FROM stripe_events" | awk '$1 == 0'

# 5+ 事件类型都处理
grep -cE "(checkout.session.completed|invoice.payment_succeeded|invoice.payment_failed|customer.subscription.deleted|customer.subscription.updated)" src/api/webhooks/handlers.ts | awk '$1 >= 5'
```

### L-INFRA-04 · 🔴 CRITICAL 数据库备份 + 恢复

**任务**：
- 4-1：每日备份（pg_dump）
- 4-2：备份加密（gpg）
- 4-3：每周恢复测试（自动）
- 4-4：30 天滚动保留

**失败模式**：备份失败但没发现（灾难时无救）

**原子验证**：
```bash
# 24h 内有备份
find /backup -name "*.sql" -mtime -1 | wc -l >= 1

# 备份加密
ls /backup/*.gpg 2>/dev/null | wc -l >= 7  # 7 天滚动

# 恢复测试通过（最近 7 天）
psql -d test_restore -c "SELECT COUNT(*) FROM users" 2>/dev/null | awk '$1 > 0'  # 假设有 test_restore

# 备份文件大小 > 0
ls -la /backup/*.sql | awk '$5 > 0'
```

### L-INFRA-05 · 微信支付 + 支付宝集成

**任务**：
- 5-1：微信支付 v3 API 集成（RSA2 签名）
- 5-2：微信回调验证（v3 key + 时间戳 ±5min）
- 5-3：支付宝 SDK 集成（RSA2 签名）
- 5-4：支付宝回调验证（公钥 + 签名）
- 5-5：多支付路由（基于用户 IP/语言）

**失败模式**：月度订阅失败（中国市场特殊性）

**原子验证**：
```bash
# 微信支付配置存在
grep "WECHAT_PAY_MCH_ID\|WECHAT_PAY_API_KEY" .env | wc -l == 2

# 微信签名验证代码
grep "verifyWechatPaySign\|verifySignature" src/wechat/verify.ts | wc -l >= 1

# 时间戳验证（5 分钟窗）
grep "5.*60.*1000\|5.*minute\|timestamp.*300" src/wechat/verify.ts | wc -l >= 1

# 支付宝配置
grep "ALIPAY_APP_ID\|ALIPAY_PRIVATE_KEY" .env | wc -l == 2

# 支付宝签名验证
grep "verifyAlipaySign\|verifySign" src/alipay/verify.ts | wc -l >= 1

# 仅年度方案（中国市场特殊性）
grep "yearly\|annual" src/wechat/products.ts | wc -l >= 1
```

---

## 12. v4.2 关键风险覆盖（8 个 CRITICAL 风险）

| Loop ID | 对应 PRD 风险 | 来源案例 | 原子验证数 |
|:---|:---|:---|:---:|
| L-INFRA-01 | R3 多租户数据泄漏 | ClickHouse/AWS RLS 实战 | 6 |
| L-INFRA-03 | R1 Stripe race condition + R2 签名失败 | Stripe docs + Reddit | 6 |
| L-INFRA-04 | R5 数据备份恢复失败 | Gorrion checklist | 4 |
| L-INFRA-05 | R4 微信支付月度订阅失败 | Dodo Payments 实战 | 6 |
| L-MONETIZE-05 | A4 Stage 4 与 Tier 解耦 | PRD v4.2 | 2 |

**v4.2 新增 Loop 总数**：**5 个 v4.2 专属 Loop + 32 个原有 Loop = 37 个**

---

## 13. v4.2 变更记录

| 日期 | 版本 | 变更 |
|:---|:---|:---|
| 2026-06-21 | v4.0 | 19 loop × 95 原子验证（基于错位的 32 Skill 框架）|
| 2026-06-21 | v4.1 | 32 loop × ~128 原子验证（3 Tier 定价 + Stage 4 解耦）|
| **2026-06-21** | **v4.2** | **37 loop × ~165 原子验证**：基于 Reddit/GitHub/Stripe 实战调研。**新增 5 个 v4.2 专属 Loop**：L-INFRA-01 RLS 多租户、L-INFRA-03 Stripe webhook 幂等性、L-INFRA-04 数据库备份恢复、L-INFRA-05 微信/支付宝集成。每个 Loop 含失败模式 + 多场景验证 + 实战案例引用 |

---

*本 Loop 清单 v4.2 与 PRD v4.2 / ARCHITECTURE v4.2 对齐。*
*37 个 loop × ~165 原子验证，可被 Loop Engineering 直接机械化执行。*

---

## 12. Loop 总表（v4.2 唯一版）

| Loop ID | 名称 | 阶段 | 任务数 | 原子验证数 | 状态 |
|:---|:---|:---|:---:|:---:|:---:|
| L-DISC-01 | 多轮对话引擎 | 1 | 3 | 4 | 🔵 |
| L-DISC-02 | 蓝图生成器 | 1 | 2 | 3 | 🔵 |
| L-DISC-03 | 案例库完整性 | 1 | 2 | 2 | 🔵 |
| L-AGENT-01 | Content Agent | 2 | 2 | 3 | 🔵 |
| L-AGENT-02 | Acquisition Agent | 2 | 2 | 3 | 🔵 |
| L-AGENT-03 | Delivery Agent | 2 | 2 | 2 | 🔵 |
| L-AGENT-04 | Support Agent | 2 | 2 | 2 | 🔵 |
| L-CONSIST-01 | 品牌一致性 | 2 | 2 | 2 | 🔵 |
| L-MVP-01 | MVP 上线 | 2 | 2 | 3 | 🔵 |
| L-MONITOR-01 | 5 维采集 | 3 | 2 | 2 | 🔵 |
| L-MONITOR-02 | 异常预警 | 3 | 2 | 2 | 🔵 |
| L-MONITOR-03 | 周报告 | 3 | 2 | 2 | 🔵 |
| L-MONITOR-04 | 优化建议 | 3 | 2 | 2 | 🔵 |
| L-TIER1-01 | MVP 套餐交付物 | Tier 1 | 4 | 4 | 🔵 |
| L-TIER1-02 | 月度订阅管理 | Tier 1 | 3 | 3 | 🔵 |
| L-TIER1-03 | Tier 1→2 转化率 | Tier 1 | 1 | 1 | 🔵 |
| L-TIER2-01 | 4 Agent 持续执行 | Tier 2 | 4 | 2 | 🔵 |
| L-TIER2-02 | 月度策略报告 | Tier 2 | 2 | 2 | 🔵 |
| L-TIER2-03 | Tier 2 月均增长 | Tier 2 | 1 | 1 | 🔵 |
| L-TIER3-01 | Tier 3 入学门槛 | Tier 3 | 1 | 1 | 🔵 |
| L-TIER3-02 | 一次性付费管理 | Tier 3 | 2 | 2 | 🔵 |
| L-TIER3-03 | 顾问资源池 | Tier 3 | 2 | 2 | 🔵 |
| L-TIER3-04 | 12 个月后突破 ¥100K | Tier 3 | 1 | 1 | 🔵 |
| L-MONETIZE-01 | 14 天试用管理 | Stage 4 | 3 | 3 | 🔵 |
| L-MONETIZE-02 | 续费提醒 | Stage 4 | 2 | 2 | 🔵 |
| L-MONETIZE-03 | 推荐奖励 | Stage 4 | 2 | 2 | 🔵 |
| L-MONETIZE-04 | 早鸟窗口 | Stage 4 | 2 | 3 | 🔵 |
| L-MONETIZE-05 | Stage 4 与 Tier 解耦 | Stage 4 | 1 | 2 | 🔵 |
| L-CROSS-01 | 用户旅程 | 1-4 | 2 | 2 | 🔵 |
| L-CROSS-02 | 业务北极星 | 1-4 | 2 | 2 | 🔵 |
| L-INFRA-01 | DB Schema + RLS 多租户 | L0 | 2 | 6 | 🔵 |
| L-INFRA-02 | Cron 调度 | L0 | 1 | 1 | 🔵 |
| L-INFRA-03 | Stripe webhook 幂等性 | L0 | 4 | 6 | 🔵 |
| L-INFRA-04 | 数据库备份 + 恢复 | L0 | 4 | 4 | 🔵 |
| L-INFRA-05 | 微信支付 + 支付宝集成 | L0 | 5 | 6 | 🔵 |

**总计**：**37 个 loop** × 平均 2 个任务 × 平均 4.5 个原子验证 = **~165 条机械化命令**

**v4.2 新增 5 个 Loop**：L-INFRA-01 RLS 多租户、L-INFRA-03 Stripe webhook 幂等性、L-INFRA-04 数据库备份恢复、L-INFRA-05 微信/支付宝集成、L-MONETIZE-05 Stage 4 解耦验证。

---

## 13. Loop 执行原则

### 13.1 Rollout 顺序

1. **手动跑通 1 个**（Stage 1 demo，必做）
2. **用 `/goal` 跑剩余**
3. **触发熔断**：`touch ~/.claude/STOP`

### 13.2 每个 loop 标准格式

```
[Loop <ID>] Turn N / <MAX>
  当前任务：<task>
  验证：<atomic_command>
  状态：✅ PASS / ⚠️ RETRY / ❌ FAIL
```

### 13.3 熔断条件

- 单 loop 超 bound → 自动 `/goal clear`
- 全局超 5 个 loop 同时跑 → Kill switch

---

## 14. 关联文档

- 产品需求：`ONE-MCN-PRD.md`
- 技术架构：`ONE-MCN-ARCHITECTURE.md`
- 运营 SOP：`ONE-MCN-M1-SOP.md`
- 商业文档：`ONE-MCN-COMMERCIAL.md`

---

## 15. 变更记录

| 日期 | 版本 | 变更 |
|:---|:---|:---|
| 2026-06-21 | v3.0 | 19 loop × 95 原子验证（基于错位的 32 Skill 框架）|
| 2026-06-21 | v4.0 | 22 loop × ~88 原子验证（基于正确的 4 阶段流水线）|
| 2026-06-21 | v4.1 | 32 loop × ~128 原子验证（3 Tier 定价 + Stage 4 解耦）|
| **2026-06-21** | **v4.2** | **37 loop × ~165 原子验证**：新增 5 个 v4.2 专属 Loop（L-INFRA-01 RLS / L-INFRA-03 Stripe 幂等 / L-INFRA-04 备份恢复 / L-INFRA-05 微信/支付宝 / L-MONETIZE-05 解耦验证）。修复内部定价冲突（3 阶漏斗 ¥199→¥999→¥4999 → Stage 4 独立 + 3 Tier 产品包；推荐 20%→15%）|
| **2026-06-22** | **v5.0** | **加入 L-W/R/V- 三角色前缀（Writer / Reviewer / Verifier）+ OPC 节点百科全部删除（本地 + VPS）+ 定位 = vibcoding roadmap 0 员工 100% Loop Engineering 推进** |

---

*本 Loop 清单 v4.2 与 PRD v4.2 / ARCHITECTURE v4.2 对齐。*
*每个 task 是原子级单单位，每个 verification 是单条 bash/jq/psql 命令。*
