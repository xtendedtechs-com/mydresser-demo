import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useProfile } from '@/hooks/useProfile';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useToast } from '@/hooks/use-toast';
import ThemeCustomizer from './ThemeCustomizer';
import ComprehensiveAuthSystem from './ComprehensiveAuthSystem';
import AccessibilitySettings from './AccessibilitySettings';
import NotificationSettings from './NotificationSettings';

interface SettingsContentHandlerProps {
  settingType: string;
  settingTitle: string;
  settingDescription: string;
}

const SettingsContentHandler = ({ settingType, settingTitle, settingDescription }: SettingsContentHandlerProps) => {
  const { profile, updateProfile } = useProfile();
  const { preferences, updatePreferences } = useUserPreferences();
  const { toast } = useToast();
  
  const [localProfile, setLocalProfile] = useState({
    full_name: profile?.full_name || '',
    bio: profile?.bio || '',
    location: profile?.location || '',
    avatar_url: profile?.avatar_url || ''
  });

  const handleSaveProfile = async () => {
    try {
      await updateProfile(localProfile);
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleNotificationToggle = async (key: string, value: boolean) => {
    await updatePreferences({
      ...preferences,
      notifications: { ...preferences?.notifications, [key]: value }
    });
  };

  const handlePrivacyToggle = async (key: string, value: boolean) => {
    await updatePreferences({
      ...preferences,
      privacy: { ...preferences?.privacy, [key]: value }
    });
  };

  const handleAppBehaviorToggle = async (key: string, value: boolean) => {
    await updatePreferences({
      ...preferences,
      app_behavior: { ...preferences?.app_behavior, [key]: value }
    });
  };

  const renderContent = () => {
    switch (settingType) {
      case 'profile':
        return (
          <Card>
            <CardHeader>
              <CardTitle>{settingTitle}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={localProfile.full_name}
                  onChange={(e) => setLocalProfile(prev => ({ ...prev, full_name: e.target.value }))}
                  placeholder="Enter your full name"
                />
              </div>
              <div>
                <Label htmlFor="bio">Bio</Label>
                <Input
                  id="bio"
                  value={localProfile.bio}
                  onChange={(e) => setLocalProfile(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Tell us about yourself"
                />
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={localProfile.location}
                  onChange={(e) => setLocalProfile(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="City, Country"
                />
              </div>
              <Button onClick={handleSaveProfile}>Save Profile</Button>
            </CardContent>
          </Card>
        );

      case 'authentication':
        return <ComprehensiveAuthSystem />;

      case 'theme':
        return <ThemeCustomizer />;

      case 'accessibility':
        return <AccessibilitySettings />;

      case 'notifications':
        return <NotificationSettings />;

      case 'general':
        return (
          <Card>
            <CardHeader>
              <CardTitle>{settingTitle}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="auto-save">Auto Save Changes</Label>
                <Switch
                  id="auto-save"
                  checked={preferences?.app_behavior?.auto_save || false}
                  onCheckedChange={(checked) => handleAppBehaviorToggle('auto_save', checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <Label htmlFor="show-tips">Show Tips & Hints</Label>
                <Switch
                  id="show-tips"
                  checked={preferences?.app_behavior?.show_tips || false}
                  onCheckedChange={(checked) => handleAppBehaviorToggle('show_tips', checked)}
                />
              </div>
              <Separator />
              <div>
                <Label>Language</Label>
                <Select 
                  value={preferences?.language || 'en'}
                  onValueChange={(value) => updatePreferences({ ...preferences, language: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="de">Deutsch</SelectItem>
                    <SelectItem value="it">Italiano</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        );

      case 'permissions':
        return (
          <Card>
            <CardHeader>
              <CardTitle>{settingTitle}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="location-access">Location Access</Label>
                  <Switch
                    id="location-access"
                    checked={preferences?.privacy?.location_sharing || false}
                    onCheckedChange={(checked) => handlePrivacyToggle('location_sharing', checked)}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <Label htmlFor="show-activity">Show Activity</Label>
                  <Switch
                    id="show-activity"
                    checked={preferences?.privacy?.show_activity || false}
                    onCheckedChange={(checked) => handlePrivacyToggle('show_activity', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 'preferences':
        return (
          <Card>
            <CardHeader>
              <CardTitle>{settingTitle}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="weather-based">Weather-Based Recommendations</Label>
                <Switch
                  id="weather-based"
                  checked={preferences?.suggestion_settings?.weather_based || false}
                  onCheckedChange={(checked) => updatePreferences({
                    ...preferences,
                    suggestion_settings: { ...preferences?.suggestion_settings, weather_based: checked }
                  })}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <Label htmlFor="occasion-based">Occasion-Based Suggestions</Label>
                <Switch
                  id="occasion-based"
                  checked={preferences?.suggestion_settings?.occasion_based || false}
                  onCheckedChange={(checked) => updatePreferences({
                    ...preferences,
                    suggestion_settings: { ...preferences?.suggestion_settings, occasion_based: checked }
                  })}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <Label htmlFor="color-matching">Color Matching</Label>
                <Switch
                  id="color-matching"
                  checked={preferences?.suggestion_settings?.color_matching || false}
                  onCheckedChange={(checked) => updatePreferences({
                    ...preferences,
                    suggestion_settings: { ...preferences?.suggestion_settings, color_matching: checked }
                  })}
                />
              </div>
            </CardContent>
          </Card>
        );

      case 'privacy':
        return (
          <Card>
            <CardHeader>
              <CardTitle>{settingTitle}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
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
                <Label htmlFor="show-wardrobe">Show Wardrobe</Label>
                <Switch
                  id="show-wardrobe"
                  checked={preferences?.privacy?.show_wardrobe || false}
                  onCheckedChange={(checked) => handlePrivacyToggle('show_wardrobe', checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <Label htmlFor="allow-messages">Allow Direct Messages</Label>
                <Switch
                  id="allow-messages"
                  checked={preferences?.privacy?.allow_messages || false}
                  onCheckedChange={(checked) => handlePrivacyToggle('allow_messages', checked)}
                />
              </div>
            </CardContent>
          </Card>
        );

      default:
        return (
          <Card>
            <CardHeader>
              <CardTitle>{settingTitle}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{settingDescription}</p>
            </CardContent>
          </Card>
        );
    }
  };

  return renderContent();
};

export default SettingsContentHandler;