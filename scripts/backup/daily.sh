#!/bin/bash
# ONE-MCN 每日备份（cron 23:00）
set -euo pipefail

DB_NAME=${1:-one_mcn_test}
# macOS 根目录只读，备份到用户目录
BACKUP_DIR="${HOME}/.one-mcn-backups"
BACKUP_PASS="${ONE_MCN_BACKUP_PASS:-one_mcn_backup_2026}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

mkdir -p "$BACKUP_DIR"
pg_dump "$DB_NAME" > "$BACKUP_DIR/${DB_NAME}_${TIMESTAMP}.sql"

# 用 openssl 加密（macOS 自带，无需装 gpg）
openssl enc -aes-256-cbc -salt -pbkdf2 -iter 100000 \
  -in "$BACKUP_DIR/${DB_NAME}_${TIMESTAMP}.sql" \
  -out "$BACKUP_DIR/${DB_NAME}_${TIMESTAMP}.sql.enc" \
  -pass "pass:${BACKUP_PASS}"
rm "$BACKUP_DIR/${DB_NAME}_${TIMESTAMP}.sql"

# 30 天滚动
find "$BACKUP_DIR" -name "*.sql.enc" -mtime +30 -delete

echo "[$(date)] Backup OK: ${DB_NAME}_${TIMESTAMP}.sql.enc"
