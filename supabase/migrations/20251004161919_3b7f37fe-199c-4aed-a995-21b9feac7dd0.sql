-- Create blocked_users table
CREATE TABLE IF NOT EXISTS public.blocked_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  blocked_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  blocked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, blocked_user_id)
);

-- Enable RLS
ALTER TABLE public.blocked_users ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own blocked users" 
  ON public.blocked_users FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can block other users" 
  ON public.blocked_users FOR INSERT 
  WITH CHECK (auth.uid() = user_id AND user_id != blocked_user_id);

CREATE POLICY "Users can unblock users"
  ON public.blocked_users FOR DELETE 
  USING (auth.uid() = user_id);

-- Create muted_users table
CREATE TABLE IF NOT EXISTS public.muted_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  muted_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  muted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  muted_until TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, muted_user_id)
);

-- Enable RLS
ALTER TABLE public.muted_users ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own muted users" 
  ON public.muted_users FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can mute other users" 
  ON public.muted_users FOR INSERT 
  WITH CHECK (auth.uid() = user_id AND user_id != muted_user_id);

CREATE POLICY "Users can unmute users"
  ON public.muted_users FOR DELETE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update mute duration"
  ON public.muted_users FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create reports table
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reported_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  report_type TEXT NOT NULL CHECK (report_type IN ('user', 'post', 'item', 'comment')),
  reported_id UUID NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  reviewed_by UUID REFERENCES auth.users(id),
  resolution_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own reports" 
  ON public.reports FOR SELECT 
  USING (auth.uid() = reporter_id);

CREATE POLICY "Users can create reports" 
  ON public.reports FOR INSERT 
  WITH CHECK (auth.uid() = reporter_id);

-- Create indexes
CREATE INDEX idx_blocked_users_user_id ON public.blocked_users(user_id);
CREATE INDEX idx_muted_users_user_id ON public.muted_users(user_id);
CREATE INDEX idx_reports_reporter_id ON public.reports(reporter_id);
CREATE INDEX idx_reports_status ON public.reports(status);

-- Create trigger for reports updated_at
CREATE TRIGGER update_reports_updated_at
  BEFORE UPDATE ON public.reports
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();