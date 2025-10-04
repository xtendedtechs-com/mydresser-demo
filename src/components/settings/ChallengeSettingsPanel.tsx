import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Trophy, Bell, Users, Target } from "lucide-react";
import { useState } from "react";

const ChallengeSettingsPanel = () => {
  const [notifyNewChallenges, setNotifyNewChallenges] = useState(true);
  const [notifyCompletions, setNotifyCompletions] = useState(true);
  const [showLeaderboard, setShowLeaderboard] = useState(true);
  const [autoJoin, setAutoJoin] = useState(false);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5" />
          Challenge Preferences
        </CardTitle>
        <CardDescription>
          Manage your style challenge settings and notifications
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="notify-new" className="flex items-center gap-2">
                <Bell className="w-4 h-4" />
                New Challenge Notifications
              </Label>
              <p className="text-sm text-muted-foreground">
                Get notified when new style challenges are available
              </p>
            </div>
            <Switch
              id="notify-new"
              checked={notifyNewChallenges}
              onCheckedChange={setNotifyNewChallenges}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="notify-complete" className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                Completion Notifications
              </Label>
              <p className="text-sm text-muted-foreground">
                Get notified when you complete a challenge
              </p>
            </div>
            <Switch
              id="notify-complete"
              checked={notifyCompletions}
              onCheckedChange={setNotifyCompletions}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="leaderboard" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Show on Leaderboard
              </Label>
              <p className="text-sm text-muted-foreground">
                Display your progress on public leaderboards
              </p>
            </div>
            <Switch
              id="leaderboard"
              checked={showLeaderboard}
              onCheckedChange={setShowLeaderboard}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-join">Auto-Join Challenges</Label>
              <p className="text-sm text-muted-foreground">
                Automatically join challenges that match your preferences
              </p>
            </div>
            <Switch
              id="auto-join"
              checked={autoJoin}
              onCheckedChange={setAutoJoin}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChallengeSettingsPanel;
