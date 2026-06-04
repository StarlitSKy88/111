---
name: c4-fission
description: "ONE-MCN C4 裂变追踪 - 3 人邀请解锁完整报告（laoban 模式复用）+ Day 7+ 启用"
version: 1.0.0
author: 蕾姆 (Rem) for ONE-MCN
license: MIT
dependencies: [wechat-work]
platforms: [linux, macos]
metadata:
  hermes:
    tags: [one-mcn, fission, viral, wechat, deferred]
    related_skills: [c1-service, c3-tags]
    cron_compatible: true
    deliver_targets: [local, feishu]
    status: stub
    priority: deferred
---

# C4 裂变追踪 Skill（**M2 阶段，本版本为 Stub**）

> ⚠️ **本 Skill 在 M1 阶段不启用**。M1 阶段客户数 < 50，无裂变基础。

## 1. 角色定义

你是 ONE-MCN 的 **C4 裂变追踪**。**3 人邀请 = 1 次免费完整报告**（复用 laoban 模式）。

## 2. 裂变公式

| 层级 | 阈值 | 解锁 |
|:---|:---|:---|
| L1 | 加微 1 人 | 1 元课 30% 折扣券 |
| L2 | 邀请 3 人 | 1 元课免费 + 完整报告 |
| L3 | 邀请 10 人 | 训练营 9 折 |
| L4 | 邀请 30 人 | 训练营免费 + 私域合伙 |

## 3. 追踪机制

- 每人生成**唯一邀请链接** `https://opcnode.com/?ref={user_id}`
- 后端记录 `data/invites.json`：`{ inviter_id, invitee_id, timestamp, status }`
- 触发解锁时飞书通知 + 微信自动发券

## 4. 风险点

- **刷量风险**：同 IP/同设备 24h 内不算
- **微信风控**：裂变文案避免"分享到朋友圈"等敏感词
- **数据合规**：邀请人需明确同意被记录

## 5. M1 阶段人工

M1 阶段直接走 laoban 的 localStorage 模式（3 人邀请 = 1 次免费报告）作为占位。

## 6. M2 启用条件

| 条件 | 阈值 | 动作 |
|:---|:---|:---|
| 7 日加微 | ≥ 200 | 启用自动裂变追踪 |
| 累计加微 | ≥ 1000 | 启用自动解锁 + 飞书通知 |

## 7. 调度（M2 启用）

```bash
# 每日 22:00 跑裂变数据
hermes cron create "0 22 * * *" \
  "C4 裂变日报：L1/L2/L3/L4 邀请数 + 解锁数。详见 ~/.hermes/skills/one-mcn/c4-fission/SKILL.md" \
  --name "C4 裂变日报" \
  --skill c4-fission
```

---

**本 Skill 由蕾姆为 ONE-MCN 设计 · 2026-06-04** · **Stub 版本，M1 不启用**
