import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Clock, Users, Target, CheckCircle2, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: "daily" | "weekly" | "seasonal";
  difficulty: "easy" | "medium" | "hard";
  points: number;
  participants: number;
  timeLeft: string;
  progress: number;
  completed: boolean;
  reward: string;
}

export const StyleChallengeCard = () => {
  const { toast } = useToast();
  const [challenges] = useState<Challenge[]>([
    {
      id: "1",
      title: "Monochrome Monday",
      description: "Create an outfit using only one color palette",
      type: "daily",
      difficulty: "easy",
      points: 50,
      participants: 234,
      timeLeft: "6h 23m",
      progress: 0,
      completed: false,
      reward: "Monochrome Master Badge",
    },
    {
      id: "2",
      title: "Vintage Remix",
      description: "Style a vintage piece with modern items",
      type: "weekly",
      difficulty: "medium",
      points: 150,
      participants: 892,
      timeLeft: "3d 12h",
      progress: 60,
      completed: false,
      reward: "Vintage Virtuoso Badge + 150 coins",
    },
    {
      id: "3",
      title: "Capsule Wardrobe",
      description: "Create 7 outfits using only 15 items",
      type: "weekly",
      difficulty: "hard",
      points: 300,
      participants: 567,
      timeLeft: "5d 8h",
      progress: 30,
      completed: false,
      reward: "Minimalist Master Badge + Premium Feature",
    },
    {
      id: "4",
      title: "Sustainable Stylist",
      description: "Create 3 outfits using only secondhand items",
      type: "daily",
      difficulty: "medium",
      points: 100,
      participants: 445,
      timeLeft: "14h 45m",
      progress: 100,
      completed: true,
      reward: "Eco Warrior Badge",
    },
  ]);

  const handleJoinChallenge = (challengeId: string) => {
    toast({
      title: "Challenge Joined!",
      description: "Good luck! Complete the challenge to earn rewards.",
    });
  };

  const handleViewDetails = (challengeId: string) => {
    toast({
      title: "Challenge Details",
      description: "Opening challenge information...",
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-500/10 text-green-700 dark:text-green-300";
      case "medium":
        return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-300";
      case "hard":
        return "bg-red-500/10 text-red-700 dark:text-red-300";
      default:
        return "bg-muted";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "daily":
        return "bg-blue-500/10 text-blue-700 dark:text-blue-300";
      case "weekly":
        return "bg-purple-500/10 text-purple-700 dark:text-purple-300";
      case "seasonal":
        return "bg-orange-500/10 text-orange-700 dark:text-orange-300";
      default:
        return "bg-muted";
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          <CardTitle>Style Challenges</CardTitle>
        </div>
        <CardDescription>
          Complete challenges to earn points, badges, and rewards
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {challenges.map((challenge) => (
            <Card
              key={challenge.id}
              className={`${
                challenge.completed ? "bg-muted/50" : ""
              } transition-colors`}
            >
              <CardContent className="p-4">
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg">{challenge.title}</h3>
                        {challenge.completed && (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {challenge.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-primary">
                      <Star className="h-4 w-4 fill-current" />
                      <span className="font-bold">{challenge.points}</span>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2">
                    <Badge className={getTypeColor(challenge.type)}>
                      {challenge.type}
                    </Badge>
                    <Badge className={getDifficultyColor(challenge.difficulty)}>
                      {challenge.difficulty}
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {challenge.participants}
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {challenge.timeLeft}
                    </Badge>
                  </div>

                  {/* Progress */}
                  {!challenge.completed && challenge.progress > 0 && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{challenge.progress}%</span>
                      </div>
                      <Progress value={challenge.progress} className="h-2" />
                    </div>
                  )}

                  {/* Reward */}
                  <div className="flex items-center gap-2 p-2 bg-primary/5 rounded">
                    <Trophy className="h-4 w-4 text-primary flex-shrink-0" />
                    <p className="text-xs font-medium">Reward: {challenge.reward}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {challenge.completed ? (
                      <Button variant="outline" className="flex-1" disabled>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Completed
                      </Button>
                    ) : challenge.progress > 0 ? (
                      <>
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => handleViewDetails(challenge.id)}
                        >
                          Continue
                        </Button>
                        <Button
                          className="flex-1"
                          onClick={() => handleViewDetails(challenge.id)}
                        >
                          <Target className="mr-2 h-4 w-4" />
                          View Progress
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => handleViewDetails(challenge.id)}
                        >
                          Details
                        </Button>
                        <Button
                          className="flex-1"
                          onClick={() => handleJoinChallenge(challenge.id)}
                        >
                          <Trophy className="mr-2 h-4 w-4" />
                          Join Challenge
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
