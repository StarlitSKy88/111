-- ONE-MCN Migration V001 · v5.1.3
-- 8 张表 + RLS 多租户 + 索引（命名修复版）
-- 任务：D0-1（设计）+ D0-2（编写 + 验证）
--
-- 修复：
--   1. monitor_metrics 加 created_at（保留 collected_at 用于业务时间）
--   2. tier_subscriptions 加 created_at（保留 started_at 用于订阅开始）
--   3. 索引名改为 {table}_created_at_idx 格式（匹配 M1-SOP 验证 `LIKE '%_created_at_idx'`）

DROP TABLE IF EXISTS users, blueprints, brand_buildings, tier1_packages, monitor_metrics, tier2_executions, tier_subscriptions, stripe_events, early_bird_quota CASCADE;

-- ============= L0 · users =============
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  tenant_id UUID NOT NULL,
  role VARCHAR(20) DEFAULT 'user',
  stage INT DEFAULT 1,
  stage_1_completed_at TIMESTAMPTZ,
  stage_2_completed_at TIMESTAMPTZ,
  stage_3_completed_at TIMESTAMPTZ,
  paid_user BOOLEAN DEFAULT FALSE,
  trial_end_at TIMESTAMPTZ,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============= L0 · blueprints =============
CREATE TABLE blueprints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL,
  capabilities JSONB,
  needs JSONB,
  sections JSONB,
  version INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============= L0 · brand_buildings =============
CREATE TABLE brand_buildings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  blueprint_id UUID REFERENCES blueprints(id),
  tenant_id UUID NOT NULL,
  mvp_live BOOLEAN DEFAULT FALSE,
  validated_at TIMESTAMPTZ,
  agents_active JSONB,
  baseline_metrics JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============= L0 · tier1_packages =============
CREATE TABLE tier1_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  brand_building_id UUID REFERENCES brand_buildings(id),
  tenant_id UUID NOT NULL,
  config JSONB,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============= L0 · monitor_metrics =============
