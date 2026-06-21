# 1 人 MCN 公司 · PRD v5.0

> **One-Person MCN · Product Requirements Document**
> **版本**：v5.0（vibcoding roadmap — 0 员工 + 100% Loop Engineering 推进）
> **核心定位**：**帮用户建立自己的 1 人 MCN 品牌**，完整商业闭环
> **创建日期**：2026-06-21
> **更新日期**：2026-06-22（v5.0：OPC 节点百科已全部删除，ONE-MCN 是 vibcoding roadmap）
> **配套**：`ONE-MCN-ARCHITECTURE.md` / `ONE-MCN-M1-SOP.md` / `ONE-MCN-LOOP-LIST.md` / `ONE-MCN-COMMERCIAL.md`

## v5.0 项目状态（2026-06-22 重大转向）

- **产品定位**：正在 vibcoding 的需求（不是未来愿景）
- **开发模式**：0 员工 + 100% vibcoding + Loop Engineering
- **OPC 节点百科**：2026-06-22 已全部删除（本地 + VPS）
- **文档角色**：vibcoding roadmap（每天从 LOOP-LIST 拿 1 个 loop 推进）
- **roadmap 来源**：本 5 份文档 + 33 个 one-mcn-skills/ + `.harness/PLAN-v7.md`

---

## 0. 文档元信息

| 字段 | 内容 |
|:---|:---|
| **产品名** | 1 人 MCN 公司（ONE-MCN）|
| **版本** | v5.0（vibcoding roadmap + 3 Tier + 4 阶段 + Stage 4 解耦 + 8 个商业假设 + 12 个技术假设 + 12 个 CRITICAL 风险）|
| **形态** | 4 阶段流水线（Discovery → Brand Building → Monitor → Monetize）|
| **主线/辅线** | 主线: MVP→验证→扩展品牌 / 辅线: 获客+产品+售后 |
| **核心方法** | Agent 全权决策 + 用户 weekly review（合伙人角色）|
| **3 Tier 定价** | Tier 1 ¥999/月 · Tier 2 ¥999/月 · Tier 3 ¥50,000/次 |
| **Stage 4** | 独立商业化框架（试用→付费→续费→推荐），与 Tier 1-3 解耦 |
| **M1 工作量** | 140 任务 / Day 0-7 milestone = **真实 6-10 周（1-2 人团队）** |

> ⚠️ 与 v4.1 的差异：v4.2 引入 12 个 lead-with-assumption 技术假设（含 RLS、幂等性、备份恢复）+ 8 个商业假设（GTM/CAC/LTV/续费）+ 12 个 CRITICAL 风险标注。配套新文档 `ONE-MCN-COMMERCIAL.md`（竞品 + GTM + Unit Economics + 团队）。

---

## 1. 核心假设（Lead with Assumption, Falsifiable, 12 假设）

> **ai-pm 方法论**：先列可 falsifiable 假设，不列 feature list。
> **12 个假设来源**：Reddit r/SaaS 真实数据 + GitHub production-readiness 实战 + Stripe 文档 + PG RLS 案例 + Pieter Levels 哲学

| # | 假设 | Falsifiable 标准 | 监控命令 | 如果错怎么办 |
|:--|:---|:---|:---|:---|
| **A1** | 用户"想做 1 人 MCN"但**不知道具体怎么做** | 50% 用户在 Discovery 表达"我不知道做啥" | `psql -c "SELECT COUNT(*) FILTER (WHERE blueprint_id IS NULL) * 100.0 / COUNT(*) FROM users WHERE created_at > NOW() - INTERVAL '30 days'"` | 加更多引导示例 + 案例库 |
| **A2** | **多轮 AI 对话**比一次性问卷更能挖掘真实需求 | 阶段 1 完成率（对话 > 5 轮）≥ 60% | `psql -c "SELECT COUNT(*) FILTER (WHERE discovery_turns >= 5) * 100.0 / COUNT(*) FROM users WHERE blueprint_id IS NOT NULL"` | 改用半结构化问卷 |
| **A3** | Agent 全权决策 + 用户 weekly review 比"用户决策 + Agent 执行"更高效 | Agent 自动执行成功率 ≥ 80% | `psql -c "SELECT COUNT(*) FILTER (WHERE auto_decided) * 100.0 / COUNT(*) FROM agent_executions WHERE created_at > NOW() - INTERVAL '7 days'"` | 加 confirmation gate 降权 |
| **A3-02** ⭐ v5.1 新增 | **Agent 自我 review**（LLM 互评 + 一致性审查 Agent）作为 A3 兜底，避免 M3+ 月度报告瓶颈 | Agent 自我 review 通过率 ≥ 90% | `psql -c "SELECT COUNT(*) FILTER (WHERE self_review_passed) * 100.0 / COUNT(*) FROM agent_outputs WHERE created_at > NOW() - INTERVAL '7 days'"` | 降低 A3 阈值到 60% 或加人工 review |
| **A4** | **4 阶段严格串行**比"全模块一次性"成功率高 | 阶段 2 验收通过率 ≥ 30% | `psql -c "SELECT COUNT(*) FILTER (WHERE validated_at IS NOT NULL) * 100.0 / COUNT(*) FROM brand_buildings WHERE started_at < NOW() - INTERVAL '60 days'"` | 允许阶段 2 部分完成后再进 3 |
| **A5** | **试用 + 转化**比直接付费更适合 0→1 阶段 | 试用→付费 ≥ 10%，续费 ≥ 70% | `psql -c "SELECT (COUNT(*) FILTER (WHERE first_trial_at IS NOT NULL)) * 100.0 / COUNT(*) FROM users WHERE created_at > NOW() - INTERVAL '30 days'"` | 改为分层付费 |
| **A6** | Agent 角色 = **合伙人**（自动推 + 用户 review）而非助手 | 用户每周 review 时间 < 30 min | `psql -c "SELECT AVG(EXTRACT(EPOCH FROM review_end_at - review_start_at)) / 60 FROM agent_reviews WHERE created_at > NOW() - INTERVAL '7 days'"` | 增加 review 摘要 |
| **A7** | 数据反馈 = **push + pull 组合**比单一通道好 | push 响应率 ≥ 40%，pull 周活 ≥ 50% | `psql -c "SELECT (COUNT(*) FILTER (WHERE pushed_at IS NOT NULL)) * 100.0 / COUNT(*) FROM alerts WHERE created_at > NOW() - INTERVAL '30 days'"` | 优化 push 时机 |
| **A8** | **🔴 CRITICAL：多租户数据 100% 隔离**（RLS + tenant_id）| 任何跨租户查询返回非空 | `psql -c "SET app.tenant_id='T1'; INSERT INTO users(email,tenant_id) VALUES('a@t.com','T1'); SET app.tenant_id='T2'; SELECT email FROM users;"` 必须 = 0 行 | 立即停服 + 启用 FORCE RLS |
| **A9** | **🔴 CRITICAL：Stripe webhook 100% 幂等**（避免双重扣费）| 重复事件 → 重复处理 | `psql -c "SELECT (COUNT(*) - COUNT(DISTINCT event_id)) FROM stripe_events"` 必须 = 0 | 立即改用 INSERT ... ON CONFLICT |
| **A10** | **🔴 CRITICAL：Stripe 签名 100% 验证**（防伪造）| 任何 webhook 接受未签名请求 | `psql -c "SELECT COUNT(*) FROM stripe_events WHERE signature_verified = false"` 必须 = 0 | 立即修复 express.raw + constructEvent |
| **A11** | **🔴 CRITICAL：数据备份 24h 内可恢复** | 任何 24h 周期无成功备份 | `find /backup -name "*.sql" -mtime -1 \| wc -l` ≥ 1 | 立即人工备份 + 调查 |
| **A12** | **🔴 CRITICAL：Tier 3 必须从 Tier 2 转化**（防止绕过）| 任何直接进 | `psql -c "SELECT COUNT(*) FROM tier_subscriptions WHERE tier='tier3' AND user_id NOT IN (SELECT user_id FROM tier_subscriptions WHERE tier='tier2')"` 必须 = 0 | 立即修复 API + 服务端校验 |

