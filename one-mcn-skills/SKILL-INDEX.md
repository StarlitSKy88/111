# ONE-MCN Skill 索引 v5.1

> **创建日期**：2026-06-22
> **状态**：🔵 待填充（vibcoding 推进中）
> **替代**：v2.0.3 的 32 个 OPC skill（已删除到 `.deleted-backup-2026-06-22/one-mcn-skills/`）

## 1. Skill 命名规则（按 ONE-MCN 4 阶段）

```
one-mcn-skills/
├── discovery/           # Stage 1: Discovery 多轮对话引擎
│   ├── dialogue-engine/    # 多轮对话状态机（5 状态）
│   ├── blueprint-gen/      # 蓝图生成器
│   ├── capability-extract/ # 能力图谱提取
│   └── case-library/       # 案例库（用于展示）
│
├── brand-building/     # Stage 2: Brand Building 4 Agent 矩阵
│   ├── content-agent/      # 内容生产 Agent
│   ├── acquisition-agent/  # 获客触达 Agent
│   ├── delivery-agent/     # 交付 Agent
│   ├── support-agent/      # 售后 Agent
│   └── consistency-agent/  # 一致性审查 Agent（7 红线）
│
├── monitor/            # Stage 3: Monitor 5 维数据
│   ├── traffic-collect/    # 流量采集
│   ├── conversion-collect/ # 转化采集
│   ├── revenue-collect/    # 收入采集
│   ├── brand-collect/      # 品牌数据采集
│   ├── retention-collect/  # 留存采集
│   ├── dashboard/          # 实时仪表盘
│   └── alert-engine/       # 异常预警规则
│
├── monetize/           # Stage 4: Monetize 商业化
│   ├── trial-manager/      # 14 天试用管理
│   ├── tier1-subscribe/    # Tier 1 ¥999/月订阅
│   ├── tier2-subscribe/    # Tier 2 ¥999/月订阅
│   ├── tier3-enroll/       # Tier 3 ¥50,000 入学
│   ├── renewal-reminder/   # 续费提醒（7/1/0 天）
│   ├── referral-engine/    # 推荐奖励（15% 佣金）
│   └── early-bird/         # 早鸟窗口 ¥699/月
│
├── infra/              # L0: 基础设施
│   ├── db-schema/          # 8 张表 + RLS 多租户
│   ├── stripe-webhook/     # Stripe webhook 幂等性
│   ├── wechat-pay/         # 微信支付 v3 API
│   ├── alipay/             # 支付宝
│   ├── backup-restore/     # 数据库备份 + 恢复
│   └── cron-scheduler/     # Cron 调度
│
└── guard/              # 全局守卫
    ├── loop-runner/        # Loop 执行引擎
    ├── kill-switch/        # 一键叫停
    ├── eval-runner/        # 评估器
    └── progress-tracker/   # 进度跟踪
```

## 2. v5.1 设计原则

### 2.1 按 ONE-MCN 4 阶段 + 1 层基础设施 + 1 层守卫组织

| 旧（v2.0.3 OPC）| 新（v5.1 ONE-MCN）|
|:---|:---|
| A 链（a1-a7）：赛道扫描/爆款拆解 | **discovery/** + **infra/** |
| B 链（b1-b3）：智能发布/数据 | **monitor/** |
| C 链（c1-c4）：私域/朋友圈/标签/裂变 | **monetize/**（试用/付费/续费/推荐）|
| D 链（d1）：SOP 引擎 | **guard/loop-runner** |
| E 链（e1-e4）：知识提取/课程 | ❌ 不需要（OPC 时代产物）|
| F 链（f1-f4）：IP 定位/品牌内容 | **brand-building/**（4 Agent）|
| G 链（g1-g3）：项目复盘 | ❌ 不需要（项目管理 skill）|
| H 链（h1-h3）：机会扫描/匹配 | ❌ 不需要（商务拓展）|
| I 链（i2-i3）：全局监控/熔断 | **guard/**（alert-engine + kill-switch）|

### 2.2 关键决策

- ❌ 删除 32 个 OPC skill（赛道扫描/爆款拆解/私域/课程化/项目管理/商务）
- ✅ 按 ONE-MCN 4 阶段 + L0 infra + guard 重组织
- ✅ 共 28 个 skill 位置（实际填充数由 vibcoding 推进决定）

### 2.3 vibcoding 推进节奏

每个 skill 由 **Writer agent** 实现 → **Reviewer agent** 审 → **Verifier agent** 验，**三段式闭环**。

具体哪个 skill 优先，按 LOOP-LIST.md 的 37 个 loop 顺序。

## 3. 旧 Skill 备份位置

`.deleted-backup-2026-06-22/one-mcn-skills/`

**保留原因**：万一未来 ONE-MCN 需要参考 OPC 创作者工具的某些能力（如爆款拆解），可以从备份恢复。

## 4. 变更记录

| 日期 | 版本 | 变更 |
|:---|:---|:---|
| 2026-06-22 | v5.1 | 删除 32 个 OPC skill，重组为 ONE-MCN 4 阶段 + L0 infra + guard |