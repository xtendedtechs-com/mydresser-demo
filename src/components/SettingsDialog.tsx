import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, User, Bell, Shield, Palette, Globe, Accessibility } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { useProfile } from '@/hooks/useProfile';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import EnhancedThemeSelector from './EnhancedThemeSelector';
import AccessibilitySettings from './AccessibilitySettings';

interface SettingsDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  initialTabType?: string;
}

const SettingsDialog = ({ open, onOpenChange, initialTabType }: SettingsDialogProps) => {
  const { profile, updateProfile } = useProfile();
  const { preferences, updatePreferences, loading } = useUserPreferences();
  const { toast } = useToast();
  
  // Safe preferences with defaults
  const safePreferences = {
    privacy: {
      profile_visibility: preferences?.privacy?.profile_visibility || 'private',
      show_wardrobe: preferences?.privacy?.show_wardrobe || false,
      allow_messages: preferences?.privacy?.allow_messages || false,
      show_activity: preferences?.privacy?.show_activity || false,
      location_sharing: preferences?.privacy?.location_sharing || false,
      ...preferences?.privacy
    },
    notifications: {
      email: preferences?.notifications?.email || false,
      push: preferences?.notifications?.push || false,
      outfit_suggestions: preferences?.notifications?.outfit_suggestions || false,
      social_interactions: preferences?.notifications?.social_interactions || false,
      weather_alerts: preferences?.notifications?.weather_alerts || false,
      new_items: preferences?.notifications?.new_items || false,
      ...preferences?.notifications
    },
    app_behavior: {
      auto_save: preferences?.app_behavior?.auto_save || false,
      show_tips: preferences?.app_behavior?.show_tips || true,
      compact_navigation: preferences?.app_behavior?.compact_navigation || false,
      quick_actions: preferences?.app_behavior?.quick_actions || true,
      gesture_navigation: preferences?.app_behavior?.gesture_navigation || false,
      ...preferences?.app_behavior
    },
    ...preferences
  };
  
  const [localProfile, setLocalProfile] = useState({
    full_name: profile?.full_name || '',
    bio: profile?.bio || '',
    location: profile?.location || '',
    avatar_url: profile?.avatar_url || ''
  });

  const [tab, setTab] = useState<'profile'|'notifications'|'privacy'|'appearance'|'accessibility'|'preferences'>('profile');

  const mapTypeToTab = (type?: string): 'profile'|'notifications'|'privacy'|'appearance'|'accessibility'|'preferences' => {
    switch (type) {
      case 'theme':
        return 'appearance';
      case 'privacy':
        return 'privacy';
      case 'notifications':
        return 'notifications';
      case 'accessibility':
        return 'accessibility';
      case 'behavior':
      case 'general':
      case 'preferences':
        return 'preferences';
      default:
        return 'profile';
    }
  };


  const updateProfileField = (key: string, value: any) => {
    setLocalProfile(prev => ({ ...prev, [key]: value }));
  };

  const saveProfile = async () => {
    try {
      await updateProfile(localProfile);
      toast({
        title: 'Profile updated',
        description: 'Your profile has been saved successfully.'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const saveAllSettings = async () => {
    await saveProfile();
  };

  useEffect(() => {
    setTab(mapTypeToTab(initialTabType));
  }, [initialTabType, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Settings
          </DialogTitle>
          <p className="text-sm text-muted-foreground">Manage your profile, privacy, notifications, theme, accessibility, and app preferences.</p>
        </DialogHeader>

        <Tabs value={tab} onValueChange={(v) => setTab(v as any)} className="space-y-4">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="profile" className="flex items-center gap-1">
              <User className="w-4 h-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-1">
              <Bell className="w-4 h-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center gap-1">
              <Shield className="w-4 h-4" />
              Privacy
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex items-center gap-1">
              <Palette className="w-4 h-4" />
              Theme
            </TabsTrigger>
            <TabsTrigger value="accessibility" className="flex items-center gap-1">
              <Accessibility className="w-4 h-4" />
              Accessibility
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex items-center gap-1">
              <Globe className="w-4 h-4" />
              App
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your profile details and bio</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="displayName">Full Name</Label>
                  <Input
                    id="displayName"
                    value={localProfile.full_name}
                    onChange={(e) => updateProfileField('full_name', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Input
                    id="bio"
                    placeholder="Tell others about yourself..."
                    value={localProfile.bio}
                    onChange={(e) => updateProfileField('bio', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="City, Country"
                    value={localProfile.location}
                    onChange={(e) => updateProfileField('location', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="avatar">Avatar URL</Label>
                  <Input
                    id="avatar"
                    placeholder="https://..."
                    value={localProfile.avatar_url}
                    onChange={(e) => updateProfileField('avatar_url', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Choose what notifications you want to receive</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="emailNotifications">Email Notifications</Label>
                  <Switch
                    id="emailNotifications"
                    checked={preferences?.notifications?.email || false}
                    onCheckedChange={(checked) => updatePreferences({
                      ...preferences,
                      notifications: { ...preferences?.notifications, email: checked }
                    })}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <Label htmlFor="pushNotifications">Push Notifications</Label>
                  <Switch
                    id="pushNotifications"
                    checked={preferences?.notifications?.push || false}
                    onCheckedChange={(checked) => updatePreferences({
                      ...preferences,
                      notifications: { ...preferences?.notifications, push: checked }
                    })}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <Label htmlFor="outfitSuggestions">Outfit Suggestions</Label>
                  <Switch
                    id="outfitSuggestions"
                    checked={preferences?.notifications?.outfit_suggestions || false}
                    onCheckedChange={(checked) => updatePreferences({
                      ...preferences,
                      notifications: { ...preferences?.notifications, outfit_suggestions: checked }
                    })}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <Label htmlFor="socialInteractions">Social Interactions</Label>
                  <Switch
                    id="socialInteractions"
                    checked={preferences?.notifications?.social_interactions || false}
                    onCheckedChange={(checked) => updatePreferences({
                      ...preferences,
                      notifications: { ...preferences?.notifications, social_interactions: checked }
                    })}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <Label htmlFor="weatherAlerts">Weather Alerts</Label>
                  <Switch
                    id="weatherAlerts"
                    checked={preferences?.notifications?.weather_alerts || false}
                    onCheckedChange={(checked) => updatePreferences({
                      ...preferences,
                      notifications: { ...preferences?.notifications, weather_alerts: checked }
                    })}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <Label htmlFor="newItems">New Items</Label>
                  <Switch
                    id="newItems"
                    checked={preferences?.notifications?.new_items || false}
                    onCheckedChange={(checked) => updatePreferences({
                      ...preferences,
                      notifications: { ...preferences?.notifications, new_items: checked }
                    })}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="privacy" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Privacy Settings</CardTitle>
                <CardDescription>Control your privacy and data sharing preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Profile Visibility</Label>
                  <Select 
                    value={preferences?.privacy?.profile_visibility || 'private'} 
                    onValueChange={(value) => updatePreferences({
                      ...preferences,
                      privacy: { ...preferences?.privacy, profile_visibility: value as 'public' | 'friends' | 'private' }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="friends">Friends Only</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <Label htmlFor="showWardrobe">Show Wardrobe</Label>
                  <Switch
                    id="showWardrobe"
                    checked={safePreferences.privacy.show_wardrobe}
                    onCheckedChange={(checked) => updatePreferences({
                      ...safePreferences,
                      privacy: { ...safePreferences.privacy, show_wardrobe: checked }
                    })}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <Label htmlFor="allowMessages">Allow Direct Messages</Label>
                  <Switch
                    id="allowMessages"
                    checked={safePreferences.privacy.allow_messages}
                    onCheckedChange={(checked) => updatePreferences({
                      ...safePreferences,
                      privacy: { ...safePreferences.privacy, allow_messages: checked }
                    })}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <Label htmlFor="showActivity">Show Activity</Label>
                  <Switch
                    id="showActivity"
                    checked={safePreferences.privacy.show_activity}
                    onCheckedChange={(checked) => updatePreferences({
                      ...safePreferences,
                      privacy: { ...safePreferences.privacy, show_activity: checked }
                    })}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <Label htmlFor="locationSharing">Location Sharing</Label>
                  <Switch
                    id="locationSharing"
                    checked={safePreferences.privacy.location_sharing}
                    onCheckedChange={(checked) => updatePreferences({
                      ...safePreferences,
                      privacy: { ...safePreferences.privacy, location_sharing: checked }
                    })}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appearance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Theme Customization</CardTitle>
                <CardDescription>Personalize your app's appearance</CardDescription>
              </CardHeader>
              <CardContent>
                <EnhancedThemeSelector />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="accessibility" className="space-y-4">
            <AccessibilitySettings />
          </TabsContent>

          <TabsContent value="preferences" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>App Behavior</CardTitle>
                <CardDescription>Configure how the app works for you</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="autoSave">Auto Save</Label>
                  <Switch
                    id="autoSave"
                    checked={safePreferences.app_behavior.auto_save}
                    onCheckedChange={(checked) => updatePreferences({
                      ...safePreferences,
                      app_behavior: { ...safePreferences.app_behavior, auto_save: checked }
                    })}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <Label htmlFor="showTips">Show Tips</Label>
                  <Switch
                    id="showTips"
                    checked={safePreferences.app_behavior.show_tips}
                    onCheckedChange={(checked) => updatePreferences({
                      ...safePreferences,
                      app_behavior: { ...safePreferences.app_behavior, show_tips: checked }
                    })}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <Label htmlFor="compactNavigation">Compact Navigation</Label>
                  <Switch
                    id="compactNavigation"
                    checked={safePreferences.app_behavior.compact_navigation}
                    onCheckedChange={(checked) => updatePreferences({
                      ...safePreferences,
                      app_behavior: { ...safePreferences.app_behavior, compact_navigation: checked }
                    })}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <Label htmlFor="quickActions">Quick Actions</Label>
                  <Switch
                    id="quickActions"
                    checked={safePreferences.app_behavior.quick_actions}
                    onCheckedChange={(checked) => updatePreferences({
                      ...safePreferences,
                      app_behavior: { ...safePreferences.app_behavior, quick_actions: checked }
                    })}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <Label htmlFor="gestureNavigation">Gesture Navigation</Label>
                  <Switch
                    id="gestureNavigation"
                    checked={safePreferences.app_behavior.gesture_navigation}
                    onCheckedChange={(checked) => updatePreferences({
                      ...safePreferences,
                      app_behavior: { ...safePreferences.app_behavior, gesture_navigation: checked }
                    })}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange?.(false)}>
            Cancel
          </Button>
          <Button onClick={saveAllSettings} disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsDialog;