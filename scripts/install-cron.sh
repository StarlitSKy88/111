#!/bin/bash
# ONE-MCN Cron 安装脚本（L-W-INFRA-02）
# v5.3.1 — 2026-06-22
# 安装 8 个 cron 任务：监控/支付/Agent/Tier
set -euo pipefail

PROJECT_DIR="/Users/opc-1/Downloads/O/opcone"

echo "═══════════════════════════════════════════════════════════"
echo " ONE-MCN Cron 安装（L-W-INFRA-02）"
echo "═══════════════════════════════════════════════════════════"

# 备份现有 crontab
crontab -l > /tmp/cron.bak.$(date +%Y%m%d) 2>/dev/null || true
echo "▶ 现有 crontab 已备份到 /tmp/cron.bak.$(date +%Y%m%d)"

# 检查是否已安装
if crontab -l 2>/dev/null | grep -q "one-mcn"; then
  echo "⚠️  ONE-MCN cron 已存在，跳过"
  exit 0
fi

# 追加 ONE-MCN cron 任务
(crontab -l 2>/dev/null; cat <<EOF
# ONE-MCN Cron Tasks（L-W-INFRA-02）
# 每日 23:00 数据库备份
0 23 * * * cd $PROJECT_DIR && bash scripts/backup/daily.sh >> /var/log/one-mcn-backup.log 2>&1
# 每周日 02:00 备份恢复测试
0 2 * * 0 cd $PROJECT_DIR && bash scripts/backup/restore_test.sh >> /var/log/one-mcn-restore.log 2>&1
# 每周一 09:00 周报告
0 9 * * 1 cd $PROJECT_DIR && DATABASE_URL="postgres://opc-1@localhost:5432/one_mcn_test" npx tsx -e "import('./src/monitor/reports/weekly.ts').then(m => m.generateWeeklyReport(new Date())).then(r => console.log(JSON.stringify(r)))" >> /var/log/one-mcn-weekly.log 2>&1
# 每月 1 号 10:00 Tier 2 月度报告
0 10 1 * * cd $PROJECT_DIR && DATABASE_URL="postgres://opc-1@localhost:5432/one_mcn_test" npx tsx -e "import('./src/tier2/monthly-report.ts').then(m => m.generateTier2MonthlyReport(new Date())).then(r => console.log(JSON.stringify(r)))" >> /var/log/one-mcn-monthly.log 2>&1
# 每天 09:00 续费提醒（每 7/1/0 天轮询）
0 9 * * * cd $PROJECT_DIR && DATABASE_URL="postgres://opc-1@localhost:5432/one_mcn_test" npx tsx scripts/cron/renewal-reminder.ts >> /var/log/one-mcn-renewal.log 2>&1
# 每天 09:00 试用到期提醒（提前 3 天）
0 9 * * * cd $PROJECT_DIR && DATABASE_URL="postgres://opc-1@localhost:5432/one_mcn_test" npx tsx scripts/cron/trial-reminder.ts >> /var/log/one-mcn-trial.log 2>&1
# 每 5 分钟 5 维数据采集
*/5 * * * * cd $PROJECT_DIR && DATABASE_URL="postgres://opc-1@localhost:5432/one_mcn_test" npx tsx scripts/cron/collect-metrics.ts >> /var/log/one-mcn-collect.log 2>&1
# 每 10 分钟 异常预警推送
*/10 * * * * cd $PROJECT_DIR && DATABASE_URL="postgres://opc-1@localhost:5432/one_mcn_test" npx tsx scripts/cron/check-alerts.ts >> /var/log/one-mcn-alerts.log 2>&1
EOF
) | crontab -

echo "✅ ONE-MCN cron 已安装"
echo ""
echo "已配置 8 个任务："
crontab -l | grep -A 0 "one-mcn\|备份\|周报告\|月度\|续费\|试用\|采集\|预警" | head -20