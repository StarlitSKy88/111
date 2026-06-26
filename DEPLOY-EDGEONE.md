# ONE-MCN v5.5 腾讯云 EdgeOne 全栈部署指南

> **状态**：文档（部署需 .env 凭据）
> **目标**：30-60 分钟内完成全栈部署
> **GitHub**：https://github.com/StarlitSKy88/111

---

## 0. 架构总览

```
┌─────────────────────────────────────────────┐
│  EdgeOne Pages（Next.js 3001）                │
│  - 静态资源 + SSR                            │
│  - /  /onboarding  /pricing  /dashboard ...  │
└─────────────┬───────────────────────────────┘
              │
              ↓ HTTPS /api/*
┌─────────────────────────────────────────────┐
│  EdgeOne Functions（Express API 3000）         │
│  - /api/auth  /api/discovery  /api/agent-run│
│  - /api/onboarding  /api/referral ...        │
└─────────────┬───────────────────────────────┘
              │
              ↓ postgresql://
┌─────────────────────────────────────────────┐
│  腾讯云 PostgreSQL（CDB-PG 或 EdgeOne KV）   │
│  - 9 张表 + RLS 多租户隔离                   │
│  - 每日 openssl AES-256-CBC 备份             │
└─────────────────────────────────────────────┘
              │
              ↓ HTTPS
┌─────────────────────────────────────────────┐
│  外部 LLM（Anthropic relay）+ 邮件 SMTP      │
└─────────────────────────────────────────────┘
```

---

## 1. 部署前准备（您需要）

### 1.1 腾讯云账号

- 登录 https://console.cloud.tencent.com/
- 开通 EdgeOne（Pages + Functions）
- 实名认证（境内必须）

### 1.2 GitHub PAT（部署用）

```
https://github.com/settings/tokens
→ Generate new token (classic)
→ Scopes: repo, workflow
```

### 1.3 EdgeOne 推荐套餐

- **Pages**：免费版起步（5 GB 流量/月）
- **Functions**：按调用付费（首 100 万次免费）
- **数据库**：腾讯云 CDB-PG（标准版 ~50元/月）

---

## 2. .env 完整环境变量（您需要填入）

> **重要**：不要把 .env 提交到 git（已在 .gitignore）

```bash
# === 数据库（EdgeOne 部署后填入）===
DATABASE_URL=postgres://one_mcn_user:YOUR_PASSWORD@YOUR_HOST:5432/one_mcn_prod

# === 服务 ===
PORT=3000
NODE_ENV=production
PUBLIC_URL=https://your-domain.com  # EdgeOne 提供的域名

# === LLM（Anthropic relay - 您已提供）===
ANTHROPIC_BASE_URL=https://relay.bytenote.net
ANTHROPIC_AUTH_TOKEN=cr_637c2f7a2343f0c29f4f4da6fb6147a4702b9b7d4f3abf9251402b220e9bb545
# ANTHROPIC_MODEL=claude-3-5-sonnet-20241022

# === OpenAI 备选（可选）===
# OPENAI_API_KEY=sk-...

# === 邮件（腾讯云 SMTP）===
QCLOUD_MAIL_USER=nodemailer@taomyst.top
QCLOUD_MAIL_PASS=your_smtp_password
QCLOUD_MAIL_FROM=nodemailer@taomyst.top

# === Stripe（待 keys）===
# STRIPE_SECRET_KEY=sk_live_...
# STRIPE_PUBLISHABLE_KEY=pk_live_...
# STRIPE_WEBHOOK_SECRET=whsec_...

# === 微信支付（v3，待 mchid）===
# WECHAT_PAY_MCH_ID=1234567890
# WECHAT_PAY_API_KEY=your_api_key
# WECHAT_PAY_NOTIFY_URL=https://your-domain.com/api/webhooks/wechat

# === 支付宝（待 app_id）===
# ALIPAY_APP_ID=2021000000000000
# ALIPAY_PRIVATE_KEY=...
# ALIPAY_PUBLIC_KEY=...

# === 备份加密 ===
ONE_MCN_BACKUP_PASS=one_mcn_backup_2026_prod

# === EdgeOne 特有 ===
EDGEONE_ACCESS_KEY=your_access_key
EDGEONE_SECRET_KEY=your_secret_key
```

---

## 3. 部署步骤

### Step 1: 创建 GitHub 仓库（已完成 ✅）

```bash
git remote -v
# origin	https://github.com/StarlitSKy88/111.git
```

### Step 2: 创建腾讯云 PostgreSQL

```
控制台 → TencentDB for PostgreSQL
→ 创建实例
  - 版本：PostgreSQL 16
  - 规格：标准版 1 核 1GB
  - 网络：私有网络 + 公网访问
  - 数据库名：one_mcn_prod
→ 创建用户 one_mcn_user + 强密码
→ 记录连接字符串：postgres://one_mcn_user:PASSWORD@HOST:5432/one_mcn_prod
```

### Step 3: 初始化数据库

```bash
# 本地连接 EdgeOne PG
psql "postgres://one_mcn_user:PASSWORD@HOST:5432/one_mcn_prod" \
  -f src/db/schema.sql

psql "postgres://one_mcn_user:PASSWORD@HOST:5432/one_mcn_prod" \
  -f src/db/migrations/V002__referral_codes.sql
```

