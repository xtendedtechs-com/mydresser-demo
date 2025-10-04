import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, Smartphone, Download, Wifi, Bell, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PWASettingsPanel } from "@/components/settings/PWASettingsPanel";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const AppSettings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [offlineMode, setOfflineMode] = useState(false);
  const [autoUpdate, setAutoUpdate] = useState(true);
  const [animations, setAnimations] = useState(true);
  const [hapticFeedback, setHapticFeedback] = useState(true);

  const handleSave = () => {
    toast({
      title: "App settings saved",
      description: "Your preferences have been updated successfully.",
    });
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/account')}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">App Settings</h1>
              <p className="text-muted-foreground">Configure app behavior and preferences</p>
            </div>
          </div>

          {/* PWA Settings */}
          <PWASettingsPanel />

          {/* App Behavior */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="w-5 h-5" />
                App Behavior
              </CardTitle>
              <CardDescription>
                Customize how the app works
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="offline">Offline Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Cache data for offline access
                  </p>
                </div>
                <Switch
                  id="offline"
                  checked={offlineMode}
                  onCheckedChange={setOfflineMode}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-update">Auto-Update</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically update the app when new versions are available
                  </p>
                </div>
                <Switch
                  id="auto-update"
                  checked={autoUpdate}
                  onCheckedChange={setAutoUpdate}
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
                  checked={animations}
                  onCheckedChange={setAnimations}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="haptic">Haptic Feedback</Label>
                  <p className="text-sm text-muted-foreground">
                    Vibrate on touch interactions (mobile only)
                  </p>
                </div>
                <Switch
                  id="haptic"
                  checked={hapticFeedback}
                  onCheckedChange={setHapticFeedback}
                />
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Manage related app settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => navigate('/settings/notifications')}
              >
                <Bell className="w-4 h-4 mr-2" />
                Notification Settings
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => navigate('/settings/theme')}
              >
                <Eye className="w-4 h-4 mr-2" />
                Theme & Appearance
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => navigate('/settings/accessibility')}
              >
                <Eye className="w-4 h-4 mr-2" />
                Accessibility
              </Button>
            </CardContent>
          </Card>

          <Button onClick={handleSave} className="w-full">
            Save All Changes
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AppSettings;
