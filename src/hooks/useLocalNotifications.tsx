import { useState, useEffect } from 'react';
import {
  LocalNotifications,
  ScheduleOptions,
  PendingResult,
} from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import { useToast } from '@/hooks/use-toast';

export const useLocalNotifications = () => {
  const { toast } = useToast();
  const [isAvailable, setIsAvailable] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    setIsAvailable(Capacitor.isNativePlatform());
    if (Capacitor.isNativePlatform()) {
      checkPermissions();
    }
  }, []);

  const checkPermissions = async () => {
    try {
      const result = await LocalNotifications.checkPermissions();
      setHasPermission(result.display === 'granted');
      return result.display === 'granted';
    } catch (error) {
      console.error('[Notifications] Permission check failed:', error);
      return false;
    }
  };

  const requestPermissions = async (): Promise<boolean> => {
    try {
      const result = await LocalNotifications.requestPermissions();
      const granted = result.display === 'granted';
      setHasPermission(granted);

      if (!granted) {
        toast({
          title: 'Notifications Disabled',
          description: 'Enable notifications in settings to receive reminders',
          variant: 'destructive',
        });
      }

      return granted;
    } catch (error) {
      console.error('[Notifications] Permission request failed:', error);
      return false;
    }
  };

  const schedule = async (
    title: string,
    body: string,
    scheduledAt: Date,
    id?: number
  ): Promise<boolean> => {
    if (!isAvailable) {
      console.warn('[Notifications] Not available on web platform');
      return false;
    }

    try {
      const permitted = hasPermission || await requestPermissions();
      if (!permitted) return false;

      await LocalNotifications.schedule({
        notifications: [
          {
            id: id || Date.now(),
            title,
            body,
            schedule: {
              at: scheduledAt,
              allowWhileIdle: true,
            },
            sound: undefined,
            attachments: undefined,
            actionTypeId: '',
            extra: null,
          },
        ],
      });

      toast({
        title: 'Reminder Set',
        description: `You'll be notified at ${scheduledAt.toLocaleTimeString()}`,
      });

      return true;
    } catch (error) {
      console.error('[Notifications] Schedule failed:', error);
      toast({
        title: 'Failed to Set Reminder',
        description: 'Could not schedule notification',
        variant: 'destructive',
      });
      return false;
    }
  };

  const scheduleDailyOutfitReminder = async (hour: number = 8, minute: number = 0) => {
    const now = new Date();
    const scheduledTime = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      hour,
      minute
    );

    // If time already passed today, schedule for tomorrow
    if (scheduledTime < now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    return schedule(
      'Daily Outfit Ready! 👗',
      'Your AI-powered outfit suggestion is ready. Check it out!',
      scheduledTime,
      100 // Fixed ID for daily reminder
    );
  };

  const scheduleMarketDealAlert = async (dealName: string, expiresAt: Date) => {
    return schedule(
      'Deal Ending Soon! 🔥',
      `${dealName} expires soon. Don't miss out!`,
      new Date(expiresAt.getTime() - 3600000) // 1 hour before
    );
  };

  const getPending = async (): Promise<PendingResult> => {
    try {
      return await LocalNotifications.getPending();
    } catch (error) {
      console.error('[Notifications] Get pending failed:', error);
      return { notifications: [] };
    }
  };

  const cancel = async (id: number): Promise<void> => {
    try {
      await LocalNotifications.cancel({ notifications: [{ id }] });
    } catch (error) {
      console.error('[Notifications] Cancel failed:', error);
    }
  };

  const cancelAll = async (): Promise<void> => {
    try {
      const pending = await getPending();
      if (pending.notifications.length > 0) {
        await LocalNotifications.cancel({ notifications: pending.notifications });
        toast({
          title: 'All Reminders Cleared',
          description: 'Your notification reminders have been cancelled',
        });
      }
    } catch (error) {
      console.error('[Notifications] Cancel all failed:', error);
    }
  };

  return {
    schedule,
    scheduleDailyOutfitReminder,
    scheduleMarketDealAlert,
    getPending,
    cancel,
    cancelAll,
    requestPermissions,
    hasPermission,
    isAvailable,
  };
};
