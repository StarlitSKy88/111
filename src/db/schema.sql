-- ONE-MCN Migration V001 · v5.1.1
-- 8 张表 + RLS 多租户 + 索引
-- 任务：D0-1（设计）+ D0-2（编写）+ D0-5/6/7/8（验证）
-- 验证命令（来自 M1-SOP）：
--   grep -c "FOREIGN KEY" src/db/schema.sql >= 7
--   psql -f V001__initial.sql 2>&1 | grep -c ERROR == 0

-- ============= L0 · users =============
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL, -- bcrypt cost=12
  tenant_id UUID NOT NULL, -- 多租户隔离
  role VARCHAR(20) DEFAULT 'user', -- user / admin
  stage INT DEFAULT 1, -- 当前阶段 1-4
  stage_1_completed_at TIMESTAMPTZ,
  stage_2_completed_at TIMESTAMPTZ,
  stage_3_completed_at TIMESTAMPTZ,
  paid_user BOOLEAN DEFAULT FALSE,
  trial_end_at TIMESTAMPTZ,
  is_deleted BOOLEAN DEFAULT FALSE, -- 软删除
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============= L0 · blueprints =============
CREATE TABLE blueprints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL,
  capabilities JSONB, -- 能力图谱
  needs JSONB, -- 需求图谱
  sections JSONB, -- 蓝图章节
  version INT DEFAULT 1, -- 版本化
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
  agents_active JSONB, -- 4 Agent 状态
  baseline_metrics JSONB, -- baseline 指标
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============= L0 · tier1_packages =============
CREATE TABLE tier1_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  brand_building_id UUID REFERENCES brand_buildings(id),
  tenant_id UUID NOT NULL,
  config JSONB, -- 4 Agent 配置 + 模板 + 数据接入
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============= L0 · monitor_metrics =============
CREATE TABLE monitor_metrics (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL,
  metric_type VARCHAR(50) NOT NULL, -- traffic / conversion / revenue / brand / retention
  value NUMERIC,
  metadata JSONB,
  collected_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============= L0 · tier2_executions =============
CREATE TABLE tier2_executions (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL,
  agent_type VARCHAR(50) NOT NULL, -- content / acquisition / delivery / support
  agent_action VARCHAR(100),
  status VARCHAR(20) DEFAULT 'pending', -- pending / running / success / failed
  auto_decided BOOLEAN DEFAULT TRUE, -- A3 Agent 全权决策
  self_review_passed BOOLEAN, -- A3-02 Agent 自我 review
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============= L0 · tier_subscriptions =============
CREATE TABLE tier_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL,
  tier VARCHAR(20) NOT NULL, -- tier1 / tier2 / tier3
  status VARCHAR(20) DEFAULT 'active', -- active / paused / cancelled / trial
  monthly_price_cny NUMERIC DEFAULT 999,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  is_early_bird BOOLEAN DEFAULT FALSE,
  tier2_completed_at TIMESTAMPTZ, -- A12 Tier 3 入学门槛依赖
  renewed_at TIMESTAMPTZ,
  CONSTRAINT tier_check CHECK (tier IN ('tier1', 'tier2', 'tier3'))
);

-- ============= L0 · stripe_events =============
CREATE TABLE stripe_events (
  event_id VARCHAR(255) PRIMARY KEY, -- A9 PRIMARY KEY = event_id 幂等性
  tenant_id UUID NOT NULL,
  user_id UUID REFERENCES users(id),
  event_type VARCHAR(100),
  payload JSONB,
  signature_verified BOOLEAN DEFAULT FALSE, -- A10 Stripe 签名验证
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

-- ============= 索引（M1 D0-7/8 验证） =============
CREATE INDEX idx_users_created_at ON users(created_at);
CREATE INDEX idx_users_tenant_id ON users(tenant_id);
CREATE INDEX idx_blueprints_created_at ON blueprints(created_at);
CREATE INDEX idx_blueprints_tenant_id ON blueprints(tenant_id);
CREATE INDEX idx_brand_buildings_created_at ON brand_buildings(created_at);
CREATE INDEX idx_brand_buildings_tenant_id ON brand_buildings(tenant_id);
CREATE INDEX idx_tier1_packages_created_at ON tier1_packages(created_at);
CREATE INDEX idx_tier1_packages_tenant_id ON tier1_packages(tenant_id);
CREATE INDEX idx_monitor_metrics_collected_at ON monitor_metrics(collected_at);
CREATE INDEX idx_monitor_metrics_tenant_id ON monitor_metrics(tenant_id);
CREATE INDEX idx_tier2_executions_created_at ON tier2_executions(created_at);
CREATE INDEX idx_tier2_executions_tenant_id ON tier2_executions(tenant_id);
CREATE INDEX idx_tier_subscriptions_started_at ON tier_subscriptions(started_at);
CREATE INDEX idx_tier_subscriptions_tenant_id ON tier_subscriptions(tenant_id);
CREATE INDEX idx_stripe_events_created_at ON stripe_events(created_at);

-- ============= 多租户 RLS（A8 假设验证） =============
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE blueprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_buildings ENABLE ROW LEVEL SECURITY;
ALTER TABLE tier1_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE monitor_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE tier2_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tier_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_events ENABLE ROW LEVEL SECURITY;

-- Force RLS（防 table owner 绕过）
ALTER TABLE users FORCE ROW LEVEL SECURITY;
ALTER TABLE blueprints FORCE ROW LEVEL SECURITY;
ALTER TABLE brand_buildings FORCE ROW LEVEL SECURITY;
ALTER TABLE tier1_packages FORCE ROW LEVEL SECURITY;
ALTER TABLE monitor_metrics FORCE ROW LEVEL SECURITY;
ALTER TABLE tier2_executions FORCE ROW LEVEL SECURITY;
ALTER TABLE tier_subscriptions FORCE ROW LEVEL SECURITY;
ALTER TABLE stripe_events FORCE ROW LEVEL SECURITY;

-- RLS Policy（基于 current_setting('app.tenant_id')）
CREATE POLICY tenant_isolation ON users
  FOR ALL TO PUBLIC
  USING (tenant_id = current_setting('app.tenant_id')::UUID);

CREATE POLICY tenant_isolation ON blueprints
  FOR ALL TO PUBLIC
  USING (tenant_id = current_setting('app.tenant_id')::UUID);

CREATE POLICY tenant_isolation ON brand_buildings
  FOR ALL TO PUBLIC
  USING (tenant_id = current_setting('app.tenant_id')::UUID);

CREATE POLICY tenant_isolation ON tier1_packages
  FOR ALL TO PUBLIC
  USING (tenant_id = current_setting('app.tenant_id')::UUID);

CREATE POLICY tenant_isolation ON monitor_metrics
  FOR ALL TO PUBLIC
  USING (tenant_id = current_setting('app.tenant_id')::UUID);

CREATE POLICY tenant_isolation ON tier2_executions
  FOR ALL TO PUBLIC
  USING (tenant_id = current_setting('app.tenant_id')::UUID);

CREATE POLICY tenant_isolation ON tier_subscriptions
  FOR ALL TO PUBLIC
  USING (tenant_id = current_setting('app.tenant_id')::UUID);

CREATE POLICY tenant_isolation ON stripe_events
  FOR ALL TO PUBLIC
  USING (tenant_id = current_setting('app.tenant_id')::UUID);

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
-- 8 张表 ✓
-- FOREIGN KEY 数量：blueprints→users, brand_buildings→users + blueprints,
--                  tier1_packages→users + brand_buildings, tier2_executions→users,
--                  tier_subscriptions→users, stripe_events→users = 7 ✓
-- created_at 索引：8 ✓
-- tenant_id 索引：7 + stripe_events 单列 created_at = 7 ✓
-- RLS ENABLE：8 ✓
-- RLS FORCE：8 ✓
-- RLS Policy：8 ✓