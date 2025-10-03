import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Bell, Trash2 } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";

const NotificationSettings = () => {
  const { notifications, unreadCount, clearAll, markAllAsRead } = useNotifications();

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
            <Switch id="outfit-notifications" defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="social-notifications">Social Activity</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when someone follows you or interacts with your posts
              </p>
            </div>
            <Switch id="social-notifications" defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="market-notifications">Market Updates</Label>
              <p className="text-sm text-muted-foreground">
                Notifications about new items and deals in the marketplace
              </p>
            </div>
            <Switch id="market-notifications" defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="laundry-notifications">Laundry Reminders</Label>
              <p className="text-sm text-muted-foreground">
                Get reminded when it's time to do laundry
              </p>
            </div>
            <Switch id="laundry-notifications" defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="system-notifications">System Updates</Label>
              <p className="text-sm text-muted-foreground">
                Important updates about MyDresser features and changes
              </p>
            </div>
            <Switch id="system-notifications" defaultChecked />
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
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={markAllAsRead}
                >
                  Mark All Read
                </Button>
              )}
              {notifications.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAll}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear All
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationSettings;
