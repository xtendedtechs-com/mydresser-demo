import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Database, 
  TrendingUp, 
  Users, 
  Heart, 
  Star,
  Calendar,
  ShoppingBag,
  Sparkles,
  BarChart3,
  Clock
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from '@/hooks/useProfile';
import { useWardrobe } from '@/hooks/useWardrobe';
import { toast } from 'sonner';

export const DatabaseBackedFeatures = () => {
  const { user } = useProfile();
  const { items } = useWardrobe();
  
  const [userStats, setUserStats] = useState<any>(null);
  const [socialData, setSocialData] = useState<any>(null);
  const [outfitHistory, setOutfitHistory] = useState<any[]>([]);
  const [favoriteItems, setFavoriteItems] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchAllData();
    }
  }, [user]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchUserStats(),
        fetchSocialData(),
        fetchOutfitHistory(),
        fetchFavoriteItems(),
        fetchRecentActivity()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load some data');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStats = async () => {
    try {
      // Fetch wardrobe stats
      const { data: wardrobeStats, error: wardrobeError } = await supabase
        .from('wardrobe_items')
        .select('id, category, is_favorite, wear_count, purchase_price')
        .eq('user_id', user?.id);

      if (wardrobeError) throw wardrobeError;

      // Fetch outfit stats
      const { data: outfitStats, error: outfitError } = await supabase
        .from('outfits')
        .select('id, is_favorite, is_ai_generated')
        .eq('user_id', user?.id);

      if (outfitError) throw outfitError;

      // Calculate stats
      const totalItems = wardrobeStats?.length || 0;
      const totalOutfits = outfitStats?.length || 0;
      const favoriteItemsCount = wardrobeStats?.filter(item => item.is_favorite).length || 0;
      const favoriteOutfitsCount = outfitStats?.filter(outfit => outfit.is_favorite).length || 0;
      const aiGeneratedOutfits = outfitStats?.filter(outfit => outfit.is_ai_generated).length || 0;
      const totalValue = wardrobeStats?.reduce((sum, item) => sum + (item.purchase_price || 0), 0) || 0;
      const totalWears = wardrobeStats?.reduce((sum, item) => sum + (item.wear_count || 0), 0) || 0;

      setUserStats({
        totalItems,
        totalOutfits,
        favoriteItemsCount,
        favoriteOutfitsCount,
        aiGeneratedOutfits,
        totalValue,
        totalWears,
        averageItemValue: totalItems > 0 ? totalValue / totalItems : 0,
        categoryDistribution: calculateCategoryDistribution(wardrobeStats || [])
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  const fetchSocialData = async () => {
    try {
      // Fetch followers/following counts
      const { data: followStats, error: followError } = await supabase
        .from('user_follows')
        .select('follower_id, following_id')
        .or(`follower_id.eq.${user?.id},following_id.eq.${user?.id}`);

      if (followError) throw followError;

      const followers = followStats?.filter(f => f.following_id === user?.id).length || 0;
      const following = followStats?.filter(f => f.follower_id === user?.id).length || 0;

      // Fetch reaction counts
      const { data: reactionStats, error: reactionError } = await supabase
        .from('reactions')
        .select('id, reaction_type')
        .eq('user_id', user?.id);

      if (reactionError) throw reactionError;

      const totalReactions = reactionStats?.length || 0;
      const reactionsByType = reactionStats?.reduce((acc, reaction) => {
        acc[reaction.reaction_type] = (acc[reaction.reaction_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      setSocialData({
        followers,
        following,
        totalReactions,
        reactionsByType
      });
    } catch (error) {
      console.error('Error fetching social data:', error);
    }
  };

  const fetchOutfitHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('outfits')
        .select(`
          *,
          outfit_items (
            wardrobe_item_id,
            wardrobe_items (
              name,
              brand,
              category,
              photos
            )
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setOutfitHistory(data || []);
    } catch (error) {
      console.error('Error fetching outfit history:', error);
    }
  };

  const fetchFavoriteItems = async () => {
    try {
      const { data, error } = await supabase
        .from('wardrobe_items')
        .select('*')
        .eq('user_id', user?.id)
        .eq('is_favorite', true)
        .order('created_at', { ascending: false })
        .limit(8);

      if (error) throw error;
      setFavoriteItems(data || []);
    } catch (error) {
      console.error('Error fetching favorite items:', error);
    }
  };

  const fetchRecentActivity = async () => {
    try {
      // Combine recent items, outfits, and reactions
      const activities = [];

      // Recent wardrobe additions
      const { data: recentItems } = await supabase
        .from('wardrobe_items')
        .select('id, name, created_at, category')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(5);

      recentItems?.forEach(item => {
        activities.push({
          type: 'item_added',
          title: `Added "${item.name}" to wardrobe`,
          category: item.category,
          timestamp: item.created_at,
          icon: ShoppingBag
        });
      });

      // Recent outfits
      const { data: recentOutfits } = await supabase
        .from('outfits')
        .select('id, name, created_at, is_ai_generated')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(5);

      recentOutfits?.forEach(outfit => {
        activities.push({
          type: 'outfit_created',
          title: `Created outfit "${outfit.name}"`,
          category: outfit.is_ai_generated ? 'AI Generated' : 'Manual',
          timestamp: outfit.created_at,
          icon: outfit.is_ai_generated ? Sparkles : Users
        });
      });

      // Sort all activities by timestamp
      activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      setRecentActivity(activities.slice(0, 8));
    } catch (error) {
      console.error('Error fetching recent activity:', error);
    }
  };

  const calculateCategoryDistribution = (items: any[]) => {
    const distribution = items.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(distribution).map(([category, count]) => ({
      category: category.charAt(0).toUpperCase() + category.slice(1),
      count: Number(count),
      percentage: Math.round((Number(count) / items.length) * 100)
    }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <Database className="w-12 h-12 animate-pulse text-primary mx-auto" />
            <p className="text-lg font-medium">Loading your data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {userStats && (
          <>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">{userStats.totalItems}</p>
                    <p className="text-sm text-muted-foreground">Wardrobe Items</p>
                  </div>
                  <ShoppingBag className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">{userStats.totalOutfits}</p>
                    <p className="text-sm text-muted-foreground">Total Outfits</p>
                  </div>
                  <Sparkles className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">{formatCurrency(userStats.totalValue)}</p>
                    <p className="text-sm text-muted-foreground">Total Value</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">{userStats.totalWears}</p>
                    <p className="text-sm text-muted-foreground">Total Wears</p>
                  </div>
                  <Clock className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <Tabs defaultValue="wardrobe" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="wardrobe">Wardrobe</TabsTrigger>
          <TabsTrigger value="outfits">Outfits</TabsTrigger>
          <TabsTrigger value="social">Social</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        {/* Wardrobe Analytics */}
        <TabsContent value="wardrobe" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Category Distribution</CardTitle>
                <CardDescription>How your wardrobe is organized</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {userStats?.categoryDistribution?.map((category: any) => (
                    <div key={category.category} className="flex items-center justify-between">
                      <span className="font-medium">{category.category}</span>
                      <div className="flex items-center space-x-2">
                        <Progress value={category.percentage} className="w-20" />
                        <Badge variant="outline">{category.count}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Favorite Items */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Heart className="w-5 h-5 text-red-500" />
                  <span>Favorite Items</span>
                </CardTitle>
                <CardDescription>Your most loved pieces</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {favoriteItems.slice(0, 4).map((item) => (
                    <div key={item.id} className="text-center p-3 border rounded-lg">
                      <div className="w-16 h-16 bg-muted rounded-lg mx-auto mb-2">
                        {item.photos?.main && (
                          <img 
                            src={item.photos.main} 
                            alt={item.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        )}
                      </div>
                      <p className="text-sm font-medium truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{item.brand}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Outfit History */}
        <TabsContent value="outfits" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Outfits</CardTitle>
              <CardDescription>Your outfit creation history</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {outfitHistory.map((outfit) => (
                  <div key={outfit.id} className="flex items-center space-x-4 p-3 border rounded-lg">
                    <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                      {outfit.is_ai_generated ? (
                        <Sparkles className="w-6 h-6 text-primary" />
                      ) : (
                        <Users className="w-6 h-6 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{outfit.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {outfit.outfit_items?.length || 0} items • {formatDate(outfit.created_at)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {outfit.is_ai_generated && <Badge variant="secondary">AI</Badge>}
                      {outfit.is_favorite && <Heart className="w-4 h-4 text-red-500 fill-current" />}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Social Stats */}
        <TabsContent value="social" className="space-y-6">
          {socialData && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Social Connections</CardTitle>
                  <CardDescription>Your MyDresser network</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Followers</span>
                    <Badge variant="outline">{socialData.followers}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Following</span>
                    <Badge variant="outline">{socialData.following}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Total Reactions</span>
                    <Badge variant="outline">{socialData.totalReactions}</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Reaction Breakdown</CardTitle>
                  <CardDescription>Types of reactions you've given</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {Object.entries(socialData.reactionsByType).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {type === 'like' && <Heart className="w-4 h-4 text-red-500" />}
                        {type === 'star' && <Star className="w-4 h-4 text-yellow-500" />}
                        <span className="capitalize">{type}</span>
                      </div>
                      <Badge variant="outline">{count as number}</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Recent Activity */}
        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5" />
                <span>Recent Activity</span>
              </CardTitle>
              <CardDescription>Your latest actions in MyDresser</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <activity.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{activity.title}</p>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs">{activity.category}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(activity.timestamp)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Refresh Button */}
      <Card>
        <CardContent className="p-6 text-center">
          <Button onClick={fetchAllData} disabled={loading}>
            <Database className="w-4 h-4 mr-2" />
            Refresh All Data
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};