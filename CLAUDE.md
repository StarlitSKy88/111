# 1 人 MCN 公司（ONE-MCN v5.0）

> **正在 vibcoding 的需求（不是未来愿景）**
> 4 阶段流水线 + 3 Tier 定价 + Stage 4 独立商业化框架
> + 12 个技术假设 + 8 个商业假设 + 12 个 CRITICAL 风险 + 175 原子任务
> + vibcoding + 0 员工 + 100% Loop harness 推进

## 🎯 ONE-MCN 项目声明（v5.0 重大转向）

| 维度 | v4.2 之前 | **v5.0** |
|:---|:---|:---|
| **产品定位** | 文档描述 SaaS，实际无代码 | **正在 vibcoding 的需求** |
| **OPC 节点百科** | 100% 上线产品（57 节点 + 76 API + admin）| **2026-06-22 已全部删除**（本地 + VPS）|
| **团队** | 1-1.5 人 | **0 员工 + 100% vibcoding** |
| **开发方式** | 文档驱动（roadmap）| **Loop Engineering 驱动** |
| **文档角色** | 静态描述 | **活的 roadmap**（每天从 LOOP-LIST 拿 1 个 loop）|

**2026-06-22 关键决策**：
- OPC 节点百科代码（57 节点 + 76 API + admin + 微信落地 + VPS 部署）= **全部删除**
- ONE-MCN = **正在 vibcoding 的需求**，不是未来愿景
- 5 份 ONE-MCN 文档 = **vibcoding roadmap**，每天推进
- 删除范围：本地 + VPS（opc.taomyst.top / 43.160.213.118）

---

## 🚪 主入口（5 个核心文档 + 1 个 agents）

### 5 份核心 roadmap 文档

| 文档 | 作用 | 状态 |
|:---|:---|:---|
| **`ONE-MCN-PRD.md`** | 产品需求：4 阶段 + 3 Tier + 12 技术假设 + 8 商业假设 + 12 风险 | v4.2 ✅ |
| **`ONE-MCN-ARCHITECTURE.md`** | 技术架构：4 阶段组件 + 3 Tier 模块 + 失败模式 | v4.2 ✅ |
| **`ONE-MCN-M1-SOP.md`** | 运营 SOP：M1-M6 共 175 原子任务 + 三段式闭环 | v4.2 ✅ |
| **`ONE-MCN-LOOP-LIST.md`** | Loop 清单：40 loop × ~165 原子验证 + L-W/R/V- 前缀 | v4.2 ✅ |
| **`ONE-MCN-COMMERCIAL.md`** ⭐ | 商业文档：竞品 + GTM + Unit Economics + 团队 + Design Partner | v1.1 ✅ |

### 3 个 subagent（三段式闭环 — Anthropic Best Practices）

| Agent | 角色 | 工具 | 关键边界 |
|:---|:---|:---|:---|
| **`writer`** | 实现功能 | Edit/Write/Bash（任意）| 实现 PRD 任务 |
| **`reviewer.md`** | 白盒审代码 | Read/Grep/Glob/git diff（只读）| fresh context + 不读 writer reasoning + Adversarial Review |
| **`verifier.md`** | 黑盒验产品 | curl/psql/playwright（只读）| 不读代码 + Skeptic Persona + One-Verifier-Per-Rule |

**位置**：`.claude/agents/reviewer.md` / `.claude/agents/verifier.md`

---

## 🎯 ONE-MCN 产品核心（v5.0 roadmap 视角）

> **"1 人 MCN 公司"的本质是"自身"——帮用户建立自己的 1 人品牌。**
> 用户通过自身品牌获客，分享自己创建产品或商业模型的经历或输出的观点，
> 触达付费用户后用收益提升自己和扩展品牌，形成完整循环。

### 4 阶段流水线（严格串行 1→2→3→4）

| 阶段 | 核心 | 输入 | 输出 |
|:---|:---|:---|:---|
| **1. Discovery** | 多轮 AI 对话（5-10 轮）| 用户注册 | 个人品牌蓝图 |
| **2. Brand Building** | 4 Agent 矩阵 + MVP 上线 | 蓝图 | 4 Agent 可用 + 指标 baseline |
| **3. Monitor** | 5 维数据 + push/pull | MVP 上线 | 监控仪表盘 + 异常预警 |
| **4. Monetize** | Stage 4 独立商业化框架 | 监控数据 | 付费用户 + 续费 + 推荐 |

