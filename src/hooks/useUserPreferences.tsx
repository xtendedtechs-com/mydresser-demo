import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from '@/hooks/useProfile';
import { useToast } from '@/hooks/use-toast';

// Keep the original complex interface for backward compatibility
export interface UserPreferences {
  // Flat properties for new settings pages
  language?: string;
  currency?: string;
  compact_mode?: boolean;
  animations?: boolean;
  grid_size?: number;
  push_notifications?: boolean;
  offline_mode?: boolean;
  public_profile?: boolean;
  wardrobe_visible?: boolean;
  activity_visible?: boolean;
  analytics_sharing?: boolean;
  personalized_recommendations?: boolean;
  daily_outfit?: boolean;
  wardrobe_tips?: boolean;
  market_updates?: boolean;
  outfit_reminders?: boolean;
  social_activity?: boolean;
  auto_recommendations?: boolean;
  price_alerts?: boolean;
  merchant_updates?: boolean;
  ai_styling?: boolean;
  weather_integration?: boolean;
  trend_analysis?: boolean;
  public_outfits?: boolean;
  follow_suggestions?: boolean;

  // Keep nested structure for backward compatibility
  theme?: {
    mode?: 'light' | 'dark' | 'system' | 'auto';
    accent_color?: string;
    gradient_preset?: string;
    blur_effects?: boolean;
    custom_colors?: {
      primary?: string;
      secondary?: string;
      accent?: string;
      background?: string;
      foreground?: string;
      muted?: string;
      destructive?: string;
      warning?: string;
      success?: string;
    };
    typography?: {
      font_family?: 'system' | 'inter' | 'roboto' | 'poppins' | 'playfair' | 'mono';
      font_weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
      letter_spacing?: 'tight' | 'normal' | 'wide';
      line_height?: 'tight' | 'normal' | 'relaxed';
    };
    layout?: {
      spacing?: 'compact' | 'normal' | 'comfortable' | 'spacious';
      content_width?: 'narrow' | 'normal' | 'wide' | 'full';
      sidebar_width?: 'narrow' | 'normal' | 'wide';
    };
    effects?: {
      glass_morphism?: boolean;
      particle_effects?: boolean;
      hover_animations?: boolean;
      page_transitions?: boolean;
      loading_animations?: boolean;
    };
    patterns?: {
      use_patterns?: boolean;
      pattern_type?: 'dots' | 'grid' | 'diagonal' | 'waves' | 'geometric';
      pattern_opacity?: number;
    };
  };

  accessibility_settings?: {
    high_contrast?: boolean;
    large_text?: boolean;
    reduce_motion?: boolean;
    screen_reader_support?: boolean;
    keyboard_navigation?: boolean;
    color_blind_friendly?: boolean;
    font_size_multiplier?: number;
    voice_navigation?: boolean;
    focus_indicators?: boolean;
    skip_navigation?: boolean;
    alternative_text?: boolean;
    captions_enabled?: boolean;
    dyslexia_friendly?: boolean;
    reading_mode?: boolean;
    cursor_enhancement?: boolean;
    click_assistance?: boolean;
    gesture_controls?: boolean;
    sound_feedback?: boolean;
    haptic_feedback?: boolean;
    reading_speed?: 'slow' | 'normal' | 'fast';
    contrast_ratio?: number;
    content_spacing?: number;
  };

  notifications?: {
    email?: boolean;
    push?: boolean;
    outfit_suggestions?: boolean;
    new_items?: boolean;
    social_interactions?: boolean;
    weather_alerts?: boolean;
  };

  privacy?: {
    profile_visibility?: 'public' | 'friends' | 'private';
    show_wardrobe?: boolean;
    allow_messages?: boolean;
    show_activity?: boolean;
    location_sharing?: boolean;
  };

  app_behavior?: {
    auto_save?: boolean;
    show_tips?: boolean;
    compact_navigation?: boolean;
    quick_actions?: boolean;
    gesture_navigation?: boolean;
  };

  suggestion_settings?: {
    weather_based?: boolean;
    occasion_based?: boolean;
    color_matching?: boolean;
    brand_preferences?: string[];
    style_preferences?: string[];
    budget_range?: [number, number];
  };

