import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Shirt, DollarSign, Calendar, Star } from 'lucide-react';
import { useWardrobe } from '@/hooks/useWardrobe';

export const WardrobeAnalytics = () => {
  const { items: wardrobeItems } = useWardrobe();
  
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    if (wardrobeItems.length > 0) {
      calculateAnalytics();
    }
  }, [wardrobeItems]);

  const calculateAnalytics = () => {
    const items = wardrobeItems;
    
    // Category distribution
    const categoryData = items.reduce((acc: any, item: any) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {});

    const categoryChart = Object.entries(categoryData).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value: value as number,
      fill: `hsl(${Math.random() * 360}, 70%, 60%)`
    }));

    // Brand analysis
    const brandData = items.reduce((acc: any, item: any) => {
      const brand = item.brand || 'Unknown';
      acc[brand] = (acc[brand] || 0) + 1;
      return acc;
    }, {});

    const topBrands = Object.entries(brandData)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    // Color analysis
    const colorData = items.reduce((acc: any, item: any) => {
      const color = item.color || 'Unknown';
      acc[color] = (acc[color] || 0) + 1;
      return acc;
    }, {});

    const topColors = Object.entries(colorData)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    // Cost analysis
    const totalValue = items.reduce((sum: number, item: any) => {
      return sum + (item.purchase_price || 0);
    }, 0);

    const averagePrice = items.length > 0 ? totalValue / items.length : 0;

    // Usage analysis
    const totalWears = items.reduce((sum: number, item: any) => {
      return sum + (item.wear_count || 0);
    }, 0);

    const mostWorn = items
      .filter((item: any) => item.wear_count > 0)
      .sort((a: any, b: any) => (b.wear_count || 0) - (a.wear_count || 0))
      .slice(0, 5);

    const leastWorn = items
      .filter((item: any) => (item.wear_count || 0) === 0)
      .slice(0, 5);

    // Monthly additions
    const monthlyData = items.reduce((acc: any, item: any) => {
      const month = new Date(item.created_at).toISOString().slice(0, 7);
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {});

    const monthlyChart = Object.entries(monthlyData)
      .map(([month, count]) => ({
        month: new Date(month + '-01').toLocaleDateString('en', { month: 'short', year: '2-digit' }),
        count
      }))
      .slice(-6);

    setAnalytics({
      summary: {
        totalItems: items.length,
        totalValue,
        averagePrice,
        totalWears,
        favoriteItems: items.filter((item: any) => item.is_favorite).length
      },
      categoryChart,
      topBrands,
      topColors,
      mostWorn,
      leastWorn,
      monthlyChart
    });
  };

  if (!analytics) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <p className="text-muted-foreground">Add items to see analytics</p>
        </CardContent>
      </Card>
    );
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Shirt className="w-5 h-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">{analytics.summary.totalItems}</p>
                <p className="text-sm text-muted-foreground">Total Items</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold">${analytics.summary.totalValue.toFixed(0)}</p>
                <p className="text-sm text-muted-foreground">Total Value</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{analytics.summary.totalWears}</p>
                <p className="text-sm text-muted-foreground">Total Wears</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Star className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold">{analytics.summary.favoriteItems}</p>
                <p className="text-sm text-muted-foreground">Favorites</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="categories" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="brands">Brands</TabsTrigger>
          <TabsTrigger value="usage">Usage</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="categories">
          <Card>
            <CardHeader>
              <CardTitle>Wardrobe Composition</CardTitle>
              <CardDescription>Distribution of items by category</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    dataKey="value"
                    data={analytics.categoryChart}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {analytics.categoryChart.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="brands">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Brands</CardTitle>
                <CardDescription>Your most collected brands</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {analytics.topBrands.map((brand: any, index: number) => (
                  <div key={brand.name} className="flex items-center justify-between">
                    <span className="font-medium">{brand.name}</span>
                    <div className="flex items-center space-x-2">
                      <Progress 
                        value={(brand.count / analytics.summary.totalItems) * 100} 
                        className="w-20"
                      />
                      <Badge variant="secondary">{brand.count}</Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Color Palette</CardTitle>
                <CardDescription>Your favorite colors</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {analytics.topColors.map((color: any) => (
                  <div key={color.name} className="flex items-center justify-between">
                    <span className="font-medium">{color.name}</span>
                    <div className="flex items-center space-x-2">
                      <Progress 
                        value={(color.count / analytics.summary.totalItems) * 100} 
                        className="w-20"
                      />
                      <Badge variant="secondary">{color.count}</Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="usage">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <span>Most Worn</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {analytics.mostWorn.map((item: any) => (
                  <div key={item.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">{item.brand}</p>
                    </div>
                    <Badge variant="secondary">{item.wear_count} wears</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingDown className="w-5 h-5 text-red-600" />
                  <span>Never Worn</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {analytics.leastWorn.length > 0 ? (
                  analytics.leastWorn.map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">{item.brand}</p>
                      </div>
                      <Badge variant="outline">Unworn</Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">All items have been worn!</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle>Shopping Trends</CardTitle>
              <CardDescription>Items added to wardrobe over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.monthlyChart}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};