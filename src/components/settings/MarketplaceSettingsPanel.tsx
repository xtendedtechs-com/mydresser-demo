import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useSettings } from "@/hooks/useSettings";

const MarketplaceSettingsPanel = () => {
  const { settings, updateSettings, isLoading } = useSettings();

  const marketSettings = settings?.marketplace || {};

  const handleToggle = (key: string, value: boolean) => {
    updateSettings({
      marketplace: { ...marketSettings, [key]: value }
    });
  };

  const handleSelectChange = (key: string, value: string) => {
    updateSettings({
      marketplace: { ...marketSettings, [key]: value }
    });
  };

  const handleInputChange = (key: string, value: string) => {
    updateSettings({
      marketplace: { ...marketSettings, [key]: value }
    });
  };

  if (isLoading) {
    return <div className="text-muted-foreground">Loading settings...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Selling Preferences</h3>
        <Card className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Selling</Label>
              <p className="text-sm text-muted-foreground">
                Allow listing items on 2ndDresser marketplace
              </p>
            </div>
            <Switch
              checked={marketSettings.enable_selling !== false}
              onCheckedChange={(checked) => handleToggle('enable_selling', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto-Accept Offers</Label>
              <p className="text-sm text-muted-foreground">
                Automatically accept offers at asking price
              </p>
            </div>
            <Switch
              checked={marketSettings.auto_accept_offers === true}
              onCheckedChange={(checked) => handleToggle('auto_accept_offers', checked)}
            />
          </div>

          <div className="space-y-2">
            <Label>Shipping Method</Label>
            <Select
              value={marketSettings.default_shipping_method || 'standard'}
              onValueChange={(value) => handleSelectChange('default_shipping_method', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="local_pickup">Local Pickup Only</SelectItem>
                <SelectItem value="standard">Standard Shipping</SelectItem>
                <SelectItem value="express">Express Shipping</SelectItem>
                <SelectItem value="both">Both Options</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Default Shipping Location</Label>
            <Input
              placeholder="City, State/Country"
              value={marketSettings.shipping_location || ''}
              onChange={(e) => handleInputChange('shipping_location', e.target.value)}
            />
          </div>
        </Card>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Buying Preferences</h3>
        <Card className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Show Virtual Try-On</Label>
              <p className="text-sm text-muted-foreground">
                Try items virtually before purchase
              </p>
            </div>
            <Switch
              checked={marketSettings.enable_vto_before_purchase !== false}
              onCheckedChange={(checked) => handleToggle('enable_vto_before_purchase', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Save Search Preferences</Label>
              <p className="text-sm text-muted-foreground">
                Remember your filters and search criteria
              </p>
            </div>
            <Switch
              checked={marketSettings.save_search_preferences !== false}
              onCheckedChange={(checked) => handleToggle('save_search_preferences', checked)}
            />
          </div>

          <div className="space-y-2">
            <Label>Preferred Condition</Label>
            <Select
              value={marketSettings.preferred_condition || 'any'}
              onValueChange={(value) => handleSelectChange('preferred_condition', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any Condition</SelectItem>
                <SelectItem value="new">New Only</SelectItem>
                <SelectItem value="excellent">Excellent+</SelectItem>
                <SelectItem value="good">Good+</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Notifications</h3>
        <Card className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Price Drop Alerts</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when favorited items drop in price
              </p>
            </div>
            <Switch
              checked={marketSettings.notify_price_drops !== false}
              onCheckedChange={(checked) => handleToggle('notify_price_drops', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>New Listing Alerts</Label>
              <p className="text-sm text-muted-foreground">
                Get notified of items matching your style
              </p>
            </div>
            <Switch
              checked={marketSettings.notify_new_listings === true}
              onCheckedChange={(checked) => handleToggle('notify_new_listings', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Transaction Updates</Label>
              <p className="text-sm text-muted-foreground">
                Get notified about order status changes
              </p>
            </div>
            <Switch
              checked={marketSettings.notify_transactions !== false}
              onCheckedChange={(checked) => handleToggle('notify_transactions', checked)}
            />
          </div>
        </Card>
      </div>
    </div>
  );
};

export default MarketplaceSettingsPanel;
