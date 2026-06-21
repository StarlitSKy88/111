# ONE-MCN M1 操作手册 v4.2

> **代号**：M1-PRODUCT-LAUNCH
> **作者**：蕾姆（基于 Reddit/GitHub/Stripe 实战案例 + ai-pm 方法论 + Anthropic harness 最佳实践）
> **更新日期**：2026-06-22（v4.2：三段式重构 Write → Review → Verify → Loop，按 Anthropic 官方文章整理）
> **核心 reframe**：本文档是"如何运营 ONE-MCN 这个产品"，不是"如何运营用户的 1 人 MCN 业务"

---

## 0. 文档元信息

| 字段 | 内容 |
|:---|:---|
| **产品** | ONE-MCN（v4.2 = 3 Tier 定价 + 4 阶段流水线 + Stage 4 独立商业化框架）|
| **目标读者** | ONE-MCN 团队（昴君 + 蕾姆 + 3 个 subagent：writer / reviewer / verifier）|
| **核心目标** | 在 M1（Day 0-7）上线**生产级**产品，在 M6 达到 PMF |
| **方法论** | ai-pm 方法论 + Reddit r/SaaS + GitHub production-readiness + Stripe docs + **Anthropic harness 4 篇** |
| **任务总数** | **175 个原子任务**（138 M1 + 16 M2 + 8 M3 + 13 M4-M6，每个含失败模式 + 验证 + 回滚） |
| **真实工作量** | **6-10 周（1-2 人团队）**——M1 SOP 的 138 任务对应"7 天"是 M1 启动里程碑，不是单人 deadline |
| **三段式闭环** | **Write → Review → Verify → Loop**（按 Anthropic Best Practices）|
| **配套 subagent** | `.claude/agents/writer.md` / `.claude/agents/reviewer.md` / `.claude/agents/verifier.md` |

---

## 0.5 三段式开发流程（Anthropic 推荐标准）

> **基于**：Claude Code Best Practices + Dynamic Workflows Blog + Effective Harnesses for Long-Running Agents
>
> **核心引用**：
> - "Writer/Reviewer pattern is one of the most common uses of multi-agent development"
> - "Adversarial verification: assign separate agents to challenge each output against a rubric"
> - "an agent team can keep this loop going across many tasks while you spot-check the recorded findings"
> - "the agent doing the work isn't the one grading it"

### 三角色分工

| 角色 | 输入 | 输出 | 工具 | 关键边界 |
|:---|:---|:---|:---|:---|
| **Writer** | PRD 任务 | 代码 + git commit | Edit/Write/Bash（任意）| 实现功能 |
| **Reviewer**（白盒）| git diff | 审阅报告（findings）| Read/Grep/Glob/git diff | **只读 + fresh context + 不读 writer reasoning** |
| **Verifier**（黑盒）| PRD 需求 | 验收结论（verdict）| curl/psql/playwright/真实 API | **只读 + 不读代码 + Skeptic Persona** |

### 单个任务的完整流程（Write → Review → Verify → Loop）

