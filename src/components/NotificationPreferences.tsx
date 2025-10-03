import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Bell, Mail, Smartphone, MessageSquare, ShoppingBag, Heart, Users, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface NotificationCategory {
  id: string;
  name: string;
  description: string;
  icon: any;
  channels: {
    push: boolean;
    email: boolean;
    inApp: boolean;
  };
  frequency: 'instant' | 'daily' | 'weekly' | 'never';
}

export function NotificationPreferences() {
  const [categories, setCategories] = useState<NotificationCategory[]>([
    {
      id: 'social',
      name: 'Social Activity',
      description: 'Likes, comments, follows, and mentions',
      icon: Users,
      channels: { push: true, email: false, inApp: true },
      frequency: 'instant'
    },
    {
      id: 'shopping',
      name: 'Shopping & Deals',
      description: 'Price drops, new items, and recommendations',
      icon: ShoppingBag,
      channels: { push: true, email: true, inApp: true },
      frequency: 'daily'
    },
    {
      id: 'wardrobe',
      name: 'Wardrobe Updates',
      description: 'Outfit suggestions and wardrobe insights',
      icon: Heart,
      channels: { push: true, email: false, inApp: true },
      frequency: 'daily'
    },
    {
      id: 'trends',
      name: 'Fashion Trends',
      description: 'New trends and style recommendations',
      icon: TrendingUp,
      channels: { push: false, email: true, inApp: true },
      frequency: 'weekly'
    },
    {
      id: 'messages',
      name: 'Direct Messages',
      description: 'Chat messages and conversations',
      icon: MessageSquare,
      channels: { push: true, email: true, inApp: true },
      frequency: 'instant'
    },
  ]);

  const [emailDigest, setEmailDigest] = useState({
    enabled: true,
    frequency: 'daily',
    time: '09:00'
  });

  const [quietHours, setQuietHours] = useState({
    enabled: true,
    start: '22:00',
    end: '08:00'
  });

  const { toast } = useToast();

  const handleToggleChannel = (categoryId: string, channel: 'push' | 'email' | 'inApp') => {
    setCategories(categories.map(cat => {
      if (cat.id === categoryId) {
        return {
          ...cat,
          channels: {
            ...cat.channels,
            [channel]: !cat.channels[channel]
          }
        };
      }
      return cat;
    }));
  };

  const handleFrequencyChange = (categoryId: string, frequency: string) => {
    setCategories(categories.map(cat => {
      if (cat.id === categoryId) {
        return { ...cat, frequency: frequency as any };
      }
      return cat;
    }));
  };

  const handleSave = () => {
    toast({
      title: "Preferences saved",
      description: "Your notification settings have been updated",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>
            Control how and when you receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <div key={category.id} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">{category.name}</h4>
                      <p className="text-sm text-muted-foreground">{category.description}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 pl-13">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4 text-muted-foreground" />
                      <Label htmlFor={`${category.id}-push`} className="text-sm">Push Notifications</Label>
                    </div>
                    <Switch
                      id={`${category.id}-push`}
                      checked={category.channels.push}
                      onCheckedChange={() => handleToggleChannel(category.id, 'push')}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <Label htmlFor={`${category.id}-email`} className="text-sm">Email</Label>
                    </div>
                    <Switch
                      id={`${category.id}-email`}
                      checked={category.channels.email}
                      onCheckedChange={() => handleToggleChannel(category.id, 'email')}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4 text-muted-foreground" />
                      <Label htmlFor={`${category.id}-inapp`} className="text-sm">In-App</Label>
                    </div>
                    <Switch
                      id={`${category.id}-inapp`}
                      checked={category.channels.inApp}
                      onCheckedChange={() => handleToggleChannel(category.id, 'inApp')}
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t">
                    <Label className="text-sm">Frequency</Label>
                    <Select
                      value={category.frequency}
                      onValueChange={(value) => handleFrequencyChange(category.id, value)}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="instant">Instant</SelectItem>
                        <SelectItem value="daily">Daily Digest</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="never">Never</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Email Digest</CardTitle>
          <CardDescription>Receive bundled notifications via email</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="email-digest">Enable Email Digest</Label>
              <p className="text-sm text-muted-foreground">Get a summary of your activity</p>
            </div>
            <Switch
              id="email-digest"
              checked={emailDigest.enabled}
              onCheckedChange={(checked) => setEmailDigest({ ...emailDigest, enabled: checked })}
            />
          </div>

          {emailDigest.enabled && (
            <>
              <div className="flex items-center justify-between">
                <Label>Frequency</Label>
                <Select
                  value={emailDigest.frequency}
                  onValueChange={(value) => setEmailDigest({ ...emailDigest, frequency: value })}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Label>Send Time</Label>
                <Select
                  value={emailDigest.time}
                  onValueChange={(value) => setEmailDigest({ ...emailDigest, time: value })}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="06:00">6:00 AM</SelectItem>
                    <SelectItem value="09:00">9:00 AM</SelectItem>
                    <SelectItem value="12:00">12:00 PM</SelectItem>
                    <SelectItem value="18:00">6:00 PM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quiet Hours</CardTitle>
          <CardDescription>Pause notifications during specific hours</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="quiet-hours">Enable Quiet Hours</Label>
              <p className="text-sm text-muted-foreground">No push notifications during this time</p>
            </div>
            <Switch
              id="quiet-hours"
              checked={quietHours.enabled}
              onCheckedChange={(checked) => setQuietHours({ ...quietHours, enabled: checked })}
            />
          </div>

          {quietHours.enabled && (
            <>
              <div className="flex items-center justify-between">
                <Label>Start Time</Label>
                <Select
                  value={quietHours.start}
                  onValueChange={(value) => setQuietHours({ ...quietHours, start: value })}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 24 }, (_, i) => {
                      const hour = i.toString().padStart(2, '0');
                      return (
                        <SelectItem key={hour} value={`${hour}:00`}>
                          {hour}:00
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Label>End Time</Label>
                <Select
                  value={quietHours.end}
                  onValueChange={(value) => setQuietHours({ ...quietHours, end: value })}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 24 }, (_, i) => {
                      const hour = i.toString().padStart(2, '0');
                      return (
                        <SelectItem key={hour} value={`${hour}:00`}>
                          {hour}:00
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="p-3 rounded-lg bg-muted text-sm">
                <p>Quiet hours: {quietHours.start} - {quietHours.end}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} size="lg">
          Save Preferences
        </Button>
      </div>
    </div>
  );
}
