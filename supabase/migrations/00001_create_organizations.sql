CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  plan TEXT NOT NULL DEFAULT 'trial',
  plan_started_at TIMESTAMPTZ,
  trial_ends_at TIMESTAMPTZ DEFAULT now() + interval '14 days',
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  monthly_ai_credits_used INT DEFAULT 0,
  monthly_ai_credits_limit INT DEFAULT 100,
  credits_reset_at TIMESTAMPTZ DEFAULT date_trunc('month', now()) + interval '1 month',
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
