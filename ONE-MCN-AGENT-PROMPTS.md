# ONE-MCN Agent Prompt 索引 v2.0.3

> **作者**：蕾姆（Rem）for 昴君
> **更新日期**：2026-06-04（v2.0.3 重写：从 15 个独立 Agent yaml 文件 → 16 个 Hermes Skill 索引）
> **配套**：`one-mcn-skills/<name>/SKILL.md` × 16 + `ONE-MCN-DEPLOY.sh`
> **核心变更**：v1.0 的 `~/.hermes-agent/agents/one-mcn/*.yaml` **不存在**。Hermes Agent 0.15.1 用 `~/.hermes/skills/<name>/SKILL.md`（YAML frontmatter + Markdown 正文）。

---

## 0. v1.0 → v2.0.3 架构变更

| v1.0 概念 | v2.0.3 真实实现 |
|:---|:---|
| 15 个 Agent yaml 文件 | **16 个** SKILL.md（YAML frontmatter + Markdown 正文）|
| 路径 `~/.hermes-agent/agents/one-mcn/*.yaml` | `~/.hermes/skills/one-mcn/<name>/SKILL.md` |
| `model: minimax/minimax-m2.7` | Hermes cron 任务不锁模型，按 `~/.hermes/config.yaml` 的 default LLM |
| `schedule: "06:30, 12:30, 18:30"` | `hermes cron create "0 6,12,18 * * *" "..."` |
| `cost: ¥100/月` | 真实 API 调用计费，由 LLM Provider 决定 |
| `hermes agents list` | `ls ~/.hermes/skills/one-mcn/` + `hermes cron list` |
| `hermes agents run a1-scan` | `hermes cron run a1-scan` |

> 💙 **保留价值**：v1.0 的 **A4 脚本生成 10 变体 Prompt 模板**（5 公式 × 2 人设）是本项目最有用的"内容底座"。已**完整保留**在 §A4。

---

## 1. 16 个 Skill 索引（**主目录**）

| # | Skill | SKILL.md 路径 | 核心职责 | Cron |
|:---:|:---|:---|:---|:---|
| 1 | **A1 赛道扫描** | `one-mcn-skills/a1-scan/SKILL.md` | 30 账号 × 6h 扫描爆款池 | `0 */6 * * *` |
| 2 | **A2 爆款拆解** | `one-mcn-skills/a2-decompose/SKILL.md` | Top 10 爆款 5 维度拆解 | `0 8 * * *` |
| 3 | **A3 反向需求** | `one-mcn-skills/a3-reverse/SKILL.md` | 评论反向 30 选题 | `0 9 * * *` |
| 4 | **A4 脚本生成** | `one-mcn-skills/a4-script/SKILL.md` | 10 变体脚本（5 公式 × 2 人设）| `0 10 * * *` |
| 5 | **A5 红线审查** | `one-mcn-skills/a5-redline/SKILL.md` | 7 红线 + 200 灰产词审查 | `30 10 * * *` |
| 6 | **A6 配图封面** | `one-mcn-skills/a6-cover/SKILL.md` | 3 候选封面（Ma 极简）| `0 11 * * *` |
| 7 | **A7 TTS 配音** | `one-mcn-skills/a7-tts/SKILL.md` | 阿泽 male_calm + 燃木 female_sarcastic | `30 11 * * *` |
| 8 | **B1 智能发布** | `one-mcn-skills/b1-publish/SKILL.md` | ffmpeg 合成 + 视频号 API | `30 14 * * *` |
| 9 | **B2 数据采集** | `one-mcn-skills/b2-data/SKILL.md` | 4 平台 6 指标采集 | `0 16,18,20,22 * * *` |
| 10 | **B3 复盘报告** | `one-mcn-skills/b3-report/SKILL.md` | 日报 + 5 页周报 | `0 6 * * *` / `0 22 * * 0` |
| 11 | **C1 私域客服** | `one-mcn-skills/c1-service/SKILL.md` | 7 句话 SOP（M2 启用）| `0 9 * * *` |
| 12 | **C2 朋友圈** | `one-mcn-skills/c2-moments/SKILL.md` | 5 类文案（M2 启用）| `0 10 * * *` |
| 13 | **C3 标签管理** | `one-mcn-skills/c3-tags/SKILL.md` | 4 维标签 + 漏斗（M2 启用）| `0 23 * * *` |
| 14 | **C4 裂变追踪** | `one-mcn-skills/c4-fission/SKILL.md` | 3 人邀请 = 1 报告（M2 启用）| `0 22 * * *` |
| 15 | **D1 SOP 引擎** | `one-mcn-skills/d1-sop/SKILL.md` | 12 cron 心跳 + 飞书告警 | `*/5 * * * *` |
| 16 | **G0 早期熔断** | `one-mcn-skills/g0-guard/SKILL.md` | Day 3/5/7 红线守卫 | `30 23 * * *` |

