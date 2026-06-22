#!/bin/bash
# ONE-MCN Batch 4: L-CROSS-01/02 + L-INFRA-02/04
set -euo pipefail
PASS=0; FAIL=0
DB="${DATABASE_URL:-postgres://opc-1@localhost:5432/one_mcn_test}"
echo "════════ Batch 4: Cross + L0 收尾 ════════"

# L-CROSS-01: 用户旅程 Eval
if [ -f src/api/routes/users.ts ] || [ -d src/api/users ]; then
  echo "✅ L-CROSS-01: 用户路由 PASS"; PASS=$((PASS+1))
else
  echo "⚠️ L-CROSS-01: 用户路由待创建"; FAIL=$((FAIL+1))
fi

# L-CROSS-02: 业务北极星指标
if [ -f src/api/dashboard/north-star.ts ]; then
  echo "✅ L-CROSS-02: north-star.ts PASS"; PASS=$((PASS+1))
else
  echo "⚠️ L-CROSS-02: north-star.ts 待创建"; FAIL=$((FAIL+1))
fi

# L-INFRA-02: Cron 调度
CRONTAB=$(crontab -l 2>/dev/null | grep -cE "monitor|monetize|agent|tier" || echo "0")
if [ "$CRONTAB" -ge "1" ]; then
  echo "✅ L-INFRA-02: crontab 已配置 PASS ($CRONTAB jobs)"; PASS=$((PASS+1))
else
  echo "⚠️ L-INFRA-02: crontab 未配置（需手动设置）"; FAIL=$((FAIL+1))
fi

# L-INFRA-04: 数据库备份 + 恢复（每日 + 加密 + 恢复测试 + 30 天滚动）
if [ -x scripts/backup/daily.sh ] && grep -q "gpg" scripts/backup/daily.sh && grep -q "AES256" scripts/backup/daily.sh && [ -x scripts/backup/restore_test.sh ] && grep -q "mtime +30" scripts/backup/daily.sh; then
  echo "✅ L-INFRA-04: 备份恢复 4 条件全 PASS（daily.sh + gpg AES256 + restore_test.sh + 30天滚动）"; PASS=$((PASS+1))
else
  echo "❌ L-INFRA-04: 备份配置不完整"; FAIL=$((FAIL+1))
fi

echo " 总结：$PASS PASS / $FAIL FAIL"
[ $FAIL -eq 0 ] && exit 0 || exit 1