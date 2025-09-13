import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  Settings, 
  Shield, 
  Palette, 
  Bell, 
  Eye, 
  Database, 
  Cloud, 
  Smartphone,
  Lock,
  User,
  Globe,
  Zap
} from "lucide-react";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settingType: string;
  title: string;
  description: string;
}

const SettingsDialog = ({ open, onOpenChange, settingType, title, description }: SettingsDialogProps) => {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: false,
      outfit_suggestions: true,
      new_items: false,
      social_interactions: true,
    },
    privacy: {
      profile_visibility: 'public',
      show_wardrobe: false,
      allow_messages: true,
      show_activity: false,
    },
    theme: {
      mode: 'system',
      accent_color: 'default',
      compact_mode: false,
    },
    data: {
      export_format: 'json',
      auto_backup: true,
    },
    behavior: {
      auto_save: true,
      show_tips: true,
      compact_navigation: false,
    }
  });

  const handleSave = () => {
    toast({
      title: "Settings saved",
      description: `Your ${title.toLowerCase()} have been updated successfully.`,
    });
    onOpenChange(false);
  };

  const renderAccountSettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Account Information
          </CardTitle>
          <CardDescription>Manage your account details and security</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Account Type</Label>
            <Select defaultValue="personal">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="personal">Personal Account</SelectItem>
                <SelectItem value="professional">Professional Stylist</SelectItem>
                <SelectItem value="merchant">Merchant Account</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Two-Factor Authentication</Label>
              <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
            </div>
            <Switch />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Account Recovery</Label>
              <p className="text-sm text-muted-foreground">Enable account recovery options</p>
            </div>
            <Button variant="outline" size="sm">Setup</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderPrivacySettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Profile Visibility
          </CardTitle>
          <CardDescription>Control who can see your profile and content</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Profile Visibility</Label>
            <Select 
              value={settings.privacy.profile_visibility}
              onValueChange={(value) => setSettings({
                ...settings,
                privacy: { ...settings.privacy, profile_visibility: value }
              })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public - Anyone can see my profile</SelectItem>
                <SelectItem value="friends">Friends only</SelectItem>
                <SelectItem value="private">Private - Only me</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Show Wardrobe</Label>
              <p className="text-sm text-muted-foreground">Allow others to see your wardrobe items</p>
            </div>
            <Switch 
              checked={settings.privacy.show_wardrobe}
              onCheckedChange={(checked) => setSettings({
                ...settings,
                privacy: { ...settings.privacy, show_wardrobe: checked }
              })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Allow Messages</Label>
              <p className="text-sm text-muted-foreground">Let other users send you messages</p>
            </div>
            <Switch 
              checked={settings.privacy.allow_messages}
              onCheckedChange={(checked) => setSettings({
                ...settings,
                privacy: { ...settings.privacy, allow_messages: checked }
              })}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Notification Preferences
          </CardTitle>
          <CardDescription>Choose what notifications you want to receive</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Email Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive notifications via email</p>
            </div>
            <Switch 
              checked={settings.notifications.email}
              onCheckedChange={(checked) => setSettings({
                ...settings,
                notifications: { ...settings.notifications, email: checked }
              })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Push Notifications</Label>
              <p className="text-sm text-muted-foreground">Get push notifications on your device</p>
            </div>
            <Switch 
              checked={settings.notifications.push}
              onCheckedChange={(checked) => setSettings({
                ...settings,
                notifications: { ...settings.notifications, push: checked }
              })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Daily Outfit Suggestions</Label>
              <p className="text-sm text-muted-foreground">Get personalized outfit recommendations</p>
            </div>
            <Switch 
              checked={settings.notifications.outfit_suggestions}
              onCheckedChange={(checked) => setSettings({
                ...settings,
                notifications: { ...settings.notifications, outfit_suggestions: checked }
              })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>New Item Alerts</Label>
              <p className="text-sm text-muted-foreground">Notify when new items match your style</p>
            </div>
            <Switch 
              checked={settings.notifications.new_items}
              onCheckedChange={(checked) => setSettings({
                ...settings,
                notifications: { ...settings.notifications, new_items: checked }
              })}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderThemeSettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Appearance
          </CardTitle>
          <CardDescription>Customize how the app looks and feels</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Theme Mode</Label>
            <Select 
              value={settings.theme.mode}
              onValueChange={(value) => setSettings({
                ...settings,
                theme: { ...settings.theme, mode: value }
              })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System Default</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Accent Color</Label>
            <Select 
              value={settings.theme.accent_color}
              onValueChange={(value) => setSettings({
                ...settings,
                theme: { ...settings.theme, accent_color: value }
              })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="purple">Purple</SelectItem>
                <SelectItem value="blue">Blue</SelectItem>
                <SelectItem value="green">Green</SelectItem>
                <SelectItem value="orange">Orange</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Compact Mode</Label>
              <p className="text-sm text-muted-foreground">Use more compact interface</p>
            </div>
            <Switch 
              checked={settings.theme.compact_mode}
              onCheckedChange={(checked) => setSettings({
                ...settings,
                theme: { ...settings.theme, compact_mode: checked }
              })}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderBehaviorSettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            App Behavior
          </CardTitle>
          <CardDescription>Customize how the app behaves</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Auto-save Changes</Label>
              <p className="text-sm text-muted-foreground">Automatically save your changes</p>
            </div>
            <Switch 
              checked={settings.behavior.auto_save}
              onCheckedChange={(checked) => setSettings({
                ...settings,
                behavior: { ...settings.behavior, auto_save: checked }
              })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Show Tips</Label>
              <p className="text-sm text-muted-foreground">Display helpful tips and tutorials</p>
            </div>
            <Switch 
              checked={settings.behavior.show_tips}
              onCheckedChange={(checked) => setSettings({
                ...settings,
                behavior: { ...settings.behavior, show_tips: checked }
              })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Compact Navigation</Label>
              <p className="text-sm text-muted-foreground">Use a more compact navigation bar</p>
            </div>
            <Switch 
              checked={settings.behavior.compact_navigation}
              onCheckedChange={(checked) => setSettings({
                ...settings,
                behavior: { ...settings.behavior, compact_navigation: checked }
              })}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderDataSettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            Data Management
          </CardTitle>
          <CardDescription>Manage your personal data and exports</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Export Format</Label>
            <Select 
              value={settings.data.export_format}
              onValueChange={(value) => setSettings({
                ...settings,
                data: { ...settings.data, export_format: value }
              })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="json">JSON</SelectItem>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="pdf">PDF</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Auto Backup</Label>
              <p className="text-sm text-muted-foreground">Automatically backup your data</p>
            </div>
            <Switch 
              checked={settings.data.auto_backup}
              onCheckedChange={(checked) => setSettings({
                ...settings,
                data: { ...settings.data, auto_backup: checked }
              })}
            />
          </div>
          <div className="flex justify-between pt-4">
            <Button variant="outline">Export Data</Button>
            <Button variant="outline">Delete Account</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderContent = () => {
    switch (settingType) {
      case 'account':
        return renderAccountSettings();
      case 'privacy':
        return renderPrivacySettings();
      case 'notifications':
        return renderNotificationSettings();
      case 'theme':
        return renderThemeSettings();
      case 'behavior':
        return renderBehaviorSettings();
      case 'data':
        return renderDataSettings();
      default:
        return (
          <div className="text-center py-8">
            <Settings className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Settings Coming Soon</h3>
            <p className="text-muted-foreground">This settings page is under development.</p>
          </div>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {renderContent()}
        </div>

        {settingType !== 'default' && (
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Changes
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SettingsDialog;