import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { useMerchantSettings } from '@/hooks/useMerchantSettings';
import { Store, ShoppingCart, Package, Users, Tag } from 'lucide-react';

export const MerchantSettingsPanel = () => {
  const { settings, updateSettings, isUpdating } = useMerchantSettings();

  if (!settings) return null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Order Management
          </CardTitle>
          <CardDescription>Configure order processing and fulfillment</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-accept">Auto-accept Orders</Label>
              <p className="text-sm text-muted-foreground">
                Automatically accept incoming orders
              </p>
            </div>
            <Switch
              id="auto-accept"
              checked={settings.auto_accept_orders}
              onCheckedChange={(checked) => updateSettings({ auto_accept_orders: checked })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="processing-time">Order Processing Time (hours)</Label>
            <Input
              id="processing-time"
              type="number"
              value={settings.order_processing_time}
              onChange={(e) => updateSettings({ order_processing_time: parseInt(e.target.value) })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="order-tracking">Enable Order Tracking</Label>
              <p className="text-sm text-muted-foreground">
                Allow customers to track their orders
              </p>
            </div>
            <Switch
              id="order-tracking"
              checked={settings.enable_order_tracking}
              onCheckedChange={(checked) => updateSettings({ enable_order_tracking: checked })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Inventory Management
          </CardTitle>
          <CardDescription>Stock alerts and reorder settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="low-stock">Low Stock Threshold</Label>
            <Input
              id="low-stock"
              type="number"
              value={settings.low_stock_threshold}
              onChange={(e) => updateSettings({ low_stock_threshold: parseInt(e.target.value) })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="stock-alerts">Enable Stock Alerts</Label>
              <p className="text-sm text-muted-foreground">
                Get notified about low stock items
              </p>
            </div>
            <Switch
              id="stock-alerts"
              checked={settings.enable_stock_alerts}
              onCheckedChange={(checked) => updateSettings({ enable_stock_alerts: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-reorder">Auto Reorder</Label>
              <p className="text-sm text-muted-foreground">
                Automatically create reorder alerts
              </p>
            </div>
            <Switch
              id="auto-reorder"
              checked={settings.auto_reorder}
              onCheckedChange={(checked) => updateSettings({ auto_reorder: checked })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Customer Management
          </CardTitle>
          <CardDescription>Reviews and customer engagement</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="customer-reviews">Enable Customer Reviews</Label>
              <p className="text-sm text-muted-foreground">
                Allow customers to leave reviews
              </p>
            </div>
            <Switch
              id="customer-reviews"
              checked={settings.enable_customer_reviews}
              onCheckedChange={(checked) => updateSettings({ enable_customer_reviews: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="review-moderation">Review Moderation</Label>
              <p className="text-sm text-muted-foreground">
                Approve reviews before publishing
              </p>
            </div>
            <Switch
              id="review-moderation"
              checked={settings.require_review_moderation}
              onCheckedChange={(checked) => updateSettings({ require_review_moderation: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="loyalty-program">Loyalty Program</Label>
              <p className="text-sm text-muted-foreground">
                Enable loyalty rewards for customers
              </p>
            </div>
            <Switch
              id="loyalty-program"
              checked={settings.enable_loyalty_program}
              onCheckedChange={(checked) => updateSettings({ enable_loyalty_program: checked })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="w-5 h-5" />
            Marketing & Promotions
          </CardTitle>
          <CardDescription>Promotional campaigns and marketing tools</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="promotions">Enable Promotions</Label>
              <p className="text-sm text-muted-foreground">
                Create discounts and special offers
              </p>
            </div>
            <Switch
              id="promotions"
              checked={settings.enable_promotions}
              onCheckedChange={(checked) => updateSettings({ enable_promotions: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-marketing">Email Marketing</Label>
              <p className="text-sm text-muted-foreground">
                Send marketing emails to customers
              </p>
            </div>
            <Switch
              id="email-marketing"
              checked={settings.enable_email_marketing}
              onCheckedChange={(checked) => updateSettings({ enable_email_marketing: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="analytics">Enable Analytics</Label>
              <p className="text-sm text-muted-foreground">
                Track store performance metrics
              </p>
            </div>
            <Switch
              id="analytics"
              checked={settings.enable_analytics}
              onCheckedChange={(checked) => updateSettings({ enable_analytics: checked })}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
