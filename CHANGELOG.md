# Changelog

## [5.1] - 2026-06-22

### 🚀 v5.1 · OPC 节点百科全部删除 + design partner 删除

**关键决策（昴君 6 轮 AskUserQuestion 确认）**：
1. ONE-MCN 是**正在 vibcoding 的需求**（不是未来愿景）
2. OPC 节点百科代码（57 节点 + 76 API + admin + 微信落地 + VPS 部署）= **全部删除**
3. 5 份 ONE-MCN 文档 = **vibcoding roadmap**（每天从 LOOP-LIST 拿 1 个 loop 推进）
4. **0 design partner**（vibcoding + 0 员工模式不需要真人反馈）
5. **AI 验证为主**（功能验证：A1-A12 / 商业验证：B1-B8 上线后真人验证）
6. taomyst.top 域名保留，等 ONE-MCN 上线前统一配置

### Added
- **Lesson 8**（CLAUDE.md）：先确认产品当前状态（代码），再优化产品未来状态（文档）
- **Lesson 9**（CLAUDE.md）：vibcoding + 0 员工模式 = 不招 design partner
- **Lesson 10**（CLAUDE.md）：v5.0 转型必须做"项目级扫描"，不是只改文档
- ONE-MCN-COMMERCIAL.md §8 重写为"AI 自动验证清单"
- 蕾姆人设备份到项目根 `AGENTS.md`（650 行 / 27KB，从 `~/.codex/AGENTS.md` 同步）

### Changed
- CLAUDE.md 重写为 ONE-MCN v5.0 主入口（17 KB / 9 条 Lesson）
- ONE-MCN-PRD/ARCHITECTURE/M1-SOP/LOOP-LIST 4 份文档升级 v5.0 changelog
- ONE-MCN-COMMERCIAL.md 升级 v5.1 changelog（删除 design partner）
- .deleted-backup-2026-06-22/ 创建（1.6MB OPC 备份）
- git tag `pre-opc-cleanup-2026-06-22`（秒级回退）

### Removed
- `.playwright-mcp/` 调试残留
- `admin-app/`（Vite+React 子项目，从未使用）
- `api/`（76 API 模块）
- `archive/screenshots/`（143 截图）
- `attribution-dashboard-v4.png`
- `content-drafts/`（57 节点草稿）
- `data/`（15 个 JSON 文件）
- `dist/`（m1-9nodes.pdf）
- `go/`（私域落地）
- `mockups/`（7 历史 mockup）
- `node_modules/` / `package-lock.json` / `playwright.config.js` / `test-results/`
- `nodes/`（57 节点目录）
- 根目录 `index.html` / `admin.html` / `app.js` / `auth-guard.js` / `admin-guard.js`
- `tests/`（18 过时测试）
- `scripts/`（15 脚本）
- `docs/`（one-mcn 子目录）
- DESIGN-AUDIT.md / KNOWLEDGE.md / TOOLS-TASKS.md / DNS-MIGRATION-GUIDE.md
- `PRIVATE-DOMAIN-SOP.md` / `deploy.sh`
- `.gstack/`

**总释放空间**：约 6.5MB

### Pending（2026-06-22 中立评审发现）
- ⚠️ P0-1：`.harness/` 重写为 ONE-MCN（原 PLAN-v7.md 是 OPC 节点百科）
- ⚠️ P0-2：`one-mcn-skills/` 32 个 skill 按 ONE-MCN 4 阶段重组织
- ⚠️ P1-1：5 文档数字最终统一（PRD 175 vs SOP 177 vs LOOP-LIST 40 个）
- ⚠️ P1-3：`LOOP_NOTES.md` + `.claude/loops/active-loop.txt` 重置
- ⚠️ P1-5：启动 PostgreSQL 环境（vibcoding 第一个 loop 准备）

---

## [4.2] - 2026-06-21

### 🚀 v4.2 · 内部一致性大修复（修复 40 天文档漂移）

**评审者反馈**：v4.1 暴露了 5 份文档互打、138 任务 7 天不可能、0 竞品、0 GTM 等严重问题

### Added
- **8 个商业假设 B1-B8**（PRD §1.5）：GTM/CAC/LTV/续费
- **ONE-MCN-COMMERCIAL.md**（v4.2 新建）：竞品（Substack/Beehiiv/Buffer/Kajabi）+ GTM 90 天路径 + Unit Economics + 团队 1-2 人 + 退出路径
- **12 个 CRITICAL 风险** R1-R12（PRD §7）