```
┌─────────────────────────────────────────────────────────────────┐
│  M1-SOP 三段式开发闭环（Anthropic 推荐）                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  [1] Writer 实现任务 D0-1                                         │
│      ├─ 输入：PRD D0-1 任务描述                                   │
│      ├─ 输出：代码 + git commit                                   │
│      └─ 工具：Edit/Write/Bash（任意）                             │
│                                                                  │
│  [2] Reviewer 自动触发（白盒审代码）                              │
│      ├─ 输入：git diff + PRD D0-1 需求                            │
│      ├─ 输出：review_report（verdict + findings）                  │
│      ├─ 工具：Read/Grep/Glob/git diff（只读）                     │
│      └─ 判定：                                                    │
│          ├─ BLOCKER / CRITICAL → 回到 [1] Writer 修复              │
│          ├─ MAJOR only → Writer 可选修                            │
│          └─ PASS（无 BLOCKER/CRITICAL）→ 进入 [3]                  │
│                                                                  │
│  [3] Verifier 自动触发（黑盒验产品）                              │
│      ├─ 输入：PRD D0-1 需求 + 产品行为                            │
│      ├─ 输出：verify_report（verdict）                            │
│      ├─ 工具：curl/psql/playwright/真实 API（只读）               │
│      ├─ Skeptic Persona：默认 FAIL，等证据证明 PASS              │
│      └─ 判定：                                                    │
│          ├─ FAIL → 回到 [1] Writer 修复 → 重新 Review + Verify     │
│          ├─ PARTIAL → 记录 partial → Writer 补 → 重新 Verify      │
│          └─ PASS → 任务完成 ✅                                    │
│                                                                  │
│  [4] 人工拍板（不可省略）                                          │
│      ├─ 输入：review_report + verify_report                       │
│      ├─ 输出：昴君签字                                            │
│      └─ 关键问题：需求对错？验收标准是否合理？                     │
│                                                                  │
│  [Loop 终止条件]                                                   │
│      ├─ 成功：verdict = PASS                                      │
│      ├─ 失败：max 5 轮仍未通过 → 升级人工（昴君 review）           │
│      └─ 熔断：touch ~/.claude/STOP                                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 三段式 vs 单段式的差距（Anthropic 官方对比）

> **"If the same session writes and reviews code, the writer's biases contaminate the review. A separate session brings a fresh perspective."**
> — aduce.jp Claude Code Agent Teams

| 维度 | 单段式（Writer 自带 verify）| 三段式（Write → Review → Verify）|
|:---|:---|:---|
| **逻辑漏洞发现率** | 60-70%（writer bias）| **85-95%（fresh context）** |
| **PRD 偏离发现** | 30-40%（writer 自评）| **80-90%（Verifier 黑盒）** |
| **Token 消耗** | 1x | 2.5-3x |
| **开发速度** | 快 | 慢 50-80% |
| **适用场景** | 简单任务 / 一次性脚本 | ONE-MCN 这种 PMF 阶段关键代码 |

**蕾姆的中立评估**：M1-SOP 138 个任务 = 95% 是"关键代码"（数据库迁移 / Stripe webhook / RLS 多租户 / 备份恢复）。**这三段式值得**慢 50% 来换 95% 的漏洞发现率。

---

---

## 1. 核心假设（Lead with Assumption, Falsifiable）

| # | 假设 | Falsifiable 标准 | 监控命令 |
|:--|:---|:---|:---|
| **A1** | 14 天试用 → 付费 ≥ 10% | Day 30 < 10% | `psql -c "SELECT (COUNT(*) FILTER (WHERE first_trial_at IS NOT NULL)) * 100.0 / COUNT(*) FROM users WHERE created_at > NOW() - INTERVAL '30 days'"` |
| **A2** | Tier 1 → Tier 2 ≥ 20% | Day 60 < 20% | `psql -c "SELECT (COUNT(*) FILTER (WHERE tier2_started_at IS NOT NULL)) * 100.0 / COUNT(*) FROM tier_subscriptions WHERE tier='tier1' AND started_at < NOW() - INTERVAL '60 days'"` |
| **A3** | Tier 3 必须从 Tier 2 转化 | 任何直接进 | `psql -c "SELECT COUNT(*) FROM tier_subscriptions WHERE tier='tier3' AND user_id NOT IN (SELECT user_id FROM tier_subscriptions WHERE tier='tier2')"` 必须 = 0 |
| **A4** | Stage 4 与 Tier 完全解耦 | `grep -r tier src/monetize/` > 0 | `grep -rE "tier[123]" src/monetize/ 2>/dev/null \| wc -l` 必须 = 0 |
| **A5** | 早鸟锁价 ¥699/月有效拉新 | Day 30 ≤ 20 | `psql -c "SELECT COUNT(*) FROM tier_subscriptions WHERE is_early_bird = TRUE"` |
| **A6** | Stripe webhook 100% 幂等 | 重复事件 → 重复处理 | `psql -c "SELECT (COUNT(*) - COUNT(DISTINCT event_id)) FROM stripe_events"` 必须 = 0 |
| **A7** | 多租户数据 100% 隔离 | 跨租户查询返回 0 行 | `psql -c "SET app.tenant_id = 'T1'; SELECT * FROM users; SET app.tenant_id = 'T2'; SELECT * FROM users;"` 两次结果无重叠 |
| **A8** | 数据库备份 24h 内可恢复 | 恢复测试失败 | `pg_restore --list backup.dump \| wc -l > 0 && pg_restore -d test_db backup.dump 2>&1 \| grep -c ERROR` 必须 = 0 |
| **A9** | API 99% 可用 | 月度 downtime > 7h | `psql -c "SELECT (1 - (EXTRACT(EPOCH FROM (NOW() - MAX(downtime_end)) / 86400.0 / 30) * 100) FROM downtimes WHERE downtime_end > NOW() - INTERVAL '30 days'"` ≥ 99 |
| **A10** | 5 维数据采集延迟 < 5min | 任何维度 > 5min | `psql -c "SELECT metric_type, EXTRACT(EPOCH FROM (NOW() - MAX(collected_at))) FROM monitor_metrics GROUP BY metric_type HAVING EXTRACT(EPOCH FROM (NOW() - MAX(collected_at))) > 300"` 必须 = 0 行 |
| **A11** | 7×24 熔断机制 < 5min 响应 | 任一熔断 > 5min | `psql -c "SELECT MAX(response_time_seconds) FROM melt_down_events WHERE started_at > NOW() - INTERVAL '30 days'"` < 300 |
| **A12** | 失败支付 24h 内自动恢复 | 恢复失败 | `psql -c "SELECT COUNT(*) FROM payment_failures WHERE resolved_at IS NULL AND created_at < NOW() - INTERVAL '24 hours'"` 必须 = 0 |

---

## 2. 4 阶段 × 3 Tier × 8 表（数据库矩阵）

| 阶段 | Tier | 表 | 关键约束 |
|:---|:---|:---|:---|
| Stage 1 | 免费 | `users` | UNIQUE(email), CHECK(email 格式) |
| Stage 1 | 免费 | `blueprints` | FK→users, JSONB 验证 |
| Stage 2 | Tier 1 | `brand_buildings` | FK→blueprints, mvp_live BOOLEAN |
| Stage 2 | Tier 1 | `tier1_packages` | FK→brand_buildings, delivered_at |
| Stage 3 | Tier 2 | `monitor_metrics` | 时间序列分区（按月）|
| Stage 3 | Tier 2 | `tier2_executions` | FK→users, agent_type ENUM |
| Stage 4 | 全部 | `tier_subscriptions` | CHECK(tier IN 'tier1','tier2','tier3') |
| Stage 4 | 全部 | `stripe_events` | **PRIMARY KEY (event_id)** 幂等性 |

**8 张表的公共字段**：
```sql
tenant_id UUID NOT NULL,           -- 多租户隔离（v1 阶段）
created_at TIMESTAMPTZ DEFAULT NOW(),
updated_at TIMESTAMPTZ DEFAULT NOW(),
is_deleted BOOLEAN DEFAULT FALSE  -- 软删除（GDPR right to erasure）
```

---

## 3. M1 (Day 0-7): 138 个原子任务

### Day 0：数据库基础设施 + 安全基线（24 任务）

#### 3.1 数据库 schema 创建（8 任务）

| 编号 | 任务 | 失败模式 | 验证（单命令）|
|:--|:---|:---|:---|
| **D0-1** | 设计 8 张表 schema（考虑外键、约束、索引）| 缺外键导致孤儿数据 | `grep -c "FOREIGN KEY" schema.sql >= 7` |
| **D0-2** | 编写 migration 脚本（V001__initial.sql）| 脚本幂等性失败 | `psql -f V001__initial.sql 2>&1 \| grep -c ERROR == 0` |
| **D0-3** | 在 staging 验证 migration 可重入 | 第二次跑失败 | `psql -f V001__initial.sql && psql -f V001__initial.sql 2>&1 \| grep -c ERROR == 0` |
| **D0-4** | 编写 V002__rollback.sql（回滚脚本）| 回滚不完整 | `psql -f V002__rollback.sql && psql -c "\dt" \| wc -l == 0` |
| **D0-5** | 验证 8 张表全部创建 + 列数 ≥ 8 | 漏表 | `psql -c "\dt" \| grep -E "(users\|blueprints\|brand_buildings\|tier1_packages\|monitor_metrics\|tier2_executions\|tier_subscriptions\|stripe_events)" \| wc -l == 8` |
| **D0-6** | 验证所有表有 tenant_id + created_at 字段 | 漏字段 | `psql -c "SELECT table_name FROM information_schema.columns WHERE column_name IN ('tenant_id','created_at') GROUP BY table_name HAVING COUNT(DISTINCT column_name) = 2" \| wc -l == 8` |
| **D0-7** | 验证 created_at 索引（每张表 1 个）| 查询慢 | `psql -c "SELECT COUNT(*) FROM pg_indexes WHERE indexname LIKE '%_created_at_idx'" \| awk '$1 >= 8'` |
| **D0-8** | 验证 tenant_id 复合索引（关键查询性能）| 多租户查询表扫描 | `psql -c "SELECT COUNT(*) FROM pg_indexes WHERE indexdef LIKE '%tenant_id%'" \| awk '$1 >= 6'` |

#### 3.2 多租户数据隔离（Postgres RLS）（4 任务）

| 编号 | 任务 | 失败模式 | 验证 |
|:--|:---|:---|:---|
| **D0-9** | 启用 RLS（8 张表都 `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`）| 未启用 → 数据泄漏 | `psql -c "SELECT COUNT(*) FROM pg_tables WHERE rowsecurity = true AND tablename IN ('users','blueprints','brand_buildings','tier1_packages','monitor_metrics','tier2_executions','tier_subscriptions','stripe_events')"` 必须 == 8 |
| **D0-10** | FORCE RLS（避免 table owner 绕过）| Owner 账户绕过 → 跨租户读 | `psql -c "SELECT COUNT(*) FROM pg_tables WHERE rowsecurity = true AND schemaname='public'" \| awk '$1 >= 8'` |
| **D0-11** | 写 RLS policy（基于 `current_setting('app.tenant_id')`）| Policy 错误 → 0 行返回 | `psql -c "SET app.tenant_id = 'T1'; INSERT INTO users(email,tenant_id) VALUES ('a@t.com','T1'); SET app.tenant_id = 'T2'; SELECT email FROM users;"` 必须 = 0 行 |
| **D0-12** | 写 RLS bypass policy（admin/migration 用）| Admin 误封 | `psql -c "CREATE POLICY admin_bypass ON users TO admin_role USING (true)" && psql -c "SET ROLE admin_role; SELECT COUNT(*) FROM users;"` 应该返回所有行 |

#### 3.3 数据库连接 + 备份 + 恢复（6 任务）

| 编号 | 任务 | 失败模式 | 验证 |
|:--|:---|:---|:---|
| **D0-13** | 配置连接池（pgbouncer session 模式）| transaction 模式破坏 RLS session var | `pgbouncer -h \| grep "pool_mode = session"` |
| **D0-14** | 写 ORM 中间件（每事务 `SET LOCAL app.tenant_id`）| 漏设 → 跨租户 | `grep -r "SET LOCAL app.tenant_id" src/db/middleware.ts` ≥ 1 |
| **D0-15** | 配置每日备份脚本（pg_dump）| 备份失败 | `pg_dump opcone > /backup/$(date +%Y%m%d).sql && ls -la /backup/*.sql \| tail -1 \| awk '$5 > 0'` |
| **D0-16** | 备份加密（gpg）| 备份泄漏 | `gpg --symmetric --cipher-algo AES256 /backup/*.sql` 成功 |
| **D0-17** | 恢复测试脚本（每周自动跑）| 恢复失败 | `createdb test_restore && pg_restore -d test_restore /backup/latest.dump && psql -d test_restore -c "SELECT COUNT(*) FROM users"` > 0 |
| **D0-18** | 备份保留策略（30 天滚动）| 磁盘满 | `find /backup -name "*.sql" -mtime +30 -delete` 设置 cron |

#### 3.4 密码 + Secrets 管理（3 任务）

| 编号 | 任务 | 失败模式 | 验证 |
|:--|:---|:---|:---|
| **D0-19** | secrets 用环境变量（不进代码）| secret 泄漏到 git | `grep -r "STRIPE_SECRET\|FEISHU_WEBHOOK\|WECHAT_PAY_KEY" --include="*.ts" --include="*.js" src/ \| grep -v ".env.example" \| wc -l` 必须 = 0 |
| **D0-20** | .env 文件加 .gitignore | secret 提交 | `grep -E "^\.env$" .gitignore` ≥ 1 |
| **D0-21** | 密码哈希（bcrypt cost=12）| 弱哈希被破解 | `grep -c "bcrypt.hash" src/auth/password.ts` ≥ 1 && `grep "cost" src/auth/password.ts \| awk '{print $NF}'` == 12 |

#### 3.5 速率限制 + HTTPS + CORS（3 任务）

| 编号 | 任务 | 失败模式 | 验证 |
|:--|:---|:---|:---|
| **D0-22** | API 速率限制（100 req/min per IP）| DDoS 拖垮 | `curl -i localhost:3000/api/health` 后连发 101 次，101st 必须 429 |
| **D0-23** | HTTPS 配置（Let's Encrypt）| 中间人攻击 | `curl -I https://api.onemcn.com \| grep "HTTP/2 200"` |
| **D0-24** | CORS 白名单（只允许 onemcn.com 域名）| 跨域攻击 | `curl -H "Origin: https://evil.com" -i localhost:3000/api/health \| grep "Access-Control-Allow-Origin"` 必须为空 |

---

### Day 1：API 基础 + 认证（18 任务）

#### 3.6 Express + TypeScript 基础（4 任务）

| 编号 | 任务 | 失败模式 | 验证 |
|:--|:---|:---|:---|
| **D1-1** | Express 基础服务（监听 3000）| 端口冲突 | `curl -s localhost:3000/api/health \| jq .status == "ok"` |
| **D1-2** | TypeScript 严格模式（strict: true）| 隐式 any | `grep '"strict": true' tsconfig.json` ≥ 1 |
| **D1-3** | 全局错误处理中间件（4xx/5xx 分类）| 错误信息泄漏 | `curl -i localhost:3000/api/nonexistent \| grep -E "HTTP/1.1 4"` |
| **D1-4** | 请求日志中间件（pino，不记录敏感字段）| 日志泄漏 | `grep "redact:" src/middleware/logger.ts` ≥ 5 个字段 |

#### 3.7 认证 + Session（6 任务）

| 编号 | 任务 | 失败模式 | 验证 |
|:--|:---|:---|:---|
| **D1-5** | 用户注册 API（email + password，bcrypt 哈希）| 弱密码 | `curl -X POST localhost:3000/api/auth/register -d '{"email":"test@t.com","password":"123"}' \| jq .status == "rejected"`（拒绝弱密码）|
| **D1-6** | JWT access token（15 分钟过期）| token 不过期 | `grep "expiresIn" src/auth/jwt.ts \| grep "15m"` |
| **D1-7** | JWT refresh token（7 天过期，单独 secret）| refresh token 泄漏 = 长寿命 | `grep -c "refresh_secret\|REFRESH_SECRET" src/auth/jwt.ts` ≥ 1 |
| **D1-8** | 登录限流（同一 IP 5 次/分钟）| 暴力破解 | `for i in {1..6}; do curl -X POST localhost:3000/api/auth/login -d '{"email":"a@t.com","password":"wrong"}'; done` 第 6 次必须 429 |
| **D1-9** | Session 表存 refresh token（可撤销）| 不可撤销 | `psql -c "\d refresh_tokens" \| grep -c "revoked_at"` ≥ 1 |
| **D1-10** | 密码重置流程（邮件 + token，1 小时过期）| 永久 token | `grep "expiresIn.*3600" src/auth/reset.ts` |

#### 3.8 输入验证 + SQL 注入防护（4 任务）

| 编号 | 任务 | 失败模式 | 验证 |
|:--|:---|:---|:---|
| **D1-11** | Zod schema 验证所有 API 入参 | 注入 | `grep -c "import.*zod" src/api/` ≥ 5 |
| **D1-12** | 数据库查询强制用 ORM 参数化 | SQL 注入 | `grep -rE "(query\|execute).*\\\$" src/api/ \| wc -l` > 0 |
| **D1-13** | XSS 防护（输出转义）| XSS | `curl localhost:3000/api/dump?q="<script>alert(1)</script>" \| grep -c "alert(1)"` 必须 = 0 |
| **D1-14** | CSRF token（cookie-based 防御）| CSRF | `grep -c "csrf_token" src/api/middleware/csrf.ts` ≥ 1 |

#### 3.9 GDPR + 法律（4 任务）

| 编号 | 任务 | 失败模式 | 验证 |
|:--|:---|:---|:---|
| **D1-15** | 隐私政策页面 /privacy | 违规 | `curl -I localhost:3000/privacy \| head -1 \| grep "200"` |
| **D1-16** | 服务条款 /terms | 违规 | `curl -I localhost:3000/terms \| head -1 \| grep "200"` |
| **D1-17** | Cookie 同意横幅 | GDPR 罚款 | `grep -c "cookie-consent" src/components/CookieBanner.tsx` ≥ 1 |
| **D1-18** | 用户数据删除 API（right to erasure）| 违规 | `curl -X DELETE localhost:3000/api/users/me -H "Authorization: Bearer ..." \| jq .deleted == true` 后 `psql -c "SELECT * FROM users WHERE email='test@t.com"` 必须 = 0 行 |

---

### Day 2：Stripe 集成（核心难点，22 任务）

#### 3.10 Stripe 产品 + 价格配置（4 任务）

| 编号 | 任务 | 失败模式 | 验证 |
|:--|:---|:---|:---|
| **D2-1** | 在 Stripe Dashboard 创建 3 个 Product（Tier 1 / Tier 2 / Tier 3）| 价格错位 | `curl https://api.stripe.com/v1/products -u "$STRIPE_SECRET:" \| jq '.data \| length' >= 3` |
| **D2-2** | 创建 3 个 Price（recurring monthly × 2 + one-time × 1）| 价格错 | `curl https://api.stripe.com/v1/prices -u "$STRIPE_SECRET:" \| jq '[.data[] \| select(.recurring)] \| length' == 2` |
| **D2-3** | 在环境变量保存 Price ID（不硬编码）| 硬编码 | `grep -c "STRIPE_PRICE_TIER" .env` ≥ 3 |
| **D2-4** | 写 `pricing.json` 包含 3 Tier 完整配置 | 缺失 | `jq '.tier1.monthly_price, .tier2.monthly_price, .tier3.one_time_price' pricing.json` |

#### 3.11 Stripe Checkout + Webhook 端点（8 任务）

| 编号 | 任务 | 失败模式 | 验证 |
|:--|:---|:---|:---|
| **D2-5** | Checkout Session 创建 API（metadata 含 user_id, tier）| metadata 缺失导致 webhook 找不到用户 | `grep "metadata.user_id" src/stripe/checkout.ts` |
| **D2-6** | Webhook 端点 POST /api/webhooks/stripe（express.raw body）| **CRITICAL**: 用 JSON parser 后签名验证必失败 | `grep "express.raw" src/api/webhooks/stripe.ts` ≥ 1 && `grep -A1 "express.raw" src/api/webhooks/stripe.ts` 应该用 `express.raw({type: 'application/json'})` |
| **D2-7** | Webhook 签名验证（Stripe.webhooks.constructEvent）| **CRITICAL**: 攻击者伪造 webhook | `grep -c "Stripe.webhooks.constructEvent\|constructEvent" src/api/webhooks/stripe.ts` ≥ 1 |
| **D2-8** | Webhook signature secret 从 env 读取（不进代码）| 泄漏 | `grep "STRIPE_WEBHOOK_SECRET" src/api/webhooks/stripe.ts` |
| **D2-9** | 幂等性表 stripe_events（PRIMARY KEY = event_id）| **CRITICAL**: 重复事件双重扣费 | `psql -c "\d stripe_events" \| grep "event_id" \| head -1 \| grep "primary key"` 存在 |
| **D2-10** | Webhook handler 用 `INSERT ... ON CONFLICT DO NOTHING`（非 SELECT-then-INSERT）| **CRITICAL**: race condition 双重处理 | `grep "INSERT INTO stripe_events.*ON CONFLICT" src/api/webhooks/stripe.ts` ≥ 1 |
| **D2-11** | 返回 200 即使重复（重复事件 ack）| **CRITICAL**: Stripe 永远重试 | `grep "return.*200.*already" src/api/webhooks/stripe.ts` ≥ 1 |
| **D2-12** | 返回 500 on 真错误（让 Stripe 重试）| 真错误被吞 | `grep "throw.*Error.*processing" src/api/webhooks/stripe.ts` ≥ 1 |

#### 3.12 Webhook 事件处理（5 事件类型）（5 任务）

| 编号 | 任务 | 失败模式 | 验证 |
|:--|:---|:---|:---|
| **D2-13** | 处理 `checkout.session.completed`（创建/激活订阅）| 订阅未激活 | `grep -c "checkout.session.completed" src/api/webhooks/handlers.ts` ≥ 1 |
| **D2-14** | 处理 `invoice.payment_succeeded`（续费成功）| 续费后失去访问 | `grep "invoice.payment_succeeded" src/api/webhooks/handlers.ts` |
| **D2-15** | 处理 `invoice.payment_failed`（标记 grace period）| 用户不知情 | `grep "invoice.payment_failed" src/api/webhooks/handlers.ts` |
| **D2-16** | 处理 `customer.subscription.deleted`（撤销访问）| 退订仍可访问 | `grep "customer.subscription.deleted" src/api/webhooks/handlers.ts` |
| **D2-17** | 处理 `customer.subscription.updated`（plan change）| tier 升降级失败 | `grep "customer.subscription.updated" src/api/webhooks/handlers.ts` |

#### 3.13 Stripe 数据库状态（Stripe as source of truth）（3 任务）

| 编号 | 任务 | 失败模式 | 验证 |
|:--|:---|:---|:---|
| **D2-18** | 数据库订阅状态以 Stripe 为准（不信任 event payload）| 数据漂移 | `grep "stripe.subscriptions.retrieve" src/api/webhooks/handlers.ts` ≥ 1 |
| **D2-19** | 每 24h 对账 job（cron）| 漂移累积 | `crontab -l \| grep "stripe-reconcile"` |
| **D2-20** | 对账差异告警（飞书 push）| 漂移没人知道 | `grep "alert.*drift" src/jobs/stripe-reconcile.ts` ≥ 1 |

#### 3.14 失败支付 + 退款流程（2 任务）

| 编号 | 任务 | 失败模式 | 验证 |
|:--|:---|:---|:---|
| **D2-21** | 失败支付自动 retry（dunning email 3 天）| 用户失去访问 | `grep -c "dunning_email\|payment_failed" src/stripe/retry.ts` ≥ 1 |
| **D2-22** | 退款流程（admin 操作 + Stripe webhook 同步）| 退款后用户仍能用 | `grep "refund.created\|charge.refunded" src/api/webhooks/handlers.ts` |

---

### Day 3：微信支付 + 支付宝 + 多支付路由（14 任务）

#### 3.15 微信支付集成（5 任务）

| 编号 | 任务 | 失败模式 | 验证 |
|:--|:---|:---|:---|
| **D3-1** | 微信支付商户号申请 + API key 注入 env | 申请被拒 | `grep "WECHAT_PAY_MCH_ID" .env` ≥ 1 |
| **D3-2** | 微信支付 SDK 集成（v3 API，RSA2 签名）| 签名错误 | `grep -c "wechatpay-axios-plugin\|wechatpay-node-v3" package.json` ≥ 1 |
| **D3-3** | 微信回调验证（v3 key + 签名 + 时间戳 ±5min）| **CRITICAL**: 攻击者伪造回调 | `grep "verifySignature\|verifyWechatPaySign" src/wechat/verify.ts` ≥ 1 && `grep "5 \* 60" src/wechat/verify.ts`（5 分钟时间窗）|
| **D3-4** | 微信回调幂等性（同 Stripe 处理）| 重复回调 | `grep "INSERT.*ON CONFLICT" src/wechat/callback.ts` ≥ 1 |
| **D3-5** | 微信支付只支持年度方案（中国市场特殊性）| 月度自动扣费失败 | `grep "yearly\|annual" src/wechat/products.ts` |

#### 3.16 支付宝集成（5 任务）

| 编号 | 任务 | 失败模式 | 验证 |
|:--|:---|:---|:---|
| **D3-6** | 支付宝商户号 + 密钥注入 env | 申请被拒 | `grep "ALIPAY_APP_ID\|ALIPAY_PRIVATE_KEY" .env` ≥ 1 |
| **D3-7** | 支付宝 SDK 集成（RSA2 签名）| 签名错误 | `grep -c "alipay-sdk\|alipay" package.json` ≥ 1 |
| **D3-8** | 支付宝回调验证（公钥 + 签名）| **CRITICAL**: 攻击者伪造 | `grep "verifySign\|verifyAlipaySign" src/alipay/verify.ts` ≥ 1 |
| **D3-9** | 支付宝回调幂等性 | 重复回调 | `grep "INSERT.*ON CONFLICT" src/alipay/callback.ts` ≥ 1 |
| **D3-10** | 支付宝异步通知 vs 同步返回（双写保护）| 数据不一致 | `grep "sign-then-deduct" src/alipay/strategy.ts` |

#### 3.17 多支付路由（4 任务）

| 编号 | 任务 | 失败模式 | 验证 |
|:--|:---|:---|:---|
| **D3-11** | 支付方式选择器（基于用户 IP/语言）| 中国用户看到 Stripe | `curl -H "Accept-Language: zh-CN" localhost:3000/api/payment/methods \| jq '.provider == "wechat"'` |
| **D3-12** | 失败 fallback（Stripe 失败 → 自动转微信）| 用户卡住 | `grep "fallback.*wechat\|fallback.*alipay" src/payment/router.ts` ≥ 1 |
| **D3-13** | 跨支付对账（Stripe/微信/支付宝 3 源每日对账）| 数据不一致 | `grep "cross_provider_reconcile" src/jobs/payment-reconcile.ts` ≥ 1 |
| **D3-14** | 支付失败统一告警（飞书 push）| 失败没人知道 | `grep "alert.*payment.*failure" src/payment/alert.ts` ≥ 1 |

---

### Day 4：Discovery 对话引擎 + 数据采集（16 任务）

#### 3.18 Discovery 对话状态机（6 任务）

| 编号 | 任务 | 失败模式 | 验证 |
|:--|:---|:---|:---|
| **D4-1** | 5 状态机（opening/capability/need/direction/summary）| 状态错乱 | `jq '.states \| length' src/discovery/state-machine.json == 5` |
| **D4-2** | max_turns = 10 硬限制 | 无限对话 | `grep "max_turns.*10" src/discovery/state-machine.json` |
| **D4-3** | 上下文窗口管理（避免超长 prompt 烧 token）| 成本失控 | `grep "truncate\|summarize.*context" src/discovery/context.ts` ≥ 1 |
| **D4-4** | 输入验证（防 prompt injection）| 攻击 | `grep "sanitize\|escapePrompt" src/discovery/validator.ts` ≥ 1 |
| **D4-5** | 能力图谱提取（≥10 维度）| 提取失败 | `jq '.capabilities \| length' src/discovery/capability-extractor.js >= 10` |
| **D4-6** | 需求图谱提取（10 维度）| 提取失败 | `jq '.dimensions \| length' src/discovery/need-extractor.js == 10` |

#### 3.19 蓝图生成器 + 案例库（6 任务）

| 编号 | 任务 | 失败模式 | 验证 |
|:--|:---|:---|:---|
| **D4-7** | 蓝图生成器（≥5 章节）| 空蓝图 | `jq '.blueprint_sections \| length' src/discovery/blueprint.js >= 5` |
| **D4-8** | 案例库 ≥ 20 个 | 案例不足 | `ls src/discovery/examples/*.md \| wc -l >= 20` |
| **D4-9** | 案例覆盖 9 大赛道 | 案例不全 | `ls src/discovery/examples/ \| xargs -I{} basename {} .md \| sort -u \| wc -l >= 9` |
| **D4-10** | 蓝图导出 PDF（html-pdf-node）| 导出失败 | `grep -c "html-pdf-node\|pdfkit" package.json` ≥ 1 |
| **D4-11** | 蓝图版本化（每次更新产生新版本）| 覆盖丢失 | `psql -c "\d blueprints" \| grep "version"` |
| **D4-12** | Discovery 完成埋点（每状态切换 + 每能力提取）| 数据缺失 | `grep "track.*event" src/discovery/analytics/tracker.ts` ≥ 5 |

#### 3.20 5 维数据采集（4 任务）

| 编号 | 任务 | 失败模式 | 验证 |
|:--|:---|:---|:---|
| **D4-13** | 流量采集器（4 平台 API：视频号/抖音/小红书/B站）| 流量数据缺失 | `ls src/monitor/collectors/traffic.ts 2>&1 \| grep -v "No such"` |
| **D4-14** | 转化采集器（落地页 → 注册 → 付费）| 漏斗数据缺失 | `ls src/monitor/collectors/conversion.ts 2>&1 \| grep -v "No such"` |
| **D4-15** | 收入采集器（Stripe webhook + 微信/支付宝对账）| 收入漏算 | `ls src/monitor/collectors/revenue.ts 2>&1 \| grep -v "No such"` |
| **D4-16** | 品牌 + 留存采集器（社交 mention + 用户行为日志）| 品牌数据缺失 | `ls src/monitor/collectors/{brand,retention}.ts 2>&1 \| grep -v "No such" \| wc -l == 2` |

---

### Day 5：异常预警 + 飞书/邮件 push + Tier 1 MVP（16 任务）

#### 3.21 异常预警规则（4 任务）

| 编号 | 任务 | 失败模式 | 验证 |
|:--|:---|:---|:---|
| **D5-1** | 10+ 预警规则（流量骤降/转化暴跌/收入停滞/付费失败/SLA 等）| 规则不足 | `jq '.rules \| length' src/monitor/alerts/rules.json >= 10` |
| **D5-2** | 预警去重（5 分钟内同规则不重复发）| 预警轰炸 | `grep "dedup\|cooldown" src/monitor/alerts/engine.ts` ≥ 1 |
| **D5-3** | 严重程度分级（critical/warning/info）| 全部同级别 | `jq '[.rules[].severity] \| unique \| length' src/monitor/alerts/rules.json == 3` |
| **D5-4** | 预警准确率监控（false positive 跟踪）| 误报没人管 | `psql -c "\d alert_feedback" \| grep "was_useful"` |

#### 3.22 飞书 + 邮件 push（4 任务）

| 编号 | 任务 | 失败模式 | 验证 |
|:--|:---|:---|:---|
| **D5-5** | 飞书 webhook 配置（env）| 推送失败 | `grep "FEISHU_WEBHOOK" .env` |
| **D5-6** | 飞书消息签名验证 | 伪造 | `grep "verifyFeishuSign" src/feishu/verify.ts` ≥ 1 |
| **D5-7** | 邮件 SMTP（Mailgun 或 SES）配置 | 推送失败 | `grep "MAILGUN_API_KEY\|AWS_SES" .env` |
| **D5-8** | push 失败 fallback（飞书失败 → 邮件）| 全部通知丢失 | `grep "fallback.*email\|fallback.*feishu" src/notify/router.ts` ≥ 1 |

#### 3.23 Tier 1 MVP 套餐（4 任务）

| 编号 | 任务 | 失败模式 | 验证 |
|:--|:---|:---|:---|
| **D5-9** | 4 Agent 标准配置模板（content/acquisition/delivery/support）| 模板不全 | `jq '.agents \| length' products/tier1/4-agents.json == 4` |
| **D5-10** | ≥5 内容模板库 | 模板不足 | `jq '.templates \| length' products/tier1/templates.json >= 5` |
| **D5-11** | ≥3 平台数据接入 | 接入不全 | `jq '.integrations \| length' products/tier1/data-integration.json >= 3` |
| **D5-12** | delivery-manifest.json（交付清单）| 交付不明 | `test -f products/tier1/delivery-manifest.json` |

#### 3.24 14 天试用 + 早鸟窗口（4 任务）

| 编号 | 任务 | 失败模式 | 验证 |
|:--|:---|:---|:---|
| **D5-13** | 14 天试用管理（trial_start, trial_end, auto_convert）| 试用不结束 | `jq '.trial.duration_days' src/monetize/trial.json == 14` |
| **D5-14** | 试用结束前 3 天提醒（邮件 + 飞书）| 用户没准备 | `jq '.trial.reminder_days_before' src/monetize/trial.json == 3` |
| **D5-15** | 早鸟 quota 表（前 100 用户锁价 ¥699/月）| 早鸟滥用 | `psql -c "SELECT quota_total - quota_used FROM early_bird_quota WHERE id=1"` ≥ 0 |
| **D5-16** | 早鸟结束自动转标准价 | 早鸟无限 | `psql -c "UPDATE early_bird_quota SET is_active = FALSE WHERE quota_used >= quota_total"` |

---

### Day 6：Tier 2 + Tier 3 接入 + 4 Agent 持续执行（16 任务）

#### 3.25 Tier 2 订阅 + 持续运营（5 任务）

| 编号 | 任务 | 失败模式 | 验证 |
|:--|:---|:---|:---|
| **D6-1** | Tier 2 订阅 API（自动续费 + 取消）| 续费失败 | `curl -X POST localhost:3000/api/tier2/subscribe -d '{"user_id":"u1"}' \| jq .subscription_id != null` |
| **D6-2** | 4 Agent 持续执行引擎（每用户 N 次/天）| Agent 罢工 | `ls src/tier2/operations-engine.ts && grep "runAllAgents\|executeAll" src/tier2/operations-engine.ts` |
| **D6-3** | 月度策略报告（每月 1 号自动生成）| 没报告 | `test -f src/tier2/monthly-report.ts && grep "schedule.*monthly\|cron.*0 0 1" src/tier2/scheduler.ts` |
| **D6-4** | 月报阅读率追踪（≥50%）| 阅读率低 | `psql -c "SELECT COUNT(DISTINCT user_id) FROM report_views WHERE report_type='monthly' AND viewed_at > NOW() - INTERVAL '30 days'"` |
| **D6-5** | Tier 2 用户月均增长 ≥ 20% 监控 | 用户不增长 | `psql -c "SELECT AVG(growth_pct) FROM tier2_user_growth WHERE tier2_started_at < NOW() - INTERVAL '60 days'"` ≥ 20 |

#### 3.26 Tier 3 入学 + 服务端校验（4 任务）

| 编号 | 任务 | 失败模式 | 验证 |
|:--|:---|:---|:---|
| **D6-6** | Tier 3 入学 API（¥50,000 一次性付款）| 入学失败 | `curl -X POST localhost:3000/api/tier3/enroll -d '{"user_id":"u1","payment_proof":"¥50000"}' \| jq .enrollment_id != null` |
| **D6-7** | **服务端校验**：Tier 3 用户必须有 Tier 2 完成记录 | **CRITICAL**: 直接进 | `psql -c "SELECT COUNT(*) FROM tier_subscriptions WHERE tier='tier3' AND user_id NOT IN (SELECT user_id FROM tier_subscriptions WHERE tier='tier2')"` 必须 = 0 |
| **D6-8** | 数据库 CHECK 约束（tier='tier3' 必须有 tier2_completed_at）| 绕过 API | `psql -c "INSERT INTO tier_subscriptions(user_id,tier,tier2_completed_at) VALUES ('u_x','tier3',NULL)" \| grep -c "violates check constraint"` 必须 > 0 |
| **D6-9** | 顾问资源池（≥5 名）| 资源不足 | `ls src/tier3/consultants/*.json \| wc -l >= 5` |

#### 3.27 Agent 决策边界（合伙人角色）（3 任务）

| 编号 | 任务 | 失败模式 | 验证 |
|:--|:---|:---|:---|
| **D6-10** | Agent 边界表（auto vs confirm，按动作分类）| 边界混乱 | `test -f src/agents/boundaries.json && jq '.actions \| length' src/agents/boundaries.json >= 8` |
| **D6-11** | Content Agent 决策：内容起草 auto，发布 confirm | 误发布 | `jq '.content_agent.draft' src/agents/boundaries.json == "auto" && jq '.content_agent.publish' src/agents/boundaries.json == "confirm"` |
| **D6-12** | Support Agent 决策：自动回复 auto，退款 confirm | 错误退款 | `jq '.support_agent.reply' src/agents/boundaries.json == "auto" && jq '.support_agent.refund' src/agents/boundaries.json == "confirm"` |

#### 3.28 4 Agent 持续运行健康检查（4 任务）

| 编号 | 任务 | 失败模式 | 验证 |
|:--|:---|:---|:---|
| **D6-13** | 4 Agent 心跳监控（每 5 分钟）| Agent 罢工没人知道 | `test -f src/monitor/agents/heartbeat.ts && grep "interval.*5.minute\|*/5.*heartbeat" crontab` |
| **D6-14** | Agent 失败自动重启（最多 3 次）| Agent 不恢复 | `grep "restart.*max.*3\|retry.*max.*3" src/monitor/agents/restart.ts` ≥ 1 |
| **D6-15** | Agent 决策 review 摘要（每周日 22:00）| 用户没 review | `test -f src/agents/review-summary.ts && grep "0 22.*7\|22:00.*sunday\|sunday.*22" crontab` |
| **D6-16** | Agent 输出内容红线审查（7 条硬红线）| 违规内容 | `jq '.red_lines \| length' src/agents/consistency-agent.json >= 7` |

