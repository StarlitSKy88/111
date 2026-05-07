-- OPC节点百科 用户系统 Schema
-- 注意：当前使用 JSON 文件存储，便于迁移到 PostgreSQL

-- 用户表 (JSON: data/users.json)
-- 字段: id, email, password_hash, created_at, updated_at

-- 订阅表 (JSON: data/subscriptions.json)
-- 字段: id, user_id, plan, status, starts_at, expires_at, auto_renew, created_at

-- 节点收费配置 (JSON: data/node_pricing.json)
-- 字段: id, node_slug, item_name, item_price, is_active, created_at

-- 用户购买记录 (JSON: data/purchases.json)
-- 字段: id, user_id, node_slug, item_name, amount, status, created_at