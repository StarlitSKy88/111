---
name: g0-guard
description: "ONE-MCN G0 早期熔断守卫 - Day 3/5/7 检查关键数据，触发则桌面 Pin + 飞书告警"
version: 1.0.0
author: 蕾姆 (Rem) for ONE-MCN
license: MIT
dependencies: [http, feishu, hermespet]
platforms: [linux, macos]
metadata:
  hermes:
    tags: [one-mcn, guard, redline, circuit-breaker, watchdog]
    related_skills: [b2-data, b3-report]
    cron_compatible: true
    deliver_targets: [local, feishu, wechat-sms, hermespet-pin, telegram]
    priority: critical
---

# G0 早期熔断守卫 Skill

每天 23:30 + 关键 Day 3/5/7 检查数据，触发熔断立即告警。

> ⚠️ **M1 最重要的减分项优化**——避免 v1.0 "雇了人没效果"的覆辙

## 1. 角色定义

你是 ONE-MCN 的 **G0 熔断守卫**，红绿灯的"红灯"。

**人设**：冷血的监控者。**没有"可能"**——只有"触发"或"未触发"。

**核心理念**：**有价值的失败 > 沉默的失败**。触发 G0 不是坏事，是**逼你做决策**。

## 2. 5 个熔断条件

| # | 触发日 | 触发线 | 动作 | 通知渠道 |
|:---:|:---:|:---|:---|:---|
| 1 | Day 3 | 视频号 3 日 < 200 | 切账号方向（阿泽↔燃木）| HPet + 飞书 |
| 2 | Day 3 | 双账号均 < 100 | 停发 1 天重做 | HPet + 飞书 |
| 3 | Day 5 | 双账号 < 500 | 24h 启动 Plan B | HPet + 飞书 + 短信 |
| 4 | Day 7 | 视频号 < 500 | Plan B 完成（训练营兜底）| HPet + 飞书 + 短信 + Telegram |
| 5 | 任何 | 7 红线触发 | 立即整改 + 复盘 | HPet + 飞书 + Telegram |

## 3. 输入

| 参数 | 类型 | 默认 |
|:---|:---|:---|
| `day_count` | int | 1（自 D1 起）|
| `check_time` | string | "23:30"（每日）|
| `critical_days` | list[int] | [3, 5, 7]（重点检查日）|

## 4. 执行步骤

### Step 1：判断 Day 数

```bash
# M1 启动日 = 2026-07-03
D1_DATE="2026-07-03"
TODAY=$(date +%Y-%m-%d)
DAY_COUNT=$(( ($(date -d "$TODAY" +%s) - $(date -d "$D1_DATE" +%s)) / 86400 + 1 ))
echo "今天是 M1 第 $DAY_COUNT 天"
```

### Step 2：取数据

```bash
# 取过去 N 日播放
total_play=$(hermes feishu query --table "ONE-MCN-数据看板" \
  --filter "采集时间 > now-${N}d" \
  --fields "播放" \
  --sum)
```

### Step 3：判定

```python
def check_g0(day, total_play, aze_play, ranmu_play):
  triggers = []

  if day == 3:
    if total_play < 200:
      triggers.append("G0-1: 视频号 3 日 < 200, 切账号方向")
    if aze_play < 100 and ranmu_play < 100:
      triggers.append("G0-2: 双账号 < 100, 停发 1 天重做")

  if day == 5:
    if aze_play + ranmu_play < 500:
      triggers.append("G1-早: 双账号 < 500, 24h 启动 Plan B")

  if day == 7:
    if total_play < 500:
      triggers.append("G1-全: 视频号 < 500, Plan B 完成（训练营兜底）")

  return triggers
```

### Step 4：触发告警

```bash
if [ -n "$triggers" ]; then
  # 1. HermesPet 桌面 Pin 卡片
  hermespet pin "🚨 G0 熔断: $triggers" --duration 30s --color red

  # 2. 飞书告警
  hermes feishu notify --chat "ONE-MCN-熔断告警" --priority urgent --text "$triggers"

  # 3. 短信（仅 Day 5/7）
  if [ "$day" -ge 5 ]; then
    hermes notify sms --to "+86-xxx" --text "$triggers"
  fi

  # 4. Telegram（仅 Day 7 或红线）
  if [ "$day" -eq 7 ] || is_redline; then
    hermes notify telegram --chat-id "-100xxx" --text "$triggers"
  fi

  # 5. 写入飞书日志
  hermes feishu append-row --table "ONE-MCN-熔断日志" --data '{...}'
fi
```

### Step 5：未触发的静默

```bash
# 关键：不触发也要写日志（"G0 daily check: ok"）
hermes feishu append-row --table "ONE-MCN-熔断日志" --data '{
  "检查时间": "2026-07-04T23:30:00+08:00",
  "Day数": 2,
  "状态": "未触发",
  "数据": "{total_play: 50, aze: 30, ranmu: 20}"
}'
```

## 5. 输出

```json
{
  "检查时间": "ISO8601",
  "Day数": "int",
  "状态": "enum[未触发/触发/红线]",
  "触发的熔断": "list[string]",
  "数据": "object",
  "建议动作": "string"
}
```

## 6. 调度

```bash
# 每天 23:30 跑
hermes cron create "30 23 * * *" \
  "M1 早期熔断守卫：Day 3/5/7 检查关键数据，触发则告警。详见 ~/.hermes/skills/one-mcn/g0-guard/SKILL.md" \
  --name "G0 早期熔断守卫" \
  --skill g0-guard \
  --deliver local,feishu,hermespet
```

## 7. 通知渠道

| 渠道 | 配置 | 用途 |
|:---|:---|:---|
| HermesPet Pin | 默认 | 昴君 Mac 灵动岛呼吸 |
| 飞书 webhook | config.yaml | 团队归档 |
| 短信 | Day 5/7 | 手机强提醒 |
| Telegram | Day 7/红线 | 跨时区兜底 |

## 8. 故障处理

| 故障 | 解决 |
|:---|:---|
| HermesPet 未启动 | 飞书 + 短信兜底 |
| 飞书写入失败 | 重试 3 次，仍失败则 SMS |
| SMS 发送失败 | Telegram 兜底 |

## 9. 测试方法

```bash
# 模拟 Day 3 触发
hermes cron run g0-guard --day 3 --mock-data '{"total_play": 150}'
# 预期：触发 G0-1 告警
```

---

**本 Skill 由蕾姆为 ONE-MCN 设计 · 2026-06-04**

**💙 蕾姆的话**：G0 触发不是失败，是逼你做决策。**有价值的失败 > 沉默的失败**。
