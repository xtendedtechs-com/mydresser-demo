import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, TrendingUp, TrendingDown, Download, 
  Calendar, FileText, PieChart, BarChart3,
  CreditCard, Wallet, Receipt, Target
} from 'lucide-react';

const FinancialReports = () => {
  const [dateRange, setDateRange] = React.useState('30days');
  const [reportType, setReportType] = React.useState('all');

  const metrics = [
    {
      title: "Total Revenue",
      value: "$45,320.89",
      change: "+12.5%",
      trend: "up",
      icon: DollarSign,
      color: "text-green-600"
    },
    {
      title: "Net Profit",
      value: "$23,180.45",
      change: "+8.2%",
      trend: "up",
      icon: TrendingUp,
      color: "text-green-600"
    },
    {
      title: "Total Orders",
      value: "1,284",
      change: "+15.3%",
      trend: "up",
      icon: Receipt,
      color: "text-blue-600"
    },
    {
      title: "Average Order Value",
      value: "$35.31",
      change: "-2.1%",
      trend: "down",
      icon: Target,
      color: "text-orange-600"
    }
  ];

  const transactions = [
    { id: "TXN001", date: "2024-01-15", customer: "Sarah Johnson", amount: "$89.99", status: "completed", method: "Credit Card" },
    { id: "TXN002", date: "2024-01-15", customer: "Mike Chen", amount: "$156.50", status: "completed", method: "PayPal" },
    { id: "TXN003", date: "2024-01-14", customer: "Emma Davis", amount: "$45.00", status: "pending", method: "Bank Transfer" },
    { id: "TXN004", date: "2024-01-14", customer: "James Wilson", amount: "$78.25", status: "completed", method: "Credit Card" },
    { id: "TXN005", date: "2024-01-13", customer: "Lisa Anderson", amount: "$234.99", status: "refunded", method: "Credit Card" },
  ];

  const monthlyData = [
    { month: "Jan", revenue: 42000, profit: 18000, orders: 1200 },
    { month: "Feb", revenue: 38000, profit: 16000, orders: 1100 },
    { month: "Mar", revenue: 45000, profit: 20000, orders: 1300 },
    { month: "Apr", revenue: 48000, profit: 22000, orders: 1400 },
    { month: "May", revenue: 52000, profit: 25000, orders: 1500 },
    { month: "Jun", revenue: 49000, profit: 23000, orders: 1350 },
  ];

  const topProducts = [
    { name: "Premium Leather Jacket", sales: "$4,250", units: 85, percentage: 24 },
    { name: "Designer Jeans", sales: "$3,680", units: 120, percentage: 20 },
    { name: "Silk Blouse", sales: "$2,940", units: 98, percentage: 16 },
    { name: "Running Shoes", sales: "$2,150", units: 43, percentage: 12 },
    { name: "Winter Coat", sales: "$1,890", units: 35, percentage: 10 },
  ];

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Financial Reports</h1>
        <div className="flex items-center gap-4">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="90days">Last 90 days</SelectItem>
              <SelectItem value="1year">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button>
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{metric.title}</p>
                  <p className="text-2xl font-bold">{metric.value}</p>
                  <div className="flex items-center mt-1">
                    {metric.trend === 'up' ? (
                      <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-600 mr-1" />
                    )}
                    <span className={`text-sm ${metric.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                      {metric.change}
                    </span>
                  </div>
                </div>
                <metric.icon className={`w-8 h-8 ${metric.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="taxes">Tax Reports</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Revenue Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-muted/20 rounded-lg">
                  <div className="text-center">
                    <BarChart3 className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-muted-foreground">Revenue chart visualization</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  Sales by Category
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-muted/20 rounded-lg">
                  <div className="text-center">
                    <PieChart className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-muted-foreground">Category breakdown chart</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Monthly Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Month</th>
                      <th className="text-right p-2">Revenue</th>
                      <th className="text-right p-2">Profit</th>
                      <th className="text-right p-2">Orders</th>
                      <th className="text-right p-2">Growth</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthlyData.map((month, index) => (
                      <tr key={month.month} className="border-b">
                        <td className="p-2 font-medium">{month.month}</td>
                        <td className="text-right p-2">${month.revenue.toLocaleString()}</td>
                        <td className="text-right p-2">${month.profit.toLocaleString()}</td>
                        <td className="text-right p-2">{month.orders}</td>
                        <td className="text-right p-2">
                          {index > 0 && (
                            <Badge variant={monthlyData[index].revenue > monthlyData[index - 1].revenue ? "default" : "secondary"}>
                              {monthlyData[index].revenue > monthlyData[index - 1].revenue ? "+" : ""}
                              {(((monthlyData[index].revenue - monthlyData[index - 1].revenue) / monthlyData[index - 1].revenue) * 100).toFixed(1)}%
                            </Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Recent Transactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-medium">{transaction.customer}</p>
                        <p className="text-sm text-muted-foreground">{transaction.id} • {transaction.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge 
                        variant={
                          transaction.status === 'completed' ? 'default' : 
                          transaction.status === 'pending' ? 'secondary' : 
                          'destructive'
                        }
                      >
                        {transaction.status}
                      </Badge>
                      <div className="text-right">
                        <p className="font-medium">{transaction.amount}</p>
                        <p className="text-sm text-muted-foreground">{transaction.method}</p>
                      </div>
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
              <CardTitle>Top Performing Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topProducts.map((product, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">{product.units} units sold</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{product.sales}</p>
                      <p className="text-sm text-muted-foreground">{product.percentage}% of total</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="taxes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Tax Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-muted/20 rounded-lg">
                  <p className="text-sm text-muted-foreground">Total Tax Collected</p>
                  <p className="text-2xl font-bold">$3,890.45</p>
                </div>
                <div className="p-4 bg-muted/20 rounded-lg">
                  <p className="text-sm text-muted-foreground">Sales Tax</p>
                  <p className="text-2xl font-bold">$2,450.30</p>
                </div>
                <div className="p-4 bg-muted/20 rounded-lg">
                  <p className="text-sm text-muted-foreground">State Tax</p>
                  <p className="text-2xl font-bold">$1,440.15</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <Button>
                  <Download className="w-4 h-4 mr-2" />
                  Download Tax Report
                </Button>
                <Button variant="outline">
                  <FileText className="w-4 h-4 mr-2" />
                  Generate 1099 Forms
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Customer Acquisition</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-muted/20 rounded-lg">
                  <div className="text-center">
                    <TrendingUp className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-muted-foreground">Customer acquisition analytics</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Sources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-muted/20 rounded-lg">
                  <div className="text-center">
                    <Wallet className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-muted-foreground">Revenue source breakdown</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinancialReports;