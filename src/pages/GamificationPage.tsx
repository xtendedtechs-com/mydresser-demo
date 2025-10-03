import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StyleChallengeCard } from "@/components/StyleChallengeCard";
import { LeaderboardCard } from "@/components/LeaderboardCard";
import { AchievementsBadges } from "@/components/AchievementsBadges";
import { Trophy, Target, Award } from "lucide-react";

export default function GamificationPage() {
  return (
    <div className="container mx-auto p-4 pb-20 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Challenges & Achievements</h1>
        <p className="text-muted-foreground">
          Complete challenges, earn badges, and compete on the leaderboard
        </p>
      </div>

      <Tabs defaultValue="challenges" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="challenges" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            <span className="hidden sm:inline">Challenges</span>
          </TabsTrigger>
          <TabsTrigger value="achievements" className="flex items-center gap-2">
            <Award className="h-4 w-4" />
            <span className="hidden sm:inline">Achievements</span>
          </TabsTrigger>
          <TabsTrigger value="leaderboard" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            <span className="hidden sm:inline">Leaderboard</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="challenges" className="space-y-6">
          <StyleChallengeCard />
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6">
          <AchievementsBadges />
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-6">
          <LeaderboardCard />
        </TabsContent>
      </Tabs>
    </div>
  );
}