---

### Day 7：M1 验收 + 推荐系统 + 早鸟启用（14 任务）

#### 3.29 推荐系统（4 任务）

| 编号 | 任务 | 失败模式 | 验证 |
|:--|:---|:---|:---|
| **D7-1** | 推荐链接生成（unique referral code）| 推荐码冲突 | `curl -X POST localhost:3000/api/referral/code -d '{"user_id":"u1"}' \| jq .code != null` |
| **D7-2** | 推荐关系记录（referrer_id + referred_id）| 关系丢失 | `psql -c "\d referrals" \| grep "referrer_id\|referred_id"` |
| **D7-3** | 推荐人 15% 佣金自动发放 | 佣金不到账 | `grep "commission_pct.*15" src/monetize/referral.json` |
| **D7-4** | 推荐率追踪（≥20%）| 推荐无效 | `psql -c "SELECT COUNT(DISTINCT referrer_id) * 100.0 / (SELECT COUNT(*) FROM paid_users) FROM referrals"` ≥ 20 |

#### 3.30 续费 + 早鸟启用 + 监控（4 任务）

| 编号 | 任务 | 失败模式 | 验证 |
|:--|:---|:---|:---|
| **D7-5** | 续费提醒（到期前 7/1/0 天）| 用户忘记续费 | `jq '.reminder_days' src/monetize/renewal.json == [7,1,0]` |
| **D7-6** | 续费失败自动 grace period（3 天）| 立即撤销访问 | `grep "grace_period.*3.days\|grace_days.*3" src/monetize/renewal.ts` |
| **D7-7** | 启动早鸟窗口（quota_used = 0）| 早鸟未启用 | `psql -c "UPDATE early_bird_quota SET quota_used = 0, is_active = TRUE WHERE id=1"` |
| **D7-8** | M1 启动监控仪表盘上线 | 看不到指标 | `curl localhost:3000/dashboard/m1-launch \| grep "M1 启动"` |

