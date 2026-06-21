# ONE-MCN · 1 人 MCN 公司

> **v5.1.1 vibcoding roadmap · 0 员工 + 100% Loop Engineering**

## 项目状态（2026-06-22）

- ✅ ONE-MCN 文档层 v5.1.1（5 份 roadmap + COMMERCIAL + Lesson 1-10）
- ✅ `.harness/PLAN-v8.md` 重写为 ONE-MCN vibcoding roadmap
- ✅ `.claude/agents/{reviewer,verifier}.md` Anthropic 三段式
- ✅ `one-mcn-skills/` 按 4 阶段重组织（6 目录）
- ✅ 数字一致性最终修复（177/140/40/32）
- ✅ `src/` 第一个真实可执行文件（v5.1.1 L-W-INFRA-01 Day 0 启动）
- 🔵 PostgreSQL 环境未启动（vibcoding 启动前置）

## 启动命令

```bash
# 1. 安装依赖
pnpm install

# 2. 启动 PostgreSQL（Docker）
docker run -d --name one-mcn-pg \
  -e POSTGRES_PASSWORD=dev123 \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_DB=one_mcn_test \
  -p 5432:5432 \
  postgres:16

# 3. 复制环境变量
cp .env.example .env

# 4. 运行 migration
pnpm db:migrate

# 5. 启动服务
pnpm dev

# 6. 验证
curl http://localhost:3000/api/health
# 期望：{"status":"ok","service":"one-mcn-server","version":"0.1.0",...}
```

## 文档体系（5 份 roadmap）

| 文档 | 作用 |
|:---|:---|
| `ONE-MCN-PRD.md` | 产品需求（4 阶段 + 3 Tier + 12 技术假设 + 8 商业假设）|
| `ONE-MCN-ARCHITECTURE.md` | 技术架构 |
| `ONE-MCN-M1-SOP.md` | 运营 SOP（140 M1 + 37 M2-M6 = 177 任务）|
| `ONE-MCN-LOOP-LIST.md` | Loop 清单（40 loop × ~165 原子验证）|
| `ONE-MCN-COMMERCIAL.md` | 商业文档（竞品 + GTM + Unit Economics）|

## 当前 Loop（L-W-INFRA-01）

```bash
# 原子验证（来自 M1-SOP）
grep -c "FOREIGN KEY" src/db/schema.sql
# 期望：>= 7

psql -U postgres -d one_mcn_test -f src/db/schema.sql 2>&1 | grep -c ERROR
# 期望：== 0

psql -c "\dt" | grep -E "(users|blueprints|brand_buildings|tier1_packages|monitor_metrics|tier2_executions|tier_subscriptions|stripe_events)" | wc -l
# 期望：== 8

psql -c "SELECT COUNT(*) FROM pg_tables WHERE rowsecurity = true AND tablename IN ('users','blueprints','brand_buildings','tier1_packages','monitor_metrics','tier2_executions','tier_subscriptions','stripe_events')"
# 期望：== 8
```

## 0 员工工作守则

详见 `CLAUDE.md` 11 条 Lesson。核心：

- **Lesson 8**：先确认代码状态，再优化文档
- **Lesson 9**：vibcoding 不招 design partner（0 alpha 验证改为上线后）
- **Lesson 10**：v5.0 转型必须做项目级扫描
- **Lesson 11（待补）**：0 design partner ≠ 0 alpha 用户（已被昴君 6/22 评审复议）

## 备份机制

```bash
# 每日 backup（cron 23:00）
git tag -a "v5.1-eod-$(date +%Y%m%d)" -m "每日 end-of-day 备份"
git push --tags

# Session resume
cat .claude/loops/active-loop.txt
tail -5 LOOP_NOTES.md
git log --oneline -10
jq '.current_loop, .loop_status' .harness/state.json
```

## .harness/

```
.harness/
├── PLAN-v8.md           # ONE-MCN vibcoding roadmap
├── state.json           # 当前状态
├── tasks/
│   └── M1-INFRA-01.json # L-W-INFRA-01 任务定义
└── (历史已备份到 .deleted-backup-2026-06-22/.harness/)
```