import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Trophy, TrendingUp, Users, Calendar, 
  Heart, MessageCircle, Share2, Award,
  Clock, Target, Star, Flame
} from 'lucide-react';

interface Challenge {
  id: string;
  title: string;
  description: string;
  category: 'seasonal' | 'sustainable' | 'budget' | 'creative';
  difficulty: 'easy' | 'medium' | 'hard';
  start_date: string;
  end_date: string;
  participants_count: number;
  submissions_count: number;
  prize: string;
  status: 'upcoming' | 'active' | 'completed';
  is_trending: boolean;
}

interface Submission {
  id: string;
  challenge_id: string;
  user_id: string;
  title: string;
  description: string;
  image_urls: string[];
  likes_count: number;
  comments_count: number;
  submitted_at: string;
  profiles?: {
    full_name: string;
    avatar_url: string;
  };
}

export const StyleChallenges = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('active');
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState({
    activeChallenges: 0,
    submissions: 0,
    wins: 0,
    rank: 0
  });

  useEffect(() => {
    loadChallenges();
    loadSubmissions();
    loadUserStats();
  }, []);

  const loadChallenges = async () => {
    try {
      const { data, error } = await supabase
        .from('style_challenges')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setChallenges((data || []) as Challenge[]);
    } catch (error: any) {
      toast({
        title: "Error loading challenges",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadSubmissions = async () => {
    try {
      const { data, error } = await supabase
        .from('challenge_submissions')
        .select(`
          *,
          profiles!challenge_submissions_user_id_fkey (
            full_name,
            avatar_url
          )
        `)
        .order('likes_count', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      setSubmissions((data || []) as any);
    } catch (error: any) {
      console.error('Error loading submissions:', error);
    }
  };

  const loadUserStats = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: participations } = await supabase
      .from('challenge_participations')
      .select('*')
      .eq('user_id', user.id);

    const { data: userSubmissions } = await supabase
      .from('challenge_submissions')
      .select('*')
      .eq('user_id', user.id);

    const { data: wins } = await supabase
      .from('challenge_submissions')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_winner', true);

    setUserStats({
      activeChallenges: participations?.length || 0,
      submissions: userSubmissions?.length || 0,
      wins: wins?.length || 0,
      rank: 42
    });
  };

  const handleJoinChallenge = async (challengeId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to join challenges",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('challenge_participations')
        .insert({ challenge_id: challengeId, user_id: user.id });

      if (error) {
        if (error.code === '23505') {
          toast({
            title: "Already Joined",
            description: "You're already participating in this challenge"
          });
          return;
        }
        throw error;
      }

      toast({
        title: 'Challenge Joined!',
        description: 'Good luck! Start creating your submission.'
      });
      loadChallenges();
      loadUserStats();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const getCategoryColor = (category: Challenge['category']) => {
    const colors = {
      seasonal: 'bg-orange-500',
      sustainable: 'bg-green-500',
      budget: 'bg-blue-500',
      creative: 'bg-purple-500'
    };
    return colors[category];
  };

  const getDifficultyColor = (difficulty: Challenge['difficulty']) => {
    const colors = {
      easy: 'text-green-600',
      medium: 'text-yellow-600',
      hard: 'text-red-600'
    };
    return colors[difficulty];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Style Challenges</h2>
          <p className="text-muted-foreground">Compete, create, and win amazing prizes</p>
        </div>
        <Button>
          <Trophy className="mr-2 h-4 w-4" />
          My Challenges
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Challenges</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{challenges.filter(c => c.status === 'active').length}</div>
            <p className="text-xs text-muted-foreground">Join now</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your Submissions</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.submissions}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Wins</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.wins}</div>
            <p className="text-xs text-muted-foreground">Keep going!</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ranking</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">#{userStats.rank}</div>
            <p className="text-xs text-muted-foreground">Top 5% this month</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="submissions">Top Submissions</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4 mt-6">
          {challenges.filter(c => c.status === 'active').map((challenge) => (
            <Card key={challenge.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle>{challenge.title}</CardTitle>
                      {challenge.is_trending && (
                        <Badge variant="default" className="gap-1">
                          <Flame className="h-3 w-3" />
                          Trending
                        </Badge>
                      )}
                    </div>
                    <CardDescription>{challenge.description}</CardDescription>
                  </div>
                  <div className={`h-12 w-12 rounded-full ${getCategoryColor(challenge.category)} flex items-center justify-center`}>
                    <Trophy className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Badge variant="outline" className={getDifficultyColor(challenge.difficulty)}>
                    {challenge.difficulty}
                  </Badge>
                  <Badge variant="outline">{challenge.category}</Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{challenge.participants_count} participants</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <span>{challenge.submissions_count} submissions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Ends {new Date(challenge.end_date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold">{challenge.prize}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-semibold">
                      {challenge.participants_count > 0 
                        ? Math.round((challenge.submissions_count / challenge.participants_count) * 100)
                        : 0}%
                    </span>
                  </div>
                  <Progress 
                    value={challenge.participants_count > 0 
                      ? (challenge.submissions_count / challenge.participants_count) * 100 
                      : 0} 
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={() => handleJoinChallenge(challenge.id)} className="flex-1">
                    Join Challenge
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-4 mt-6">
          {challenges.filter(c => c.status === 'upcoming').map((challenge) => (
            <Card key={challenge.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle>{challenge.title}</CardTitle>
                    <CardDescription>{challenge.description}</CardDescription>
                  </div>
                  <Badge variant="secondary">Coming Soon</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>Starts {new Date(challenge.start_date).toLocaleDateString()}</span>
                </div>
                <Button variant="outline" className="w-full">
                  Notify Me
                </Button>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="submissions" className="space-y-4 mt-6">
          <div className="grid gap-4 md:grid-cols-2">
            {submissions.map((submission) => (
              <Card key={submission.id} className="overflow-hidden">
                <div className="aspect-square bg-muted relative">
                  {submission.image_urls?.[0] && (
                    <img
                      src={submission.image_urls[0]}
                      alt={submission.title || submission.description}
                      className="object-cover w-full h-full"
                    />
                  )}
                </div>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={submission.profiles?.avatar_url} />
                      <AvatarFallback>
                        {submission.profiles?.full_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-semibold">
                        {submission.profiles?.full_name || 'Anonymous'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(submission.submitted_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm">{submission.description}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <button className="flex items-center gap-1 hover:text-primary transition-colors">
                      <Heart className="h-4 w-4" />
                      {submission.likes_count}
                    </button>
                    <button className="flex items-center gap-1 hover:text-primary transition-colors">
                      <MessageCircle className="h-4 w-4" />
                      {submission.comments_count}
                    </button>
                    <button className="flex items-center gap-1 hover:text-primary transition-colors">
                      <Share2 className="h-4 w-4" />
                      Share
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};