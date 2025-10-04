import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useMerchantProfile } from '@/hooks/useMerchantProfile';
import { useMerchantItems } from '@/hooks/useMerchantItems';
import { useOrders } from '@/hooks/useOrders';
import { useMerchantAnalytics } from '@/hooks/useMerchantAnalytics';
import { Bell, AlertTriangle, CheckCircle, Info, Plus, ExternalLink } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export const MerchantCustomPanel = () => {
  const { profile } = useMerchantProfile();
  const { items } = useMerchantItems();
  const { orders } = useOrders();
  const { analytics } = useMerchantAnalytics();
  
  const [notifications, setNotifications] = useState<Array<{
    type: string;
    message: string;
    icon: any;
  }>>([]);

  useEffect(() => {
    const newNotifs = [];
    const lowStockItems = items?.filter(i => (i.stock_quantity || 0) < 10 && (i.stock_quantity || 0) > 0).length || 0;
    const pendingOrders = orders?.filter(o => o.status === 'pending').length || 0;
    
    if (lowStockItems > 0) {
      newNotifs.push({
        type: 'warning',
        message: `${lowStockItems} items below low stock threshold`,
        icon: AlertTriangle
      });
    }
    
    if (pendingOrders > 0) {
      newNotifs.push({
        type: 'info',
        message: `${pendingOrders} new orders awaiting fulfillment`,
        icon: Info
      });
    }
    
    newNotifs.push({
      type: 'success',
      message: 'Payment gateway active',
      icon: CheckCircle
    });
    
    setNotifications(newNotifs);
  }, [items, orders]);

  const quickLinks = [
    { label: 'Add New Item', href: '/terminal/inventory' },
    { label: 'View Orders', href: '/terminal/orders' },
    { label: 'Marketing Campaigns', href: '/terminal/marketing' },
    { label: 'Financial Reports', href: '/terminal/reports' },
  ];

  return (
    <div className="space-y-6">
      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {notifications.map((notif, index) => (
            <Alert key={index} variant={notif.type === 'warning' ? 'destructive' : 'default'}>
              <notif.icon className="h-4 w-4" />
              <AlertDescription>{notif.message}</AlertDescription>
            </Alert>
          ))}
        </CardContent>
      </Card>

      {/* Merchant Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Merchant Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Account Status</span>
            <Badge variant={profile?.verification_status === 'verified' ? 'default' : 'secondary'}>
              {profile?.verification_status || 'Pending'}
            </Badge>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Daily Sales Target</span>
              <span className="text-sm">
                {analytics?.[0]?.total_sales 
                  ? Math.min(100, Math.round((analytics[0].total_sales / 1000) * 100))
                  : 0}%
              </span>
            </div>
            <Progress 
              value={analytics?.[0]?.total_sales 
                ? Math.min(100, Math.round((analytics[0].total_sales / 1000) * 100))
                : 0
              } 
              className="h-2" 
            />
            <p className="text-xs text-muted-foreground mt-1">
              ${analytics?.[0]?.total_sales?.toFixed(2) || '0.00'} of $1,000 target
            </p>
          </div>

          <div className="pt-2 border-t">
            <p className="text-sm text-muted-foreground mb-2">Business Type</p>
            <p className="font-medium">{profile?.business_type || 'Fashion Retailer'}</p>
          </div>

          <Button variant="outline" className="w-full" size="sm">
            <ExternalLink className="mr-2 h-4 w-4" />
            Contact Support
          </Button>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Links</CardTitle>
          <CardDescription>Frequently accessed tools</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {quickLinks.map((link, index) => (
            <Button
              key={index}
              variant="ghost"
              className="w-full justify-start"
              onClick={() => window.location.href = link.href}
            >
              {link.label}
            </Button>
          ))}
          <Button variant="outline" className="w-full mt-4">
            <Plus className="mr-2 h-4 w-4" />
            Add Custom Link
          </Button>
        </CardContent>
      </Card>

      {/* Performance Snapshot */}
      <Card>
        <CardHeader>
          <CardTitle>Today's Highlights</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">Total Revenue</span>
            <span className="font-bold">
              ${analytics?.[0]?.total_sales?.toFixed(2) || '0.00'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Orders Fulfilled</span>
            <span className="font-bold">
              {orders?.filter(o => o.status === 'completed').length || 0}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">New Customers</span>
            <span className="font-bold">
              {analytics?.[0]?.new_customers || 0}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
