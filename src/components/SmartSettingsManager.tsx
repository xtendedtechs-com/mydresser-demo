import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Settings, 
  Palette, 
  Bell, 
  Shield, 
  Eye, 
  Smartphone,
  Globe,
  Clock,
  Zap,
  Database
} from 'lucide-react';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { toast } from 'sonner';

export const SmartSettingsManager = () => {
  const { preferences, updatePreferences, loading } = useUserPreferences();
  
  const [localSettings, setLocalSettings] = useState<any>({});
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (preferences) {
      setLocalSettings(preferences);
    }
  }, [preferences]);

  const handleSettingChange = (category: string, setting: string, value: any) => {
    const updated = {
      ...localSettings,
      [category]: {
        ...localSettings[category],
        [setting]: value
      }
    };
    setLocalSettings(updated);
    setHasChanges(true);
  };

  const saveAllSettings = async () => {
    try {
      await updatePreferences(localSettings);
      setHasChanges(false);
      toast.success('All settings saved successfully!');
    } catch (error) {
      toast.error('Failed to save settings');
    }
  };

  const resetToDefaults = () => {
    const defaults = {
      theme: 'system',
      language: 'en',
      notifications: {
        outfit_suggestions: true,
        style_tips: true,
        weather_alerts: true,
        social_activity: false,
        marketing: false,
        system_updates: true
      },
      privacy_settings: {
        profile_visibility: 'private',
        activity_tracking: true,
        data_collection: true,
        location_sharing: false,
        analytics_consent: true
      },
      accessibility_settings: {
        large_text: false,
        high_contrast: false,
        reduce_motion: false,
        screen_reader_support: false,
        keyboard_navigation: false,
        color_blind_friendly: false,
        font_size_multiplier: 1.0,
        voice_navigation: false
      },
      app_behavior: {
        auto_save: true,
        offline_mode: true,
        data_sync: true,
        background_refresh: true,
        push_notifications: true,
        biometric_unlock: false,
        smart_suggestions: true,
        analytics_tracking: true
      }
    };
    setLocalSettings(defaults);
    setHasChanges(true);
  };

  const settingSections = [
    {
      id: 'notifications',
      title: 'Notifications',
      description: 'Control what notifications you receive',
      icon: Bell,
      settings: [
        { key: 'outfit_suggestions', label: 'Daily Outfit Suggestions', type: 'boolean' },
        { key: 'style_tips', label: 'Style Tips & Recommendations', type: 'boolean' },
        { key: 'weather_alerts', label: 'Weather-Based Outfit Alerts', type: 'boolean' },
        { key: 'social_activity', label: 'Social Activity Updates', type: 'boolean' },
        { key: 'marketing', label: 'Marketing Communications', type: 'boolean' },
        { key: 'system_updates', label: 'System & Security Updates', type: 'boolean' }
      ]
    },
    {
      id: 'privacy_settings',
      title: 'Privacy & Security',
      description: 'Manage your privacy and data security',
      icon: Shield,
      settings: [
        { 
          key: 'profile_visibility', 
          label: 'Profile Visibility', 
          type: 'select',
          options: [
            { value: 'public', label: 'Public' },
            { value: 'friends', label: 'Friends Only' },
            { value: 'private', label: 'Private' }
          ]
        },
        { key: 'activity_tracking', label: 'Activity Tracking', type: 'boolean' },
        { key: 'data_collection', label: 'Anonymous Data Collection', type: 'boolean' },
        { key: 'location_sharing', label: 'Location-Based Features', type: 'boolean' },
        { key: 'analytics_consent', label: 'Analytics & Improvement', type: 'boolean' }
      ]
    },
    {
      id: 'accessibility_settings',
      title: 'Accessibility',
      description: 'Customize the app for your needs',
      icon: Eye,
      settings: [
        { key: 'large_text', label: 'Large Text', type: 'boolean' },
        { key: 'high_contrast', label: 'High Contrast Mode', type: 'boolean' },
        { key: 'reduce_motion', label: 'Reduce Motion Effects', type: 'boolean' },
        { key: 'color_blind_friendly', label: 'Color Blind Friendly', type: 'boolean' },
        { key: 'screen_reader_support', label: 'Screen Reader Support', type: 'boolean' },
        { key: 'keyboard_navigation', label: 'Enhanced Keyboard Navigation', type: 'boolean' },
        { key: 'voice_navigation', label: 'Voice Commands', type: 'boolean' },
        { 
          key: 'font_size_multiplier', 
          label: 'Font Size Multiplier', 
          type: 'slider',
          min: 0.8,
          max: 2.0,
          step: 0.1
        }
      ]
    },
    {
      id: 'app_behavior',
      title: 'App Behavior',
      description: 'Control how the app works for you',
      icon: Zap,
      settings: [
        { key: 'auto_save', label: 'Auto-Save Changes', type: 'boolean' },
        { key: 'offline_mode', label: 'Offline Mode', type: 'boolean' },
        { key: 'data_sync', label: 'Auto Data Sync', type: 'boolean' },
        { key: 'background_refresh', label: 'Background Refresh', type: 'boolean' },
        { key: 'push_notifications', label: 'Push Notifications', type: 'boolean' },
        { key: 'biometric_unlock', label: 'Biometric Authentication', type: 'boolean' },
        { key: 'smart_suggestions', label: 'AI-Powered Suggestions', type: 'boolean' },
        { key: 'analytics_tracking', label: 'Usage Analytics', type: 'boolean' }
      ]
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <Database className="w-8 h-8 animate-pulse text-primary mx-auto" />
          <p>Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="w-6 h-6" />
            <span>Comprehensive Settings</span>
          </CardTitle>
          <CardDescription>
            Customize every aspect of your MyDresser experience
          </CardDescription>
        </CardHeader>
        
        {hasChanges && (
          <CardContent className="border-t bg-muted/50">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                You have unsaved changes
              </p>
              <div className="flex space-x-2">
                <Button variant="outline" onClick={() => setLocalSettings(preferences)}>
                  Cancel
                </Button>
                <Button onClick={saveAllSettings}>
                  Save All Changes
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Global Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Globe className="w-5 h-5" />
            <span>Global Preferences</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Theme</label>
              <Select 
                value={localSettings.theme || 'system'}
                onValueChange={(value) => setLocalSettings({...localSettings, theme: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Language</label>
              <Select 
                value={localSettings.language || 'en'}
                onValueChange={(value) => setLocalSettings({...localSettings, language: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="de">Deutsch</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dynamic Settings Sections */}
      {settingSections.map((section) => (
        <Card key={section.id}>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <section.icon className="w-5 h-5" />
              <span>{section.title}</span>
            </CardTitle>
            <CardDescription>{section.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {section.settings.map((setting, index) => (
              <div key={setting.key}>
                {index > 0 && <Separator className="my-4" />}
                
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <label className="text-sm font-medium">
                      {setting.label}
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {setting.type === 'boolean' && (
                      <Switch
                        checked={localSettings[section.id]?.[setting.key] || false}
                        onCheckedChange={(checked) => 
                          handleSettingChange(section.id, setting.key, checked)
                        }
                      />
                    )}
                    
                    {setting.type === 'select' && setting.options && (
                      <Select
                        value={localSettings[section.id]?.[setting.key] || setting.options[0].value}
                        onValueChange={(value) => 
                          handleSettingChange(section.id, setting.key, value)
                        }
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {setting.options.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    
                    {setting.type === 'slider' && (
                      <div className="flex items-center space-x-4 w-40">
                        <Slider
                          value={[localSettings[section.id]?.[setting.key] || setting.min || 1]}
                          onValueChange={(value) => 
                            handleSettingChange(section.id, setting.key, value[0])
                          }
                          min={setting.min || 0}
                          max={setting.max || 100}
                          step={setting.step || 1}
                        />
                        <Badge variant="outline" className="text-xs">
                          {(localSettings[section.id]?.[setting.key] || setting.min || 1).toFixed(1)}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}

      {/* Actions */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Reset Settings</h4>
              <p className="text-sm text-muted-foreground">
                Reset all settings to their default values
              </p>
            </div>
            <Button variant="outline" onClick={resetToDefaults}>
              Reset to Defaults
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};