### Step 4: 部署 Next.js 前端（EdgeOne Pages）

```bash
# 1. 登录 EdgeOne 控制台
# 2. Pages → 创建项目 → 关联 GitHub repo（StarlitSKy88/111）
# 3. 配置：
#    - 框架：Next.js
#    - 根目录：web/
#    - 构建命令：pnpm build
#    - 输出目录：.next
#    - Node 版本：20.x
# 4. 环境变量：复制上方 .env（DATABASE_URL 等公开值）
# 5. 部署
```

### Step 5: 部署 Express API（EdgeOne Functions）

需要把 src/server.ts + 路由文件重构成 Edge Functions：

```typescript
// edge-functions/api/auth/register.ts
import { Pool } from '@douyinfe/semi-ui-edge-functions';
// ... Express 路由转 Edge Function
```

**或更简单**：用 **EdgeOne Pages 的 API Routes**（Next.js 14 App Router）替代 Express

```
推荐方案：用 Next.js 14 API Routes（app/api/）替代 Express
- 优势：单仓单部署，API 和前端一起
- 改造：把 src/server.ts 拆分成 web/app/api/*/route.ts
```

### Step 6: 配置 cron 定时任务

EdgeOne 提供定时触发器 → 调 API：

```yaml
# edgeone-cron.yaml
triggers:
  - name: daily-backup
    schedule: "0 23 * * *"
    target: https://your-domain.com/api/cron/backup

  - name: weekly-report
    schedule: "0 9 * * 1"
    target: https://your-domain.com/api/cron/weekly

  - name: monthly-report
    schedule: "0 10 1 * *"
    target: https://your-domain.com/api/cron/monthly

  - name: collect-metrics
    schedule: "*/5 * * * *"
    target: https://your-domain.com/api/cron/collect

  - name: renewal-reminder
    schedule: "0 9 * * *"
    target: https://your-domain.com/api/cron/renewal

  - name: trial-reminder
    schedule: "0 9 * * *"
    target: https://your-domain.com/api/cron/trial
```

### Step 7: 域名 + SSL

```
EdgeOne Pages → 自定义域名
→ 您的域名（如 onemcn.com / taomyst.top）
→ 自动 SSL（Let's Encrypt）
→ DNS CNAME 指向 EdgeOne
```

---

## 4. 部署后验证

```bash
# 1. 前端健康
curl -I https://your-domain.com/

# 2. API 健康
curl https://your-domain.com/api/health

# 3. 数据库连接
psql $DATABASE_URL -c "SELECT COUNT(*) FROM users;"

# 4. 完整 6 步 onboarding
# 浏览器 → https://your-domain.com/onboarding

# 5. 4 Agent 真调 LLM
curl -X POST -H "Content-Type: application/json" \
  -d '{"agent_id":"content","user_id":"...","prompt":"..."}' \
  https://your-domain.com/api/agent-run
```

---

## 5. 改用 Next.js API Routes（推荐改造）

把 `src/server.ts` 拆分成 `web/app/api/*/route.ts`：

```
src/
├── server.ts             # 删除（Express）
├── api/auth/             # → web/app/api/auth/[action]/route.ts
├── api/discovery/        # → web/app/api/discovery/[action]/route.ts
├── api/agent-run/        # → web/app/api/agent-run/route.ts
├── api/onboarding/       # → web/app/api/onboarding/[action]/route.ts
├── api/payment/          # → web/app/api/webhooks/[provider]/route.ts
└── api/referral/         # → web/app/api/referral/[action]/route.ts
```

**优势**：
- 单仓单部署（EdgeOne Pages 即可）
- 无需 Express
- 路由文件结构更清晰
- 仍可用 Node.js API（pg / openai / @anthropic-ai/sdk）

**改造工作量**：2-3 小时（蕾姆可全自动）

---

## 6. 部署后监控

- EdgeOne 控制台：实时流量 + 错误率
- 腾讯云监控：CDB 连接数 + CPU
- 业务监控：/api/dashboard/north-star 看 5 维数据

---

## 7. 回滚方案

EdgeOne Pages 保留每次部署的版本：
- 控制台 → 部署历史 → 回滚到上一版本（30 秒）
- 数据库迁移失败：保留 backup 恢复

---

## 8. 成本估算

| 服务 | 配置 | 月费 |
|:---|:---|---:|
| EdgeOne Pages | 免费版 | ¥0 |
| EdgeOne Functions | 100 万次调用 | ¥0 |
| 腾讯云 PostgreSQL | 1 核 1GB | ~¥50 |
| 域名 | .com | ~¥60/年 |
| 总计 | | **~¥50/月** |

---

## 9. 下一步

1. ✅ **蕾姆已准备好** .env 模板（您已要求）
2. ⏳ **等您** 准备 EdgeOne 账号 + 数据库 + 域名
3. ⏳ **等您** 把 .env 凭据填入 EdgeOne 控制台
4. ⏳ **蕾姆** 改造 src/server.ts → web/app/api/*/route.ts
5. ⏳ **EdgeOne 自动部署** 通过 GitHub 集成

---

*更新时间：2026-06-27 · ONE-MCN v5.5 Semi + Ma 哲学*
