---
name: guard
stage: 全局
description: 全局守卫 · Loop runner + Kill switch + Eval runner + Progress tracker
loop_id: L-W-GUARD-01
status: stub
---

# Guard · 全局守卫

## 功能

Loop 执行引擎 + Kill Switch 一键叫停 + Eval 验证器 + 进度跟踪。

## 依赖

- `.claude/loops/active-loop.txt` — 当前 loop
- `.harness/state.json` — 当前状态
- `.harness/tasks/*.json` — 任务定义

## 原子验证

```bash
# L-W-GUARD-01（Kill Switch 存在）
test -f .claude/hooks/kill-switch.sh

# L-W-GUARD-02（Eval runner）
test -f src/guard/eval-runner.ts

# Active loop 状态
test -f .claude/loops/active-loop.txt
cat .claude/loops/active-loop.txt  # 应为 L-W-INFRA-01

# State 状态
jq '.current_loop' .harness/state.json  # 应为 L-W-INFRA-01
jq '.loop_status' .harness/state.json  # 应为 pending / in_progress
```

## 子 skill

- `loop-runner/` — Loop 执行引擎（vibcoding 推进）
- `kill-switch/` — Kill Switch 一键叫停
- `eval-runner/` — Eval 验证器（执行 psql/jq/curl）
- `progress-tracker/` — 进度跟踪 + CHECKPOINT 生成

## 任务清单（v5.1.1 stub）

- [ ] loop-runner.ts（实现 /goal 协议）
- [ ] kill-switch.sh（环境变量 STOP 触发）
- [ ] eval-runner.ts（执行每条 bash/jq/psql 验证）
- [ ] progress-tracker.ts（CHECKPOINT.md 自动生成）

## v5.1 关键决策

- ✅ 每日 backup + session resume 协议（PLAN-v8 §6）
- ✅ CHECKPOINT.md 一键可读
- ✅ 4 层防护（L1 session 中断 / L2 API 限流 / L3 电脑故障 / L4 全部失败）

## 变更记录

| 日期 | 版本 | 变更 |
|:---|:---|:---|
| 2026-06-22 | stub | v5.1.1 创建 |