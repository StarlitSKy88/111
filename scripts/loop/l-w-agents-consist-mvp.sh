#!/bin/bash
# ONE-MCN L-W-AGENT-01~05 + L-W-CONSIST-01 + L-W-MVP-01 Batch 1
set -euo pipefail
PASS=0; FAIL=0
echo "════════ L-W-AGENT-01~05 + L-W-CONSIST-01 + L-W-MVP-01 ════════"

# L-AGENT-01 Content Agent
if [ "$(jq -r .agent_id src/agents/content-agent.json)" = "content-agent-v1" ]; then
  echo "✅ L-AGENT-01: Content Agent config PASS"; PASS=$((PASS+1))
else
  echo "❌ L-AGENT-01 FAIL"; FAIL=$((FAIL+1))
fi

# L-AGENT-02 Acquisition Agent
if [ "$(jq -r .agent_id src/agents/acquisition-agent.json)" = "acquisition-agent-v1" ]; then
  echo "✅ L-AGENT-02: Acquisition Agent config PASS"; PASS=$((PASS+1))
else
  echo "❌ L-AGENT-02 FAIL"; FAIL=$((FAIL+1))
fi

# L-AGENT-03 Delivery Agent
if [ "$(jq -r .agent_id src/agents/delivery-agent.json)" = "delivery-agent-v1" ]; then
  echo "✅ L-AGENT-03: Delivery Agent config PASS"; PASS=$((PASS+1))
else
  echo "❌ L-AGENT-03 FAIL"; FAIL=$((FAIL+1))
fi

# L-AGENT-04 Support Agent
if [ "$(jq -r .agent_id src/agents/support-agent.json)" = "support-agent-v1" ]; then
  echo "✅ L-AGENT-04: Support Agent config PASS"; PASS=$((PASS+1))
else
  echo "❌ L-AGENT-04 FAIL"; FAIL=$((FAIL+1))
fi

# L-CONSIST-01 品牌一致性
if [ "$(jq -r .agent_id src/agents/consistency-agent.json)" = "consistency-agent-v1" ]; then
  echo "✅ L-CONSIST-01: Consistency Agent config PASS"; PASS=$((PASS+1))
else
  echo "❌ L-CONSIST-01 FAIL"; FAIL=$((FAIL+1))
fi

# L-MVP-01 MVP 上线流程
if [ -f src/mvp-launch/launch.ts ]; then
  echo "✅ L-MVP-01: launch.ts exists"; PASS=$((PASS+1))
else
  echo "⚠️ L-MVP-01: launch.ts NOT YET (需创建)"; FAIL=$((FAIL+1))
fi

# 全部 agent auto_decided
COUNT=$(jq '[.[] | select(.auto_decided == true)] | length' src/agents/*.json)
if [ "$COUNT" -ge "5" ]; then
  echo "✅ ALL-AGENTS auto_decided=true PASS ($COUNT)"; PASS=$((PASS+1))
else
  echo "❌ ALL-AGENTS auto_decided FAIL"; FAIL=$((FAIL+1))
fi

echo " 总结：$PASS PASS / $FAIL FAIL"
[ $FAIL -eq 0 ] && exit 0 || exit 1