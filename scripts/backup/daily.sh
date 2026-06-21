#!/bin/bash
# ONE-MCN 每日备份（cron 23:00）
set -euo pipefail

DB_NAME=${1:-one_mcn_test}
BACKUP_DIR=/backup
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

mkdir -p "$BACKUP_DIR"
pg_dump "$DB_NAME" > "$BACKUP_DIR/${DB_NAME}_${TIMESTAMP}.sql"

# 加密
gpg --symmetric --cipher-algo AES256 \
  --output "$BACKUP_DIR/${DB_NAME}_${TIMESTAMP}.sql.gpg" \
  "$BACKUP_DIR/${DB_NAME}_${TIMESTAMP}.sql"
rm "$BACKUP_DIR/${DB_NAME}_${TIMESTAMP}.sql"

# 30 天滚动
find "$BACKUP_DIR" -name "*.sql.gpg" -mtime +30 -delete

echo "[$(date)] Backup OK: ${DB_NAME}_${TIMESTAMP}.sql.gpg"
