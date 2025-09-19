import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  Shirt, 
  Star, 
  Calendar, 
  Heart, 
  Target,
  PieChart,
  BarChart3,
  Clock,
  Award
} from "lucide-react";
import { useWardrobe } from "@/hooks/useWardrobe";
import { useProfile } from "@/hooks/useProfile";

const UserAnalyticsDashboard = () => {
  const { items: wardrobeItems } = useWardrobe();
  const { profile } = useProfile();
  const [stats, setStats] = useState({
    totalItems: 0,
    favoriteItems: 0,
    mostWornCategory: '',
    averageWearCount: 0,
    styleScore: 0,
    outfitsCreated: 0,
    monthlyWears: 0,
    wardrobe_value: 0,
    sustainability_score: 85
  });

  useEffect(() => {
    if (wardrobeItems.length > 0) {
      const favoriteCount = wardrobeItems.filter(item => item.is_favorite).length;
      const totalWearCount = wardrobeItems.reduce((sum, item) => sum + (item.wear_count || 0), 0);
      const averageWears = totalWearCount / wardrobeItems.length;
      
      // Category analysis
      const categoryCount: { [key: string]: number } = {};
      wardrobeItems.forEach(item => {
        categoryCount[item.category] = (categoryCount[item.category] || 0) + 1;
      });
      
      const mostWorn = Object.entries(categoryCount)
        .sort(([,a], [,b]) => b - a)[0]?.[0] || '';

      // Calculate wardrobe value
      const wardrobeValue = wardrobeItems.reduce((sum, item) => 
        sum + (item.purchase_price || 0), 0
      );

      setStats({
        totalItems: wardrobeItems.length,
        favoriteItems: favoriteCount,
        mostWornCategory: mostWorn,
        averageWearCount: Math.round(averageWears * 10) / 10,
        styleScore: profile?.style_score || 0,
        outfitsCreated: Math.floor(wardrobeItems.length / 3), // Rough estimate
        monthlyWears: Math.round(totalWearCount / 3), // Rough monthly average
        wardrobe_value: wardrobeValue,
        sustainability_score: 85 // Fixed for demo
      });
    }
  }, [wardrobeItems, profile]);

  const categoryBreakdown = wardrobeItems.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {} as { [key: string]: number });

  const topCategories = Object.entries(categoryBreakdown)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold fashion-text-gradient flex items-center justify-center gap-2">
            <BarChart3 className="w-8 h-8" />
            Style Analytics
          </h1>
          <p className="text-muted-foreground">
            Insights into your fashion journey and wardrobe optimization
          </p>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="wardrobe">Wardrobe</TabsTrigger>
            <TabsTrigger value="sustainability">Sustainability</TabsTrigger>
            <TabsTrigger value="goals">Goals</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-6">
            {/* Key Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <Shirt className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <div className="text-2xl font-bold">{stats.totalItems}</div>
                  <p className="text-sm text-muted-foreground">Total Items</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <Heart className="w-8 h-8 mx-auto mb-2 text-red-500" />
                  <div className="text-2xl font-bold">{stats.favoriteItems}</div>
                  <p className="text-sm text-muted-foreground">Favorites</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <Star className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
                  <div className="text-2xl font-bold">{stats.styleScore}</div>
                  <p className="text-sm text-muted-foreground">Style Score</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <TrendingUp className="w-8 h-8 mx-auto mb-2 text-green-500" />
                  <div className="text-2xl font-bold">${stats.wardrobe_value.toFixed(0)}</div>
                  <p className="text-sm text-muted-foreground">Wardrobe Value</p>
                </CardContent>
              </Card>
            </div>

            {/* Category Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  Wardrobe Composition
                </CardTitle>
                <CardDescription>
                  Your clothing categories and their distribution
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topCategories.map(([category, count], index) => {
                    const percentage = (count / stats.totalItems) * 100;
                    return (
                      <div key={category} className="space-y-2">
                        <div className="flex justify-between">
                          <span className="capitalize font-medium">{category}</span>
                          <span className="text-sm text-muted-foreground">
                            {count} items ({percentage.toFixed(1)}%)
                          </span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="wardrobe" className="space-y-6 mt-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Usage Insights</CardTitle>
                  <CardDescription>How you wear your clothes</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Most Worn Category</span>
                    <Badge className="capitalize">{stats.mostWornCategory}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Average Wears per Item</span>
                    <span className="font-medium">{stats.averageWearCount}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Outfits Created</span>
                    <span className="font-medium">{stats.outfitsCreated}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Monthly Wears</span>
                    <span className="font-medium">{stats.monthlyWears}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Wardrobe Health</CardTitle>
                  <CardDescription>Optimization recommendations</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Wardrobe Efficiency</span>
                      <span className="text-sm text-muted-foreground">82%</span>
                    </div>
                    <Progress value={82} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Style Consistency</span>
                      <span className="text-sm text-muted-foreground">75%</span>
                    </div>
                    <Progress value={75} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Color Harmony</span>
                      <span className="text-sm text-muted-foreground">90%</span>
                    </div>
                    <Progress value={90} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="sustainability" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-green-500" />
                  Sustainability Score
                </CardTitle>
                <CardDescription>
                  Your environmental impact and sustainable fashion practices
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-6">
                  <div className="text-4xl font-bold text-green-500 mb-2">
                    {stats.sustainability_score}%
                  </div>
                  <p className="text-muted-foreground">Great job! You're making sustainable choices</p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Cost Per Wear</span>
                    <span className="font-medium text-green-600">
                      ${(stats.wardrobe_value / Math.max(stats.monthlyWears * 12, 1)).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Items Purchased This Year</span>
                    <span className="font-medium">12</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Items Donated/Sold</span>
                    <span className="font-medium text-blue-600">8</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="goals" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Style Goals
                </CardTitle>
                <CardDescription>
                  Track your fashion and sustainability goals
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Minimize Fast Fashion Purchases</span>
                    <span className="text-sm text-muted-foreground">8/10 months</span>
                  </div>
                  <Progress value={80} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Wear Each Item 10+ Times</span>
                    <span className="text-sm text-muted-foreground">65% complete</span>
                  </div>
                  <Progress value={65} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Organize Seasonal Wardrobe</span>
                    <span className="text-sm text-muted-foreground">90% complete</span>
                  </div>
                  <Progress value={90} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Create 50 New Outfits</span>
                    <span className="text-sm text-muted-foreground">32/50 outfits</span>
                  </div>
                  <Progress value={64} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default UserAnalyticsDashboard;