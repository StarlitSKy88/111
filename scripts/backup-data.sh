#!/bin/bash
# OPC 数据每日备份脚本
#
# 功能：
# - 打包 ~/data/*.json 到 ~/.backups/opc-data-YYYYMMDD-HHMM.tar.gz
# - 保留最近 7 份备份，自动清理更早的
# - 输出 JSON 摘要供 hermes cron 投递
#
# 用法（手动）：
#   bash scripts/backup-data.sh
#
# Hermes cron（每天 03:00 跑）：
#   hermes cron create "0 3 * * *" "OPC 数据备份" --no-agent \
#     --script ~/.hermes/scripts/opc-backup.sh \
#     --deliver local

set -euo pipefail

# 配置
DATA_DIR="${OPC_DATA_DIR:-$HOME/data}"
BACKUP_DIR="$HOME/.backups"
KEEP_DAYS=7
TIMESTAMP=$(date +%Y%m%d-%H%M)
BACKUP_FILE="$BACKUP_DIR/opc-data-$TIMESTAMP.tar.gz"

# 统计
files_count=0
total_bytes=0
errors=0

mkdir -p "$BACKUP_DIR"

# 1. 打包（排除 ._ 前缀的 macOS 元文件）
if [ ! -d "$DATA_DIR" ]; then
  echo '{"ok": false, "error": "data dir not found: '"$DATA_DIR"'"}'
  exit 1
fi

tar_files=()
for f in "$DATA_DIR"/*.json; do
  [ -e "$f" ] || continue
  base=$(basename "$f")
  # 跳过 macOS 资源文件
  [[ "$base" == ._* ]] && continue
  tar_files+=("$f")
  size=$(stat -c%s "$f" 2>/dev/null || stat -f%z "$f")
  total_bytes=$((total_bytes + size))
  files_count=$((files_count + 1))
done

if [ "$files_count" -eq 0 ]; then
  echo '{"ok": false, "error": "no json files in '"$DATA_DIR"'"}'
  exit 1
fi

# 2. 压缩
if tar -czf "$BACKUP_FILE" -C "$DATA_DIR" "${tar_files[@]#$DATA_DIR/}" 2>/dev/null; then
  backup_size=$(stat -c%s "$BACKUP_FILE" 2>/dev/null || stat -f%z "$BACKUP_FILE")
else
  echo '{"ok": false, "error": "tar failed"}'
  exit 1
fi

# 3. 清理 7 天前的备份
deleted=$(find "$BACKUP_DIR" -name "opc-data-*.tar.gz" -mtime +$KEEP_DAYS -delete -print | wc -l)

# 4. 输出 JSON 摘要
cat <<EOF
{
  "ok": true,
  "backup_file": "$BACKUP_FILE",
  "files_count": $files_count,
  "data_bytes": $total_bytes,
  "backup_bytes": $backup_size,
  "compression_ratio": $(awk "BEGIN {printf \"%.2f\", $backup_size/$total_bytes}"),
  "old_deleted": $deleted,
  "timestamp": "$TIMESTAMP"
}
EOF
