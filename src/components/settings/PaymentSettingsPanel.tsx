import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { usePaymentSettings } from '@/hooks/usePaymentSettings';
import { CreditCard, Shield, Bell } from 'lucide-react';

export const PaymentSettingsPanel = () => {
  const { settings, updateSettings, isUpdating } = usePaymentSettings();

  if (!settings) return null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Payment Methods
          </CardTitle>
          <CardDescription>Manage your payment preferences and saved methods</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="default-method">Default Payment Method</Label>
              <Select
                value={settings.default_method}
                onValueChange={(value) => updateSettings({ default_method: value })}
              >
                <SelectTrigger id="default-method">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="card">Credit/Debit Card</SelectItem>
                  <SelectItem value="bank">Bank Transfer</SelectItem>
                  <SelectItem value="digital_wallet">Digital Wallet</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-save">Auto-save Payment Methods</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically save payment methods for faster checkout
                </p>
              </div>
              <Switch
                id="auto-save"
                checked={settings.enable_auto_save}
                onCheckedChange={(checked) => updateSettings({ enable_auto_save: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="require-cvv">Require CVV</Label>
                <p className="text-sm text-muted-foreground">
                  Always ask for CVV code when using saved cards
                </p>
              </div>
              <Switch
                id="require-cvv"
                checked={settings.require_cvv}
                onCheckedChange={(checked) => updateSettings({ require_cvv: checked })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Security
          </CardTitle>
          <CardDescription>Payment security and verification settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="3d-secure">Enable 3D Secure</Label>
              <p className="text-sm text-muted-foreground">
                Additional verification for card payments
              </p>
            </div>
            <Switch
              id="3d-secure"
              checked={settings.enable_3d_secure}
              onCheckedChange={(checked) => updateSettings({ enable_3d_secure: checked })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="spending-limit">Daily Spending Limit (Optional)</Label>
            <Input
              id="spending-limit"
              type="number"
              placeholder="No limit"
              value={settings.spending_limit || ''}
              onChange={(e) => updateSettings({ 
                spending_limit: e.target.value ? parseFloat(e.target.value) : undefined 
              })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Transaction Alerts
          </CardTitle>
          <CardDescription>Get notified about payment activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="transaction-alerts">Enable Transaction Alerts</Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications for all transactions
              </p>
            </div>
            <Switch
              id="transaction-alerts"
              checked={settings.enable_transaction_alerts}
              onCheckedChange={(checked) => updateSettings({ enable_transaction_alerts: checked })}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
