import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Package, 
  Users, 
  ShoppingCart,
  Eye,
  Star,
  Calendar,
  Download,
  Filter,
  RefreshCw
} from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { useMerchantItems } from '@/hooks/useMerchantItems';
import { useOrders } from '@/hooks/useOrders';

interface SalesMetrics {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  conversionRate: number;
  topSellingItems: Array<{
    id: string;
    name: string;
    sales: number;
    revenue: number;
  }>;
  revenueGrowth: number;
  ordersGrowth: number;
}

interface CustomerInsights {
  totalCustomers: number;
  newCustomers: number;
  returningCustomers: number;
  customerSatisfaction: number;
  topCustomers: Array<{
    id: string;
    name: string;
    orders: number;
    totalSpent: number;
  }>;
}

interface InventoryStats {
  totalItems: number;
  lowStockItems: number;
  outOfStockItems: number;
  topCategories: Array<{
    category: string;
    count: number;
    revenue: number;
  }>;
}

export const MerchantAnalyticsDashboard = () => {
  const { profile } = useProfile();
  const { items } = useMerchantItems();
  const { orders } = useOrders();
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState('30d');
  const [loading, setLoading] = useState(false);

  // Mock analytics data - in real app this would come from API
  const [salesMetrics, setSalesMetrics] = useState<SalesMetrics>({
    totalRevenue: 15420.50,
    totalOrders: 87,
    averageOrderValue: 177.25,
    conversionRate: 3.2,
    topSellingItems: [
      { id: '1', name: 'Classic White Tee', sales: 23, revenue: 1150 },
      { id: '2', name: 'Denim Jacket', sales: 18, revenue: 1980 },
      { id: '3', name: 'Summer Dress', sales: 15, revenue: 1275 }
    ],
    revenueGrowth: 12.5,
    ordersGrowth: 8.3
  });

  const [customerInsights, setCustomerInsights] = useState<CustomerInsights>({
    totalCustomers: 156,
    newCustomers: 23,
    returningCustomers: 64,
    customerSatisfaction: 4.6,
    topCustomers: [
      { id: '1', name: 'Emma Johnson', orders: 8, totalSpent: 1240.50 },
      { id: '2', name: 'Alex Smith', orders: 6, totalSpent: 980.25 },
      { id: '3', name: 'Sarah Davis', orders: 5, totalSpent: 750.00 }
    ]
  });

  const [inventoryStats, setInventoryStats] = useState<InventoryStats>({
    totalItems: items.length,
    lowStockItems: 8,
    outOfStockItems: 2,
    topCategories: [
      { category: 'Tops', count: 45, revenue: 6750 },
      { category: 'Dresses', count: 23, revenue: 4820 },
      { category: 'Outerwear', count: 18, revenue: 3960 }
    ]
  });

  const refreshData = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
  };

  if (profile?.role !== 'merchant' && profile?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Package className="mx-auto h-12 w-12 text-muted-foreground" />
          <h2 className="text-xl font-semibold">Merchant Access Required</h2>
          <p className="text-muted-foreground">This dashboard is only available for merchant accounts.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border z-10">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                Track your business performance and insights
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={refreshData} disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">${salesMetrics.totalRevenue.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Revenue</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                <span className="text-xs text-green-600">+{salesMetrics.revenueGrowth}%</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{salesMetrics.totalOrders}</p>
                  <p className="text-sm text-muted-foreground">Orders</p>
                </div>
                <ShoppingCart className="h-8 w-8 text-blue-600" />
              </div>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                <span className="text-xs text-green-600">+{salesMetrics.ordersGrowth}%</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{customerInsights.totalCustomers}</p>
                  <p className="text-sm text-muted-foreground">Customers</p>
                </div>
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <div className="flex items-center mt-2">
                <span className="text-xs text-muted-foreground">{customerInsights.newCustomers} new</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{inventoryStats.totalItems}</p>
                  <p className="text-sm text-muted-foreground">Products</p>
                </div>
                <Package className="h-8 w-8 text-orange-600" />
              </div>
              <div className="flex items-center mt-2">
                <span className="text-xs text-muted-foreground">{inventoryStats.lowStockItems} low stock</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Analytics */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="sales">Sales</TabsTrigger>
            <TabsTrigger value="customers">Customers</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Revenue Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
                    <p className="text-muted-foreground">Revenue Chart</p>
                  </div>
                </CardContent>
              </Card>

              {/* Order Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Order Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Pending</span>
                    <Badge variant="secondary">12</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Processing</span>
                    <Badge variant="secondary">8</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Shipped</span>
                    <Badge variant="secondary">23</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Delivered</span>
                    <Badge variant="secondary">44</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="sales" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Top Selling Products */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Selling Products</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {salesMetrics.topSellingItems.map((item, index) => (
                    <div key={item.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.sales} sales</p>
                      </div>
                      <p className="font-semibold">${item.revenue}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Sales Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle>Sales Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Average Order Value</span>
                    <span className="font-semibold">${salesMetrics.averageOrderValue}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Conversion Rate</span>
                    <span className="font-semibold">{salesMetrics.conversionRate}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Total Orders</span>
                    <span className="font-semibold">{salesMetrics.totalOrders}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="customers" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Top Customers */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Customers</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {customerInsights.topCustomers.map((customer, index) => (
                    <div key={customer.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{customer.name}</p>
                        <p className="text-xs text-muted-foreground">{customer.orders} orders</p>
                      </div>
                      <p className="font-semibold">${customer.totalSpent}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Customer Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Customer Insights</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">New Customers</span>
                    <span className="font-semibold">{customerInsights.newCustomers}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Returning Customers</span>
                    <span className="font-semibold">{customerInsights.returningCustomers}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Satisfaction Rating</span>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-500 mr-1" />
                      <span className="font-semibold">{customerInsights.customerSatisfaction}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="inventory" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Category Performance */}
              <Card>
                <CardHeader>
                  <CardTitle>Category Performance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {inventoryStats.topCategories.map((category, index) => (
                    <div key={category.category} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{category.category}</p>
                        <p className="text-xs text-muted-foreground">{category.count} items</p>
                      </div>
                      <p className="font-semibold">${category.revenue}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Inventory Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Inventory Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Total Products</span>
                    <span className="font-semibold">{inventoryStats.totalItems}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Low Stock</span>
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                      {inventoryStats.lowStockItems}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Out of Stock</span>
                    <Badge variant="secondary" className="bg-red-100 text-red-800">
                      {inventoryStats.outOfStockItems}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};