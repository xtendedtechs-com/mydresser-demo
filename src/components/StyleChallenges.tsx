import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
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
  startDate: string;
  endDate: string;
  participants: number;
  submissions: number;
  prize: string;
  status: 'upcoming' | 'active' | 'completed';
  trending: boolean;
}

interface Submission {
  id: string;
  challengeId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  imageUrl: string;
  description: string;
  likes: number;
  comments: number;
  submittedAt: string;
}

export const StyleChallenges = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('active');

  const challenges: Challenge[] = [
    {
      id: '1',
      title: 'Sustainable Summer Style',
      description: 'Create an eco-friendly summer outfit using only sustainable brands and materials',
      category: 'sustainable',
      difficulty: 'medium',
      startDate: '2025-06-01',
      endDate: '2025-06-30',
      participants: 342,
      submissions: 156,
      prize: '$500 Gift Card',
      status: 'active',
      trending: true
    },
    {
      id: '2',
      title: 'Minimalist Wardrobe Challenge',
      description: 'Style 10 different looks with only 15 clothing items',
      category: 'creative',
      difficulty: 'hard',
      startDate: '2025-07-01',
      endDate: '2025-07-31',
      participants: 289,
      submissions: 98,
      prize: 'Feature on Homepage',
      status: 'active',
      trending: false
    },
    {
      id: '3',
      title: 'Budget Fashion Week',
      description: 'Create runway-worthy looks with items under $50',
      category: 'budget',
      difficulty: 'easy',
      startDate: '2025-08-01',
      endDate: '2025-08-15',
      participants: 567,
      submissions: 0,
      prize: '$200 Shopping Spree',
      status: 'upcoming',
      trending: true
    }
  ];

  const submissions: Submission[] = [
    {
      id: '1',
      challengeId: '1',
      userId: '1',
      userName: 'Emma Style',
      userAvatar: '/placeholder.svg',
      imageUrl: '/placeholder.svg',
      description: 'Loving this sustainable linen dress paired with recycled accessories!',
      likes: 234,
      comments: 45,
      submittedAt: '2025-06-15'
    },
    {
      id: '2',
      challengeId: '1',
      userId: '2',
      userName: 'Fashion Forward',
      userAvatar: '/placeholder.svg',
      imageUrl: '/placeholder.svg',
      description: 'Thrifted finds + eco-friendly brands = perfect summer outfit',
      likes: 189,
      comments: 32,
      submittedAt: '2025-06-14'
    }
  ];

  const handleJoinChallenge = (challengeId: string) => {
    toast({
      title: 'Challenge Joined!',
      description: 'Good luck! Start creating your submission.'
    });
  };

  const handleSubmitEntry = (challengeId: string) => {
    toast({
      title: 'Entry Submitted!',
      description: 'Your submission is now live. Good luck!'
    });
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
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">Join now</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your Submissions</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Wins</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground">Keep going!</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ranking</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">#42</div>
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
                      {challenge.trending && (
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
                    <span>{challenge.participants} participants</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <span>{challenge.submissions} submissions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Ends {new Date(challenge.endDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold">{challenge.prize}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-semibold">{Math.round((challenge.submissions / challenge.participants) * 100)}%</span>
                  </div>
                  <Progress value={(challenge.submissions / challenge.participants) * 100} />
                </div>

                <div className="flex gap-2">
                  <Button onClick={() => handleJoinChallenge(challenge.id)} className="flex-1">
                    Join Challenge
                  </Button>
                  <Button variant="outline" onClick={() => handleSubmitEntry(challenge.id)}>
                    Submit Entry
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
                  <span>Starts {new Date(challenge.startDate).toLocaleDateString()}</span>
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
                  <img
                    src={submission.imageUrl}
                    alt={submission.description}
                    className="object-cover w-full h-full"
                  />
                </div>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={submission.userAvatar} />
                      <AvatarFallback>{submission.userName[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{submission.userName}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(submission.submittedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm">{submission.description}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <button className="flex items-center gap-1 hover:text-primary transition-colors">
                      <Heart className="h-4 w-4" />
                      {submission.likes}
                    </button>
                    <button className="flex items-center gap-1 hover:text-primary transition-colors">
                      <MessageCircle className="h-4 w-4" />
                      {submission.comments}
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
