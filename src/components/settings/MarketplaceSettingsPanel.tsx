import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useSettings } from "@/hooks/useSettings";

const MarketplaceSettingsPanel = () => {
  const { settings, updateSettings, loading } = useSettings();

  const marketSettings = settings?.marketplace;

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

  if (loading) {
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
              checked={marketSettings?.enableSelling !== false}
              onCheckedChange={(checked) => handleToggle('enableSelling', checked)}
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
              checked={marketSettings?.autoAcceptOffers === true}
              onCheckedChange={(checked) => handleToggle('autoAcceptOffers', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Show Local Items Only</Label>
              <p className="text-sm text-muted-foreground">
                Filter marketplace to nearby sellers
              </p>
            </div>
            <Switch
              checked={marketSettings?.showLocalOnly === true}
              onCheckedChange={(checked) => handleToggle('showLocalOnly', checked)}
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
              checked={marketSettings?.enablePurchases !== false}
              onCheckedChange={(checked) => handleToggle('enablePurchases', checked)}
            />
          </div>

          <div className="space-y-2">
            <Label>Default Currency</Label>
            <Select
              value={marketSettings?.defaultCurrency || 'USD'}
              onValueChange={(value) => handleSelectChange('defaultCurrency', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD ($)</SelectItem>
                <SelectItem value="EUR">EUR (€)</SelectItem>
                <SelectItem value="GBP">GBP (£)</SelectItem>
                <SelectItem value="JPY">JPY (¥)</SelectItem>
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
              checked={marketSettings?.notifyOnPriceDrops !== false}
              onCheckedChange={(checked) => handleToggle('notifyOnPriceDrops', checked)}
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
              checked={marketSettings?.notifyOnNewListings === true}
              onCheckedChange={(checked) => handleToggle('notifyOnNewListings', checked)}
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
              checked={marketSettings?.notifyOnSales !== false}
              onCheckedChange={(checked) => handleToggle('notifyOnSales', checked)}
            />
          </div>
        </Card>
      </div>
    </div>
  );
};

export default MarketplaceSettingsPanel;
