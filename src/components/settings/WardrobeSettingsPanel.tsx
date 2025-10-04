import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { useSettings } from '@/hooks/useSettings';
import type { WardrobeSettings } from '@/types/settings';
import { Separator } from '@/components/ui/separator';

export const WardrobeSettingsPanel = () => {
  const { wardrobe, updateFeatureSettings, saving } = useSettings();

  const handleUpdate = (updates: Partial<WardrobeSettings>) => {
    updateFeatureSettings('wardrobe', updates);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium mb-4">Display Preferences</h3>
        <div className="space-y-4">
          <div>
            <Label>Default View</Label>
            <Select
              value={wardrobe?.defaultView || 'grid'}
              onValueChange={(value) => handleUpdate({ defaultView: value as 'grid' | 'list' | 'compact' })}
              disabled={saving}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="grid">Grid</SelectItem>
                <SelectItem value="list">List</SelectItem>
                <SelectItem value="compact">Compact</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="items-per-page">Items Per Page</Label>
            <Input
              id="items-per-page"
              type="number"
              min="10"
              max="100"
              step="10"
              value={wardrobe?.itemsPerPage || 20}
              onChange={(e) => handleUpdate({ itemsPerPage: parseInt(e.target.value) })}
              disabled={saving}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="show-wear-count">Show Wear Count</Label>
            <Switch
              id="show-wear-count"
              checked={wardrobe?.showWearCount ?? true}
              onCheckedChange={(checked) => handleUpdate({ showWearCount: checked })}
              disabled={saving}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="show-price">Show Price Info</Label>
            <Switch
              id="show-price"
              checked={wardrobe?.showPriceInfo ?? true}
              onCheckedChange={(checked) => handleUpdate({ showPriceInfo: checked })}
              disabled={saving}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="show-cost-per-wear">Show Cost Per Wear</Label>
            <Switch
              id="show-cost-per-wear"
              checked={wardrobe?.showCostPerWear ?? true}
              onCheckedChange={(checked) => handleUpdate({ showCostPerWear: checked })}
              disabled={saving}
            />
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="text-sm font-medium mb-4">Organization</h3>
        <div className="space-y-4">
          <div>
            <Label>Default Sort</Label>
            <Select
              value={wardrobe?.defaultSort || 'recent'}
              onValueChange={(value) => handleUpdate({ defaultSort: value as any })}
              disabled={saving}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="category">By Category</SelectItem>
                <SelectItem value="color">By Color</SelectItem>
                <SelectItem value="season">By Season</SelectItem>
                <SelectItem value="favorite">Favorites First</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="auto-categorization">Auto Categorization</Label>
            <Switch
              id="auto-categorization"
              checked={wardrobe?.enableAutoCategorization ?? true}
              onCheckedChange={(checked) => handleUpdate({ enableAutoCategorization: checked })}
              disabled={saving}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="smart-suggestions">Smart Suggestions</Label>
            <Switch
              id="smart-suggestions"
              checked={wardrobe?.enableSmartSuggestions ?? true}
              onCheckedChange={(checked) => handleUpdate({ enableSmartSuggestions: checked })}
              disabled={saving}
            />
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="text-sm font-medium mb-4">Maintenance</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="laundry-reminders">Laundry Reminders</Label>
            <Switch
              id="laundry-reminders"
              checked={wardrobe?.laundryReminders ?? true}
              onCheckedChange={(checked) => handleUpdate({ laundryReminders: checked })}
              disabled={saving}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="maintenance-alerts">Maintenance Alerts</Label>
            <Switch
              id="maintenance-alerts"
              checked={wardrobe?.maintenanceAlerts ?? true}
              onCheckedChange={(checked) => handleUpdate({ maintenanceAlerts: checked })}
              disabled={saving}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="cleaning-schedule">Cleaning Schedule</Label>
            <Switch
              id="cleaning-schedule"
              checked={wardrobe?.cleaningSchedule || false}
              onCheckedChange={(checked) => handleUpdate({ cleaningSchedule: checked })}
              disabled={saving}
            />
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="text-sm font-medium mb-4">Privacy</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="allow-social-sharing">Allow Social Sharing</Label>
            <Switch
              id="allow-social-sharing"
              checked={wardrobe?.allowSocialSharing ?? true}
              onCheckedChange={(checked) => handleUpdate({ allowSocialSharing: checked })}
              disabled={saving}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="show-in-marketplace">Show in Marketplace</Label>
            <Switch
              id="show-in-marketplace"
              checked={wardrobe?.showInMarketplace || false}
              onCheckedChange={(checked) => handleUpdate({ showInMarketplace: checked })}
              disabled={saving}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
