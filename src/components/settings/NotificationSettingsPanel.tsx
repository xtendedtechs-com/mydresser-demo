import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { useSettings } from '@/hooks/useSettings';
import type { NotificationSettings } from '@/types/settings';
import { Separator } from '@/components/ui/separator';

export const NotificationSettingsPanel = () => {
  const { notifications, updateFeatureSettings, saving } = useSettings();

  const handleUpdate = (updates: Partial<NotificationSettings>) => {
    updateFeatureSettings('notifications', updates);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Label htmlFor="email-notif">Email Notifications</Label>
        <Switch
          id="email-notif"
          checked={notifications?.emailNotifications ?? true}
          onCheckedChange={(checked) => handleUpdate({ emailNotifications: checked })}
          disabled={saving}
        />
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="push-notif">Push Notifications</Label>
        <Switch
          id="push-notif"
          checked={notifications?.pushNotifications ?? true}
          onCheckedChange={(checked) => handleUpdate({ pushNotifications: checked })}
          disabled={saving}
        />
      </div>

      <Separator />

      <div>
        <h3 className="text-sm font-medium mb-4">Outfit Notifications</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="outfit-suggestions">Daily Outfit Suggestions</Label>
            <Switch
              id="outfit-suggestions"
              checked={notifications?.outfitSuggestions ?? true}
              onCheckedChange={(checked) => handleUpdate({ outfitSuggestions: checked })}
              disabled={saving}
            />
          </div>
          {notifications?.outfitSuggestions && (
            <div>
              <Label htmlFor="daily-time">Daily Outfit Time</Label>
              <Input
                id="daily-time"
                type="time"
                value={notifications?.dailyOutfitTime || '09:00'}
                onChange={(e) => handleUpdate({ dailyOutfitTime: e.target.value })}
                disabled={saving}
              />
            </div>
          )}
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="text-sm font-medium mb-4">Market Notifications</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="market-updates">Market Updates</Label>
            <Switch
              id="market-updates"
              checked={notifications?.marketUpdates ?? true}
              onCheckedChange={(checked) => handleUpdate({ marketUpdates: checked })}
              disabled={saving}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="price-drops">Price Drop Alerts</Label>
            <Switch
              id="price-drops"
              checked={notifications?.priceDropAlerts ?? true}
              onCheckedChange={(checked) => handleUpdate({ priceDropAlerts: checked })}
              disabled={saving}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="new-listings">New Listings</Label>
            <Switch
              id="new-listings"
              checked={notifications?.newListings || false}
              onCheckedChange={(checked) => handleUpdate({ newListings: checked })}
              disabled={saving}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="offer-received">Offer Received</Label>
            <Switch
              id="offer-received"
              checked={notifications?.offerReceived ?? true}
              onCheckedChange={(checked) => handleUpdate({ offerReceived: checked })}
              disabled={saving}
            />
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="text-sm font-medium mb-4">Social Notifications</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="social-activity">Social Activity</Label>
            <Switch
              id="social-activity"
              checked={notifications?.socialActivity ?? true}
              onCheckedChange={(checked) => handleUpdate({ socialActivity: checked })}
              disabled={saving}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="new-follower">New Followers</Label>
            <Switch
              id="new-follower"
              checked={notifications?.newFollower ?? true}
              onCheckedChange={(checked) => handleUpdate({ newFollower: checked })}
              disabled={saving}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="post-comment">Post Comments</Label>
            <Switch
              id="post-comment"
              checked={notifications?.postComment ?? true}
              onCheckedChange={(checked) => handleUpdate({ postComment: checked })}
              disabled={saving}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="post-like">Post Likes</Label>
            <Switch
              id="post-like"
              checked={notifications?.postLike ?? true}
              onCheckedChange={(checked) => handleUpdate({ postLike: checked })}
              disabled={saving}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="mention">Mentions</Label>
            <Switch
              id="mention"
              checked={notifications?.mention ?? true}
              onCheckedChange={(checked) => handleUpdate({ mention: checked })}
              disabled={saving}
            />
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="text-sm font-medium mb-4">System Notifications</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="system-updates">System Updates</Label>
            <Switch
              id="system-updates"
              checked={notifications?.systemUpdates ?? true}
              onCheckedChange={(checked) => handleUpdate({ systemUpdates: checked })}
              disabled={saving}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="security-alerts">Security Alerts</Label>
            <Switch
              id="security-alerts"
              checked={notifications?.securityAlerts ?? true}
              onCheckedChange={(checked) => handleUpdate({ securityAlerts: checked })}
              disabled={saving}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