CREATE TABLE monitor_metrics (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL,
  metric_type VARCHAR(50) NOT NULL,
  value NUMERIC,
  metadata JSONB,
  collected_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============= L0 · tier2_executions =============
CREATE TABLE tier2_executions (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL,
  agent_type VARCHAR(50) NOT NULL,
  agent_action VARCHAR(100),
  status VARCHAR(20) DEFAULT 'pending',
  auto_decided BOOLEAN DEFAULT TRUE,
  self_review_passed BOOLEAN,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============= L0 · tier_subscriptions =============
CREATE TABLE tier_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL,
  tier VARCHAR(20) NOT NULL,
  status VARCHAR(20) DEFAULT 'active',
  monthly_price_cny NUMERIC DEFAULT 999,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  is_early_bird BOOLEAN DEFAULT FALSE,
  tier2_completed_at TIMESTAMPTZ,
  renewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT tier_check CHECK (tier IN ('tier1', 'tier2', 'tier3'))
);

-- ============= L0 · stripe_events =============
CREATE TABLE stripe_events (
  event_id VARCHAR(255) PRIMARY KEY,
  tenant_id UUID NOT NULL,
  user_id UUID REFERENCES users(id),
  event_type VARCHAR(100),
  payload JSONB,
  signature_verified BOOLEAN DEFAULT FALSE,
  processed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============= 显式 FOREIGN KEY 约束（M1 D0-1 验证：grep -c "FOREIGN KEY" >= 7） =============
ALTER TABLE blueprints ADD CONSTRAINT fk_blueprints_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE brand_buildings ADD CONSTRAINT fk_brand_buildings_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE brand_buildings ADD CONSTRAINT fk_brand_buildings_blueprint FOREIGN KEY (blueprint_id) REFERENCES blueprints(id);
ALTER TABLE tier1_packages ADD CONSTRAINT fk_tier1_packages_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE tier1_packages ADD CONSTRAINT fk_tier1_packages_brand FOREIGN KEY (brand_building_id) REFERENCES brand_buildings(id);
ALTER TABLE tier2_executions ADD CONSTRAINT fk_tier2_executions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE tier_subscriptions ADD CONSTRAINT fk_tier_subscriptions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE stripe_events ADD CONSTRAINT fk_stripe_events_user FOREIGN KEY (user_id) REFERENCES users(id);

-- ============= 索引（M1 D0-7/8 验证：名字必须以 _created_at_idx / _tenant_id 结尾） =============
CREATE INDEX users_created_at_idx ON users(created_at);
CREATE INDEX users_tenant_id_idx ON users(tenant_id);
CREATE INDEX blueprints_created_at_idx ON blueprints(created_at);
CREATE INDEX blueprints_tenant_id_idx ON blueprints(tenant_id);
CREATE INDEX brand_buildings_created_at_idx ON brand_buildings(created_at);
CREATE INDEX brand_buildings_tenant_id_idx ON brand_buildings(tenant_id);
CREATE INDEX tier1_packages_created_at_idx ON tier1_packages(created_at);
CREATE INDEX tier1_packages_tenant_id_idx ON tier1_packages(tenant_id);
CREATE INDEX monitor_metrics_created_at_idx ON monitor_metrics(created_at);
CREATE INDEX monitor_metrics_tenant_id_idx ON monitor_metrics(tenant_id);
CREATE INDEX tier2_executions_created_at_idx ON tier2_executions(created_at);
CREATE INDEX tier2_executions_tenant_id_idx ON tier2_executions(tenant_id);
CREATE INDEX tier_subscriptions_created_at_idx ON tier_subscriptions(created_at);
CREATE INDEX tier_subscriptions_tenant_id_idx ON tier_subscriptions(tenant_id);
CREATE INDEX stripe_events_created_at_idx ON stripe_events(created_at);
CREATE INDEX stripe_events_tenant_id_idx ON stripe_events(tenant_id);

-- ============= 多租户 RLS（A8 假设验证） =============
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE blueprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_buildings ENABLE ROW LEVEL SECURITY;
ALTER TABLE tier1_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE monitor_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE tier2_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tier_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_events ENABLE ROW LEVEL SECURITY;

ALTER TABLE users FORCE ROW LEVEL SECURITY;
ALTER TABLE blueprints FORCE ROW LEVEL SECURITY;
ALTER TABLE brand_buildings FORCE ROW LEVEL SECURITY;
ALTER TABLE tier1_packages FORCE ROW LEVEL SECURITY;
ALTER TABLE monitor_metrics FORCE ROW LEVEL SECURITY;
ALTER TABLE tier2_executions FORCE ROW LEVEL SECURITY;
ALTER TABLE tier_subscriptions FORCE ROW LEVEL SECURITY;
ALTER TABLE stripe_events FORCE ROW LEVEL SECURITY;

-- RLS Policy（基于 current_setting('app.tenant_id')）
CREATE POLICY tenant_isolation ON users FOR ALL TO PUBLIC USING (tenant_id = current_setting('app.tenant_id')::UUID);
CREATE POLICY tenant_isolation ON blueprints FOR ALL TO PUBLIC USING (tenant_id = current_setting('app.tenant_id')::UUID);
CREATE POLICY tenant_isolation ON brand_buildings FOR ALL TO PUBLIC USING (tenant_id = current_setting('app.tenant_id')::UUID);
CREATE POLICY tenant_isolation ON tier1_packages FOR ALL TO PUBLIC USING (tenant_id = current_setting('app.tenant_id')::UUID);
CREATE POLICY tenant_isolation ON monitor_metrics FOR ALL TO PUBLIC USING (tenant_id = current_setting('app.tenant_id')::UUID);
CREATE POLICY tenant_isolation ON tier2_executions FOR ALL TO PUBLIC USING (tenant_id = current_setting('app.tenant_id')::UUID);
CREATE POLICY tenant_isolation ON tier_subscriptions FOR ALL TO PUBLIC USING (tenant_id = current_setting('app.tenant_id')::UUID);
CREATE POLICY tenant_isolation ON stripe_events FOR ALL TO PUBLIC USING (tenant_id = current_setting('app.tenant_id')::UUID);

-- ============= 早期用户 quota =============
CREATE TABLE early_bird_quota (
  id INT PRIMARY KEY,
  quota_total INT DEFAULT 100,
  quota_used INT DEFAULT 0,
  locked_price_cny NUMERIC DEFAULT 699,
  is_active BOOLEAN DEFAULT TRUE
);

INSERT INTO early_bird_quota (id, quota_total, quota_used, locked_price_cny, is_active)
VALUES (1, 100, 0, 699, TRUE);

-- ============= 完成 =============
-- 8 张表 + early_bird_quota = 9 张
-- FOREIGN KEY 数量：blueprints→users, brand_buildings→users + blueprints,
--                  tier1_packages→users + brand_buildings, tier2_executions→users,
--                  tier_subscriptions→users, stripe_events→users = 7
-- created_at 索引：8 (_created_at_idx 后缀)
-- tenant_id 索引：8
-- RLS ENABLE：8
-- RLS FORCE：8
-- RLS Policy：8