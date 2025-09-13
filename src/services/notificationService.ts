interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'reminder';
  category: 'outfit' | 'laundry' | 'social' | 'market' | 'system';
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
  data?: any;
}

interface NotificationPreferences {
  outfitReminders: boolean;
  laundryAlerts: boolean;
  socialUpdates: boolean;
  marketDeals: boolean;
  systemUpdates: boolean;
  pushEnabled: boolean;
  emailEnabled: boolean;
  quietHours: {
    enabled: boolean;
    start: string; // HH:MM format
    end: string;   // HH:MM format
  };
}

class NotificationService {
  private notifications: AppNotification[] = [];
  private preferences: NotificationPreferences = {
    outfitReminders: true,
    laundryAlerts: true,
    socialUpdates: true,
    marketDeals: false,
    systemUpdates: true,
    pushEnabled: false,
    emailEnabled: false,
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00'
    }
  };
  private listeners: ((notifications: AppNotification[]) => void)[] = [];

  constructor() {
    this.loadNotifications();
    this.loadPreferences();
    this.setupPeriodicChecks();
  }

  // Notification Management
  addNotification(notification: Omit<AppNotification, 'id' | 'timestamp' | 'read'>): string {
    const id = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newNotification: AppNotification = {
      ...notification,
      id,
      timestamp: new Date(),
      read: false
    };

    this.notifications.unshift(newNotification);
    this.saveNotifications();
    this.notifyListeners();

    // Show browser notification if enabled and permission granted
    if (this.preferences.pushEnabled && 'Notification' in window && Notification.permission === 'granted') {
      this.showBrowserNotification(newNotification);
    }

    return id;
  }

  getNotifications(): AppNotification[] {
    return [...this.notifications];
  }

  getUnreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  markAsRead(id: string): void {
    const notification = this.notifications.find(n => n.id === id);
    if (notification) {
      notification.read = true;
      this.saveNotifications();
      this.notifyListeners();
    }
  }

  markAllAsRead(): void {
    this.notifications.forEach(n => n.read = true);
    this.saveNotifications();
    this.notifyListeners();
  }

  deleteNotification(id: string): void {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.saveNotifications();
    this.notifyListeners();
  }

  clearAllNotifications(): void {
    this.notifications = [];
    this.saveNotifications();
    this.notifyListeners();
  }

  // Specific Notification Types
  sendOutfitReminder(): void {
    if (!this.preferences.outfitReminders) return;

    this.addNotification({
      title: 'Plan Your Outfit',
      message: "Don't forget to check tomorrow's weather and plan your perfect outfit!",
      type: 'reminder',
      category: 'outfit',
      actionUrl: '/',
      actionLabel: 'View Daily Outfit'
    });
  }

  sendLaundryAlert(batchName: string, status: string): void {
    if (!this.preferences.laundryAlerts) return;

    const messages = {
      washing: `Your laundry batch "${batchName}" has finished washing!`,
      drying: `Your laundry batch "${batchName}" has finished drying!`,
      ready: `Your laundry batch "${batchName}" is clean and ready!`
    };

    this.addNotification({
      title: 'Laundry Update',
      message: messages[status as keyof typeof messages] || `Laundry batch "${batchName}" status updated.`,
      type: 'info',
      category: 'laundry',
      actionUrl: '/wardrobe',
      actionLabel: 'View Laundry'
    });
  }

  sendSocialUpdate(type: 'like' | 'comment' | 'follow', from: string, item?: string): void {
    if (!this.preferences.socialUpdates) return;

    const messages = {
      like: `${from} liked ${item ? `your ${item}` : 'your outfit'}`,
      comment: `${from} commented on ${item ? `your ${item}` : 'your post'}`,
      follow: `${from} started following you`
    };

    this.addNotification({
      title: 'Social Update',
      message: messages[type],
      type: 'info',
      category: 'social',
      actionUrl: '/account',
      actionLabel: 'View Profile'
    });
  }

  sendMarketAlert(type: 'price_drop' | 'new_arrival' | 'sale', details: any): void {
    if (!this.preferences.marketDeals) return;

    const messages = {
      price_drop: `Price dropped on "${details.itemName}" - now ${details.newPrice}!`,
      new_arrival: `New arrival: "${details.itemName}" from ${details.brand}`,
      sale: `Sale alert: ${details.discount}% off ${details.category} items!`
    };

    this.addNotification({
      title: 'Market Alert',
      message: messages[type],
      type: 'info',
      category: 'market',
      actionUrl: '/market',
      actionLabel: 'View Deal',
      data: details
    });
  }

  sendSystemUpdate(message: string): void {
    if (!this.preferences.systemUpdates) return;

    this.addNotification({
      title: 'MyDresser Update',
      message,
      type: 'info',
      category: 'system'
    });
  }

  // Preferences Management
  getPreferences(): NotificationPreferences {
    return { ...this.preferences };
  }

  updatePreferences(newPreferences: Partial<NotificationPreferences>): void {
    this.preferences = { ...this.preferences, ...newPreferences };
    this.savePreferences();

    // Request permission for push notifications if enabled
    if (newPreferences.pushEnabled && 'Notification' in window) {
      this.requestNotificationPermission();
    }
  }

  // Permission Management
  async requestNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  }

  // Event Listeners
  onNotificationsChanged(callback: (notifications: AppNotification[]) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  // Private Methods
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.notifications));
  }

  private showBrowserNotification(notification: AppNotification): void {
    if (this.isQuietHours()) return;

    const browserNotification = new Notification(notification.title, {
      body: notification.message,
      icon: '/favicon.ico',
      tag: notification.id
    });

    browserNotification.onclick = () => {
      if (notification.actionUrl) {
        window.focus();
        // Navigate to the URL (would need router integration)
      }
      browserNotification.close();
    };
  }

  private isQuietHours(): boolean {
    if (!this.preferences.quietHours.enabled) return false;

    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    const { start, end } = this.preferences.quietHours;
    
    if (start <= end) {
      return currentTime >= start && currentTime <= end;
    } else {
      // Spans midnight
      return currentTime >= start || currentTime <= end;
    }
  }

  private setupPeriodicChecks(): void {
    // Check for outfit reminders every hour
    setInterval(() => {
      const now = new Date();
      if (now.getHours() === 20) { // 8 PM reminder for tomorrow
        this.sendOutfitReminder();
      }
    }, 60 * 60 * 1000);

    // Mock market alerts
    setInterval(() => {
      if (Math.random() < 0.1) { // 10% chance every 5 minutes
        this.sendMarketAlert('price_drop', {
          itemName: 'Classic Denim Jacket',
          newPrice: '$89',
          originalPrice: '$120'
        });
      }
    }, 5 * 60 * 1000);
  }

  private loadNotifications(): void {
    try {
      const saved = localStorage.getItem('mydresser_notifications');
      if (saved) {
        const parsed = JSON.parse(saved);
        this.notifications = parsed.map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp)
        }));
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  }

  private saveNotifications(): void {
    try {
      localStorage.setItem('mydresser_notifications', JSON.stringify(this.notifications));
    } catch (error) {
      console.error('Error saving notifications:', error);
    }
  }

  private loadPreferences(): void {
    try {
      const saved = localStorage.getItem('mydresser_notification_preferences');
      if (saved) {
        this.preferences = { ...this.preferences, ...JSON.parse(saved) };
      }
    } catch (error) {
      console.error('Error loading notification preferences:', error);
    }
  }

  private savePreferences(): void {
    try {
      localStorage.setItem('mydresser_notification_preferences', JSON.stringify(this.preferences));
    } catch (error) {
      console.error('Error saving notification preferences:', error);
    }
  }
}

export const notificationService = new NotificationService();
export type { AppNotification, NotificationPreferences };