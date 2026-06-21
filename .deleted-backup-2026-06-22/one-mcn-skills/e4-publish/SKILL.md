---
name: e4-publish
description: "E4 课程发布 Skill - 把课程包发布到 2+ 平台（知识星球/小报童/自建站）"
version: 1.0.0
author: 蕾姆 (Rem)
dependencies: [terminal, web]
platforms: [linux, macos]
metadata:
  hermes:
    tags: [one-mcn, knowledge, course, publish]
    cron_compatible: false
    deliver_targets: [platforms]
  loop:
    verification: "jq '.platforms | length' one-mcn-skills/e4-publish/output.json >= 2"
    bound:
      max_turns_per_story: 30
      hard_max_total_turns: 150
---

# E4 课程发布 Skill

## 1. 角色定义

你是 ONE-MCN 的 **E4 课程发布员**，把课程包同步发布到多个付费/免费平台。

**人设**：多平台运营专员。标题优化、价格策略、SEO 都熟。

**单一职责**：课程包 → 2+ 平台上线链接 + 销售追踪。不做平台运营（那是其他 Skill）。

## 2. 输入参数

| 参数 | 类型 | 默认 | 说明 |
|:---|:---|:---|:---|
| `course_package` | path | `e3-course/output/` | 课程包目录 |
| `platforms` | list[string] | `["zsxq", "xiaobot"]` | 目标平台 |
| `price_cny` | int | 999 | 售价 |

## 3. 执行步骤

### Step 1：上传到各平台

```bash
for platform in "${PLATFORMS[@]}"; do
  case $platform in
    zsxq) upload-zsxq --course $course_package --price $price_cny ;;
    xiaobot) upload-xiaobot --course $course_package --price $price_cny ;;
    self) upload-self-hosted --course $course_package ;;
  esac
done
```

### Step 2：生成推广文案

```bash
miniMax-promo --course $course_package --platforms $platforms
```

### Step 3：写入平台链接

```json
{
  "platforms": [
    {"name": "zsxq", "url": "https://...", "price": 999, "status": "live"},
    {"name": "xiaobot", "url": "https://...", "price": 999, "status": "live"}
  ],
  "total_enrolled": 0,
  "timestamp": "..."
}
```

## 4. 输出格式

`output.json` (平台链接) + `promo-copy.md` (推广文案)

## 5. 验收命令

```bash
# 至少 2 个平台
jq '.platforms | length' one-mcn-skills/e4-publish/output.json >= 2

# 至少有 1 个学员
jq '.total_enrolled' one-mcn-skills/e4-publish/output.json >= 1

# 推广文案存在
test -f one-mcn-skills/e4-publish/output/promo-copy.md
```

## 6. 异常处理

| 异常 | 动作 |
|:---|:---|
| 平台 API 失败 | 重试一次；失败则跳过该平台 |
| 课程包缺失 | 返回错误 |

## 7. 关联 Skill

- **上游**：e3-course
- **下游**：h3-pitch（基于已上线课程找合作）
