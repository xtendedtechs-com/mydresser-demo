import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNotifications } from '@/hooks/useNotifications';
import { Bell, Mail, Smartphone } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export const NotificationSettings = () => {
  const { preferences, updatePreferences, loading } = useNotifications();

  const handleToggle = (key: keyof typeof preferences) => {
    updatePreferences({ [key]: !preferences[key] });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="animate-pulse">
            <div className="h-24 bg-muted rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Notification Preferences</h3>
        <p className="text-sm text-muted-foreground">
          Manage how you receive notifications from MyDresser
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Delivery Methods
          </CardTitle>
          <CardDescription>
            Choose how you want to receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="push_enabled" className="flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                Push Notifications
              </Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications on your device
              </p>
            </div>
            <Switch
              id="push_enabled"
              checked={preferences.push_enabled}
              onCheckedChange={() => handleToggle('push_enabled')}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email_enabled" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Notifications
              </Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications via email
              </p>
            </div>
            <Switch
              id="email_enabled"
              checked={preferences.email_enabled}
              onCheckedChange={() => handleToggle('email_enabled')}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notification Types</CardTitle>
          <CardDescription>
            Choose which types of notifications you want to receive
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="social_notifications">👥 Social Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Likes, follows, comments, and mentions
              </p>
            </div>
            <Switch
              id="social_notifications"
              checked={preferences.social_notifications}
              onCheckedChange={() => handleToggle('social_notifications')}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="weather_alerts">🌤️ Weather Alerts</Label>
              <p className="text-sm text-muted-foreground">
                Important weather changes and outfit suggestions
              </p>
            </div>
            <Switch
              id="weather_alerts"
              checked={preferences.weather_alerts}
              onCheckedChange={() => handleToggle('weather_alerts')}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="marketplace_updates">🛍️ Marketplace Updates</Label>
              <p className="text-sm text-muted-foreground">
                Order updates, new messages, and seller notifications
              </p>
            </div>
            <Switch
              id="marketplace_updates"
              checked={preferences.marketplace_updates}
              onCheckedChange={() => handleToggle('marketplace_updates')}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="outfit_suggestions">👔 Outfit Suggestions</Label>
              <p className="text-sm text-muted-foreground">
                Daily outfit recommendations and style tips
              </p>
            </div>
            <Switch
              id="outfit_suggestions"
              checked={preferences.outfit_suggestions}
              onCheckedChange={() => handleToggle('outfit_suggestions')}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="achievement_notifications">🏆 Achievement Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Style challenges, badges, and rewards
              </p>
            </div>
            <Switch
              id="achievement_notifications"
              checked={preferences.achievement_notifications}
              onCheckedChange={() => handleToggle('achievement_notifications')}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
