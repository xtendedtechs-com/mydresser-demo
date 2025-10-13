-- Create app_versions table for version tracking and changelog
CREATE TABLE IF NOT EXISTS public.app_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version TEXT NOT NULL UNIQUE,
  release_date DATE NOT NULL DEFAULT CURRENT_DATE,
  changelog JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_current BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.app_versions ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read versions (public info)
CREATE POLICY "Anyone can view app versions"
  ON public.app_versions
  FOR SELECT
  USING (true);

-- Only admins can manage versions
CREATE POLICY "Admins can manage app versions"
  ON public.app_versions
  FOR ALL
  USING (public.is_admin(auth.uid()));

-- Insert current version
INSERT INTO public.app_versions (version, release_date, changelog, is_current)
VALUES (
  '1.0.0',
  '2025-01-15',
  '[
    {
      "category": "Core Features",
      "items": [
        "Complete Wardrobe Management System with AI-powered organization",
        "Daily Outfit Recommendations based on weather, schedule, and preferences",
        "Advanced Dresser algorithm with multi-level scoring system",
        "Collections and Lists with AI-powered suggestions"
      ]
    },
    {
      "category": "Marketplace",
      "items": [
        "MyDresser Market for purchasing new items",
        "2ndDresser circular fashion marketplace",
        "Merchant POS Terminal integration",
        "Virtual Try-On (MyMirror) capabilities"
      ]
    },
    {
      "category": "Social Features",
      "items": [
        "Social feed with posts, reactions, and comments",
        "User following system",
        "Style sharing and inspiration",
        "Community engagement features"
      ]
    },
    {
      "category": "AI & Intelligence",
      "items": [
        "AI Style Hub with personalized recommendations",
        "Smart wardrobe analytics and insights",
        "Automated outfit matching",
        "Style personality profiling"
      ]
    },
    {
      "category": "Security & Privacy",
      "items": [
        "Multi-level authentication system",
        "Row-level security policies",
        "Secure merchant data handling",
        "Privacy-first design"
      ]
    },
    {
      "category": "Business Features",
      "items": [
        "Merchant profiles and verification",
        "POS terminal management",
        "Inventory synchronization",
        "Sales and analytics tracking"
      ]
    }
  ]'::jsonb,
  true
);