import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from '@/hooks/useProfile';
import { useToast } from '@/hooks/use-toast';

export interface UserPreferences {
  // Theme preferences
  theme: {
    mode: 'light' | 'dark' | 'system' | 'auto';
    accent_color: string;
    gradient_preset: string;
    blur_effects: boolean;
    compact_mode: boolean;
    custom_colors: {
      primary: string;
      secondary: string;
      accent: string;
      background: string;
      foreground: string;
      muted: string;
      destructive: string;
      warning: string;
      success: string;
    };
    typography: {
      font_family: 'system' | 'inter' | 'roboto' | 'poppins' | 'playfair' | 'mono';
      font_weight: 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
      letter_spacing: 'tight' | 'normal' | 'wide';
      line_height: 'tight' | 'normal' | 'relaxed';
    };
    layout: {
      spacing: 'compact' | 'normal' | 'comfortable' | 'spacious';
      content_width: 'narrow' | 'normal' | 'wide' | 'full';
      sidebar_width: 'narrow' | 'normal' | 'wide';
    };
    effects: {
      glass_morphism: boolean;
      particle_effects: boolean;
      hover_animations: boolean;
      page_transitions: boolean;
      loading_animations: boolean;
    };
    patterns: {
      use_patterns: boolean;
      pattern_type: 'dots' | 'grid' | 'diagonal' | 'waves' | 'geometric';
      pattern_opacity: number;
    };
  };
  
  // Extended theme options
  extended_theme: {
    gradient_backgrounds: boolean;
    animated_transitions: boolean;
    card_style: 'default' | 'minimal' | 'elevated' | 'outlined' | 'glass' | 'neumorphism';
    border_radius: 'none' | 'small' | 'medium' | 'large' | 'xl' | 'full';
    shadow_intensity: 'none' | 'subtle' | 'medium' | 'strong' | 'dramatic';
    button_style: 'default' | 'rounded' | 'pill' | 'sharp' | 'gradient';
    icon_style: 'outline' | 'filled' | 'duotone' | 'animated';
    component_density: 'compact' | 'normal' | 'comfortable';
    color_scheme_type: 'vibrant' | 'muted' | 'pastel' | 'monochrome' | 'high_contrast';
    custom_css: string;
  };
  