---

## 1.5 商业假设（Business Assumption, Falsifiable, 8 假设）

> **为什么需要商业假设**：12 个技术假设回答"产品能不能做出来"，但 0→1 阶段更关键的是"做出来有没有人付钱"。**以下 8 个假设决定 ONE-MCN 是否能跑通 PMF**。
>
> **数据来源**：OpenView 2025 PLG Benchmark + Reddit r/SaaS + 公开资料整理（详见 `ONE-MCN-COMMERCIAL.md`）。

| # | 假设 | Falsifiable 标准 | 监控命令 | 如果错怎么办 |
|:--|:---|:---|:---|:---|
| **B1** | **ICP 付费意愿**：28-40 岁 0 收入/月入 <1万 愿意付 ¥999/月（10%+ 月收入）| M3 后 Tier 1 转化 < 5% | `psql -c "SELECT COUNT(*) * 100.0 / (SELECT COUNT(*) FROM users WHERE created_at > NOW() - INTERVAL '90 days') FROM tier_subscriptions WHERE tier='tier1'"` | 降到 ¥499/月试 30 天 / 重定义 ICP |
| **B2** | **付费转化**：14 天试用 → 付费 ≥ 10% | M3 后 < 10% | `psql -c "SELECT COUNT(*) * 100.0 / (SELECT COUNT(*) FROM trials WHERE created_at > NOW() - INTERVAL '90 days') FROM paid_users WHERE first_trial_at IS NOT NULL"` | 缩短试用到 7 天 / 强化试用期内 onboarding |
| **B3** | **Tier 1 → Tier 2 ≥ 20%** | M6 后 < 20% | `psql -c "SELECT COUNT(*) * 100.0 / (SELECT COUNT(*) FROM tier1_users WHERE tier1_end_at < NOW() - INTERVAL '30 days') FROM users WHERE tier1_completed_at IS NOT NULL AND tier2_started_at IS NOT NULL"` | 重写 Tier 2 价值主张 / 合并 Tier 1+2 |
| **B4** | **早鸟 ¥699/月锁价有效拉新** | M3 后早鸟用户 < 20 | `psql -c "SELECT COUNT(*) FROM tier_subscriptions WHERE is_early_bird = TRUE"` | 提高早鸟价到 ¥799 / 延长早鸟窗口 |
| **B5** | **CAC < ¥300**（前 100 用户真实获客成本）| 100 用户后 > ¥300 | `python -c "cac = sum(spend) / paid_users_count; assert cac < 300"` | 暂停付费获客 / 全部转 design partner 推荐 |
| **B6** | **LTV/CAC ≥ 3.0**（OpenView 健康线）| M6 后 < 3.0 | `python -c "ltv = calc_ltv(); cac = calc_cac(); assert ltv/cac >= 3.0; print(ltv/cac)"` | 提高月费 / 强化续费机制 |
| **B7** | **GTM 假设**：抖音/小红书/视频号/X 能找前 100 用户 | M3 后 < 50 注册 | `psql -c "SELECT COUNT(*) FROM users WHERE created_at > NOW() - INTERVAL '90 days'"` | 切换渠道（LinkedIn/即刻/私域裂变）|
| **B8** | **续费 ≥ 70%**（年化）| M6 后 < 70% | `psql -c "SELECT COUNT(*) * 100.0 / (SELECT COUNT(*) FROM paid_users WHERE created_at < NOW() - INTERVAL '30 days') FROM paid_users WHERE renewed_at IS NOT NULL"` | 强化 push 周报 + 主动 review + dunning |

**商业假设的验证节奏**：

