---
node_id: 51
persona: neutral
cta_type: wechat
keywords: [备份, 恢复, 灾备, 数据库, 安全]
---

# 节点51：数据备份与恢复

> **面向OPC**：数据丢失 = OPC 死亡。1 次硬盘故障 / 1 次误删 = 客户全没。**3-2-1 备份策略**让你 99.9% 不会丢数据。

---

## 一、OPC 数据丢失的 3 个真实场景

| 场景 | 概率 | 后果 |
|:---|:---:|:---|
| 误删数据库 | 高 | 客户数据全没 |
| 服务器硬盘故障 | 中 | 全部历史数据 |
| 服务商倒闭（云厂商）| 低 | 业务停摆 |

**OPC 永远假设"最坏会发生"**。

---

## 二、3-2-1 备份策略（OPC 黄金法则）

```
3 份副本
2 种介质
1 份异地
```

**OPC 实施**：
- 1 份：生产数据库（Supabase 主库）
- 1 份：每日自动备份（Supabase 自带 + 异地 OSS）
- 1 份：周备份到本地硬盘

---

## 三、Supabase 自动备份

**Supabase 免费版**：无自动备份。
**Supabase Pro（25 美元/月）**：7 天自动备份 + Point-in-time recovery。

### 升级后自动有：
- 每日 1 次全量备份
- 保留 7 天
- 一键恢复到任意时间点

### 免费版 OPC 解法：自己写脚本

```bash
# 用 supabase CLI 每日导出
pg_dump "postgresql://postgres:[password]@db.xxx.supabase.co:5432/postgres" \
  > backup_$(date +%Y%m%d).sql

# 上传到阿里云 OSS
ossutil cp backup_$(date +%Y%m%d).sql \
  oss://opc-backup/database/
```

加到 cron：每天凌晨 3 点跑。

---

## 四、3 层备份架构

### Layer 1：应用层（关键文件）

| 文件 | 备份方式 |
|:---|:---|
| 用户头像 / 上传 | OSS 跨区域复制 |
| 配置文件 | 推到 GitHub private repo |
| 业务代码 | Git（已经是备份）|

### Layer 2：数据库层

| 备份 | 频率 | 保留 |
|:---|:---|:---|
| 全量备份 | 每天 | 7 天 |
| 增量备份 | 每小时 | 24 小时 |
| 周备份 | 每周 | 30 天 |

### Layer 3：基础设施

| 资源 | 备份 |
|:---|:---|
| 域名 | 备份到 Cloudflare 防止过期 |
| DNS 记录 | 截图存档 |
| 服务器配置 | 用 Ansible / Terraform |
| 第三方密钥 | 1Password / Bitwarden |

---

## 五、3 个备份脚本示例

### 1. 每日数据库备份 + 清理

```bash
#!/bin/bash
# backup-db.sh
BACKUP_DIR="/var/backups/opc"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
PGPASSWORD=$DB_PASSWORD pg_dump $DB_URL > $BACKUP_DIR/db_$TIMESTAMP.sql

# 压缩
gzip $BACKUP_DIR/db_$TIMESTAMP.sql

# 上传到 OSS
ossutil cp $BACKUP_DIR/db_$TIMESTAMP.sql.gz oss://opc-backup/db/

# 删除 7 天前的本地备份
find $BACKUP_DIR -name "db_*.sql.gz" -mtime +7 -delete
```

加到 crontab：
```bash
0 3 * * * /opt/scripts/backup-db.sh
```

### 2. 关键文件备份

```bash
#!/bin/bash
# backup-files.sh
tar -czf /var/backups/files_$(date +%Y%m%d).tar.gz /var/www/uploads/
ossutil cp /var/backups/files_*.tar.gz oss://opc-backup/files/
```

### 3. 备份验证（每月 1 次）

```bash
#!/bin/bash
# verify-backup.sh
# 下载昨天的备份，恢复到测试库，验证数据完整性
LATEST=$(ossutil ls oss://opc-backup/db/ | tail -1 | awk '{print $4}')
ossutil cp $LATEST /tmp/test.sql.gz
gunzip /tmp/test.sql.gz
psql -h test-db -U postgres -d test -f /tmp/test.sql
# 自动跑一个 COUNT(*) 验证
```

---

## 六、3 个数据恢复场景的 SOP

### 场景 1：误删 1 条数据

```sql
-- Supabase Pro: PITR
SELECT * FROM users WHERE id = 'xxx' AND deleted_at > NOW() - INTERVAL '1 hour';
```

### 场景 2：误删整张表

```bash
# 从最近一次备份恢复
psql -h db.xxx.supabase.co -U postgres -d postgres -f backup_20260604.sql
```

### 场景 3：整个数据库被攻击 / 损坏

```bash
# 1. 启用新数据库
# 2. 从异地备份恢复
# 3. 通知用户数据已恢复
# 4. 改所有密码 / API 密钥
```

**RTO（恢复时间目标）**：OPC 应该是 4 小时以内。
**RPO（数据丢失目标）**：OPC 应该是 24 小时以内。

---

## 七、3 个常见错误

### 错误 1：备份了但没验证

**症状**：备份 6 个月，恢复时发现是空文件。
**解法**：每月 1 次"恢复测试"。

### 错误 2：备份和源在同台机器

**症状**：服务器炸了，备份也炸了。
**解法**：跨区域 / 跨服务商。

### 错误 3：凭据推到 GitHub

**症状**：黑客拿到 OSS 密钥 = 删光备份。
**解法**：用 IAM Role / 短期 token。

---

## 八、检查清单

- [ ] 启用 Supabase Pro 或自建备份
- [ ] 备份脚本每天自动跑
- [ ] 备份传到异地 OSS / S3
- [ ] 保留 30 天历史备份
- [ ] 每月 1 次恢复测试
- [ ] 关键密钥存 1Password
- [ ] RTO / RPO 已明确

---

## 节点资源链接

- 节点44：银行开户与商户号
- 节点46：现金流与财务基础
- 节点52：服务器安全防护