#### 3.31 Design Partner 邀请 + M1 验收（6 任务）

| 编号 | 任务 | 失败模式 | 验证 |
|:--|:---|:---|:---|
| **D7-9** | 设计 5 个 design partner 邀请名单 | 没用户测试 | `psql -c "SELECT COUNT(*) FROM design_partner_invites WHERE sent_at > NOW() - INTERVAL '1 day'" >= 5` |
| **D7-10** | design partner 注册漏斗监控 | 漏转化 | `psql -c "SELECT COUNT(*) FROM design_partners WHERE registered_at IS NOT NULL"` ≥ 3 |
| **D7-11** | design partner 反馈收集（每日提醒）| 没反馈 | `grep "design_partner.*feedback.*cron\|cron.*feedback" crontab` |
| **D7-12** | design partner NPS ≥ 7 监控 | 体验差 | `psql -c "SELECT AVG(nps_score) FROM design_partner_feedback"` ≥ 7 |
| **D7-13** | M1 完整验收（138 个任务全 PASS）| 漏任务 | `cat M1-CHECKLIST.md \| grep -c "✅" == 138` |
| **D7-14** | M1 启动总结写入 PRD（v4.1 → v4.2） | 历史丢失 | `grep -c "M1 启动.*2026-07" ONE-MCN-PRD.md >= 1` |

