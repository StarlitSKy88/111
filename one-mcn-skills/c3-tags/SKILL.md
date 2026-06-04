---
name: c3-tags
description: "ONE-MCN C3 客户标签 - 加微后自动打标签（来源/兴趣/付费意向）+ 漏斗追踪（Day 7+ 启用）"
version: 1.0.0
author: 蕾姆 (Rem) for ONE-MCN
license: MIT
dependencies: [wechat-work]
platforms: [linux, macos]
metadata:
  hermes:
    tags: [one-mcn, crm, tags, wechat, deferred]
    related_skills: [b2-data, c1-service, c4-fission]
    cron_compatible: true
    deliver_targets: [local, feishu]
    status: stub
    priority: deferred
---

# C3 客户标签 Skill（**M2 阶段，本版本为 Stub**）

> ⚠️ **本 Skill 在 M1 阶段不启用**。M1 阶段客户数 < 50，人工记 Excel 即可。

## 1. 角色定义

你是 ONE-MCN 的 **C3 标签管家**。**4 维标签 + 漏斗追踪**。

## 2. 4 维标签体系

| 维度 | 标签 |
|:---|:---|
| **来源** | az-阿泽 / rm-燃木 / ogc-百科自然流量 / pay-付费投放 / ref-转介绍 |
| **兴趣** | tech / content / monetization / sop |
| **付费意向** | cold / warm / hot / paid |
| **阶段** | contact-加微 / sop-看 SOP / ar-看 AR / buy-下单 / refund-退款 |

## 3. 漏斗公式

```
加微 (1)
  ↓ 40% 看 SOP
看 SOP
  ↓ 10% 看 AR/1 元课
看 AR
  ↓ 30% 付款
付费 (X)
```

**LTV 公式**：`LTV = 加微数 × 0.4 × 0.1 × 0.3 × ARPU`

## 4. M1 阶段人工 Excel 表

`data/crm-m1.xlsx` 字段：微信昵称 / 来源 / 加微日期 / 阶段 / 备注

## 5. M2 启用条件

| 条件 | 阈值 | 动作 |
|:---|:---|:---|
| 7 日加微 | ≥ 100 | 启用自动标签 + 飞书 CRM |
| 7 日加微 | ≥ 500 | 接入企业微信 API 全自动 |

## 6. 调度（M2 启用）

```bash
# 每日 23:00 跑漏斗
hermes cron create "0 23 * * *" \
  "C3 漏斗日报：加微/看 SOP/看 AR/付费 4 段。详见 ~/.hermes/skills/one-mcn/c3-tags/SKILL.md" \
  --name "C3 漏斗日报" \
  --skill c3-tags
```

---

**本 Skill 由蕾姆为 ONE-MCN 设计 · 2026-06-04** · **Stub 版本，M1 不启用**
