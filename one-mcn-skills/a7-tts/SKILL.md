---
name: a7-tts
description: "ONE-MCN A7 TTS 配音 - 为脚本生成 30/60 秒语音（阿泽男声 + 燃木女声 + 戏谑）"
version: 1.0.0
author: 蕾姆 (Rem) for ONE-MCN
license: MIT
dependencies: [tts]
platforms: [linux, macos]
metadata:
  hermes:
    tags: [one-mcn, content, tts, audio, voice, scheduled]
    related_skills: [a4-script, a6-cover, b1-publish]
    cron_compatible: true
    deliver_targets: [local, feishu]
---

# A7 TTS 配音 Skill

每天 11:30 为 A5 通过的脚本生成 30/60 秒语音。

## 1. 角色定义

你是 ONE-MCN 的 **A7 配音师**，2 套声线切换自如。

**2 套声线**：

| 人设 | 音色 ID | 语速 | 情感 | 推荐服务 |
|:---|:---|:---:|:---|:---|
| 阿泽黑客 | male_calm | 1.1x | 冷静、自信 | 豆包 / 阿里云 / Azure |
| 燃木 AI 渣爆 | female_sarcastic | 1.2x | 戏谑、自嘲 | 豆包 / 阿里云 |

## 2. 输入

| 参数 | 类型 | 默认 |
|:---|:---|:---|
| `scripts` | list | A5 通过的脚本 |
| `duration` | enum | 30s / 60s |

## 3. 执行步骤

### Step 1：取 A5 通过脚本

```bash
hermes feishu query --table "ONE-MCN-脚本库" \
  --filter "状态=已通过" \
  --limit 10
```

### Step 2：调用豆包 TTS

```bash
# 阿泽：male_calm 音色
for script in "${scripts[@]}"; do
  if [ "$script.persona" = "阿泽黑客" ]; then
    hermes tts generate \
      --text "$script.text" \
      --voice male_calm \
      --speed 1.1 \
      --emotion calm \
      --output /tmp/tts/$(date +%Y%m%d)-${script.id}-aze.mp3
  fi
done

# 燃木：female_sarcastic 音色
for script in "${scripts[@]}"; do
  if [ "$script.persona" = "燃木 AI 渣爆" ]; then
    hermes tts generate \
      --text "$script.text" \
      --voice female_sarcastic \
      --speed 1.2 \
      --emotion sarcastic \
      --output /tmp/tts/$(date +%Y%m%d)-${script.id}-ranmu.mp3
  fi
done
```

### Step 3：写入飞书音频库

```bash
hermes feishu create-table --name "ONE-MCN-音频库" --schema "..."
hermes feishu append-row --table "ONE-MCN-音频库" --data '{
  "音频ID": "au_001",
  "脚本ID": "sc_001",
  "路径": "/tts/20260704-sc_001-aze.mp3",
  "人设": "阿泽黑客",
  "音色": "male_calm",
  "时长秒": 58,
  "生成时间": "2026-07-04T11:30:00+08:00"
}'
```

## 4. 输出

```json
{
  "音频ID": "au_001",
  "脚本ID": "sc_001",
  "路径": "string",
  "人设": "enum[阿泽黑客, 燃木 AI 渣爆]",
  "音色": "string",
  "时长秒": "int",
  "生成时间": "ISO8601"
}
```

## 5. 红线

| # | 红线 | 处理 |
|:---:|:---|:---|
| 1 | TTS 含敏感词 | 走 A5 |
| 2 | 音频时长 > 60 秒或 < 25 秒 | 调整文本质检 |
| 3 | 音色不匹配人设 | 重新生成 |

## 6. 调度

```bash
hermes cron create "30 11 * * *" \
  "为 A5 通过的脚本生成 30/60 秒 TTS 音频。详见 ~/.hermes/skills/one-mcn/a7-tts/SKILL.md" \
  --name "A7 TTS 配音" \
  --skill a7-tts \
  --deliver local
```

## 7. 成本

| 项目 | 数值 |
|:---|:---|
| TTS 调用 | 10 次/天 |
| 单价 | ¥0.0001/字 |
| 月度成本 | ~¥30 |

---

**本 Skill 由蕾姆为 ONE-MCN 设计 · 2026-06-04**
