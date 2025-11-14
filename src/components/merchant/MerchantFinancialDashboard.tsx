import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMerchantAnalytics } from '@/hooks/useMerchantAnalytics';
import { DollarSign, TrendingUp, Receipt, CreditCard } from 'lucide-react';

export const MerchantFinancialDashboard = () => {
  const { analytics, totals, isLoading } = useMerchantAnalytics();

  const stats = [
    {
      title: 'Total Revenue',
      value: `$${totals.sales.toLocaleString()}`,
      icon: DollarSign,
      trend: '+12.5%',
    },
    {
      title: 'Total Orders',
      value: totals.orders.toLocaleString(),
      icon: Receipt,
      trend: '+8.2%',
    },
    {
      title: 'Average Order Value',
      value: totals.orders > 0 ? `$${(totals.sales / totals.orders).toFixed(2)}` : '$0.00',
      icon: CreditCard,
      trend: '+3.1%',
    },
    {
      title: 'Growth Rate',
      value: '15.3%',
      icon: TrendingUp,
      trend: '+2.4%',
    },
  ];

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="h-20 bg-muted/50" />
            <CardContent className="h-16 bg-muted/30" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">{stat.trend}</span> from last month
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Financial Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.slice(-5).reverse().map((day) => (
              <div key={day.date} className="flex items-center justify-between border-b pb-3 last:border-0">
                <div>
                  <p className="font-medium">{new Date(day.date).toLocaleDateString()}</p>
                  <p className="text-sm text-muted-foreground">{day.orders} orders</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">${day.sales.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">
                    ${day.average_order_value?.toFixed(2) || '0.00'} avg
                  </p>
                </div>
              </div>
            ))}
            {analytics.length === 0 && (
              <p className="text-center text-muted-foreground py-8">No financial data available yet</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