  marketplace_settings?: {
    allow_selling?: boolean;
    show_price_history?: boolean;
    auto_suggest_prices?: boolean;
    shipping_preferences?: Record<string, any>;
    payment_methods?: string[];
  };

  laundry_settings?: {
    auto_sort_by_color?: boolean;
    reminder_notifications?: boolean;
    smart_suggestions?: boolean;
    care_label_warnings?: boolean;
  };

  // Add extended_theme for backward compatibility
  extended_theme?: {
    gradient_backgrounds?: boolean;
    animated_transitions?: boolean;
    card_style?: 'default' | 'minimal' | 'elevated' | 'outlined' | 'glass' | 'neumorphism';
    border_radius?: 'none' | 'small' | 'medium' | 'large' | 'xl' | 'full';
    shadow_intensity?: 'none' | 'subtle' | 'medium' | 'strong' | 'dramatic';
    button_style?: 'default' | 'rounded' | 'pill' | 'sharp' | 'gradient';
    icon_style?: 'outline' | 'filled' | 'duotone' | 'animated';
    component_density?: 'compact' | 'normal' | 'comfortable';
    color_scheme_type?: 'vibrant' | 'muted' | 'pastel' | 'monochrome' | 'high_contrast';
    custom_css?: string;
  };
}

const defaultTheme = {
  mode: 'system' as const,
  accent_color: '#3b82f6',
  gradient_preset: 'default',
  blur_effects: true,
  custom_colors: {
    primary: '#3b82f6',
    secondary: '#64748b',
    accent: '#8b5cf6',
    background: '#ffffff',
    foreground: '#0f172a',
    muted: '#f1f5f9',
    destructive: '#ef4444',
    warning: '#f59e0b',
    success: '#10b981',
  },
  typography: {
    font_family: 'system' as const,
    font_weight: 'normal' as const,
    letter_spacing: 'normal' as const,
    line_height: 'normal' as const,
  },
  layout: {
    spacing: 'normal' as const,
    content_width: 'normal' as const,
    sidebar_width: 'normal' as const,
  },
  effects: {
    glass_morphism: true,
    particle_effects: false,
    hover_animations: true,
    page_transitions: true,
    loading_animations: true,
  },
  patterns: {
    use_patterns: false,
    pattern_type: 'dots' as const,
    pattern_opacity: 0.1,
  },
};

