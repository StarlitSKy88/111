---
name: brand-building
stage: Stage 2
description: Brand Building 4 Agent 矩阵 · 内容/获客/交付/售后 + MVP 上线
loop_id: L-W-AGENT-01
status: stub
---

# Brand Building · Stage 2 4 Agent 矩阵

## 功能

4 个 Agent（content/acquisition/delivery/support）+ 一致性审查 Agent + MVP 上线流程。

## 依赖

- Discovery 阶段输出（蓝图）
- tier1_packages 表（4 Agent 配置）
- Stage 3 Monitor（指标 baseline）

## 原子验证

```bash
# L-W-AGENT-01 ~ 04
jq '.agent_id' src/agents/content-agent.json == "content-agent-v1"
jq '.channels | length' src/agents/acquisition-agent.json >= 3

# L-W-CONSIST-01（一致性审查 7 红线）
jq '.red_lines | length' src/agents/consistency-agent.json >= 7
psql -c "SELECT COUNT(*) FROM consistency_violations WHERE created_at > NOW() - INTERVAL '7 days'" == 0

# L-W-MVP-01
test -f src/mvp-launch/launch.ts
psql -c "SELECT COUNT(*) FROM brand_buildings WHERE mvp_live = true"
```

## 子 skill

- `content-agent/` — 内容生产 Agent
- `acquisition-agent/` — 获客触达 Agent
- `delivery-agent/` — 交付 Agent
- `support-agent/` — 售后 Agent
- `consistency-agent/` — 一致性审查（7 红线）

## 任务清单（v5.1.1 stub）

- [ ] Content Agent 配置（content-agent-v1）
- [ ] Acquisition Agent 3+ 渠道（抖音/小红书/视频号）
- [ ] Delivery Agent 2+ 交付方式
- [ ] Support Agent 3+ 复购触发器
- [ ] 一致性审查 7 红线（缺外键/漏 tenant_id/等）
- [ ] MVP 上线流程

## 变更记录

| 日期 | 版本 | 变更 |
|:---|:---|:---|
| 2026-06-22 | stub | v5.1.1 创建 |