import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, DollarSign, ShoppingCart, Users } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const dailyData = [
  { date: "Mon", revenue: 2400, orders: 24, customers: 18 },
  { date: "Tue", revenue: 1398, orders: 18, customers: 14 },
  { date: "Wed", revenue: 9800, orders: 42, customers: 35 },
  { date: "Thu", revenue: 3908, orders: 28, customers: 22 },
  { date: "Fri", revenue: 4800, orders: 38, customers: 30 },
  { date: "Sat", revenue: 3800, orders: 32, customers: 28 },
  { date: "Sun", revenue: 4300, orders: 35, customers: 29 },
];

const monthlyData = [
  { month: "Jan", revenue: 65000, orders: 420, customers: 280 },
  { month: "Feb", revenue: 59000, orders: 380, customers: 250 },
  { month: "Mar", revenue: 80000, orders: 520, customers: 340 },
  { month: "Apr", revenue: 81000, orders: 530, customers: 360 },
  { month: "May", revenue: 56000, orders: 370, customers: 240 },
  { month: "Jun", revenue: 95000, orders: 620, customers: 420 },
];

export const MerchantRevenueChart = () => {
  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Revenue Analytics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="daily" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="daily">Daily</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
          </TabsList>

          <TabsContent value="daily" className="space-y-4">
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <DollarSign className="h-4 w-4" />
                  Avg Daily Revenue
                </div>
                <p className="text-2xl font-bold">
                  ${(dailyData.reduce((sum, d) => sum + d.revenue, 0) / dailyData.length).toFixed(0)}
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <ShoppingCart className="h-4 w-4" />
                  Avg Orders
                </div>
                <p className="text-2xl font-bold">
                  {Math.round(dailyData.reduce((sum, d) => sum + d.orders, 0) / dailyData.length)}
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Users className="h-4 w-4" />
                  Avg Customers
                </div>
                <p className="text-2xl font-bold">
                  {Math.round(dailyData.reduce((sum, d) => sum + d.customers, 0) / dailyData.length)}
                </p>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} />
                <Line type="monotone" dataKey="orders" stroke="hsl(var(--secondary))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="monthly" className="space-y-4">
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <DollarSign className="h-4 w-4" />
                  Total Revenue
                </div>
                <p className="text-2xl font-bold">
                  ${(monthlyData.reduce((sum, d) => sum + d.revenue, 0) / 1000).toFixed(0)}K
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <ShoppingCart className="h-4 w-4" />
                  Total Orders
                </div>
                <p className="text-2xl font-bold">
                  {monthlyData.reduce((sum, d) => sum + d.orders, 0)}
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Users className="h-4 w-4" />
                  Total Customers
                </div>
                <p className="text-2xl font-bold">
                  {monthlyData.reduce((sum, d) => sum + d.customers, 0)}
                </p>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="revenue" fill="hsl(var(--primary))" />
                <Bar dataKey="orders" fill="hsl(var(--secondary))" />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
