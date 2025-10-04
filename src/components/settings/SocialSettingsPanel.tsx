import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { useSettings } from "@/hooks/useSettings";

const SocialSettingsPanel = () => {
  const { settings, updateSettings, isLoading } = useSettings();

  const socialSettings = settings?.social || {};

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

  if (isLoading) {
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
              checked={socialSettings.show_in_feed !== false}
              onCheckedChange={(checked) => handleToggle('show_in_feed', checked)}
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
              checked={socialSettings.show_following_activity !== false}
              onCheckedChange={(checked) => handleToggle('show_following_activity', checked)}
            />
          </div>

          <div className="space-y-2">
            <Label>Default Post Visibility</Label>
            <Select
              value={socialSettings.default_post_visibility || 'public'}
              onValueChange={(value) => handleSelectChange('default_post_visibility', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="followers">Followers Only</SelectItem>
                <SelectItem value="private">Private</SelectItem>
              </SelectContent>
            </Select>
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
              checked={socialSettings.allow_comments !== false}
              onCheckedChange={(checked) => handleToggle('allow_comments', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Allow Likes</Label>
              <p className="text-sm text-muted-foreground">
                Let others like your posts
              </p>
            </div>
            <Switch
              checked={socialSettings.allow_likes !== false}
              onCheckedChange={(checked) => handleToggle('allow_likes', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Allow Sharing</Label>
              <p className="text-sm text-muted-foreground">
                Let others share your posts
              </p>
            </div>
            <Switch
              checked={socialSettings.allow_sharing !== false}
              onCheckedChange={(checked) => handleToggle('allow_sharing', checked)}
            />
          </div>

          <div className="space-y-2">
            <Label>Who Can Tag You</Label>
            <Select
              value={socialSettings.who_can_tag || 'everyone'}
              onValueChange={(value) => handleSelectChange('who_can_tag', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="everyone">Everyone</SelectItem>
                <SelectItem value="followers">Followers Only</SelectItem>
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
              <Label>Show Wardrobe Count</Label>
              <p className="text-sm text-muted-foreground">
                Display number of items in your wardrobe
              </p>
            </div>
            <Switch
              checked={socialSettings.show_wardrobe_count !== false}
              onCheckedChange={(checked) => handleToggle('show_wardrobe_count', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Show Follower Count</Label>
              <p className="text-sm text-muted-foreground">
                Display your follower count publicly
              </p>
            </div>
            <Switch
              checked={socialSettings.show_follower_count !== false}
              onCheckedChange={(checked) => handleToggle('show_follower_count', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Show Style Preferences</Label>
              <p className="text-sm text-muted-foreground">
                Display your style tags on your profile
              </p>
            </div>
            <Switch
              checked={socialSettings.show_style_preferences !== false}
              onCheckedChange={(checked) => handleToggle('show_style_preferences', checked)}
            />
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SocialSettingsPanel;
