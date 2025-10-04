import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  Sparkles, 
  BarChart3, 
  Shirt, 
  TrendingUp, 
  Calendar,
  ArrowRight,
  Zap,
  ShoppingBag,
  Users,
  Shield,
  Star,
  Trophy,
  Heart,
  Plus,
  Eye,
  Palette,
  Cloud,
  Flame
} from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { useWardrobe } from '@/hooks/useWardrobe';
import { RealDailyOutfit } from '@/components/RealDailyOutfit';
import { WardrobeAnalytics } from '@/components/WardrobeAnalytics';
import { SmartLaundryTracker } from '@/components/SmartLaundryTracker';
import PersonalizedRecommendations from '@/components/PersonalizedRecommendations';

const Home = () => {
  const navigate = useNavigate();
  const { user, profile, isAuthenticated } = useProfile();
  const { items: wardrobeItems } = useWardrobe();
  const [activeTab, setActiveTab] = useState('today');

  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate('/auth');
    }
  }, [isAuthenticated, user, navigate]);

  const stats = {
    wardrobeItems: wardrobeItems.length,
    outfitsCreated: wardrobeItems.filter(i => i.is_favorite).length,
    totalWears: wardrobeItems.reduce((sum, item) => sum + (item.wear_count || 0), 0),
    favoriteItems: wardrobeItems.filter(item => item.is_favorite).length,
    styleScore: profile?.style_score || 0
  };

  const trendingActions = [
    {
      title: 'Today\'s Outfit',
      description: 'AI-curated for you',
      icon: Sparkles,
      href: '#today',
      badge: 'New',
      color: 'from-purple-500 to-pink-500'
    },
    {
      title: 'Add Item',
      description: 'Scan or upload',
      icon: Plus,
      href: '/add',
      badge: null,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Virtual Try-On',
      description: 'See before you wear',
      icon: Eye,
      href: '/mymirror',
      badge: 'Hot',
      color: 'from-green-500 to-emerald-500'
    },
    {
      title: 'Style Challenges',
      description: 'Earn rewards',
      icon: Trophy,
      href: '/challenges',
      badge: 'Live',
      color: 'from-yellow-500 to-orange-500'
    }
  ];

  const quickLinks = [
    { icon: ShoppingBag, label: 'Market', href: '/market' },
    { icon: Users, label: 'Community', href: '/community' },
    { icon: BarChart3, label: 'Analytics', href: '/wardrobe-analytics' },
    { icon: Palette, label: 'My Style', href: '/mystyle' },
    { icon: Heart, label: '2ndDresser', href: '/2nddresser' },
    { icon: Zap, label: 'AI Hub', href: '/ai-hub' }
  ];

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-4">
      {/* Hero Header with Gradient */}
      <div className="bg-gradient-to-br from-primary/10 via-secondary/5 to-background border-b">
        <div className="container max-w-7xl mx-auto px-4 py-6 lg:px-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Avatar className="h-12 w-12 border-2 border-primary/20">
                  <AvatarImage src={profile?.avatar_url || ''} />
                  <AvatarFallback>{profile?.full_name?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">
                    Welcome, {profile?.full_name?.split(' ')[0] || 'Fashionista'}!
                  </h1>
                  <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-2">
                    <Calendar className="w-3 h-3" />
                    {new Date().toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
              </div>
              
              {/* Style Score Badge */}
              <Badge className="bg-gradient-to-r from-primary to-secondary text-primary-foreground">
                <Star className="w-3 h-3 mr-1" />
                Style Score: {stats.styleScore}
              </Badge>
            </div>
            
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => navigate('/account')}
              className="flex-shrink-0"
            >
              <Shield className="w-4 h-4 mr-2" />
              Account
            </Button>
          </div>
        </div>
      </div>

      <main className="container max-w-7xl mx-auto px-4 lg:px-6 py-6 space-y-6">
        {/* Stats Dashboard */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          <Card className="hover:shadow-lg transition-all cursor-pointer" onClick={() => navigate('/wardrobe')}>
            <CardContent className="p-4 text-center">
              <Shirt className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 text-primary" />
              <p className="text-2xl sm:text-3xl font-bold">{stats.wardrobeItems}</p>
              <p className="text-xs text-muted-foreground">Wardrobe</p>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-lg transition-all">
            <CardContent className="p-4 text-center">
              <Heart className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 text-rose-500" />
              <p className="text-2xl sm:text-3xl font-bold">{stats.favoriteItems}</p>
              <p className="text-xs text-muted-foreground">Favorites</p>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-lg transition-all">
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 text-blue-500" />
              <p className="text-2xl sm:text-3xl font-bold">{stats.totalWears}</p>
              <p className="text-xs text-muted-foreground">Wears</p>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-lg transition-all">
            <CardContent className="p-4 text-center">
              <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 text-purple-500" />
              <p className="text-2xl sm:text-3xl font-bold">{stats.outfitsCreated}</p>
              <p className="text-xs text-muted-foreground">Outfits</p>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-lg transition-all col-span-2 sm:col-span-1">
            <CardContent className="p-4 text-center">
              <Flame className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 text-orange-500" />
              <p className="text-2xl sm:text-3xl font-bold">{Math.floor(stats.styleScore / 10)}</p>
              <p className="text-xs text-muted-foreground">Streak Days</p>
            </CardContent>
          </Card>
        </div>

        {/* Trending Actions - Eye-catching Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {trendingActions.map((action) => (
            <Card 
              key={action.title}
              className="group hover:shadow-xl transition-all cursor-pointer overflow-hidden border-2 hover:border-primary/50"
              onClick={() => action.href.startsWith('#') ? setActiveTab('today') : navigate(action.href)}
            >
              <div className={`h-2 bg-gradient-to-r ${action.color}`} />
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${action.color} bg-opacity-10`}>
                    <action.icon className="w-5 h-5 text-primary" />
                  </div>
                  {action.badge && (
                    <Badge variant="secondary" className="text-xs">
                      {action.badge}
                    </Badge>
                  )}
                </div>
                <h3 className="font-semibold mb-1">{action.title}</h3>
                <p className="text-sm text-muted-foreground">{action.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Links */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Quick Access</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {quickLinks.map((link) => (
                <Button
                  key={link.label}
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(link.href)}
                  className="flex items-center gap-2"
                >
                  <link.icon className="w-4 h-4" />
                  {link.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto">
            <TabsTrigger value="today" className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Today
            </TabsTrigger>
            <TabsTrigger value="discover" className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Discover
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Insights
            </TabsTrigger>
            <TabsTrigger value="laundry" className="flex items-center gap-2">
              <Cloud className="w-4 h-4" />
              Laundry
            </TabsTrigger>
          </TabsList>

          <TabsContent value="today" className="space-y-6">
            <RealDailyOutfit />
            <PersonalizedRecommendations />
          </TabsContent>

          <TabsContent value="discover" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Trending in Fashion</CardTitle>
                <CardDescription>Discover what's popular in your community</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => navigate('/community')} className="w-full">
                  Explore Community
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <WardrobeAnalytics />
          </TabsContent>

          <TabsContent value="laundry">
            <SmartLaundryTracker />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Home;