  // Accessibility settings
  accessibility_settings: {
    high_contrast: boolean;
    large_text: boolean;
    reduce_motion: boolean;
    screen_reader_support: boolean;
    keyboard_navigation: boolean;
    color_blind_friendly: boolean;
    font_size_multiplier: number;
    voice_navigation: boolean;
    focus_indicators: boolean;
    skip_navigation: boolean;
    alternative_text: boolean;
    captions_enabled: boolean;
    dyslexia_friendly: boolean;
    reading_mode: boolean;
    cursor_enhancement: boolean;
    click_assistance: boolean;
    gesture_controls: boolean;
    sound_feedback: boolean;
    haptic_feedback: boolean;
    reading_speed: 'slow' | 'normal' | 'fast';
    contrast_ratio: number;
    content_spacing: number;
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
  
  // Laundry settings
  laundry_settings: {
    auto_sort_by_color: boolean;
    reminder_notifications: boolean;
    smart_suggestions: boolean;
    care_label_warnings: boolean;
  };
  
  // 2ndDresser marketplace settings
  marketplace_settings: {
    allow_selling: boolean;
    show_price_history: boolean;
    auto_suggest_prices: boolean;
    shipping_preferences: Record<string, any>;
    payment_methods: string[];
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
      background: '#ffffff',
      foreground: '#0f172a',
      muted: '#f1f5f9',
      destructive: '#ef4444',
      warning: '#f59e0b',
      success: '#10b981',
    },
    typography: {
      font_family: 'system',
      font_weight: 'normal',
      letter_spacing: 'normal',
      line_height: 'normal',
    },
    layout: {
      spacing: 'normal',
      content_width: 'normal',
      sidebar_width: 'normal',
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
      pattern_type: 'dots',
      pattern_opacity: 0.1,
    },
  },
  extended_theme: {
    gradient_backgrounds: true,
    animated_transitions: true,
    card_style: 'default',
    border_radius: 'medium',
    shadow_intensity: 'medium',
    button_style: 'default',
    icon_style: 'outline',
    component_density: 'normal',
    color_scheme_type: 'vibrant',
    custom_css: '',
  },
  accessibility_settings: {
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
    reading_speed: 'normal',
    contrast_ratio: 4.5,
    content_spacing: 1.0,
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
  laundry_settings: {
    auto_sort_by_color: true,
    reminder_notifications: true,
    smart_suggestions: true,
    care_label_warnings: true,
  },
  marketplace_settings: {
    allow_selling: false,
    show_price_history: true,
    auto_suggest_prices: true,
    shipping_preferences: {},
    payment_methods: [],
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
        // Parse and merge theme with defaults to ensure all nested keys exist
        let parsedTheme = defaultPreferences.theme;
        if (data.theme) {
          try {
            const rawTheme = typeof data.theme === 'string' ? JSON.parse(data.theme) : data.theme;
            parsedTheme = {
              ...defaultPreferences.theme,
              ...rawTheme,
              custom_colors: {
                ...defaultPreferences.theme.custom_colors,
                ...(rawTheme?.custom_colors || {})
              },
              typography: {
                ...defaultPreferences.theme.typography,
                ...(rawTheme?.typography || {})
              },
              layout: {
                ...defaultPreferences.theme.layout,
                ...(rawTheme?.layout || {})
              },
              effects: {
                ...defaultPreferences.theme.effects,
                ...(rawTheme?.effects || {})
              },
              patterns: {
                ...defaultPreferences.theme.patterns,
                ...(rawTheme?.patterns || {})
              },
            };
          } catch (e) {
            console.warn('Failed to parse theme data:', e);
          }
        }

        const loadedPreferences: UserPreferences = {
          theme: parsedTheme,
          extended_theme: (data.extended_theme as any) || defaultPreferences.extended_theme,
          accessibility_settings: (data.accessibility_settings as any) || defaultPreferences.accessibility_settings,
          notifications: (data.notifications as any) || defaultPreferences.notifications,
          privacy: (data.privacy_settings as any) || defaultPreferences.privacy,
          app_behavior: (data.app_behavior as any) || defaultPreferences.app_behavior,
          suggestion_settings: (data.suggestion_settings as any) || defaultPreferences.suggestion_settings,
          laundry_settings: (data.laundry_settings as any) || defaultPreferences.laundry_settings,
          marketplace_settings: (data.marketplace_settings as any) || defaultPreferences.marketplace_settings,
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
          extended_theme: defaultPreferences.extended_theme,
          accessibility_settings: defaultPreferences.accessibility_settings,
          notifications: defaultPreferences.notifications,
          privacy_settings: defaultPreferences.privacy,
          app_behavior: defaultPreferences.app_behavior,
          suggestion_settings: defaultPreferences.suggestion_settings,
          laundry_settings: defaultPreferences.laundry_settings,
          marketplace_settings: defaultPreferences.marketplace_settings,
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

        const { error } = await supabase
          .from('user_preferences')
          .upsert({
            user_id: user.id,
            theme: JSON.stringify(newPreferences.theme), // Keep as JSON string for compatibility
            extended_theme: newPreferences.extended_theme,
            accessibility_settings: newPreferences.accessibility_settings,
            notifications: newPreferences.notifications,
            privacy_settings: newPreferences.privacy,
            app_behavior: newPreferences.app_behavior,
            suggestion_settings: newPreferences.suggestion_settings,
            laundry_settings: newPreferences.laundry_settings,
            marketplace_settings: newPreferences.marketplace_settings,
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'user_id'
          });

      if (error) throw error;

  // Apply theme changes immediately
      if (updates.theme || updates.accessibility_settings || updates.extended_theme) {
        applyTheme(newPreferences.theme);
        applyAccessibilitySettings(newPreferences.accessibility_settings);
        applyExtendedTheme(newPreferences.extended_theme);
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

    // Store preferences in localStorage as backup
    localStorage.setItem('user-theme-preference', JSON.stringify(theme));
    localStorage.setItem('user-accessibility-preference', JSON.stringify(preferences.accessibility_settings));
    localStorage.setItem('user-extended-theme-preference', JSON.stringify(preferences.extended_theme));
  };

  const applyAccessibilitySettings = (accessibility: UserPreferences['accessibility_settings']) => {
    const root = document.documentElement;
    
    // Apply font size multiplier
    root.style.setProperty('--font-size-multiplier', accessibility.font_size_multiplier.toString());
    
    // Apply high contrast
    root.classList.toggle('high-contrast', accessibility.high_contrast);
    
    // Apply large text
    root.classList.toggle('large-text', accessibility.large_text);
    
    // Apply reduced motion
    root.classList.toggle('reduce-motion', accessibility.reduce_motion);
    
    // Apply color blind friendly
    root.classList.toggle('color-blind-friendly', accessibility.color_blind_friendly);
    
    // Apply keyboard navigation
    root.classList.toggle('keyboard-navigation', accessibility.keyboard_navigation);
    
    // Apply screen reader optimizations
    root.classList.toggle('screen-reader', accessibility.screen_reader_support);
  };

  const applyExtendedTheme = (extendedTheme: UserPreferences['extended_theme']) => {
    const root = document.documentElement;
    
    // Apply gradient backgrounds
    root.classList.toggle('gradient-backgrounds', extendedTheme.gradient_backgrounds);
    
    // Apply animated transitions
    root.classList.toggle('animated-transitions', extendedTheme.animated_transitions);
    
    // Apply card style
    root.setAttribute('data-card-style', extendedTheme.card_style);
    
    // Apply border radius
    root.setAttribute('data-border-radius', extendedTheme.border_radius);
    
    // Apply shadow intensity
    root.setAttribute('data-shadow-intensity', extendedTheme.shadow_intensity);
  };

  // Load theme from localStorage on first render if user is not logged in
  useEffect(() => {
    if (!user) {
      const savedTheme = localStorage.getItem('user-theme-preference');
      if (savedTheme) {
        try {
          const rawTheme = JSON.parse(savedTheme);
          const mergedTheme = {
            ...defaultPreferences.theme,
            ...rawTheme,
            custom_colors: {
              ...defaultPreferences.theme.custom_colors,
              ...(rawTheme?.custom_colors || {})
            },
            typography: {
              ...defaultPreferences.theme.typography,
              ...(rawTheme?.typography || {})
            },
            layout: {
              ...defaultPreferences.theme.layout,
              ...(rawTheme?.layout || {})
            },
            effects: {
              ...defaultPreferences.theme.effects,
              ...(rawTheme?.effects || {})
            },
            patterns: {
              ...defaultPreferences.theme.patterns,
              ...(rawTheme?.patterns || {})
            },
          };
          setPreferences(prev => ({ ...prev, theme: mergedTheme }));
          applyTheme(mergedTheme);
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
    applyAccessibilitySettings,
    applyExtendedTheme,
  };
};