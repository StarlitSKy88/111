#!/bin/bash
# ONE-MCN Batch 2: L-MONITOR-01/03/04 + L-MONETIZE-02~05 + L-MONETIZE-S4-01~05
set -euo pipefail
PASS=0; FAIL=0
DB="${DATABASE_URL:-postgres://opc-1@localhost:5432/one_mcn_test}"
echo "════════ Batch 2: Stage 3 续 + Stage 4 ════════"

# L-MONITOR-01: 5 维采集器
COUNT=$(ls src/monitor/collectors/*.ts 2>/dev/null | wc -l | tr -d ' ')
if [ "$COUNT" -ge "5" ]; then
  echo "✅ L-MONITOR-01: 5 维采集器 PASS ($COUNT)"; PASS=$((PASS+1))
else
  echo "❌ L-MONITOR-01: 5 维采集器 FAIL ($COUNT)"; FAIL=$((FAIL+1))
fi

# L-MONITOR-03: 周报告生成
if [ -f src/monitor/reports/weekly.ts ]; then
  echo "✅ L-MONITOR-03: weekly.ts exists"; PASS=$((PASS+1))
else
  echo "⚠️ L-MONITOR-03: weekly.ts NOT YET (待创建)"; FAIL=$((FAIL+1))
fi

# L-MONITOR-04: 优化建议生成器
if [ -f src/monitor/optimizer/suggestions.json ]; then
  echo "✅ L-MONITOR-04: suggestions.json exists"; PASS=$((PASS+1))
else
  echo "⚠️ L-MONITOR-04: suggestions.json NOT YET (待创建)"; FAIL=$((FAIL+1))
fi

# L-MONETIZE-02: 续费提醒（reminder_days = [7, 1, 0]）
DAYS=$(jq -c '.reminder_days' src/monetize/renewal.json 2>/dev/null || echo "[]")
if [ "$DAYS" = "[7,1,0]" ] || [ "$DAYS" = "[7, 1, 0]" ]; then
  echo "✅ L-MONETIZE-02: 续费提醒 [7,1,0] PASS"; PASS=$((PASS+1))
else
  echo "⚠️ L-MONETIZE-02: reminder_days=$DAYS FAIL"; FAIL=$((FAIL+1))
fi

# L-MONETIZE-03: 推荐奖励
COMMISSION=$(jq '.commission_pct' src/monetize/referral.json 2>/dev/null || echo "0")
if [ "$COMMISSION" = "15" ]; then
  echo "✅ L-MONETIZE-03: 推荐 15% 佣金 PASS"; PASS=$((PASS+1))
else
  echo "❌ L-MONETIZE-03: 佣金 FAIL (got $COMMISSION)"; FAIL=$((FAIL+1))
fi

# L-MONETIZE-04: 早鸟窗口
PRICE=$(jq '.locked_price_cny' src/monetize/early-bird.json 2>/dev/null || echo "0")
if [ "$PRICE" = "699" ]; then
  echo "✅ L-MONETIZE-04: 早鸟 ¥699 PASS"; PASS=$((PASS+1))
else
  echo "❌ L-MONETIZE-04: 早鸟 FAIL (got $PRICE)"; FAIL=$((FAIL+1))
fi

# L-MONETIZE-05: Stage 4 与 Tier 解耦
DECOUPLED=$(grep -rE "tier[123]" src/monetize/ 2>/dev/null | wc -l | tr -d ' ')
if [ "$DECOUPLED" = "0" ]; then
  echo "✅ L-MONETIZE-05: Stage 4 与 Tier 解耦 PASS"; PASS=$((PASS+1))
else
  echo "❌ L-MONETIZE-05: 仍引用 tier ($DECOUPLED matches)"; FAIL=$((FAIL+1))
fi

# L-MONETIZE-S4-01: 14 天试用（已通过 L-MONETIZE-01 验证）
if [ "$(jq -r .duration_days src/monetize/trial.json)" = "14" ]; then
  echo "✅ L-MONETIZE-S4-01: 14 天试用 PASS"; PASS=$((PASS+1))
else
  echo "❌ L-MONETIZE-S4-01: 试用 FAIL"; FAIL=$((FAIL+1))
fi

# L-MONETIZE-S4-02: 续费提醒
if [ "$DAYS" = "[7,1,0]" ] || [ "$DAYS" = "[7, 1, 0]" ]; then
  echo "✅ L-MONETIZE-S4-02: 续费提醒 [7,1,0] PASS"; PASS=$((PASS+1))
else
  echo "⚠️ L-MONETIZE-S4-02 FAIL"; FAIL=$((FAIL+1))
fi

# L-MONETIZE-S4-03: 推荐奖励 (15%)
if [ "$(jq -r .commission_pct src/monetize/referral.json)" = "15" ]; then
  echo "✅ L-MONETIZE-S4-03: 推荐 15% PASS"; PASS=$((PASS+1))
else
  echo "❌ L-MONETIZE-S4-03 FAIL"; FAIL=$((FAIL+1))
fi

# L-MONETIZE-S4-04: 早鸟 quota 100
QUOTA=$(psql "$DB" -t -c "SELECT quota_total FROM early_bird_quota WHERE id=1" | tr -d ' \n' 2>/dev/null)
if [ "$QUOTA" = "100" ]; then
  echo "✅ L-MONETIZE-S4-04: quota 100 PASS"; PASS=$((PASS+1))
else
  echo "❌ L-MONETIZE-S4-04: quota FAIL (got $QUOTA)"; FAIL=$((FAIL+1))
fi

# L-MONETIZE-S4-05: 解耦验证（重复 MONETIZE-05）
if [ "$DECOUPLED" = "0" ]; then
  echo "✅ L-MONETIZE-S4-05: 解耦 PASS"; PASS=$((PASS+1))
else
  echo "❌ L-MONETIZE-S4-05 FAIL"; FAIL=$((FAIL+1))
fi

echo " 总结：$PASS PASS / $FAIL FAIL"
[ $FAIL -eq 0 ] && exit 0 || exit 1