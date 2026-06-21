---
name: discovery
stage: Stage 1
description: Discovery 阶段多轮 AI 对话引擎 · Stage 1 用户从注册到品牌蓝图的入口
loop_id: L-W-DISC-01
status: stub
---

# Discovery · Stage 1 多轮 AI 对话引擎

## 功能

5 状态对话状态机（opening/capability/need/direction/summary）+ 蓝图生成器 + 案例库。

## 依赖

- PostgreSQL 16+（blueprints 表）
- MiniMax-M3 或 DeepSeek V3（对话引擎 LLM）
- Stage 4 试用管理（L-W-MONETIZE-01 集成）

## 原子验证

```bash
# L-W-DISC-01
jq '.states | length' src/discovery/state-machine.json == 5
jq '.max_turns' src/discovery/state-machine.json == 10
test -f src/discovery/analytics/tracker.ts

# L-W-DISC-03（案例库完整性）
ls src/discovery/examples/*.md | wc -l >= 20
```

## 子 skill

- `dialogue-engine/` — 多轮对话状态机
- `blueprint-gen/` — 蓝图生成器
- `capability-extract/` — 能力图谱提取
- `case-library/` — 案例库（来自 OPC content-drafts，PRD §9 落地）

## 任务清单（v5.1.1 stub）

- [ ] 5 状态机实现
- [ ] max_turns = 10 硬限制
- [ ] 上下文窗口管理（避免 prompt > 950K）
- [ ] 能力图谱提取（≥10 维度）
- [ ] 需求图谱提取（10 维度）
- [ ] 蓝图生成器（≥5 章节）
- [ ] 案例库 ≥ 20 个 OPC 节点

## v5.1.1 备注

> **PRD §9 落地**：从 `.deleted-backup-2026-06-22/content-drafts/` 选 20+ 个最简 OPC 节点案例，迁移到 `src/discovery/examples/`。
> L-DISC-03 验证命令 `ls src/discovery/examples/*.md | wc -l >= 20` 必须可跑。

## 变更记录

| 日期 | 版本 | 变更 |
|:---|:---|:---|
| 2026-06-22 | stub | v5.1.1 创建（PRD §9 落地）|