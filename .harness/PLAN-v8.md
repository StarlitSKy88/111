# ONE-MCN Loop Harness Plan v8

> **项目**：ONE-MCN（1 人 MCN 公司）
> **版本**：v8（vibcoding roadmap — 0 员工 + 100% Loop Engineering 推进）
> **创建日期**：2026-06-22
> **替代**：v7（OPC 节点百科 7 阶段重构，已备份到 `.deleted-backup-2026-06-22/.harness/`）

## 0. 项目状态（2026-06-22）

- **ONE-MCN**：正在 vibcoding 的需求（不是未来愿景）
- **阶段**：M1 Day 0（基础设施 + 安全基线）
- **任务总数**：175 个原子任务（138 M1 + 16 M2 + 8 M3 + 13 M4-M6）
- **Loop 总数**：37 loop × ~165 原子验证
- **真实工作量**：6-10 周（vibcoding 模式可能压缩）
- **团队**：0 员工 + 100% vibcoding
- **OPC 节点百科**：2026-06-22 已全部删除（本地 + VPS 自然死亡）

## 1. 4 阶段流水线（严格串行）

### Stage 1: Discovery（多轮 AI 对话）

- **目标**：帮用户深度挖掘需求 + 能力图谱 + 需求图谱 → 个人品牌蓝图
- **关键交付**：5-10 轮对话状态机 + 蓝图生成器 + 案例库
- **Loops**：L-W-DISC-01/02/03

### Stage 2: Brand Building（4 Agent 矩阵）

- **目标**：内容/获客/交付/售后 4 Agent 全权执行 + MVP 上线
- **关键交付**：4 Agent orchestrator + 7 红线一致性审查 + MVP 上线流程
- **Loops**：L-W-AGENT-01/02/03/04 + L-W-CONSIST-01 + L-W-MVP-01

### Stage 3: Monitor（5 维数据 + push/pull）

- **目标**：流量/转化/收入/品牌/留存 5 维数据采集 + 实时仪表盘 + 异常预警
- **关键交付**：5 个采集器 + dashboard + 10+ 预警规则 + 周报告 + 优化建议
- **Loops**：L-W-MONITOR-01/02/03/04

### Stage 4: Monetize（试用 + 转化 + 续费 + 推荐）

- **目标**：14 天试用 + 3 Tier 订阅 + 续费提醒 + 推荐奖励
- **关键交付**：trial-manager + tier1/2/3 subscribe + renewal + referral + early-bird
- **Loops**：L-W-MONETIZE-01/02/03 + L-MONETIZE-04/05（Stage 4 独立层）

### L0: 基础设施

- **DB Schema**：8 张表 + RLS 多租户 + tenant_id 索引
- **Stripe webhook**：幂等性 + 签名验证 + 5 事件类型
- **微信支付 v3**：年度方案 + 时间戳 ±5min + 幂等
- **支付宝**：RSA2 签名 + 幂等
- **数据库备份**：每日 + 加密 + 恢复测试 + 30 天滚动
- **Cron 调度**：8+ 任务

## 2. 3 Tier 定价 + Stage 4 独立商业化

```
Stage 4（独立，与 Tier 解耦）:
  14 天免费试用 → 早鸟 ¥699/月（前 100 用户永久）→ 标准 ¥999/月

Tier 产品包:
  Tier 1 · MVP 助推器      ¥999/月    （4 Agent + 模板 + 数据接入）
  Tier 2 · 产品放大器      ¥999/月    （持续运营 + 多渠道获客）
  Tier 3 · 系统性陪跑      ¥50,000/次（12 个月 1v1 顾问，从 Tier 2 转化）

推荐奖励: 推荐人 15% 佣金（Stage 4 通用规则）
```

## 3. 12 + 8 假设（roadmap 驱动）

### 12 个技术假设 A1-A12（vibcoding 可验证）

