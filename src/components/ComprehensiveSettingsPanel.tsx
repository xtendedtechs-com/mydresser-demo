import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Settings,
  User,
  Bell,
  Shield,
  Eye,
  Palette,
  Globe,
  Database,
  Smartphone,
  Lock,
  Download,
  Trash2,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import PrivacyComplianceManager from '@/components/PrivacyComplianceManager';
import ComprehensiveAuthSystem from '@/components/ComprehensiveAuthSystem';

interface SettingsPanelProps {
  activeSection?: string;
}

const ComprehensiveSettingsPanel = ({ activeSection = 'account' }: SettingsPanelProps) => {
  const { user, profile, updateProfile } = useProfile();
  const { preferences, updatePreferences, loading } = useUserPreferences();
  const { toast } = useToast();
  
  const [localProfile, setLocalProfile] = useState({
    full_name: profile?.full_name || '',
    bio: profile?.bio || '',
    location: profile?.location || '',
    avatar_url: profile?.avatar_url || ''
  });
  
  const [contactInfo, setContactInfo] = useState({
    email: '',
    social_instagram: '',
    social_facebook: '',
    social_tiktok: ''
  });
  
  const [loadingContactInfo, setLoadingContactInfo] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setLocalProfile({
        full_name: profile.full_name || '',
        bio: profile.bio || '',
        location: profile.location || '',
        avatar_url: profile.avatar_url || ''
      });
    }
  }, [profile]);

  useEffect(() => {
    loadContactInfo();
  }, []);

  const loadContactInfo = async () => {
    try {
      setLoadingContactInfo(true);
      const { data, error } = await supabase.rpc('get_user_contact_info_secure');
      if (error) throw error;
      
      if (data && data.length > 0) {
        setContactInfo({
          email: data[0].email || '',
          social_instagram: data[0].social_instagram || '',
          social_facebook: data[0].social_facebook || '',
          social_tiktok: data[0].social_tiktok || ''
        });
      }
    } catch (error: any) {
      console.error('Error loading contact info:', error);
    } finally {
      setLoadingContactInfo(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
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
    } finally {
      setSaving(false);
    }
  };

  const handleSaveContactInfo = async () => {
    try {
      setSaving(true);
      const { error } = await supabase.rpc('update_contact_info_secure', {
        new_email: contactInfo.email || null,
        new_instagram: contactInfo.social_instagram || null,
        new_facebook: contactInfo.social_facebook || null,
        new_tiktok: contactInfo.social_tiktok || null
      });
      
      if (error) throw error;
      
      toast({
        title: "Contact information updated",
        description: "Your contact information has been saved securely.",
      });
    } catch (error: any) {
      console.error('Contact info update error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update contact information.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePreferenceChange = async (category: string, setting: string, value: any) => {
    try {
      const newPreferences = {
        ...preferences,
        [category]: {
          ...preferences[category],
          [setting]: value
        }
      };
      await updatePreferences(newPreferences);
    } catch (error) {
      console.error('Preference update error:', error);
      toast({
        title: "Error",
        description: "Failed to update preferences.",
        variant: "destructive",
      });
    }
  };

  const exportAllData = async () => {
    try {
      // Export comprehensive user data
      const { data: profileData } = await supabase.from('profiles').select('*').single();
      const { data: wardrobeData } = await supabase.from('wardrobe_items').select('*');
      const { data: outfitsData } = await supabase.from('outfits').select('*');
      const { data: preferencesData } = await supabase.from('user_preferences').select('*').single();
      const { data: contactData } = await supabase.rpc('get_user_contact_info_secure');

      const exportData = {
        profile: profileData,
        wardrobe: wardrobeData || [],
        outfits: outfitsData || [],
        preferences: preferencesData,
        contact: contactData?.[0] || {},
        exportDate: new Date().toISOString(),
        exportType: 'COMPLETE_DATA_EXPORT'
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
        type: 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mydresser-complete-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Data exported successfully",
        description: "Your complete data has been downloaded.",
      });
    } catch (error: any) {
      toast({
        title: "Export failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

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
    <div className="max-w-4xl mx-auto space-y-6">
      <Tabs value={activeSection} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="account" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Account
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            App
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Alerts
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Privacy
          </TabsTrigger>
          <TabsTrigger value="accessibility" className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Access
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Lock className="w-4 h-4" />
            Security
          </TabsTrigger>
        </TabsList>

        {/* Account Settings */}
        <TabsContent value="account" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Manage your personal information and profile details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={localProfile.location}
                    onChange={(e) => setLocalProfile(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="City, Country"
                  />
                </div>
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
              
              <Button onClick={handleSaveProfile} disabled={saving}>
                {saving ? "Saving..." : "Save Profile"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>Manage your contact details and social media links</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loadingContactInfo ? (
                <div className="text-center py-4">Loading contact information...</div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={contactInfo.email}
                      onChange={(e) => setContactInfo(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="your@email.com"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="instagram">Instagram</Label>
                      <Input
                        id="instagram"
                        value={contactInfo.social_instagram}
                        onChange={(e) => setContactInfo(prev => ({ ...prev, social_instagram: e.target.value }))}
                        placeholder="@username"
                      />
                    </div>
                    <div>
                      <Label htmlFor="facebook">Facebook</Label>
                      <Input
                        id="facebook"
                        value={contactInfo.social_facebook}
                        onChange={(e) => setContactInfo(prev => ({ ...prev, social_facebook: e.target.value }))}
                        placeholder="facebook.com/username"
                      />
                    </div>
                    <div>
                      <Label htmlFor="tiktok">TikTok</Label>
                      <Input
                        id="tiktok"
                        value={contactInfo.social_tiktok}
                        onChange={(e) => setContactInfo(prev => ({ ...prev, social_tiktok: e.target.value }))}
                        placeholder="@username"
                      />
                    </div>
                  </div>
                  
                  <Button onClick={handleSaveContactInfo} disabled={saving}>
                    {saving ? "Saving..." : "Save Contact Info"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* App Preferences */}
        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Application Behavior</CardTitle>
              <CardDescription>Customize how the app works for you</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="auto-save">Auto-Save Changes</Label>
                    <Switch
                      id="auto-save"
                      checked={preferences.app_behavior?.auto_save || false}
                      onCheckedChange={(checked) => handlePreferenceChange('app_behavior', 'auto_save', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="show-tips">Show Tips & Hints</Label>
                    <Switch
                      id="show-tips"
                      checked={preferences.app_behavior?.show_tips || false}
                      onCheckedChange={(checked) => handlePreferenceChange('app_behavior', 'show_tips', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="quick-actions">Enable Quick Actions</Label>
                    <Switch
                      id="quick-actions"
                      checked={preferences.app_behavior?.quick_actions || false}
                      onCheckedChange={(checked) => handlePreferenceChange('app_behavior', 'quick_actions', checked)}
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label>Language</Label>
                    <Select 
                      value={preferences.language || 'en'}
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
                  
                  <div>
                    <Label>Theme</Label>
                    <Select 
                      value={preferences.theme?.mode || 'system'}
                      onValueChange={(value) => updatePreferences({ 
                        ...preferences, 
                        theme: { ...preferences.theme, mode: value as any }
                      })}
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
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Control what notifications you receive</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="email-notifications">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                  </div>
                  <Switch
                    id="email-notifications"
                    checked={preferences.notifications?.email || false}
                    onCheckedChange={(checked) => handlePreferenceChange('notifications', 'email', checked)}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="outfit-suggestions">Daily Outfit Suggestions</Label>
                    <p className="text-sm text-muted-foreground">AI-powered outfit recommendations</p>
                  </div>
                  <Switch
                    id="outfit-suggestions"
                    checked={preferences.notifications?.outfit_suggestions || false}
                    onCheckedChange={(checked) => handlePreferenceChange('notifications', 'outfit_suggestions', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="weather-alerts">Weather Alerts</Label>
                    <p className="text-sm text-muted-foreground">Weather-based outfit recommendations</p>
                  </div>
                  <Switch
                    id="weather-alerts"
                    checked={preferences.notifications?.weather_alerts || false}
                    onCheckedChange={(checked) => handlePreferenceChange('notifications', 'weather_alerts', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="social-interactions">Social Interactions</Label>
                    <p className="text-sm text-muted-foreground">Likes, follows, and comments</p>
                  </div>
                  <Switch
                    id="social-interactions"
                    checked={preferences.notifications?.social_interactions || false}
                    onCheckedChange={(checked) => handlePreferenceChange('notifications', 'social_interactions', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy */}
        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Privacy Settings</CardTitle>
              <CardDescription>Control your data sharing and privacy preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label>Profile Visibility</Label>
                  <Select 
                    value={preferences.privacy?.profile_visibility || 'private'}
                    onValueChange={(value) => handlePreferenceChange('privacy', 'profile_visibility', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public - Anyone can see</SelectItem>
                      <SelectItem value="friends">Friends Only</SelectItem>
                      <SelectItem value="private">Private - Only you</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="show-wardrobe">Show Wardrobe Publicly</Label>
                    <p className="text-sm text-muted-foreground">Allow others to see your wardrobe items</p>
                  </div>
                  <Switch
                    id="show-wardrobe"
                    checked={preferences.privacy?.show_wardrobe || false}
                    onCheckedChange={(checked) => handlePreferenceChange('privacy', 'show_wardrobe', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="allow-messages">Allow Messages</Label>
                    <p className="text-sm text-muted-foreground">Let other users send you messages</p>
                  </div>
                  <Switch
                    id="allow-messages"
                    checked={preferences.privacy?.allow_messages || false}
                    onCheckedChange={(checked) => handlePreferenceChange('privacy', 'allow_messages', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="location-sharing">Location Sharing</Label>
                    <p className="text-sm text-muted-foreground">Share your location for weather-based suggestions</p>
                  </div>
                  <Switch
                    id="location-sharing"
                    checked={preferences.privacy?.location_sharing || false}
                    onCheckedChange={(checked) => handlePreferenceChange('privacy', 'location_sharing', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <PrivacyComplianceManager />
        </TabsContent>

        {/* Accessibility */}
        <TabsContent value="accessibility" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Accessibility Options</CardTitle>
              <CardDescription>Customize the app for your accessibility needs</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="large-text">Large Text</Label>
                    <p className="text-sm text-muted-foreground">Increase text size throughout the app</p>
                  </div>
                  <Switch
                    id="large-text"
                    checked={preferences.accessibility_settings?.large_text || false}
                    onCheckedChange={(checked) => handlePreferenceChange('accessibility_settings', 'large_text', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="high-contrast">High Contrast Mode</Label>
                    <p className="text-sm text-muted-foreground">Increase contrast for better visibility</p>
                  </div>
                  <Switch
                    id="high-contrast"
                    checked={preferences.accessibility_settings?.high_contrast || false}
                    onCheckedChange={(checked) => handlePreferenceChange('accessibility_settings', 'high_contrast', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="reduce-motion">Reduce Motion</Label>
                    <p className="text-sm text-muted-foreground">Minimize animations and transitions</p>
                  </div>
                  <Switch
                    id="reduce-motion"
                    checked={preferences.accessibility_settings?.reduce_motion || false}
                    onCheckedChange={(checked) => handlePreferenceChange('accessibility_settings', 'reduce_motion', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="screen-reader">Screen Reader Support</Label>
                    <p className="text-sm text-muted-foreground">Enhanced support for screen readers</p>
                  </div>
                  <Switch
                    id="screen-reader"
                    checked={preferences.accessibility_settings?.screen_reader_support || false}
                    onCheckedChange={(checked) => handlePreferenceChange('accessibility_settings', 'screen_reader_support', checked)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Font Size Multiplier</Label>
                  <div className="flex items-center space-x-4">
                    <Slider
                      value={[preferences.accessibility_settings?.font_size_multiplier || 1.0]}
                      onValueChange={(value) => handlePreferenceChange('accessibility_settings', 'font_size_multiplier', value[0])}
                      min={0.8}
                      max={2.0}
                      step={0.1}
                      className="flex-1"
                    />
                    <Badge variant="outline">
                      {(preferences.accessibility_settings?.font_size_multiplier || 1.0).toFixed(1)}x
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security" className="space-y-6">
          <ComprehensiveAuthSystem />
          
          <Card>
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
              <CardDescription>Export or delete your data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Export All Data</h4>
                  <p className="text-sm text-muted-foreground">
                    Download all your data in JSON format
                  </p>
                </div>
                <Button variant="outline" onClick={exportAllData}>
                  <Download className="w-4 h-4 mr-2" />
                  Export Data
                </Button>
              </div>
              
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Data exports include all personal information, wardrobe items, outfits, and preferences.
                  Keep exported files secure.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ComprehensiveSettingsPanel;