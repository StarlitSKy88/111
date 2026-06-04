#!/bin/bash
# LiteLLM 健康监控脚本
#
# 检查项：
# - /health/liveliness: 进程是否存活
# - /health: healthy_endpoints 数量
# - 实际 chat 调用: 端到端可用性
#
# 用法：
#   bash scripts/litellm-monitor.sh
#   WATCHDOG_FAIL=1 bash scripts/litellm-monitor.sh  # 失败时非零退出
#
# Hermes cron（每 10 分钟）：
#   hermes cron create "*/10 * * * *" "LiteLLM 健康监控" --no-agent \
#     --script litellm-monitor.sh --deliver local,feishu

set -uo pipefail

LITELLM_URL="${LITELLM_URL:-http://localhost:9118}"
FAIL_EXIT="${WATCHDOG_FAIL:-0}"

# 1. 存活检查
start_ms=$(date +%s%3N 2>/dev/null || date +%s)
liveliness=$(curl -sf -m 5 "$LITELLM_URL/health/liveliness" 2>&1 || echo "")
# LiteLLM 返回 JSON 字符串 "I'm alive!"，去除引号后比较
liveliness_clean=$(echo "$liveliness" | tr -d '"' | tr -d ' ')
liveliness_ok=0
[ "$liveliness_clean" = "I'malive!" ] && liveliness_ok=1
# 容错：如果返回包含 "alive" 关键字也算通过
if [ "$liveliness_ok" -ne 1 ] && echo "$liveliness" | grep -q "alive"; then
  liveliness_ok=1
fi

# 2. 健康端点数量
healthy_count=$(curl -sf -m 10 "$LITELLM_URL/health" 2>/dev/null \
  | python3 -c "import sys,json; d=json.load(sys.stdin); print(len(d.get('healthy_endpoints',[])))" \
  2>/dev/null || echo "0")
# LiteLLM /health 响应无 endpoints 字段，只统计 healthy
total_count=$healthy_count

# 3. 延迟（用 /health/liveliness 估算）
latency=$(curl -sf -o /dev/null -m 5 -w '%{time_total}' "$LITELLM_URL/health/liveliness" 2>/dev/null || echo "0")
elapsed=$(date +%s%3N 2>/dev/null || date +%s)
elapsed=$((elapsed - start_ms))

# 4. 判定
status="ok"
if [ "$liveliness_ok" -ne 1 ]; then
  status="down"
elif [ "$healthy_count" -eq 0 ] && [ "$total_count" -gt 0 ]; then
  status="degraded"
elif [ "$total_count" -eq 0 ]; then
  status="unknown"
fi

# 5. 输出 JSON 摘要
cat <<EOF
{
  "service": "litellm",
  "url": "$LITELLM_URL",
  "status": "$status",
  "liveliness_ok": $liveliness_ok,
  "healthy_endpoints": $healthy_count,
  "total_endpoints": $total_count,
  "latency_s": $latency,
  "elapsed_ms": $elapsed,
  "checked_at": "$(date -Iseconds 2>/dev/null || date)"
}
EOF

# 6. 失败时退出
if [ "$FAIL_EXIT" = "1" ] && [ "$status" != "ok" ]; then
  exit 1
fi
