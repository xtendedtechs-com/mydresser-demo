import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useMerchantProfile } from '@/hooks/useMerchantProfile';
import { Bell, AlertTriangle, CheckCircle, Info, Plus, ExternalLink } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export const MerchantCustomPanel = () => {
  const { profile } = useMerchantProfile();

  const notifications = [
    { type: 'warning', message: '3 items below low stock threshold', icon: AlertTriangle },
    { type: 'info', message: '5 new orders awaiting fulfillment', icon: Info },
    { type: 'success', message: 'Payment gateway active', icon: CheckCircle },
  ];

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
              <span className="text-sm">65%</span>
            </div>
            <Progress value={65} className="h-2" />
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
            <span className="font-bold">$0.00</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Orders Fulfilled</span>
            <span className="font-bold">0</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">New Customers</span>
            <span className="font-bold">0</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