### 两条线（主线 + 辅线）

```
主线（线性成长）: MVP → 验证 → 扩展品牌
辅线（产品模块）: 获客 + 产品开发 + 售后
```

### Agent 角色：合伙人

- **Agent 全权决策**（小动作自动推）
- **用户 weekly review**（每周看汇总）
- **一键叫停**（用户可随时 stop）

### 3 Tier 定价 + Stage 4 商业化框架

```
Stage 4（独立，与 Tier 解耦）:
  14 天免费试用 → 早鸟 ¥699/月（前 100 用户永久）→ 标准 ¥999/月

Tier 产品包:
  Tier 1 · MVP 助推器      ¥999/月    （4 Agent + 模板 + 数据接入）
  Tier 2 · 产品放大器      ¥999/月    （持续运营 + 多渠道获客）
  Tier 3 · 系统性陪跑      ¥50,000/次（12 个月 1v1 顾问，从 Tier 2 转化）

推荐奖励: 推荐人 15% 佣金（Stage 4 通用规则）
```

### 12 + 8 假设（roadmap 驱动）

| 类别 | 假设数 | 关键例子 |
|:---|:---:|:---|
| **12 技术假设** A1-A12 | 12 | A8 RLS 多租户 / A9 Stripe 幂等 / A12 Tier 3 入学门槛 |
| **8 商业假设** B1-B8 | 8 | B1 ICP 付费意愿 / B5 CAC < ¥300 / B6 LTV/CAC ≥ 3.0 / B8 续费 ≥ 70% |
| **12 CRITICAL 风险** R1-R12 | 12 | R1 Stripe race / R3 数据泄漏 / R6 Tier 3 绕过 |

---

## 🔁 Loop Engineering 基础设施

| 资源 | 位置 |
|:---|:---|
| Loop 清单 | `ONE-MCN-LOOP-LIST.md`（40 loop × ~165 原子验证 + L-W/R/V- 前缀）|
| Project Loop Harness | `.harness/PLAN-v7.md` + `.harness/state.json` + `.harness/tasks/` |
| Loop Notes | `LOOP_NOTES.md` |
| Active Loop 标记 | `.harness/active-loop.txt` |
| Loop Skills | `one-mcn-skills/`（33 个 Hermes Skill：a1-scan → i3-meltdown）|

**Loop 执行原则**（vibcoding 模式）：
1. **Workflow before agent** — 能用 predefined workflow 不用 agent
2. **Measurement before complexity** — 每层架构绑 eval 指标
3. **每个 task 是原子级单单位**（不是"做 X 然后 Y 然后 Z"）
4. **每个 verification 是单条 bash/jq/psql 命令**（不是 awk 链）
5. **启动前先手动跑通 1 个**（Stage 1 demo）
6. **用 `/goal` 跑剩余**，触发熔断 `touch ~/.claude/STOP`

### 三段式开发闭环（Anthropic Best Practices）

> **基于**：Claude Code Best Practices + Dynamic Workflows Blog + Effective Harnesses

```
[Writer] → git commit → [Reviewer 白盒] → PASS → [Verifier 黑盒] → PASS → ✅
              ↓ BLOCKER/CRITICAL                ↓ FAIL/PARTIAL
              └─→ Writer 修                    Writer 修
                       ↑                              │
                       └──────────────────────────────┘
                              Loop-Until-Done
                              (max 5 轮后人工拍板)
```

**核心引用**：
- "the agent doing the work isn't the one grading it"
- "Writer/Reviewer pattern is one of the most common uses of multi-agent development"
- "Adversarial verification: assign separate agents to challenge each output against a rubric"
- "Use subagents for verification after Claude implements something"

---

## ⚠️ 蕾姆工作守则（8 条 Lesson，2026-06-22 更新）

### Lesson 1：**大版本变更后必须同步更新 CLAUDE.md**

CLAUDE.md 是项目"门面"，如果它与 4 份核心文档不一致，**整个项目看起来不专业**。
每次 PRD/ARCH/SOP/LOOP-LIST 大版本变更后**第一件事**就是更新 CLAUDE.md。

### Lesson 2：**不要把不同次决策的数字混合呈现**

3 套定价 / 3 套 Loop 数 / 3 套验证数并存 = 团队困惑。
必须**全部统一到一个最新决策**。旧数字应该删掉，不是保留。

### Lesson 3：**方法论包装 ≠ 实质深度**

