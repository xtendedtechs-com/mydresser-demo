import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useSettings } from '@/hooks/useSettings';
import type { PrivacySettings } from '@/types/settings';

export const PrivacySettingsPanel = () => {
  const { privacy, updateFeatureSettings, saving } = useSettings();

  const handleUpdate = (updates: Partial<PrivacySettings>) => {
    updateFeatureSettings('privacy', updates);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Label htmlFor="profile-public">Public Profile</Label>
          <p className="text-sm text-muted-foreground">Allow others to view your profile</p>
        </div>
        <Switch
          id="profile-public"
          checked={privacy?.profilePublic || false}
          onCheckedChange={(checked) => handleUpdate({ profilePublic: checked })}
          disabled={saving}
        />
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="show-wardrobe">Show Wardrobe Size</Label>
        <Switch
          id="show-wardrobe"
          checked={privacy?.showWardrobeSize ?? true}
          onCheckedChange={(checked) => handleUpdate({ showWardrobeSize: checked })}
          disabled={saving}
        />
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="show-followers">Show Follower Count</Label>
        <Switch
          id="show-followers"
          checked={privacy?.showFollowerCount ?? true}
          onCheckedChange={(checked) => handleUpdate({ showFollowerCount: checked })}
          disabled={saving}
        />
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="show-activity">Show Activity Status</Label>
        <Switch
          id="show-activity"
          checked={privacy?.showActivity || false}
          onCheckedChange={(checked) => handleUpdate({ showActivity: checked })}
          disabled={saving}
        />
      </div>

      <div>
        <Label>Who Can Message You</Label>
        <Select
          value={privacy?.allowMessages || 'following'}
          onValueChange={(value) => handleUpdate({ allowMessages: value as 'everyone' | 'following' | 'none' })}
          disabled={saving}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="everyone">Everyone</SelectItem>
            <SelectItem value="following">People I Follow</SelectItem>
            <SelectItem value="none">No One</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <Label htmlFor="data-sharing">Data Sharing</Label>
          <p className="text-sm text-muted-foreground">Share anonymized data for research</p>
        </div>
        <Switch
          id="data-sharing"
          checked={privacy?.dataSharing || false}
          onCheckedChange={(checked) => handleUpdate({ dataSharing: checked })}
          disabled={saving}
        />
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="analytics">Analytics Opt-In</Label>
        <Switch
          id="analytics"
          checked={privacy?.analyticsOptIn ?? true}
          onCheckedChange={(checked) => handleUpdate({ analyticsOptIn: checked })}
          disabled={saving}
        />
      </div>
    </div>
  );
};
