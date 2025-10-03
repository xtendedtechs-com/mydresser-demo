import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Medal, Crown, TrendingUp, Star } from "lucide-react";

interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  avatar: string;
  points: number;
  badges: number;
  streak: number;
  trend: "up" | "down" | "same";
}

export const LeaderboardCard = () => {
  const weeklyLeaders: LeaderboardEntry[] = [
    {
      rank: 1,
      userId: "1",
      name: "Sarah Johnson",
      avatar: "/placeholder.svg",
      points: 2450,
      badges: 28,
      streak: 15,
      trend: "up",
    },
    {
      rank: 2,
      userId: "2",
      name: "Alex Chen",
      avatar: "/placeholder.svg",
      points: 2280,
      badges: 24,
      streak: 12,
      trend: "same",
    },
    {
      rank: 3,
      userId: "3",
      name: "Emma Davis",
      avatar: "/placeholder.svg",
      points: 2150,
      badges: 22,
      streak: 10,
      trend: "up",
    },
    {
      rank: 4,
      userId: "4",
      name: "Michael Brown",
      avatar: "/placeholder.svg",
      points: 1980,
      badges: 20,
      streak: 8,
      trend: "down",
    },
    {
      rank: 5,
      userId: "5",
      name: "You",
      avatar: "/placeholder.svg",
      points: 1820,
      badges: 18,
      streak: 7,
      trend: "up",
    },
  ];

  const allTimeLeaders: LeaderboardEntry[] = [
    {
      rank: 1,
      userId: "1",
      name: "Alex Chen",
      avatar: "/placeholder.svg",
      points: 15420,
      badges: 85,
      streak: 45,
      trend: "up",
    },
    {
      rank: 2,
      userId: "2",
      name: "Sarah Johnson",
      avatar: "/placeholder.svg",
      points: 14230,
      badges: 78,
      streak: 38,
      trend: "up",
    },
    {
      rank: 3,
      userId: "3",
      name: "Emma Davis",
      avatar: "/placeholder.svg",
      points: 13150,
      badges: 72,
      streak: 35,
      trend: "same",
    },
  ];

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Medal className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="font-bold text-muted-foreground">{rank}</span>;
    }
  };

  const getTrendIcon = (trend: string) => {
    if (trend === "up") {
      return <TrendingUp className="h-4 w-4 text-green-600" />;
    }
    return null;
  };

  const renderLeaderboard = (leaders: LeaderboardEntry[]) => (
    <div className="space-y-2">
      {leaders.map((entry) => (
        <div
          key={entry.userId}
          className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
            entry.name === "You"
              ? "bg-primary/10 border-2 border-primary"
              : "hover:bg-muted/50"
          }`}
        >
          {/* Rank */}
          <div className="w-8 flex items-center justify-center">
            {getRankIcon(entry.rank)}
          </div>

          {/* Avatar */}
          <Avatar className="h-10 w-10">
            <AvatarImage src={entry.avatar} alt={entry.name} />
            <AvatarFallback>{entry.name.charAt(0)}</AvatarFallback>
          </Avatar>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-semibold truncate">{entry.name}</p>
              {entry.name === "You" && (
                <Badge variant="secondary" className="text-xs">
                  You
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Trophy className="h-3 w-3" />
                {entry.badges}
              </span>
              <span className="flex items-center gap-1">
                🔥 {entry.streak} day streak
              </span>
            </div>
          </div>

          {/* Points */}
          <div className="text-right">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-primary fill-current" />
              <span className="font-bold text-lg">{entry.points.toLocaleString()}</span>
            </div>
            {getTrendIcon(entry.trend)}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          <CardTitle>Leaderboard</CardTitle>
        </div>
        <CardDescription>
          Compete with other stylists and climb the ranks
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="weekly">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="weekly">This Week</TabsTrigger>
            <TabsTrigger value="alltime">All Time</TabsTrigger>
          </TabsList>

          <TabsContent value="weekly" className="space-y-4">
            {renderLeaderboard(weeklyLeaders)}
          </TabsContent>

          <TabsContent value="alltime" className="space-y-4">
            {renderLeaderboard(allTimeLeaders)}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
