import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useMerchantAnalytics } from '@/hooks/useMerchantAnalytics';
import { useOrders } from '@/hooks/useOrders';
import { useMerchantItems } from '@/hooks/useMerchantItems';
import { DollarSign, ShoppingCart, TrendingUp, Package, AlertCircle, Heart, Eye } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export const MerchantDashboardOverview = () => {
  const { analytics } = useMerchantAnalytics();
  const { orders } = useOrders();
  const { items } = useMerchantItems();

  const todayAnalytics = analytics?.[0];
  const pendingOrders = orders?.filter(o => o.status === 'pending').length || 0;
  const fulfilledOrders = orders?.filter(o => o.status === 'completed').length || 0;
  const lowStockItems = items?.filter(i => (i.stock_quantity || 0) < 10).length || 0;
  const outOfStockItems = items?.filter(i => (i.stock_quantity || 0) === 0).length || 0;

  const conversionRate = todayAnalytics?.total_orders 
    ? ((todayAnalytics.total_orders / 100) * 100).toFixed(1)
    : '0.0';

  return (
    <div className="space-y-6">
      {/* Sales Performance */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Sales Performance</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${todayAnalytics?.total_sales?.toFixed(2) || '0.00'}
              </div>
              <p className="text-xs text-muted-foreground">Today's sales</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Units Sold</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {todayAnalytics?.total_items_sold || 0}
              </div>
              <p className="text-xs text-muted-foreground">Items sold today</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${todayAnalytics?.average_order_value?.toFixed(2) || '0.00'}
              </div>
              <p className="text-xs text-muted-foreground">Per order</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{conversionRate}%</div>
              <p className="text-xs text-muted-foreground">Views to purchases</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Order Status */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Order Status</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingOrders}</div>
              <p className="text-xs text-muted-foreground">Awaiting fulfillment</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Fulfilled Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{fulfilledOrders}</div>
              <p className="text-xs text-muted-foreground">Successfully completed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Returns/Refunds</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">Recent returns</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Inventory Health */}
      <Card>
        <CardHeader>
          <CardTitle>Inventory Health</CardTitle>
          <CardDescription>Stock status and alerts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium">Low Stock Alerts</span>
            </div>
            <span className="text-2xl font-bold">{lowStockItems}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-destructive" />
              <span className="text-sm font-medium">Out of Stock</span>
            </div>
            <span className="text-2xl font-bold">{outOfStockItems}</span>
          </div>

          {todayAnalytics?.top_selling_items && todayAnalytics.top_selling_items.length > 0 && (
            <div className="pt-4 border-t">
              <h4 className="text-sm font-medium mb-3">Top Selling Items</h4>
              <div className="space-y-2">
                {todayAnalytics.top_selling_items.slice(0, 3).map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm">{item.name}</span>
                    <span className="text-sm font-semibold">
                      {item.quantity} sold
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Customer Engagement */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Engagement</CardTitle>
          <CardDescription>User interactions and metrics</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Item Saves/Likes</span>
            </div>
            <span className="text-xl font-bold">0</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Total Views</span>
            </div>
            <span className="text-xl font-bold">0</span>
          </div>

          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Try-On Rate</span>
              <span className="text-sm">0%</span>
            </div>
            <Progress value={0} className="h-2" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
