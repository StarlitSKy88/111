#!/bin/bash
# ONE-MCN L-W-DISC-03 Loop Runner — 案例库完整性
set -euo pipefail
PASS=0; FAIL=0
echo "════════ L-W-DISC-03 · 案例库完整性 ════════"

# V1: 20+ 案例
COUNT=$(ls src/discovery/examples/*.md 2>/dev/null | wc -l | tr -d ' ')
if [ "$COUNT" -ge "20" ]; then
  echo "✅ V1: 案例数 ≥ 20 PASS ($COUNT)"; PASS=$((PASS+1))
else
  echo "❌ V1: 案例数 FAIL ($COUNT)"; FAIL=$((FAIL+1))
fi

# V2: 每个案例含"能力/需求/方向"3 段
COUNT=$(grep -l "^## 能力" src/discovery/examples/*.md 2>/dev/null | wc -l | tr -d ' ')
if [ "$COUNT" -ge "20" ]; then
  echo "✅ V2: 案例含能力段 PASS ($COUNT)"; PASS=$((PASS+1))
else
  echo "❌ V2: 案例能力段 FAIL ($COUNT)"; FAIL=$((FAIL+1))
fi

COUNT=$(grep -l "^## 需求" src/discovery/examples/*.md 2>/dev/null | wc -l | tr -d ' ')
if [ "$COUNT" -ge "20" ]; then
  echo "✅ V3: 案例含需求段 PASS ($COUNT)"; PASS=$((PASS+1))
else
  echo "❌ V3: 案例需求段 FAIL ($COUNT)"; FAIL=$((FAIL+1))
fi

COUNT=$(grep -l "^## 方向" src/discovery/examples/*.md 2>/dev/null | wc -l | tr -d ' ')
if [ "$COUNT" -ge "20" ]; then
  echo "✅ V4: 案例含方向段 PASS ($COUNT)"; PASS=$((PASS+1))
else
  echo "❌ V4: 案例方向段 FAIL ($COUNT)"; FAIL=$((FAIL+1))
fi

echo " 总结：$PASS PASS / $FAIL FAIL"
[ $FAIL -eq 0 ] && exit 0 || exit 1