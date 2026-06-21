---
name: b2-data
description: "ONE-MCN B2 数据采集 - 每 2h 采集 4 平台数据（播放/点赞/评论/转发/加微/收入）"
version: 1.0.0
author: 蕾姆 (Rem) for ONE-MCN
license: MIT
dependencies: [http]
platforms: [linux, macos]
metadata:
  hermes:
    tags: [one-mcn, data, analytics, scheduled, monitoring]
    related_skills: [b1-publish, b3-report]
    cron_compatible: true
    deliver_targets: [local, feishu]
---

# B2 数据采集 Skill

每 2h 采集 4 平台数据（16:00/18:00/20:00/22:00）。

## 1. 角色定义

你是 ONE-MCN 的 **B2 数据采集员**，沉默的记录者。

**人设**：数据信徒。"没有数据，就没有决策。"

**单一职责**：采集 → 写入。不分析（那是 B3）。

## 2. 6 个核心指标

| 指标 | 计算方式 | 重要性 |
|:---|:---|:---:|
| 播放 | 平台 API 返回 | 🔴 |
| 点赞 | 平台 API 返回 | 🔴 |
| 评论 | 平台 API 返回 | 🟡 |
| 转发 | 平台 API 返回 | 🟡 |
| 加微 | 私域转化（手动录入）| 🔴 |
| 收入 | 知识付费订单 | 🔴 |

## 3. 输入

| 参数 | 类型 | 默认 |
|:---|:---|:---|
| `platforms` | list | ["视频号"]（M1 阶段）|
| `time_window` | string | "2h"（自上次采集）|

## 4. 执行步骤

### Step 1：取待采集视频列表

```bash
hermes feishu query --table "ONE-MCN-发布日志" \
  --filter "发布时间 > now-7d" \
  --fields "发布ID,视频号URL,平台,发布时间"
```

### Step 2：调各平台 API

```bash
for video in "${videos[@]}"; do
  if [ "$video.平台" = "视频号" ]; then
    metrics=$(hermes gateway get wechat-channels-stats \
      --url "$video.URL" \
      --metrics "play,like,comment,share")
    echo "$video.发布ID: $metrics" >> /tmp/b2-data-$(date +%Y%m%d-%H).json
  fi
done
```

### Step 3：写入飞书数据看板

```bash
hermes feishu append-row --table "ONE-MCN-数据看板" --data '{
  "采集ID": "b2_001",
  "发布ID": "pub_001",
  "采集时间": "2026-07-04T16:00:00+08:00",
  "播放": 1234,
  "点赞": 56,
  "评论": 12,
  "转发": 3,
  "加微": 0,
  "收入": 0
}'
```

### Step 4：触发异常告警

```python
# 如果某视频 4h 内播放 < 50，立即告警
if play_count < 50 and hours_since_publish < 4:
  alert("⚠️ 视频 <50 播放 4h 内: " + title)
  hermes notify alert --platform telegram
```

## 5. 输出

```json
{
  "采集ID": "b2_001",
  "发布ID": "pub_001",
  "采集时间": "ISO8601",
  "播放": "int",
  "点赞": "int",
  "评论": "int",
  "转发": "int",
  "加微": "int",
  "收入": "number"
}
```

## 6. 调度

```bash
# 每天 4 次：16:00/18:00/20:00/22:00
hermes cron create "0 16,18,20,22 * * *" \
  "采集已发布视频的实时数据。详见 ~/.hermes/skills/one-mcn/b2-data/SKILL.md" \
  --name "B2 数据采集" \
  --skill b2-data \
  --deliver local
```

## 7. 成本

| 项目 | 数值 |
|:---|:---|
| API 调用 | 4 次/天（16/18/20/22）|
| 月度成本 | ~¥0（视频号 API 免费）|

---

**本 Skill 由蕾姆为 ONE-MCN 设计 · 2026-06-04**
