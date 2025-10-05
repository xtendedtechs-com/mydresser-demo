-- Phase 25: Smart Lists & Collection Security Enhancement

-- 1. Security Definer Function for Collection Access (Prevents RLS Recursion)
CREATE OR REPLACE FUNCTION public.can_access_collection(
  collection_id_param UUID,
  user_id_param UUID DEFAULT auth.uid()
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.wardrobe_collections
    WHERE id = collection_id_param
      AND (user_id = user_id_param OR is_public = true)
  )
$$;

-- 2. Collection Access Audit Log Table
CREATE TABLE IF NOT EXISTS public.collection_access_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  collection_id UUID REFERENCES public.wardrobe_collections(id) ON DELETE CASCADE,
  action TEXT NOT NULL, -- 'view', 'create', 'update', 'delete', 'share'
  ip_address INET,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE public.collection_access_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Audit Log
CREATE POLICY "Users can view their own collection access logs"
  ON public.collection_access_log
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert collection access logs"
  ON public.collection_access_log
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins can view all logs
CREATE POLICY "Admins can view all collection access logs"
  ON public.collection_access_log
  FOR SELECT
  USING (public.is_admin(auth.uid()));

-- 3. Rate Limiting for Collection Operations
CREATE TABLE IF NOT EXISTS public.collection_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  action TEXT NOT NULL, -- 'create', 'update', 'delete', 'share'
  attempt_count INTEGER NOT NULL DEFAULT 1,
  window_start TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, action)
);

-- Enable RLS
ALTER TABLE public.collection_rate_limits ENABLE ROW LEVEL SECURITY;

-- RLS Policy
CREATE POLICY "Users can view their own rate limits"
  ON public.collection_rate_limits
  FOR SELECT
  USING (auth.uid() = user_id);

