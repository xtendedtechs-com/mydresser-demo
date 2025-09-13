import { useState, useEffect } from 'react';
import { Bell, X, Check, Settings, Trash2, Heart, ShoppingBag, Calendar, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { notificationService, AppNotification, NotificationPreferences } from '@/services/notificationService';
import { useToast } from '@/hooks/use-toast';

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Load initial data
    setNotifications(notificationService.getNotifications());
    setPreferences(notificationService.getPreferences());
    setUnreadCount(notificationService.getUnreadCount());

    // Subscribe to changes
    const unsubscribe = notificationService.onNotificationsChanged((newNotifications) => {
      setNotifications(newNotifications);
      setUnreadCount(notificationService.getUnreadCount());
    });

    return unsubscribe;
  }, []);

  const handleMarkAsRead = (id: string) => {
    notificationService.markAsRead(id);
  };

  const handleMarkAllAsRead = () => {
    notificationService.markAllAsRead();
    toast({
      title: "All notifications marked as read",
      duration: 2000,
    });
  };

  const handleDeleteNotification = (id: string) => {
    notificationService.deleteNotification(id);
    toast({
      title: "Notification deleted",
      duration: 2000,
    });
  };

  const handleClearAll = () => {
    notificationService.clearAllNotifications();
    toast({
      title: "All notifications cleared",
      duration: 2000,
    });
  };

  const handlePreferenceChange = (key: keyof NotificationPreferences, value: any) => {
    if (!preferences) return;
    
    const updatedPreferences = { ...preferences, [key]: value };
    setPreferences(updatedPreferences);
    notificationService.updatePreferences(updatedPreferences);
    
    toast({
      title: "Preferences updated",
      duration: 2000,
    });
  };

  const getNotificationIcon = (category: string, type: string) => {
    switch (category) {
      case 'outfit':
        return <Calendar className="w-4 h-4" />;
      case 'laundry':
        return <AlertCircle className="w-4 h-4" />;
      case 'social':
        return <Heart className="w-4 h-4" />;
      case 'market':
        return <ShoppingBag className="w-4 h-4" />;
      case 'system':
        return <Settings className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'error':
        return 'text-red-500';
      case 'warning':
        return 'text-yellow-500';
      case 'success':
        return 'text-green-500';
      case 'info':
        return 'text-blue-500';
      case 'reminder':
        return 'text-purple-500';
      default:
        return 'text-muted-foreground';
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const filteredNotifications = (category?: string) => {
    if (!category) return notifications;
    return notifications.filter(n => n.category === category);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Notifications</SheetTitle>
          <SheetDescription>
            Stay updated with your MyDresser activity
          </SheetDescription>
        </SheetHeader>

        <Tabs defaultValue="all" className="w-full mt-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="unread">Unread ({unreadCount})</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium">All Notifications</h3>
              <div className="flex gap-2">
                {unreadCount > 0 && (
                  <Button size="sm" variant="outline" onClick={handleMarkAllAsRead}>
                    <Check className="w-4 h-4 mr-1" />
                    Mark All Read
                  </Button>
                )}
                <Button size="sm" variant="outline" onClick={handleClearAll}>
                  <Trash2 className="w-4 h-4 mr-1" />
                  Clear All
                </Button>
              </div>
            </div>
            
            <ScrollArea className="h-[500px]">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-center">
                  <Bell className="w-8 h-8 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No notifications yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {notifications.map((notification) => (
                    <Card key={notification.id} className={`transition-all ${notification.read ? 'opacity-60' : ''}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className={`mt-1 ${getNotificationColor(notification.type)}`}>
                            {getNotificationIcon(notification.category, notification.type)}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-medium truncate">{notification.title}</h4>
                              <div className="flex items-center gap-1 ml-2">
                                <span className="text-xs text-muted-foreground">
                                  {formatTimestamp(notification.timestamp)}
                                </span>
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  className="h-6 w-6 p-0"
                                  onClick={() => handleDeleteNotification(notification.id)}
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                            
                            <p className="text-sm text-muted-foreground mt-1">
                              {notification.message}
                            </p>
                            
                            <div className="flex items-center justify-between mt-2">
                              <Badge variant="secondary" className="text-xs">
                                {notification.category}
                              </Badge>
                              
                              <div className="flex gap-1">
                                {!notification.read && (
                                  <Button 
                                    size="sm" 
                                    variant="ghost"
                                    className="h-7 px-2 text-xs"
                                    onClick={() => handleMarkAsRead(notification.id)}
                                  >
                                    Mark Read
                                  </Button>
                                )}
                                {notification.actionUrl && (
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    className="h-7 px-2 text-xs"
                                  >
                                    {notification.actionLabel || 'View'}
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="unread" className="mt-4">
            <ScrollArea className="h-[500px]">
              {filteredNotifications().filter(n => !n.read).length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-center">
                  <Check className="w-8 h-8 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No unread notifications</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredNotifications().filter(n => !n.read).map((notification) => (
                    <Card key={notification.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className={`mt-1 ${getNotificationColor(notification.type)}`}>
                            {getNotificationIcon(notification.category, notification.type)}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-medium truncate">{notification.title}</h4>
                              <span className="text-xs text-muted-foreground">
                                {formatTimestamp(notification.timestamp)}
                              </span>
                            </div>
                            
                            <p className="text-sm text-muted-foreground mt-1">
                              {notification.message}
                            </p>
                            
                            <div className="flex items-center justify-between mt-2">
                              <Badge variant="secondary" className="text-xs">
                                {notification.category}
                              </Badge>
                              
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="h-7 px-2 text-xs"
                                onClick={() => handleMarkAsRead(notification.id)}
                              >
                                Mark Read
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="settings" className="mt-4">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Notification Preferences</h3>
                
                {preferences && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="outfit-reminders">Outfit Reminders</Label>
                      <Switch
                        id="outfit-reminders"
                        checked={preferences.outfitReminders}
                        onCheckedChange={(checked) => handlePreferenceChange('outfitReminders', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="laundry-alerts">Laundry Alerts</Label>
                      <Switch
                        id="laundry-alerts"
                        checked={preferences.laundryAlerts}
                        onCheckedChange={(checked) => handlePreferenceChange('laundryAlerts', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="social-updates">Social Updates</Label>
                      <Switch
                        id="social-updates"
                        checked={preferences.socialUpdates}
                        onCheckedChange={(checked) => handlePreferenceChange('socialUpdates', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="market-deals">Market Deals</Label>
                      <Switch
                        id="market-deals"
                        checked={preferences.marketDeals}
                        onCheckedChange={(checked) => handlePreferenceChange('marketDeals', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="system-updates">System Updates</Label>
                      <Switch
                        id="system-updates"
                        checked={preferences.systemUpdates}
                        onCheckedChange={(checked) => handlePreferenceChange('systemUpdates', checked)}
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <Label htmlFor="push-notifications">Push Notifications</Label>
                      <Switch
                        id="push-notifications"
                        checked={preferences.pushEnabled}
                        onCheckedChange={(checked) => handlePreferenceChange('pushEnabled', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="email-notifications">Email Notifications</Label>
                      <Switch
                        id="email-notifications"
                        checked={preferences.emailEnabled}
                        onCheckedChange={(checked) => handlePreferenceChange('emailEnabled', checked)}
                      />
                    </div>

                    <Separator />

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label htmlFor="quiet-hours">Quiet Hours</Label>
                        <Switch
                          id="quiet-hours"
                          checked={preferences.quietHours.enabled}
                          onCheckedChange={(checked) => 
                            handlePreferenceChange('quietHours', { ...preferences.quietHours, enabled: checked })
                          }
                        />
                      </div>
                      
                      {preferences.quietHours.enabled && (
                        <div className="flex gap-2 mt-2">
                          <div className="flex-1">
                            <Label htmlFor="quiet-start" className="text-xs">From</Label>
                            <Input
                              id="quiet-start"
                              type="time"
                              value={preferences.quietHours.start}
                              onChange={(e) =>
                                handlePreferenceChange('quietHours', {
                                  ...preferences.quietHours,
                                  start: e.target.value
                                })
                              }
                            />
                          </div>
                          <div className="flex-1">
                            <Label htmlFor="quiet-end" className="text-xs">To</Label>
                            <Input
                              id="quiet-end"
                              type="time"
                              value={preferences.quietHours.end}
                              onChange={(e) =>
                                handlePreferenceChange('quietHours', {
                                  ...preferences.quietHours,
                                  end: e.target.value
                                })
                              }
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
};

export default NotificationCenter;