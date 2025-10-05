import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { LocalNotifications } from '@capacitor/local-notifications';

export interface Notification {
  id: string;
  user_id: string;
  type: 'social' | 'weather' | 'marketplace' | 'system' | 'outfit' | 'achievement';
  title: string;
  message: string;
  data?: any;
  read: boolean;
  action_url?: string;
  created_at: string;
}

export interface NotificationPreferences {
  push_enabled: boolean;
  email_enabled: boolean;
  social_notifications: boolean;
  weather_alerts: boolean;
  marketplace_updates: boolean;
  outfit_suggestions: boolean;
  achievement_notifications: boolean;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    push_enabled: true,
    email_enabled: true,
    social_notifications: true,
    weather_alerts: true,
    marketplace_updates: true,
    outfit_suggestions: true,
    achievement_notifications: true,
  });
  const { toast } = useToast();

  // Request push notification permissions
  const requestPermissions = async () => {
    try {
      const result = await LocalNotifications.requestPermissions();
      return result.display === 'granted';
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  };

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      setNotifications((data || []) as unknown as Notification[]);
      setUnreadCount(data?.filter(n => !n.read).length || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch notification preferences
  const fetchPreferences = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setPreferences({
          push_enabled: data.push_enabled,
          email_enabled: data.email_enabled,
          social_notifications: data.social_notifications,
          weather_alerts: data.weather_alerts,
          marketplace_updates: data.marketplace_updates,
          outfit_suggestions: data.outfit_suggestions,
          achievement_notifications: data.achievement_notifications,
        });
      }
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
    }
  };

  // Create notification
  const createNotification = async (
    type: Notification['type'],
    title: string,
    message: string,
    data?: any,
    actionUrl?: string
  ): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: user.id,
          type,
          title,
          message,
          data,
          action_url: actionUrl,
          read: false,
        });

      if (error) throw error;

      // Show local push notification if enabled
      if (preferences.push_enabled) {
        await LocalNotifications.schedule({
          notifications: [
            {
              title,
              body: message,
              id: Date.now(),
              schedule: { at: new Date(Date.now() + 1000) },
            },
          ],
        });
      }

      // Show toast
      toast({
        title,
        description: message,
      });

      await fetchNotifications();
      return true;
    } catch (error) {
      console.error('Error creating notification:', error);
      return false;
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(n => (n.id === notificationId ? { ...n, read: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);

      if (error) throw error;

      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);

      toast({
        title: 'All notifications marked as read',
      });
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      setUnreadCount(prev => {
        const notification = notifications.find(n => n.id === notificationId);
        return notification && !notification.read ? prev - 1 : prev;
      });
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // Update preferences
  const updatePreferences = async (newPreferences: Partial<NotificationPreferences>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const updated = { ...preferences, ...newPreferences };

      const { error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: user.id,
          ...updated,
        });

      if (error) throw error;

      setPreferences(updated);

      toast({
        title: 'Preferences updated',
        description: 'Your notification preferences have been saved.',
      });

      return true;
    } catch (error) {
      console.error('Error updating preferences:', error);
      toast({
        title: 'Error',
        description: 'Failed to update notification preferences.',
        variant: 'destructive',
      });
      return false;
    }
  };

  useEffect(() => {
    fetchNotifications();
    fetchPreferences();
    requestPermissions();

    // Subscribe to real-time notifications
    const initSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const channel = supabase
        .channel('notifications')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            const newNotification = payload.new as unknown as Notification;
            setNotifications(prev => [newNotification, ...prev]);
            setUnreadCount(prev => prev + 1);

            // Show local notification
            if (preferences.push_enabled) {
              LocalNotifications.schedule({
                notifications: [
                  {
                    title: newNotification.title,
                    body: newNotification.message,
                    id: Date.now(),
                    schedule: { at: new Date(Date.now() + 1000) },
                  },
                ],
              });
            }
          }
        )
        .subscribe();

      return channel;
    };

    let channel: any;
    initSubscription().then(ch => {
      channel = ch;
    });

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  return {
    notifications,
    unreadCount,
    loading,
    preferences,
    createNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    updatePreferences,
    refresh: fetchNotifications,
  };
};
