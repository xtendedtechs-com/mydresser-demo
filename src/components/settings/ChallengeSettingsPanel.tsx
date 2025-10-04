import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { useSettings } from "@/hooks/useSettings";

const ChallengeSettingsPanel = () => {
  const { settings, updateSettings, loading } = useSettings();

  const challengeSettings = settings?.challenges;

  const handleToggle = (key: string, value: boolean) => {
    updateSettings({
      challenges: { ...challengeSettings, [key]: value }
    });
  };

  if (loading) {
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
              checked={challengeSettings?.participateInCommunity !== false}
              onCheckedChange={(checked) => handleToggle('participateInCommunity', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Join Daily Challenges</Label>
              <p className="text-sm text-muted-foreground">
                Participate in daily style challenges
              </p>
            </div>
            <Switch
              checked={challengeSettings?.participateInDaily !== false}
              onCheckedChange={(checked) => handleToggle('participateInDaily', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Join Weekly Challenges</Label>
              <p className="text-sm text-muted-foreground">
                Participate in weekly competitions
              </p>
            </div>
            <Switch
              checked={challengeSettings?.participateInWeekly !== false}
              onCheckedChange={(checked) => handleToggle('participateInWeekly', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto-Accept Challenges</Label>
              <p className="text-sm text-muted-foreground">
                Automatically join new challenges
              </p>
            </div>
            <Switch
              checked={challengeSettings?.autoAcceptChallenges === true}
              onCheckedChange={(checked) => handleToggle('autoAcceptChallenges', checked)}
            />
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
              checked={challengeSettings?.notifyOnNewChallenges !== false}
              onCheckedChange={(checked) => handleToggle('notifyOnNewChallenges', checked)}
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
              checked={challengeSettings?.showOnLeaderboard !== false}
              onCheckedChange={(checked) => handleToggle('showOnLeaderboard', checked)}
            />
          </div>

        </Card>
      </div>
    </div>
  );
};

export default ChallengeSettingsPanel;