| # | 假设 | 验证命令 |
|:--|:---|:---|
| A1 | Discovery ≥ 5 轮 ≥ 60% | psql SELECT blueprint completion |
| A2 | 多轮对话比问卷更能挖掘需求 | 同上 |
| A3 | Agent 全权 + weekly review 高效 | SELECT auto_decided 率 ≥ 80% |
| A4 | 4 阶段严格串行比全模块成功率高 | brand_buildings validated |
| A5 | 试用 + 转化 ≥ 10% | SELECT trial→paid |
| A6 | Agent = 合伙人而非助手 | review 时间 < 30min |
| A7 | push + pull 组合优于单一 | push 响应率 ≥ 40% |
| A8 | RLS 100% 隔离 | 跨租户 = 0 行 |
| A9 | Stripe webhook 100% 幂等 | event_id 去重 |
| A10 | Stripe 签名 100% 验证 | signature_verified 全 true |
| A11 | 备份 24h 可恢复 | find /backup -mtime -1 |
| A12 | Tier 3 必须从 Tier 2 转化 | DB CHECK 约束 |

### 8 个商业假设 B1-B8（vibcoding 不可验证，需 MVP 上线后）

| # | 假设 | 验证时机 |
|:--|:---|:---|
| B1 | ICP 付费意愿 ≥ 5% | 上线后 30 天 |
| B2 | 试用转化 ≥ 10% | 上线后 30 天 |
| B3 | Tier 1→2 转化 ≥ 20% | 上线后 60 天 |
| B4 | 早鸟 ¥699 拉新有效 | 上线后 30 天 |
| B5 | CAC < ¥300 | 上线后 100 用户 |
| B6 | LTV/CAC ≥ 3.0 | 上线后 6 个月 |
| B7 | GTM 渠道有效 | 上线后 30 天 |
| B8 | 续费 ≥ 70% | 上线后 6 个月 |

## 4. vibcoding 推进策略

### 4.1 三段式分工（Anthropic Best Practices）

```
[Writer Agent] → git commit → [Reviewer Agent 白盒] → PASS → [Verifier Agent 黑盒] → PASS → ✅
              ↓ BLOCKER/CRITICAL                ↓ FAIL/PARTIAL
              Writer 修复                     Writer 修复
                       ↑                              │
                       └──────────────────────────────┘
                              Loop-Until-Done
                              (max 5 轮后人工拍板)
```

### 4.2 启动顺序（M1 Day 0-7）

1. **L-W-INFRA-01** 数据库 schema + RLS 多租户
2. **L-W-INFRA-03** Stripe webhook 幂等性
3. **L-W-INFRA-04** 数据库备份 + 恢复
4. **L-W-INFRA-05** 微信支付 + 支付宝集成
5. **L-W-MONETIZE-01** 14 天试用管理
6. **L-W-MONETIZE-02** Stage 4 与 Tier 解耦验证
7. **L-W-DISC-01** 多轮对话引擎（Stage 1 起点）

### 4.3 Loop 完成标准

```yaml
pass_criteria:
  reviewer_pass: "无 BLOCKER + 无 CRITICAL"
  verifier_pass: "100% 测试场景 PASS（skeptic persona 默认 FAIL，需证据证明 PASS）"
  human_signoff: "昴君 review（人工拍板不可省略）"
```

## 5. v5.1 关键决策记录

- ✅ OPC 节点百科代码全部删除（本地 + VPS）
- ✅ 0 design partner（vibcoding + 0 员工模式不需要真人反馈）
- ✅ AI 验证为主（功能：A1-A12 / 商业：B1-B8 上线后真人验证）
- ✅ taomyst.top 域名保留（等 ONE-MCN 上线前统一配置）
- ✅ VPS 续费延后处理
- ✅ 5 份 ONE-MCN 文档 = vibcoding roadmap
- ✅ 32 个 OPC skill 全部删除，按 ONE-MCN 4 阶段重组
- ✅ 蕾姆人设备份到项目根 AGENTS.md（650 行 / 27KB）

