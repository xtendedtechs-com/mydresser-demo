import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Bell, Trash2 } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";

const NotificationSettings = () => {
  const { notifications, unreadCount, markAllAsRead, preferences, updatePreferences, loading } = useNotifications();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-64 bg-muted rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Preferences
          </CardTitle>
          <CardDescription>
            Manage how you receive notifications from MyDresser
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="outfit-notifications">Daily Outfit Suggestions</Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications for your daily outfit recommendations
              </p>
            </div>
            <Switch 
              id="outfit-notifications" 
              checked={preferences.outfit_suggestions}
              onCheckedChange={(checked) => updatePreferences({ outfit_suggestions: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="social-notifications">Social Activity</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when someone follows you or interacts with your posts
              </p>
            </div>
            <Switch 
              id="social-notifications" 
              checked={preferences.social_notifications}
              onCheckedChange={(checked) => updatePreferences({ social_notifications: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="market-notifications">Market Updates</Label>
              <p className="text-sm text-muted-foreground">
                Notifications about new items and deals in the marketplace
              </p>
            </div>
            <Switch 
              id="market-notifications" 
              checked={preferences.marketplace_updates}
              onCheckedChange={(checked) => updatePreferences({ marketplace_updates: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="weather-notifications">Weather Alerts</Label>
              <p className="text-sm text-muted-foreground">
                Get notified about important weather changes
              </p>
            </div>
            <Switch 
              id="weather-notifications" 
              checked={preferences.weather_alerts}
              onCheckedChange={(checked) => updatePreferences({ weather_alerts: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="achievement-notifications">Achievements</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when you unlock achievements and badges
              </p>
            </div>
            <Switch 
              id="achievement-notifications" 
              checked={preferences.achievement_notifications}
              onCheckedChange={(checked) => updatePreferences({ achievement_notifications: checked })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notification Management</CardTitle>
          <CardDescription>
            Manage your existing notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Total Notifications</p>
              <p className="text-sm text-muted-foreground">
                {notifications.length} notifications ({unreadCount} unread)
              </p>
            </div>
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={markAllAsRead}
              >
                Mark All Read
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationSettings;
