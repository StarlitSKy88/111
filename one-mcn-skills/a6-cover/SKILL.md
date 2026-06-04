---
name: a6-cover
description: "ONE-MCN A6 配图 - 为 A5 通过的脚本生成 3 张候选封面（视频号 900×900 规范）"
version: 1.0.0
author: 蕾姆 (Rem) for ONE-MCN
license: MIT
dependencies: [image-gen, llm]
platforms: [linux, macos]
metadata:
  hermes:
    tags: [one-mcn, content, cover, image, design, scheduled]
    related_skills: [a4-script, a5-redline, a7-tts]
    cron_compatible: true
    deliver_targets: [local, feishu]
---

# A6 配图 Skill

每天 11:00 为 A5 通过的脚本生成 3 张候选封面。

## 1. 角色定义

你是 ONE-MCN 的 **A6 配图师**，专门做"3 秒抓住眼球"的封面。

**人设**：安静的设计师。不需要花哨，但要"过目不忘"。

## 2. 4 平台封面规范

| 平台 | 尺寸 | 比例 | 字数限制 | 风格 |
|:---|:---|:---:|:---|:---|
| **视频号** | 900×900 | 1:1 | ≤12 字 | 简约、Ma 极简 |
| 抖音 | 1080×1920 | 9:16 | ≤15 字 | 大字、冲击 |
| 小红书 | 1080×1440 | 3:4 | ≤18 字 | 高级、文艺 |
| B站 | 1146×717 | 16:10 | ≤20 字 | 二次元/科技 |

> **M1 阶段**（砍范围）：只生成**视频号 1:1 封面**。

## 3. 输入

| 参数 | 类型 | 默认 |
|:---|:---|:---|
| `scripts` | list | A5 通过的 8-10 脚本 |
| `cover_count` | int | 3（每脚本 3 候选）|
| `platform` | string | 视频号 |

## 4. 执行步骤

### Step 1：选 A5 通过脚本

```bash
hermes feishu query --table "ONE-MCN-脚本库" \
  --filter "状态=已通过" \
  --limit 10
```

### Step 2：每脚本生成 3 张候选封面

```yaml
prompt: |
  你是一名 Ma 极简主义封面设计师。视频号 1:1 (900x900)。

  视频标题：{title}
  3 秒字幕：{3sec_text}
  公式：{formula}
  人设：{persona}

  生成 3 张候选封面的详细描述（不直接生成图，先出文案设计稿）：

  候选 1：黑底白字大字幕
  - 背景：#111110（暗）
  - 主文字："{3sec_text}"
  - 字体：思源宋体
  - 大小：240px
  - 位置：垂直居中
  - 字间距：-0.03em
  - 朱红强调：右下角小三角 80×80

  候选 2：和纸底大字
  - 背景：#F8F5F0（暖白）
  - 主文字："{3sec_text}"
  - 字体：思源黑体
  - 大小：220px
  - 位置：左上
  - 朱红强调：左侧 8px 竖线
  - 角标：右下角 "01" 巨大数字 200vw

  候选 3：极简纯字（无背景）
  - 背景：纯白 #FFFFFF
  - 主文字："{3sec_text}"
  - 字体：思源宋体
  - 大小：300px（最大）
  - 位置：上 1/3
  - 副文字：右下 "{公式} · {人设名}" 16px
  - 朱红强调：标题最后一个字着色 #C0392B

  输出 JSON 格式：
  {
    "候选1": { "bg": "#111110", "text": "...", "font_size": 240, ... },
    "候选2": { ... },
    "候选3": { ... }
  }
model: minimax/MiniMax-M3
temperature: 0.7
max_tokens: 800
```

### Step 3：调用 image-gen（MiniMax Image / DALL-E / Midjourney）

```bash
for design in "${cover_designs[@]}"; do
  hermes image-gen \
    --prompt "$(echo $design | jq -r '.text')" \
    --size 1024x1024 \
    --style minimal \
    --output /tmp/covers/$(date +%Y%m%d)-${script_id}-${variant}.png
done
```

### Step 4：写入飞书封面库

```bash
hermes feishu create-table --name "ONE-MCN-封面库" --schema "..."
hermes feishu append-row --table "ONE-MCN-封面库" --data '{
  "封面ID": "cv_001",
  "脚本ID": "sc_001",
  "候选1路径": "/covers/20260704-sc_001-1.png",
  "候选2路径": "/covers/20260704-sc_001-2.png",
  "候选3路径": "/covers/20260704-sc_001-3.png",
  "状态": "待选",
  "生成时间": "2026-07-04T11:15:00+08:00"
}'
```

## 5. 输出

```json
{
  "封面ID": "cv_001",
  "脚本ID": "sc_001",
  "候选1路径": "string",
  "候选2路径": "string",
  "候选3路径": "string",
  "状态": "enum[待选/已选/已废]"
}
```

## 6. 红线

| # | 红线 | 处理 |
|:---:|:---|:---|
| 1 | 封面含二维码/微信号 | 拒绝 |
| 2 | 封面含违规图片（暴力色情）| 拒绝 |
| 3 | 封面文案触红线 | 走 A5 |
| 4 | 封面风格不像"Ma 极简" | 重新生成 |

## 7. 调度

```bash
hermes cron create "0 11 * * *" \
  "为 A5 通过的脚本生成 3 张 Ma 极简封面。详见 ~/.hermes/skills/one-mcn/a6-cover/SKILL.md" \
  --name "A6 配图" \
  --skill a6-cover \
  --deliver local
```

## 8. 成本

| 项目 | 数值 |
|:---|:---|
| LLM 设计 | 10 次（每脚本 1 次）|
| image-gen | 30 张（10 脚本 × 3 候选）|
| 月度成本 | ~¥150（image-gen 为主）|

---

**本 Skill 由蕾姆为 ONE-MCN 设计 · 2026-06-04**
