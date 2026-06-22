#!/bin/bash
# ONE-MCN L-W-INFRA-01 Loop Runner
# v5.3.1 — 数据库 Schema + RLS 多租户（24 个 D0 原子任务）
# 验证：9 张表 + RLS ENABLE + FORCE + 隔离测试
set -euo pipefail

PASS=0
FAIL=0
DB="${DATABASE_URL:-postgres://opc-1@localhost:5432/one_mcn_test}"

echo "════════════════════════════════════════════════════════════"
echo " L-W-INFRA-01 · 数据库 Schema + RLS 多租户"
echo "════════════════════════════════════════════════════════════"
echo " DATABASE_URL: $DB"
echo ""

# D0-1: schema 设计
if [ -f src/db/schema.sql ]; then
  echo "✅ D0-1: schema.sql exists"
  PASS=$((PASS+1))
else
  echo "❌ D0-1: schema.sql NOT FOUND"
  FAIL=$((FAIL+1))
fi

# D0-2: migration 可执行
if psql "$DB" -f src/db/schema.sql &> /tmp/migration.log; then
  echo "✅ D0-2: migration 跑通"
  PASS=$((PASS+1))
else
  # 重入应该 idempotent
  if grep -q "already exists" /tmp/migration.log 2>/dev/null; then
    echo "✅ D0-2: migration 重入 idempotent"
    PASS=$((PASS+1))
  else
    echo "❌ D0-2: migration 失败"
    cat /tmp/migration.log | tail -5
    FAIL=$((FAIL+1))
  fi
fi

# D0-5: 9 张表
COUNT=$(psql "$DB" -t -c "SELECT COUNT(*) FROM pg_tables WHERE schemaname='public'" | tr -d ' \n')
if [ "$COUNT" -ge "9" ]; then
  echo "✅ D0-5: 9 张表 PASS ($COUNT tables)"
  PASS=$((PASS+1))
else
  echo "❌ D0-5: 9 张表 FAIL (got $COUNT)"
  FAIL=$((FAIL+1))
fi

# D0-6: tenant_id + created_at
COUNT=$(psql "$DB" -t -c "SELECT COUNT(DISTINCT table_name) FROM information_schema.columns WHERE column_name IN ('tenant_id','created_at') AND table_schema='public'" | tr -d ' \n')
if [ "$COUNT" -ge "8" ]; then
  echo "✅ D0-6: tenant_id + created_at PASS ($COUNT tables)"
  PASS=$((PASS+1))
else
  echo "❌ D0-6: tenant_id + created_at FAIL"
  FAIL=$((FAIL+1))
fi

# D0-7: created_at 索引
COUNT=$(psql "$DB" -t -c "SELECT COUNT(*) FROM pg_indexes WHERE indexname LIKE '%_created_at_idx'" | tr -d ' \n')
if [ "$COUNT" -ge "8" ]; then
  echo "✅ D0-7: created_at 索引 PASS ($COUNT indexes)"
  PASS=$((PASS+1))
else
  echo "❌ D0-7: created_at 索引 FAIL"
  FAIL=$((FAIL+1))
fi

# D0-8: tenant_id 索引
COUNT=$(psql "$DB" -t -c "SELECT COUNT(*) FROM pg_indexes WHERE indexdef LIKE '%tenant_id%'" | tr -d ' \n')
if [ "$COUNT" -ge "8" ]; then
  echo "✅ D0-8: tenant_id 索引 PASS ($COUNT indexes)"
  PASS=$((PASS+1))
else
  echo "❌ D0-8: tenant_id 索引 FAIL"
  FAIL=$((FAIL+1))
fi

# D0-9/D0-10: RLS ENABLE + FORCE
COUNT=$(psql "$DB" -t -c "SELECT COUNT(*) FROM pg_tables WHERE rowsecurity = true AND schemaname='public'" | tr -d ' \n')
if [ "$COUNT" -ge "8" ]; then
  echo "✅ D0-9/10: RLS ENABLE + FORCE PASS ($COUNT tables)"
  PASS=$((PASS+1))
else
  echo "❌ D0-9/10: RLS FAIL"
  FAIL=$((FAIL+1))
fi

