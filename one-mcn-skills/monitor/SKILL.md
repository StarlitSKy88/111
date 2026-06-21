---
name: monitor
stage: Stage 3
description: Monitor 5 维数据采集 + push/pull + 周报告 + 优化建议
loop_id: L-W-MONITOR-01
status: stub
---

# Monitor · Stage 3 5 维数据采集

## 功能

5 维数据采集器（流量/转化/收入/品牌/留存）+ 实时仪表盘 + 异常预警 + 周报告 + 优化建议。

## 依赖

- Stage 2 MVP 上线（采集触发）
- monitor_metrics 表（时间序列）
- 飞书 webhook（push 通道）

## 原子验证

```bash
# L-W-MONITOR-01（5 维采集）
ls src/monitor/collectors/*.ts | wc -l == 5

# L-W-MONITOR-02（异常预警 10+ 规则）
jq '.rules | length' src/monitor/alerts/rules.json >= 10

# L-W-MONITOR-03（周报告）
test -f src/monitor/reports/weekly.ts

# L-W-MONITOR-04（优化建议 5+ 类型）
jq '.suggestion_types | length' src/monitor/optimizer/suggestions.json >= 5
```

## 子 skill

- `traffic-collect/` — 流量采集（4 平台 API）
- `conversion-collect/` — 转化采集（落地页 → 注册 → 付费）
- `revenue-collect/` — 收入采集（Stripe webhook）
- `brand-collect/` — 品牌数据采集（社交 mention）
- `retention-collect/` — 留存采集（用户行为）
- `dashboard/` — 实时仪表盘
- `alert-engine/` — 异常预警规则

## 任务清单（v5.1.1 stub）

- [ ] 5 个采集器实现
- [ ] 10+ 预警规则
- [ ] 周报告生成（每周一 09:00）
- [ ] 优化建议生成（5+ 类型）
- [ ] 飞书 webhook push

## 变更记录

| 日期 | 版本 | 变更 |
|:---|:---|:---|
| 2026-06-22 | stub | v5.1.1 创建 |