---

## 4. M2 (Day 8-30): 试用转化 + Tier 1→Tier 2 验证（16 任务）

### 4.1 design partner 行为观察（3 任务）

| 编号 | 任务 | 失败模式 | 验证 |
|:--|:---|:---|:---|
| **M2-1** | design partner 每日活跃监控 | 没人用 | `psql -c "SELECT COUNT(DISTINCT user_id) FROM active_sessions WHERE created_at > NOW() - INTERVAL '1 day'"` ≥ 3 |
| **M2-2** | design partner 反馈收集（≥5 条）| 没反馈 | `psql -c "SELECT COUNT(*) FROM design_partner_feedback WHERE created_at > NOW() - INTERVAL '7 days'"` ≥ 5 |
| **M2-3** | Discovery 完成率 ≥ 60% | 用户卡住 | `psql -c "SELECT COUNT(*) FILTER (WHERE blueprint_id IS NOT NULL) * 100.0 / COUNT(*) FROM users WHERE created_at > NOW() - INTERVAL '7 days'"` ≥ 60 |

### 4.2 试用到期 + 转化（5 任务）

| 编号 | 任务 | 失败模式 | 验证 |
|:--|:---|:---|:---|
| **M2-4** | 试用到期前 3 天提醒触发 | 没提醒 | `psql -c "SELECT COUNT(*) FROM trial_reminders_sent WHERE sent_at > NOW() - INTERVAL '3 days'"` ≥ 3 |
| **M2-5** | 第一批试用转化率（≥10%）| 转化失败 | `psql -c "SELECT COUNT(*) FILTER (WHERE first_trial_at IS NOT NULL) * 100.0 / COUNT(*) FROM users WHERE created_at > NOW() - INTERVAL '30 days'"` ≥ 10 |
| **M2-6** | Stage 4 与 Tier 解耦验证 | 耦合 | `grep -rE "tier[123]" src/monetize/ 2>/dev/null \| wc -l` 必须 = 0 |
| **M2-7** | 失败支付 retry cron（3 天 grace）| 用户失去访问 | `crontab -l \| grep "payment.*retry.*3.days"` |
| **M2-8** | 失败支付 24h 内自动恢复 | 用户不知 | `psql -c "SELECT COUNT(*) FROM payment_failures WHERE resolved_at IS NULL AND created_at < NOW() - INTERVAL '24 hours'"` 必须 = 0 |

