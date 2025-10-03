-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}'::jsonb,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  action_url TEXT
);

-- Create user_activity table for tracking
CREATE TABLE IF NOT EXISTS public.user_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  activity_type TEXT NOT NULL,
  activity_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create style_preferences table
CREATE TABLE IF NOT EXISTS public.style_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  favorite_colors TEXT[] DEFAULT ARRAY[]::TEXT[],
  favorite_brands TEXT[] DEFAULT ARRAY[]::TEXT[],
  style_keywords TEXT[] DEFAULT ARRAY[]::TEXT[],
  preferred_occasions TEXT[] DEFAULT ARRAY[]::TEXT[],
  body_type TEXT,
  size_preferences JSONB DEFAULT '{}'::jsonb,
  budget_range JSONB DEFAULT '{}'::jsonb,
  sustainability_priority INTEGER DEFAULT 50,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.style_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notifications
CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications"
  ON public.notifications FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for user_activity
CREATE POLICY "Users can view their own activity"
  ON public.user_activity FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can log activity"
  ON public.user_activity FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for style_preferences
CREATE POLICY "Users can manage their own style preferences"
  ON public.style_preferences FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Enable realtime for notifications
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Function to create notification
CREATE OR REPLACE FUNCTION public.create_notification(
  target_user_id UUID,
  notification_type TEXT,
  notification_title TEXT,
  notification_message TEXT,
  notification_data JSONB DEFAULT '{}'::jsonb,
  notification_action_url TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_notification_id UUID;
BEGIN
  INSERT INTO public.notifications (
    user_id,
    type,
    title,
    message,
    data,
    action_url
  ) VALUES (
    target_user_id,
    notification_type,
    notification_title,
    notification_message,
    notification_data,
    notification_action_url
  ) RETURNING id INTO new_notification_id;
  
  RETURN new_notification_id;
END;
$$;

-- Function to log user activity
CREATE OR REPLACE FUNCTION public.log_user_activity(
  activity_type_param TEXT,
  activity_data_param JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  activity_id UUID;
BEGIN
  INSERT INTO public.user_activity (
    user_id,
    activity_type,
    activity_data
  ) VALUES (
    auth.uid(),
    activity_type_param,
    activity_data_param
  ) RETURNING id INTO activity_id;
  
  RETURN activity_id;
END;
$$;

-- Trigger to create notification when someone follows you
CREATE OR REPLACE FUNCTION public.notify_on_follow()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  follower_name TEXT;
BEGIN
  -- Get follower's name
  SELECT full_name INTO follower_name
  FROM profiles
  WHERE user_id = NEW.follower_id;
  
  -- Create notification
  PERFORM create_notification(
    NEW.following_id,
    'new_follower',
    'New Follower',
    follower_name || ' started following you',
    jsonb_build_object('follower_id', NEW.follower_id),
    '/social'
  );
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_user_follow
  AFTER INSERT ON public.user_follows
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_follow();

-- Trigger to create notification when someone reacts to your post
CREATE OR REPLACE FUNCTION public.notify_on_reaction()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  post_owner_id UUID;
  reactor_name TEXT;
BEGIN
  -- Only notify for posts (not for other target types)
  IF NEW.target_type = 'social_post' THEN
    -- Get post owner
    SELECT user_id INTO post_owner_id
    FROM social_posts
    WHERE id = NEW.target_id;
    
    -- Don't notify if user reacted to their own post
    IF post_owner_id != NEW.user_id THEN
      -- Get reactor's name
      SELECT full_name INTO reactor_name
      FROM profiles
      WHERE user_id = NEW.user_id;
      
      -- Create notification
      PERFORM create_notification(
        post_owner_id,
        'post_reaction',
        'New Reaction',
        reactor_name || ' reacted to your post',
        jsonb_build_object('post_id', NEW.target_id, 'user_id', NEW.user_id),
        '/social'
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_post_reaction
  AFTER INSERT ON public.reactions
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_reaction();

-- Trigger to create notification when someone comments on your post
CREATE OR REPLACE FUNCTION public.notify_on_comment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  post_owner_id UUID;
  commenter_name TEXT;
BEGIN
  -- Get post owner
  SELECT user_id INTO post_owner_id
  FROM social_posts
  WHERE id = NEW.post_id;
  
  -- Don't notify if user commented on their own post
  IF post_owner_id != NEW.user_id THEN
    -- Get commenter's name
    SELECT full_name INTO commenter_name
    FROM profiles
    WHERE user_id = NEW.user_id;
    
    -- Create notification
    PERFORM create_notification(
      post_owner_id,
      'post_comment',
      'New Comment',
      commenter_name || ' commented on your post',
      jsonb_build_object('post_id', NEW.post_id, 'comment_id', NEW.id),
      '/social'
    );
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_post_comment
  AFTER INSERT ON public.social_comments
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_comment();

-- Update trigger for style_preferences
CREATE TRIGGER update_style_preferences_updated_at
  BEFORE UPDATE ON public.style_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();