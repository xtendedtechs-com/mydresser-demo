import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { useToast } from "@/hooks/use-toast";
import EnhancedThemeSelector from "@/components/EnhancedThemeSelector";
import AccessibilitySettings from "@/components/AccessibilitySettings";
import { Palette, Accessibility, Globe, Monitor, Volume2, Smartphone } from "lucide-react";

const AppSettings = () => {
  const { preferences, updatePreferences, loading } = useUserPreferences();
  const { toast } = useToast();

  const handleToggle = async (setting: string, value: boolean) => {
    try {
      await updatePreferences({ [setting]: value });
      toast({
        title: "Setting updated",
        description: "Your app preferences have been saved."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update setting.",
        variant: "destructive"
      });
    }
  };

  const handleSelectChange = async (setting: string, value: string) => {
    try {
      await updatePreferences({ [setting]: value });
      toast({
        title: "Setting updated",
        description: "Your preference has been saved."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update setting.",
        variant: "destructive"
      });
    }
  };

  const appSettings = preferences || {
    language: 'en',
    currency: 'USD',
    compact_mode: false,
    animations: true,
    grid_size: 3,
    push_notifications: true,
    offline_mode: false
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Theme & Appearance
          </CardTitle>
          <CardDescription>
            Customize the look and feel of your MyDresser experience
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EnhancedThemeSelector />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Language & Region
          </CardTitle>
          <CardDescription>
            Set your preferred language and regional settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="language">Language</Label>
            <Select 
              value={appSettings.language || "en"}
              onValueChange={(value) => handleSelectChange("language", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Spanish</SelectItem>
                <SelectItem value="fr">French</SelectItem>
                <SelectItem value="de">German</SelectItem>
                <SelectItem value="it">Italian</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <Select 
              value={appSettings.currency || "USD"}
              onValueChange={(value) => handleSelectChange("currency", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD ($)</SelectItem>
                <SelectItem value="EUR">EUR (€)</SelectItem>
                <SelectItem value="GBP">GBP (£)</SelectItem>
                <SelectItem value="JPY">JPY (¥)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="w-5 h-5" />
            Display Settings
          </CardTitle>
          <CardDescription>
            Adjust display preferences and layout options
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="compact-mode">Compact Mode</Label>
              <p className="text-sm text-muted-foreground">
                Show more content in less space
              </p>
            </div>
            <Switch
              id="compact-mode"
              checked={appSettings.compact_mode === true}
              onCheckedChange={(checked) => handleToggle("compact_mode", checked)}
              disabled={loading}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="animations">Animations</Label>
              <p className="text-sm text-muted-foreground">
                Enable smooth transitions and animations
              </p>
            </div>
            <Switch
              id="animations"
              checked={appSettings.animations !== false}
              onCheckedChange={(checked) => handleToggle("animations", checked)}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="grid-size">Grid Size</Label>
            <div className="px-3">
              <Slider
                value={[appSettings.grid_size || 3]}
                onValueChange={([value]) => handleSelectChange("grid_size", value.toString())}
                max={6}
                min={2}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Small (2)</span>
                <span>Large (6)</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Accessibility className="w-5 h-5" />
            Accessibility
          </CardTitle>
          <CardDescription>
            Configure accessibility features for better usability
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AccessibilitySettings />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            Mobile Settings
          </CardTitle>
          <CardDescription>
            Configure mobile-specific preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="push-notifications">Push Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Allow push notifications on mobile devices
              </p>
            </div>
            <Switch
              id="push-notifications"
              checked={appSettings.push_notifications !== false}
              onCheckedChange={(checked) => handleToggle("push_notifications", checked)}
              disabled={loading}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="offline-mode">Offline Mode</Label>
              <p className="text-sm text-muted-foreground">
                Cache data for offline access
              </p>
            </div>
            <Switch
              id="offline-mode"
              checked={appSettings.offline_mode === true}
              onCheckedChange={(checked) => handleToggle("offline_mode", checked)}
              disabled={loading}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AppSettings;