export const useUserPreferences = () => {
  const { user } = useProfile();
  const { toast } = useToast();
  const [preferences, setPreferences] = useState<UserPreferences>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchPreferences();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchPreferences = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        // Create hybrid structure with both flat and nested properties
        const loadedPreferences: UserPreferences = {
          // Use actual database columns
          language: data.language,
          
          // Extract flat properties from the JSON columns for the settings pages
          currency: (data.app_behavior as any)?.currency || 'USD',
          compact_mode: (data.app_behavior as any)?.compact_mode || false,
          animations: (data.app_behavior as any)?.animations || true,
          grid_size: (data.app_behavior as any)?.grid_size || 3,
          push_notifications: (data.app_behavior as any)?.push_notifications || true,
          offline_mode: (data.app_behavior as any)?.offline_mode || false,
          
          public_profile: (data.accessibility_settings as any)?.public_profile || true,
          wardrobe_visible: (data.accessibility_settings as any)?.wardrobe_visible || true,
          activity_visible: (data.accessibility_settings as any)?.activity_visible || true,
          analytics_sharing: (data.accessibility_settings as any)?.analytics_sharing || true,
          personalized_recommendations: (data.accessibility_settings as any)?.personalized_recommendations || true,
          
          daily_outfit: (data.notifications as any)?.daily_outfit || true,
          wardrobe_tips: (data.notifications as any)?.wardrobe_tips || true,
          market_updates: (data.notifications as any)?.market_updates || true,
          outfit_reminders: (data.notifications as any)?.outfit_reminders || false,
          social_activity: (data.notifications as any)?.social_activity || false,
          
          auto_recommendations: (data.marketplace_settings as any)?.auto_recommendations || true,
          price_alerts: (data.marketplace_settings as any)?.price_alerts || false,
          merchant_updates: (data.marketplace_settings as any)?.merchant_updates || true,
          ai_styling: (data.marketplace_settings as any)?.ai_styling || false,
          weather_integration: (data.marketplace_settings as any)?.weather_integration || true,
          trend_analysis: (data.marketplace_settings as any)?.trend_analysis || false,
          public_outfits: (data.marketplace_settings as any)?.public_outfits || true,
          follow_suggestions: (data.marketplace_settings as any)?.follow_suggestions || false,

          // Nested structures for backward compatibility
          theme: defaultTheme,
          extended_theme: data.extended_theme as any || {},
          accessibility_settings: data.accessibility_settings as any || {
            high_contrast: false,
            large_text: false,
            reduce_motion: false,
            screen_reader_support: false,
            keyboard_navigation: false,
            color_blind_friendly: false,
            font_size_multiplier: 1.0,
            voice_navigation: false,
            focus_indicators: true,
            skip_navigation: true,
            alternative_text: true,
            captions_enabled: false,
            dyslexia_friendly: false,
            reading_mode: false,
            cursor_enhancement: false,
            click_assistance: false,
            gesture_controls: false,
            sound_feedback: false,
            haptic_feedback: false,
            reading_speed: 'normal' as const,
            contrast_ratio: 4.5,
            content_spacing: 1.0,
          },
          notifications: data.notifications as any || {
            email: true,
            push: true,
            outfit_suggestions: true,
            new_items: false,
            social_interactions: true,
            weather_alerts: true,
          },
          privacy: {
            profile_visibility: 'public' as const,
            show_wardrobe: false,
            allow_messages: true,
            show_activity: false,
            location_sharing: false,
          },
          app_behavior: data.app_behavior as any || {
            auto_save: true,
            show_tips: true,
            compact_navigation: false,
            quick_actions: true,
            gesture_navigation: false,
          },
          suggestion_settings: data.suggestion_settings as any || {
            weather_based: true,
            occasion_based: true,
            color_matching: true,
            brand_preferences: [],
            style_preferences: [],
            budget_range: [0, 1000],
          },
          marketplace_settings: data.marketplace_settings as any || {
            allow_selling: false,
            show_price_history: true,
            auto_suggest_prices: true,
            shipping_preferences: {},
            payment_methods: [],
          },
          laundry_settings: data.laundry_settings as any || {
            auto_sort_by_color: true,
            reminder_notifications: true,
            smart_suggestions: true,
            care_label_warnings: true,
          },
        };
        
        setPreferences(loadedPreferences);
      } else {
        // If no preferences exist, use defaults with flat properties
        setPreferences({
          language: 'en',
          currency: 'USD',
          compact_mode: false,
          animations: true,
          grid_size: 3,
          push_notifications: true,
          offline_mode: false,
          public_profile: true,
          wardrobe_visible: true,
          activity_visible: true,
          analytics_sharing: true,
          personalized_recommendations: true,
          daily_outfit: true,
          wardrobe_tips: true,
          market_updates: true,
          outfit_reminders: false,
          social_activity: false,
          auto_recommendations: true,
          price_alerts: false,
          merchant_updates: true,
          ai_styling: false,
          weather_integration: true,
          trend_analysis: false,
          public_outfits: true,
          follow_suggestions: false,
          theme: defaultTheme,
          extended_theme: {},
          accessibility_settings: { high_contrast: false, large_text: false, reduce_motion: false },
          notifications: { email: true, push: true, outfit_suggestions: true },
          privacy: { profile_visibility: 'public' as const, show_wardrobe: false },
          app_behavior: { auto_save: true, show_tips: true },
          suggestion_settings: { weather_based: true, occasion_based: true },
          marketplace_settings: { allow_selling: false, show_price_history: true },
          laundry_settings: { auto_sort_by_color: true, reminder_notifications: true },
        });
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
      toast({
        title: "Error loading preferences",
        description: "Using default settings.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updatePreferences = async (updates: Partial<UserPreferences>) => {
    if (!user) return;

    try {
      // Optimistically update local state
      const newPreferences = { ...preferences, ...updates };
      setPreferences(newPreferences);

      // For now, just store simple flat properties as updates to existing JSON structure
      // This is a simplified approach for the settings to work
      const dbUpdates: any = {};
      
      // Handle language separately as it's a direct column
      if (updates.language !== undefined) {
        dbUpdates.language = updates.language;
      }

      // For other properties, we'll create a simple object
      const appBehaviorUpdates: any = {};
      const notificationUpdates: any = {};
      const marketplaceUpdates: any = {};
      
      // Map app behavior related updates
      if (updates.currency !== undefined) appBehaviorUpdates.currency = updates.currency;
      if (updates.compact_mode !== undefined) appBehaviorUpdates.compact_mode = updates.compact_mode;
      if (updates.animations !== undefined) appBehaviorUpdates.animations = updates.animations;
      if (updates.grid_size !== undefined) appBehaviorUpdates.grid_size = updates.grid_size;
      if (updates.push_notifications !== undefined) appBehaviorUpdates.push_notifications = updates.push_notifications;
      if (updates.offline_mode !== undefined) appBehaviorUpdates.offline_mode = updates.offline_mode;
      
      // Map notification updates
      if (updates.daily_outfit !== undefined) notificationUpdates.daily_outfit = updates.daily_outfit;
      if (updates.wardrobe_tips !== undefined) notificationUpdates.wardrobe_tips = updates.wardrobe_tips;
      if (updates.market_updates !== undefined) notificationUpdates.market_updates = updates.market_updates;
      if (updates.outfit_reminders !== undefined) notificationUpdates.outfit_reminders = updates.outfit_reminders;
      if (updates.social_activity !== undefined) notificationUpdates.social_activity = updates.social_activity;
      
      // Map marketplace updates
      if (updates.auto_recommendations !== undefined) marketplaceUpdates.auto_recommendations = updates.auto_recommendations;
      if (updates.price_alerts !== undefined) marketplaceUpdates.price_alerts = updates.price_alerts;
      if (updates.merchant_updates !== undefined) marketplaceUpdates.merchant_updates = updates.merchant_updates;
      if (updates.ai_styling !== undefined) marketplaceUpdates.ai_styling = updates.ai_styling;
      if (updates.weather_integration !== undefined) marketplaceUpdates.weather_integration = updates.weather_integration;
      if (updates.trend_analysis !== undefined) marketplaceUpdates.trend_analysis = updates.trend_analysis;
      if (updates.public_outfits !== undefined) marketplaceUpdates.public_outfits = updates.public_outfits;
      if (updates.follow_suggestions !== undefined) marketplaceUpdates.follow_suggestions = updates.follow_suggestions;

      // Merge with existing data
      if (Object.keys(appBehaviorUpdates).length > 0) {
        dbUpdates.app_behavior = { ...(preferences.app_behavior || {}), ...appBehaviorUpdates };
      }
      if (Object.keys(notificationUpdates).length > 0) {
        dbUpdates.notifications = { ...(preferences.notifications || {}), ...notificationUpdates };
      }
      if (Object.keys(marketplaceUpdates).length > 0) {
        dbUpdates.marketplace_settings = { ...(preferences.marketplace_settings || {}), ...marketplaceUpdates };
      }
      
      // Handle nested object updates
      if (updates.theme) dbUpdates.theme = updates.theme;
      if (updates.accessibility_settings) dbUpdates.accessibility_settings = updates.accessibility_settings;
      if (updates.extended_theme) dbUpdates.extended_theme = updates.extended_theme;
      if (updates.privacy) dbUpdates.privacy_settings = updates.privacy;
      if (updates.app_behavior) dbUpdates.app_behavior = updates.app_behavior;
      if (updates.suggestion_settings) dbUpdates.suggestion_settings = updates.suggestion_settings;
      if (updates.laundry_settings) dbUpdates.laundry_settings = updates.laundry_settings;

      // Only update if there are actual database fields to update
      if (Object.keys(dbUpdates).length > 0) {
        const { error } = await supabase
          .from('user_preferences')
          .update(dbUpdates)
          .eq('user_id', user.id);

        if (error) throw error;
      }

      toast({
        title: "Preferences updated",
        description: "Your settings have been saved successfully.",
      });
    } catch (error) {
      console.error('Error updating preferences:', error);
      toast({
        title: "Error saving preferences",
        description: "Please try again.",
        variant: "destructive",
      });
      // Revert optimistic update on error
      await fetchPreferences();
    }
  };

  return {
    preferences,
    loading,
    updatePreferences,
  };
};
