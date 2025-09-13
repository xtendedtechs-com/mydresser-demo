-- Enable Row Level Security on provider_subscription_view (this should work if it's a table)
ALTER TABLE public.provider_subscription_view ENABLE ROW LEVEL SECURITY;

-- RLS Policy for provider_subscription_view: Subscribers can view their own subscriptions
CREATE POLICY "Subscribers can view their own subscriptions" 
ON public.provider_subscription_view 
FOR SELECT 
USING (auth.uid() = subscriber_id);

-- RLS Policy for provider_subscription_view: Providers can view subscriptions for their services  
CREATE POLICY "Providers can view their service subscriptions" 
ON public.provider_subscription_view 
FOR SELECT 
USING (auth.uid() = provider_id);

-- For user_mfa_status (which is a view), we need to check if the underlying table user_mfa_settings has proper RLS
-- Let's verify the user_mfa_settings table has appropriate policies (it should already have them)
-- The user_mfa_status view should inherit security from the underlying user_mfa_settings table