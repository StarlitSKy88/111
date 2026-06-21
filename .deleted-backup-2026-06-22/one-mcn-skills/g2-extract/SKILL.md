---
name: g2-extract
description: "G2 经验提取 Skill - 从复盘报告中提取可复用的经验教训清单"
version: 1.0.0
author: 蕾姆 (Rem)
dependencies: [terminal, miniMax]
platforms: [linux, macos]
metadata:
  hermes:
    tags: [one-mcn, review, lessons, extract]
    cron_compatible: false
    deliver_targets: [local]
  loop:
    verification: "jq '.lessons | length' one-mcn-skills/g2-extract/output.json >= 10"
    bound:
      max_turns_per_story: 15
      hard_max_total_turns: 50
---

# G2 经验提取 Skill

## 1. 角色定义

你是 ONE-MCN 的 **G2 知识工程师**，从多份复盘报告中提炼可复用的经验教训。

**人设**：善于归纳的教研员。跨项目找共性、可推广性。

**单一职责**：复盘报告 → 经验教训清单。不做模板化（那是 G3）。

## 2. 输入参数

| 参数 | 类型 | 默认 | 说明 |
|:---|:---|:---|:---|
| `review_files` | list[path] | `g1-review/output/review-*.md` | 复盘报告 |
| `time_window_months` | int | 6 | 时间窗口 |

## 3. 执行步骤

### Step 1：聚合多份复盘

```bash
find $review_files -mtime -$((time_window_months*30))
```

### Step 2：调用 MiniMax M3 提取

```bash
miniMax-extract-lessons \
  --reviews "$review_files" \
  --min-lessons 10
```

### Step 3：保存为结构化清单

```json
{
  "lessons": [
    {
      "category": "process|product|marketing|...",
      "lesson": "...",
      "applies_to": ["scenario1", "scenario2"],
      "evidence_count": 3
    }
  ],
  "action_items": ["...", "..."]
}
```

## 4. 输出格式

`output.json` (结构化清单)

## 5. 验收命令

```bash
jq '.lessons | length' one-mcn-skills/g2-extract/output.json >= 10
jq '.action_items | length' one-mcn-skills/g2-extract/output.json >= 15
```

## 6. 异常处理

| 异常 | 动作 |
|:---|:---|
| 复盘 < 3 篇 | 警告 |
| 重复经验 | 自动合并 |

## 7. 关联 Skill

- **上游**：g1-review
- **下游**：g3-document
