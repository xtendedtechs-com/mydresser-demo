import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Trophy, 
  Target, 
  TrendingUp, 
  Clock, 
  Users, 
  Sparkles,
  Award,
  Zap,
  CheckCircle2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'community';
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  progress: number;
  total: number;
  deadline?: string;
  participants?: number;
  status: 'active' | 'completed' | 'expired';
  reward?: string;
}

const AIStyleChallenges = () => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [userPoints, setUserPoints] = useState(0);
  const [userRank, setUserRank] = useState(0);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadChallenges();
    loadUserStats();
  }, []);

  const loadChallenges = async () => {
    setLoading(true);
    try {
      // Mock challenges - in production, these would come from AI generation
      const mockChallenges: Challenge[] = [
        {
          id: '1',
          title: 'Color Harmony Master',
          description: 'Create 5 outfits using complementary color schemes',
          type: 'daily',
          difficulty: 'medium',
          points: 100,
          progress: 2,
          total: 5,
          deadline: new Date(Date.now() + 86400000).toISOString(),
          status: 'active',
          reward: 'Color Expert Badge'
        },
        {
          id: '2',
          title: 'Sustainable Style Week',
          description: 'Wear only second-hand or sustainable items for 7 days',
          type: 'weekly',
          difficulty: 'hard',
          points: 250,
          progress: 3,
          total: 7,
          deadline: new Date(Date.now() + 604800000).toISOString(),
          status: 'active',
          reward: 'Eco Warrior Badge'
        },
        {
          id: '3',
          title: 'Minimalist Challenge',
          description: 'Create a capsule wardrobe with maximum 20 pieces',
          type: 'weekly',
          difficulty: 'medium',
          points: 150,
          progress: 12,
          total: 20,
          deadline: new Date(Date.now() + 604800000).toISOString(),
          status: 'active'
        },
        {
          id: '4',
          title: 'Global Style Exchange',
          description: 'Get outfit inspiration from 5 different countries',
          type: 'community',
          difficulty: 'easy',
          points: 75,
          progress: 0,
          total: 5,
          participants: 234,
          status: 'active',
          reward: 'World Traveler Badge'
        },
        {
          id: '5',
          title: 'Mix & Match Pro',
          description: 'Create 10 unique outfits using only 5 items',
          type: 'daily',
          difficulty: 'hard',
          points: 200,
          progress: 10,
          total: 10,
          status: 'completed',
          reward: 'Style Innovator Badge'
        }
      ];

      setChallenges(mockChallenges);
    } catch (error) {
      console.error('Error loading challenges:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserStats = async () => {
    try {
      // Mock user stats - in production, fetch from database
      setUserPoints(1250);
      setUserRank(42);
    } catch (error) {
      console.error('Error loading user stats:', error);
    }
  };

  const joinChallenge = async (challengeId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // In production, save challenge participation to database
      toast({
        title: "Challenge joined!",
        description: "Good luck! Track your progress here.",
      });

      loadChallenges();
    } catch (error) {
      console.error('Error joining challenge:', error);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'medium': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'hard': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const ChallengeCard = ({ challenge }: { challenge: Challenge }) => {
    const progressPercent = (challenge.progress / challenge.total) * 100;
    const isCompleted = challenge.status === 'completed';
    const isExpired = challenge.status === 'expired';

    return (
      <Card className={`p-4 ${isCompleted ? 'bg-primary/5 border-primary/20' : ''}`}>
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold">{challenge.title}</h4>
                {isCompleted && <CheckCircle2 className="w-4 h-4 text-primary" />}
              </div>
              <p className="text-sm text-muted-foreground">{challenge.description}</p>
            </div>
            
            <div className="flex flex-col items-end gap-1">
              <Badge className={getDifficultyColor(challenge.difficulty)}>
                {challenge.difficulty}
              </Badge>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Zap className="w-3 h-3" />
                <span>{challenge.points} pts</span>
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{challenge.progress}/{challenge.total}</span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              {challenge.deadline && (
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{new Date(challenge.deadline).toLocaleDateString()}</span>
                </div>
              )}
              {challenge.participants && (
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  <span>{challenge.participants}</span>
                </div>
              )}
            </div>

            {!isCompleted && !isExpired && (
              <Button 
                size="sm" 
                variant="default"
                onClick={() => joinChallenge(challenge.id)}
              >
                <Target className="w-3 h-3 mr-1" />
                {challenge.progress > 0 ? 'Continue' : 'Start'}
              </Button>
            )}
          </div>

          {challenge.reward && (
            <div className="flex items-center gap-2 p-2 bg-accent/30 rounded-lg">
              <Award className="w-4 h-4 text-primary" />
              <span className="text-xs font-medium">Reward: {challenge.reward}</span>
            </div>
          )}
        </div>
      </Card>
    );
  };

  const activeChallenges = challenges.filter(c => c.status === 'active');
  const completedChallenges = challenges.filter(c => c.status === 'completed');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Trophy className="w-6 h-6 text-primary" />
            Style Challenges
          </h2>
          <p className="text-muted-foreground">Complete challenges to earn points and badges</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 bg-gradient-to-br from-primary/10 to-primary/5">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Points</p>
              <p className="text-2xl font-bold">{userPoints}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-accent/10 to-accent/5">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-accent/10 rounded-lg">
              <TrendingUp className="w-6 h-6 text-accent-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Global Rank</p>
              <p className="text-2xl font-bold">#{userRank}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-green-500/10 to-green-500/5">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-500/10 rounded-lg">
              <CheckCircle2 className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Completed</p>
              <p className="text-2xl font-bold">{completedChallenges.length}</p>
            </div>
          </div>
        </Card>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList>
          <TabsTrigger value="active">Active ({activeChallenges.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedChallenges.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-3 mt-4">
          {loading ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">Loading challenges...</p>
            </Card>
          ) : activeChallenges.length > 0 ? (
            activeChallenges.map(challenge => (
              <ChallengeCard key={challenge.id} challenge={challenge} />
            ))
          ) : (
            <Card className="p-8 text-center">
              <Target className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No active challenges</p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-3 mt-4">
          {completedChallenges.length > 0 ? (
            completedChallenges.map(challenge => (
              <ChallengeCard key={challenge.id} challenge={challenge} />
            ))
          ) : (
            <Card className="p-8 text-center">
              <Trophy className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">Complete your first challenge!</p>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIStyleChallenges;
