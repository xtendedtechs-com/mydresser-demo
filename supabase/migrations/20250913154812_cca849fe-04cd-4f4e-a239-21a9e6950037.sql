-- Enable Row Level Security on user_mfa_status table
ALTER TABLE public.user_mfa_status ENABLE ROW LEVEL SECURITY;

-- Enable Row Level Security on provider_subscription_view
ALTER TABLE public.provider_subscription_view ENABLE ROW LEVEL SECURITY;

-- RLS Policy for user_mfa_status: Users can only view their own MFA status
CREATE POLICY "Users can view their own MFA status" 
ON public.user_mfa_status 
FOR SELECT 
USING (auth.uid() = user_id);

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