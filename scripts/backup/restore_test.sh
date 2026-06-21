#!/bin/bash
# ONE-MCN 恢复测试（每周 cron 自动跑）
set -euo pipefail

BACKUP_FILE=$(ls -t /backup/*.sql.gpg 2>/dev/null | head -1)
if [ -z "$BACKUP_FILE" ]; then
  echo "[$(date)] ERROR: 无备份文件"
  exit 1
fi

# 解密 + 解压 + 恢复到 test_restore
DECRYPTED="/tmp/restore_test_$(date +%s).sql"
gpg --decrypt "$BACKUP_FILE" > "$DECRYPTED"

docker exec supabase_db_dulizhan psql -U postgres -d test_restore \
  -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;" 2>&1 | head -3
docker exec -i supabase_db_dulizhan psql -U postgres -d test_restore < "$DECRYPTED" 2>&1 | tail -3

# 验证
USER_COUNT=$(docker exec supabase_db_dulizhan psql -U postgres -d test_restore -t -c "SELECT COUNT(*) FROM users;" | tr -d ' ')
if [ "$USER_COUNT" -gt 0 ]; then
  echo "[$(date)] ✅ Restore test PASS: $USER_COUNT users"
else
  echo "[$(date)] ❌ Restore test FAIL: 0 users"
  exit 1
fi

rm "$DECRYPTED"
