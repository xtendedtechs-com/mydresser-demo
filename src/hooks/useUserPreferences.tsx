import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from '@/hooks/useProfile';
import { useToast } from '@/hooks/use-toast';

export interface UserPreferences {
  // Theme preferences
  theme: {
    mode: 'light' | 'dark' | 'system';
    accent_color: string;
    gradient_preset: string;
    blur_effects: boolean;
    compact_mode: boolean;
    custom_colors: {
      primary: string;
      secondary: string;
      accent: string;
    };
  };
  
  // Notification preferences
  notifications: {
    email: boolean;
    push: boolean;
    outfit_suggestions: boolean;
    new_items: boolean;
    social_interactions: boolean;
    weather_alerts: boolean;
  };
  
  // Privacy preferences
  privacy: {
    profile_visibility: 'public' | 'friends' | 'private';
    show_wardrobe: boolean;
    allow_messages: boolean;
    show_activity: boolean;
    location_sharing: boolean;
  };
  
  // App behavior
  app_behavior: {
    auto_save: boolean;
    show_tips: boolean;
    compact_navigation: boolean;
    quick_actions: boolean;
    gesture_navigation: boolean;
  };
  
  // Suggestion settings
  suggestion_settings: {
    weather_based: boolean;
    occasion_based: boolean;
    color_matching: boolean;
    brand_preferences: string[];
    style_preferences: string[];
    budget_range: [number, number];
  };
}

const defaultPreferences: UserPreferences = {
  theme: {
    mode: 'system',
    accent_color: 'default',
    gradient_preset: 'warm',
    blur_effects: true,
    compact_mode: false,
    custom_colors: {
      primary: '#000000',
      secondary: '#f5f5f5', 
      accent: '#fd7c2b',
    },
  },
  notifications: {
    email: true,
    push: false,
    outfit_suggestions: true,
    new_items: false,
    social_interactions: true,
    weather_alerts: true,
  },
  privacy: {
    profile_visibility: 'public',
    show_wardrobe: false,
    allow_messages: true,
    show_activity: false,
    location_sharing: false,
  },
  app_behavior: {
    auto_save: true,
    show_tips: true,
    compact_navigation: false,
    quick_actions: true,
    gesture_navigation: false,
  },
  suggestion_settings: {
    weather_based: true,
    occasion_based: true,
    color_matching: true,
    brand_preferences: [],
    style_preferences: [],
    budget_range: [0, 1000],
  },
};

export const useUserPreferences = () => {
  const { user } = useProfile();
  const { toast } = useToast();
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
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
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        throw error;
      }

      if (data) {
        const safeTheme = data.theme && typeof data.theme === 'string' ? JSON.parse(data.theme) : {};
        const safeNotifications = data.notifications && typeof data.notifications === 'object' && !Array.isArray(data.notifications) ? data.notifications : {};
        const safePrivacy = data.privacy_settings && typeof data.privacy_settings === 'object' && !Array.isArray(data.privacy_settings) ? data.privacy_settings : {};
        const safeBehavior = data.app_behavior && typeof data.app_behavior === 'object' && !Array.isArray(data.app_behavior) ? data.app_behavior : {};
        const safeSuggestions = data.suggestion_settings && typeof data.suggestion_settings === 'object' && !Array.isArray(data.suggestion_settings) ? data.suggestion_settings : {};

        setPreferences({
          theme: { ...defaultPreferences.theme, ...safeTheme },
          notifications: { ...defaultPreferences.notifications, ...safeNotifications },
          privacy: { ...defaultPreferences.privacy, ...safePrivacy },
          app_behavior: { ...defaultPreferences.app_behavior, ...safeBehavior },
          suggestion_settings: { ...defaultPreferences.suggestion_settings, ...safeSuggestions },
        });
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
      toast({
        title: "Error loading preferences",
        description: "Using default settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updatePreferences = async (updates: Partial<UserPreferences>) => {
    if (!user) return;

    try {
      // Merge updates with current preferences
      const newPreferences = {
        theme: { ...preferences.theme, ...(updates.theme || {}) },
        notifications: { ...preferences.notifications, ...(updates.notifications || {}) },
        privacy: { ...preferences.privacy, ...(updates.privacy || {}) },
        app_behavior: { ...preferences.app_behavior, ...(updates.app_behavior || {}) },
        suggestion_settings: { ...preferences.suggestion_settings, ...(updates.suggestion_settings || {}) },
      };

      // Update state optimistically
      setPreferences(newPreferences);

      // Save to database
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          theme: JSON.stringify(newPreferences.theme),
          notifications: newPreferences.notifications,
          privacy_settings: newPreferences.privacy,
          app_behavior: newPreferences.app_behavior,
          suggestion_settings: newPreferences.suggestion_settings,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      // Apply theme changes immediately
      if (updates.theme) {
        applyTheme(newPreferences.theme);
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

  const applyTheme = (theme: UserPreferences['theme']) => {
    const root = document.documentElement;
    
    // Apply theme mode
    if (theme.mode === 'dark') {
      root.classList.add('dark');
    } else if (theme.mode === 'light') {
      root.classList.remove('dark');
    } else {
      // System theme
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('dark', isDark);
    }

    // Apply custom colors if they exist
    if (theme.custom_colors) {
      // Convert hex to HSL for CSS variables
      const hexToHsl = (hex: string) => {
        const r = parseInt(hex.slice(1, 3), 16) / 255;
        const g = parseInt(hex.slice(3, 5), 16) / 255;
        const b = parseInt(hex.slice(5, 7), 16) / 255;
        
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h = 0, s = 0, l = (max + min) / 2;

        if (max !== min) {
          const d = max - min;
          s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
          switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
          }
          h /= 6;
        }

        return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
      };

      root.style.setProperty('--primary', hexToHsl(theme.custom_colors.primary));
      root.style.setProperty('--secondary', hexToHsl(theme.custom_colors.secondary));
      root.style.setProperty('--accent', hexToHsl(theme.custom_colors.accent));
    }

    // Apply gradient preset
    const gradients: Record<string, string> = {
      warm: 'linear-gradient(135deg, #fd7c2b, #ff9d5c)',
      cool: 'linear-gradient(135deg, #667eea, #764ba2)',
      nature: 'linear-gradient(135deg, #56ab2f, #a8e6cf)',
      sunset: 'linear-gradient(135deg, #ff6b6b, #ffd93d)',
      ocean: 'linear-gradient(135deg, #74b9ff, #0984e3)',
      royal: 'linear-gradient(135deg, #8e2de2, #4a00e0)',
      forest: 'linear-gradient(135deg, #134e5e, #71b280)',
      fire: 'linear-gradient(135deg, #f12711, #f5af19)',
    };
    
    if (gradients[theme.gradient_preset]) {
      root.style.setProperty('--gradient-primary', gradients[theme.gradient_preset]);
    }

    // Apply blur effects
    root.classList.toggle('blur-effects', theme.blur_effects);
    
    // Apply compact mode
    root.classList.toggle('compact-mode', theme.compact_mode);
  };

  // Initialize theme on load
  useEffect(() => {
    if (!loading) {
      applyTheme(preferences.theme);
    }
  }, [loading, preferences.theme]);

  return {
    preferences,
    loading,
    updatePreferences,
    applyTheme,
  };
};