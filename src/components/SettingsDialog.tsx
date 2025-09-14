import { useState } from 'react';
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

interface SettingsDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const SettingsDialog = ({ open, onOpenChange }: SettingsDialogProps) => {
  const { profile, updateProfile } = useProfile();
  const { preferences, updatePreferences, loading } = useUserPreferences();
  const { toast } = useToast();
  
  const [localProfile, setLocalProfile] = useState({
    full_name: profile?.full_name || '',
    bio: profile?.bio || '',
    location: profile?.location || '',
    avatar_url: profile?.avatar_url || ''
  });

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Settings
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="profile" className="space-y-4">
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
                    checked={preferences.notifications.email}
                    onCheckedChange={(checked) => updatePreferences({
                      notifications: { ...preferences.notifications, email: checked }
                    })}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <Label htmlFor="pushNotifications">Push Notifications</Label>
                  <Switch
                    id="pushNotifications"
                    checked={preferences.notifications.push}
                    onCheckedChange={(checked) => updatePreferences({
                      notifications: { ...preferences.notifications, push: checked }
                    })}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <Label htmlFor="outfitSuggestions">Outfit Suggestions</Label>
                  <Switch
                    id="outfitSuggestions"
                    checked={preferences.notifications.outfit_suggestions}
                    onCheckedChange={(checked) => updatePreferences({
                      notifications: { ...preferences.notifications, outfit_suggestions: checked }
                    })}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <Label htmlFor="socialInteractions">Social Interactions</Label>
                  <Switch
                    id="socialInteractions"
                    checked={preferences.notifications.social_interactions}
                    onCheckedChange={(checked) => updatePreferences({
                      notifications: { ...preferences.notifications, social_interactions: checked }
                    })}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <Label htmlFor="weatherAlerts">Weather Alerts</Label>
                  <Switch
                    id="weatherAlerts"
                    checked={preferences.notifications.weather_alerts}
                    onCheckedChange={(checked) => updatePreferences({
                      notifications: { ...preferences.notifications, weather_alerts: checked }
                    })}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <Label htmlFor="newItems">New Items</Label>
                  <Switch
                    id="newItems"
                    checked={preferences.notifications.new_items}
                    onCheckedChange={(checked) => updatePreferences({
                      notifications: { ...preferences.notifications, new_items: checked }
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
                    value={preferences.privacy.profile_visibility} 
                    onValueChange={(value) => updatePreferences({
                      privacy: { ...preferences.privacy, profile_visibility: value as 'public' | 'friends' | 'private' }
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
                    checked={preferences.privacy.show_wardrobe}
                    onCheckedChange={(checked) => updatePreferences({
                      privacy: { ...preferences.privacy, show_wardrobe: checked }
                    })}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <Label htmlFor="allowMessages">Allow Direct Messages</Label>
                  <Switch
                    id="allowMessages"
                    checked={preferences.privacy.allow_messages}
                    onCheckedChange={(checked) => updatePreferences({
                      privacy: { ...preferences.privacy, allow_messages: checked }
                    })}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <Label htmlFor="showActivity">Show Activity</Label>
                  <Switch
                    id="showActivity"
                    checked={preferences.privacy.show_activity}
                    onCheckedChange={(checked) => updatePreferences({
                      privacy: { ...preferences.privacy, show_activity: checked }
                    })}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <Label htmlFor="locationSharing">Location Sharing</Label>
                  <Switch
                    id="locationSharing"
                    checked={preferences.privacy.location_sharing}
                    onCheckedChange={(checked) => updatePreferences({
                      privacy: { ...preferences.privacy, location_sharing: checked }
                    })}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appearance" className="space-y-4">
            <EnhancedThemeSelector />
          </TabsContent>

          <TabsContent value="accessibility" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Accessibility Settings</CardTitle>
                <CardDescription>Configure accessibility options for better user experience</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="highContrast">High Contrast</Label>
                  <Switch
                    id="highContrast"
                    checked={preferences.accessibility_settings.high_contrast}
                    onCheckedChange={(checked) => updatePreferences({
                      accessibility_settings: { ...preferences.accessibility_settings, high_contrast: checked }
                    })}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <Label htmlFor="largeText">Large Text</Label>
                  <Switch
                    id="largeText"
                    checked={preferences.accessibility_settings.large_text}
                    onCheckedChange={(checked) => updatePreferences({
                      accessibility_settings: { ...preferences.accessibility_settings, large_text: checked }
                    })}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <Label htmlFor="reduceMotion">Reduce Motion</Label>
                  <Switch
                    id="reduceMotion"
                    checked={preferences.accessibility_settings.reduce_motion}
                    onCheckedChange={(checked) => updatePreferences({
                      accessibility_settings: { ...preferences.accessibility_settings, reduce_motion: checked }
                    })}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <Label htmlFor="keyboardNavigation">Keyboard Navigation</Label>
                  <Switch
                    id="keyboardNavigation"
                    checked={preferences.accessibility_settings.keyboard_navigation}
                    onCheckedChange={(checked) => updatePreferences({
                      accessibility_settings: { ...preferences.accessibility_settings, keyboard_navigation: checked }
                    })}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <Label htmlFor="colorBlindFriendly">Color Blind Friendly</Label>
                  <Switch
                    id="colorBlindFriendly"
                    checked={preferences.accessibility_settings.color_blind_friendly}
                    onCheckedChange={(checked) => updatePreferences({
                      accessibility_settings: { ...preferences.accessibility_settings, color_blind_friendly: checked }
                    })}
                  />
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label>Font Size Multiplier</Label>
                  <div className="px-2">
                    <Slider
                      value={[preferences.accessibility_settings.font_size_multiplier]}
                      onValueChange={([value]) => updatePreferences({
                        accessibility_settings: { ...preferences.accessibility_settings, font_size_multiplier: value }
                      })}
                      max={2}
                      min={0.8}
                      step={0.1}
                      className="w-full"
                    />
                    <div className="text-sm text-muted-foreground mt-2 text-center">
                      {preferences.accessibility_settings.font_size_multiplier}x
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
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
                    checked={preferences.app_behavior.auto_save}
                    onCheckedChange={(checked) => updatePreferences({
                      app_behavior: { ...preferences.app_behavior, auto_save: checked }
                    })}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <Label htmlFor="showTips">Show Tips</Label>
                  <Switch
                    id="showTips"
                    checked={preferences.app_behavior.show_tips}
                    onCheckedChange={(checked) => updatePreferences({
                      app_behavior: { ...preferences.app_behavior, show_tips: checked }
                    })}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <Label htmlFor="compactNavigation">Compact Navigation</Label>
                  <Switch
                    id="compactNavigation"
                    checked={preferences.app_behavior.compact_navigation}
                    onCheckedChange={(checked) => updatePreferences({
                      app_behavior: { ...preferences.app_behavior, compact_navigation: checked }
                    })}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <Label htmlFor="quickActions">Quick Actions</Label>
                  <Switch
                    id="quickActions"
                    checked={preferences.app_behavior.quick_actions}
                    onCheckedChange={(checked) => updatePreferences({
                      app_behavior: { ...preferences.app_behavior, quick_actions: checked }
                    })}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <Label htmlFor="gestureNavigation">Gesture Navigation</Label>
                  <Switch
                    id="gestureNavigation"
                    checked={preferences.app_behavior.gesture_navigation}
                    onCheckedChange={(checked) => updatePreferences({
                      app_behavior: { ...preferences.app_behavior, gesture_navigation: checked }
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