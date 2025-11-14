import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MerchantFinancialDashboard } from '@/components/merchant/MerchantFinancialDashboard';
import { SupplierManagement } from '@/components/merchant/SupplierManagement';
import { DollarSign, Truck } from 'lucide-react';

const MerchantTerminalFinancial = () => {

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Financial Management</h1>
        <p className="text-muted-foreground">Track finances and manage supplier relationships</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="overview" className="gap-2">
            <DollarSign className="h-4 w-4" />
            Financial Overview
          </TabsTrigger>
          <TabsTrigger value="suppliers" className="gap-2">
            <Truck className="h-4 w-4" />
            Suppliers
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <MerchantFinancialDashboard />
        </TabsContent>

        <TabsContent value="suppliers">
          <SupplierManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};

  const totalRevenue = filteredAnalytics.reduce((sum, a) => sum + (a.total_sales || 0), 0);
  const totalOrders = filteredAnalytics.reduce((sum, a) => sum + (a.total_orders || 0), 0);
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Calculate commission (15% default)
  const commissionRate = 0.15;
  const commissionPaid = totalRevenue * commissionRate;
  const netRevenue = totalRevenue - commissionPaid;

  const filteredOrders = useMemo(() => {
    return orders?.filter(o => new Date(o.created_at) >= startDate) || [];
  }, [orders, startDate]);

  const completedOrders = filteredOrders.filter(o => o.status === 'completed');
  const refundedOrders = filteredOrders.filter(o => o.status === 'cancelled');
  const refundAmount = refundedOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);

  const paymentMethods = useMemo(() => {
    const methods: { [key: string]: number } = {};
    completedOrders.forEach(order => {
      const method = order.payment_method || 'card';
      methods[method] = (methods[method] || 0) + (order.total_amount || 0);
    });
    return Object.entries(methods).sort((a, b) => b[1] - a[1]);
  }, [completedOrders]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Financial Reports</h1>
          <p className="text-muted-foreground">Track revenue, expenses, and profitability</p>
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
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Gross Revenue</p>
                <p className="text-2xl font-bold">${totalRevenue.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground mt-1">Last {dateRange} days</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Net Revenue</p>
                <p className="text-2xl font-bold">${netRevenue.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground mt-1">After commission</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Order Value</p>
                <p className="text-2xl font-bold">${avgOrderValue.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground mt-1">Per transaction</p>
              </div>
              <Wallet className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Commission Paid</p>
                <p className="text-2xl font-bold">${commissionPaid.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground mt-1">15% platform fee</p>
              </div>
              <Receipt className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="payments">Payment Methods</TabsTrigger>
          <TabsTrigger value="taxes">Tax Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Breakdown</CardTitle>
                <CardDescription>Financial performance summary</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <span className="text-sm font-medium">Gross Sales</span>
                  <span className="text-lg font-bold text-green-600">${totalRevenue.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                  <span className="text-sm font-medium">Platform Commission</span>
                  <span className="text-lg font-bold text-orange-600">-${commissionPaid.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
                  <span className="text-sm font-medium">Refunds</span>
                  <span className="text-lg font-bold text-red-600">-${refundAmount.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-primary/10 rounded-lg border-2 border-primary">
                  <span className="font-semibold">Net Revenue</span>
                  <span className="text-xl font-bold text-primary">${(netRevenue - refundAmount).toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Daily Revenue Trend</CardTitle>
                <CardDescription>Last 7 days performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {filteredAnalytics.slice(0, 7).reverse().map((day) => (
                    <div key={day.date} className="flex items-center gap-2">
                      <span className="text-xs w-20 text-muted-foreground">
                        {format(new Date(day.date), 'MMM dd')}
                      </span>
                      <div className="flex-1 bg-muted/20 rounded-full h-8 overflow-hidden">
                        <div 
                          className="bg-primary h-full rounded-full flex items-center justify-end pr-3"
                          style={{ 
                            width: `${totalRevenue > 0 ? Math.max(((day.total_sales || 0) / totalRevenue) * 100, 5) : 5}%`
                          }}
                        >
                          <span className="text-xs text-primary-foreground font-medium">
                            ${(day.total_sales || 0).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Last {filteredOrders.length} transactions</CardDescription>
            </CardHeader>
            <CardContent>
              {filteredOrders.length > 0 ? (
                <div className="space-y-3">
                  {filteredOrders.slice(0, 20).map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">Order #{order.id.substring(0, 8)}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(order.created_at), 'PPp')}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge variant={
                          order.status === 'completed' ? 'default' : 
                          order.status === 'pending' ? 'secondary' : 
                          'destructive'
                        }>
                          {order.status}
                        </Badge>
                        <div className="text-right">
                          <p className="font-bold">${order.total_amount?.toFixed(2)}</p>
                          <p className="text-xs text-muted-foreground">{order.payment_method || 'card'}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">No transactions in this period</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Payment Methods Distribution
              </CardTitle>
              <CardDescription>Revenue by payment type</CardDescription>
            </CardHeader>
            <CardContent>
              {paymentMethods.length > 0 ? (
                <div className="space-y-3">
                  {paymentMethods.map(([method, amount]) => (
                    <div key={method} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium capitalize">{method.replace('_', ' ')}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">${amount.toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">
                          {totalRevenue > 0 ? ((amount / totalRevenue) * 100).toFixed(1) : '0'}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">No payment data available</p>
              )}
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
              <CardDescription>Estimated tax calculations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-muted/20 rounded-lg">
                  <p className="text-sm text-muted-foreground">Taxable Revenue</p>
                  <p className="text-2xl font-bold">${totalRevenue.toFixed(2)}</p>
                </div>
                <div className="p-4 bg-muted/20 rounded-lg">
                  <p className="text-sm text-muted-foreground">Est. Sales Tax (8%)</p>
                  <p className="text-2xl font-bold">${(totalRevenue * 0.08).toFixed(2)}</p>
                </div>
                <div className="p-4 bg-muted/20 rounded-lg">
                  <p className="text-sm text-muted-foreground">Net After Tax</p>
                  <p className="text-2xl font-bold">${(netRevenue * 0.92).toFixed(2)}</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <Button>
                  <Download className="w-4 h-4 mr-2" />
                  Download Tax Report
                </Button>
                <Button variant="outline">
                  <FileText className="w-4 h-4 mr-2" />
                  Generate Invoice
                </Button>
              </div>

              <div className="text-xs text-muted-foreground p-3 bg-muted/20 rounded">
                <p>⚠️ Tax calculations are estimates. Consult with a tax professional for accurate reporting.</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Monthly Tax History</CardTitle>
              <CardDescription>Historical tax records</CardDescription>
            </CardHeader>
            <CardContent>
              {filteredAnalytics.length > 0 ? (
                <div className="space-y-2">
                  {filteredAnalytics.slice(0, 12).reverse().map((day) => (
                    <div key={day.date} className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="text-sm">{format(new Date(day.date), 'MMMM dd, yyyy')}</span>
                      <div className="text-right">
                        <p className="font-medium">${((day.total_sales || 0) * 0.08).toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">Est. tax collected</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">No tax records available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MerchantTerminalFinancial;
