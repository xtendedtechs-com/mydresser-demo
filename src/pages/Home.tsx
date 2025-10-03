import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Sparkles, 
  BarChart3, 
  Droplets, 
  Shirt, 
  TrendingUp, 
  Calendar,
  ArrowRight,
  Zap,
  ShoppingBag,
  Users,
  Shield,
  Star
} from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { useWardrobe } from '@/hooks/useWardrobe';
import { DailyOutfitGenerator } from '@/components/DailyOutfitGenerator';
import { WardrobeAnalytics } from '@/components/WardrobeAnalytics';
import { SmartLaundryTracker } from '@/components/SmartLaundryTracker';
import { RealDailyOutfit } from '@/components/RealDailyOutfit';

const Home = () => {
  const navigate = useNavigate();
  const { user, profile, isAuthenticated } = useProfile();
  const { items: wardrobeItems } = useWardrobe();
  const [activeTab, setActiveTab] = useState('overview');

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Shield className="mx-auto h-12 w-12 text-muted-foreground" />
          <h2 className="text-xl font-semibold">Authentication Required</h2>
          <p className="text-muted-foreground">Please sign in to access your fashion dashboard.</p>
          <Button onClick={() => navigate('/auth')}>Sign In</Button>
        </div>
      </div>
    );
  }

  const stats = {
    wardrobeItems: wardrobeItems.length,
    outfitsCreated: 5, // This would come from actual data
    totalWears: wardrobeItems.reduce((sum, item) => sum + (item.wear_count || 0), 0),
    favoriteItems: wardrobeItems.filter(item => item.is_favorite).length
  };

  const quickActions = [
    {
      title: 'AI Style Chat',
      description: 'Get personalized fashion advice',
      icon: Sparkles,
      href: '/ai-assistant',
      color: 'purple'
    },
    {
      title: 'Add New Item',
      description: 'Expand your digital wardrobe',
      icon: Shirt,
      href: '/add',
      color: 'blue'
    },
    {
      title: 'Browse Market',
      description: 'Discover new fashion',
      icon: ShoppingBag,
      href: '/market',
      color: 'green'
    },
    {
      title: 'Wardrobe Insights',
      description: 'AI-powered analytics',
      icon: BarChart3,
      href: '/wardrobe-insights',
      color: 'orange'
    },
    {
      title: '2ndDresser',
      description: 'Sustainable marketplace',
      icon: Users,
      href: '/2nddresser',
      color: 'emerald'
    },
    {
      title: 'MyMirror',
      description: 'Virtual try-on',
      icon: Calendar,
      href: '/mymirror',
      color: 'cyan'
    }
  ];

  const recentActivity = [
    { action: 'Added', item: 'Black Leather Jacket', time: '2 hours ago' },
    { action: 'Wore', item: 'Blue Denim Jeans', time: '1 day ago' },
    { action: 'Favorited', item: 'White Sneakers', time: '2 days ago' },
    { action: 'Created outfit', item: 'Casual Friday Look', time: '3 days ago' }
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border z-10">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Welcome back, {profile?.full_name || 'Fashion Lover'}!</h1>
              <p className="text-sm text-muted-foreground">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            <Badge variant="secondary" className="flex items-center space-x-1">
              <Shield className="w-4 h-4" />
              <span>Secured</span>
            </Badge>
          </div>
        </div>
      </header>

      <main className="px-4 py-6 space-y-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Shirt className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">{stats.wardrobeItems}</p>
              <p className="text-sm text-muted-foreground">Items</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Sparkles className="w-8 h-8 mx-auto mb-2 text-green-600" />
              <p className="text-2xl font-bold">{stats.outfitsCreated}</p>
              <p className="text-sm text-muted-foreground">Outfits</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <p className="text-2xl font-bold">{stats.totalWears}</p>
              <p className="text-sm text-muted-foreground">Total Wears</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Star className="w-8 h-8 mx-auto mb-2 text-yellow-600" />
              <p className="text-2xl font-bold">{stats.favoriteItems}</p>
              <p className="text-sm text-muted-foreground">Favorites</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Jump into your favorite features</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {quickActions.map((action) => (
                <Button
                  key={action.title}
                  variant="outline"
                  className="h-20 flex-col space-y-2"
                  onClick={() => navigate(action.href)}
                >
                  <action.icon className="w-6 h-6" />
                  <div className="text-center">
                    <p className="font-medium text-sm">{action.title}</p>
                    <p className="text-xs text-muted-foreground">{action.description}</p>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="outfits">Outfits</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="laundry">Laundry</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Daily Outfit */}
            <RealDailyOutfit />

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{activity.action} {activity.item}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="outfits">
            <DailyOutfitGenerator />
          </TabsContent>

          <TabsContent value="analytics">
            <WardrobeAnalytics />
          </TabsContent>

          <TabsContent value="laundry">
            <SmartLaundryTracker />
          </TabsContent>
        </Tabs>

        {/* Feature Discovery */}
        <Card className="bg-gradient-to-r from-primary/10 to-secondary/10">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="w-5 h-5" />
              <span>Discover More Features</span>
            </CardTitle>
            <CardDescription>Explore the full power of MyDresser AI</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-between"
              onClick={() => navigate('/wardrobe/enhanced')}
            >
              Enhanced Wardrobe Manager
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-between"
              onClick={() => navigate('/analytics')}
            >
              Advanced Analytics Dashboard
              <ArrowRight className="w-4 h-4" />
            </Button>
            <a href="/terminal">
              <Button 
                variant="outline" 
                className="w-full justify-between"
              >
                Merchant Terminal (Pro Users)
                <ArrowRight className="w-4 h-4" />
              </Button>
            </a>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Home;