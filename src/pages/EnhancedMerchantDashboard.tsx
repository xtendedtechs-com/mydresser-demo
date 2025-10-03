import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MerchantRevenueChart } from "@/components/MerchantRevenueChart";
import { TopProductsCard } from "@/components/TopProductsCard";
import { RecentOrdersCard } from "@/components/RecentOrdersCard";
import { DollarSign, ShoppingCart, Users, TrendingUp, Package, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const EnhancedMerchantDashboard = () => {
  const stats = [
    {
      title: "Total Revenue",
      value: "$45,231",
      change: "+20.1%",
      changeType: "positive" as const,
      icon: DollarSign,
      description: "vs last month",
    },
    {
      title: "Orders",
      value: "234",
      change: "+12.5%",
      changeType: "positive" as const,
      icon: ShoppingCart,
      description: "vs last month",
    },
    {
      title: "Customers",
      value: "156",
      change: "+8.2%",
      changeType: "positive" as const,
      icon: Users,
      description: "vs last month",
    },
    {
      title: "Products Sold",
      value: "589",
      change: "+15.3%",
      changeType: "positive" as const,
      icon: Package,
      description: "vs last month",
    },
  ];

  const alerts = [
    { type: "warning", message: "3 items low in stock" },
    { type: "info", message: "5 pending orders require attention" },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Merchant Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor your store performance and manage operations
          </p>
        </div>

        {/* Alerts */}
        {alerts.length > 0 && (
          <div className="space-y-2">
            {alerts.map((alert, index) => (
              <div
                key={index}
                className={`flex items-center gap-2 p-3 rounded-lg border ${
                  alert.type === "warning"
                    ? "bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-950 dark:border-yellow-800 dark:text-yellow-200"
                    : "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-200"
                }`}
              >
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm font-medium">{alert.message}</span>
              </div>
            ))}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="flex items-center gap-2 mt-1">
                  <Badge
                    variant={stat.changeType === "positive" ? "default" : "destructive"}
                    className="text-xs"
                  >
                    {stat.change}
                  </Badge>
                  <p className="text-xs text-muted-foreground">{stat.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts and Data */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <MerchantRevenueChart />
          <TopProductsCard />
        </div>

        {/* Recent Orders */}
        <RecentOrdersCard />
      </div>
    </div>
  );
};

export default EnhancedMerchantDashboard;
