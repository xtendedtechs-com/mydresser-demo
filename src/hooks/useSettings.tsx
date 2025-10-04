import { useState, useEffect, useCallback } from 'react';
import { useProfile } from '@/hooks/useProfile';
import { SettingsService } from '@/services/settingsService';
import type { AppSettings } from '@/types/settings';
import { useToast } from '@/hooks/use-toast';

export const useSettings = () => {
  const { profile } = useProfile();
  const { toast } = useToast();
  const [settings, setSettings] = useState<Partial<AppSettings> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load settings on mount
  useEffect(() => {
    if (!profile?.user_id) {
      setLoading(false);
      return;
    }

    const loadSettings = async () => {
      setLoading(true);
      try {
        const loadedSettings = await SettingsService.loadSettings(profile.user_id);
        setSettings(loadedSettings);
      } catch (error) {
        console.error('Failed to load settings:', error);
        toast({
          title: 'Error loading settings',
          description: 'Could not load your settings. Using defaults.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [profile?.user_id, toast]);

  /**
   * Update entire settings object
   */
  const updateSettings = useCallback(
    async (newSettings: Partial<AppSettings>) => {
      if (!profile?.user_id) return false;

      setSaving(true);
      try {
        const success = await SettingsService.saveSettings(profile.user_id, newSettings);
        
        if (success) {
          setSettings((prev) => {
            const prevSettings = prev || {};
            return { ...prevSettings, ...newSettings };
          });
          toast({
            title: 'Settings saved',
            description: 'Your settings have been updated successfully.',
          });
          return true;
        } else {
          throw new Error('Failed to save settings');
        }
      } catch (error) {
        console.error('Failed to update settings:', error);
        toast({
          title: 'Error saving settings',
          description: 'Could not save your settings. Please try again.',
          variant: 'destructive',
        });
        return false;
      } finally {
        setSaving(false);
      }
    },
    [profile?.user_id, toast]
  );

  /**
   * Update specific feature settings
   */
  const updateFeatureSettings = useCallback(
    async <K extends keyof AppSettings>(
      feature: K,
      featureSettings: Partial<AppSettings[K]>
    ) => {
      if (!profile?.user_id) return false;

      setSaving(true);
      try {
        const success = await SettingsService.updateFeatureSettings(
          profile.user_id,
          feature,
          featureSettings
        );

        if (success) {
          setSettings((prev) => {
            const prevSettings = prev || {};
            const prevFeature = (prevSettings[feature] || {}) as Record<string, any>;
            return {
              ...prevSettings,
              [feature]: {
                ...prevFeature,
                ...featureSettings,
              },
            };
          });
          
          toast({
            title: 'Settings saved',
            description: `Your ${feature} settings have been updated.`,
          });
          return true;
        } else {
          throw new Error('Failed to save feature settings');
        }
      } catch (error) {
        console.error('Failed to update feature settings:', error);
        toast({
          title: 'Error saving settings',
          description: `Could not save your ${feature} settings.`,
          variant: 'destructive',
        });
        return false;
      } finally {
        setSaving(false);
      }
    },
    [profile?.user_id, toast]
  );

  /**
   * Reset all settings to defaults
   */
  const resetSettings = useCallback(async () => {
    if (!profile?.user_id) return false;

    setSaving(true);
    try {
      const success = await SettingsService.resetSettings(profile.user_id);
      
      if (success) {
        const defaultSettings = await SettingsService.loadSettings(profile.user_id);
        setSettings(defaultSettings);
        
        toast({
          title: 'Settings reset',
          description: 'All settings have been reset to defaults.',
        });
        return true;
      } else {
        throw new Error('Failed to reset settings');
      }
    } catch (error) {
      console.error('Failed to reset settings:', error);
      toast({
        title: 'Error resetting settings',
        description: 'Could not reset settings. Please try again.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setSaving(false);
    }
  }, [profile?.user_id, toast]);

  /**
   * Reset specific feature settings
   */
  const resetFeatureSettings = useCallback(
    async <K extends keyof AppSettings>(feature: K) => {
      if (!profile?.user_id) return false;

      setSaving(true);
      try {
        const success = await SettingsService.resetFeatureSettings(profile.user_id, feature);
        
        if (success) {
          const updatedSettings = await SettingsService.loadSettings(profile.user_id);
          setSettings(updatedSettings);
          
          toast({
            title: 'Settings reset',
            description: `Your ${feature} settings have been reset to defaults.`,
          });
          return true;
        } else {
          throw new Error('Failed to reset feature settings');
        }
      } catch (error) {
        console.error('Failed to reset feature settings:', error);
        toast({
          title: 'Error resetting settings',
          description: `Could not reset ${feature} settings.`,
          variant: 'destructive',
        });
        return false;
      } finally {
        setSaving(false);
      }
    },
    [profile?.user_id, toast]
  );

  /**
   * Export settings as JSON
   */
  const exportSettings = useCallback(async () => {
    if (!profile?.user_id) return null;

    try {
      const exported = await SettingsService.exportSettings(profile.user_id);
      
      if (exported) {
        // Download as file
        const blob = new Blob([exported], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `mydresser-settings-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        toast({
          title: 'Settings exported',
          description: 'Your settings have been downloaded.',
        });
        return exported;
      }
      return null;
    } catch (error) {
      console.error('Failed to export settings:', error);
      toast({
        title: 'Error exporting settings',
        description: 'Could not export settings.',
        variant: 'destructive',
      });
      return null;
    }
  }, [profile?.user_id, toast]);

  /**
   * Import settings from JSON
   */
  const importSettings = useCallback(
    async (settingsJson: string) => {
      if (!profile?.user_id) return false;

      setSaving(true);
      try {
        const success = await SettingsService.importSettings(profile.user_id, settingsJson);
        
        if (success) {
          const imported = await SettingsService.loadSettings(profile.user_id);
          setSettings(imported);
          
          toast({
            title: 'Settings imported',
            description: 'Your settings have been imported successfully.',
          });
          return true;
        } else {
          throw new Error('Failed to import settings');
        }
      } catch (error) {
        console.error('Failed to import settings:', error);
        toast({
          title: 'Error importing settings',
          description: 'Could not import settings. Please check the file format.',
          variant: 'destructive',
        });
        return false;
      } finally {
        setSaving(false);
      }
    },
    [profile?.user_id, toast]
  );

  // Helper getters for specific feature settings
  const getFeatureSettings = useCallback(
    <K extends keyof AppSettings>(feature: K): Partial<AppSettings>[K] | undefined => {
      return settings?.[feature];
    },
    [settings]
  );

  return {
    settings,
    loading,
    saving,
    updateSettings,
    updateFeatureSettings,
    resetSettings,
    resetFeatureSettings,
    exportSettings,
    importSettings,
    getFeatureSettings,
    
    // Convenience getters
    theme: settings?.theme,
    privacy: settings?.privacy,
    notifications: settings?.notifications,
    wardrobe: settings?.wardrobe,
    outfit: settings?.outfit,
    social: settings?.social,
    marketplace: settings?.marketplace,
    myMirror: settings?.myMirror,
    sustainability: settings?.sustainability,
    challenges: settings?.challenges,
    ai: settings?.ai,
    merchant: settings?.merchant,
    accessibility: settings?.accessibility,
  };
};
