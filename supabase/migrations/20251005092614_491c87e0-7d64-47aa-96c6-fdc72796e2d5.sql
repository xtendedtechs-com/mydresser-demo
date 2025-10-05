-- Phase 35.5: Community Features - Real Data Implementation

-- Style Challenges Tables
CREATE TABLE IF NOT EXISTS public.style_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('seasonal', 'sustainable', 'budget', 'creative')),
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  prize TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'completed')),
  is_trending BOOLEAN DEFAULT false,
  participants_count INTEGER DEFAULT 0,
  submissions_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.challenge_participations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID NOT NULL REFERENCES public.style_challenges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(challenge_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.challenge_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID NOT NULL REFERENCES public.style_challenges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  description TEXT NOT NULL,
  image_urls TEXT[] NOT NULL,
  outfit_items UUID[],
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  submitted_at TIMESTAMPTZ DEFAULT now(),
  is_winner BOOLEAN DEFAULT false
);

-- Fashion Events Tables
CREATE TABLE IF NOT EXISTS public.fashion_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('virtual', 'physical', 'hybrid')),
  category TEXT NOT NULL CHECK (category IN ('workshop', 'fashion-show', 'meetup', 'webinar')),
  event_date DATE NOT NULL,
  event_time TEXT NOT NULL,
  location TEXT NOT NULL,
  host_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  host_name TEXT NOT NULL,
  attendees_count INTEGER DEFAULT 0,
  max_attendees INTEGER,
  price NUMERIC DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.event_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.fashion_events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  registration_status TEXT DEFAULT 'registered' CHECK (registration_status IN ('registered', 'attended', 'cancelled')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
  registered_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(event_id, user_id)
);

-- Influencer Program Tables
CREATE TABLE IF NOT EXISTS public.influencer_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  application_status TEXT DEFAULT 'pending' CHECK (application_status IN ('pending', 'approved', 'rejected')),
  tier TEXT DEFAULT 'bronze' CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum')),
  social_profiles JSONB NOT NULL,
  follower_count INTEGER DEFAULT 0,
  engagement_rate NUMERIC DEFAULT 0,
  commission_rate NUMERIC DEFAULT 5.0,
  total_earnings NUMERIC DEFAULT 0,
  total_conversions INTEGER DEFAULT 0,
  applied_at TIMESTAMPTZ DEFAULT now(),
  approved_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  UNIQUE(user_id)
);

