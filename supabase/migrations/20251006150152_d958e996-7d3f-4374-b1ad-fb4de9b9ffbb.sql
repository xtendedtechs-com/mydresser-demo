-- Restrict public access to ai_rate_limits_config
DROP POLICY IF EXISTS "Anyone can view rate limits" ON public.ai_rate_limits_config;

CREATE POLICY "Authenticated users can view rate limits"
ON public.ai_rate_limits_config
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL);
