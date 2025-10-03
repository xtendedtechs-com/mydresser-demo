import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  Crown, TrendingUp, DollarSign, Users, 
  Award, Target, Gift, Star,
  CheckCircle, Clock, BarChart3, Sparkles
} from 'lucide-react';

interface InfluencerTier {
  name: string;
  minFollowers: number;
  benefits: string[];
  commission: number;
  color: string;
}

interface InfluencerProfile {
  id: string;
  name: string;
  username: string;
  avatar: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  followers: number;
  engagement: number;
  totalEarnings: number;
  conversions: number;
  joinDate: string;
}

export const InfluencerProgram = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');

  const tiers: Record<string, InfluencerTier> = {
    bronze: {
      name: 'Bronze Creator',
      minFollowers: 1000,
      benefits: ['5% commission', 'Exclusive content', 'Early access'],
      commission: 5,
      color: 'text-orange-600'
    },
    silver: {
      name: 'Silver Influencer',
      minFollowers: 10000,
      benefits: ['10% commission', 'Featured posts', 'Monthly gifts', 'Priority support'],
      commission: 10,
      color: 'text-gray-400'
    },
    gold: {
      name: 'Gold Ambassador',
      minFollowers: 50000,
      benefits: ['15% commission', 'Exclusive campaigns', 'Brand partnerships', 'VIP events'],
      commission: 15,
      color: 'text-yellow-600'
    },
    platinum: {
      name: 'Platinum Elite',
      minFollowers: 100000,
      benefits: ['20% commission', 'Custom collections', 'Dedicated manager', 'Global campaigns'],
      commission: 20,
      color: 'text-purple-600'
    }
  };

  const topInfluencers: InfluencerProfile[] = [
    {
      id: '1',
      name: 'Style Maven',
      username: '@stylemaven',
      avatar: '/placeholder.svg',
      tier: 'platinum',
      followers: 250000,
      engagement: 8.5,
      totalEarnings: 45230,
      conversions: 1234,
      joinDate: '2024-01-15'
    },
    {
      id: '2',
      name: 'Fashion Forward',
      username: '@fashionforward',
      avatar: '/placeholder.svg',
      tier: 'gold',
      followers: 85000,
      engagement: 7.2,
      totalEarnings: 28940,
      conversions: 876,
      joinDate: '2024-03-20'
    },
    {
      id: '3',
      name: 'Trend Setter',
      username: '@trendsetter',
      avatar: '/placeholder.svg',
      tier: 'silver',
      followers: 45000,
      engagement: 6.8,
      totalEarnings: 15670,
      conversions: 542,
      joinDate: '2024-05-10'
    }
  ];

  const handleApply = () => {
    toast({
      title: 'Application Submitted!',
      description: 'We\'ll review your profile and get back to you within 48 hours.'
    });
  };

  const getTierBadgeVariant = (tier: string): "default" | "secondary" | "destructive" | "outline" => {
    return 'default';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-primary" />
            Influencer Program
          </h2>
          <p className="text-muted-foreground">Join our community and earn while you inspire</p>
        </div>
        <Button onClick={handleApply} size="lg">
          <Crown className="mr-2 h-4 w-4" />
          Apply Now
        </Button>
      </div>

      {/* Program Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Influencers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,847</div>
            <p className="text-xs text-muted-foreground">+12% this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$1.2M</div>
            <p className="text-xs text-muted-foreground">Paid out this year</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Commission</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12.5%</div>
            <p className="text-xs text-muted-foreground">Across all tiers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94%</div>
            <p className="text-xs text-muted-foreground">Conversion rate</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tiers">Tiers</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Program Benefits</CardTitle>
              <CardDescription>Exclusive perks for our influencer community</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex gap-3 p-4 border rounded-lg">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <DollarSign className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Competitive Commissions</h4>
                    <p className="text-sm text-muted-foreground">
                      Earn up to 20% commission on every sale with our tiered program
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 p-4 border rounded-lg">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Gift className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Exclusive Products</h4>
                    <p className="text-sm text-muted-foreground">
                      First access to new releases and exclusive influencer collections
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 p-4 border rounded-lg">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <BarChart3 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Analytics Dashboard</h4>
                    <p className="text-sm text-muted-foreground">
                      Track your performance with real-time analytics and insights
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 p-4 border rounded-lg">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Crown className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">VIP Support</h4>
                    <p className="text-sm text-muted-foreground">
                      Dedicated account manager and priority customer support
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>How It Works</CardTitle>
              <CardDescription>Start earning in 3 simple steps</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { icon: CheckCircle, title: 'Apply & Get Approved', description: 'Submit your application with your social media profiles' },
                  { icon: Target, title: 'Create & Share', description: 'Share your unique referral links and exclusive content' },
                  { icon: DollarSign, title: 'Earn Commission', description: 'Get paid for every sale made through your links' }
                ].map((step, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0">
                      <step.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">{step.title}</h4>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tiers" className="space-y-4 mt-6">
          {Object.entries(tiers).map(([key, tier]) => (
            <Card key={key}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className={`text-2xl ${tier.color}`}>{tier.name}</CardTitle>
                    <CardDescription>{tier.minFollowers.toLocaleString()}+ followers required</CardDescription>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold">{tier.commission}%</p>
                    <p className="text-sm text-muted-foreground">Commission</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="font-semibold mb-3">Tier Benefits:</p>
                  <div className="grid gap-2">
                    {tier.benefits.map((benefit, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Performers</CardTitle>
              <CardDescription>Leading influencers this month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topInfluencers.map((influencer, index) => (
                  <div key={influencer.id} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="text-2xl font-bold text-muted-foreground w-8">
                        #{index + 1}
                      </div>
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={influencer.avatar} />
                        <AvatarFallback>{influencer.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{influencer.name}</p>
                          <Badge variant={getTierBadgeVariant(influencer.tier)}>
                            {influencer.tier}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{influencer.username}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-6 text-center">
                      <div>
                        <p className="text-sm text-muted-foreground">Followers</p>
                        <p className="font-semibold">{(influencer.followers / 1000).toFixed(0)}K</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Conversions</p>
                        <p className="font-semibold">{influencer.conversions}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Earnings</p>
                        <p className="font-semibold">${influencer.totalEarnings.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
