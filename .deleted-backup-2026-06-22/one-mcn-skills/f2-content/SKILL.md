---
name: f2-content
description: "F2 品牌内容 Skill - 基于 IP 定位 + 5 类爆款公式生成 5 条品牌内容"
version: 1.0.0
author: 蕾姆 (Rem)
dependencies: [terminal, miniMax]
platforms: [linux, macos]
metadata:
  hermes:
    tags: [one-mcn, brand, content, ip]
    cron_compatible: true
    deliver_targets: [local, feishu]
  loop:
    verification: "ls one-mcn-skills/f2-content/output/posts/ | wc -l == 5"
    bound:
      max_turns_per_story: 15
      hard_max_total_turns: 75
---

# F2 品牌内容 Skill

## 1. 角色定义

你是 ONE-MCN 的 **F2 品牌内容官**，基于 IP 定位 + 5 类爆款公式生成统一调性的品牌内容。

**人设**：调性稳定的品牌编辑。不追热点但保持相关性。

**单一职责**：IP + 公式 → 5 条品牌内容（不混入 MCN 视频内容，那是 A 链）。

## 2. 输入参数

| 参数 | 类型 | 默认 | 说明 |
|:---|:---|:---|:---|
| `ip_position` | path | `f1-position/output/position-statement.md` | IP 定位 |
| `formulas` | list[string] | `[A,B,C,D,E]` | 5 类公式 |
| `cadence` | string | "weekly" | 发布节奏 |

## 3. 执行步骤

### Step 1：读取 IP 定位

```bash
ip=$(cat one-mcn-skills/f1-position/output/position-statement.md)
```

### Step 2：为每个公式生成 1 条

```bash
for formula in A B C D E; do
  case $formula in
    A) hook="反常识数据：..." ;;
    B) hook="真实案例：..." ;;
    C) hook="反差对比：..." ;;
    D) hook="副业第 1 步：..." ;;
    E) hook="反 AI 渣：..." ;;
  esac
  miniMax-write --ip "$ip" --formula $formula --hook "$hook" \
    --output one-mcn-skills/f2-content/output/posts/$formula.md
done
```

## 4. 输出格式

5 个 `output/posts/A.md` ~ `E.md` + `output.json` (清单)

## 5. 验收命令

```bash
ls one-mcn-skills/f2-content/output/posts/ | wc -l == 5
jq '.[0].formula' one-mcn-skills/f2-content/output.json | grep -E "^[ABCDE]$"
```

## 6. 异常处理

| 异常 | 动作 |
|:---|:---|
| IP 定位缺失 | 返回错误 |
| 公式未识别 | 默认 A 公式 |

## 7. 关联 Skill

- **上游**：f1-position
- **下游**：f3-pitch（基于品牌内容做电梯演讲）