| 阶段 | 验证假设 | 通过标准 |
|:---|:---|:---|
| M1 (Day 0-7) | 仅验证 B1（ICP 注册）| ≥ 5 个 design partner 完成 Discovery |
| M2 (Day 8-30) | 验证 B2/B4（试用 + 早鸟）| 试用转化 ≥ 20%（design partner 高意愿）|
| M3 (Day 31-60) | 验证 B5/B7（GTM + CAC）| 30 个付费用户，CAC < ¥300 |
| M4-M6 (Day 61-180) | 验证 B3/B6/B8（Tier 升级 + LTV + 续费）| LTV/CAC ≥ 3.0 + 续费率 ≥ 70% |

---

## 2. ICP（理想客户画像）

> **v5.1.2 ICP 窄化**（产品总监三角度评审）：M1-M3 阶段**只做子集 C**（早期 OPC 创业者 1-3 个月）。
> 子集 A/B（被裁转型 + 传统老板）放到 M6+ 再做。
> **理由**：C 子集"已 0 收入 + 已开始 = 付费意愿最强"；A/B "还在想 = 不会立即付费"。

| 维度 | 描述 |
|:---|:---|
| **目标子集** | **子集 C：早期 OPC 创业者 1-3 个月**（v5.1.2 M1-M3 唯一 ICP）|
| **年龄** | 25-40 岁 |
| **现状** | 已开始 OPC（1-3 个月），月入 < 1 万，**正在付费各种工具** |
| **核心需求** | "OPC 已经起步但慢" — 想加速 + 找工具 + 缺方法 |
| **痛点** | 收入不稳定 + 工具分散 + 不知道下一步 + 孤独感 |
| **预算** | 试用 14 天免费 → ¥699/月（早鸟，前 100）/ ¥999/月（标准 Tier 1+2）/ ¥50,000/次（Tier 3 咨询陪跑） |
| **触达** | 抖音/小红书/视频号（刷到 OPC 节点引流）/ X（海外）|

**早期 ICP 子集**（PMF 验证用）：
- **子集 A**：28-35 岁，前互联网/广告/媒体从业者，已有一定内容输出能力
- **子集 B**：35-40 岁，传统行业老板转型，预算充足但缺乏互联网打法
- **子集 C**：海外华人，英文输出，目标海外 MCN 市场

---

## 3. 4 阶段流水线（v5.1.2 主路串行 + 旁路并行）

> **v5.1.2 阶段调整**（产品总监三角度评审）：
> - **严格串行 → 主路串行 + 旁路并行**
> - **Stage 1（Discovery）完成后立即给 1 个 deliverable**（品牌蓝图 PDF + 1 个"今日可发"内容草稿）
> - 这把"第一次价值"从 M3（4 阶段完成）压缩到 **M1 Stage 1 末（1 周内）**

```
主路（严格串行）:  Stage 1 → Stage 2 → Stage 3 → Stage 4
                              ↓
旁路（并行启动）:  Stage 1 完成后立刻给 deliverable
                                  ↓
                          用户在 M1 末就有第一次可分享产出
```

### 3.1 阶段 1：Discovery（发现）

**Assumption**：A1, A2

**输入**：用户首次进入产品

**核心形态**：**多轮 AI 对话**（5-10 轮），不是问卷
**v5.1.2 旁路并行**：Stage 1 完成当天立即给 deliverable（蓝图 PDF + 内容草稿）

**关键任务**（每个 1 个原子单位）：

| 编号 | 任务 | 验收（单命令） |
|:--|:---|:---|
| 1-1 | 设计 5-10 轮对话 prompt 模板 | `ls prompts/discovery/*.md \| wc -l >= 5` |
| 1-2 | 实现对话状态机（5 状态：开场/能力/需求/方向/总结） | `jq '.states \| length' src/discovery/state-machine.json == 5` |
| 1-3 | 实现"能力图谱"提取（从对话中提取 10 维度能力） | `jq '.capabilities \| length' src/discovery/extract.js >= 10` |
| 1-4 | 实现"需求图谱"提取（10 维度需求 + 优先级） | `jq '.dimensions \| length' src/discovery/extract.js == 10` |
| 1-5 | 实现"个人品牌蓝图生成器"（基于能力+需求 → 蓝图） | `jq '.blueprint_sections \| length' src/discovery/blueprint.js >= 5` |
| 1-6 | 实现"案例展示"组件（OPC 节点作为展示用） | `ls src/discovery/examples/*.md \| wc -l >= 20` |
| 1-7 | 实现"对话完成度跟踪"（每轮埋点） | `test -f src/discovery/analytics/tracker.ts` |
| 1-8 | 实现"阶段 1 → 阶段 2 触发器"（蓝图确认后） | `jq '.trigger.conditions \| length' src/discovery/handoff.js >= 3` |

**阶段 1 Eval**：

| 指标 | 目标 | 验证命令（单条） |
|:---|:---|:---|
| **对话完成率**（≥ 5 轮） | ≥ 60% | `psql -c "SELECT COUNT(*) * 100.0 / (SELECT COUNT(*) FROM users) FROM users WHERE discovery_turns >= 5"` |
| **蓝图生成成功率** | ≥ 90% | `psql -c "SELECT COUNT(*) * 100.0 / (SELECT COUNT(*) FROM users WHERE discovery_turns >= 5) FROM users WHERE blueprint_id IS NOT NULL"` |
| **用户满意度**（1-5 星） | ≥ 4.0 | `psql -c "SELECT AVG(rating) FROM discovery_feedback WHERE created_at > NOW() - INTERVAL '30 days'"` |
| **平均对话轮数** | 5-10 轮 | `psql -c "SELECT AVG(discovery_turns) FROM users WHERE blueprint_id IS NOT NULL"` |

---

### 3.2 阶段 2：Brand Building（品牌建设）

**Assumption**：A3, A4

**输入**：阶段 1 的个人品牌蓝图

