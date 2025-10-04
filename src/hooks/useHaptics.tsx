import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';

export const useHaptics = () => {
  const isAvailable = Capacitor.isNativePlatform();

  const impact = async (style: 'light' | 'medium' | 'heavy' = 'medium') => {
    if (!isAvailable) return;

    try {
      const styles = {
        light: ImpactStyle.Light,
        medium: ImpactStyle.Medium,
        heavy: ImpactStyle.Heavy,
      };

      await Haptics.impact({ style: styles[style] });
    } catch (error) {
      console.error('[Haptics] Impact failed:', error);
    }
  };

  const notification = async (type: 'success' | 'warning' | 'error') => {
    if (!isAvailable) return;

    try {
      const types = {
        success: NotificationType.Success,
        warning: NotificationType.Warning,
        error: NotificationType.Error,
      };

      await Haptics.notification({ type: types[type] });
    } catch (error) {
      console.error('[Haptics] Notification failed:', error);
    }
  };

  const vibrate = async (duration: number = 300) => {
    if (!isAvailable) return;

    try {
      await Haptics.vibrate({ duration });
    } catch (error) {
      console.error('[Haptics] Vibrate failed:', error);
    }
  };

  const selectionStart = async () => {
    if (!isAvailable) return;

    try {
      await Haptics.selectionStart();
    } catch (error) {
      console.error('[Haptics] Selection start failed:', error);
    }
  };

  const selectionChanged = async () => {
    if (!isAvailable) return;

    try {
      await Haptics.selectionChanged();
    } catch (error) {
      console.error('[Haptics] Selection changed failed:', error);
    }
  };

  const selectionEnd = async () => {
    if (!isAvailable) return;

    try {
      await Haptics.selectionEnd();
    } catch (error) {
      console.error('[Haptics] Selection end failed:', error);
    }
  };

  return {
    impact,
    notification,
    vibrate,
    selectionStart,
    selectionChanged,
    selectionEnd,
    isAvailable,
  };
};
