import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useProfile } from '@/hooks/useProfile';
import { useMerchantProfile } from '@/hooks/useMerchantProfile';
import { useMerchantItems } from '@/hooks/useMerchantItems';
import { useToast } from '@/hooks/use-toast';
import AddMerchantProductDialog from '@/components/AddMerchantProductDialog';
import { MerchantPageTab } from '@/components/MerchantPageTab';
import { 
  ShoppingBag, Package, Users, DollarSign, 
  TrendingUp, Calendar, Clock, Star,
  Plus, Settings, BarChart3, HelpCircle, 
  Search, Filter, Edit, Trash2, Eye,
  CreditCard, Truck, CheckCircle, XCircle,
  Globe
} from 'lucide-react';

interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
}

interface CheckoutItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
}

const MerchantTerminal: React.FC = () => {
  const { user } = useProfile();
  const { profile: merchantProfile } = useMerchantProfile();
  const { items, loading: itemsLoading, addItem, updateItem, deleteItem, refetch: refetchItems } = useMerchantItems();
  const { toast } = useToast();

  // Navigation state
  const [activeSection, setActiveSection] = useState('overview');

  // Dialog states
  const [showAddProductDialog, setShowAddProductDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Checkout state
  const [checkoutCart, setCheckoutCart] = useState<CheckoutItem[]>([]);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: '',
    email: '',
    phone: '',
    address: ''
  });

  // Stats calculation
  const totalProducts = items.length;
  const publishedProducts = items.filter(item => item.status === 'available').length;
  const draftProducts = items.filter(item => !item.status || item.status === 'reserved').length;
  const totalRevenue = 45250.00; // Mock data - would come from orders
  const totalOrders = 127; // Mock data
  const averageOrderValue = totalRevenue / totalOrders;

  // Navigation items
  const navigationItems = [
    { label: 'Sales Overview', id: 'overview', icon: BarChart3 },
    { label: 'Checkout Terminal', id: 'checkout', icon: ShoppingBag },
    { label: 'Order Management', id: 'orders', icon: Package },
    { label: 'Inventory Management', id: 'inventory', icon: Package },
    { label: 'Customer Relations', id: 'customers', icon: Users },
    { label: 'Financial Reports', id: 'financial', icon: DollarSign },
    { label: 'Merchant Page', id: 'page', icon: Globe },
    { label: 'Support & Resources', id: 'support', icon: HelpCircle }
  ];

  // Redirect if not merchant
  useEffect(() => {
    if (user && !merchantProfile) {
      // Redirect or show message about merchant setup
    }
  }, [user, merchantProfile]);

  // Cart functions
  const addToCart = (item: any) => {
    const existingItem = checkoutCart.find(cartItem => cartItem.id === item.id);
    if (existingItem) {
      setCheckoutCart(prev => prev.map(cartItem =>
        cartItem.id === item.id 
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ));
    } else {
      setCheckoutCart(prev => [...prev, {
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: 1,
        size: item.size?.[0],
        color: item.color
      }]);
    }
  };

  const removeFromCart = (itemId: string) => {
    setCheckoutCart(prev => prev.filter(item => item.id !== itemId));
  };

  const calculateTotal = () => {
    const subtotal = checkoutCart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const discount = 0;
    const tax = subtotal * 0.08; // 8% tax
    const shipping = subtotal > 50 ? 0 : 9.99;
    const total = subtotal - discount + tax + shipping;
    
    return { subtotal, discount, tax, shipping, total };
  };

  const processCheckout = async () => {
    if (checkoutCart.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Please add items to cart before checkout",
        variant: "destructive"
      });
      return;
    }

    if (!customerInfo.name || !customerInfo.email) {
      toast({
        title: "Missing Information",
        description: "Please fill in customer name and email",
        variant: "destructive"
      });
      return;
    }

    try {
      // Process order logic would go here
      toast({
        title: "Order Processed",
        description: `Order for ${customerInfo.name} has been processed successfully`
      });
      
      // Clear cart and customer info
      setCheckoutCart([]);
      setCustomerInfo({ name: '', email: '', phone: '', address: '' });
    } catch (error) {
      console.error('Error processing checkout:', error);
      toast({
        title: "Error",
        description: "Failed to process order",
        variant: "destructive"
      });
    }
  };

  const handlePublishToggle = async (item: any, newStatus: string) => {
    try {
      await updateItem(item.id, { 
        status: newStatus as 'available' | 'sold' | 'reserved',
        is_featured: newStatus === 'published' ? item.is_featured : false
      });
      toast({
        title: "Success",
        description: `Item ${newStatus === 'published' ? 'published' : 'unpublished'} successfully`
      });
      
      refetchItems();
    } catch (error) {
      console.error('Error updating product status:', error);
      toast({
        title: "Error",
        description: "Failed to update product status",
        variant: "destructive"
      });
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!deleteItem) return;
    
    try {
      await deleteItem(productId);
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  if (itemsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading merchant terminal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Sidebar Navigation */}
        <div className="w-64 bg-card border-r border-border min-h-screen">
          <div className="p-6">
            <h2 className="text-xl font-bold mb-6">MyDresser Terminal</h2>
            <nav className="space-y-2">
              {navigationItems.map((item) => (
                <Button
                  key={item.id}
                  variant={activeSection === item.id ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setActiveSection(item.id)}
                >
                  <item.icon className="h-4 w-4 mr-2" />
                  {item.label}
                </Button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <main className="p-6">
            {/* Sales Overview */}
            {activeSection === 'overview' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-bold">Sales Overview</h1>
                  <div className="text-sm text-muted-foreground">
                    Last updated: {new Date().toLocaleString()}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="h-4 w-4 text-green-500" />
                        <h3 className="font-semibold">Total Revenue</h3>
                      </div>
                      <p className="text-2xl font-bold">${totalRevenue.toLocaleString()}</p>
                      <p className="text-sm text-green-500">+12% this month</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <ShoppingBag className="h-4 w-4 text-blue-500" />
                        <h3 className="font-semibold">Total Orders</h3>
                      </div>
                      <p className="text-2xl font-bold">{totalOrders}</p>
                      <p className="text-sm text-blue-500">+8 today</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Package className="h-4 w-4 text-purple-500" />
                        <h3 className="font-semibold">Products</h3>
                      </div>
                      <p className="text-2xl font-bold">{totalProducts}</p>
                      <p className="text-sm text-muted-foreground">{publishedProducts} published</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="h-4 w-4 text-orange-500" />
                        <h3 className="font-semibold">Avg Order Value</h3>
                      </div>
                      <p className="text-2xl font-bold">${averageOrderValue.toFixed(2)}</p>
                      <p className="text-sm text-orange-500">+5% vs last month</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Orders</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">No recent orders</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Button 
                        className="w-full justify-start"
                        onClick={() => setActiveSection('checkout')}
                      >
                        <ShoppingBag className="h-4 w-4 mr-2" />
                        Start New Sale
                      </Button>
                      <Button 
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => setShowAddProductDialog(true)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Product
                      </Button>
                      <Button 
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => setActiveSection('inventory')}
                      >
                        <Package className="h-4 w-4 mr-2" />
                        Manage Inventory
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Checkout Terminal */}
            {activeSection === 'checkout' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-bold">Checkout Terminal</h1>
                  <Button onClick={() => setCheckoutCart([])}>
                    Clear Cart
                  </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Product Selection */}
                  <div className="lg:col-span-2 space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Select Products</CardTitle>
                        <div className="flex gap-2">
                          <Input placeholder="Search products..." />
                          <Button variant="outline" size="icon">
                            <Search className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                          {items.filter(item => item.status === 'available').map(item => (
                            <div key={item.id} className="border rounded-lg p-3">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <h4 className="font-medium">{item.name}</h4>
                                  <p className="text-sm text-muted-foreground">{item.category}</p>
                                </div>
                                <Badge>${item.price}</Badge>
                              </div>
                              <Button 
                                size="sm" 
                                className="w-full"
                                onClick={() => addToCart(item)}
                              >
                                Add to Cart
                              </Button>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Cart & Checkout */}
                  <div className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Cart ({checkoutCart.length})</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3 max-h-48 overflow-y-auto">
                          {checkoutCart.map(item => (
                            <div key={item.id} className="flex justify-between items-center">
                              <div>
                                <p className="text-sm font-medium">{item.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  ${item.price} x {item.quantity}
                                </p>
                              </div>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => removeFromCart(item.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Customer Info</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <Input
                          placeholder="Customer Name"
                          value={customerInfo.name}
                          onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                        />
                        <Input
                          placeholder="Email"
                          type="email"
                          value={customerInfo.email}
                          onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                        />
                        <Input
                          placeholder="Phone"
                          value={customerInfo.phone}
                          onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                        />
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Order Summary</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {(() => {
                          const totals = calculateTotal();
                          return (
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span>Subtotal:</span>
                                <span>${totals.subtotal.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Tax:</span>
                                <span>${totals.tax.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Shipping:</span>
                                <span>${totals.shipping.toFixed(2)}</span>
                              </div>
                              <Separator />
                              <div className="flex justify-between font-bold">
                                <span>Total:</span>
                                <span>${totals.total.toFixed(2)}</span>
                              </div>
                              <Button 
                                className="w-full mt-4"
                                onClick={processCheckout}
                                disabled={checkoutCart.length === 0}
                              >
                                Process Payment
                              </Button>
                            </div>
                          );
                        })()}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            )}

            {/* Inventory Management */}
            {activeSection === 'inventory' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-bold">Inventory Management</h1>
                  <Button onClick={() => setShowAddProductDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Product
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Package className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                      <p className="text-2xl font-bold">{totalProducts}</p>
                      <p className="text-sm text-muted-foreground">Total Products</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                      <p className="text-2xl font-bold">{publishedProducts}</p>
                      <p className="text-sm text-muted-foreground">Published</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Edit className="h-8 w-8 mx-auto mb-2 text-orange-500" />
                      <p className="text-2xl font-bold">{draftProducts}</p>
                      <p className="text-sm text-muted-foreground">Drafts</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Star className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                      <p className="text-2xl font-bold">{items.filter(item => item.is_featured).length}</p>
                      <p className="text-sm text-muted-foreground">Featured</p>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Product Inventory</CardTitle>
                    <div className="flex gap-2">
                      <Input placeholder="Search products..." />
                      <Button variant="outline" size="icon">
                        <Search className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {items.map(item => (
                        <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-muted rounded-md"></div>
                            <div>
                              <h4 className="font-medium">{item.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                {item.category} • ${item.price}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Badge variant={item.status === 'available' ? 'default' : 'secondary'}>
                              {item.status || 'draft'}
                            </Badge>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePublishToggle(item, item.status === 'available' ? 'sold' : 'available')}
                            >
                              {item.status === 'available' ? 'Mark as Sold' : 'Make Available'}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingProduct(item);
                                setShowAddProductDialog(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteProduct(item.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Orders Management */}
            {activeSection === 'orders' && (
              <div className="space-y-6">
                <h1 className="text-2xl font-bold">Order Management</h1>
                <Card>
                  <CardContent className="p-6 text-center">
                    <p className="text-muted-foreground">No orders yet. Orders will appear here when customers make purchases.</p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Customer Relations */}
            {activeSection === 'customers' && (
              <div className="space-y-6">
                <h1 className="text-2xl font-bold">Customer Relations</h1>
                <Card>
                  <CardContent className="p-6 text-center">
                    <p className="text-muted-foreground">Customer management features coming soon...</p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Financial Reports */}
            {activeSection === 'financial' && (
              <div className="space-y-6">
                <h1 className="text-2xl font-bold">Financial Reports</h1>
                <Card>
                  <CardContent className="p-6 text-center">
                    <p className="text-muted-foreground">Financial reporting features coming soon...</p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Merchant Page */}
            {activeSection === 'page' && (
              <MerchantPageTab />
            )}

            {/* Support & Resources */}
            {activeSection === 'support' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Support & Resources</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">Support resources coming soon...</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Add Product Dialog */}
      <AddMerchantProductDialog
        open={showAddProductDialog}
        onOpenChange={(open) => {
          setShowAddProductDialog(open);
          if (!open) {
            setEditingProduct(null);
          }
        }}
        onProductAdded={refetchItems}
        editProduct={editingProduct}
      />
    </div>
  );
};

export default MerchantTerminal;