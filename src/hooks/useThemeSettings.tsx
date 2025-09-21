import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ThemeSettings {
  id?: string;
  user_id: string;
  theme_name: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  background_style: string;
  font_family: string;
  border_radius: string;
  animations_enabled: boolean;
  created_at?: string;
  updated_at?: string;
}

export const useThemeSettings = () => {
  const [themeSettings, setThemeSettings] = useState<ThemeSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchThemeSettings();
  }, []);

  const fetchThemeSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_theme_settings')
        .select('*')
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      
      // Set default theme if none exists
      if (!data) {
        const defaultTheme: Partial<ThemeSettings> = {
          theme_name: 'system',
          primary_color: '#000000',
          secondary_color: '#ffffff',
          accent_color: '#6366f1',
          background_style: 'default',
          font_family: 'system',
          border_radius: 'medium',
          animations_enabled: true
        };
        setThemeSettings(defaultTheme as ThemeSettings);
      } else {
        setThemeSettings(data);
      }
    } catch (error: any) {
      toast({
        title: "Error loading theme settings",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateThemeSettings = async (updates: Partial<Omit<ThemeSettings, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('user_theme_settings')
        .upsert({
          user_id: user.id,
          ...themeSettings,
          ...updates
        })
        .select()
        .single();

      if (error) throw error;

      setThemeSettings(data);
      applyThemeToDOM(data);
      
      toast({
        title: "Theme updated",
        description: "Your theme settings have been saved.",
      });

      return data;
    } catch (error: any) {
      toast({
        title: "Error updating theme",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const applyThemeToDOM = (theme: ThemeSettings) => {
    const root = document.documentElement;
    
    // Convert hex to HSL for CSS custom properties
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

    // Apply colors immediately to CSS custom properties
    root.style.setProperty('--primary', hexToHsl(theme.primary_color));
    root.style.setProperty('--secondary', hexToHsl(theme.secondary_color));
    root.style.setProperty('--accent', hexToHsl(theme.accent_color));

    // Apply theme class for background style
    root.className = root.className.replace(/theme-\w+/g, '');
    if (theme.background_style && theme.background_style !== 'default') {
      root.classList.add(`theme-${theme.background_style}`);
    }

    // Apply font family
    if (theme.font_family && theme.font_family !== 'system') {
      root.style.setProperty('--font-family', theme.font_family);
    } else {
      root.style.removeProperty('--font-family');
    }

    // Apply border radius
    const radiusMap = {
      'none': '0px',
      'small': '4px',
      'medium': '8px',
      'large': '12px',
      'full': '9999px'
    };
    root.style.setProperty('--radius', radiusMap[theme.border_radius as keyof typeof radiusMap] || '8px');

    // Apply animations
    if (!theme.animations_enabled) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }
    
    // Force repaint to apply changes immediately
    root.style.display = 'none';
    root.offsetHeight; // trigger reflow
    root.style.display = '';
  };

  // Apply theme on load
  useEffect(() => {
    if (themeSettings) {
      applyThemeToDOM(themeSettings);
    }
  }, [themeSettings]);

  return {
    themeSettings,
    loading,
    updateThemeSettings,
    applyThemeToDOM,
    refetch: fetchThemeSettings
  };
};