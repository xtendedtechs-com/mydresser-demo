import { supabase } from '@/integrations/supabase/client';
import type { AppSettings } from '@/types/settings';
import { getDefaultSettings } from '@/types/settings';

export class SettingsService {
  /**
   * Load user settings from database
   */
  static async loadSettings(userId: string): Promise<Partial<AppSettings>> {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('settings')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error loading settings:', error);
        return getDefaultSettings();
      }

      if (!data) {
        // No settings found, create default settings
        const defaultSettings = getDefaultSettings();
        await this.saveSettings(userId, defaultSettings);
        return defaultSettings;
      }

      // Merge with defaults to ensure all keys exist
      const defaults = getDefaultSettings();
      const storedSettings = (data as any).settings || {};
      return {
        ...defaults,
        ...storedSettings,
      } as Partial<AppSettings>;
    } catch (error) {
      console.error('Exception loading settings:', error);
      return getDefaultSettings();
    }
  }

  /**
   * Save user settings to database
   * Uses MERGE strategy - only updates provided fields
   */
  static async saveSettings(
    userId: string,
    settings: Partial<AppSettings>
  ): Promise<boolean> {
    try {
      // Get existing settings first
      const { data: existing } = await supabase
        .from('user_settings')
        .select('settings')
        .eq('user_id', userId)
        .maybeSingle();

      // Merge with existing settings
      const existingSettings = ((existing as any)?.settings || {}) as Partial<AppSettings>;
      const mergedSettings = {
        ...existingSettings,
        ...settings,
        lastUpdated: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: userId,
          settings: mergedSettings,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('Error saving settings:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Exception saving settings:', error);
      return false;
    }
  }

  /**
   * Update specific feature settings
   */
  static async updateFeatureSettings<K extends keyof AppSettings>(
    userId: string,
    feature: K,
    featureSettings: Partial<AppSettings[K]>
  ): Promise<boolean> {
    try {
      // Get current settings
      const currentSettings = await this.loadSettings(userId);

      // Merge feature settings
      const currentFeature = (currentSettings[feature] || {}) as Record<string, any>;
      const updatedSettings = {
        ...currentSettings,
        [feature]: {
          ...currentFeature,
          ...featureSettings,
        },
      };

      return await this.saveSettings(userId, updatedSettings);
    } catch (error) {
      console.error('Exception updating feature settings:', error);
      return false;
    }
  }

  /**
   * Reset settings to defaults
   */
  static async resetSettings(userId: string): Promise<boolean> {
    try {
      const defaultSettings = getDefaultSettings();
      return await this.saveSettings(userId, defaultSettings);
    } catch (error) {
      console.error('Exception resetting settings:', error);
      return false;
    }
  }

  /**
   * Reset specific feature settings to defaults
   */
  static async resetFeatureSettings<K extends keyof AppSettings>(
    userId: string,
    feature: K
  ): Promise<boolean> {
    try {
      const defaultSettings = getDefaultSettings();
      const featureDefaults = defaultSettings[feature];

      if (!featureDefaults) {
        return false;
      }

      return await this.updateFeatureSettings(userId, feature, featureDefaults as any);
    } catch (error) {
      console.error('Exception resetting feature settings:', error);
      return false;
    }
  }

  /**
   * Export settings as JSON
   */
  static async exportSettings(userId: string): Promise<string | null> {
    try {
      const settings = await this.loadSettings(userId);
      return JSON.stringify(settings, null, 2);
    } catch (error) {
      console.error('Exception exporting settings:', error);
      return null;
    }
  }

  /**
   * Import settings from JSON
   */
  static async importSettings(
    userId: string,
    settingsJson: string
  ): Promise<boolean> {
    try {
      const settings = JSON.parse(settingsJson);
      return await this.saveSettings(userId, settings);
    } catch (error) {
      console.error('Exception importing settings:', error);
      return false;
    }
  }
}