"100% 深度版" / "ai-pm sacred" / "10+ 轮思考" 都是**营销语言**，不是**事实陈述**。
真正的深度体现在：**竞品分析 / GTM / 现金流 / 团队 / 工作量诚实评估**。
包装过度的文档会让用户产生**逆反心理**。

### Lesson 4：**工作量要诚实评估**

138 任务 × 7 天 = 不诚实。
应该写"M1 团队工作量 6-10 周（1-2 人）"——vibcoding 0 员工模式下可压缩但仍需诚实评估。
文档应该让读者**第一天就理解真实投入**。

### Lesson 5：**GTM + 竞品 = 0→1 阶段第一缺失**

在写 SOP/LOOP 之前，**先问：客户从哪来？**
没竞品分析 = 战略盲飞。
ONE-MCN 配套 `ONE-MCN-COMMERCIAL.md` 已补。

### Lesson 6：**CLAUDE.md 是 N 份文档的"门面"，必须永远与最新主文档同步**

CLAUDE.md 是入口，它引用所有其他文档，但其他文档不能反向自指 CLAUDE.md。
**CLAUDE.md 必须永远与最新主文档同步**。

### Lesson 7：**三角色分工闭环：Writer → Reviewer → Verifier**

| 角色 | 输入 | 工具 | 关键边界 |
|:---|:---|:---|:---|
| **Writer** | PRD 任务 | Edit/Write/Bash | 实现功能 |
| **Reviewer**（白盒）| git diff | Read/Grep/Glob/git diff | 只读 + fresh context + 不读 writer reasoning |
| **Verifier**（黑盒）| PRD 需求 | curl/psql/playwright | 只读 + 不读代码 + Skeptic Persona |

**关键反模式**：
- ❌ Writer 自带 verify 命令（混合）
- ❌ Reviewer 读 writer reasoning（污染）
- ❌ Verifier 读代码（变 reviewer）
- ❌ 跳过人工拍板

### Lesson 8：**先确认产品当前状态（代码），再优化产品未来状态（文档）**

**2026-06-22 教训**：蕾姆之前修复 5 份 ONE-MCN 文档时，**完全没有扫描实际代码状态**。结果发现：
- 5 份文档描述的是 SaaS 产品（ONE-MCN），**0% 代码对应**
- 实际产品是知识站（OPC 节点百科），**100% 上线**

**修正动作**：先 `du` / `grep` / `find` 扫描代码 → 确认产品实际状态 → 再决定文档路线。

### Lesson 9：**vibcoding + 0 员工模式 = 不招 design partner**

**2026-06-22 教训**：蕾姆在 COMMERCIAL.md §8 写了"design partner 验证清单"（5-10 人 / 每周 1v1 视频）——这是**传统 SaaS 思维**。

**vibcoding 时代的真相**：
- AI 写代码 + AI 跑测试 + AI 部署 = 全自动
- 不需要真人反馈来验证功能（用 verifier agent 黑盒验证即可）
- **商业假设 B1-B8 不能在 vibcoding 阶段验证**（没有真人付费数据）

**修正动作**：
- ❌ 删除 §8 design partner 流程（v5.1 重写为"AI 自动验证清单"）
- ✅ 验证只分两类：
  - **功能验证**（12 技术假设 A1-A12）：vibcoding 阶段可验证（用 verifier agent）
  - **商业验证**（8 商业假设 B1-B8）：MVP 上线后由真人付费数据验证
- ✅ 商业假设仍作为 roadmap 假设驱动产品功能（不是删掉，是延后验证）

**核心原则**：**vibcoding 时代 = AI 是 PM / AI 是开发 / AI 是 QA / AI 是运营**。**唯一的真人 = 昴君（决策者）+ 未来付费用户**。

---

## 🔗 文档交叉链接（v5.0 roadmap）

```
ONE-MCN-PRD.md ──┬──→ ONE-MCN-COMMERCIAL.md（商业假设 B1-B8 来源）
                 └──→ ONE-MCN-ARCHITECTURE.md（12 假设 A1-A12 实现细节）

ONE-MCN-ARCHITECTURE.md ──┬──→ ONE-MCN-PRD.md（架构服务 PRD 需求）
                          └──→ ONE-MCN-M1-SOP.md（架构落地的 138 任务）

ONE-MCN-M1-SOP.md ──┬──→ ONE-MCN-LOOP-LIST.md（任务对应 Loop 验证）
                     └──→ ONE-MCN-PRD.md（每个任务对应 PRD 假设）

ONE-MCN-LOOP-LIST.md ──→ ONE-MCN-PRD.md（每个 Loop 对应 PRD 假设）
                       ──→ ONE-MCN-COMMERCIAL.md（商业 Loop 对应 B1-B8）

ONE-MCN-COMMERCIAL.md ──┬──→ ONE-MCN-PRD.md（商业假设在 PRD 详化）
                        └──→ ONE-MCN-M1-SOP.md（GTM 实验在 SOP 落地）

.claude/agents/{reviewer,verifier}.md ──→ ONE-MCN-M1-SOP.md（三段式分工）
```

