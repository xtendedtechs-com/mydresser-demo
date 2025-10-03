import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Award, Star, Lock, CheckCircle2 } from "lucide-react";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  tier: "bronze" | "silver" | "gold" | "platinum";
  unlocked: boolean;
  progress: number;
  maxProgress: number;
  points: number;
  unlockedDate?: string;
}

export const AchievementsBadges = () => {
  const achievements: Achievement[] = [
    {
      id: "1",
      title: "Style Starter",
      description: "Add your first 10 items to your wardrobe",
      icon: "👕",
      tier: "bronze",
      unlocked: true,
      progress: 10,
      maxProgress: 10,
      points: 50,
      unlockedDate: "2 days ago",
    },
    {
      id: "2",
      title: "Outfit Creator",
      description: "Create 25 unique outfits",
      icon: "👗",
      tier: "silver",
      unlocked: true,
      progress: 25,
      maxProgress: 25,
      points: 100,
      unlockedDate: "5 days ago",
    },
    {
      id: "3",
      title: "Fashion Maven",
      description: "Receive 100 likes on your outfits",
      icon: "💎",
      tier: "gold",
      unlocked: true,
      progress: 100,
      maxProgress: 100,
      points: 250,
      unlockedDate: "1 week ago",
    },
    {
      id: "4",
      title: "Style Icon",
      description: "Maintain a 30-day styling streak",
      icon: "👑",
      tier: "platinum",
      unlocked: false,
      progress: 22,
      maxProgress: 30,
      points: 500,
    },
    {
      id: "5",
      title: "Eco Warrior",
      description: "Save 100kg CO₂ through sustainable choices",
      icon: "🌱",
      tier: "gold",
      unlocked: false,
      progress: 68,
      maxProgress: 100,
      points: 300,
    },
    {
      id: "6",
      title: "Community Leader",
      description: "Help 50 users with style advice",
      icon: "🤝",
      tier: "silver",
      unlocked: false,
      progress: 12,
      maxProgress: 50,
      points: 150,
    },
    {
      id: "7",
      title: "Challenge Master",
      description: "Complete 20 style challenges",
      icon: "🏆",
      tier: "gold",
      unlocked: false,
      progress: 8,
      maxProgress: 20,
      points: 200,
    },
    {
      id: "8",
      title: "Wardrobe Wizard",
      description: "Organize 100 items with AI assistance",
      icon: "✨",
      tier: "bronze",
      unlocked: false,
      progress: 45,
      maxProgress: 100,
      points: 75,
    },
  ];

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "bronze":
        return "bg-amber-700/10 text-amber-700 dark:text-amber-400 border-amber-700/20";
      case "silver":
        return "bg-gray-500/10 text-gray-700 dark:text-gray-300 border-gray-500/20";
      case "gold":
        return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20";
      case "platinum":
        return "bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-500/20";
      default:
        return "bg-muted";
    }
  };

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const totalPoints = achievements
    .filter((a) => a.unlocked)
    .reduce((sum, a) => sum + a.points, 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Award className="h-5 w-5 text-primary" />
          <CardTitle>Achievements & Badges</CardTitle>
        </div>
        <CardDescription>
          Unlock badges and earn points by completing milestones
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Award className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Unlocked</span>
            </div>
            <p className="text-2xl font-bold">
              {unlockedCount}/{achievements.length}
            </p>
            <Progress
              value={(unlockedCount / achievements.length) * 100}
              className="h-1 mt-2"
            />
          </div>

          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Star className="h-4 w-4 text-primary fill-current" />
              <span className="text-sm font-medium">Total Points</span>
            </div>
            <p className="text-2xl font-bold">{totalPoints.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">
              from achievements
            </p>
          </div>
        </div>

        {/* Achievements Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`p-4 border rounded-lg transition-all ${
                achievement.unlocked
                  ? "bg-muted/30"
                  : "opacity-60 hover:opacity-80"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="relative">
                  <div className="text-3xl">{achievement.icon}</div>
                  {achievement.unlocked ? (
                    <CheckCircle2 className="absolute -bottom-1 -right-1 h-4 w-4 text-green-600 bg-background rounded-full" />
                  ) : (
                    <Lock className="absolute -bottom-1 -right-1 h-4 w-4 text-muted-foreground bg-background rounded-full" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-sm truncate">
                      {achievement.title}
                    </h4>
                    <Badge
                      variant="outline"
                      className={`text-xs ${getTierColor(achievement.tier)}`}
                    >
                      {achievement.tier}
                    </Badge>
                  </div>

                  <p className="text-xs text-muted-foreground mb-2">
                    {achievement.description}
                  </p>

                  {achievement.unlocked ? (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-green-600 font-medium">
                        Unlocked {achievement.unlockedDate}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        +{achievement.points} pts
                      </Badge>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">
                          {achievement.progress}/{achievement.maxProgress}
                        </span>
                      </div>
                      <Progress
                        value={(achievement.progress / achievement.maxProgress) * 100}
                        className="h-1.5"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
