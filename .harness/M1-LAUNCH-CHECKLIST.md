# ONE-MCN M1 启动日 Checklist · 2026-07-03

> **倒计时**：10 天
> **目标**：设计伙伴进入 14 天免费试用 + 5 维数据采集跑通 + 3 种支付链路准备就绪
> **更新**：2026-06-23 v5.3.2

---

## 0. 关键决策记录

- **设计伙伴**：v5.3 全面启用，剧本在 `.harness/DESIGN-PARTNER-PLAYBOOK.md`
- **早鸟价格**：¥699/月（前 100 用户锁价），标准 ¥999/月
- **Tier 3**：¥50,000 一次性 12 个月 1v1
- **3 Loop 完成度**：30/33 = 91%（剩 3 个需 test keys）

---

## 1. D-10（2026-06-23，本日）— 已完成

- [x] 30 个 Loop 端到端 PASS（见 `.harness/AUDIT-v5.3.md`）
- [x] PostgreSQL 16 启动 + 9 张表 + RLS 多租户
- [x] 8 个 Cron 任务安装到系统
- [x] Design Partner onboarding 页面 + API
- [x] 22 个 Discovery 案例库
- [x] UI 切换到 japanese-ma-minimalism（間）哲学
- [x] Stripe/微信/支付宝 webhook handlers 占位（待 keys 后 1 小时接通）

## 2. D-9（2026-06-24）— 您本人执行

- [ ] **接触 2-3 个 alpha design partner**（最高优先级）
  - 朋友圈/即刻发布模板：`.harness/DESIGN-PARTNER-PLAYBOOK.md`
  - 试用链接：<http://localhost:3001/onboarding>
- [ ] 把 onboarding 链接发给熟人

## 3. D-8 ~ D-7（2026-06-25 ~ 06-26）— 蕾姆执行

- [ ] 蕾姆跑 Stripe test key 接入 + 5 事件端到端测试
- [ ] 蕾姆跑 微信支付 test mchid + RSA2 验签 + 时间戳窗测试
- [ ] 蕾姆跑 支付宝 test 应用 + 异步通知测试
- [ ] 蕾姆准备 marketing 内容（design partner 跟踪表）

## 4. D-6 ~ D-3（2026-06-27 ~ 06-30）— Design partner 进入试用

- [ ] 第 1 个 design partner 完成注册 + onboarding
- [ ] 第 2 个 design partner 进入 Discovery 多轮对话
- [ ] 第 3 个 design partner 激活 4 Agent
- [ ] 14 天反馈机制跑通（每日 30 秒反馈 + 每周 30 分钟 1v1）

## 5. D-2 ~ D-1（2026-07-01 ~ 07-02）— M1 启动日预演

- [ ] 端到端冒烟测试（注册 → Discovery → 蓝图 → 4 Agent → Dashboard）
- [ ] 备份恢复测试通过（每日 backup + 每周 restore test）
- [ ] 异常预警 ≥ 10 条规则配置
- [ ] cron 8 任务全部跑通

## 6. D-Day（2026-07-03）— M1 启动日

- [ ] 公开 design partner 邀请（朋友圈/即刻/小红书）
- [ ] 14 天试用 onboarding 链接开放
- [ ] 监控仪表盘可观测
- [ ] 异常预警推送通道激活

---

## 7. 风险与回滚方案

| 风险 | 回滚方案 |
|:---|:---|
| Design partner 没人愿意试 | 退回到 v5.1.3 "价格弹性测试" 模式（API 直接暴露，10 分钟拿到反馈）|
| Stripe/微信 keys 拿不到 | 跳过 webhook（手动调整 tier_subscriptions 表，3 个 user 内可手动）|
| Cron 任务报错 | 临时改用 manual run（蕾姆手动跑 + 验证）|
| 数据库崩溃 | 备份恢复（每日 .one-mcn-backups/ + 30 天滚动）|

---

## 8. 完成度（2026-06-23 当前）

| 类别 | 状态 |
|:---|:---:|
| 技术层（30 Loop + 8 cron + API + UI）| 91% |
| 商业层（design partner + 14 天反馈）| 10% |
| 支付链路（Stripe/微信/支付宝 handlers）| 50% (代码 ready, keys 待) |

---

## 9. 蕾姆的下一步

- [ ] 立即：写完 Design Partner outreach 工具包（朋友圈/即刻发布模板 + 跟踪表）
- [ ] 等您 contact 2-3 个 design partner
- [ ] 自动跑 Stripe/微信/支付宝 test integration（您提供 keys 后）
- [ ] 持续每日 EOD 备份 + 状态文件同步