**输出**：完整的品牌 4 部分 + 4 个自动化 Agent + **指标转化验证通过**

**双线结构**：
- **主线（线性成长）**：MVP → 验证 → 扩展品牌
- **辅线（产品模块）**：获客 + 产品开发 + 售后

**关键任务**（原子）：

| 编号 | 任务 | 验收（单命令） |
|:--|:---|:---|
| 2-1 | 实现 Agent 1：内容生产 Agent（按蓝图生成内容） | `jq '.agent_id' src/agents/content-agent.json == "content-agent-v1"` |
| 2-2 | 实现 Agent 2：获客 Agent（多渠道获客执行） | `jq '.channels \| length' src/agents/acquisition-agent.json >= 3` |
| 2-3 | 实现 Agent 3：产品交付 Agent（产品上线+客服） | `jq '.delivery_methods' src/agents/delivery-agent.json \| wc -l >= 2` |
| 2-4 | 实现 Agent 4：售后 Agent（用户跟进+复购触发） | `jq '.follow_up_triggers \| length' src/agents/support-agent.json >= 3` |
| 2-5 | 实现"品牌一致性审查"Agent（红线 + 调性） | `jq '.red_lines \| length' src/agents/consistency-agent.json >= 7` |
| 2-6 | 实现 MVP 上线功能（蓝图中最小可执行子集） | `test -f src/mvp-launch/launch.ts` |
| 2-7 | 实现"指标采集"模块（浏览/转化/复购） | `ls src/metrics/collectors/*.ts \| wc -l >= 3` |
| 2-8 | 实现"阶段 2 → 阶段 3 触发器"（指标达 baseline） | `jq '.baseline.metrics' src/brand/handoff.js \| jq length >= 3` |

**Agent 决策边界（合伙人角色）**：

| 动作类型 | Agent 权限 | 用户 review |
|:---|:---|:---|
| 内容起草 | 全自动 | 周 review |
| 内容发布 | 自动（小账号） / 用户确认（大账号） | 周 review |
| 获客触达 | 自动（首轮） / 用户确认（重复） | 周 review |
| 付费转化 | 用户确认（必须） | 实时通知 |
| 财务动作 | 用户确认（必须） | 实时通知 |

**阶段 2 Eval**：

| 指标 | 目标 | 验证命令（单条） |
|:---|:---|:---|
| **4 Agent 可调用** | 100% | `curl /api/agents/list \| jq '.data[] \| .id' \| sort -u \| wc -l == 4` |
| **品牌一致性 0 错误** | 0 | `psql -c "SELECT COUNT(*) FROM consistency_violations WHERE created_at > NOW() - INTERVAL '7 days'"` |
| **7 天指标达 baseline** | ≥ baseline | `python -c "metrics = get_metrics(); baseline = get_baseline(); assert all(m >= b for m, b in zip(metrics, baseline))"` |
| **MVP 上线成功率** | ≥ 90% | `psql -c "SELECT COUNT(*) * 100.0 / (SELECT COUNT(*) FROM brand_buildings WHERE status='launched') FROM brand_buildings WHERE mvp_live = true"` |

---

### 3.3 阶段 3：Monitor（监控）

**Assumption**：A6, A7

**输入**：阶段 2 验收通过 + 品牌已上线

**输出**：监控仪表盘 + 异常预警 + 优化方案

**核心形态**：**push + pull 组合**（不是单一通道）

**关键任务**（原子）：

| 编号 | 任务 | 验收（单命令） |
|:--|:---|:---|
| 3-1 | 实现数据采集（5 维度：流量/转化/收入/品牌/留存） | `ls src/monitor/collectors/*.ts \| wc -l == 5` |
| 3-2 | 实现实时仪表盘（Web 端） | `curl http://localhost:3000/dashboard \| jq '.sections \| length' == 5` |
| 3-3 | 实现异常预警规则（10+ 规则） | `jq '.rules \| length' src/monitor/alerts/rules.json >= 10` |
| 3-4 | 实现飞书/邮件 push 集成 | `jq '.channels' src/monitor/alerts/push.json \| jq length >= 2` |
| 3-5 | 实现周报告自动生成 | `test -f src/monitor/reports/weekly.ts` |
| 3-6 | 实现优化建议生成器（基于指标异常） | `jq '.suggestion_types \| length' src/monitor/optimizer/suggestions.json >= 5` |
| 3-7 | 实现用户 review 摘要（一键回顾） | `test -f src/monitor/review-summary.ts` |

**阶段 3 Eval**：

| 指标 | 目标 | 验证命令（单条） |
|:---|:---|:---|
| **数据采集延迟** | < 5 min | `psql -c "SELECT EXTRACT(EPOCH FROM (NOW() - MAX(collected_at))) FROM monitor_metrics"` |
| **预警准确率** | ≥ 80% | `psql -c "SELECT (COUNT(*) FILTER (WHERE was_useful)) * 100.0 / COUNT(*) FROM alert_feedback"` |
| **周报告阅读率** | ≥ 50% | `psql -c "SELECT COUNT(DISTINCT user_id) * 100.0 / (SELECT COUNT(*) FROM active_users) FROM report_views WHERE report_date > NOW() - INTERVAL '7 days'"` |
| **优化建议采纳率** | ≥ 30% | `psql -c "SELECT COUNT(*) FILTER (WHERE adopted) * 100.0 / COUNT(*) FROM optimization_suggestions"` |

---

### 3.4 阶段 4：Monetize（商业化）

**Assumption**：A5

**输入**：阶段 3 数据（指标 + 用户行为）

**输出**：付费转化 + 续费 + 推荐奖励

**核心形态**：**试用 + 转化**（Pieter Levels 逻辑，前 N 个用户免费，靠免费层漏斗验证后转化）

**关键任务**（原子）：

