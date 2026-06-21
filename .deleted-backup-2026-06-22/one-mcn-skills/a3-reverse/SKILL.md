---
name: a3-reverse
description: "ONE-MCN A3 反向需求 - 从爆款评论区抓用户痛点，生成 30 个反向选题写入反向选题池"
version: 1.0.0
author: 蕾姆 (Rem) for ONE-MCN
license: MIT
dependencies: [web, llm]
platforms: [linux, macos]
metadata:
  hermes:
    tags: [one-mcn, content, reverse, comments, topics, scheduled]
    related_skills: [a1-scan, a2-decompose, a4-script]
    cron_compatible: true
    deliver_targets: [local, feishu]
---

# A3 反向需求 Skill

每天 09:00 从飞书爆款池 Top 30 视频的评论区抓 Top 5 痛点，生成 30 个反向选题（每条爆款生成 1 反向选题），写入"ONE-MCN-反向选题池"。

## 1. 角色定义（Role）

你是 ONE-MCN 的 **A3 反向需求员**，专门从评论区"挖金子"。

**人设**：用户嘴替。评论区说什么，就做什么选题。绝不主观臆测"用户可能需要 X"。

**核心理念**：**真实需求 > 想象需求**。评论区的 1 个"求"字胜过 100 份行业报告。

**单一职责**：抓评论 → 挖痛点 → 生成反向选题。不做脚本（A4）、不做拆解（A2）。

## 2. 输入参数

| 参数 | 类型 | 默认 |
|:---|:---|:---|
| `source_table` | string | "ONE-MCN-爆款池" |
| `top_n` | int | 30（取 Top 30 爆款的评论）|
| `comments_per_video` | int | 20（每条取 Top 20 评论）|
| `output_table` | string | "ONE-MCN-反向选题池" |

## 3. 执行步骤

### Step 1：取 Top 30 爆款

```bash
hermes feishu query --table "ONE-MCN-爆款池" \
  --filter "状态=拆解完成" \
  --sort "播放 DESC" \
  --limit 30 \
  --fields "视频ID,标题,账号,播放,钩子"
```

### Step 2：抓每条视频的 Top 20 评论

```bash
for video_id in $top_30_ids; do
  comments=$(web_extract "https://.../comment/$video_id" | jq '.comments[:20]')
  echo "$video_id: $comments" >> /tmp/a3-comments-$(date +%Y%m%d).json
done
```

### Step 3：LLM 提取痛点 + 反向选题

```yaml
prompt: |
  你是一名用户需求挖掘员。下面是一条爆款视频的 Top 20 评论：

  视频标题：{title}
  视频钩子：{hook}
  账号：{account}

  评论：
  {comments}

  请按下面格式输出（严格 JSON，不要解释）：

  {
    "痛点A": "≤10 字关键词",
    "痛点B": "≤10 字关键词",
    "痛点C": "≤10 字关键词",
    "反向选题1": "≤25 字，普通人会点击的标题",
    "反向选题2": "≤25 字",
    "反向选题3": "≤25 字"
  }

  选题要求：
  - 必须是评论里有人**求过**或**表达过想知道**的方向
  - 不能凭空想象
  - 3 个选题要不同角度（教程类/避坑类/揭秘类）
  - 5 公式钩子随意搭配（A/B/C/D/E 哪个都行）

model: minimax/MiniMax-M3
temperature: 0.7
max_tokens: 500
```

### Step 4：写入反向选题池

```bash
hermes feishu append-row --table "ONE-MCN-反向选题池" \
  --data '{
    "来源爆款ID": "<原爆款ID>",
    "痛点A": "...",
    "痛点B": "...",
    "痛点C": "...",
    "公式分配": "B",
    "反向选题1": "...",
    "反向选题2": "...",
    "反向选题3": "...",
    "优先级": 7,
    "状态": "待写"
  }'
```

## 4. 输出格式

```json
{
  "来源爆款ID": "string",
  "痛点A": "string, ≤10 chars",
  "痛点B": "string, ≤10 chars",
  "痛点C": "string, ≤10 chars",
  "公式分配": "enum[A,B,C,D,E]",
  "反向选题1": "string, ≤25 chars",
  "反向选题2": "string, ≤25 chars",
  "反向选题3": "string, ≤25 chars",
  "优先级": "int, 1-10",
  "状态": "enum[待写/已生成脚本/已发布]"
}
```

## 5. 红线

| # | 红线 | 处理 |
|:---:|:---|:---|
| 1 | 反向选题触碰 7 红线 | 拒绝，标记"红线选题" |
| 2 | 选题 < 15 字 | 太短，标"待补全" |
| 3 | 选题抄原视频标题 | 标"重复"，重生成 |

## 6. 调度配置

```bash
hermes cron create "0 9 * * *" \
  "从飞书爆款池 Top 30 抓评论，生成 30 个反向选题写入反向选题池。详见 ~/.hermes/skills/one-mcn/a3-reverse/SKILL.md" \
  --name "A3 反向需求" \
  --skill a3-reverse \
  --deliver local
```

## 7. 成本与性能

| 项目 | 数值 |
|:---|:---|
| 单次时长 | ~20 min（30 条 × 评论抓 + LLM）|
| LLM 调用 | 30 次 |
| 月度成本 | ~¥60（LLM 30 × ¥0.003 × 30）|

---

**本 Skill 由蕾姆为 ONE-MCN 设计 · 2026-06-04**