CREATE TABLE IF NOT EXISTS public.influencer_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  influencer_id UUID NOT NULL REFERENCES public.influencer_applications(user_id) ON DELETE CASCADE,
  referred_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  referral_code TEXT NOT NULL,
  order_id UUID,
  commission_earned NUMERIC DEFAULT 0,
  conversion_status TEXT DEFAULT 'pending' CHECK (conversion_status IN ('pending', 'converted', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT now(),
  converted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_type TEXT NOT NULL,
  achievement_name TEXT NOT NULL,
  description TEXT,
  points_earned INTEGER DEFAULT 0,
  earned_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_challenges_status ON public.style_challenges(status, start_date);
CREATE INDEX IF NOT EXISTS idx_challenges_trending ON public.style_challenges(is_trending) WHERE is_trending = true;
CREATE INDEX IF NOT EXISTS idx_challenge_participations_user ON public.challenge_participations(user_id);
CREATE INDEX IF NOT EXISTS idx_challenge_submissions_challenge ON public.challenge_submissions(challenge_id);
CREATE INDEX IF NOT EXISTS idx_events_date ON public.fashion_events(event_date, event_type);
CREATE INDEX IF NOT EXISTS idx_events_featured ON public.fashion_events(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_event_registrations_user ON public.event_registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_influencer_tier ON public.influencer_applications(tier, application_status);

-- RLS Policies
ALTER TABLE public.style_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_participations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fashion_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.influencer_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.influencer_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- Style Challenges Policies
CREATE POLICY "Anyone can view active challenges" ON public.style_challenges
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage challenges" ON public.style_challenges
  FOR ALL USING (is_admin(auth.uid()));

CREATE POLICY "Users can join challenges" ON public.challenge_participations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their participations" ON public.challenge_participations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view challenge submissions" ON public.challenge_submissions
  FOR SELECT USING (true);

CREATE POLICY "Users can create submissions" ON public.challenge_submissions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own submissions" ON public.challenge_submissions
  FOR UPDATE USING (auth.uid() = user_id);

-- Events Policies
CREATE POLICY "Anyone can view events" ON public.fashion_events
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create events" ON public.fashion_events
  FOR INSERT WITH CHECK (auth.uid() = host_id);

CREATE POLICY "Event hosts can update their events" ON public.fashion_events
  FOR UPDATE USING (auth.uid() = host_id);

CREATE POLICY "Users can register for events" ON public.event_registrations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their registrations" ON public.event_registrations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can cancel their registrations" ON public.event_registrations
  FOR UPDATE USING (auth.uid() = user_id);

-- Influencer Program Policies
CREATE POLICY "Users can apply to influencer program" ON public.influencer_applications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own application" ON public.influencer_applications
  FOR SELECT USING (auth.uid() = user_id OR application_status = 'approved');

CREATE POLICY "Admins can manage applications" ON public.influencer_applications
  FOR ALL USING (is_admin(auth.uid()));

CREATE POLICY "Influencers can view their referrals" ON public.influencer_referrals
  FOR SELECT USING (auth.uid() = influencer_id);

CREATE POLICY "Users can view their achievements" ON public.user_achievements
  FOR SELECT USING (auth.uid() = user_id);

-- Triggers for Auto-updating Counters
CREATE OR REPLACE FUNCTION update_challenge_participants_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.style_challenges 
    SET participants_count = participants_count + 1 
    WHERE id = NEW.challenge_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.style_challenges 
    SET participants_count = GREATEST(0, participants_count - 1) 
    WHERE id = OLD.challenge_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION update_challenge_submissions_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.style_challenges 
    SET submissions_count = submissions_count + 1 
    WHERE id = NEW.challenge_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.style_challenges 
    SET submissions_count = GREATEST(0, submissions_count - 1) 
    WHERE id = OLD.challenge_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION update_event_attendees_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.registration_status = 'registered' THEN
    UPDATE public.fashion_events 
    SET attendees_count = attendees_count + 1 
    WHERE id = NEW.event_id;
  ELSIF TG_OP = 'UPDATE' AND OLD.registration_status = 'registered' AND NEW.registration_status = 'cancelled' THEN
    UPDATE public.fashion_events 
    SET attendees_count = GREATEST(0, attendees_count - 1) 
    WHERE id = NEW.event_id;
  ELSIF TG_OP = 'DELETE' AND OLD.registration_status = 'registered' THEN
    UPDATE public.fashion_events 
    SET attendees_count = GREATEST(0, attendees_count - 1) 
    WHERE id = OLD.event_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_challenge_participants_trigger
  AFTER INSERT OR DELETE ON public.challenge_participations
  FOR EACH ROW EXECUTE FUNCTION update_challenge_participants_count();

CREATE TRIGGER update_challenge_submissions_trigger
  AFTER INSERT OR DELETE ON public.challenge_submissions
  FOR EACH ROW EXECUTE FUNCTION update_challenge_submissions_count();

CREATE TRIGGER update_event_attendees_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.event_registrations
  FOR EACH ROW EXECUTE FUNCTION update_event_attendees_count();

-- Insert Sample Data
INSERT INTO public.style_challenges (title, description, category, difficulty, start_date, end_date, prize, status, is_trending) VALUES
  ('Sustainable Summer Style', 'Create an eco-friendly summer outfit using only sustainable brands and materials', 'sustainable', 'medium', CURRENT_DATE - INTERVAL '15 days', CURRENT_DATE + INTERVAL '15 days', '$500 Gift Card', 'active', true),
  ('Minimalist Wardrobe Challenge', 'Style 10 different looks with only 15 clothing items', 'creative', 'hard', CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', 'Feature on Homepage', 'active', false),
  ('Budget Fashion Week', 'Create runway-worthy looks with items under $50', 'budget', 'easy', CURRENT_DATE + INTERVAL '7 days', CURRENT_DATE + INTERVAL '21 days', '$200 Shopping Spree', 'upcoming', true);

INSERT INTO public.fashion_events (title, description, event_type, category, event_date, event_time, location, host_name, price, is_featured) VALUES
  ('Sustainable Fashion Workshop', 'Learn how to build an eco-friendly wardrobe with expert stylist', 'virtual', 'workshop', CURRENT_DATE + INTERVAL '10 days', '18:00 - 20:00', 'Zoom', 'Sarah Chen', 0, true),
  ('Summer Fashion Week 2025', 'Exclusive runway show featuring emerging designers and latest trends', 'physical', 'fashion-show', CURRENT_DATE + INTERVAL '45 days', '19:00 - 22:00', 'NYC Fashion District', 'Fashion Forward', 75, true),
  ('Style Influencer Meetup', 'Network with fashion influencers and content creators in your area', 'physical', 'meetup', CURRENT_DATE + INTERVAL '23 days', '14:00 - 17:00', 'Los Angeles, CA', 'StyleConnect', 25, false);

-- Function to update challenge status based on dates
CREATE OR REPLACE FUNCTION update_challenge_status()
RETURNS void AS $$
BEGIN
  UPDATE public.style_challenges
  SET status = CASE
    WHEN CURRENT_DATE < start_date THEN 'upcoming'
    WHEN CURRENT_DATE > end_date THEN 'completed'
    ELSE 'active'
  END
  WHERE status != 'completed';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;