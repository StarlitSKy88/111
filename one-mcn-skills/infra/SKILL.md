---
name: infra
stage: L0
description: L0 基础设施 · DB Schema + Stripe webhook + 微信/支付宝 + 备份
loop_id: L-W-INFRA-01
status: in_progress
---

# Infra · L0 基础设施

## 功能

DB Schema（8 张表 + RLS）+ Stripe webhook 幂等性 + 微信支付 v3 + 支付宝 + 数据库备份 + Cron 调度。

## 当前进度

- ✅ DB Schema 已设计（src/db/schema.sql，11 FOREIGN KEY + RLS FORCE）
- 🔵 Stripe webhook 待实现（M1 Day 2）
- 🔵 微信/支付宝 待实现（M1 Day 3）
- 🔵 备份 + 恢复 待实现（M1 Day 4）

## 原子验证

```bash
# L-W-INFRA-01（DB Schema）
grep -c "FOREIGN KEY" src/db/schema.sql >= 7  # 当前：11 ✓
psql -c "\dt" | grep -E "(users|blueprints|brand_buildings|tier1_packages|monitor_metrics|tier2_executions|tier_subscriptions|stripe_events)" | wc -l == 8
psql -c "SELECT COUNT(*) FROM pg_tables WHERE rowsecurity = true" >= 8

# L-W-INFRA-03（Stripe webhook 幂等性）
psql -c "SELECT (COUNT(*) - COUNT(DISTINCT event_id)) FROM stripe_events" == 0
grep "INSERT INTO stripe_events.*ON CONFLICT" src/api/webhooks/stripe.ts >= 1
grep "Stripe.webhooks.constructEvent" src/api/webhooks/stripe.ts >= 1

# L-W-INFRA-04（数据库备份 24h）
find /backup -name "*.sql" -mtime -1 | wc -l >= 1

# L-W-INFRA-05（微信/支付宝）
grep "WECHAT_PAY_MCH_ID\|WECHAT_PAY_API_KEY" .env >= 2
grep "ALIPAY_APP_ID\|ALIPAY_PRIVATE_KEY" .env >= 2
```

## 子 skill

- `db-schema/` — 8 张表 + RLS 多租户
- `stripe-webhook/` — Stripe webhook 幂等性 + 签名验证
- `wechat-pay/` — 微信支付 v3（年度方案）
- `alipay/` — 支付宝
- `backup-restore/` — 数据库备份 + 恢复
- `cron-scheduler/` — Cron 调度

## 任务清单

- ✅ D0-1 设计 8 张表 schema
- ✅ D0-2 编写 migration 脚本（src/db/schema.sql）
- 🔵 D0-3 staging 验证 migration 可重入
- 🔵 D0-4 编写 V002__rollback.sql
- ✅ D0-5/6/7/8 验证 8 张表 + tenant_id + created_at 索引
- 🔵 D2-5 ~ D2-22 Stripe webhook 完整实现（22 任务）
- 🔵 D3-1 ~ D3-14 微信 + 支付宝 + 多支付路由（14 任务）

## 变更记录

| 日期 | 版本 | 变更 |
|:---|:---|:---|
| 2026-06-22 | v0.1 | v5.1.1 stub 创建（DB Schema 已落地）|