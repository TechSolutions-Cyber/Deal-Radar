-- Create push_subscriptions table for Web Push notifications
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, endpoint)
);

-- Create alert_preferences table for user notification settings
CREATE TABLE IF NOT EXISTS public.alert_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  supermarket_ids TEXT[] DEFAULT '{}', -- Array of supermarket IDs to alert on
  category_ids TEXT[] DEFAULT '{}',    -- Array of category IDs to alert on
  frequency TEXT DEFAULT 'daily',      -- 'daily' or 'weekly'
  email_enabled BOOLEAN DEFAULT true,
  push_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id)
);

-- Create alert_logs table for tracking sent alerts
CREATE TABLE IF NOT EXISTS public.alert_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL, -- 'push' or 'email'
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  deal_count INTEGER DEFAULT 0
);

-- Create unsubscribe_tokens table for one-click email unsubscribe
CREATE TABLE IF NOT EXISTS public.unsubscribe_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  used BOOLEAN DEFAULT false,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP + INTERVAL '1 year',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id
  ON public.push_subscriptions(user_id);

CREATE INDEX IF NOT EXISTS idx_alert_preferences_user_id
  ON public.alert_preferences(user_id);

CREATE INDEX IF NOT EXISTS idx_alert_logs_user_id
  ON public.alert_logs(user_id);

CREATE INDEX IF NOT EXISTS idx_alert_logs_sent_at
  ON public.alert_logs(sent_at DESC);

CREATE INDEX IF NOT EXISTS idx_unsubscribe_tokens_user_id
  ON public.unsubscribe_tokens(user_id);

CREATE INDEX IF NOT EXISTS idx_unsubscribe_tokens_token
  ON public.unsubscribe_tokens(token);

-- Set row-level security policies
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alert_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alert_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.unsubscribe_tokens ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see their own push subscriptions
CREATE POLICY push_subscriptions_select ON public.push_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY push_subscriptions_insert ON public.push_subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY push_subscriptions_delete ON public.push_subscriptions
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policy: Users can only see their own alert preferences
CREATE POLICY alert_preferences_select ON public.alert_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY alert_preferences_insert ON public.alert_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY alert_preferences_update ON public.alert_preferences
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policy: Users can only see their own alert logs
CREATE POLICY alert_logs_select ON public.alert_logs
  FOR SELECT USING (auth.uid() = user_id);

-- RLS Policy: Service role can insert into alert_logs (for cron job)
CREATE POLICY alert_logs_insert_service ON public.alert_logs
  FOR INSERT WITH CHECK (true);

-- RLS Policy: Users can only see their own unsubscribe tokens
CREATE POLICY unsubscribe_tokens_select ON public.unsubscribe_tokens
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY unsubscribe_tokens_insert ON public.unsubscribe_tokens
  FOR INSERT WITH CHECK (auth.uid() = user_id);
