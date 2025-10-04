import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMerchantSettings } from '@/hooks/useMerchantSettings';
import { Store, CreditCard, ShoppingCart, Package, Users, Tag, TrendingUp, Settings } from 'lucide-react';

const MerchantTerminalSettings = () => {
  const { settings, updateSettings, isUpdating } = useMerchantSettings();

  if (!settings) return null;

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Settings className="w-8 h-8" />
          Merchant Settings
        </h1>
        <p className="text-muted-foreground mt-2">
          Configure your store preferences and business operations
        </p>
      </div>

      <div className="space-y-6">
        {/* Payment Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Payment Settings
            </CardTitle>
            <CardDescription>Configure payment methods and processing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="payment-gateway">Payment Gateway</Label>
              <Select
                value={settings.payment_gateway}
                onValueChange={(value) => updateSettings({ payment_gateway: value })}
              >
                <SelectTrigger id="payment-gateway">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mydresser">MyDresser Payment</SelectItem>
                  <SelectItem value="stripe">Stripe</SelectItem>
                  <SelectItem value="paypal">PayPal</SelectItem>
                  <SelectItem value="square">Square</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Accepted Payment Methods</Label>
              <div className="space-y-2">
                {['card', 'bank', 'digital_wallet', 'cash'].map((method) => (
                  <div key={method} className="flex items-center justify-between">
                    <Label htmlFor={method} className="font-normal capitalize">
                      {method.replace('_', ' ')}
                    </Label>
                    <Switch
                      id={method}
                      checked={settings.accepted_payment_methods.includes(method)}
                      onCheckedChange={(checked) => {
                        const methods = checked
                          ? [...settings.accepted_payment_methods, method]
                          : settings.accepted_payment_methods.filter(m => m !== method);
                        updateSettings({ accepted_payment_methods: methods });
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="commission-rate">Commission Rate (%)</Label>
              <Input
                id="commission-rate"
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={settings.commission_rate * 100}
                onChange={(e) => updateSettings({ commission_rate: parseFloat(e.target.value) / 100 })}
              />
              <p className="text-sm text-muted-foreground">
                Platform commission rate for marketplace transactions
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="enable-installments">Enable Installment Payments</Label>
                <p className="text-sm text-muted-foreground">
                  Allow customers to pay in installments
                </p>
              </div>
              <Switch
                id="enable-installments"
                checked={settings.enable_installments}
                onCheckedChange={(checked) => updateSettings({ enable_installments: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Order Management */}
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
                min="1"
                value={settings.order_processing_time}
                onChange={(e) => updateSettings({ order_processing_time: parseInt(e.target.value) })}
              />
              <p className="text-sm text-muted-foreground">
                Expected time to process and prepare orders for shipment
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="order-tracking">Enable Order Tracking</Label>
                <p className="text-sm text-muted-foreground">
                  Allow customers to track their orders in real-time
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

        {/* Inventory Management */}
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
                min="0"
                value={settings.low_stock_threshold}
                onChange={(e) => updateSettings({ low_stock_threshold: parseInt(e.target.value) })}
              />
              <p className="text-sm text-muted-foreground">
                Receive alerts when stock falls below this quantity
              </p>
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
                <Label htmlFor="auto-reorder">Auto Reorder Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically create reorder alerts when stock is low
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

        {/* Customer Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Customer Management
            </CardTitle>
            <CardDescription>Reviews and customer engagement settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="customer-reviews">Enable Customer Reviews</Label>
                <p className="text-sm text-muted-foreground">
                  Allow customers to leave reviews on products
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
                  Approve reviews before they are published
                </p>
              </div>
              <Switch
                id="review-moderation"
                checked={settings.require_review_moderation}
                onCheckedChange={(checked) => updateSettings({ require_review_moderation: checked })}
                disabled={!settings.enable_customer_reviews}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="loyalty-program">Loyalty Program</Label>
                <p className="text-sm text-muted-foreground">
                  Enable loyalty rewards for returning customers
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

        {/* Marketing & Promotions */}
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
                  Create discounts and special offers for customers
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
                  Send marketing emails and newsletters to customers
                </p>
              </div>
              <Switch
                id="email-marketing"
                checked={settings.enable_email_marketing}
                onCheckedChange={(checked) => updateSettings({ enable_email_marketing: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Analytics & Reporting */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Analytics & Reporting
            </CardTitle>
            <CardDescription>Track performance and generate insights</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="analytics">Enable Analytics</Label>
                <p className="text-sm text-muted-foreground">
                  Track store performance and customer behavior metrics
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

        {/* Store Appearance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="w-5 h-5" />
              Store Appearance
            </CardTitle>
            <CardDescription>Customize your store's look and feel</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="store-theme">Store Theme</Label>
              <Select
                value={settings.store_theme}
                onValueChange={(value) => updateSettings({ store_theme: value })}
              >
                <SelectTrigger id="store-theme">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="modern">Modern</SelectItem>
                  <SelectItem value="classic">Classic</SelectItem>
                  <SelectItem value="minimal">Minimal</SelectItem>
                  <SelectItem value="bold">Bold</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Brand Colors</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="primary-color" className="text-sm font-normal">Primary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="primary-color"
                      type="color"
                      value={settings.brand_colors.primary}
                      onChange={(e) => updateSettings({
                        brand_colors: { ...settings.brand_colors, primary: e.target.value }
                      })}
                      className="w-20 h-10"
                    />
                    <Input
                      type="text"
                      value={settings.brand_colors.primary}
                      onChange={(e) => updateSettings({
                        brand_colors: { ...settings.brand_colors, primary: e.target.value }
                      })}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secondary-color" className="text-sm font-normal">Secondary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="secondary-color"
                      type="color"
                      value={settings.brand_colors.secondary}
                      onChange={(e) => updateSettings({
                        brand_colors: { ...settings.brand_colors, secondary: e.target.value }
                      })}
                      className="w-20 h-10"
                    />
                    <Input
                      type="text"
                      value={settings.brand_colors.secondary}
                      onChange={(e) => updateSettings({
                        brand_colors: { ...settings.brand_colors, secondary: e.target.value }
                      })}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MerchantTerminalSettings;
