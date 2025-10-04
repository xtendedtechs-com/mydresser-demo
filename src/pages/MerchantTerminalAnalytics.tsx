import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMerchantAnalytics } from '@/hooks/useMerchantAnalytics';
import { useOrders } from '@/hooks/useOrders';
import { useMerchantItems } from '@/hooks/useMerchantItems';
import { useState, useMemo } from 'react';
import { 
  DollarSign, TrendingUp, ShoppingCart, Package, 
  Download, Users, Star, Eye, Heart, Activity
} from 'lucide-react';
import { format, subDays } from 'date-fns';

const MerchantTerminalAnalytics = () => {
  const { analytics, calculateDailyAnalytics, isCalculating } = useMerchantAnalytics();
  const { orders } = useOrders();
  const { items } = useMerchantItems();
  const [dateRange, setDateRange] = useState('30');

  const dateRangeNum = parseInt(dateRange);
  const startDate = subDays(new Date(), dateRangeNum);

  const recentAnalytics = useMemo(() => {
    return analytics?.filter(a => new Date(a.date) >= startDate) || [];
  }, [analytics, startDate]);

  const totalRevenue = recentAnalytics.reduce((sum, a) => sum + (a.total_sales || 0), 0);
  const totalOrders = recentAnalytics.reduce((sum, a) => sum + (a.total_orders || 0), 0);
  const totalItems = recentAnalytics.reduce((sum, a) => sum + (a.total_items_sold || 0), 0);
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const newCustomers = recentAnalytics.reduce((sum, a) => sum + (a.new_customers || 0), 0);
  const returningCustomers = recentAnalytics.reduce((sum, a) => sum + (a.returning_customers || 0), 0);

  const topSellingItems = useMemo(() => {
    const itemSales: { [key: string]: { name: string; quantity: number; revenue: number; category: string } } = {};
    
    recentAnalytics.forEach(analytics => {
      if (analytics.top_selling_items && Array.isArray(analytics.top_selling_items)) {
        analytics.top_selling_items.forEach((item: any) => {
          if (!itemSales[item.name]) {
            itemSales[item.name] = { 
              name: item.name, 
              quantity: 0, 
              revenue: 0,
              category: item.category || 'Uncategorized'
            };
          }
          itemSales[item.name].quantity += item.quantity || 0;
          itemSales[item.name].revenue += (item.quantity || 0) * (item.price || 0);
        });
      }
    });

    return Object.values(itemSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [recentAnalytics]);

  const categoryRevenue = useMemo(() => {
    const catRev: { [key: string]: number } = {};
    
    recentAnalytics.forEach(analytics => {
      if (analytics.revenue_by_category) {
        Object.entries(analytics.revenue_by_category as any).forEach(([cat, rev]) => {
          catRev[cat] = (catRev[cat] || 0) + (rev as number);
        });
      }
    });

    return Object.entries(catRev)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [recentAnalytics]);

  const completedOrders = orders?.filter(o => o.status === 'completed').length || 0;
  const pendingOrders = orders?.filter(o => o.status === 'pending').length || 0;
  const cancelledOrders = orders?.filter(o => o.status === 'cancelled').length || 0;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Track your business performance and insights</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => calculateDailyAnalytics()} disabled={isCalculating}>
            <Activity className="w-4 h-4 mr-2" />
            {isCalculating ? 'Updating...' : 'Refresh'}
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Last {dateRange} days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
            <p className="text-xs text-muted-foreground">{completedOrders} completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Items Sold</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItems}</div>
            <p className="text-xs text-muted-foreground">Across all orders</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${avgOrderValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Per transaction</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Status Breakdown</CardTitle>
                <CardDescription>Current order fulfillment status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="text-sm font-medium">Completed Orders</span>
                  <span className="text-xl font-bold text-green-600">{completedOrders}</span>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="text-sm font-medium">Pending Orders</span>
                  <span className="text-xl font-bold text-orange-600">{pendingOrders}</span>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="text-sm font-medium">Cancelled/Refunded</span>
                  <span className="text-xl font-bold text-red-600">{cancelledOrders}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue by Category</CardTitle>
                <CardDescription>Top performing categories</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {categoryRevenue.length > 0 ? (
                  categoryRevenue.map(([category, revenue]) => (
                    <div key={category} className="flex items-center justify-between">
                      <span className="text-sm capitalize">{category}</span>
                      <span className="font-semibold">${revenue.toFixed(2)}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">No category data available</p>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Daily Performance</CardTitle>
              <CardDescription>Last {dateRange} days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {recentAnalytics.slice(0, 10).map((day) => (
                  <div key={day.date} className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="text-sm">{format(new Date(day.date), 'MMM dd, yyyy')}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-medium">${day.total_sales?.toFixed(2) || '0.00'}</span>
                      <span className="text-sm text-muted-foreground">{day.total_orders || 0} orders</span>
                      <span className="text-sm text-muted-foreground">{day.total_items_sold || 0} items</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Selling Products</CardTitle>
              <CardDescription>Best performers in the last {dateRange} days</CardDescription>
            </CardHeader>
            <CardContent>
              {topSellingItems.length > 0 ? (
                <div className="space-y-3">
                  {topSellingItems.map((item, index) => (
                    <div key={item.name} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">{item.category}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">${item.revenue.toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground">{item.quantity} units sold</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">No sales data available</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Inventory Status</CardTitle>
              <CardDescription>Current stock levels</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <Package className="w-6 h-6 mx-auto mb-2 text-green-600" />
                  <p className="text-2xl font-bold">{items.filter(i => (i.stock_quantity || 0) > 10).length}</p>
                  <p className="text-xs text-muted-foreground">In Stock</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <Package className="w-6 h-6 mx-auto mb-2 text-orange-600" />
                  <p className="text-2xl font-bold">{items.filter(i => (i.stock_quantity || 0) > 0 && (i.stock_quantity || 0) <= 10).length}</p>
                  <p className="text-xs text-muted-foreground">Low Stock</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <Package className="w-6 h-6 mx-auto mb-2 text-red-600" />
                  <p className="text-2xl font-bold">{items.filter(i => (i.stock_quantity || 0) === 0).length}</p>
                  <p className="text-xs text-muted-foreground">Out of Stock</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Customer Acquisition</CardTitle>
                <CardDescription>New vs returning customers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium">New Customers</span>
                    </div>
                    <span className="text-xl font-bold">{newCustomers}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium">Returning Customers</span>
                    </div>
                    <span className="text-xl font-bold">{returningCustomers}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-purple-600" />
                      <span className="text-sm font-medium">Retention Rate</span>
                    </div>
                    <span className="text-xl font-bold">
                      {newCustomers + returningCustomers > 0 
                        ? ((returningCustomers / (newCustomers + returningCustomers)) * 100).toFixed(1)
                        : '0.0'}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Engagement Metrics</CardTitle>
                <CardDescription>Customer interaction statistics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium">Total Views</span>
                    </div>
                    <span className="text-xl font-bold">
                      <span className="text-xl font-bold">0</span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <Heart className="w-4 h-4 text-red-600" />
                      <span className="text-sm font-medium">Total Likes</span>
                    </div>
                    <span className="text-xl font-bold">
                      <span className="text-xl font-bold">0</span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-600" />
                      <span className="text-sm font-medium">Featured Items</span>
                    </div>
                    <span className="text-xl font-bold">
                      {items.filter(item => item.is_featured).length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Trends</CardTitle>
              <CardDescription>Track your business growth over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-semibold mb-3">Revenue Trend</h4>
                  <div className="space-y-2">
                    {recentAnalytics.slice(0, 7).reverse().map((day) => (
                      <div key={day.date} className="flex items-center gap-2">
                        <span className="text-xs w-20 text-muted-foreground">
                          {format(new Date(day.date), 'MMM dd')}
                        </span>
                        <div className="flex-1 bg-muted/20 rounded-full h-6 overflow-hidden">
                          <div 
                            className="bg-primary h-full rounded-full flex items-center justify-end pr-2"
                            style={{ 
                              width: `${totalRevenue > 0 ? ((day.total_sales || 0) / totalRevenue) * 100 : 0}%`,
                              minWidth: '30px'
                            }}
                          >
                            <span className="text-xs text-white font-medium">
                              ${(day.total_sales || 0).toFixed(0)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold mb-3">Order Volume Trend</h4>
                  <div className="space-y-2">
                    {recentAnalytics.slice(0, 7).reverse().map((day) => (
                      <div key={day.date} className="flex items-center gap-2">
                        <span className="text-xs w-20 text-muted-foreground">
                          {format(new Date(day.date), 'MMM dd')}
                        </span>
                        <div className="flex-1 bg-muted/20 rounded-full h-6 overflow-hidden">
                          <div 
                            className="bg-secondary h-full rounded-full flex items-center justify-end pr-2"
                            style={{ 
                              width: `${totalOrders > 0 ? ((day.total_orders || 0) / totalOrders) * 100 : 0}%`,
                              minWidth: '25px'
                            }}
                          >
                            <span className="text-xs text-secondary-foreground font-medium">
                              {day.total_orders || 0}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MerchantTerminalAnalytics;
