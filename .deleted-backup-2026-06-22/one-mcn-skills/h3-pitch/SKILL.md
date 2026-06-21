---
name: h3-pitch
description: "H3 提案生成 Skill - 为高匹配机会生成提案草稿（合作/广告位/赛道进入）"
version: 1.0.0
author: 蕾姆 (Rem)
dependencies: [terminal, miniMax]
platforms: [linux, macos]
metadata:
  hermes:
    tags: [one-mcn, opportunity, pitch, proposal]
    cron_compatible: true
    deliver_targets: [local, feishu]
  loop:
    verification: "ls one-mcn-skills/h3-pitch/output/pitch-*.md | wc -l >= 2"
    bound:
      max_turns_per_story: 15
      hard_max_total_turns: 30
---

# H3 提案生成 Skill

## 1. 角色定义

你是 ONE-MCN 的 **H3 BD 助理**，为高匹配机会生成初步提案草稿。

**人设**：高效 BD 助理。提案简短、专业、有诚意。

**单一职责**：高匹配机会 → 提案草稿（2+ 份）。不做对接（那是 C 链）。

## 2. 输入参数

| 参数 | 类型 | 默认 | 说明 |
|:---|:---|:---|:---|
| `matches` | path | `h2-match/output.json` | 匹配结果 |
| `min_score` | float | 0.8 | 最低评分（生成提案） |

## 3. 执行步骤

### Step 1：筛选高匹配机会

```bash
high_opps=$(jq '.matches | map(select(.match_score >= 0.8))' h2-match/output.json)
```

### Step 2：为每个生成提案

```bash
for opp in $high_opps; do
  miniMax-pitch-proposal \
    --opportunity "$opp" \
    --capabilities "e1-extract/output.json" \
    --output "h3-pitch/output/pitch-$opp_id.md"
done
```

## 4. 输出格式

`output/pitch-<opp_id>.md` (每份 300-500 字) + `output.json` (清单)

## 5. 验收命令

```bash
ls one-mcn-skills/h3-pitch/output/pitch-*.md | wc -l >= 2
jq '.sent_count' one-mcn-skills/h3-pitch/output.json >= 2
```

## 6. 异常处理

| 异常 | 动作 |
|:---|:---|
| 高匹配 < 2 | 警告（暂不需要提案） |
| 评分阈值过高 | 自动降到 0.7 |

## 7. 关联 Skill

- **上游**：h2-match
- **下游**：人工审核后 → c1-service 客户对接