### Changed
- 内部定价冲突修复（漏斗 ¥199→¥999→¥4999 → Stage 4 独立 + 3 Tier 产品包）
- 推荐佣金 20% → 15%
- CLAUDE.md Loop 数（22 → 37）、任务数（83 → 175）、工作量诚实评估（6-10 周）
- v4.1 重复章节删除（Loop 总表 + 执行原则 + changelog 三处重复）
- 营销语言删除（"100% 深度版"/"ai-pm sacred"/"10+ 轮深度思考"）
- 文档交叉链接图（PRD ↔ ARCH ↔ SOP ↔ LOOP-LIST ↔ COMMERCIAL）

---

## [4.1] - 2026-06-21

### 🚀 v4.1 · 3 Tier 定价 + Stage 4 解耦

### Added
- 3 Tier 定价模型：Tier 1 ¥999/月 · Tier 2 ¥999/月 · Tier 3 ¥50,000/次
- Stage 4 独立商业化框架（与 Tier 完全解耦）
- 早鸟窗口 ¥699/月（前 100 用户永久）
- Tier 3 入学门槛（必须从 Tier 2 转化）
- 12 个 lead-with-assumption 技术假设 A1-A12

### Changed
- ONE-MCN-LOOP-LIST.md v4.0 → v4.1（22 → 32 loop）
- ONE-MCN-M1-SOP.md v4.0 → v4.1（83 → 138 任务）

---

## [4.0] - 2026-06-21

### 🚀 v4.0 · 4 阶段流水线架构（纠正 v3.0 错误）

### Added
- 4 阶段流水线：Discovery → Brand Building → Monitor → Monetize
- 两条线：主线（MVP→验证→扩展品牌）+ 辅线（获客+产品+售后）
- Agent 角色：合伙人（Agent 全权决策 + 用户 weekly review）
- lead with assumption 方法论
- 每个任务/验证原子级（可被 Loop Engineering 机械化执行）

### Changed
- v3.0 错位（32 Skill 框架 + 9 赛道 + 三轨定价）→ v4.0 正确
- 产品定位：1 人 MCN 公司 = 帮用户建立自己的 1 人品牌

---

## [3.0] - 2026-06-21

### ⚠️ v3.0 · 已被昴君纠正

错位：32 Skill 框架 + 9 赛道 + 三轨定价（与实际产品不符）

---

## [2.0.3] - 2026-06-04

### 🔥 CRITICAL FIX · 4 个核心文档重写

v1 大量使用**虚构 Hermes 命令**（`hermes agents list` / `hermes feishu create-table` / `hermes gateway setup feishu` / `hermes flywheel load` 等），v2.0.3 全部替换为真实 Hermes Agent 0.15.1 命令。

### Added
- **16 个 Hermes Skill 落地**（`one-mcn-skills/<name>/SKILL.md` × 16）
  - A 链：a1-scan / a2-decompose / a3-reverse / a4-script / a5-redline / a6-cover / a7-tts
  - B 链：b1-publish / b2-data / b3-report
  - C 链（M2 stub）：c1-service / c2-moments / c3-tags / c4-fission
  - 守护：d1-sop（每 5 分钟心跳）/ g0-guard（Day 3/5/7 熔断）
- **VPS 一键部署脚本** `ONE-MCN-DEPLOY.sh` v2.0.3
- **7 问题完整回答** `ONE-MCN-SUMMARY-2026-06-04.md`

### Changed
- `ONE-MCN-INSTALL.md` v1.0 → **v2.0.3**（30+ 处命令修正）
- `ONE-MCN-M1-SOP.md` v1.0 → **v2.0.3**（20+ 处命令修正，新增 §14 变更对照表）
- `ONE-MCN-AGENT-PROMPTS.md` v2.0.2 → **v2.0.3**

---

## [1.0] - 2026-05-10

### 🎉 v1.0 · 项目初始化

- 初始化 AI 上下文
- 完成全仓扫描：前端 + API + 数据 + 节点内容
- 生成根级 CLAUDE.md（含 Mermaid 模块图）
- 创建 OPC 节点百科主站（57 节点 + 76 API + admin + 微信落地）