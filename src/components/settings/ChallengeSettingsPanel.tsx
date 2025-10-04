import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { useSettings } from "@/hooks/useSettings";

const ChallengeSettingsPanel = () => {
  const { settings, updateSettings, isLoading } = useSettings();

  const challengeSettings = settings?.challenges || {};

  const handleToggle = (key: string, value: boolean) => {
    updateSettings({
      challenges: { ...challengeSettings, [key]: value }
    });
  };

  const handleSelectChange = (key: string, value: string) => {
    updateSettings({
      challenges: { ...challengeSettings, [key]: value }
    });
  };

  if (isLoading) {
    return <div className="text-muted-foreground">Loading settings...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Challenge Participation</h3>
        <Card className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Challenges</Label>
              <p className="text-sm text-muted-foreground">
                Participate in style challenges and competitions
              </p>
            </div>
            <Switch
              checked={challengeSettings.enable_challenges !== false}
              onCheckedChange={(checked) => handleToggle('enable_challenges', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto-Join Challenges</Label>
              <p className="text-sm text-muted-foreground">
                Automatically join challenges matching your style
              </p>
            </div>
            <Switch
              checked={challengeSettings.auto_join_challenges === true}
              onCheckedChange={(checked) => handleToggle('auto_join_challenges', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Show on Profile</Label>
              <p className="text-sm text-muted-foreground">
                Display your badges and achievements on your profile
              </p>
            </div>
            <Switch
              checked={challengeSettings.show_badges_on_profile !== false}
              onCheckedChange={(checked) => handleToggle('show_badges_on_profile', checked)}
            />
          </div>

          <div className="space-y-2">
            <Label>Challenge Difficulty</Label>
            <Select
              value={challengeSettings.preferred_difficulty || 'all'}
              onValueChange={(value) => handleSelectChange('preferred_difficulty', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="easy">Easy Only</SelectItem>
                <SelectItem value="medium">Medium Only</SelectItem>
                <SelectItem value="hard">Hard Only</SelectItem>
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
              <Label>New Challenge Alerts</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when new challenges are available
              </p>
            </div>
            <Switch
              checked={challengeSettings.notify_new_challenges !== false}
              onCheckedChange={(checked) => handleToggle('notify_new_challenges', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Challenge Reminders</Label>
              <p className="text-sm text-muted-foreground">
                Remind me about ongoing challenges
              </p>
            </div>
            <Switch
              checked={challengeSettings.challenge_reminders === true}
              onCheckedChange={(checked) => handleToggle('challenge_reminders', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Achievement Unlocks</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when you earn new badges
              </p>
            </div>
            <Switch
              checked={challengeSettings.notify_achievements !== false}
              onCheckedChange={(checked) => handleToggle('notify_achievements', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Leaderboard Updates</Label>
              <p className="text-sm text-muted-foreground">
                Get notified about leaderboard rankings
              </p>
            </div>
            <Switch
              checked={challengeSettings.notify_leaderboard === true}
              onCheckedChange={(checked) => handleToggle('notify_leaderboard', checked)}
            />
          </div>
        </Card>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Social & Competition</h3>
        <Card className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Show in Leaderboards</Label>
              <p className="text-sm text-muted-foreground">
                Display your ranking in public leaderboards
              </p>
            </div>
            <Switch
              checked={challengeSettings.show_in_leaderboards !== false}
              onCheckedChange={(checked) => handleToggle('show_in_leaderboards', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Allow Challenge Invites</Label>
              <p className="text-sm text-muted-foreground">
                Let friends invite you to challenges
              </p>
            </div>
            <Switch
              checked={challengeSettings.allow_challenge_invites !== false}
              onCheckedChange={(checked) => handleToggle('allow_challenge_invites', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Share Challenge Progress</Label>
              <p className="text-sm text-muted-foreground">
                Post challenge achievements to your feed
              </p>
            </div>
            <Switch
              checked={challengeSettings.share_challenge_progress === true}
              onCheckedChange={(checked) => handleToggle('share_challenge_progress', checked)}
            />
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ChallengeSettingsPanel;
