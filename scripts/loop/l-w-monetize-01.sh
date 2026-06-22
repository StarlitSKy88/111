#!/bin/bash
# ONE-MCN L-W-MONETIZE-01 Loop Runner
# v5.3.1 — 14 天试用管理
# 验证：trial.json duration_days=14 + reminder_days_before=3
set -euo pipefail

PASS=0
FAIL=0
echo "════════════════════════════════════════════════════════════"
echo " L-W-MONETIZE-01 · Stage 4 14 天试用管理"
echo "════════════════════════════════════════════════════════════"

# V1: trial_days = 14
RESULT=$(jq '.duration_days' src/monetize/trial.json)
if [ "$RESULT" = "14" ]; then
  echo "✅ V1: trial_days = 14 PASS"
  PASS=$((PASS+1))
else
  echo "❌ V1: trial_days FAIL (got $RESULT)"
  FAIL=$((FAIL+1))
fi

# V2: reminder_days_before = 3
RESULT=$(jq '.reminder_days_before' src/monetize/trial.json)
if [ "$RESULT" = "3" ]; then
  echo "✅ V2: reminder_days_before = 3 PASS"
  PASS=$((PASS+1))
else
  echo "❌ V2: reminder_days_before FAIL (got $RESULT)"
  FAIL=$((FAIL+1))
fi

# V3: early_bird_quota 表存在
DB="${DATABASE_URL:-postgres://opc-1@localhost:5432/one_mcn_test}"
COUNT=$(psql "$DB" -t -c "SELECT COUNT(*) FROM early_bird_quota" 2>/dev/null | tr -d ' \n')
if [ "$COUNT" -ge "1" ]; then
  echo "✅ V3: early_bird_quota 表 PASS ($COUNT rows)"
  PASS=$((PASS+1))
else
  echo "❌ V3: early_bird_quota 表 FAIL"
  FAIL=$((FAIL+1))
fi

# V4: 早鸟价格 = 699
PRICE=$(psql "$DB" -t -c "SELECT locked_price_cny FROM early_bird_quota WHERE id=1" 2>/dev/null | tr -d ' \n')
if [ "$PRICE" = "699" ]; then
  echo "✅ V4: 早鸟价格 ¥699 PASS"
  PASS=$((PASS+1))
else
  echo "❌ V4: 早鸟价格 FAIL (got $PRICE)"
  FAIL=$((FAIL+1))
fi

# V5: quota_total = 100
QUOTA=$(psql "$DB" -t -c "SELECT quota_total FROM early_bird_quota WHERE id=1" 2>/dev/null | tr -d ' \n')
if [ "$QUOTA" = "100" ]; then
  echo "✅ V5: quota_total = 100 PASS"
  PASS=$((PASS+1))
else
  echo "❌ V5: quota_total FAIL (got $QUOTA)"
  FAIL=$((FAIL+1))
fi

echo ""
echo "════════════════════════════════════════════════════════════"
echo " 总结：$PASS PASS / $FAIL FAIL"
echo "════════════════════════════════════════════════════════════"
[ $FAIL -eq 0 ] && exit 0 || exit 1