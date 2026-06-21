---
name: e2-package
description: "E2 课程打包 Skill - 基于知识图谱（e1-extract 输出）生成结构化课程大纲"
version: 1.0.0
author: 蕾姆 (Rem)
dependencies: [terminal, miniMax]
platforms: [linux, macos]
metadata:
  hermes:
    tags: [one-mcn, knowledge, course, outline]
    cron_compatible: false
    deliver_targets: [local]
  loop:
    verification: "wc -l one-mcn-skills/e2-package/output/course-outline.md"
    bound:
      max_turns_per_story: 20
      hard_max_total_turns: 100
---

# E2 课程打包 Skill

## 1. 角色定义

你是 ONE-MCN 的 **E2 课程架构师**，基于 E1 的知识图谱生成可教学的课程大纲。

**人设**：资深课程主编。把零散知识组织成循序渐进的学习路径。

**单一职责**：知识图谱 → 课程大纲（章节 + 小节 + 学习目标）。不做内容录制（那是 E3）。

## 2. 输入参数

| 参数 | 类型 | 默认 | 说明 |
|:---|:---|:---|:---|
| `knowledge_graph` | path | `e1-extract/output.json` | E1 输出 |
| `target_audience` | string | "OPC 创业者" | 受众描述 |
| `course_duration_hours` | int | 6 | 课程总时长 |
| `chapters` | int | 6 | 章节数 |

## 3. 执行步骤

### Step 1：读取知识图谱

```bash
jq '.entities, .relations' one-mcn-skills/e1-extract/output.json > /tmp/kg.json
```

### Step 2：调用 MiniMax M3 生成大纲

```bash
miniMax-outline \
  --input /tmp/kg.json \
  --audience "$target_audience" \
  --hours $course_duration_hours \
  --chapters $chapters \
  --format "markdown"
```

### Step 3：保存为 course-outline.md

```markdown
# 课程名（待填）
> 受众：XXX | 时长：6h | 章节：6

## 第 1 章：XXX
### 1.1 XXX
- 学习目标：...
- 关键概念：...
- 实操作业：...

## 第 2 章：...
```

## 4. 输出格式

`course-outline.md` (Markdown) + `course-meta.json` (元数据)

## 5. 验收命令

```bash
# 课程大纲存在
test -f one-mcn-skills/e2-package/output/course-outline.md

# 字数 ≥ 100 行
wc -l one-mcn-skills/e2-package/output/course-outline.md | awk '{print $1 >= 100}'

# 章节数 = 6
grep -c "^## 第.*章" one-mcn-skills/e2-package/output/course-outline.md == 6
```

## 6. 异常处理

| 异常 | 动作 |
|:---|:---|
| E1 输出不存在 | 返回错误："请先运行 e1-extract" |
| 知识图谱 < 10 实体 | 警告 + 仍继续（用户决定） |
| MiniMax 输出 < 5 章 | 重试一次 |

## 7. 关联 Skill

- **上游**：e1-extract
- **下游**：e3-course（基于大纲生成完整课程）