> **如何运行**：`hermes cron run <skill-name>` 立即执行单个 Skill。
> **如何看输出**：`cat /tmp/<skill-name>-*.log` 或在飞书对应表查数据。

---

## 2. SKILL.md 模板规范（**所有 16 个 Skill 的统一结构**）

```markdown
---
name: <skill-name>
description: "<一句话用途>"
version: 1.0.0
author: 蕾姆 (Rem) for ONE-MCN
license: MIT
dependencies: [hermes-llm, hermes-cron]
platforms: [linux, macos]
metadata:
  hermes:
    tags: [one-mcn, ...]
    related_skills: [a1-scan, b2-data]
    cron_compatible: true
    deliver_targets: [local, feishu, hermespet-pin]
    priority: critical
---

# <Skill 中文名>

## 1. 角色定义
[单职责 + 人设 + 核心理念]

## 2. 输入
[参数 + 默认值]

## 3. 执行步骤
[Step 1-N，每个 Step 含可执行 bash / Python]

## 4. 输出 Schema
[JSON 结构]

## 5. 红线
[不能做的事 + 触发后的处理]

## 6. 调度
[hermes cron create 命令]

## 7. 故障处理
[异常 → 兜底]
```

---

## A. 内容生产链（A1-A7 · 7 个 Skill）

### A1 · 赛道扫描 → `one-mcn-skills/a1-scan/SKILL.md`

**核心 Prompt**（在 SKILL.md 的"执行步骤"里）：
- 角色：沉默的记录者
- 输入：30 个视频号账号清单
- 执行：每 6h 调 API 拉 Top 10 → 互动率过滤 → 写入爆款池
- 成本：~¥0（视频号 API 免费）

### A2 · 爆款拆解 → `one-mcn-skills/a2-decompose/SKILL.md`

**5 维度拆解**：
1. 钩子类型（A/B/C/D/E）
2. 3 秒画面（首帧截图 + 字幕）
3. 情绪曲线（多巴胺/焦虑/共鸣 3 峰值）
4. CTA（关注/点赞/加微/评论）
5. 痛点 Top 5（评论区高赞关键词）

### A3 · 反向需求 → `one-mcn-skills/a3-reverse/SKILL.md`

**核心机制**：抓 Top 30 爆款评论 → 提取"用户没被满足的需求" → 生成 30 反向选题。

### A4 · 脚本生成（**5 公式 × 2 人设 = 10 变体**）

> ⚠️ **核心内容底座，完整保留 v1.0 的 10 变体 Prompt**：

#### 公式 A · 反常识数据（阿泽黑客版）
```markdown
你是高冷黑客阿泽。语气简洁犀利，少废话多数据。
基于选题[X]，创作 30 秒口播稿：
- 前 3 秒抛反常识数据（"99% 的人不知道..."）
- 用 3 个关键词：[K1][K2][K3]
- 末句加 1 个具体行动（"评论区扣 1 我发你..."）
```

#### 公式 A · 反常识数据（燃木 AI 渣爆版）
```markdown
你是反 AI 渣导师燃木。语气接地气，嘲讽但真诚。
基于选题[X]，创作 30 秒口播稿：
- 前 3 秒抛反常识数据（"AI 渣课程天天教这些..."）
- 揭穿 1 个 AI 渣套路
- 末句加价值锚（"我做了 X 天才明白..."）
```

#### 公式 B · 真实案例（阿泽黑客版）
```markdown
基于真实案例[身份+工具+数字+结果]，创作 60 秒口播稿：
- 前 3 秒抛身份反差（"中专生 10 天做出 AI 工具..."）
- 拆解 3 个具体步骤
- 末句加钩子引流（"完整 SOP 在简介..."）
```

#### 公式 B · 真实案例（燃木 AI 渣爆版）
```markdown
基于真实案例[被割韭菜→醒悟→逆袭]，创作 60 秒口播稿：
- 前 3 秒抛"被 AI 渣坑"经历
- 拆解 3 个反套路动作
- 末句加共鸣锚（"如果你也被坑过，评论区扣 2..."）
```

