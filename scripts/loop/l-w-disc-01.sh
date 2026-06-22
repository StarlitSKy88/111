#!/bin/bash
# ONE-MCN L-W-DISC-01 Loop Runner
# v5.3.1 — Stage 1 多轮对话引擎
# 4 个原子验证：5 状态机 + max_turns=10 + tracker.ts + /api/discovery/start
set -euo pipefail

PASS=0
FAIL=0
echo "════════════════════════════════════════════════════════════"
echo " L-W-DISC-01 · Stage 1 多轮对话引擎"
echo "════════════════════════════════════════════════════════════"

# V1: 5 状态机
RESULT=$(jq '.states | length' src/discovery/state-machine.json)
if [ "$RESULT" = "5" ]; then
  echo "✅ V1: 5 状态机 PASS ($RESULT states)"
  PASS=$((PASS+1))
else
  echo "❌ V1: 5 状态机 FAIL (expected 5, got $RESULT)"
  FAIL=$((FAIL+1))
fi

# V2: max_turns=10
RESULT=$(jq '.max_turns' src/discovery/state-machine.json)
if [ "$RESULT" = "10" ]; then
  echo "✅ V2: max_turns=10 PASS ($RESULT)"
  PASS=$((PASS+1))
else
  echo "❌ V2: max_turns=10 FAIL (expected 10, got $RESULT)"
  FAIL=$((FAIL+1))
fi

# V3: tracker.ts
if [ -f src/discovery/analytics/tracker.ts ]; then
  echo "✅ V3: tracker.ts exists PASS"
  PASS=$((PASS+1))
else
  echo "❌ V3: tracker.ts NOT FOUND FAIL"
  FAIL=$((FAIL+1))
fi

# V4: /api/discovery/start
RESP=$(curl -s -X POST localhost:3000/api/discovery/start 2>&1)
SESSION_ID=$(echo "$RESP" | jq -r .session_id 2>/dev/null)
if [ -n "$SESSION_ID" ] && [ "$SESSION_ID" != "null" ]; then
  echo "✅ V4: /api/discovery/start PASS (session_id=$SESSION_ID)"
  PASS=$((PASS+1))
else
  echo "❌ V4: /api/discovery/start FAIL ($RESP)"
  FAIL=$((FAIL+1))
fi

# BONUS: /api/discovery/message 推进
if [ -n "$SESSION_ID" ] && [ "$SESSION_ID" != "null" ]; then
  RESP=$(curl -s -X POST -H "Content-Type: application/json" \
    -d "{\"session_id\":\"$SESSION_ID\",\"message\":\"我有 10 年产品经验\"}" \
    localhost:3000/api/discovery/message 2>&1)
  STATE=$(echo "$RESP" | jq -r .state 2>/dev/null)
  TURN=$(echo "$RESP" | jq -r .turn_count 2>/dev/null)
  if [ "$STATE" = "capability" ] && [ "$TURN" = "1" ]; then
    echo "✅ BONUS: 状态机推进 PASS (state=$STATE, turn=$TURN)"
    PASS=$((PASS+1))
  else
    echo "❌ BONUS: 状态机推进 FAIL (state=$STATE, turn=$TURN)"
    FAIL=$((FAIL+1))
  fi
fi

echo ""
echo "════════════════════════════════════════════════════════════"
echo " 总结：$PASS PASS / $FAIL FAIL"
echo "════════════════════════════════════════════════════════════"
[ $FAIL -eq 0 ] && exit 0 || exit 1