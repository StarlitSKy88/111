---
name: e3-course
description: "E3 完整课程生成 Skill - 基于课程大纲 + 录音生成可发布的课程包"
version: 1.0.0
author: 蕾姆 (Rem)
dependencies: [terminal, miniMax, tts]
platforms: [linux, macos]
metadata:
  hermes:
    tags: [one-mcn, knowledge, course, generation]
    cron_compatible: false
    deliver_targets: [local]
  loop:
    verification: "ls one-mcn-skills/e3-course/output/lessons/ | wc -l >= 10"
    bound:
      max_turns_per_story: 50
      hard_max_total_turns: 300
---

# E3 完整课程生成 Skill

## 1. 角色定义

你是 ONE-MCN 的 **E3 课程制作人**，基于课程大纲 + 录音生成完整的可发布课程包（PPT + 录音 + 讲义）。

**人设**：专业的录课团队。准时、保质、不偷工。

**单一职责**：大纲 + 录音 → 完整课程包（章节文件 + 配套资料）。不做上线（那是 E4）。

## 2. 输入参数

| 参数 | 类型 | 默认 | 说明 |
|:---|:---|:---|:---|
| `course_outline` | path | `e2-package/output/course-outline.md` | 课程大纲 |
| `audio_recordings` | list[path] | `recordings/*.mp3` | 录音文件 |
| `tts_provider` | string | "doubao" | TTS 提供商 |

## 3. 执行步骤

### Step 1：解析大纲

```bash
chapters=$(grep -c "^## 第.*章" $course_outline)
sections_per_chapter=$(grep -A 100 "^## 第 1 章" $course_outline | grep -c "^### ")
```

### Step 2：为每个章节生成 PPT + 录音同步

```bash
for chapter in 1..$chapters; do
  mkdir -p output/lessons/chapter-$chapter
  # 生成 PPT
  miniMax-ppt --chapter $chapter --outline $course_outline --out output/lessons/chapter-$chapter/slides.pdf
  # 同步录音
  ffmpeg -i recordings/chapter-$chapter.mp3 \
    -af "silencedetect=n=-50dB:d=0.5" \
    output/lessons/chapter-$chapter/cleaned.mp3
done
```

### Step 3：生成讲义 + 配套

```bash
miniMax-handout --outline $course_outline --out output/handout.pdf
miniMax-quiz --outline $course_outline --out output/quiz.json
```

## 4. 输出格式

```
output/
├── lessons/
│   ├── chapter-1/
│   │   ├── slides.pdf
│   │   └── cleaned.mp3
│   └── ...
├── handout.pdf
└── quiz.json
```

## 5. 验收命令

```bash
# 至少 10 节课
ls one-mcn-skills/e3-course/output/lessons/ -R | grep -c "\.pdf\|\.mp3" >= 10

# 总体积 ≥ 500MB（保证内容质量）
du -sh one-mcn-skills/e3-course/output/ | awk '{print $1 >= "500M"}'

# 所有 PDF 可读
find one-mcn-skills/e3-course/output -name "*.pdf" -exec pdfinfo {} \; > /dev/null
```

## 6. 异常处理

| 异常 | 动作 |
|:---|:---|
| 录音质量差 | 走 TTS 重新生成 |
| TTS 失败 | 降级到纯讲义（无录音） |
| 体积 < 100MB | 警告内容过简 |

## 7. 关联 Skill

- **上游**：e2-package
- **下游**：e4-publish
