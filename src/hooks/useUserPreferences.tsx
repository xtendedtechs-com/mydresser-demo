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
    accent_color: '#3b82f6',
    gradient_preset: 'default',
    blur_effects: true,
    compact_mode: false,
    custom_colors: {
      primary: '#3b82f6',
      secondary: '#64748b',
      accent: '#8b5cf6',
    },
  },
  notifications: {
    email: true,
    push: true,
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

  useEffect(() => {
    // Apply theme on component mount and when theme changes
    if (preferences.theme) {
      applyTheme(preferences.theme);
    }
  }, [preferences.theme]);

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
        // Parse the theme data properly
        let parsedTheme = defaultPreferences.theme;
        if (data.theme) {
          try {
            parsedTheme = typeof data.theme === 'string' ? JSON.parse(data.theme) : data.theme;
          } catch (e) {
            console.warn('Failed to parse theme data:', e);
          }
        }

        const loadedPreferences: UserPreferences = {
          theme: parsedTheme,
          notifications: (data.notifications as any) || defaultPreferences.notifications,
          privacy: (data.privacy_settings as any) || defaultPreferences.privacy,
          app_behavior: (data.app_behavior as any) || defaultPreferences.app_behavior,
          suggestion_settings: (data.suggestion_settings as any) || defaultPreferences.suggestion_settings,
        };
        
        setPreferences(loadedPreferences);
        
        // Apply theme immediately after loading
        applyTheme(loadedPreferences.theme);
      } else {
        // Create default preferences for new user
        await createDefaultPreferences();
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

  const createDefaultPreferences = async () => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('user_preferences')
        .insert({
          user_id: user.id,
          theme: JSON.stringify(defaultPreferences.theme),
          notifications: defaultPreferences.notifications,
          privacy_settings: defaultPreferences.privacy,
          app_behavior: defaultPreferences.app_behavior,
          suggestion_settings: defaultPreferences.suggestion_settings,
        });

      if (error) throw error;
      
      setPreferences(defaultPreferences);
      applyTheme(defaultPreferences.theme);
    } catch (error) {
      console.error('Error creating default preferences:', error);
    }
  };

  const updatePreferences = async (updates: Partial<UserPreferences>) => {
    if (!user) return;

    try {
      // Optimistically update local state
      const newPreferences = { ...preferences, ...updates };
      setPreferences(newPreferences);

      // Save to database with proper format
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          theme: JSON.stringify(newPreferences.theme), // Keep as JSON string for compatibility
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

    // Apply blur effects
    if (theme.blur_effects) {
      root.classList.add('blur-effects');
    } else {
      root.classList.remove('blur-effects');
    }

    // Apply compact mode
    if (theme.compact_mode) {
      root.classList.add('compact-mode');
    } else {
      root.classList.remove('compact-mode');
    }

    // Store theme preference in localStorage as backup
    localStorage.setItem('user-theme-preference', JSON.stringify(theme));
  };

  // Load theme from localStorage on first render if user is not logged in
  useEffect(() => {
    if (!user) {
      const savedTheme = localStorage.getItem('user-theme-preference');
      if (savedTheme) {
        try {
          const parsedTheme = JSON.parse(savedTheme);
          setPreferences(prev => ({ ...prev, theme: parsedTheme }));
          applyTheme(parsedTheme);
        } catch (e) {
          // Ignore parsing errors
        }
      } else {
        applyTheme(defaultPreferences.theme);
      }
    }
  }, [user]);

  return {
    preferences,
    updatePreferences,
    loading,
    applyTheme,
  };
};