| 编号 | 任务 | 验收（单命令） |
|:--|:---|:---|
| 4-1 | 实现免费试用管理（默认 14 天试用） | `jq '.trial_days' src/monetize/trial.js == 14` |
| 4-2 | 实现付费升级（Stage 4 独立框架：试用→¥699 早鸟→¥999 标准→¥50K Tier 3） | `jq '.tiers \| length' src/monetize/tiers.json == 3` |
| 4-3 | 实现续费提醒（到期前 7 天 + 1 天 + 当天） | `jq '.reminders \| length' src/monetize/renewal.js == 3` |
| 4-4 | 实现推荐奖励（推荐人 15%，独立于 Stage 4 通用规则） | `jq '.commission_pct' src/monetize/referral.json == 15` |
| 4-5 | 实现支付集成（Stripe + 微信支付 + 支付宝） | `jq '.providers \| length' src/monetize/payment.json == 3` |
| 4-6 | 实现转化漏斗仪表盘 | `test -f src/monetize/dashboard.ts` |
| 4-7 | 实现"如何运营"知识库 | `ls docs/monetize/playbook/*.md \| wc -l >= 10` |

**阶段 4 Eval**：

| 指标 | 目标 | 验证命令（单条） |
|:---|:---|:---|
| **试用→付费转化率** | ≥ 10% | `psql -c "SELECT COUNT(*) * 100.0 / (SELECT COUNT(*) FROM trials WHERE created_at > NOW() - INTERVAL '90 days') FROM paid_users WHERE first_trial_at IS NOT NULL"` |
| **续费率** | ≥ 70% | `psql -c "SELECT COUNT(*) * 100.0 / (SELECT COUNT(*) FROM paid_users WHERE created_at < NOW() - INTERVAL '30 days') FROM paid_users WHERE renewed_at IS NOT NULL"` |
| **推荐率** | ≥ 20% | `psql -c "SELECT COUNT(DISTINCT referrer_id) * 100.0 / (SELECT COUNT(*) FROM paid_users) FROM referrals"` |
| **LTV/CAC** | ≥ 3.0 | `python -c "ltv = calc_ltv(); cac = calc_cac(); print(ltv/cac)"` |

---

## 4. 两条线（主线 + 辅线）

### 4.1 主线：线性成长（MVP → 验证 → 扩展品牌）

```
MVP（最小可行品牌）
   ↓ (7 天指标验证)
验证（核心假设：能跑通）
   ↓ (用户决策：扩 / 收 / 转)
扩展品牌（加内容线 / 加产品线 / 加渠道）
```

**主线 Eval**：
| 阶段 | 触发条件 | 验证命令 |
|:---|:---|:---|
| MVP 上线 | 蓝图确认 + Agent 配置完成 | `psql -c "SELECT COUNT(*) FROM brand_buildings WHERE mvp_live = true"` |
| 验证通过 | 7 天指标达 baseline | `psql -c "SELECT COUNT(*) FROM brand_buildings WHERE validated_at IS NOT NULL"` |
| 扩展品牌 | 用户主动扩展 | `psql -c "SELECT COUNT(*) FROM brand_extensions"` |

### 4.2 辅线：产品模块（获客 + 产品开发 + 售后）

```
获客（Agent 2 自动触达）
   ↓ (转化漏斗)
产品开发（Agent 3 按蓝图交付）
   ↓ (用户使用)
售后（Agent 4 跟进 + 复购触发）
```

**辅线 Eval**：
| 阶段 | 触发条件 | 验证命令 |
|:---|:---|:---|
| 获客启动 | 品牌上线 | `psql -c "SELECT COUNT(*) FROM acquisitions WHERE created_at > NOW() - INTERVAL '30 days'"` |
| 产品交付 | 用户付费 | `psql -c "SELECT COUNT(*) FROM product_deliveries WHERE status='completed'"` |
| 售后跟进 | 用户活跃 | `psql -c "SELECT COUNT(*) FROM support_tickets WHERE status='resolved'"` |

---

## 5. 商业模式：3 Tier 定价 + Stage 4 独立商业化框架

> **核心原则**（昴君 2026-06-21 决策）：
> - 3 个 Tier 对应用户不同成熟阶段，用不同付费机制匹配
> - Stage 4 商业化框架（试用→付费→续费→推荐）与 Tier 1-3 **完全解耦**

### 5.1 定价总览（v5.1.2 M1 阶段只 1 个价格）

> **v5.1.2 定价调整**（产品总监三角度评审）：M1 阶段只实现 **¥999/月 1 个价格 + 14 天试用 + Stripe 收款**。
> M3+ 验证假设 B1（¥999/月 ICP 愿意付）后，再加早鸟 ¥699/月。
> Tier 3 ¥50,000/次放到 M6+ 再做。
> **节省 50% MONETIZE 任务 = 节省 30% M1 阶段时间**

| 阶段 | 价格 | 状态 |
|:---|:---:|:---:|
| **M1-M3 唯一价** | **¥999/月**（+ 14 天免费试用） | ✅ M1 实现 |
| **M3+ 早鸟**（v5.1.2 暂不实现）| ¥699/月（前 100 用户永久）| 🔵 M3 验证后加 |
| **M6+ Tier 3**（v5.1.2 暂不实现）| ¥50,000/次（系统性陪跑 12 个月）| 🔵 M6 验证后加 |

**Stage 4 独立商业化框架**（与 Tier 解耦）：
- 14 天免费试用
- 早鸟窗口（前 100 用户永久）— v5.1.2 暂不实现
- 续费提醒（7/1/0 天）
- 推荐奖励（推荐人 15%）

### 5.2 Tier 1 · MVP 助推器（¥0 → ¥5K）

**价值交换**：
- 用户给：想法 + 能力 + 时间承诺
- 我们给：**完整的自动化产品流程**（4 Agent 配置 + 模板 + 数据接入）

**包含内容**：
- Stage 1 Discovery 完整蓝图
- Stage 2 Brand Building 4 Agent 全矩阵配置
- Stage 3 Monitor 基础数据接入
- 30/60/90 天跟进支持（按订阅时长）