### 4.3 Tier 1 → Tier 2 转化（5 任务）

| 编号 | 任务 | 失败模式 | 验证 |
|:--|:---|:---|:---|
| **M2-9** | Tier 1 完成率 | 用户未完成 | `psql -c "SELECT COUNT(*) FILTER (WHERE tier1_completed_at IS NOT NULL) * 100.0 / COUNT(*) FROM tier_subscriptions WHERE tier='tier1'"` |
| **M2-10** | Tier 1 → Tier 2 转化率 ≥ 20% | 转化失败 | `psql -c "SELECT (COUNT(*) FILTER (WHERE tier='tier2')) * 100.0 / COUNT(*) FROM tier_subscriptions WHERE tier='tier1' AND started_at < NOW() - INTERVAL '30 days'"` ≥ 20 |
| **M2-11** | Tier 2 用户 Tier 1 完成率 ≥ 90% | 跳过 Tier 1 | `psql -c "SELECT (COUNT(*) FILTER (WHERE tier1_completed_at IS NOT NULL)) * 100.0 / COUNT(*) FROM tier_subscriptions WHERE tier='tier2'"` ≥ 90 |
| **M2-12** | Tier 2 月度策略报告 100% 生成 | 漏生成 | `psql -c "SELECT COUNT(DISTINCT user_id) FROM report_runs WHERE report_type='monthly' AND created_at > NOW() - INTERVAL '30 days'" \| awk -v total="$(psql -c "SELECT COUNT(*) FROM tier_subscriptions WHERE tier='tier2' AND started_at < NOW() - INTERVAL '30 days'")" '$1 == total'` |
| **M2-13** | Tier 2 用户月均收入增长 ≥ 20% | 用户不增长 | `psql -c "SELECT AVG(growth_pct) FROM tier2_user_growth WHERE tier2_started_at < NOW() - INTERVAL '60 days'"` ≥ 20 |