-- 4. Rate Limit Check Function
CREATE OR REPLACE FUNCTION public.check_collection_rate_limit(
  action_type TEXT,
  max_attempts INTEGER DEFAULT 20,
  window_minutes INTEGER DEFAULT 60
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_attempts INTEGER;
  window_start_time TIMESTAMPTZ;
  blocked BOOLEAN := false;
BEGIN
  window_start_time := now() - (window_minutes || ' minutes')::interval;
  
  -- Clean up old rate limit records
  DELETE FROM public.collection_rate_limits 
  WHERE window_start < window_start_time;
  
  -- Get current attempt count
  SELECT COALESCE(SUM(attempt_count), 0) INTO current_attempts
  FROM public.collection_rate_limits
  WHERE user_id = auth.uid() 
    AND action = action_type
    AND window_start > window_start_time;
  
  -- Check if limit exceeded
  IF current_attempts >= max_attempts THEN
    blocked := true;
    
    -- Log rate limit violation
    INSERT INTO public.security_audit_log (
      user_id, action, resource, success, details
    ) VALUES (
      auth.uid(),
      'collection_rate_limit_exceeded',
      'collection_rate_limits',
      false,
      jsonb_build_object(
        'action_type', action_type,
        'current_attempts', current_attempts,
        'limit', max_attempts
      )
    );
  ELSE
    -- Record this attempt
    INSERT INTO public.collection_rate_limits (user_id, action, window_start)
    VALUES (auth.uid(), action_type, now())
    ON CONFLICT (user_id, action) DO UPDATE SET
      attempt_count = collection_rate_limits.attempt_count + 1,
      window_start = GREATEST(collection_rate_limits.window_start, window_start_time);
  END IF;
  
  RETURN jsonb_build_object(
    'allowed', NOT blocked,
    'current_attempts', current_attempts,
    'limit', max_attempts,
    'window_minutes', window_minutes
  );
END;
$$;

-- 5. Secure Collection Access Function
CREATE OR REPLACE FUNCTION public.get_collection_secure(
  collection_id_param UUID
)
RETURNS TABLE(
  id UUID,
  name TEXT,
  description TEXT,
  cover_image TEXT,
  is_public BOOLEAN,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check rate limit
  IF NOT (public.check_collection_rate_limit('view', 100, 10)->>'allowed')::boolean THEN
    RAISE EXCEPTION 'Rate limit exceeded for collection access';
  END IF;
  
  -- Check access permission
  IF NOT public.can_access_collection(collection_id_param, auth.uid()) THEN
    RAISE EXCEPTION 'Access denied to this collection';
  END IF;
  
  -- Log access
  INSERT INTO public.collection_access_log (
    user_id, collection_id, action
  ) VALUES (
    auth.uid(), collection_id_param, 'view'
  );
  
  -- Return collection data
  RETURN QUERY
  SELECT 
    wc.id,
    wc.name,
    wc.description,
    wc.cover_image,
    wc.is_public,
    wc.created_at
  FROM public.wardrobe_collections wc
  WHERE wc.id = collection_id_param
    AND (wc.user_id = auth.uid() OR wc.is_public = true);
END;
$$;

-- 6. Smart List Evaluation Function
CREATE OR REPLACE FUNCTION public.evaluate_smart_list(
  list_id_param UUID
)
RETURNS TABLE(
  item_id UUID,
  item_name TEXT,
  item_category TEXT,
  item_color TEXT,
  match_score INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  list_criteria JSONB;
  list_user_id UUID;
BEGIN
  -- Get smart list criteria
  SELECT criteria, user_id INTO list_criteria, list_user_id
  FROM public.smart_lists
  WHERE id = list_id_param;
  
  -- Verify ownership
  IF list_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Access denied to this smart list';
  END IF;
  
  -- Evaluate items based on criteria
  RETURN QUERY
  SELECT 
    wi.id,
    wi.name,
    wi.category,
    wi.color,
    CASE
      -- Score based on criteria matching
      WHEN list_criteria->>'category' IS NOT NULL AND wi.category = list_criteria->>'category' THEN 100
      WHEN list_criteria->>'color' IS NOT NULL AND wi.color = list_criteria->>'color' THEN 90
      WHEN list_criteria->>'brand' IS NOT NULL AND wi.brand = list_criteria->>'brand' THEN 85
      ELSE 50
    END as match_score
  FROM public.wardrobe_items wi
  WHERE wi.user_id = auth.uid()
    -- Apply criteria filters
    AND (
      list_criteria->>'category' IS NULL OR wi.category = list_criteria->>'category'
    )
    AND (
      list_criteria->>'color' IS NULL OR wi.color = list_criteria->>'color'
    )
    AND (
      list_criteria->>'brand' IS NULL OR wi.brand = list_criteria->>'brand'
    )
    AND (
      list_criteria->>'season' IS NULL OR wi.season = list_criteria->>'season'
    )
  ORDER BY match_score DESC;
END;
$$;

-- 7. Enhanced RLS Policies for Collections (Replace existing if needed)
DROP POLICY IF EXISTS "Users can manage their own collections" ON public.wardrobe_collections;

CREATE POLICY "Users can view accessible collections"
  ON public.wardrobe_collections
  FOR SELECT
  USING (public.can_access_collection(id, auth.uid()));

CREATE POLICY "Users can create collections with rate limit"
  ON public.wardrobe_collections
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id 
    AND (public.check_collection_rate_limit('create', 10, 60)->>'allowed')::boolean
  );

CREATE POLICY "Users can update own collections with rate limit"
  ON public.wardrobe_collections
  FOR UPDATE
  USING (
    auth.uid() = user_id
    AND (public.check_collection_rate_limit('update', 30, 60)->>'allowed')::boolean
  );

CREATE POLICY "Users can delete own collections with rate limit"
  ON public.wardrobe_collections
  FOR DELETE
  USING (
    auth.uid() = user_id
    AND (public.check_collection_rate_limit('delete', 10, 60)->>'allowed')::boolean
  );

-- 8. Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_collection_access_log_user_id ON public.collection_access_log(user_id);
CREATE INDEX IF NOT EXISTS idx_collection_access_log_created_at ON public.collection_access_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_collection_rate_limits_user_action ON public.collection_rate_limits(user_id, action);
CREATE INDEX IF NOT EXISTS idx_smart_lists_user_id ON public.smart_lists(user_id);

-- 9. Trigger for Collection Activity Logging
CREATE OR REPLACE FUNCTION public.log_collection_activity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.collection_access_log (user_id, collection_id, action, metadata)
    VALUES (auth.uid(), NEW.id, 'create', jsonb_build_object('name', NEW.name));
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.collection_access_log (user_id, collection_id, action, metadata)
    VALUES (auth.uid(), NEW.id, 'update', jsonb_build_object(
      'old_name', OLD.name, 
      'new_name', NEW.name,
      'visibility_changed', OLD.is_public != NEW.is_public
    ));
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.collection_access_log (user_id, collection_id, action, metadata)
    VALUES (auth.uid(), OLD.id, 'delete', jsonb_build_object('name', OLD.name));
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trigger_log_collection_activity ON public.wardrobe_collections;
CREATE TRIGGER trigger_log_collection_activity
  AFTER INSERT OR UPDATE OR DELETE ON public.wardrobe_collections
  FOR EACH ROW
  EXECUTE FUNCTION public.log_collection_activity();

-- 10. Comment documentation
COMMENT ON FUNCTION public.can_access_collection IS 'Security definer function to check collection access without RLS recursion';
COMMENT ON FUNCTION public.check_collection_rate_limit IS 'Rate limiting for collection operations to prevent abuse';
COMMENT ON FUNCTION public.get_collection_secure IS 'Secure collection access with rate limiting and audit logging';
COMMENT ON FUNCTION public.evaluate_smart_list IS 'Dynamically evaluates smart list criteria against wardrobe items';
COMMENT ON TABLE public.collection_access_log IS 'Audit log for all collection access and modifications';
COMMENT ON TABLE public.collection_rate_limits IS 'Rate limiting tracking for collection operations';