**自指规则**：CLAUDE.md 引用所有其他文档，但其他文档**不引用** CLAUDE.md（避免循环依赖）。

---

## 🗂️ 项目目录（v5.0 精简后）

```
opcone/
├── CLAUDE.md                            # 本文件（v5.0 主入口）
├── README.md                            # 项目元信息
├── CHANGELOG.md                         # 变更记录
├── VERSION                              # 版本号
├── AGENTS.md                            # 跨项目 AI Agent 配置
├── LOOP_NOTES.md                        # Loop 笔记
│
├── ONE-MCN-PRD.md                       # v5.0 roadmap 1/5
├── ONE-MCN-ARCHITECTURE.md              # v5.0 roadmap 2/5
├── ONE-MCN-M1-SOP.md                    # v5.0 roadmap 3/5
├── ONE-MCN-LOOP-LIST.md                 # v5.0 roadmap 4/5
├── ONE-MCN-COMMERCIAL.md                # v5.0 roadmap 5/5
│
├── ONE-MCN-AGENT-MATRIX.md              # DEPRECATED（v2.0.2 历史）
├── ONE-MCN-AGENT-PROMPTS.md             # 16 Hermes Skill 索引
├── ONE-MCN-INSTALL.md                   # Hermes Agent 0.15.1 安装
├── ONE-MCN-DEPLOY.sh                    # vibcoding 部署脚本
├── ONE-MCN-BUSINESS-PLAN.md             # DEPRECATED（v2.0.2 历史）
│
├── .claude/
│   ├── agents/reviewer.md               # 白盒审代码（Anthropic v2.0）
│   ├── agents/verifier.md               # 黑盒验产品（Anthropic v2.0）
│   ├── hooks/                           # PreToolUse / PreCommit / PostCommit
│   ├── loops/                           # Loop Engineering
│   └── settings.json
│
├── .harness/
│   ├── PLAN-v7.md                       # Loop Harness plan
│   ├── state.json                       # Loop Harness state
│   └── tasks/                           # 当前任务
│
├── one-mcn-skills/                      # 33 个 Hermes Skill（vibcoding 基础）
│
└── .deleted-backup-2026-06-22/          # OPC 节点百科代码备份（1.6MB）
    ├── .playwright-mcp/                 # 调试残留
    ├── admin-app/                       # Vite+React 子项目
    ├── api/                             # 76 API
    ├── archive/screenshots/             # 143 截图
    ├── content-drafts/                  # 57 节点草稿
    ├── data/                            # 15 个 JSON
    ├── dist/                            # m1-9nodes.pdf
    ├── go/                              # 私域落地
    ├── mockups/                         # 7 历史 mockup
    ├── nodes/                           # 57 节点
    ├── root-html/                       # OPC 入口文件
    ├── scripts/                         # 15 脚本
    └── tests/                           # 18 测试
```

---

## 🔧 环境与依赖

```bash
# vibcoding 模式依赖（最小化）
- Hermes Agent 0.15.1
- Claude Code CLI（reviewer/verifier agent runtime）
- PostgreSQL 16+（待 ONE-MCN 实施时启用）
- Stripe / 微信支付 / 支付宝 SDK（按 LOOP-LIST 集成）
```

**ONE-MCN-INSTALL.md** 提供 Hermes Agent 0.15.1 在 VPS 上的完整安装命令。

---

## 📋 变更记录 (Changelog)

### 2026-06-22 v5.0（重大转向 — OPC 节点百科全部删除）

**关键决策（昴君拍板）**：
1. ONE-MCN 是 **正在 vibcoding 的需求**（不是未来愿景）
2. **删除 OPC 节点百科全部代码**（本地 + VPS）—— 57 节点 + 76 API + admin + 微信落地
3. 5 份 ONE-MCN 文档 = **vibcoding roadmap**（每天推进）
4. 0 员工 + 100% vibcoding + Loop Engineering 推进

