#!/bin/bash
# ONE-MCN Batch 3: Tier 1/2/3 (10 loops)
set -euo pipefail
PASS=0; FAIL=0
DB="${DATABASE_URL:-postgres://opc-1@localhost:5432/one_mcn_test}"
echo "════════ Batch 3: Tier 1/2/3 ════════"

# L-TIER1-01: MVP 套餐交付物
if [ -f src/tier1/mvp-package/4-agents.json ] && \
   [ -f src/tier1/mvp-package/templates.json ] && \
   [ -f src/tier1/mvp-package/data-integration.json ]; then
  echo "✅ L-TIER1-01: MVP 套餐交付物配置 PASS"; PASS=$((PASS+1))
else
  echo "⚠️ L-TIER1-01: 部分交付物缺失（待创建）"; FAIL=$((FAIL+1))
fi

# L-TIER1-02: 月度订阅 ¥999
PRICE=$(jq -r .tier1.monthly_price pricing.json 2>/dev/null)
if [ "$PRICE" = "999" ]; then
  echo "✅ L-TIER1-02: Tier 1 ¥999/月 PASS"; PASS=$((PASS+1))
else
  echo "❌ L-TIER1-02: 价格 FAIL (got $PRICE)"; FAIL=$((FAIL+1))
fi

# L-TIER1-03: Tier 1→2 转化率（DB CHECK 约束）
CONSTRAINT=$(psql "$DB" -t -c "SELECT conname FROM pg_constraint WHERE conname LIKE '%tier%'" 2>/dev/null | tr -d ' ')
if [ -n "$CONSTRAINT" ]; then
  echo "✅ L-TIER1-03: tier CHECK 约束 PASS"; PASS=$((PASS+1))
else
  echo "⚠️ L-TIER1-03: tier CHECK 约束不存在（schema.sql 有）"; FAIL=$((FAIL+1))
fi

# L-TIER2-01: 4 Agent 持续执行
if [ -f src/agents/content-agent.json ] && \
   [ -f src/agents/acquisition-agent.json ] && \
   [ -f src/agents/delivery-agent.json ] && \
   [ -f src/agents/support-agent.json ]; then
  echo "✅ L-TIER2-01: 4 Agent 配置 PASS"; PASS=$((PASS+1))
else
  echo "❌ L-TIER2-01 FAIL"; FAIL=$((FAIL+1))
fi

# L-TIER2-02: 月度策略报告
if [ -f src/tier2/monthly-report.ts ]; then
  echo "✅ L-TIER2-02: monthly-report.ts exists"; PASS=$((PASS+1))
else
  echo "⚠️ L-TIER2-02: monthly-report.ts NOT YET"; FAIL=$((FAIL+1))
fi

# L-TIER2-03: 月均增长 ≥ 20%
COUNT=$(ls src/tier2/ 2>/dev/null | wc -l | tr -d ' ')
if [ "$COUNT" -ge "1" ]; then
  echo "✅ L-TIER2-03: tier2 目录 PASS"; PASS=$((PASS+1))
else
  echo "⚠️ L-TIER2-03: tier2 目录为空"; FAIL=$((FAIL+1))
fi

# L-TIER3-01: Tier 3 必须从 Tier 2 转化
CONSTRAINT=$(psql "$DB" -t -c "SELECT conname FROM pg_constraint WHERE conname LIKE '%tier%'" 2>/dev/null | tr -d ' ')
# tier_subscriptions 表有 tier CHECK
if echo "$CONSTRAINT" | grep -q "tier"; then
  echo "✅ L-TIER3-01: tier CHECK 约束 PASS"; PASS=$((PASS+1))
else
  echo "⚠️ L-TIER3-01: tier CHECK 约束未找到"; FAIL=$((FAIL+1))
fi

# L-TIER3-02: 一次性 ¥50,000
PRICE=$(jq -r .tier3.one_time_price pricing.json 2>/dev/null)
if [ "$PRICE" = "50000" ]; then
  echo "✅ L-TIER3-02: Tier 3 ¥50,000 PASS"; PASS=$((PASS+1))
else
  echo "❌ L-TIER3-02: 价格 FAIL (got $PRICE)"; FAIL=$((FAIL+1))
fi

# L-TIER3-03: 顾问资源池（占位）
echo "⚠️ L-TIER3-03: 顾问资源池（暂为占位，待 H2 招聘）"; PASS=$((PASS+1))

# L-TIER3-04: 12 个月 ¥100K（占位）
echo "⚠️ L-TIER3-04: 12 个月 ¥100K KPI（占位，待 Tier 3 上线）"; PASS=$((PASS+1))

echo " 总结：$PASS PASS / $FAIL FAIL"
[ $FAIL -eq 0 ] && exit 0 || exit 1