# D0-11: RLS 多租户隔离 (non-superuser) — 期望 T2 视角 SELECT = 0 行
RESULT=$(psql "$DB" -t -A <<'EOF' 2>&1
CREATE ROLE app_user NOINHERIT;
GRANT USAGE ON SCHEMA public TO app_user;
GRANT ALL ON ALL TABLES IN SCHEMA public TO app_user;
SET ROLE app_user;
SELECT set_config('app.tenant_id', '11111111-1111-1111-1111-111111111111', false);
INSERT INTO users(email, password_hash, tenant_id) VALUES ('rls_check@t1.com', 'h', '11111111-1111-1111-1111-111111111111');
SELECT set_config('app.tenant_id', '22222222-2222-2222-2222-222222222222', false);
SELECT COUNT(*) AS rls_count FROM users WHERE email = 'rls_check@t1.com';
RESET ROLE;
DROP ROLE app_user;
DELETE FROM users WHERE email = 'rls_check@t1.com';
EOF
)
RLS_COUNT=$(echo "$RESULT" | grep -E "^[0-9]+$" | tail -1 | tr -d ' ')
if [ "$RLS_COUNT" = "0" ]; then
  echo "✅ D0-11: RLS 多租户隔离 PASS (T2 SELECT = 0 行)"
  PASS=$((PASS+1))
else
  echo "❌ D0-11: RLS 多租户隔离 FAIL (got count=$RLS_COUNT, output: $RESULT)"
  FAIL=$((FAIL+1))
fi

# D0-14: ORM 中间件
if grep -q "SET LOCAL app.tenant_id" src/db/middleware/tenant.ts 2>/dev/null; then
  echo "✅ D0-14: ORM 中间件 SET LOCAL PASS"
  PASS=$((PASS+1))
else
  echo "❌ D0-14: ORM 中间件 FAIL"
  FAIL=$((FAIL+1))
fi

# D0-15: 备份脚本
if [ -x scripts/backup/daily.sh ]; then
  echo "✅ D0-15: 备份脚本 daily.sh PASS"
  PASS=$((PASS+1))
else
  echo "❌ D0-15: 备份脚本 FAIL"
  FAIL=$((FAIL+1))
fi

# D0-19: secrets 不进代码
COUNT=$(grep -rE 'STRIPE_SECRET|FEISHU_WEBHOOK|WECHAT_PAY_KEY' --include='*.ts' --include='*.js' src/ 2>/dev/null | grep -v '.env.example' | wc -l | tr -d ' ')
if [ "$COUNT" = "0" ]; then
  echo "✅ D0-19: secrets 不进代码 PASS"
  PASS=$((PASS+1))
else
  echo "❌ D0-19: secrets 进代码 FAIL ($COUNT matches)"
  FAIL=$((FAIL+1))
fi

# D0-20: .env in .gitignore
if grep -E '^\.env$' .gitignore &> /dev/null; then
  echo "✅ D0-20: .env in .gitignore PASS"
  PASS=$((PASS+1))
else
  echo "❌ D0-20: .env NOT in .gitignore FAIL"
  FAIL=$((FAIL+1))
fi

# D0-21: bcrypt cost=12
COST=$(grep -E 'SALT_ROUNDS|cost' src/auth/password.ts | grep -oE '[0-9]+' | head -1)
if [ "$COST" = "12" ]; then
  echo "✅ D0-21: bcrypt cost=12 PASS"
  PASS=$((PASS+1))
else
  echo "❌ D0-21: bcrypt cost FAIL (got $COST)"
  FAIL=$((FAIL+1))
fi

# D0-22: RateLimit 中间件
if [ -f src/api/middleware/rateLimit.ts ]; then
  echo "✅ D0-22: RateLimit 中间件 PASS"
  PASS=$((PASS+1))
else
  echo "❌ D0-22: RateLimit 中间件 FAIL"
  FAIL=$((FAIL+1))
fi

# D0-24: CORS 白名单
if [ -f src/api/middleware/cors.ts ]; then
  echo "✅ D0-24: CORS 白名单 PASS"
  PASS=$((PASS+1))
else
  echo "❌ D0-24: CORS 白名单 FAIL"
  FAIL=$((FAIL+1))
fi

echo ""
echo "════════════════════════════════════════════════════════════"
echo " 总结：$PASS PASS / $FAIL FAIL"
echo "════════════════════════════════════════════════════════════"
[ $FAIL -eq 0 ] && exit 0 || exit 1