import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useProfile } from '@/hooks/useProfile';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { Separator } from '@/components/ui/separator';

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
      console.error('Profile update error:', error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleNotificationToggle = async (key: string, value: boolean) => {
    try {
      const newNotifications = { ...preferences.notifications, [key]: value };
      await updatePreferences({ notifications: newNotifications });
    } catch (error) {
      console.error('Notification update error:', error);
      toast({
        title: "Error",
        description: "Failed to update notification settings.",
        variant: "destructive",
      });
    }
  };

  const handlePrivacyToggle = async (key: string, value: boolean | string) => {
    try {
      const newPrivacy = { ...preferences.privacy, [key]: value };
      await updatePreferences({ privacy: newPrivacy });
    } catch (error) {
      console.error('Privacy update error:', error);
      toast({
        title: "Error",
        description: "Failed to update privacy settings.",
        variant: "destructive",
      });
    }
  };

  const handleAppBehaviorToggle = async (key: string, value: boolean) => {
    try {
      const newBehavior = { ...preferences.app_behavior, [key]: value };
      await updatePreferences({ app_behavior: newBehavior });
    } catch (error) {
      console.error('App behavior update error:', error);
      toast({
        title: "Error", 
        description: "Failed to update app behavior settings.",
        variant: "destructive",
      });
    }
  };

  const renderContent = () => {
    switch (settingType) {
      case 'account':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>Manage your account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={localProfile.full_name}
                  onChange={(e) => setLocalProfile(prev => ({ ...prev, full_name: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="bio">Bio</Label>
                <Input
                  id="bio"
                  value={localProfile.bio}
                  onChange={(e) => setLocalProfile(prev => ({ ...prev, bio: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={localProfile.location}
                  onChange={(e) => setLocalProfile(prev => ({ ...prev, location: e.target.value }))}
                />
              </div>
              <Button onClick={handleSaveProfile}>Save Changes</Button>
            </CardContent>
          </Card>
        );

      case 'notifications':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Control what notifications you receive</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="email-notifications">Email Notifications</Label>
                <Switch
                  id="email-notifications"
                  checked={preferences.notifications?.email || false}
                  onCheckedChange={(checked) => handleNotificationToggle('email', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="outfit-suggestions">Outfit Suggestions</Label>
                <Switch
                  id="outfit-suggestions"
                  checked={preferences.notifications?.outfit_suggestions || false}
                  onCheckedChange={(checked) => handleNotificationToggle('outfit_suggestions', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="social-interactions">Social Interactions</Label>
                <Switch
                  id="social-interactions"
                  checked={preferences.notifications?.social_interactions || false}
                  onCheckedChange={(checked) => handleNotificationToggle('social_interactions', checked)}
                />
              </div>
            </CardContent>
          </Card>
        );

      case 'privacy':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Privacy Settings</CardTitle>
              <CardDescription>Control your privacy and data sharing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="show-wardrobe">Show Wardrobe Publicly</Label>
                <Switch
                  id="show-wardrobe"
                  checked={preferences.privacy?.show_wardrobe || false}
                  onCheckedChange={(checked) => handlePrivacyToggle('show_wardrobe', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="allow-messages">Allow Messages</Label>
                <Switch
                  id="allow-messages"
                  checked={preferences.privacy?.allow_messages || false}
                  onCheckedChange={(checked) => handlePrivacyToggle('allow_messages', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="location-sharing">Location Sharing</Label>
                <Switch
                  id="location-sharing"
                  checked={preferences.privacy?.location_sharing || false}
                  onCheckedChange={(checked) => handlePrivacyToggle('location_sharing', checked)}
                />
              </div>
            </CardContent>
          </Card>
        );

      case 'behavior':
        return (
          <Card>
            <CardHeader>
              <CardTitle>App Behavior</CardTitle>
              <CardDescription>Customize how the app behaves</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="auto-save">Auto Save</Label>
                <Switch
                  id="auto-save"
                  checked={preferences.app_behavior?.auto_save || false}
                  onCheckedChange={(checked) => handleAppBehaviorToggle('auto_save', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="show-tips">Show Tips</Label>
                <Switch
                  id="show-tips"
                  checked={preferences.app_behavior?.show_tips || false}
                  onCheckedChange={(checked) => handleAppBehaviorToggle('show_tips', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="quick-actions">Quick Actions</Label>
                <Switch
                  id="quick-actions"
                  checked={preferences.app_behavior?.quick_actions || false}
                  onCheckedChange={(checked) => handleAppBehaviorToggle('quick_actions', checked)}
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
              <CardDescription>{settingDescription}</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Settings for {settingType} will be implemented here.</p>
            </CardContent>
          </Card>
        );
    }
  };

  return renderContent();
};

export default SettingsContentHandler;