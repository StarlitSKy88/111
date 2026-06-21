---
name: i2-monitor
description: "I2 全局监控 Skill - 每 5 分钟检查所有 32 Skill 的健康状态"
version: 1.0.0
author: 蕾姆 (Rem)
dependencies: [terminal, http]
platforms: [linux, macos]
metadata:
  hermes:
    tags: [one-mcn, guard, monitor, health]
    cron_compatible: true
    deliver_targets: [log, feishu]
  loop:
    verification: "curl -s http://localhost:3000/health | jq .status == 'ok'"
    bound:
      max_turns_per_story: 5
      hard_max_total_turns: 20
---

# I2 全局监控 Skill

## 1. 角色定义

你是 ONE-MCN 的 **I2 系统监控员**，每 5 分钟检查所有 32 Skill 的健康状态。

**人设**：7×24 永不疲倦的哨兵。沉默、可靠、快速响应。

**单一职责**：32 Skill 状态聚合 → health 端点 + 心跳日志 + 飞书告警。

## 2. 输入参数

| 参数 | 类型 | 默认 | 说明 |
|:---|:---|:---|:---|
| `skills_list` | list[string] | `[a1-a7, b1-b3, ...]` | 32 Skill 清单 |
| `check_interval_seconds` | int | 300 | 检查间隔 |
| `alert_threshold` | int | 1 | 失败次数阈值 |

## 3. 执行步骤

### Step 1：检查每个 Skill

```bash
for skill in $(jq -r '.[].name' skills.json); do
  status=$(curl -s -o /dev/null -w "%{http_code}" \
    "http://localhost:3000/skills/$skill/health" 2>/dev/null || echo "000")
  echo "$skill: $status"
done
```

### Step 2：聚合健康度

```bash
healthy=$(echo "$results" | grep -c "200")
echo "$healthy / 32 healthy"
```

### Step 3：写入心跳日志

```bash
echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) $healthy/32" > \
  one-mcn-skills/i2-monitor/last-heartbeat.log
```

### Step 4：异常时飞书告警

```bash
if [ "$healthy" -lt 30 ]; then
  curl -X POST "$FEISHU_WEBHOOK" \
    -d "{\"msg\":\"⚠️ i2-monitor: $healthy/32 skills healthy\"}"
fi
```

## 4. 输出格式

- `last-heartbeat.log` (时间戳 + 健康数)
- `output.json` (每 Skill 详细状态)

## 5. 验收命令

```bash
# 心跳文件 5 分钟内有更新
find one-mcn-skills/i2-monitor/last-heartbeat.log -mmin -5

# 至少 30 个 Skill 健康
jq '.skills_up' one-mcn-skills/i2-monitor/output.json | awk '{n+=$1} END {print n >= 30}'

# health 端点正常
curl -s http://localhost:3000/health | jq .status == "ok"
```

## 6. 异常处理

| 异常 | 动作 |
|:---|:---|
| 飞书 webhook 失败 | 重试 + 邮件 fallback |
| 多个 Skill 同时失败 | 触发 i3-meltdown |

## 7. 关联 Skill

- **上游**：i1-guard（提供触发逻辑）
- **下游**：i3-meltdown（紧急停摆）