**价格**：**¥999/月**

**为什么不免费？**
- ✅ 符合 Pieter Levels 哲学："**charge from day one**"
- ✅ 用户付出 ¥999 → 重视度提高 3 倍 → 完成率高 2 倍
- ✅ 我们的基础运营成本回收

**原子验证**：
```bash
# Tier 1 定价配置存在
jq '.tier1.monthly_price' pricing.json == 999

# Tier 1 套餐交付物完整
ls products/tier-1/{4-agents.json, templates.json, data-integration.json} | wc -l == 3

# Tier 1 用户数
psql -c "SELECT COUNT(*) FROM tier1_users WHERE status='active'"

# Tier 1 → Tier 2 转化率（≥ 20%）
psql -c "SELECT COUNT(*) * 100.0 / (SELECT COUNT(*) FROM tier1_users WHERE tier1_end_at < NOW() - INTERVAL '30 days') FROM users WHERE tier1_completed_at IS NOT NULL AND tier2_started_at IS NOT NULL"
```

---

### 5.3 Tier 2 · 产品放大器（¥5K → ¥30K）

**价值交换**：
- 用户给：已跑通的产品（月入 ¥5K+）
- 我们给：**自动化运营 + 营销放大**（4 Agent 持续执行 + 多渠道获客 + 数据驱动优化）

**包含内容**：
- Stage 1-3 全部功能（含周报告 + 优化建议）
- 4 Agent 持续执行（不是配置好就完了）
- 多渠道获客自动化
- 月度策略 review
- 数据驱动的产品优化建议

**价格**：**¥999/月**

**与 Tier 1 的区别**：
- Tier 1 = 一次性配置 + 持续支持（用户在"建立"阶段）
- Tier 2 = 持续运营 + 营销放大（用户在"放大"阶段）
- 用户可以同时订阅两个（建立期 + 放大期并行）

**原子验证**：
```bash
# Tier 2 定价配置
jq '.tier2.monthly_price' pricing.json == 999

# Tier 2 用户从 Tier 1 转化率（≥ 30%）
psql -c "SELECT COUNT(*) * 100.0 / (SELECT COUNT(*) FROM tier1_users WHERE tier1_end_at < NOW() - INTERVAL '30 days') FROM tier2_users WHERE tier1_completed_at IS NOT NULL"

# Tier 2 用户月均增长（用户的月入变化）
psql -c "SELECT AVG(tier2_revenue_growth) FROM tier2_users WHERE tier2_started_at < NOW() - INTERVAL '90 days'"
```

---

### 5.4 Tier 3 · 系统性陪跑（¥30K → ¥100K）

**价值交换**：
- 用户给：已证明自己有 ¥5万+/月 潜力 + 资金承诺
- 我们给：**私人定制 + 人力服务**（1v1 顾问 + 定制 Agent + 行业资源）

**包含内容**：
- Stage 1-2 全部功能
- 12 个月 × 每月 4 次 1v1 顾问（每次 1 小时）
- 完全定制 Agent（针对用户特定行业）
- 行业资源对接（投资人/媒体/合作伙伴）
- 月度深度复盘
- 紧急响应（关键事件 24h 内响应）

**价格**：**¥50,000/次**（一次性咨询陪跑）

**为什么不订阅？**
- ✅ 这是"咨询陪跑"范围，不是 SaaS 产品
- ✅ ¥50K 是合理的高端咨询价格（类比：麦肯锡起步 ¥50万）
- ✅ 一次性收费确保双方高度承诺
- ✅ 用户的 ¥30K+ 收入支撑得起这个价格

**原子验证**：
```bash
# Tier 3 定价配置
jq '.tier3.one_time_price' pricing.json == 50000

# Tier 3 用户必须从 Tier 2 转化（不允许直接进）
psql -c "SELECT COUNT(*) FROM tier3_users WHERE tier2_completed_at IS NULL" == 0

# Tier 3 顾问资源池
ls consultants/tier-3/*.json | wc -l >= 5

# Tier 3 行业资源库
ls resources/tier-3-industry/*.json | wc -l >= 20

# Tier 3 用户 12 个月后突破 ¥100K 比例（≥ 30%）
psql -c "SELECT COUNT(*) * 100.0 / (SELECT COUNT(*) FROM tier3_users WHERE tier3_started_at < NOW() - INTERVAL '12 months') FROM tier3_users WHERE current_monthly_revenue >= 100000"
```

---

### 5.5 Stage 4 · 独立商业化框架

**关键**：Stage 4 **与 Tier 1-3 完全解耦**，不绑定到任何具体阶段。

**Stage 4 只做通用商业化基础设施**：

```
14 天免费试用（试用管理）
   ↓ (试用期结束前 3 天提醒)
正式订阅/付费
   ↓ (订阅期内)
续费提醒（到期前 7/1/0 天）
   ↓ (续费 OR 流失)
推荐奖励（推荐人 15%）
```

**Stage 4 的关键不变量**：
- ✅ 不与 Tier 1/2/3 的具体功能耦合
- ✅ 不与 Stage 1/2/3 的具体业务耦合
- ✅ 14 天试用对所有付费项生效
- ✅ 推荐奖励通用

**原子验证**：
```bash
# 14 天试用管理
jq '.trial.duration_days' src/monetize/trial.json == 14

# 试用结束前 3 天提醒
jq '.trial.reminder_days_before' src/monetize/trial.json == 3

# 续费提醒（到期前 7/1/0 天）
jq '.renewal.reminder_days' src/monetize/renewal.json == [7,1,0]

# 推荐奖励 15%
jq '.referral.commission_pct' src/monetize/referral.json == 15
```

---

### 5.6 3 Tier + Stage 4 的完整定价矩阵

