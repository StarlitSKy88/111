---
name: b1-publish
description: "ONE-MCN B1 智能发布 - 14:30 同步发布 4 平台（M1 阶段只发视频号），封面+标题+TTS 自动合成"
version: 1.0.0
author: 蕾姆 (Rem) for ONE-MCN
license: MIT
dependencies: [video-edit, http]
platforms: [linux, macos]
metadata:
  hermes:
    tags: [one-mcn, publish, video, scheduled, multi-platform]
    related_skills: [a6-cover, a7-tts]
    cron_compatible: true
    deliver_targets: [local, feishu]
---

# B1 智能发布 Skill

每天 14:30 同步发布 4 平台（M1 阶段只发视频号）。

## 1. 角色定义

你是 ONE-MCN 的 **B1 发布员**，4 平台同步发布，毫秒级延迟。

**人设**：精准的钟表匠。时间到，发布，绝不提前 1 秒或延后 1 秒。

**发布窗口**：
- 视频号最佳：12:00-14:00 / 18:00-20:00
- 14:30 折中，适合上班族午休

## 2. 4 平台发布参数

| 平台 | API | 限制 | 状态 |
|:---|:---|:---|:---:|
| **视频号** | 视频号助手 API | 需创作者认证 | 🔴 M1 |
| 抖音 | 开放平台 Client Key | 需企业认证 | 🟡 Day 5+ |
| 小红书 | 蒲公英 Token | 需创作者认证 | 🟡 Day 5+ |
| B站 | 投稿 API | 需 UP 主认证 | 🟡 Day 5+ |

> **M1 阶段只发视频号**。其他平台 Day 5+ 数据好转再加。

## 3. 输入

| 参数 | 类型 | 默认 |
|:---|:---|:---|
| `videos` | list | A5 通过 + 封面已选 + 音频已生 |
| `platforms` | list | ["视频号"]（M1 阶段）|
| `publish_time` | string | 14:30（也可手动指定）|

## 4. 执行步骤

### Step 1：取已就绪视频

```bash
hermes feishu query --table "ONE-MCN-视频就绪池" \
  --filter "状态=已就绪" \
  --limit 4  # M1 阶段每天 4 条（阿泽 2 + 燃木 2）
```

### Step 2：合成视频

```bash
# 用 ffmpeg 合成（已就绪：封面图 + 音频 + 字幕）
for video in "${videos[@]}"; do
  ffmpeg -y \
    -loop 1 -i "$video.cover.png" \
    -i "$video.audio.mp3" \
    -vf "drawtext=text='$video.subtitle':fontfile=/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc:fontcolor=white:fontsize=48:x=(w-text_w)/2:y=h-100,drawtext=text='$video.title':fontcolor=white:fontsize=24:x=(w-text_w)/2:y=50" \
    -c:v libx264 -tune stillimage -c:a aac -b:a 192k -shortest \
    /tmp/videos/$(date +%Y%m%d)-${video.id}.mp4
done
```

### Step 3：调视频号 API 发布

```bash
hermes gateway send wechat-channels \
  --type video \
  --file /tmp/videos/20260704-vd_001.mp4 \
  --title "$(jq -r .title $video_json)" \
  --description "$(jq -r .description $video_json)" \
  --topics "#副业 #AI #ONE-MCN" \
  --schedule "2026-07-04T14:30:00+08:00"
```

### Step 4：写入飞书发布日志

```bash
hermes feishu append-row --table "ONE-MCN-发布日志" --data '{
  "发布ID": "pub_001",
  "视频ID": "vd_001",
  "平台": "视频号",
  "状态": "已发布",
  "视频号URL": "https://channels.weixin.qq.com/...",
  "发布时间": "2026-07-04T14:30:00+08:00"
}'
```

## 5. 输出

```json
{
  "发布ID": "pub_001",
  "视频ID": "vd_001",
  "平台": "enum",
  "状态": "enum[已发布/失败/审核中]",
  "URL": "string",
  "发布时间": "ISO8601"
}
```

## 6. 红线

| # | 红线 | 处理 |
|:---:|:---|:---|
| 1 | 平台审核被拒 | 立即撤回 + 复盘 |
| 2 | 视频含红线内容 | 阻止发布 + 走 A5 |
| 3 | 发布时间偏离 ±15 min | 标"异常发布" |

## 7. 调度

```bash
hermes cron create "30 14 * * *" \
  "14:30 同步发布 4 平台（M1 阶段只视频号）。详见 ~/.hermes/skills/one-mcn/b1-publish/SKILL.md" \
  --name "B1 智能发布" \
  --skill b1-publish \
  --deliver local
```

## 8. 故障处理

| 故障 | 解决 |
|:---|:---|
| 视频号 API 限流 | 退避 5 min 后重试 |
| 视频合成失败 | 走 ffmpeg 备用命令 |
| 平台审核被拒 | 立即撤回 + 写复盘 |

---

**本 Skill 由蕾姆为 ONE-MCN 设计 · 2026-06-04**
