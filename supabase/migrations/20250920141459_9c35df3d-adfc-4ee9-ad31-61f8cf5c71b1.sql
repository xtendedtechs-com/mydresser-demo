-- MyDresser AI Application: Foundation Database Schema
-- Phase 1: Core Tables, Security, and Authentication

-- Create custom types
CREATE TYPE auth_level AS ENUM ('base', 'intermediate', 'advanced');
CREATE TYPE user_role AS ENUM ('private', 'professional', 'merchant', 'admin');
CREATE TYPE verification_status AS ENUM ('pending', 'under_review', 'verified', 'rejected');

-- Profiles table (core user data)
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  role user_role NOT NULL DEFAULT 'private',
  auth_level auth_level NOT NULL DEFAULT 'base',
  bio TEXT,
  location TEXT,
  style_score INTEGER DEFAULT 0,
  privacy_settings JSONB DEFAULT '{"profile_visibility": "private", "show_wardrobe": false, "allow_messages": true, "show_activity": false, "location_sharing": false}',
  is_profile_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User preferences (settings and customization)
CREATE TABLE public.user_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  theme TEXT DEFAULT 'system',
  language TEXT DEFAULT 'en',
  extended_theme JSONB DEFAULT '{
    "gradient_backgrounds": true,
    "animated_transitions": true,
    "card_style": "default",
    "border_radius": "medium",
    "shadow_intensity": "medium",
    "button_style": "default",
    "icon_style": "outline",
    "component_density": "normal",
    "color_scheme_type": "vibrant",
    "custom_css": ""
  }',
  privacy_settings JSONB DEFAULT '{
    "profile_visibility": "private",
    "show_wardrobe": false,
    "allow_messages": true,
    "show_activity": false,
    "location_sharing": false
  }',
  notifications JSONB DEFAULT '{
    "outfit_suggestions": true,
    "laundry_reminders": true,
    "market_updates": false,
    "social_activity": true
  }',
  suggestion_settings JSONB DEFAULT '{
    "ai_outfit_suggestions": true,
    "weather_integration": true,
    "calendar_integration": false,
    "style_learning": true
  }',
  app_behavior JSONB DEFAULT '{
    "auto_categorize": true,
    "smart_organization": true,
    "proactive_suggestions": true
  }',
  accessibility_settings JSONB DEFAULT '{
    "large_text": false,
    "high_contrast": false,
    "reduce_motion": false,
    "voice_navigation": false,
    "keyboard_navigation": false,
    "color_blind_friendly": false,
    "font_size_multiplier": 1.0,
    "screen_reader_support": false
  }',
  marketplace_settings JSONB DEFAULT '{
    "allow_selling": false,
    "payment_methods": [],
    "show_price_history": true,
    "auto_suggest_prices": true,
    "shipping_preferences": {}
  }',
  laundry_settings JSONB DEFAULT '{
    "smart_suggestions": true,
    "auto_sort_by_color": true,
    "care_label_warnings": true,
    "reminder_notifications": true
  }',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Wardrobes (physical storage spaces)
CREATE TABLE public.wardrobes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  type TEXT DEFAULT 'closet',
  location TEXT,
  dimensions JSONB,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Wardrobe items (clothing inventory)
CREATE TABLE public.wardrobe_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  wardrobe_id UUID REFERENCES public.wardrobes(id),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  brand TEXT,
  color TEXT,
  size TEXT,
  material TEXT,
  season TEXT,
  occasion TEXT,
  condition TEXT DEFAULT 'excellent',
  purchase_date DATE,
  purchase_price NUMERIC,
  photos JSONB,
  last_worn DATE,
  wear_count INTEGER DEFAULT 0,
  is_favorite BOOLEAN DEFAULT false,
  tags TEXT[],
  location_in_wardrobe TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Outfits (styled combinations)
CREATE TABLE public.outfits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT,
  season TEXT,
  occasion TEXT,
  weather_conditions JSONB,
  is_favorite BOOLEAN DEFAULT false,
  is_ai_generated BOOLEAN DEFAULT false,
  ai_generation_prompt TEXT,
  photos JSONB,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Outfit items (junction table)
CREATE TABLE public.outfit_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  outfit_id UUID REFERENCES public.outfits(id) ON DELETE CASCADE,
  wardrobe_item_id UUID REFERENCES public.wardrobe_items(id) ON DELETE CASCADE,
  item_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Collections (curated groupings)
CREATE TABLE public.collections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT DEFAULT 'outfit',
  cover_image TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Collection items (junction table)
CREATE TABLE public.collection_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  collection_id UUID REFERENCES public.collections(id) ON DELETE CASCADE,
  wardrobe_item_id UUID REFERENCES public.wardrobe_items(id) ON DELETE CASCADE,
  outfit_id UUID REFERENCES public.outfits(id) ON DELETE CASCADE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Merchant profiles (business data)
CREATE TABLE public.merchant_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  business_name TEXT NOT NULL,
  business_type TEXT,
  verification_status verification_status DEFAULT 'pending',
  tax_id TEXT,
  business_address JSONB,
  contact_info JSONB,
  encryption_salt UUID DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Security audit log
CREATE TABLE public.security_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  action TEXT NOT NULL,
  resource TEXT,
  success BOOLEAN NOT NULL DEFAULT true,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Rate limiting
CREATE TABLE public.rate_limits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  identifier TEXT NOT NULL,
  action TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(identifier, action)
);

-- User MFA settings (encrypted)
CREATE TABLE public.user_mfa_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  totp_enabled BOOLEAN DEFAULT false,
  totp_secret TEXT,
  phone_verified BOOLEAN DEFAULT false,
  phone_number TEXT,
  backup_codes TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wardrobes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wardrobe_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outfits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outfit_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.merchant_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_mfa_settings ENABLE ROW LEVEL SECURITY;