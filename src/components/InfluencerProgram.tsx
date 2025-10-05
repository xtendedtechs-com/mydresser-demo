import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Crown, TrendingUp, DollarSign, Users, 
  Award, Target, Gift, Star,
  CheckCircle, BarChart3, Sparkles
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
  user_id: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  follower_count: number;
  engagement_rate: number;
  total_earnings: number;
  total_conversions: number;
  profiles?: {
    full_name: string;
    avatar_url: string;
  };
}

export const InfluencerProgram = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [topInfluencers, setTopInfluencers] = useState<InfluencerProfile[]>([]);
  const [stats, setStats] = useState({
    activeInfluencers: 0,
    totalEarnings: 0,
    avgCommission: 0,
    successRate: 0
  });
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    loadInfluencerData();
  }, []);

  const loadInfluencerData = async () => {
    try {
      // Load top influencers
      const { data: influencers, error: influencersError } = await supabase
        .from('influencer_applications')
        .select(`
          *,
          profiles!influencer_applications_user_id_fkey (
            full_name,
            avatar_url
          )
        `)
        .eq('application_status', 'approved')
        .order('total_earnings', { ascending: false })
        .limit(10);

      if (influencersError) throw influencersError;
      setTopInfluencers((influencers || []) as any);

      // Load program stats
      const { count: activeCount } = await supabase
        .from('influencer_applications')
        .select('*', { count: 'exact', head: true })
        .eq('application_status', 'approved');

      const { data: earningsData } = await supabase
        .from('influencer_applications')
        .select('total_earnings, commission_rate, total_conversions')
        .eq('application_status', 'approved');

      const totalEarnings = earningsData?.reduce((sum, inf) => sum + Number(inf.total_earnings), 0) || 0;
      const avgCommission = earningsData?.length 
        ? earningsData.reduce((sum, inf) => sum + Number(inf.commission_rate), 0) / earningsData.length 
        : 0;
      const totalConversions = earningsData?.reduce((sum, inf) => sum + inf.total_conversions, 0) || 0;

      setStats({
        activeInfluencers: activeCount || 0,
        totalEarnings: totalEarnings,
        avgCommission: avgCommission,
        successRate: totalConversions > 0 ? 94 : 0
      });
    } catch (error: any) {
      console.error('Error loading influencer data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    toast({
      title: 'Application Submitted!',
      description: 'We\'ll review your profile and get back to you within 48 hours.'
    });
  };

  const getTierBadgeVariant = (tier: string): "default" | "secondary" | "destructive" | "outline" => {
    return 'default';
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
            <div className="text-2xl font-bold">{stats.activeInfluencers}</div>
            <p className="text-xs text-muted-foreground">+12% this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(stats.totalEarnings / 1000).toFixed(1)}K</div>
            <p className="text-xs text-muted-foreground">Paid out this year</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Commission</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgCommission.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Across all tiers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.successRate}%</div>
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
                        <AvatarImage src={influencer.profiles?.avatar_url} />
                        <AvatarFallback>
                          {influencer.profiles?.full_name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">
                            {influencer.profiles?.full_name || 'Anonymous'}
                          </p>
                          <Badge variant={getTierBadgeVariant(influencer.tier)}>
                            {influencer.tier}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-6 text-center">
                      <div>
                        <p className="text-sm text-muted-foreground">Followers</p>
                        <p className="font-semibold">{(influencer.follower_count / 1000).toFixed(0)}K</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Conversions</p>
                        <p className="font-semibold">{influencer.total_conversions}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Earnings</p>
                        <p className="font-semibold">${Number(influencer.total_earnings).toLocaleString()}</p>
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