| 用户阶段 | Tier | 月费 | 一次性 | 分成 | 备注 |
|:---|:---|:---|:---|:---|:---|
| ¥0 → ¥5K（建立 MVP）| Tier 1 | ¥999/月 | — | — | 默认入口 |
| ¥5K → ¥30K（放大产品）| Tier 1+2 | ¥1,998/月 | — | — | 可同时订阅 |
| ¥30K → ¥100K（突破天花板）| Tier 1+2+3 | ¥1,998/月 | ¥50,000/次 | — | 12 个月陪跑 |

---

### 5.7 早鸟窗口

| 期数 | 折扣 |
|:---|:---|
| **M1（前 100 用户）** | 锁价 ¥699/月（Tier 1/2）|
| **M2-M6** | 标准价 ¥999/月 |
| **首年结束** | 自动转标准价 |

---

## 6. 跨阶段 Eval 矩阵

> ai-pm 方法论：Eval is the spine. 每个阶段必须有可机械化的 eval。

### 6.1 用户旅程 Eval

| 阶段 | 关键事件 | 验证命令 |
|:---|:---|:---|
| 进入 | 用户注册 | `psql -c "SELECT COUNT(*) FROM users WHERE created_at > NOW() - INTERVAL '7 days'"` |
| 阶段 1 完成 | 蓝图生成 | `psql -c "SELECT COUNT(*) FROM users WHERE blueprint_id IS NOT NULL"` |
| 阶段 2 完成 | MVP 上线 + 指标达 baseline | `psql -c "SELECT COUNT(*) FROM brand_buildings WHERE validated_at IS NOT NULL"` |
| 阶段 3 活跃 | 用户每周查看监控 | `psql -c "SELECT COUNT(DISTINCT user_id) FROM report_views WHERE viewed_at > NOW() - INTERVAL '7 days'"` |
| 阶段 4 付费 | 试用转付费 | `psql -c "SELECT COUNT(*) FROM paid_users"` |

### 6.2 业务 Eval（北极星）

| 指标 | 目标（M6） | 验证命令 |
|:---|:---|:---|
| **MAU** | ≥ 1000 | `psql -c "SELECT COUNT(DISTINCT user_id) FROM active_sessions WHERE created_at > NOW() - INTERVAL '30 days'"` |
| **试用→付费转化** | ≥ 10% | 见 4.1 |
| **续费率** | ≥ 70% | 见 4.1 |
| **LTV/CAC** | ≥ 3.0 | 见 4.1 |
| **推荐率** | ≥ 20% | 见 4.1 |

---

## 7. 风险与对冲（v4.2 深度版：基于 Reddit/GitHub/Stripe 实战）

> **v4.2 新增**：基于真实案例（Reddit r/SaaS、GitHub production-readiness、Stripe 文档、Postgres RLS 实战）识别的风险。包含失败模式 + 回滚方案 + 验证命令。

| # | 风险 | 等级 | 来源案例 | 失败模式 | 对冲 + 回滚 | 验证命令 |
|:--|:---|:---|:---|:---|:---|:---|
| **R1** | **🔴 CRITICAL: Stripe webhook race condition** | 致命 | GEMBA/Snowinch 实战 | 并发 SELECT-then-INSERT 导致双重扣费 | 用 `INSERT ... ON CONFLICT DO NOTHING` 不用 SELECT-then-INSERT | `grep "ON CONFLICT" src/api/webhooks/stripe.ts` ≥ 1 |
| **R2** | **🔴 CRITICAL: Stripe 签名验证失败** | 致命 | Stripe docs + Reddit | 用 JSON parser 后签名验证必失败，攻击者伪造 | express.raw body + constructEvent | `grep "express.raw" src/api/webhooks/stripe.ts` ≥ 1 |
| **R3** | **🔴 CRITICAL: 多租户数据泄漏** | 致命 | ClickHouse/AWS RLS | 漏 tenant_id WHERE → 跨租户读 | FORCE RLS + 复合索引 + 中间件 SET LOCAL | `psql -c "SET app.tenant_id='T1'; INSERT ...; SET app.tenant_id='T2'; SELECT * FROM ..."` 0 行 |
| **R4** | **🔴 CRITICAL: 微信支付月度订阅失败** | 致命 | Dodo Payments 实战 | 微信支付无原生 recurring | 仅年度方案 + 手动续费提醒 | `grep "yearly\|annual" src/wechat/products.ts` ≥ 1 |
| **R5** | **🔴 CRITICAL: 数据库备份恢复失败** | 高 | Gorrion checklist | 备份配置但从未测试 | 每周自动恢复测试 + 加密 | `createdb test_restore && pg_restore -d test_restore backup.dump && psql -d test_restore -c "SELECT COUNT(*) FROM users"` > 0 |
| **R6** | **🔴 CRITICAL: Tier 3 入学门槛被绕过** | 高 | 商业策略 | API 直接进绕过 Tier 2 | 数据库 CHECK 约束 + 服务端校验 + 双重保险 | `psql -c "INSERT INTO tier_subscriptions(user_id,tier) VALUES('x','tier3')" \| grep "violates"` 必须 > 0 |
| **R7** | **🔴 高: 第一付费客户被 bug 烧走** | 高 | DEV.to 实战 | 第一次付费用户卡住 2.5h → 流失 | 错误跟踪 + retry 所有 I/O + 主动监控 | `crontab -l \| grep "first_user_monitor"` |
| **R8** | 🟡 高: 试用转化低于 OpenView 中位数 14.7% | 高 | OpenView 2025 PLG Benchmark | 用户 72h 内未达 first value | 行为触发器 + 14 天试用 + 早鸟 | `psql -c "SELECT COUNT(*) FILTER (WHERE first_trial_at IS NOT NULL) * 100.0 / COUNT(*) FROM users WHERE created_at > NOW() - INTERVAL '30 days'"` |
| **R9** | 🟡 中: Stripe 订阅状态漂移 | 中 | Reddit r/SaaS 实战 | webhook 处理失败 → 数据库 vs Stripe 不一致 | 每 24h 对账 job + 自动告警 | `crontab -l \| grep "stripe-reconcile"` |
| **R10** | 🟡 中: 失败支付不重试 → 用户失去访问 | 中 | Stripe dunning | 用户信用卡过期未更新 | dunning email + 3 天 grace period | `grep "grace_period.*3.days" src/monetize/renewal.ts` ≥ 1 |
| **R11** | 🟡 中: design partner 不回复反馈 | 中 | Reddit r/SaaS 实战 | 邮件反馈被忽略 | 1:1 视频通话而非邮件 + 主动联系 | `psql -c "SELECT COUNT(*) FROM design_partner_video_calls"` ≥ 3 |
| **R12** | 🟢 低: Tier 1/2 用户主动流失 | 低 | Pieter Levels 哲学 | 用户跑通后离开 | 早鸟锁价 + 推荐佣金 + 续费提醒 | `psql -c "SELECT COUNT(*) * 100.0 / (SELECT COUNT(*) FROM tier_subscriptions WHERE created_at < NOW() - INTERVAL '30 days') FROM tier_subscriptions WHERE canceled_at IS NOT NULL"` ≤ 30% |

