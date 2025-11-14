import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, TrendingDown, AlertCircle, Brain, Package, Users, DollarSign } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const salesForecast = [
  { month: 'Jan', actual: 4500, predicted: 4200 },
  { month: 'Feb', actual: 5200, predicted: 5100 },
  { month: 'Mar', actual: 4800, predicted: 4900 },
  { month: 'Apr', actual: 6100, predicted: 6000 },
  { month: 'May', predicted: 6500 },
  { month: 'Jun', predicted: 7200 },
  { month: 'Jul', predicted: 7800 },
];

const inventoryPredictions = [
  { item: 'T-Shirts', current: 145, predicted: 45, risk: 'high' },
  { item: 'Jeans', current: 89, predicted: 72, risk: 'low' },
  { item: 'Dresses', current: 62, predicted: 28, risk: 'medium' },
  { item: 'Shoes', current: 120, predicted: 95, risk: 'low' },
];

export const PredictiveAnalytics = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Predictive Analytics</h2>
        <p className="text-muted-foreground">AI-powered insights and forecasting for smarter decisions</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Sales Forecast</p>
                <p className="text-2xl font-bold">$7.8K</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3 text-green-600" />
                  <span className="text-xs text-green-600">+18% vs last month</span>
                </div>
              </div>
              <DollarSign className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Stock Alerts</p>
                <p className="text-2xl font-bold">3</p>
                <p className="text-xs text-muted-foreground mt-1">Items need restock soon</p>
              </div>
              <Package className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Churn Risk</p>
                <p className="text-2xl font-bold">12</p>
                <p className="text-xs text-muted-foreground mt-1">Customers at risk</p>
              </div>
              <Users className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Confidence</p>
                <p className="text-2xl font-bold">92%</p>
                <p className="text-xs text-muted-foreground mt-1">Prediction accuracy</p>
              </div>
              <Brain className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="sales" className="space-y-6">
        <TabsList>
          <TabsTrigger value="sales">Sales Forecast</TabsTrigger>
          <TabsTrigger value="inventory">Inventory Predictions</TabsTrigger>
          <TabsTrigger value="customers">Customer Insights</TabsTrigger>
          <TabsTrigger value="trends">Market Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Forecast</CardTitle>
              <CardDescription>AI-powered sales predictions for next 3 months</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={salesForecast}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="actual" stroke="hsl(var(--primary))" strokeWidth={2} />
                  <Line type="monotone" dataKey="predicted" stroke="hsl(var(--muted-foreground))" strokeDasharray="5 5" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Stock Level Predictions</CardTitle>
              <CardDescription>Forecasted inventory needs for next 30 days</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {inventoryPredictions.map((item) => (
                <div key={item.item} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">{item.item}</p>
                    <p className="text-sm text-muted-foreground">Current: {item.current} units</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm font-medium">Predicted: {item.predicted}</p>
                      <Badge variant={item.risk === 'high' ? 'destructive' : item.risk === 'medium' ? 'default' : 'secondary'}>
                        {item.risk} risk
                      </Badge>
                    </div>
                    {item.risk === 'high' && <AlertCircle className="w-5 h-5 text-destructive" />}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Customer Behavior Insights</CardTitle>
              <CardDescription>Predicted customer trends and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <p className="font-medium">Growing Segment: Young Professionals</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  23% increase in purchases from age 25-34 demographic expected next quarter
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-5 h-5 text-orange-500" />
                  <p className="font-medium">Churn Risk Alert</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  12 customers haven't purchased in 60+ days - consider re-engagement campaign
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <p className="font-medium">High-Value Opportunity</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  34 customers are predicted to increase spending by 40% with personalized offers
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Market Trends Analysis</CardTitle>
              <CardDescription>Industry insights and emerging fashion trends</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border rounded-lg">
                <p className="font-medium mb-2">Sustainable Fashion Rising</p>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-muted-foreground">+45% search interest</span>
                </div>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="font-medium mb-2">Vintage Styles Comeback</p>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-muted-foreground">+32% demand increase</span>
                </div>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="font-medium mb-2">Athleisure Plateauing</p>
                <div className="flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-red-600" />
                  <span className="text-sm text-muted-foreground">-8% growth slowdown</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
