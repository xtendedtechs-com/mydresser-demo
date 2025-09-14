import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Shield, Bell, Eye, Palette, Settings, Globe, Accessibility } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useProfile } from '@/hooks/useProfile';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import EnhancedThemeSelector from '@/components/EnhancedThemeSelector';
import AccessibilitySettings from '@/components/AccessibilitySettings';

const SettingsPage = () => {
  const { category } = useParams();
  const navigate = useNavigate();
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

  const getPageTitle = () => {
    switch (category) {
      case 'account': return 'Account Settings';
      case 'authentication': return 'Authentication Settings';
      case 'privacy': return 'Privacy & Data Rights';
      case 'data': return 'Data Management';
      case 'preferences': return 'App Preferences';
      case 'general': return 'General Settings';
      case 'permissions': return 'App Permissions';
      case 'notifications': return 'Notification Settings';
      case 'behavior': return 'App Behavior';
      case 'suggestions': return 'Suggestion Settings';
      case 'theme': return 'Theme Settings';
      case 'profile': return 'Profile Settings';
      default: return 'Settings';
    }
  };

  const getPageIcon = () => {
    switch (category) {
      case 'authentication': return Shield;
      case 'privacy': return Eye;
      case 'notifications': return Bell;
      case 'theme': return Palette;
      case 'accessibility': return Accessibility;
      case 'general':
      case 'behavior':
      case 'preferences': return Globe;
      default: return Settings;
    }
  };

  const renderContent = () => {
    switch (category) {
      case 'profile':
        return (
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
              <Button onClick={saveProfile} disabled={loading}>
                {loading ? "Saving..." : "Save Profile"}
              </Button>
            </CardContent>
          </Card>
        );

      case 'notifications':
        return (
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
                  checked={preferences.notifications?.email || false}
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
                  checked={preferences.notifications?.push || false}
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
                  checked={preferences.notifications?.outfit_suggestions || false}
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
                  checked={preferences.notifications?.social_interactions || false}
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
                  checked={preferences.notifications?.weather_alerts || false}
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
                  checked={preferences.notifications?.new_items || false}
                  onCheckedChange={(checked) => updatePreferences({
                    notifications: { ...preferences.notifications, new_items: checked }
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
              <CardTitle>Privacy Settings</CardTitle>
              <CardDescription>Control your privacy and data sharing preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Profile Visibility</Label>
                <Select 
                  value={preferences.privacy?.profile_visibility || 'private'} 
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
                  checked={preferences.privacy?.show_wardrobe || false}
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
                  checked={preferences.privacy?.allow_messages || false}
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
                  checked={preferences.privacy?.show_activity || false}
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
                  checked={preferences.privacy?.location_sharing || false}
                  onCheckedChange={(checked) => updatePreferences({
                    privacy: { ...preferences.privacy, location_sharing: checked }
                  })}
                />
              </div>
            </CardContent>
          </Card>
        );

      case 'theme':
        return <EnhancedThemeSelector />;

      case 'accessibility':
        return <AccessibilitySettings />;

      case 'behavior':
      case 'preferences':
        return (
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
                  checked={preferences.app_behavior?.auto_save || false}
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
                  checked={preferences.app_behavior?.show_tips || false}
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
                  checked={preferences.app_behavior?.compact_navigation || false}
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
                  checked={preferences.app_behavior?.quick_actions || false}
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
                  checked={preferences.app_behavior?.gesture_navigation || false}
                  onCheckedChange={(checked) => updatePreferences({
                    app_behavior: { ...preferences.app_behavior, gesture_navigation: checked }
                  })}
                />
              </div>
            </CardContent>
          </Card>
        );

      default:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Settings Category</CardTitle>
              <CardDescription>Select a specific settings category from your account page</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                This settings page will be populated based on the category you selected.
              </p>
            </CardContent>
          </Card>
        );
    }
  };

  const PageIcon = getPageIcon();

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/account')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <PageIcon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{getPageTitle()}</h1>
              <p className="text-sm text-muted-foreground">
                Manage your {category || 'settings'} preferences
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        {renderContent()}
      </div>
    </div>
  );
};

export default SettingsPage;