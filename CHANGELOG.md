# Changelog

## [2.0.3] - 2026-06-04

### 🔥 CRITICAL FIX · 4 个核心文档重写
v1 大量使用**虚构 Hermes 命令**（`hermes agents list` / `hermes feishu create-table` / `hermes gateway setup feishu` / `hermes flywheel load` 等），v2.0.3 全部替换为真实 Hermes Agent 0.15.1 命令。

### Added
- **16 个 Hermes Skill 落地**（`one-mcn-skills/<name>/SKILL.md` × 16）
  - A 链：a1-scan / a2-decompose / a3-reverse / a4-script / a5-redline / a6-cover / a7-tts
  - B 链：b1-publish / b2-data / b3-report
  - C 链（M2 stub）：c1-service / c2-moments / c3-tags / c4-fission
  - 守护：d1-sop（每 5 分钟心跳）/ g0-guard（Day 3/5/7 熔断）
- **VPS 一键部署脚本** `ONE-MCN-DEPLOY.sh` v2.0.3（16 Skill 验证 + 16 cron 创建 + 飞书通知）
- **7 问题完整回答** `ONE-MCN-SUMMARY-2026-06-04.md`

### Changed
- `ONE-MCN-INSTALL.md` v1.0 → **v2.0.3**（30+ 处命令修正）
- `ONE-MCN-M1-SOP.md` v1.0 → **v2.0.3**（20+ 处命令修正，新增 §14 变更对照表）
- `ONE-MCN-AGENT-PROMPTS.md` v2.0.2 → **v2.0.3**（从 15 Agent yaml → 16 SKILL.md 索引 + A4 10 变体完整保留）
- `ONE-MCN-DEPLOY.sh` v1.0 → **v2.0.3**（真实 `hermes cron create` 命令）
- `README.md` v2.0.2 → **v2.0.3**（更新文档矩阵 + 标记 v1 → v2.0.3 重大变更）

### Known Limitations
- Mac 本地 `hermes` CLI 损坏（ModuleNotFoundError），暂未修复——M1 不需要本地 Hermes
- VPS SSH 密钥不在蕾姆手里，无法自动推送 16 Skill 到 VPS，需昴君提供密钥或手动跑 `DEPLOY.sh`
- 飞书 5 表需**手动**在飞书网页创建（Hermes Agent 无 `create-table` 命令）

## [2.0.2] - 2026-06-04

### Added
- **ONE-MCN 一人 MCN 飞轮架构**：v2.0.1 → v2.0.2 升级
- **Hermes Agent 后台框架**（NousResearch 178K★, MIT）：12 Agent 7×24 业务执行
- **HermesPet 前台伴侣**（Basion Wang, 200+★, Apache 2.0）：Mac 刘海灵动岛 + 5 引擎 + 8 对话
- **8 平台 gateway 调度**：飞书/微信/视频号/抖音/小红书/Telegram/Discord/Slack
- **5 类爆款公式**：A 反常识 / B 真实案例 / C 反差 / D 副业第 1 步 / E 反 AI 渣
- **2 套人设**：阿泽黑客 + 燃木 AI 渣爆
- **G0/G1 早期熔断守卫**：Day 3 + Day 5 + Day 7
- **24h SOP 引擎**：10 时段自动调度
- **M1 7 天 SOP 操作手册**（已砍范围 80%）
- **一键部署脚本** `ONE-MCN-DEPLOY.sh`（VPS 9 步）
- **12 Agent 15 个 prompt 模板**（5 公式 × 2 人设 = 10 A4 变体）
- **P1 安装命令清单** `ONE-MCN-INSTALL.md`

### Changed
- **架构定位**：OPC 百科 + ONE-MCN **飞轮关系**（不是主从）
- 飞书降级：从调度中心 → 业务数据库（5 表）
- README.md 重写：v2.0.2 双模块（OPC + ONE-MCN）

### Three-Perspective Review
- β 9.0/10（产品）：飞轮定位精准，文档完整
- α 3.5/10（VC）：现在 0 收入，需要 7 天内出真数据
- **综合 6.3/10**（执行中逐步提升）

## [2.0.1] - 2026-06-04

### Added
- `ONE-MCN-README-v2.0.md`：项目总入口
- 底层框架升级：飞书 → Hermes Agent 20+ 平台 gateway
- 归档 v1.0 → `ONE-MCN-HARNESS-v1.0-archived.md`

## [1.0.0.0] - 2026-05-13

### Added
- **57节点完整体系**: 8阶段57节点覆盖OPC创业全流程
- **16个节点HTML**: 核心功能2/3、数据展示、支付集成、测试修复、上线全流程
- **10个节点2026时效性更新**: 原型设计、MVP范围、后端连接、获客、广告、安全等
- **28个Content-drafts**: 覆盖已识别的内容缺口
- **完整性测试套件**: p0-completeness.test.js (10项160+检查)
- AI Content Engine: DeepSeek V4 API integration
- OPC适配度测试: AI-powered quiz system

### Changed
- 从21节点升级为57节点8阶段体系
- 统一API_KEY环境变量

### Fixed
- 跨节点链接slug修正
- selectedService状态重置

### Known
- 节点37: 跳转至 opc.taomyst.top
- 节点02: 待2026内容注入