### 7.1 风险熔断机制

**3 层熔断**（与 M1-SOP v4.2 对齐）：

```bash
# Layer 1：全局熔断
touch ~/.claude/STOP

# Layer 2：服务熔断（任一 CRITICAL 风险触发）
psql -c "UPDATE tier_subscriptions SET status='paused' WHERE status='active'"
curl -X POST "$FEISHU_WEBHOOK" -d '{"msg":"🚨 风险 R1-R6 触发，请立即响应"}'

# Layer 3：自动回滚（如 webhook 重复事件触发 A9）
psql -c "SELECT COUNT(*) - COUNT(DISTINCT event_id) FROM stripe_events WHERE created_at > NOW() - INTERVAL '1 hour'" 
# 若 > 0：立即停止 webhook 处理 + 调查
```

### 7.2 失败恢复路径（每个 CRITICAL 风险的回滚方案）

| 风险 | 失败时立即动作 | 恢复时间目标 |
|:---|:---|:---|
| R1 Stripe race | 关闭 webhook 处理（环境变量 `STRIPE_WEBHOOK_ENABLED=false`）| < 30 min |
| R2 签名失败 | 立即丢弃所有 webhook + 调查签名逻辑 | < 1h |
| R3 数据泄漏 | 停服 + 通知所有用户 + 数据审计 | < 4h |
| R4 微信月度失败 | 强制改为年度方案 | < 1d |
| R5 备份失败 | 人工立即备份 + 启用异地备份 | < 2h |
| R6 Tier 3 绕过 | 立即修复 CHECK 约束 + 审计历史数据 | < 1h |

---

## 8. 成功标准

### 8.1 阶段 1 完成（M3 末）

- ✅ 50+ 用户完成 Discovery 蓝图
- ✅ 蓝图用户满意度 ≥ 4.0/5.0
- ✅ 60%+ 用户进入阶段 2

### 8.2 阶段 2 完成（M6 末）

- ✅ 30+ 用户 MVP 上线
- ✅ 7 天指标 50% 达 baseline
- ✅ 30%+ 用户进入阶段 3

### 8.3 阶段 3 完成（M9 末）

- ✅ 20+ 用户品牌监控中
- ✅ 数据 push + pull 周活 ≥ 50%
- ✅ 20%+ 用户进入阶段 4

### 8.4 阶段 4 完成（M12 末）

- ✅ 10+ 付费用户
- ✅ LTV ≥ ¥500/月
- ✅ 续费率 ≥ 70%
- ✅ 推荐率 ≥ 20%

---

## 9. OPC 节点百科（不再独立）

**OPC 节点作为品牌知识图谱的一部分**，不再是独立产品。

| 用途 | 角色 |
|:---|:---|
| Discovery 阶段 1 | "展示用"案例库 |
| Brand Building 阶段 2 | 内容素材库 |
| Monitor 阶段 3 | 行业基准参考 |
| 知识图谱 | 跨用户的可重用资产 |

OPC 节点**作为 opcone 项目的内部资产存在**，不直接面向用户。

---

## 10. 变更记录

| 日期 | 版本 | 变更 |
|:---|:---|:---|
| 2026-06-03 | v1.0 | 首次创建（21 用户故事 + 24 功能）|
| 2026-06-03 | v2.0 | 重大升级（34 用户故事 + 38 功能 + 12 Agent）|
| 2026-06-21 | v3.0 | 错位：32 Skill 框架 + 9 赛道 + 三轨定价（已被昴君纠正）|
| 2026-06-21 | v4.0 | 纠正：4 阶段流水线 + 主辅双线 + 试用转化 + lead with assumption + 每个任务/验证原子级 |
| 2026-06-21 | v4.1 | 3 Tier 定价 + Stage 4 解耦 + 12 个技术假设 A1-A12 |
| **2026-06-21** | **v4.2** | **新增 8 个商业假设 B1-B8（GTM/CAC/LTV/续费）+ 配套 `ONE-MCN-COMMERCIAL.md`（竞品 + GTM + Unit Economics + 团队）+ 修复内部定价冲突（推荐 20%→15%，漏斗 ¥199→¥699 早鸟）** |
| **2026-06-22** | **v5.0** | **OPC 节点百科全部删除（本地 + VPS）+ ONE-MCN 定位 = vibcoding roadmap + 0 员工 + 100% Loop Engineering 推进 + 5 文档作为活 roadmap 持续维护** |

---

*本 PRD v4.2 由蕾姆基于 ai-pm 方法论 + 昴君 4 轮深度问答 + 公开资料整理生成。*
*12 个技术假设 + 8 个商业假设 + 12 个 CRITICAL 风险，每个都有 falsifiable 标准 + 监控命令 + 回滚方案。*