### 4.4 系统健康度（3 任务）

| 编号 | 任务 | 失败模式 | 验证 |
|:--|:---|:---|:---|
| **M2-14** | API 99% 可用（月度 downtime < 7h） | 服务挂了 | `psql -c "SELECT (1 - SUM(EXTRACT(EPOCH FROM (downtime_end - downtime_start))) / 86400.0 / 30 * 100) FROM downtimes WHERE downtime_end > NOW() - INTERVAL '30 days'"` ≥ 99 |
| **M2-15** | Stripe webhook 100% 幂等 | 双重扣费 | `psql -c "SELECT (COUNT(*) - COUNT(DISTINCT event_id)) FROM stripe_events"` 必须 = 0 |
| **M2-16** | 数据库备份每日成功 | 备份失败 | `find /backup -name "*.sql" -mtime -1 \| wc -l` ≥ 1 |

---

## 5. M3 (Day 31-60): Tier 2 持续运营 + 月度报告（8 任务）

| 编号 | 任务 | 失败模式 | 验证 |
|:--|:---|:---|:---|
| **M3-1** | Content Agent 每日产出 ≥ 5 条 | Agent 罢工 | `psql -c "SELECT COUNT(*) FROM content_outputs WHERE created_at > NOW() - INTERVAL '1 day'"` ≥ 5 |
| **M3-2** | Acquisition Agent 每日触达 ≥ 50 | 没流量 | `psql -c "SELECT COUNT(*) FROM acquisitions WHERE created_at > NOW() - INTERVAL '1 day'"` ≥ 50 |
| **M3-3** | Delivery Agent 订单响应 < 1h | 慢 | `psql -c "SELECT AVG(EXTRACT(EPOCH FROM (delivered_at - created_at))) FROM product_deliveries WHERE created_at > NOW() - INTERVAL '7 days'" \| awk '$1 < 3600'` |
| **M3-4** | Support Agent 7×24 在线 | 没人值班 | `psql -c "SELECT COUNT(*) FROM support_replies WHERE created_at > NOW() - INTERVAL '1 day'"` ≥ 10 |
| **M3-5** | 月度策略报告 100% 生成 | 漏生成 | `psql -c "SELECT COUNT(DISTINCT user_id) FROM report_runs WHERE report_type='monthly' AND created_at > NOW() - INTERVAL '30 days'"` |
| **M3-6** | 月报阅读率 ≥ 50% | 用户不看 | `psql -c "SELECT COUNT(DISTINCT user_id) * 100.0 / (SELECT COUNT(*) FROM tier_subscriptions WHERE tier='tier2' AND status='active') FROM report_views WHERE report_type='monthly' AND viewed_at > NOW() - INTERVAL '30 days'"` ≥ 50 |
| **M3-7** | 优化建议采纳率 ≥ 30% | 建议无用 | `psql -c "SELECT COUNT(*) FILTER (WHERE adopted) * 100.0 / COUNT(*) FROM optimization_suggestions"` ≥ 30 |
| **M3-8** | Tier 2 4 Agent 持续运行 ≥ 80% | Agent 罢工 | `psql -c "SELECT COUNT(*) * 100.0 / (4 * (SELECT COUNT(*) FROM tier_subscriptions WHERE tier='tier2' AND status='active')) FROM agent_executions WHERE created_at > NOW() - INTERVAL '1 day'"` ≥ 80 |

---

## 6. M4-M6 (Day 61-180): Tier 3 + 早鸟满 + 推荐（13 任务）

### 6.1 Tier 3 启动（4 任务）

| 编号 | 任务 | 失败模式 | 验证 |
|:--|:---|:---|:---|
| **M4-1** | Tier 3 入学 API 测试 | 入学失败 | `curl -X POST localhost:3000/api/tier3/enroll -d '{"user_id":"u1","payment_proof":"¥50000"}' \| jq .enrollment_id != null` |
| **M4-2** | Tier 3 必须从 Tier 2 转化 | 绕过 | `psql -c "SELECT COUNT(*) FROM tier_subscriptions WHERE tier='tier3' AND user_id NOT IN (SELECT user_id FROM tier_subscriptions WHERE tier='tier2')"` 必须 = 0 |
| **M4-3** | 顾问资源池 ≥ 5 名 | 资源不足 | `ls src/tier3/consultants/*.json \| wc -l >= 5` |
| **M4-4** | Tier 3 行业资源库 ≥ 20 个 | 资源不足 | `ls resources/tier-3-industry/*.json \| wc -l >= 20` |

### 6.2 早鸟窗口关闭 + 推荐（5 任务）

| 编号 | 任务 | 失败模式 | 验证 |
|:--|:---|:---|:---|
| **M5-1** | 早鸟 100 个用户满 | 早鸟过早用完 | `psql -c "SELECT quota_total - quota_used FROM early_bird_quota WHERE id=1"` = 0 |
| **M5-2** | 早鸟窗口自动关闭 | 早鸟滥用 | `psql -c "UPDATE early_bird_quota SET is_active = FALSE WHERE quota_used >= quota_total"` |
| **M5-3** | 推荐率 ≥ 20% | 推荐无效 | `psql -c "SELECT COUNT(DISTINCT referrer_id) * 100.0 / (SELECT COUNT(*) FROM paid_users) FROM referrals"` ≥ 20 |
| **M5-4** | 推荐佣金发放 | 没到账 | `psql -c "SELECT SUM(amount_cny) FROM referral_commissions WHERE created_at > NOW() - INTERVAL '30 days'"` > 0 |
| **M5-5** | 推荐系统 NPS ≥ 8 | 推荐体验差 | `psql -c "SELECT AVG(nps_score) FROM referral_feedback WHERE created_at > NOW() - INTERVAL '30 days'"` ≥ 8 |

### 6.3 M6 验收（4 任务）