#### 公式 C · 反差对比（阿泽黑客版）
```markdown
基于常见误解[X]，创作 30 秒口播稿：
- 前 3 秒用"你以为[A]，其实[B]"
- 列出 3 个反差点
- 末句加 1 个反问（"你属于哪一种？"）
```

#### 公式 C · 反差对比（燃木 AI 渣爆版）
```markdown
基于"AI 渣鼓吹 vs 真实情况"对比，创作 30 秒口播稿：
- 前 3 秒用"AI 渣说[A]，真相是[B]"
- 列出 3 个揭穿点
- 末句加价值锚（"看清真相少走 3 年弯路..."）
```

#### 公式 D · 副业第 1 步（阿泽黑客版）
```markdown
基于副业方向[X]，创作 30 秒实操稿：
- 前 3 秒锁定"想做[副业]"人群
- 给出"今晚就做"的具体动作（1 个工具 + 1 步操作）
- 末句加微信引流（"加微信领完整模板..."）
```

#### 公式 D · 副业第 1 步（燃木 AI 渣爆版）
```markdown
基于"AI 渣不会教你的副业第 1 步"，创作 30 秒实操稿：
- 前 3 秒用"AI 渣不会告诉你..."
- 给出"今晚就做"的具体动作
- 末句加价值锚（"我整理了 10 个副业第 1 步模板..."）
```

#### 公式 E · 反 AI 渣（阿泽黑客版）
```markdown
基于渣套路[X]，创作 60 秒揭秘稿：
- 前 3 秒抛"3 个 AI 渣套路"
- 拆解每个套路的骗术（截图+对比）
- 末句加"看清真相"价值锚
```

#### 公式 E · 反 AI 渣（燃木 AI 渣爆版）
```markdown
基于"AI 渣 100 种骗术"，创作 60 秒揭秘稿：
- 前 3 秒抛"我被割过 X 万"
- 拆解 3 个最常见 AI 渣套路
- 末句加共鸣锚（"如果你也被割过..."）
```

### A5 · 红线审查 → `one-mcn-skills/a5-redline/SKILL.md`

**7 红线 + 200 灰产词**：每日 10:30 自动审查昨日所有待发脚本，触发即飞书 + HPet + Telegram 三通道告警。

### A6 · 配图封面 → `one-mcn-skills/a6-cover/SKILL.md`

**3 候选/Ma 极简**：900×900 视频号规格，3 个风格选项，Ma 間设计（朱红强调色 ≤ 1 处）。

### A7 · TTS 配音 → `one-mcn-skills/a7-tts/SKILL.md`

**2 套声线**：
- 阿泽：male_calm，1.1x 语速，冷静
- 燃木：female_sarcastic，1.2x 语速，戏谑

---

## B. 运营执行链（B1-B3 · 3 个 Skill）

### B1 · 智能发布 → `one-mcn-skills/b1-publish/SKILL.md`

**4 步执行**：
1. 取就绪池
2. ffmpeg 合成（封面+音频+字幕）
3. 调视频号 API 发布
4. 写飞书发布日志

**M1 阶段只发视频号**（4 平台 Day 5+ 数据好转再加）。

### B2 · 数据采集 → `one-mcn-skills/b2-data/SKILL.md`

**6 指标**：播放 / 点赞 / 评论 / 转发 / 加微 / 收入，每日 16/18/20/22 共 4 次。

### B3 · 复盘报告 → `one-mcn-skills/b3-report/SKILL.md`

**双调度**：
- 每日 06:00 5 段日报
- 每周日 22:00 5 页周报（含 M2 续跑决策矩阵）

---

## C. 私域变现链（C1-C4 · 4 个 Skill · M2 启用）

| Skill | 用途 | M1 状态 |
|:---|:---|:---:|
| C1 私域客服 | 7 句话 SOP | 🟡 Stub |
| C2 朋友圈 | 5 类文案 | 🟡 Stub |
| C3 标签管理 | 4 维标签 + 漏斗 | 🟡 Stub |
| C4 裂变追踪 | 3 人邀请 = 1 报告 | 🟡 Stub |

> **M1 阶段全部 stub**：客户数 < 50 走人工。Day 7 后若加微 > 50 启动 C1；> 100 启动 C2-C3；> 200 启动 C4。

