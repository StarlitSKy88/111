---
name: monetize
stage: Stage 4
description: Monetize 商业化 · 14 天试用 + 3 Tier 订阅 + 续费 + 推荐 + 早鸟
loop_id: L-W-MONETIZE-01
status: stub
---

# Monetize · Stage 4 商业化框架

## 功能

14 天试用 + 3 Tier 订阅（¥999/¥999/¥50K）+ 续费提醒 + 推荐奖励（15%）+ 早鸟窗口（¥699/月前 100 用户）。

## 依赖

- Stage 1-3 完成（MVP 上线）
- Stripe / 微信支付 / 支付宝集成
- tier_subscriptions 表

## 原子验证

```bash
# L-W-MONETIZE-01（14 天试用）
jq '.trial_days' src/monetize/trial.js == 14

# L-MONETIZE-S4-01（试用管理 Stage 4 独立层）
jq '.trial.duration_days' src/monetize/trial.json == 14

# L-MONETIZE-S4-02（续费提醒 7/1/0 天）
jq '.reminder_days' src/monetize/renewal.json == [7,1,0]

# L-MONETIZE-S4-03（推荐 15% 佣金）
jq '.commission_pct' src/monetize/referral.json == 15

# L-MONETIZE-S4-04（早鸟 ¥699/月）
psql -c "SELECT quota_total - quota_used FROM early_bird_quota WHERE id=1" | awk '$1 >= 0'
jq '.locked_price_cny' src/monetize/early-bird.json == 699

# L-MONETIZE-S4-05（Stage 4 与 Tier 解耦）
grep -rE "tier[123]" src/monetize/ 2>/dev/null | wc -l == 0
```

## 子 skill

- `trial-manager/` — 14 天试用管理
- `tier1-subscribe/` — Tier 1 ¥999/月订阅
- `tier2-subscribe/` — Tier 2 ¥999/月订阅
- `tier3-enroll/` — Tier 3 ¥50K 入学
- `renewal-reminder/` — 续费提醒
- `referral-engine/` — 推荐奖励（15% 佣金）
- `early-bird/` — 早鸟窗口 ¥699/月

## 任务清单（v5.1.1 stub）

- [ ] 14 天试用管理（trial_start/end/auto_convert）
- [ ] Tier 1/2 月订阅
- [ ] Tier 3 入学（从 Tier 2 转化）
- [ ] 续费提醒 7/1/0 天
- [ ] 推荐佣金 15% 自动发放
- [ ] 早鸟 quota（前 100 用户）
- [ ] Stage 4 与 Tier 完全解耦（CI 验证）

## 变更记录

| 日期 | 版本 | 变更 |
|:---|:---|:---|
| 2026-06-22 | stub | v5.1.1 创建 |