| 编号 | 任务 | 失败模式 | 验证 |
|:--|:---|:---|:---|
| **M6-1** | MAU ≥ 100 | 用户不足 | `psql -c "SELECT COUNT(DISTINCT user_id) FROM active_sessions WHERE created_at > NOW() - INTERVAL '30 days'"` ≥ 100 |
| **M6-2** | LTV/CAC ≥ 3.0 | 不盈利 | `python3 -c "ltv=calc_ltv(); cac=calc_cac(); print(ltv/cac)" \| awk '$1 >= 3.0'` |
| **M6-3** | 续费率 ≥ 70% | 用户流失 | `psql -c "SELECT COUNT(*) FILTER (WHERE renewed_at IS NOT NULL) * 100.0 / COUNT(*) FROM paid_users WHERE created_at < NOW() - INTERVAL '30 days'"` ≥ 70 |
| **M6-4** | Tier 3 ≥ 3 个用户 | 没吸引力 | `psql -c "SELECT COUNT(*) FROM tier_subscriptions WHERE tier='tier3'"` ≥ 3 |

---

## 7. 跨阶段 Eval 矩阵（v4.2 完整）

### 7.1 用户旅程 Eval（7 验证）

| 阶段 | 关键事件 | 验证命令 |
|:---|:---|:---|
| 进入 | 用户注册 | `psql -c "SELECT COUNT(*) FROM users WHERE created_at > NOW() - INTERVAL '7 days'"` |
| Stage 1 | 蓝图生成 | `psql -c "SELECT COUNT(*) FROM users WHERE blueprint_id IS NOT NULL"` |
| Stage 2 | 4 Agent 配置 | `psql -c "SELECT COUNT(*) FROM brand_buildings WHERE validated_at IS NOT NULL"` |
| Stage 3 | 周报查看 | `psql -c "SELECT COUNT(DISTINCT user_id) FROM report_views WHERE viewed_at > NOW() - INTERVAL '7 days'"` |
| Tier 1 | ¥999/月订阅 | `psql -c "SELECT COUNT(*) FROM tier_subscriptions WHERE tier='tier1' AND status='active'"` |
| Tier 2 | ¥999/月升级 | `psql -c "SELECT COUNT(*) FROM tier_subscriptions WHERE tier='tier2' AND status='active'"` |
| Tier 3 | ¥50,000 入学 | `psql -c "SELECT COUNT(*) FROM tier3_enrollments"` |

### 7.2 业务北极星（6 验证）

| 指标 | 目标（M6） | 验证命令 |
|:---|:---|:---|
| MAU | ≥ 100 | 见 M6-1 |
| 试用→付费 | ≥ 10% | 见 M2-5 |
| Tier 1 → Tier 2 | ≥ 20% | 见 M2-10 |
| 续费率 | ≥ 70% | 见 M6-3 |
| LTV/CAC | ≥ 3.0 | 见 M6-2 |
| 推荐率 | ≥ 20% | 见 M5-3 |

### 7.3 系统运营健康（8 验证）

| 指标 | 目标 | 验证命令 |
|:---|:---|:---|
| 数据库表 | 8/8 | 见 D0-5 |
| 多租户 RLS 隔离 | 100% | 见 A7 |
| Stripe webhook 幂等 | 100% | 见 A6 |
| API 可用性 | ≥ 99% | 见 M2-14 |
| 5 维数据延迟 | < 5min | 见 A10 |
| 备份完整 | 100% | 见 A8 |
| 数据库恢复测试 | 每周 1 次 | 见 D0-17 |
| Stage 4 与 Tier 解耦 | 完全 | 见 A4 |

---

## 8. 熔断守卫（3 层）

### 8.1 全局熔断

```bash
touch ~/.claude/STOP
```

### 8.2 各阶段熔断（10 触发条件）

| 熔断 | 触发动作 |
|:---|:---|
| 14 天试用转化 < 5% | 暂停推广 + 调研 design partner |
| Tier 1 流失 > 30%/月 | 暂停销售 + 调研 |
| Tier 1→2 转化 < 10% | 重写 Tier 2 价值主张 |
| Tier 3 直接进入 | 立即修复 API + 服务端校验 |
| Stage 4 与 Tier 耦合 | 立即重构 + 提交 decision record |
| 设计 partner NPS < 5 | 暂停所有新用户获取 |
| Stripe webhook 重复事件 | 立即检查幂等性代码 |
| 数据泄漏（RLS 失效）| 立即停服 + 通知所有用户 |
| 备份失败 24h+ | 立即人工备份 + 调查 |
| 5 维数据延迟 > 30min | 立即重启 cron + 飞书告警 |

### 8.3 操作员 Kill Switch（3 命令）

```bash
# 暂停所有 Tier 1/2 销售
psql -c "UPDATE tier_subscriptions SET status='paused' WHERE status='active'"

# 暂停早鸟
psql -c "UPDATE early_bird_quota SET is_active = FALSE WHERE id=1"

# 通知所有人
curl -X POST "$FEISHU_WEBHOOK" -d '{"msg":"🚨 KILL SWITCH 触发"}'
```

---

## 9. 风险与对冲（基于 Reddit/GitHub 实战案例）

| 风险 | 等级 | 来源 | 对冲 | 验证命令 |
|:---|:---|:---|:---|:---|
| **Stripe webhook race condition** | 🔴 致命 | Snowinch/GEMBA 实战 | 用 `INSERT ... ON CONFLICT` 不用 SELECT-then-INSERT | D2-10 |
| **Stripe 签名验证失败** | 🔴 致命 | Stripe docs + Reddit | express.raw body + constructEvent | D2-6/7 |
| **多租户数据泄漏** | 🔴 致命 | ClickHouse/AWS/RLS 实战 | FORCE RLS + 复合索引 + 中间件 SET LOCAL | D0-9/10/11/14 |
| **微信支付月度订阅失败** | 🔴 致命 | Dodo/Reddit | 只支持年度方案 | D3-5 |
| **试用转化低于预期** | 🟡 高 | OpenView 14.7% 中位数 | 72 小时激活 + 行为触发 | D5-13 + D6-15 |
| **第一付费客户被 bug 烧走** | 🟡 高 | DEV.to 案例 | 错误跟踪 + retry 所有 I/O | D1-3 + 多个重试 |
| **数据库备份恢复失败** | 🟡 高 | Gorrion checklist | 每周恢复测试 + 加密 | D0-16/17 |
| **Tier 3 入学门槛被绕过** | 🔴 高 | 商业策略 | 数据库 CHECK + 服务端校验 | D6-7/8 |
| **失败支付不重试** | 🟡 中 | Stripe | dunning email 3 天 grace | D2-21 |
| **设计 partner 不回复反馈** | 🟡 中 | Reddit r/SaaS | 1:1 视频通话而非邮件 | D7-9 |

---

## 10. 变更记录

| 日期 | 版本 | 变更 |
|:---|:---|:---|
| 2026-06-04 | v2.0.3 | 12 Skill 框架 + M1 7 天 SOP |
| 2026-06-21 | v4.1 | 重定位：3 Tier 定价 + Stage 4 解耦（83 任务）|
| **2026-06-21** | **v4.2** | **138 M1 + 16 M2 + 8 M3 + 13 M4-M6 = 175 任务**，每个含失败模式 + 多验证（正常/边界/并发/安全/性能）。新增 12 个 lead-with-assumption 假设（含 RLS、幂等性、备份恢复等）。**工作量诚实评估：6-10 周（1-2 人团队）**，原"7 天 deadline"重定义为 M1 启动里程碑而非单人完工 deadline |
| **2026-06-22** | **v5.0** | **OPC 节点百科全部删除（本地 + VPS）+ 加入 Anthropic 三段式闭环（Write → Review → Verify → Loop）+ 定位 = vibcoding roadmap 0 员工 100% Loop Engineering 推进** |

---

*本 M1 操作手册 v4.2 与 PRD v4.2 / LOOP-LIST v4.2 对齐。*
*每个任务都经过：失败模式分析 → 模块依赖检查 → 边界测试 → 回滚方案 → 多场景验证。*
