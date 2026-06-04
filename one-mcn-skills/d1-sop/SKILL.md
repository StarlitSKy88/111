---
name: d1-sop
description: "ONE-MCN D1 SOP 引擎 - 协调 A1-A7 + B1-B3 + G0 的执行顺序，cron 失败时飞书告警兜底"
version: 1.0.0
author: 蕾姆 (Rem) for ONE-MCN
license: MIT
dependencies: [hermes-monitor]
platforms: [linux, macos]
metadata:
  hermes:
    tags: [one-mcn, sop, engine, orchestrator, watchdog]
    related_skills: [a1-scan, a2-decompose, a3-reverse, a4-script, a5-redline, a6-cover, a7-tts, b1-publish, b2-data, b3-report, g0-guard]
    cron_compatible: true
    deliver_targets: [local, feishu, hermespet-pin, telegram]
    priority: critical
---

# D1 SOP 引擎 Skill

协调 A 链 / B 链 / G0 的执行顺序，**cron 失败立即飞书告警**。

## 1. 角色定义

你是 ONE-MCN 的 **D1 SOP 调度员**。**单职责**：盯紧其他 Skill 的 cron 任务。

**核心理念**：**沉默的失败 = 系统性灾难**。每个 cron 任务失败都必须**立即告警**。

## 2. 监控的 12 个 Cron

| Cron | 名称 | 期望 | 失败动作 |
|:---|:---|:---|:---|
| `0 6 * * *` | B3 每日日报 | 日报产出 | 飞书 + HPet |
| `0 8 * * *` | A2 爆款拆解 | 拆解库 | 飞书 + HPet |
| `0 9 * * *` | A3 反向需求 | 反向库 | 飞书 + HPet |
| `0 10 * * *` | A4 脚本生成 | 脚本库 | 飞书 + HPet |
| `30 10 * * *` | A5 红线审查 | 通过/拒绝 | 飞书 + HPet + Telegram |
| `0 11 * * *` | A6 配图封面 | 封面库 | 飞书 + HPet |
| `30 11 * * *` | A7 TTS 配音 | 音频库 | 飞书 + HPet |
| `30 14 * * *` | B1 智能发布 | 发布日志 | 飞书 + HPet + Telegram |
| `0 16,18,20,22 * * *` | B2 数据采集 | 4 次/日 | 飞书 + HPet |
| `0 6 * * 0` | B3 周报 | 5 页周报 | 飞书 + HPet |
| `30 23 * * *` | G0 早期熔断 | 触发/未触发 | 飞书 + HPet + 短信(Day 5+)+Telegram(Day 7) |
| `*/5 * * * *` | D1 SOP 自检 | 心跳 | 飞书 + HPet |

## 3. 执行步骤

### Step 1：心跳检查（每 5 分钟）

```bash
hermes cron list | head -30
```

### Step 2：失败检测

```python
failed = []
for cron in expected_crons:
  last_run = get_last_run(cron)
  if last_run.status == "failed":
    failed.append(cron)
  if (now - last_run.time) > cron.expected_interval * 2:
    failed.append(cron)  # 迟到的也算失败
```

### Step 3：告警

```bash
if [ ${#failed[@]} -gt 0 ]; then
  hermes feishu notify --chat "ONE-MCN-SOP告警" --priority urgent \
    --text "🚨 D1 SOP 告警: ${failed[@]} 任务异常"
  hermespet pin "🚨 SOP 异常: ${failed[@]}" --duration 30s --color red
fi
```

### Step 4：自恢复尝试

```bash
# 对失败任务重试一次
for cron in "${failed[@]}"; do
  hermes cron retry "$cron"
done
```

## 4. 输出

```json
{
  "心跳时间": "ISO8601",
  "总任务数": 12,
  "失败任务数": 0,
  "失败任务": "list[string]",
  "自恢复结果": "list[object]"
}
```

## 5. 红线

| # | 红线 | 处理 |
|:---:|:---|:---|
| 1 | 3 个及以上 cron 同时失败 | 立即 SMS + Telegram 兜底 |
| 2 | D1 自己心跳失败 | 飞书 + HPet + SMS |
| 3 | 24h 内同一任务失败 ≥ 3 次 | 暂停该任务 + 飞书告警人工 |

## 6. 调度

```bash
hermes cron create "*/5 * * * *" \
  "D1 SOP 自检：12 个 cron 心跳监控。详见 ~/.hermes/skills/one-mcn/d1-sop/SKILL.md" \
  --name "D1 SOP 引擎自检" \
  --skill d1-sop \
  --deliver local,feishu,hermespet
```

## 7. 故障处理

| 故障 | 解决 |
|:---|:---|
| hermes cron list 失败 | 重启 hermes daemon |
| 飞书 webhook 失败 | 重试 3 次 + Telegram 兜底 |
| HPet 不可达 | 飞书 + SMS |

---

**本 Skill 由蕾姆为 ONE-MCN 设计 · 2026-06-04**

**💙 蕾姆的话**：D1 是"系统之心"，它挂了所有 cron 都成沉默失败。**每 5 分钟一次心跳**是蕾姆对昴君的承诺。
