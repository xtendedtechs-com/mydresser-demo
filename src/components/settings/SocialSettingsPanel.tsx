import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { useSettings } from "@/hooks/useSettings";

const SocialSettingsPanel = () => {
  const { settings, updateSettings, loading } = useSettings();

  const socialSettings = settings?.social;

  const handleToggle = (key: string, value: boolean) => {
    updateSettings({
      social: { ...socialSettings, [key]: value }
    });
  };

  const handleSelectChange = (key: string, value: string) => {
    updateSettings({
      social: { ...socialSettings, [key]: value }
    });
  };

  if (loading) {
    return <div className="text-muted-foreground">Loading settings...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Feed & Discovery</h3>
        <Card className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Show in Discovery Feed</Label>
              <p className="text-sm text-muted-foreground">
                Allow others to discover your posts in the main feed
              </p>
            </div>
            <Switch
              checked={socialSettings?.shareToFeed !== false}
              onCheckedChange={(checked) => handleToggle('shareToFeed', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Show Following Activity</Label>
              <p className="text-sm text-muted-foreground">
                Display posts from people you follow
              </p>
            </div>
            <Switch
              checked={socialSettings?.profilePublic !== false}
              onCheckedChange={(checked) => handleToggle('profilePublic', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto-Share Outfits</Label>
              <p className="text-sm text-muted-foreground">
                Automatically share new outfits to feed
              </p>
            </div>
            <Switch
              checked={socialSettings?.autoShareOutfits === true}
              onCheckedChange={(checked) => handleToggle('autoShareOutfits', checked)}
            />
          </div>
        </Card>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Interactions</h3>
        <Card className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Allow Comments</Label>
              <p className="text-sm text-muted-foreground">
                Let others comment on your posts
              </p>
            </div>
            <Switch
              checked={socialSettings?.allowComments !== false}
              onCheckedChange={(checked) => handleToggle('allowComments', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Allow Reactions</Label>
              <p className="text-sm text-muted-foreground">
                Let others react to your posts
              </p>
            </div>
            <Switch
              checked={socialSettings?.allowReactions !== false}
              onCheckedChange={(checked) => handleToggle('allowReactions', checked)}
            />
          </div>

          <div className="space-y-2">
            <Label>Who Can Message You</Label>
            <Select
              value={socialSettings?.allowMessages || 'following'}
              onValueChange={(value) => handleSelectChange('allowMessages', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="everyone">Everyone</SelectItem>
                <SelectItem value="following">Followers Only</SelectItem>
                <SelectItem value="none">No One</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Profile Visibility</h3>
        <Card className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Show Follower Count</Label>
              <p className="text-sm text-muted-foreground">
                Display your follower count publicly
              </p>
            </div>
            <Switch
              checked={socialSettings?.showFollowerCount !== false}
              onCheckedChange={(checked) => handleToggle('showFollowerCount', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Show Following Count</Label>
              <p className="text-sm text-muted-foreground">
                Display who you're following
              </p>
            </div>
            <Switch
              checked={socialSettings?.showFollowingCount !== false}
              onCheckedChange={(checked) => handleToggle('showFollowingCount', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Show Style Score</Label>
              <p className="text-sm text-muted-foreground">
                Display your style score on profile
              </p>
            </div>
            <Switch
              checked={socialSettings?.showStyleScore !== false}
              onCheckedChange={(checked) => handleToggle('showStyleScore', checked)}
            />
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SocialSettingsPanel;
