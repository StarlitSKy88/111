#!/bin/bash
# M1 启动 dry-run 演练脚本
#
# 目的：在 2026-07-03 真正启动前，验证整条 cron 链 + 数据流 + 告警通路
#
# 检查项（11 项）：
# 1.  SSH 访问
# 2.  Hermes Agent 进程
# 3.  Gateway 服务
# 4.  LiteLLM 代理
# 5.  G0 guard cron 已注册
# 6.  数据备份 cron 已注册
# 7.  LiteLLM 监控 cron 已注册
# 8.  D1 SOP cron 已注册（每 5 分钟自检）
# 9.  飞书 5 表存在（feishu 表格 query）
# 10. 关键目录可写（~/.hermes/cron/output/、~/.backups/）
# 11.凭据配置（API_KEY / LiteLLM key 存在）
#
# 用法：bash scripts/m1-dry-run.sh
# 退出码：0 全部通过，1 有失败

set -uo pipefail

VPS_HOST="${VPS_HOST:-ubuntu@43.160.213.118}"
VPS_KEY="${VPS_KEY:-/Users/opc-1/Downloads/miyao/hermes.pem}"
M1_DATE="2026-07-03"
TODAY=$(date +%Y-%m-%d)
# macOS BSD date 用 -j -f 计算 Unix 时间戳
TODAY_S=$(date -j -f "%Y-%m-%d" "$TODAY" "+%s" 2>/dev/null || date +%s)
M1_S=$(date -j -f "%Y-%m-%d" "$M1_DATE" "+%s" 2>/dev/null || echo $((TODAY_S + 28*86400)))
DAYS_UNTIL_M1=$(( (M1_S - TODAY_S) / 86400 ))

pass=0
fail=0
warn=0
details="[]"

check() {
  local name="$1"
  local status="$2"  # ok / fail / warn
  local msg="$3"
  if [ "$status" = "ok" ]; then
    echo "  ✓ $name: $msg"
    pass=$((pass + 1))
  elif [ "$status" = "warn" ]; then
    echo "  ⚠ $name: $msg"
    warn=$((warn + 1))
  else
    echo "  ✗ $name: $msg"
    fail=$((fail + 1))
  fi
  details=$(echo "$details" | python3 -c "
import sys, json
arr = json.load(sys.stdin)
arr.append({'check': '$name', 'status': '$status', 'msg': '$msg'})
print(json.dumps(arr, ensure_ascii=False))
")
}

echo ""
echo "=== M1 启动 dry-run 演练 ==="
echo "M1 启动日: $M1_DATE (还有 $DAYS_UNTIL_M1 天)"
echo "今天: $TODAY"
echo ""

# 1. SSH
echo "[1/11] SSH 访问"
ssh_test=$(ssh -i "$VPS_KEY" -o ConnectTimeout=5 -o BatchMode=yes "$VPS_HOST" 'echo ok' 2>/dev/null)
[ "$ssh_test" = "ok" ] && check "SSH" "ok" "可免密登录 $VPS_HOST" || check "SSH" "fail" "登录失败"

# 2-11. VPS 检查
vps_check() {
  ssh -i "$VPS_KEY" -o ConnectTimeout=5 "$VPS_HOST" "$1" 2>/dev/null
}

echo "[2/11] Hermes Agent 进程"
ha_pid=$(vps_check "pgrep -f 'hermes_cli.main' | head -1")
[ -n "$ha_pid" ] && check "Hermes Agent" "ok" "PID $ha_pid" || check "Hermes Agent" "fail" "未运行"

echo "[3/11] Gateway 服务"
gw_pid=$(vps_check "pgrep -f 'hermes_cli.main gateway' | head -1")
[ -n "$gw_pid" ] && check "Gateway" "ok" "PID $gw_pid" || check "Gateway" "fail" "未运行"

echo "[4/11] LiteLLM 代理"
ll_health=$(vps_check "curl -sf -m 5 http://localhost:9118/health/liveliness")
if echo "$ll_health" | grep -q "alive"; then
  endpoints=$(vps_check "curl -sf http://localhost:9118/health | python3 -c 'import sys,json;print(len(json.load(sys.stdin).get(\"healthy_endpoints\",[])))'")
  check "LiteLLM" "ok" "$endpoints endpoints healthy"
else
  check "LiteLLM" "fail" "liveliness 失败"
fi

echo "[5/11] G0 guard cron"
g0=$(vps_check "~/.local/bin/hermes cron list 2>/dev/null | grep -c 'G0 早期熔断守卫'")
[ "$g0" -ge 1 ] && check "G0 cron" "ok" "已注册" || check "G0 cron" "fail" "未注册"

echo "[6/11] 数据备份 cron"
bak=$(vps_check "~/.local/bin/hermes cron list 2>/dev/null | grep -c 'OPC 数据备份'")
[ "$bak" -ge 1 ] && check "备份 cron" "ok" "已注册" || check "备份 cron" "fail" "未注册"

echo "[7/11] LiteLLM 监控 cron"
llm=$(vps_check "~/.local/bin/hermes cron list 2>/dev/null | grep -c 'LiteLLM 健康监控'")
[ "$llm" -ge 1 ] && check "LiteLLM cron" "ok" "已注册" || check "LiteLLM cron" "fail" "未注册"

echo "[8/11] D1 SOP cron（每 5 分钟）"
d1=$(vps_check "~/.local/bin/hermes cron list 2>/dev/null | grep -c 'D1 SOP'")
[ "$d1" -ge 1 ] && check "D1 SOP" "ok" "已注册" || check "D1 SOP" "fail" "未注册"

echo "[9/11] 飞书 5 表（可读性测试）"
feishu_test=$(vps_check "hermes feishu list-tables 2>&1 | head -5")
if echo "$feishu_test" | grep -qi "auth\|error\|not configured"; then
  check "飞书 5 表" "warn" "未配置（任务 #180 账号未就绪）"
else
  check "飞书 5 表" "ok" "可访问"
fi

echo "[10/11] 关键目录可写"
writable=$(vps_check "touch ~/.hermes/cron/output/.test 2>&1 && touch ~/.backups/.test 2>&1 && echo 'ok'")
[ "$writable" = "ok" ] && check "目录" "ok" "cron/output/ 和 ~/.backups/ 可写" || check "目录" "fail" "不可写"

echo "[11/11] 凭据配置"
api_key=$(vps_check "grep -q '^API_KEY=' ~/.hermes/.env && echo ok")
[ "$api_key" = "ok" ] && check "API_KEY" "ok" "已配置" || check "API_KEY" "warn" "未在 .env 配置（可能用其他 provider）"

# 总结
echo ""
echo "=== 演练结果 ==="
echo "  ✓ 通过: $pass"
echo "  ⚠ 警告: $warn"
echo "  ✗ 失败: $fail"
echo "  距 M1: $DAYS_UNTIL_M1 天"
echo ""

# 输出 JSON 报告
cat <<EOF
{
  "m1_date": "$M1_DATE",
  "today": "$TODAY",
  "days_until_m1": $DAYS_UNTIL_M1,
  "pass": $pass,
  "warn": $warn,
  "fail": $fail,
  "details": $details
}
EOF

[ "$fail" -gt 0 ] && exit 1
exit 0
