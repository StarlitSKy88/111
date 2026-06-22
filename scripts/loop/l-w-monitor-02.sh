#!/bin/bash
# ONE-MCN L-W-MONITOR-02 Loop Runner
# v5.3.1 — 异常预警规则
# 验证：10+ 预警规则 + 2+ 推送通道
set -euo pipefail

PASS=0
FAIL=0
echo "════════════════════════════════════════════════════════════"
echo " L-W-MONITOR-02 · 异常预警规则"
echo "════════════════════════════════════════════════════════════"

# V1: rules ≥ 10
RESULT=$(jq '.rules | length' src/monitor/alerts/rules.json)
if [ "$RESULT" -ge "10" ]; then
  echo "✅ V1: rules ≥ 10 PASS ($RESULT rules)"
  PASS=$((PASS+1))
else
  echo "❌ V1: rules FAIL (got $RESULT, expected ≥10)"
  FAIL=$((FAIL+1))
fi

# V2: channels ≥ 2 (feishu + email)
RESULT=$(jq '.channels | length' src/monitor/alerts/rules.json)
if [ "$RESULT" -ge "2" ]; then
  echo "✅ V2: channels ≥ 2 PASS ($RESULT channels)"
  PASS=$((PASS+1))
else
  echo "❌ V2: channels FAIL (got $RESULT)"
  FAIL=$((FAIL+1))
fi

# V3: 必须有 critical 类型规则
COUNT=$(jq '[.rules[] | select(.severity == "critical")] | length' src/monitor/alerts/rules.json)
if [ "$COUNT" -ge "3" ]; then
  echo "✅ V3: critical 规则 ≥ 3 PASS ($COUNT critical rules)"
  PASS=$((PASS+1))
else
  echo "❌ V3: critical 规则 FAIL (got $COUNT)"
  FAIL=$((FAIL+1))
fi

# V4: 5 个采集器文件存在
COUNT=$(ls src/monitor/collectors/*.ts 2>/dev/null | wc -l | tr -d ' ')
if [ "$COUNT" -ge "5" ]; then
  echo "✅ V4: 5 个采集器 PASS ($COUNT collectors)"
  PASS=$((PASS+1))
else
  echo "❌ V4: 采集器 FAIL (got $COUNT, expected ≥5)"
  FAIL=$((FAIL+1))
fi

echo ""
echo "════════════════════════════════════════════════════════════"
echo " 总结：$PASS PASS / $FAIL FAIL"
echo "════════════════════════════════════════════════════════════"
[ $FAIL -eq 0 ] && exit 0 || exit 1