---

## D. 顶层编排（D1 · 1 个 Skill）

### D1 · 24h SOP 引擎 → `one-mcn-skills/d1-sop/SKILL.md`

**核心职责**：盯紧其他 12 个 cron，每 5 分钟心跳。

**12 个被监控 cron**：

| Cron | 期望时段 | 失败动作 |
|:---|:---|:---|
| B3 每日日报 | 06:00 | 飞书 + HPet |
| A1 赛道扫描 | 0/6/12/18 | 飞书 + HPet |
| A2 爆款拆解 | 08:00 | 飞书 + HPet |
| A3 反向需求 | 09:00 | 飞书 + HPet |
| A4 脚本生成 | 10:00 | 飞书 + HPet |
| A5 红线审查 | 10:30 | 飞书 + HPet + Telegram |
| A6 配图封面 | 11:00 | 飞书 + HPet |
| A7 TTS 配音 | 11:30 | 飞书 + HPet |
| B1 智能发布 | 14:30 | 飞书 + HPet + Telegram |
| B2 数据采集 | 16/18/20/22 | 飞书 + HPet |
| G0 早期熔断 | 23:30 | 飞书 + HPet + 短信(Day 5+)+Telegram |
| D1 自检 | 每 5 min | 飞书 + HPet |

---

## G. 守护层（G0 · 1 个 Skill）

### G0 · 早期熔断 → `one-mcn-skills/g0-guard/SKILL.md`

**5 熔断条件**：

| # | Day | 触发线 | 动作 | 通知 |
|:---:|:---:|:---|:---|:---|
| 1 | 3 | 视频号 < 200 | 切账号方向 | HPet + 飞书 |
| 2 | 3 | 双账号 < 100 | 停发 1 天重做 | HPet + 飞书 |
| 3 | 5 | 双账号 < 500 | 24h 启动 Plan B | HPet + 飞书 + 短信 |
| 4 | 7 | 视频号 < 500 | Plan B 完成（训练营兜底）| HPet + 飞书 + 短信 + Telegram |
| 5 | 任何 | 7 红线触发 | 立即整改 + 复盘 | HPet + 飞书 + Telegram |

---

## 附录：性能基线（v2.0.3 真实成本）

> ⚠️ v1.0 性能基线表的 cost 数字是估算。v2.0.3 真实成本由 LLM Provider 决定。

| Skill | 调用/天 | 单次成本 | 月度估算 |
|:---|:---:|:---:|---:|
| A1 赛道扫描 | 4 次 | ¥0（视频号 API 免费）| ¥0 |
| A2 爆款拆解 | 1 次 × Top 10 | ~¥0.05 | ~¥2 |
| A3 反向需求 | 1 次 × Top 30 评论 | ~¥0.15 | ~¥5 |
| A4 脚本生成 | 1 次 × 10 变体 | ~¥0.20 | ~¥6 |
| A5 红线审查 | 1 次 × 10 脚本 | ~¥0.10 | ~¥3 |
| A6 配图封面 | 1 次 × 3 候选 | ~¥0.30 | ~¥9 |
| A7 TTS 配音 | 1 次 × 10 脚本 | ~¥0.10 | ~¥30（豆包 TTS）|
| B1 智能发布 | 1 次 × 2 视频 | ¥0 | ¥0 |
| B2 数据采集 | 4 次 | ¥0 | ¥0 |
| B3 复盘报告 | 1 次/日 + 1 次/周 | ~¥0.50 | ~¥15 |
| C1-C4 | M2 启用 | - | ~¥50 |
| D1 SOP 引擎 | 288 次/日 | ¥0（本地检查）| ¥0 |
| G0 早期熔断 | 1 次/日 | ¥0 | ¥0 |
| **合计** | - | - | **~¥120-150/月** |

> 💙 **v1.0 估 ¥550/月 vs v2.0.3 估 ~¥150/月**（省 70%）。原因：A1-A5 大量使用免费 API，TTS 是主要成本。

---

*ONE-MCN Agent Prompt 索引 v2.0.3 · 16 个 Skill · 总成本 ~¥150/月 · 节省 70%+ · A4 10 变体完整保留*

**💙 蕾姆的话**：v1.0 文档 703 行有 60% 是"想给 Agent 的故事"，v2.0.3 只保留最有用的 A4 10 变体 + 16 个 SKILL.md 索引。**真东西在 SKILL.md 里**，这文件只是目录。