## 6. 每日 Backup + Session Resume 协议（v5.1 新增）

> **背景**：0 员工 vibcoding 模式的最大风险是单点失败（蕾姆 session 中断 / Codex API 限流 / 昴君电脑故障）。
> **协议**：每个工作日结束前 + 每个 loop 完成后，必须执行以下备份。

### 6.1 每日 Backup 路径（cron 每天 23:00 自动）

```bash
# 1. Git tag（最稳定）
git tag -a "v5.1-eod-$(date +%Y%m%d)" -m "每日 end-of-day 备份"
git push --tags

# 2. .harness/ 状态快照
cp .harness/state.json .harness/state.json.eod-$(date +%Y%m%d)
cp .harness/PLAN-v8.md .harness/PLAN-v8.md.eod-$(date +%Y%m%d)

# 3. 关键决策记录（loop_notes）
echo "$(date +%Y-%m-%d): [loop-id] [verdict] [notes]" >> LOOP_NOTES.md
```

### 6.2 Session Resume 协议（蕾姆中断后恢复）

```bash
# 1. 检查 active-loop.txt 状态
cat .claude/loops/active-loop.txt

# 2. 检查 LOOP_NOTES.md 最近 5 条
tail -5 LOOP_NOTES.md

# 3. 检查 git log 最近 10 条
git log --oneline -10

# 4. 检查 .harness/state.json 的 current_loop 字段
jq '.current_loop, .loop_status, .blockers' .harness/state.json
```

### 6.3 关键决策一键可读（CHECKPOINT 协议）

```bash
# 创建 CHECKPOINT.md 包含当前所有关键信息
cat > CHECKPOINT.md <<EOF
# ONE-MCN v5.1 CHECKPOINT（$(date +%Y-%m-%d)）

## 当前状态
- Stage: M1 Day $(jq -r '.current_day' .harness/state.json)
- Loop: $(jq -r '.current_loop' .harness/state.json)
- 状态: $(jq -r '.loop_status' .harness/state.json)

## 最近决策
$(git log --oneline -5)

## 阻塞
$(jq -r '.blockers | join("\n- ")' .harness/state.json)

## 下一步
$(jq -r '.next_loop | tostring' .harness/state.json)
EOF
```

### 6.4 0 员工风险对冲（4 层防护）

| 层级 | 风险 | 防护 |
|:---|:---|:---|
| L1 | 蕾姆 session 中断 | git tag eod 备份 + CHECKPOINT.md |
| L2 | Codex API 限流 | 切换备份 Codex / Claude Code 接力 |
| L3 | 昴君电脑故障 | iCloud 同步 .harness/ + LOOP_NOTES.md |
| L4 | 全部失败 | .deleted-backup-2026-06-22/ + git history（数月可恢复）|

---

## 7. 状态同步

| 资源 | 状态 |
|:---|:---|
| CLAUDE.md | v5.0（9 条 Lesson）|
| ONE-MCN-PRD.md | v5.0 |
| ONE-MCN-ARCHITECTURE.md | v5.0 |
| ONE-MCN-M1-SOP.md | v5.0 |
| ONE-MCN-LOOP-LIST.md | v5.0 |
| ONE-MCN-COMMERCIAL.md | v5.1 |
| AGENTS.md | v5.1（蕾姆版 27KB）|
| CHANGELOG.md | v5.1 |
| .harness/PLAN-v8.md | **本文件** |
| one-mcn-skills/ | v5.1（重组织，6 阶段目录）|
| .claude/agents/{reviewer,verifier}.md | v2.0（Anthropic）|
| LOOP_NOTES.md | ⚠️ 待重写 |
| .claude/loops/active-loop.txt | ⚠️ 待重置 |

## 7. 变更记录

| 日期 | 版本 | 变更 |
|:---|:---|:---|
| 2026-05-09 | v7 | OPC 节点百科 7 阶段重构（已废弃）|
| 2026-06-22 | v8 | ONE-MCN vibcoding roadmap 重写 |