import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bell, ShoppingCart, Package, AlertTriangle, DollarSign, MessageSquare, Check, X } from 'lucide-react';
import { useOrders } from '@/hooks/useOrders';
import { useMerchantItems } from '@/hooks/useMerchantItems';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface Notification {
  id: string;
  type: 'order' | 'inventory' | 'payment' | 'message' | 'alert';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
  actionUrl?: string;
}

export const NotificationCenter = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { orders } = useOrders();
  const { items } = useMerchantItems();
  const { toast } = useToast();

  useEffect(() => {
    // Generate notifications based on orders and items
    const generated: Notification[] = [];

    // New orders
    orders
      .filter(o => o.status === 'pending')
      .slice(0, 5)
      .forEach(order => {
        generated.push({
          id: `order-${order.id}`,
          type: 'order',
          title: 'New Order Received',
          message: `Order from ${order.customer_name} - $${order.total_amount.toFixed(2)}`,
          timestamp: order.created_at,
          read: false,
          priority: 'high'
        });
      });

    // Low stock alerts
    items
      .filter(i => (i.stock_quantity || 0) < 10 && (i.stock_quantity || 0) > 0)
      .slice(0, 3)
      .forEach(item => {
        generated.push({
          id: `stock-${item.id}`,
          type: 'inventory',
          title: 'Low Stock Alert',
          message: `${item.name} has only ${item.stock_quantity} units left`,
          timestamp: new Date().toISOString(),
          read: false,
          priority: 'medium'
        });
      });

    // Out of stock alerts
    items
      .filter(i => (i.stock_quantity || 0) === 0)
      .slice(0, 2)
      .forEach(item => {
        generated.push({
          id: `outofstock-${item.id}`,
          type: 'alert',
          title: 'Out of Stock',
          message: `${item.name} is completely out of stock`,
          timestamp: new Date().toISOString(),
          read: false,
          priority: 'high'
        });
      });

    // Payment received
    orders
      .filter(o => o.payment_status === 'paid')
      .slice(0, 3)
      .forEach(order => {
        generated.push({
          id: `payment-${order.id}`,
          type: 'payment',
          title: 'Payment Received',
          message: `$${order.total_amount.toFixed(2)} from ${order.customer_name}`,
          timestamp: order.updated_at,
          read: false,
          priority: 'low'
        });
      });

    setNotifications(generated.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    ));
  }, [orders, items]);

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'order': return <ShoppingCart className="w-5 h-5" />;
      case 'inventory': return <Package className="w-5 h-5" />;
      case 'payment': return <DollarSign className="w-5 h-5" />;
      case 'message': return <MessageSquare className="w-5 h-5" />;
      case 'alert': return <AlertTriangle className="w-5 h-5" />;
    }
  };

  const getPriorityColor = (priority: Notification['priority']) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'medium': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'low': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast({
      title: 'All Notifications Marked as Read',
    });
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    toast({
      title: 'Notification Dismissed',
    });
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-2">
            <Bell className="w-8 h-8" />
            Notification Center
          </h2>
          <p className="text-muted-foreground mt-1">
            Stay updated with real-time alerts and notifications
          </p>
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <Badge variant="destructive" className="h-8 px-3">
              {unreadCount} unread
            </Badge>
          )}
          <Button onClick={markAllAsRead} variant="outline">
            <Check className="mr-2 h-4 w-4" />
            Mark All Read
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Recent Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-3">
                {notifications.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No notifications yet</p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`flex gap-3 p-4 rounded-lg border transition-colors ${
                        !notification.read ? 'bg-accent' : ''
                      }`}
                    >
                      <div className={`p-2 rounded-full h-fit ${getPriorityColor(notification.priority)}`}>
                        {getIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="font-medium">{notification.title}</div>
                            <div className="text-sm text-muted-foreground mt-1">
                              {notification.message}
                            </div>
                            <div className="text-xs text-muted-foreground mt-2">
                              {format(new Date(notification.timestamp), 'MMM dd, yyyy • h:mm a')}
                            </div>
                          </div>
                          <div className="flex gap-1">
                            {!notification.read && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => markAsRead(notification.id)}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => dismissNotification(notification.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">New Orders</span>
                <Badge variant="outline">Enabled</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Low Stock Alerts</span>
                <Badge variant="outline">Enabled</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Payment Updates</span>
                <Badge variant="outline">Enabled</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Customer Messages</span>
                <Badge variant="outline">Enabled</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Pending Orders</span>
                <span className="text-lg font-bold">
                  {orders.filter(o => o.status === 'pending').length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Low Stock Items</span>
                <span className="text-lg font-bold text-orange-500">
                  {items.filter(i => (i.stock_quantity || 0) < 10 && (i.stock_quantity || 0) > 0).length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Out of Stock</span>
                <span className="text-lg font-bold text-destructive">
                  {items.filter(i => (i.stock_quantity || 0) === 0).length}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
