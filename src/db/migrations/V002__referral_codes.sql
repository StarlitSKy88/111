-- ONE-MCN V002 migration · 2026-06-23
-- 新增 referral_codes 表 + 索引
-- v5.4 — 推荐链接生成 + 佣金跟踪

CREATE TABLE IF NOT EXISTS referral_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL,
  code VARCHAR(20) UNIQUE NOT NULL,
  used_count INT DEFAULT 0,
  total_revenue_cny NUMERIC DEFAULT 0,
  total_commission_cny NUMERIC DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX referral_codes_user_id_idx ON referral_codes(user_id);
CREATE INDEX referral_codes_code_idx ON referral_codes(code);

-- 推荐记录表（被推荐用户 → 推荐人）
CREATE TABLE IF NOT EXISTS referral_attributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES users(id),
  referred_user_id UUID NOT NULL REFERENCES users(id),
  referral_code VARCHAR(20) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- pending / converted / churned
  first_payment_at TIMESTAMPTZ,
  total_payment_cny NUMERIC DEFAULT 0,
  commission_paid_cny NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX referral_attributions_referrer_idx ON referral_attributions(referrer_id);
CREATE INDEX referral_attributions_referred_idx ON referral_attributions(referred_user_id);

-- RLS
ALTER TABLE referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_codes FORCE ROW LEVEL SECURITY;
ALTER TABLE referral_attributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_attributions FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON referral_codes FOR ALL TO PUBLIC
  USING (tenant_id = current_setting('app.tenant_id')::UUID);
CREATE POLICY tenant_isolation ON referral_attributions FOR ALL TO PUBLIC
  USING (
    referrer_id IN (
      SELECT id FROM users WHERE tenant_id = current_setting('app.tenant_id')::UUID
    )
  );