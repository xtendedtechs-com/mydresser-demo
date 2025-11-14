import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Package,
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowUpRight
} from 'lucide-react';
import { useMerchantAnalytics } from '@/hooks/useMerchantAnalytics';

export function EnhancedDashboardWidgets() {
  const { analytics, totals } = useMerchantAnalytics();

  const todayAnalytics = analytics[analytics.length - 1] || {
    sales: 0,
    orders: 0,
    views: 0
  };

  const avgOrderValue = totals.orders > 0 ? totals.sales / totals.orders : 0;
  const conversionRate = totals.views > 0 ? (totals.orders / totals.views) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${todayAnalytics.sales.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <span className="text-green-500">+12%</span> from yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orders Today</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayAnalytics.orders}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <span className="text-green-500">+8%</span> from yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${avgOrderValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <TrendingDown className="h-3 w-3 text-red-500" />
              <span className="text-red-500">-3%</span> from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <span className="text-green-500">+2%</span> from last week
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-4">
            <Button variant="outline" className="justify-start h-auto p-4">
              <div className="flex flex-col items-start gap-2 w-full">
                <ShoppingCart className="h-5 w-5" />
                <span className="font-medium">New Sale</span>
                <span className="text-xs text-muted-foreground">Process order</span>
              </div>
            </Button>
            <Button variant="outline" className="justify-start h-auto p-4">
              <div className="flex flex-col items-start gap-2 w-full">
                <Package className="h-5 w-5" />
                <span className="font-medium">Add Product</span>
                <span className="text-xs text-muted-foreground">New inventory</span>
              </div>
            </Button>
            <Button variant="outline" className="justify-start h-auto p-4">
              <div className="flex flex-col items-start gap-2 w-full">
                <Users className="h-5 w-5" />
                <span className="font-medium">View Customers</span>
                <span className="text-xs text-muted-foreground">CRM access</span>
              </div>
            </Button>
            <Button variant="outline" className="justify-start h-auto p-4">
              <div className="flex flex-col items-start gap-2 w-full">
                <TrendingUp className="h-5 w-5" />
                <span className="font-medium">Reports</span>
                <span className="text-xs text-muted-foreground">View analytics</span>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Alerts & Notifications */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { type: 'success', message: 'New order #1234 received', time: '2 min ago' },
              { type: 'warning', message: 'Low stock on Classic T-Shirt', time: '15 min ago' },
              { type: 'info', message: 'Payment processed for order #1233', time: '1 hour ago' },
              { type: 'success', message: 'New customer registered', time: '2 hours ago' }
            ].map((activity, i) => (
              <div key={i} className="flex items-start gap-3 p-2 rounded-lg hover:bg-accent transition-colors">
                {activity.type === 'success' && <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />}
                {activity.type === 'warning' && <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5" />}
                {activity.type === 'info' && <Clock className="h-4 w-4 text-blue-500 mt-0.5" />}
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">{activity.message}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Inventory Alerts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { product: 'Classic T-Shirt', stock: 5, threshold: 10, status: 'low' },
              { product: 'Denim Jeans', stock: 2, threshold: 5, status: 'critical' },
              { product: 'Leather Jacket', stock: 8, threshold: 10, status: 'low' }
            ].map((item, i) => (
              <div key={i} className="space-y-2 p-3 border rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{item.product}</span>
                  <Badge variant={item.status === 'critical' ? 'destructive' : 'secondary'}>
                    {item.stock} left
                  </Badge>
                </div>
                <Progress value={(item.stock / item.threshold) * 100} className="h-2" />
                <Button variant="outline" size="sm" className="w-full">
                  <ArrowUpRight className="w-3 h-3 mr-2" />
                  Reorder
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Daily Goals */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Goals</CardTitle>
          <CardDescription>Track progress towards today's targets</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Sales Target</span>
              <span className="font-medium">${todayAnalytics.sales.toFixed(0)} / $1,000</span>
            </div>
            <Progress value={(todayAnalytics.sales / 1000) * 100} />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Orders Target</span>
              <span className="font-medium">{todayAnalytics.orders} / 25</span>
            </div>
            <Progress value={(todayAnalytics.orders / 25) * 100} />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>New Customers</span>
              <span className="font-medium">3 / 10</span>
            </div>
            <Progress value={30} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
