import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSupportSettings } from '@/hooks/useSupportSettings';
import { MessageSquare, Mail, Ticket, Bell, Clock } from 'lucide-react';

export const SupportSettingsPanel = () => {
  const { settings, updateSettings, isUpdating } = useSupportSettings();

  const handleToggle = (key: keyof typeof settings, value: boolean) => {
    updateSettings({ [key]: value });
  };

  const handleSelectChange = (key: keyof typeof settings, value: string) => {
    updateSettings({ [key]: value });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Live Chat Settings
          </CardTitle>
          <CardDescription>Configure your live chat support options</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Live Chat</Label>
              <p className="text-sm text-muted-foreground">
                Allow customers to chat with you in real-time
              </p>
            </div>
            <Switch
              checked={settings.enable_live_chat}
              onCheckedChange={(checked) => handleToggle('enable_live_chat', checked)}
              disabled={isUpdating}
            />
          </div>

          {settings.enable_live_chat && (
            <div className="space-y-2">
              <Label>Chat Availability</Label>
              <Select
                value={settings.chat_availability}
                onValueChange={(value: any) => handleSelectChange('chat_availability', value)}
                disabled={isUpdating}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="always">Always Available</SelectItem>
                  <SelectItem value="business_hours">Business Hours Only</SelectItem>
                  <SelectItem value="offline">Offline</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {settings.chat_availability === 'business_hours' && 
                  'Customers can only chat during business hours'}
                {settings.chat_availability === 'always' && 
                  'Customers can chat anytime (messages are queued)'}
                {settings.chat_availability === 'offline' && 
                  'Chat is disabled for customers'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Email Support
          </CardTitle>
          <CardDescription>Email communication preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Email Support</Label>
              <p className="text-sm text-muted-foreground">
                Accept support requests via email
              </p>
            </div>
            <Switch
              checked={settings.enable_email_support}
              onCheckedChange={(checked) => handleToggle('enable_email_support', checked)}
              disabled={isUpdating}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto-Reply</Label>
              <p className="text-sm text-muted-foreground">
                Send automatic acknowledgment emails
              </p>
            </div>
            <Switch
              checked={settings.auto_reply_enabled}
              onCheckedChange={(checked) => handleToggle('auto_reply_enabled', checked)}
              disabled={isUpdating}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ticket className="w-5 h-5" />
            Ticket System
          </CardTitle>
          <CardDescription>Support ticket management</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Ticket Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when new tickets are created
              </p>
            </div>
            <Switch
              checked={settings.enable_ticket_notifications}
              onCheckedChange={(checked) => handleToggle('enable_ticket_notifications', checked)}
              disabled={isUpdating}
            />
          </div>

          <div className="space-y-2">
            <Label>Preferred Contact Method</Label>
            <Select
              value={settings.preferred_contact_method}
              onValueChange={(value: any) => handleSelectChange('preferred_contact_method', value)}
              disabled={isUpdating}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="chat">Live Chat</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="ticket">Support Ticket</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
