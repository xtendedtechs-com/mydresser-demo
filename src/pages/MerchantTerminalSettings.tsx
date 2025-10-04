import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMerchantSettings } from '@/hooks/useMerchantSettings';
import { useMerchantProfile } from '@/hooks/useMerchantProfile';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Store, CreditCard, ShoppingCart, Package, Users, Tag, TrendingUp, Settings, Bell, Shield, Palette, Globe, Mail, Calendar } from 'lucide-react';

const MerchantTerminalSettings = () => {
  const { settings, updateSettings, isUpdating } = useMerchantSettings();
  const { profile, updateProfile } = useMerchantProfile();
  const { toast } = useToast();

  if (!settings || !profile) return null;

  const handleBusinessInfoUpdate = async (updates: any) => {
    if (!profile?.id) return;
    
    try {
      await updateProfile(profile.id, updates);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update business information',
        variant: 'destructive'
      });
    }
  };

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

      <Tabs defaultValue="business" className="space-y-6">
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="business">
            <Store className="w-4 h-4 mr-2" />
            Business
          </TabsTrigger>
          <TabsTrigger value="payment">
            <CreditCard className="w-4 h-4 mr-2" />
            Payment
          </TabsTrigger>
          <TabsTrigger value="orders">
            <ShoppingCart className="w-4 h-4 mr-2" />
            Orders
          </TabsTrigger>
          <TabsTrigger value="inventory">
            <Package className="w-4 h-4 mr-2" />
            Inventory
          </TabsTrigger>
          <TabsTrigger value="customers">
            <Users className="w-4 h-4 mr-2" />
            Customers
          </TabsTrigger>
          <TabsTrigger value="advanced">
            <Shield className="w-4 h-4 mr-2" />
            Advanced
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="w-4 h-4 mr-2" />
            Security
          </TabsTrigger>
        </TabsList>

        {/* Business Information */}
        <TabsContent value="business" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Business Profile</CardTitle>
              <CardDescription>Basic business information displayed to customers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="business-name">Business Name</Label>
                <Input
                  id="business-name"
                  value={profile.business_name}
                  onChange={(e) => handleBusinessInfoUpdate({ business_name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="business-type">Business Type</Label>
                <Select
                  value={profile.business_type || 'fashion_retailer'}
                  onValueChange={(value) => handleBusinessInfoUpdate({ business_type: value })}
                >
                  <SelectTrigger id="business-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fashion_retailer">Fashion Retailer</SelectItem>
                    <SelectItem value="boutique">Boutique</SelectItem>
                    <SelectItem value="brand">Fashion Brand</SelectItem>
                    <SelectItem value="designer">Designer</SelectItem>
                    <SelectItem value="marketplace">Marketplace</SelectItem>
                    <SelectItem value="manufacturer">Manufacturer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tax-id">Tax ID / Business Registration Number</Label>
                <Input
                  id="tax-id"
                  type="password"
                  placeholder="Enter tax ID (encrypted)"
                  onChange={(e) => {
                    if (e.target.value && profile?.id) {
                      handleBusinessInfoUpdate({ tax_id: e.target.value });
                    }
                  }}
                />
                <p className="text-xs text-muted-foreground">
                  Your tax information is encrypted and stored securely
                </p>
              </div>

              <div className="space-y-2">
                <Label>Business Address</Label>
                <Textarea
                  placeholder="Street address, city, state, zip code, country"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Contact Information
              </CardTitle>
              <CardDescription>How customers can reach you</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="business-email">Business Email</Label>
                <Input
                  id="business-email"
                  type="email"
                  placeholder="business@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="business-phone">Business Phone</Label>
                <Input
                  id="business-phone"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  placeholder="https://yourwebsite.com"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Business Hours
              </CardTitle>
              <CardDescription>Set your operating hours</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                <div key={day} className="grid grid-cols-3 gap-4 items-center">
                  <Label className="font-normal">{day}</Label>
                  <Input type="time" defaultValue="09:00" className="text-sm" />
                  <Input type="time" defaultValue="17:00" className="text-sm" />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Settings */}
        <TabsContent value="payment" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment Gateway</CardTitle>
              <CardDescription>Configure how you accept payments</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="payment-gateway">Primary Payment Gateway</Label>
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
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'card', label: 'Credit/Debit Card' },
                    { value: 'bank', label: 'Bank Transfer' },
                    { value: 'digital_wallet', label: 'Digital Wallet' },
                    { value: 'cash', label: 'Cash (In-Store)' }
                  ].map((method) => (
                    <div key={method.value} className="flex items-center justify-between p-3 border rounded-lg">
                      <Label htmlFor={method.value} className="font-normal cursor-pointer">
                        {method.label}
                      </Label>
                      <Switch
                        id={method.value}
                        checked={settings.accepted_payment_methods.includes(method.value)}
                        onCheckedChange={(checked) => {
                          const methods = checked
                            ? [...settings.accepted_payment_methods, method.value]
                            : settings.accepted_payment_methods.filter(m => m !== method.value);
                          updateSettings({ accepted_payment_methods: methods });
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="commission-rate">Platform Commission Rate (%)</Label>
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
                  Platform fee for marketplace transactions
                </p>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-0.5">
                  <Label htmlFor="enable-installments">Enable Installment Payments</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow customers to pay in multiple installments
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
        </TabsContent>

        {/* Order Management */}
        <TabsContent value="orders" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Processing</CardTitle>
              <CardDescription>Configure how orders are handled</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-accept">Auto-accept Orders</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically accept incoming orders without manual review
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
                  max="168"
                  value={settings.order_processing_time}
                  onChange={(e) => updateSettings({ order_processing_time: parseInt(e.target.value) })}
                />
                <p className="text-sm text-muted-foreground">
                  Expected time to process and prepare orders for shipment
                </p>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
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

          <Card>
            <CardHeader>
              <CardTitle>Shipping Configuration</CardTitle>
              <CardDescription>Manage shipping options and policies</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Default Shipping Method</Label>
                <Select defaultValue="standard">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard Shipping (5-7 days)</SelectItem>
                    <SelectItem value="express">Express Shipping (2-3 days)</SelectItem>
                    <SelectItem value="overnight">Overnight Shipping</SelectItem>
                    <SelectItem value="local">Local Pickup</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="free-shipping-threshold">Free Shipping Threshold ($)</Label>
                <Input
                  id="free-shipping-threshold"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="50.00"
                />
                <p className="text-sm text-muted-foreground">
                  Minimum order value for free shipping (leave empty to disable)
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Inventory Management */}
        <TabsContent value="inventory" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Stock Management</CardTitle>
              <CardDescription>Configure inventory alerts and automation</CardDescription>
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

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-0.5">
                  <Label htmlFor="stock-alerts">Enable Stock Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified about low stock and out-of-stock items
                  </p>
                </div>
                <Switch
                  id="stock-alerts"
                  checked={settings.enable_stock_alerts}
                  onCheckedChange={(checked) => updateSettings({ enable_stock_alerts: checked })}
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
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

          <Card>
            <CardHeader>
              <CardTitle>Product Display Settings</CardTitle>
              <CardDescription>Control how products appear to customers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-0.5">
                  <Label htmlFor="hide-out-of-stock">Hide Out-of-Stock Items</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically hide products that are out of stock
                  </p>
                </div>
                <Switch
                  id="hide-out-of-stock"
                  defaultChecked={false}
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-0.5">
                  <Label htmlFor="show-stock-count">Display Stock Count</Label>
                  <p className="text-sm text-muted-foreground">
                    Show remaining quantity to customers
                  </p>
                </div>
                <Switch
                  id="show-stock-count"
                  defaultChecked={false}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Customer Management */}
        <TabsContent value="customers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Reviews & Feedback</CardTitle>
              <CardDescription>Manage customer reviews and ratings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
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

              <div className="flex items-center justify-between p-4 border rounded-lg">
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

              <div className="space-y-2">
                <Label htmlFor="min-review-rating">Minimum Star Rating to Display</Label>
                <Select defaultValue="1">
                  <SelectTrigger id="min-review-rating">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Star and Above</SelectItem>
                    <SelectItem value="2">2 Stars and Above</SelectItem>
                    <SelectItem value="3">3 Stars and Above</SelectItem>
                    <SelectItem value="4">4 Stars and Above</SelectItem>
                    <SelectItem value="5">5 Stars Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Loyalty & Rewards</CardTitle>
              <CardDescription>Customer retention programs</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-0.5">
                  <Label htmlFor="loyalty-program">Enable Loyalty Program</Label>
                  <p className="text-sm text-muted-foreground">
                    Reward returning customers with points and discounts
                  </p>
                </div>
                <Switch
                  id="loyalty-program"
                  checked={settings.enable_loyalty_program}
                  onCheckedChange={(checked) => updateSettings({ enable_loyalty_program: checked })}
                />
              </div>

              {settings.enable_loyalty_program && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="points-per-dollar">Points Per Dollar Spent</Label>
                    <Input
                      id="points-per-dollar"
                      type="number"
                      min="1"
                      defaultValue="10"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="points-redemption">Points Redemption Value</Label>
                    <Input
                      id="points-redemption"
                      type="number"
                      min="0.01"
                      step="0.01"
                      defaultValue="0.01"
                      placeholder="Dollar value per point"
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Marketing & Communications</CardTitle>
              <CardDescription>Customer engagement settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
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

              <div className="flex items-center justify-between p-4 border rounded-lg">
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
            </CardContent>
          </Card>
        </TabsContent>

        {/* Advanced Settings */}
        <TabsContent value="advanced" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Analytics & Reporting</CardTitle>
              <CardDescription>Track performance and generate insights</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
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

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-0.5">
                  <Label htmlFor="daily-reports">Daily Email Reports</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive daily sales summaries via email
                  </p>
                </div>
                <Switch
                  id="daily-reports"
                  defaultChecked={false}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
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
                    <SelectItem value="elegant">Elegant</SelectItem>
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

              <div className="space-y-2">
                <Label htmlFor="custom-css">Custom CSS (Advanced)</Label>
                <Textarea
                  id="custom-css"
                  placeholder="/* Enter custom CSS here */"
                  rows={6}
                  className="font-mono text-sm"
                  value={settings.custom_css || ''}
                  onChange={(e) => updateSettings({ custom_css: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Add custom styles to personalize your store appearance
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Regional Settings
              </CardTitle>
              <CardDescription>Localization and regional preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select defaultValue="America/New_York">
                  <SelectTrigger id="timezone">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                    <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                    <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                    <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                    <SelectItem value="Europe/London">London (GMT)</SelectItem>
                    <SelectItem value="Europe/Paris">Paris (CET)</SelectItem>
                    <SelectItem value="Asia/Tokyo">Tokyo (JST)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">Default Currency</Label>
                <Select defaultValue="USD">
                  <SelectTrigger id="currency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD - US Dollar</SelectItem>
                    <SelectItem value="EUR">EUR - Euro</SelectItem>
                    <SelectItem value="GBP">GBP - British Pound</SelectItem>
                    <SelectItem value="JPY">JPY - Japanese Yen</SelectItem>
                    <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="language">Store Language</Label>
                <Select defaultValue="en">
                  <SelectTrigger id="language">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="de">Deutsch</SelectItem>
                    <SelectItem value="it">Italiano</SelectItem>
                    <SelectItem value="ja">日本語</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>Configure how and when you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="email-notifications">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive updates via email</p>
                </div>
                <Switch id="email-notifications" defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="order-notifications">New Order Alerts</Label>
                  <p className="text-sm text-muted-foreground">Get notified when you receive new orders</p>
                </div>
                <Switch id="order-notifications" defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="low-stock-alerts">Low Stock Alerts</Label>
                  <p className="text-sm text-muted-foreground">Alert when inventory is running low</p>
                </div>
                <Switch 
                  id="low-stock-alerts" 
                  checked={settings.enable_stock_alerts}
                  onCheckedChange={(checked) => updateSettings({ enable_stock_alerts: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="customer-messages">Customer Messages</Label>
                  <p className="text-sm text-muted-foreground">Notify about customer inquiries</p>
                </div>
                <Switch id="customer-messages" defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="payment-alerts">Payment Alerts</Label>
                  <p className="text-sm text-muted-foreground">Notifications for successful payments</p>
                </div>
                <Switch id="payment-alerts" defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="marketing-emails">Marketing Emails</Label>
                  <p className="text-sm text-muted-foreground">Receive marketing and promotional content</p>
                </div>
                <Switch 
                  id="marketing-emails" 
                  checked={settings.enable_email_marketing}
                  onCheckedChange={(checked) => updateSettings({ enable_email_marketing: checked })}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Email Digest Settings
              </CardTitle>
              <CardDescription>Configure periodic email summaries</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="digest-frequency">Digest Frequency</Label>
                <Select defaultValue="daily">
                  <SelectTrigger id="digest-frequency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="realtime">Real-time</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="never">Never</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="digest-time">Preferred Time</Label>
                <Select defaultValue="09:00">
                  <SelectTrigger id="digest-time">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="06:00">6:00 AM</SelectItem>
                    <SelectItem value="09:00">9:00 AM</SelectItem>
                    <SelectItem value="12:00">12:00 PM</SelectItem>
                    <SelectItem value="18:00">6:00 PM</SelectItem>
                    <SelectItem value="21:00">9:00 PM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Security Settings
              </CardTitle>
              <CardDescription>Protect your merchant account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="two-factor">Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                </div>
                <Switch id="two-factor" />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="login-alerts">Login Alerts</Label>
                  <p className="text-sm text-muted-foreground">Get notified of new login attempts</p>
                </div>
                <Switch id="login-alerts" defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="session-timeout">Auto Logout</Label>
                  <p className="text-sm text-muted-foreground">Automatically log out after inactivity</p>
                </div>
                <Switch id="session-timeout" defaultChecked />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>API & Integration Security</CardTitle>
              <CardDescription>Manage API keys and integrations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>API Key</Label>
                <div className="flex gap-2">
                  <Input type="password" value="••••••••••••••••" readOnly />
                  <Button variant="outline">Regenerate</Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Keep your API key secure and never share it publicly
                </p>
              </div>

              <div className="space-y-2">
                <Label>Webhook Secret</Label>
                <div className="flex gap-2">
                  <Input type="password" value="••••••••••••••••" readOnly />
                  <Button variant="outline">Regenerate</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Active Sessions</CardTitle>
              <CardDescription>Manage your active login sessions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Current Session</p>
                  <p className="text-sm text-muted-foreground">Last active: Just now</p>
                </div>
                <Badge>Active</Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MerchantTerminalSettings;
