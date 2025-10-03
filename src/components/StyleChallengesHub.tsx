import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Target, Calendar, TrendingUp, Users, Award } from "lucide-react";
import { toast } from "sonner";

interface Challenge {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  reward: number;
  participants: number;
  deadline: string;
  progress?: number;
  status: 'active' | 'completed' | 'available';
}

export const StyleChallengesHub = () => {
  const [challenges] = useState<Challenge[]>([
    {
      id: "1",
      title: "Monochrome Master",
      description: "Create 3 outfits using only one color palette",
      difficulty: 'easy',
      reward: 100,
      participants: 234,
      deadline: "3 days left",
      progress: 33,
      status: 'active'
    },
    {
      id: "2",
      title: "Capsule Wardrobe Week",
      description: "Create 7 different outfits using only 10 items",
      difficulty: 'medium',
      reward: 250,
      participants: 156,
      deadline: "5 days left",
      progress: 14,
      status: 'active'
    },
    {
      id: "3",
      title: "Sustainable Style",
      description: "Style outfits using only second-hand or sustainable items",
      difficulty: 'medium',
      reward: 200,
      participants: 189,
      deadline: "1 week left",
      status: 'available'
    },
    {
      id: "4",
      title: "Trend Forecaster",
      description: "Predict and create next season's trend-setting outfit",
      difficulty: 'hard',
      reward: 500,
      participants: 78,
      deadline: "2 weeks left",
      status: 'available'
    }
  ]);

  const [achievements] = useState([
    { id: 1, name: "First Challenge", icon: Trophy, unlocked: true },
    { id: 2, name: "5 Challenges", icon: Award, unlocked: true },
    { id: 3, name: "10 Challenges", icon: Trophy, unlocked: false },
    { id: 4, name: "Style Innovator", icon: TrendingUp, unlocked: false }
  ]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'hard': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-500';
      case 'completed': return 'bg-green-500';
      case 'available': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const joinChallenge = (challengeId: string) => {
    toast.success("Challenge joined! Start creating your outfit.");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Style Challenges
          </CardTitle>
          <CardDescription>
            Compete with the community and earn rewards
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="active">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="available">Available</TabsTrigger>
              <TabsTrigger value="achievements">Achievements</TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="space-y-4 mt-4">
              {challenges.filter(c => c.status === 'active').map((challenge) => (
                <Card key={challenge.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">{challenge.title}</h3>
                        <p className="text-sm text-text-muted mb-3">{challenge.description}</p>
                        <div className="flex items-center gap-2 mb-3">
                          <Badge className={getDifficultyColor(challenge.difficulty) + ' text-white'}>
                            {challenge.difficulty}
                          </Badge>
                          <Badge variant="outline">
                            <Trophy className="h-3 w-3 mr-1" />
                            {challenge.reward} pts
                          </Badge>
                          <Badge variant="outline">
                            <Users className="h-3 w-3 mr-1" />
                            {challenge.participants}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {challenge.progress !== undefined && (
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-text-muted">Progress</span>
                          <span className="font-medium">{challenge.progress}%</span>
                        </div>
                        <Progress value={challenge.progress} />
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-sm text-text-muted">
                        <Calendar className="h-3 w-3" />
                        <span>{challenge.deadline}</span>
                      </div>
                      <Button size="sm">Continue</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="available" className="space-y-4 mt-4">
              {challenges.filter(c => c.status === 'available').map((challenge) => (
                <Card key={challenge.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">{challenge.title}</h3>
                        <p className="text-sm text-text-muted mb-3">{challenge.description}</p>
                        <div className="flex items-center gap-2 mb-3">
                          <Badge className={getDifficultyColor(challenge.difficulty) + ' text-white'}>
                            {challenge.difficulty}
                          </Badge>
                          <Badge variant="outline">
                            <Trophy className="h-3 w-3 mr-1" />
                            {challenge.reward} pts
                          </Badge>
                          <Badge variant="outline">
                            <Users className="h-3 w-3 mr-1" />
                            {challenge.participants}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-sm text-text-muted">
                        <Calendar className="h-3 w-3" />
                        <span>{challenge.deadline}</span>
                      </div>
                      <Button size="sm" onClick={() => joinChallenge(challenge.id)}>
                        <Target className="h-4 w-4 mr-1" />
                        Join Challenge
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="achievements" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {achievements.map((achievement) => (
                  <Card key={achievement.id} className={achievement.unlocked ? '' : 'opacity-50'}>
                    <CardContent className="pt-6 text-center">
                      <achievement.icon className={`h-12 w-12 mx-auto mb-3 ${achievement.unlocked ? 'text-primary' : 'text-text-muted'}`} />
                      <h3 className="font-semibold text-sm mb-1">{achievement.name}</h3>
                      {achievement.unlocked && (
                        <Badge variant="secondary" className="mt-2">Unlocked</Badge>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