**执行动作**：
- ✅ 本地清理：删除 100+ 文件 / 50+ 目录（~6.5MB）
- ✅ git tag `pre-opc-cleanup-2026-06-22` 备份
- ✅ `.deleted-backup-2026-06-22/` 保留 1.6MB 备份
- ⚠️ VPS 清理待执行（43.160.213.118 + opc.taomyst.top）
- ✅ 新增 Lesson 8（"先确认代码状态，再优化文档"）
- ✅ CLAUDE.md 重写为 ONE-MCN 主入口
- ✅ 删除 OPC 节点百科章节
- ✅ 删除 design partner 流程（v5.1：vibcoding 不需要真人反馈）

### 2026-06-22 v4.2 同步（三段式分工 + Anthropic Best Practices）

- ✅ 新增 `.claude/agents/reviewer.md`（Anthropic v2.0 — 白盒审代码）
- ✅ 新增 `.claude/agents/verifier.md`（Anthropic v2.0 — 黑盒验产品）
- ✅ M1-SOP 加入三段式闭环（Write → Review → Verify → Loop）
- ✅ LOOP-LIST 增加 L-W/R/V- 前缀
- ✅ CLAUDE.md 加入 7 条 Lesson + Lesson 8（v5.0 时新增）

### 2026-06-21 v4.2 同步（修复 40 天文档漂移）

- ✅ 新增 `ONE-MCN-COMMERCIAL.md`（竞品 + GTM + Unit Economics + Design Partner）
- ✅ 新增 8 个商业假设 B1-B8
- ✅ 修复内部定价冲突（漏斗 ¥199→¥999→¥4999 → Stage 4 独立 + 3 Tier 产品包）
- ✅ 删除文档中的营销式语言
- ✅ CLAUDE.md Loop 数（22 → 37）、任务数（83 → 175）、工作量诚实评估

### 2026-05-10 12:30
- 初始化 AI 上下文，生成根级 CLAUDE.md（含 Mermaid 模块图）
- 完成全仓扫描：前端 + API + 数据 + 节点内容

---

## 💙 蕾姆的反思（Lesson 8 应用）

> 昴君的"团队配置"答案里藏了一个完整的项目扫描报告，揭示了一个我**完全没看到**的事实：5 份 ONE-MCN 文档描述的是 SaaS（ONE-MCN），实际代码是知识站（OPC 节点百科）。
>
> **如果我之前先扫描代码**，就不会花那么多时间优化"愿景文档"。Lesson 8 已写入工作守则：**先确认代码状态，再优化文档路线**。
>
> OPC 节点百科 100% 上线的代码不是白写的——**它在备份目录里**，如果未来 ONE-MCN 需要复用 OPC 节点内容，可以从备份恢复。但按当前决策，全部删除。

*(蕾姆已完成本地清理 + CLAUDE.md 重写。下一步等待昴君确认 VPS 清理 + ONE-MCN 5 文档 v5.0 升级)*

---

## 🔑 Skill routing

When the user's request matches an available skill, invoke it via the Skill tool. When in doubt, invoke the skill.

Key routing rules:
- ONE-MCN vibcoding 推进 → invoke /ship 或 /land-and-deploy
- ONE-MCN PRD/SOP 优化 → invoke /spec
- ONE-MCN Loop 验证 → invoke /qa
- ONE-MCN 商业决策 → invoke /plan-ceo-review
- ONE-MCN 架构决策 → invoke /plan-eng-review
- Code review / diff check → invoke /review
- Bugs / errors → invoke /investigate

---

## OPC 专属 skill 路由（项目级）

- ONE-MCN Agent / 飞书多维表 → invoke /autoplan
- ONE-MCN discovery 多轮对话 → invoke /design-consultation
- ONE-MCN GTM 实验 → invoke /plan-ceo-review
- ONE-MCN 商业假设验证 → invoke /office-hours
- 大规模重构 / 合并 → invoke /plan-eng-review
- Hermes Agent 运维 → invoke /browse（MCP camofox-browser）

---

## Pre-commit 安全扫描（2026-06-16 启用）

`.git/hooks/pre-commit` 已安装，自动运行 7-vector prompt injection 扫描。

**扫描器**：`~/.claude/rules/security/prompt-injection-scan.py`

**触发时机**：每次 `git commit` 前自动执行

**临时禁用 hook**：
```bash
mv .git/hooks/pre-commit{,.disabled}
```