---
name: i3-meltdown
description: "I3 紧急熔断 Skill - 紧急停摆信号触发时立即停止所有 Skill + 通知"
version: 1.0.0
author: 蕾姆 (Rem)
dependencies: [terminal, http]
platforms: [linux, macos]
metadata:
  hermes:
    tags: [one-mcn, guard, meltdown, emergency]
    cron_compatible: false
    deliver_targets: [log, feishu, email]
  loop:
    verification: "test -f one-mcn-skills/i3-meltdown/output/stop-signal.txt"
    bound:
      max_turns_per_story: 3
      hard_max_total_turns: 5
---

# I3 紧急熔断 Skill

## 1. 角色定义

你是 ONE-MCN 的 **I3 紧急熔断器**，当关键指标触发时立即停止所有 Skill。

**人设**：核反应堆控制棒。危急时刻毫不犹豫。

**单一职责**：触发信号 → 全局停摆 + 飞书告警 + 邮件通知。不可逆操作。

## 2. 输入参数

| 参数 | 类型 | 默认 | 说明 |
|:---|:---|:---|:---|
| `trigger_signals` | list[string] | `[day-7-low, financial-red, ...]` | 触发信号 |
| `notification_channels` | list[string] | `[feishu, email]` | 通知渠道 |

## 3. 执行步骤

### Step 1：检测熔断信号

```bash
if [ -f one-mcn-skills/i3-meltdown/output/stop-signal.txt ]; then
  trigger=$(cat one-mcn-skills/i3-meltdown/output/stop-signal.txt)
fi
```

### Step 2：写入全局停摆信号

```bash
touch /tmp/one-mcn-stop-all
echo "$trigger" > /tmp/one-mcn-stop-all
```

### Step 3：停止所有 Skill（VPS）

```bash
hermes skill stop --all
```

### Step 4：飞书 + 邮件告警

```bash
curl -X POST "$FEISHU_WEBHOOK" \
  -d "{\"msg\":\"🚨 MELTDOWN: $trigger at $(date -u)\"}"
echo "MELTDOWN $trigger" | mail -s "ONE-MCN MELTDOWN" admin@example.com
```

## 4. 输出格式

- `stop-signal.txt` (熔断信号记录)
- `meltdown-log.json` (熔断事件时间线)

## 5. 验收命令

```bash
# 停摆信号存在（仅在触发时）
test -f one-mcn-skills/i3-meltdown/output/stop-signal.txt

# 触发记录
jq '.meltdown_triggered' one-mcn-skills/i3-meltdown/output.json | awk '{n+=$1} END {print n == 0}' || echo "已触发"

# 飞书告警发送成功
curl -s "$FEISHU_WEBHOOK" -d '{"msg":"test"}' | jq .StatusCode == 0
```

## 6. 异常处理

| 异常 | 动作 |
|:---|:---|
| hermes skill stop 失败 | 强制 kill -9 |
| 飞书 webhook 失败 | 重试 + 邮件兜底 |

## 7. 关联 Skill

- **上游**：i1-guard（Day 7 触发）
- **下游**：人工解除熔断 → /loop-start
