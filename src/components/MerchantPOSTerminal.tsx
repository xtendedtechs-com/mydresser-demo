import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  ShoppingCart, 
  Package, 
  Users, 
  Tag, 
  TrendingUp,
  DollarSign,
  Activity,
  Globe,
  Settings,
  HelpCircle,
  Handshake
} from 'lucide-react';
import { useMerchantAnalytics } from '@/hooks/useMerchantAnalytics';
import { useOrders } from '@/hooks/useOrders';
import { useMerchantItems } from '@/hooks/useMerchantItems';
import { EnhancedMerchantPageEditor } from '@/components/EnhancedMerchantPageEditor';
import { MerchantSettingsPanel } from '@/components/settings/MerchantSettingsPanel';
import AddMerchantProductDialog from '@/components/AddMerchantProductDialog';
import CustomerRelations from '@/pages/CustomerRelations';
import FinancialReports from '@/pages/FinancialReports';
import SupportResources from '@/pages/SupportsResources';
import BrandPartnershipsPage from '@/pages/BrandPartnershipsPage';

export const MerchantPOSTerminal = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const { analytics, calculateDailyAnalytics, isCalculating } = useMerchantAnalytics();
  const { orders } = useOrders();
  const { items, refetch } = useMerchantItems();

  const todayAnalytics = analytics?.[0];
  const pendingOrders = orders?.filter(o => o.status === 'pending').length || 0;
  const lowStockItems = items?.filter(i => (i.stock_quantity || 0) < 10).length || 0;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">MyDresser POS Terminal</h1>
          <p className="text-muted-foreground">Manage your store operations</p>
        </div>
        <Button 
          onClick={() => calculateDailyAnalytics()}
          disabled={isCalculating}
        >
          <Activity className="w-4 h-4 mr-2" />
          {isCalculating ? 'Calculating...' : 'Update Analytics'}
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${todayAnalytics?.total_sales?.toFixed(2) || '0.00'}
            </div>
            <p className="text-xs text-muted-foreground">
              {todayAnalytics?.total_orders || 0} orders
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingOrders}</div>
            <p className="text-xs text-muted-foreground">
              Requires attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Items Sold</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {todayAnalytics?.total_items_sold || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lowStockItems}</div>
            <p className="text-xs text-muted-foreground">
              Items below threshold
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-9 gap-1">
          <TabsTrigger value="dashboard" className="gap-1 text-xs">
            <BarChart3 className="h-3 w-3" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="orders" className="gap-1 text-xs">
            <ShoppingCart className="h-3 w-3" />
            Orders
          </TabsTrigger>
          <TabsTrigger value="inventory" className="gap-1 text-xs">
            <Package className="h-3 w-3" />
            Inventory
          </TabsTrigger>
          <TabsTrigger value="customers" className="gap-1 text-xs">
            <Users className="h-3 w-3" />
            Customers
          </TabsTrigger>
          <TabsTrigger value="promotions" className="gap-1 text-xs">
            <Tag className="h-3 w-3" />
            Promotions
          </TabsTrigger>
          <TabsTrigger value="financial" className="gap-1 text-xs">
            <DollarSign className="h-3 w-3" />
            Financial
          </TabsTrigger>
          <TabsTrigger value="partnerships" className="gap-1 text-xs">
            <Handshake className="h-3 w-3" />
            Partners
          </TabsTrigger>
          <TabsTrigger value="page" className="gap-1 text-xs">
            <Globe className="h-3 w-3" />
            Page
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-1 text-xs">
            <Settings className="h-3 w-3" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sales Analytics</CardTitle>
              <CardDescription>Performance overview and insights</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Average Order Value</h4>
                    <p className="text-2xl font-bold">
                      ${todayAnalytics?.average_order_value?.toFixed(2) || '0.00'}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-2">Customer Distribution</h4>
                    <p className="text-sm">
                      <span className="font-semibold">{todayAnalytics?.new_customers || 0}</span> new customers
                      <br />
                      <span className="font-semibold">{todayAnalytics?.returning_customers || 0}</span> returning customers
                    </p>
                  </div>
                </div>

                {todayAnalytics?.top_selling_items && todayAnalytics.top_selling_items.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Top Selling Items</h4>
                    <div className="space-y-2">
                      {todayAnalytics.top_selling_items.slice(0, 5).map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                          <span className="font-medium">{item.name}</span>
                          <div className="text-sm text-muted-foreground">
                            {item.quantity} sold • ${item.revenue.toFixed(2)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Order Management</CardTitle>
              <CardDescription>View and manage customer orders</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Order management interface coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Inventory Management</CardTitle>
                <CardDescription>Track and manage your stock</CardDescription>
              </div>
              <Button onClick={() => setShowAddProduct(true)}>
                <Package className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {items?.slice(0, 12).map((item) => (
                  <Card key={item.id} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <h4 className="font-semibold truncate">{item.name}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {item.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold">${item.price}</span>
                          <span className="text-sm text-muted-foreground">
                            Stock: {item.stock_quantity}
                          </span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => {
                            setEditingProduct(item);
                            setShowAddProduct(true);
                          }}
                        >
                          Edit
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              {items && items.length === 0 && (
                <div className="text-center py-12">
                  <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No products yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Start by adding your first product to the inventory
                  </p>
                  <Button onClick={() => setShowAddProduct(true)}>
                    Add Your First Product
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers">
          <Card>
            <CardHeader>
              <CardTitle>Customer Management</CardTitle>
              <CardDescription>View customer profiles and purchase history</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Customer management interface coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="promotions">
          <Card>
            <CardHeader>
              <CardTitle>Promotions & Discounts</CardTitle>
              <CardDescription>Create and manage promotional campaigns</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Promotions management interface coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial">
          <FinancialReports />
        </TabsContent>

        <TabsContent value="partnerships">
          <BrandPartnershipsPage />
        </TabsContent>

        <TabsContent value="page">
          <EnhancedMerchantPageEditor />
        </TabsContent>

        <TabsContent value="settings">
          <MerchantSettingsPanel />
        </TabsContent>
      </Tabs>

      <AddMerchantProductDialog
        open={showAddProduct}
        onOpenChange={(open) => {
          setShowAddProduct(open);
          if (!open) setEditingProduct(null);
        }}
        onProductAdded={() => {
          refetch();
          setEditingProduct(null);
        }}
        editProduct={editingProduct}
      />
    </div>
  );
};
