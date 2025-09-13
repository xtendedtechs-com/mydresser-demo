-- Create comprehensive database structure for MyDresser user actions

-- Social Interactions Tables
CREATE TABLE public.user_follows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id uuid NOT NULL,
  following_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

CREATE TABLE public.emotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  emoji text NOT NULL,
  category text DEFAULT 'general',
  is_premium boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Wardrobe Management Tables
CREATE TABLE public.wardrobes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  type text DEFAULT 'closet', -- closet, dresser, armoire, etc.
  dimensions jsonb, -- {width, height, depth, shelves, rods, etc.}
  location text,
  notes text,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public.wardrobe_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  wardrobe_id uuid REFERENCES public.wardrobes(id) ON DELETE CASCADE,
  name text NOT NULL,
  category text NOT NULL, -- shirt, pants, shoes, accessories, etc.
  brand text,
  color text,
  size text,
  material text,
  season text, -- spring, summer, fall, winter, all
  occasion text, -- casual, formal, business, sport, etc.
  purchase_date date,
  purchase_price decimal(10,2),
  photos jsonb, -- array of photo URLs
  tags text[], -- searchable tags
  location_in_wardrobe text, -- specific location within wardrobe
  condition text DEFAULT 'excellent', -- excellent, good, fair, poor
  last_worn date,
  wear_count integer DEFAULT 0,
  is_favorite boolean DEFAULT false,
  notes text,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Outfit Management Tables
CREATE TABLE public.outfits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text,
  occasion text,
  season text,
  weather_conditions jsonb, -- temperature, rain, etc.
  is_favorite boolean DEFAULT false,
  is_ai_generated boolean DEFAULT false,
  ai_generation_prompt text,
  photos jsonb, -- array of photos
  notes text,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public.outfit_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  outfit_id uuid REFERENCES public.outfits(id) ON DELETE CASCADE,
  wardrobe_item_id uuid REFERENCES public.wardrobe_items(id) ON DELETE CASCADE,
  item_type text, -- top, bottom, shoes, accessory, etc.
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  UNIQUE (outfit_id, wardrobe_item_id)
);

-- Collections and Lists
CREATE TABLE public.collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  type text DEFAULT 'outfit', -- outfit, item, style_inspiration
  is_public boolean DEFAULT false,
  cover_image text,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public.collection_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id uuid REFERENCES public.collections(id) ON DELETE CASCADE,
  outfit_id uuid REFERENCES public.outfits(id) ON DELETE CASCADE,
  wardrobe_item_id uuid REFERENCES public.wardrobe_items(id) ON DELETE CASCADE,
  notes text,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  CHECK (
    (outfit_id IS NOT NULL AND wardrobe_item_id IS NULL) OR
    (outfit_id IS NULL AND wardrobe_item_id IS NOT NULL)
  )
);

-- Reactions and Social Actions
CREATE TABLE public.reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  target_type text NOT NULL, -- outfit, item, collection, profile
  target_id uuid NOT NULL,
  emote_id uuid REFERENCES public.emotes(id),
  reaction_type text DEFAULT 'like', -- like, love, fire, star, etc.
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  UNIQUE(user_id, target_type, target_id, reaction_type)
);

-- Subscriptions
CREATE TABLE public.user_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscriber_id uuid NOT NULL,
  provider_id uuid NOT NULL,
  subscription_type text NOT NULL, -- stylist, merchant, premium
  plan_name text,
  status text DEFAULT 'active', -- active, paused, cancelled, expired
  price decimal(10,2),
  billing_cycle text DEFAULT 'monthly', -- monthly, yearly
  started_at timestamp with time zone DEFAULT now() NOT NULL,
  expires_at timestamp with time zone,
  auto_renew boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Laundry Tracking
CREATE TABLE public.laundry_batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text DEFAULT 'Laundry Batch',
  status text DEFAULT 'dirty', -- dirty, washing, drying, clean, folded
  started_at timestamp with time zone DEFAULT now() NOT NULL,
  completed_at timestamp with time zone,
  notes text,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public.laundry_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id uuid REFERENCES public.laundry_batches(id) ON DELETE CASCADE,
  wardrobe_item_id uuid REFERENCES public.wardrobe_items(id) ON DELETE CASCADE,
  added_at timestamp with time zone DEFAULT now() NOT NULL
);

-- User Preferences and Personalization
CREATE TABLE public.user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  theme text DEFAULT 'system', -- light, dark, system
  language text DEFAULT 'en',
  notifications jsonb DEFAULT '{}', -- notification settings
  suggestion_settings jsonb DEFAULT '{}', -- AI suggestion preferences
  privacy_settings jsonb DEFAULT '{}', -- privacy preferences
  app_behavior jsonb DEFAULT '{}', -- app customization settings
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Insert default emotes
INSERT INTO public.emotes (name, emoji, category) VALUES
('Heart', '❤️', 'love'),
('Fire', '🔥', 'amazing'),
('Star', '⭐', 'favorite'),
('Thumbs Up', '👍', 'approval'),
('Sparkles', '✨', 'stunning'),
('Crown', '👑', 'royal'),
('Gem', '💎', 'luxury'),
('Clap', '👏', 'applause');