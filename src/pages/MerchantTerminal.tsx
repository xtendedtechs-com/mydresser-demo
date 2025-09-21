import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useProfile } from '@/hooks/useProfile';
import { useMerchantProfile } from '@/hooks/useMerchantProfile';
import { useMerchantItems } from '@/hooks/useMerchantItems';
import { useOrders } from '@/hooks/useOrders';
import { 
  Store, 
  Package, 
  ShoppingCart, 
  BarChart3, 
  Settings,
  Plus,
  DollarSign,
  TrendingUp,
  Users,
  Eye,
  Star,
  Calendar,
  CreditCard,
  Search,
  Filter,
  FileText,
  HelpCircle,
  MessageSquare,
  BookOpen,
  Bell,
  Receipt,
  Truck,
  AlertTriangle,
  CheckCircle,
  X,
  Edit,
  Trash2,
  Download,
  Upload,
  RefreshCw,
  Mail,
  Phone,
  MapPin,
  Tag,
  Percent
} from 'lucide-react';

const MerchantTerminal = () => {
  const navigate = useNavigate();
  const { user, profile } = useProfile();
  const { profile: merchantProfile, sensitiveData, loading: profileLoading } = useMerchantProfile();
  const { items: merchantItems, loading: itemsLoading, refetch: refetchItems } = useMerchantItems();
  const { orders, loading: ordersLoading, createOrder } = useOrders();
  const { toast } = useToast();

  const [activeSection, setActiveSection] = useState('overview');
  const [checkoutCart, setCheckoutCart] = useState([]);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    orderId: ''
  });
  const [discountCode, setDiscountCode] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalProducts: 0,
    averageRating: 4.8,
    monthlyRevenue: 0,
    pendingOrders: 0
  });

  useEffect(() => {
    if (merchantItems && orders) {
      const totalSales = orders.reduce((sum, order) => sum + order.total_amount, 0);
      const pendingOrders = orders.filter(order => order.status === 'pending').length;
      const monthlyRevenue = orders
        .filter(order => {
          const orderDate = new Date(order.created_at);
          const now = new Date();
          return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
        })
        .reduce((sum, order) => sum + order.total_amount, 0);

      setStats({
        totalSales,
        totalOrders: orders.length,
        totalProducts: merchantItems.length,
        averageRating: 4.8,
        monthlyRevenue,
        pendingOrders
      });
    }
  }, [merchantItems, orders]);

  // Redirect non-merchants - but only after profile has loaded
  useEffect(() => {
    // Don't redirect while profile is still loading
    if (profileLoading) return;
    
    // If profile is loaded and user is not authenticated, redirect to auth
    if (!user) {
      navigate('/merchant-terminal');
      return;
    }
    
    // If profile is loaded but user doesn't have merchant role, redirect with error
    if (profile && !['merchant', 'professional'].includes(profile.role)) {
      toast({
        title: "Access Denied",
        description: "Merchant access required. Please sign in with a merchant account.",
        variant: "destructive"
      });
      navigate('/merchant-terminal');
      return;
    }
  }, [profile, user, profileLoading, navigate, toast]);

  // Show loading screen while any data is loading or if profile doesn't exist yet
  if (profileLoading || itemsLoading || ordersLoading || !profile) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-4">
          <Store className="w-12 h-12 animate-pulse text-primary mx-auto" />
          <p>Loading merchant terminal...</p>
        </div>
      </div>
    );
  }

  const addToCart = (item) => {
    const existingItem = checkoutCart.find(cartItem => cartItem.id === item.id);
    if (existingItem) {
      setCheckoutCart(prev => prev.map(cartItem => 
        cartItem.id === item.id 
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ));
    } else {
      setCheckoutCart(prev => [...prev, { ...item, quantity: 1 }]);
    }
  };

  const removeFromCart = (itemId) => {
    setCheckoutCart(prev => prev.filter(item => item.id !== itemId));
  };

  const calculateTotal = () => {
    const subtotal = checkoutCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discount = discountCode === '153FMRADIOSP#N132' ? subtotal * 0.25 : 0;
    const tax = (subtotal - discount) * 0.17;
    const shipping = 0; // Free shipping for now
    return {
      subtotal: subtotal.toFixed(2),
      discount: discount.toFixed(2),
      tax: tax.toFixed(2),
      shipping: shipping.toFixed(2),
      total: (subtotal - discount + tax + shipping).toFixed(2)
    };
  };

  const processCheckout = async () => {
    if (!checkoutCart.length || !customerInfo.name || !customerInfo.email) {
      toast({
        title: "Incomplete Order",
        description: "Please add items and fill customer information",
        variant: "destructive"
      });
      return;
    }

    try {
      const totals = calculateTotal();
      const orderItems = checkoutCart.map(item => ({
        merchant_item_id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        size: Array.isArray(item.size) ? item.size[0] : item.size,
        color: item.color,
        image_url: item.photos?.[0]
      }));

      await createOrder({
        customer_name: customerInfo.name,
        customer_email: customerInfo.email,
        customer_phone: customerInfo.phone,
        items: orderItems
      });

      setCheckoutCart([]);
      setCustomerInfo({ name: '', email: '', phone: '', orderId: '' });
      setDiscountCode('');
      
      toast({
        title: "Order Created",
        description: "Order has been successfully processed",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process order",
        variant: "destructive"
      });
    }
  };

  const sidebarSections = [
    { id: 'overview', label: 'Sales Overview', icon: BarChart3 },
    { id: 'checkout', label: 'Checkout Terminal', icon: CreditCard },
    { id: 'orders', label: 'Order Management', icon: ShoppingCart },
    { id: 'inventory', label: 'Inventory Management', icon: Package },
    { id: 'customers', label: 'Customer Relations', icon: Users },
    { id: 'financial', label: 'Financial Reports', icon: DollarSign },
    { id: 'support', label: 'Support & Resources', icon: HelpCircle },
  ];

  const filteredItems = merchantItems.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-64 bg-card border-r border-border p-4">
        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-2">
            <Store className="w-8 h-8" />
            <h1 className="text-xl font-bold">MyDresser Terminal</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Hello Vendor, take a look at your overview
          </p>
        </div>

        <nav className="space-y-2">
          {sidebarSections.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-colors ${
                  activeSection === section.id 
                    ? 'bg-primary text-primary-foreground' 
                    : 'hover:bg-muted text-muted-foreground'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm">{section.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="mt-8 p-4 bg-muted rounded-lg">
          <h3 className="font-semibold mb-2">Quick Stats</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Total Sales:</span>
              <span className="font-medium">${stats.totalSales.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Orders:</span>
              <span className="font-medium">{stats.totalOrders}</span>
            </div>
            <div className="flex justify-between">
              <span>Products:</span>
              <span className="font-medium">{stats.totalProducts}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-card border-b border-border p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">
                {sidebarSections.find(s => s.id === activeSection)?.label}
              </h2>
              <p className="text-muted-foreground">
                Manage your store operations and analytics
              </p>
            </div>
            <div className="flex space-x-2">
              <Button onClick={() => navigate('/merchant-page')} variant="outline">
                <Eye className="w-4 h-4 mr-2" />
                View Store
              </Button>
              <Button onClick={() => navigate('/add')}>
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6">
          {activeSection === 'overview' && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${stats.totalSales.toFixed(2)}</div>
                    <p className="text-xs text-muted-foreground">+20.1% from last month</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Orders</CardTitle>
                    <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalOrders}</div>
                    <p className="text-xs text-muted-foreground">{stats.pendingOrders} pending</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Products</CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalProducts}</div>
                    <p className="text-xs text-muted-foreground">Active listings</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Rating</CardTitle>
                    <Star className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.averageRating}</div>
                    <p className="text-xs text-muted-foreground">Average rating</p>
                  </CardContent>
                </Card>
              </div>

              {/* Sales Chart Placeholder */}
              <Card>
                <CardHeader>
                  <CardTitle>Sales Overview</CardTitle>
                  <CardDescription>Your sales performance over time</CardDescription>
                </CardHeader>
                <CardContent className="h-64 flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>Sales chart visualization coming soon</p>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Orders</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {orders.slice(0, 5).map((order) => (
                        <div key={order.id} className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Order #{order.id.slice(0, 8)}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(order.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">${order.total_amount.toFixed(2)}</p>
                            <Badge variant={order.status === 'completed' ? 'default' : 'secondary'}>
                              {order.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Performance Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span>Monthly Revenue</span>
                        <span className="font-bold text-lg text-primary">
                          ${stats.monthlyRevenue.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Conversion Rate</span>
                        <span className="font-medium">3.2%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Average Order Value</span>
                        <span className="font-medium">
                          ${stats.totalOrders > 0 ? (stats.totalSales / stats.totalOrders).toFixed(2) : '0.00'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Customer Satisfaction</span>
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-500 mr-1" />
                          <span className="font-medium">{stats.averageRating}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeSection === 'checkout' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
              {/* Left Side - Product Browser */}
              <div className="space-y-4">
                {/* Customer Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Customer Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Customer</label>
                        <Input
                          placeholder="Customer name"
                          value={customerInfo.name}
                          onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Email</label>
                        <Input
                          placeholder="customer@email.com"
                          value={customerInfo.email}
                          onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Phone</label>
                        <Input
                          placeholder="Phone number"
                          value={customerInfo.phone}
                          onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Order ID</label>
                        <Input
                          placeholder="Auto-generated"
                          value={customerInfo.orderId}
                          readOnly
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Product Browser */}
                <Card className="flex-1">
                  <CardHeader>
                    <CardTitle>Browse Inventory</CardTitle>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                        <Input
                          placeholder="Search products..."
                          className="pl-10"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                      <Button variant="outline" size="icon">
                        <Filter className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 max-h-96 overflow-y-auto">
                    {filteredItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted cursor-pointer"
                        onClick={() => addToCart(item)}
                      >
                        <div className="flex items-center space-x-3">
                          {item.photos && item.photos[0] && (
                            <img 
                              src={item.photos[0]} 
                              alt={item.name}
                              className="w-12 h-12 rounded object-cover"
                            />
                          )}
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Size: {Array.isArray(item.size) ? item.size.join(', ') : item.size || 'N/A'} • 
                              Price: ${item.price}
                            </p>
                          </div>
                        </div>
                        <Button size="sm" variant="outline">
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Right Side - Checkout */}
              <div className="space-y-4">
                {/* Cart Items */}
                <Card>
                  <CardHeader>
                    <CardTitle>Current Order</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {checkoutCart.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">
                        No items in cart. Add products to get started.
                      </p>
                    ) : (
                      checkoutCart.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <div className="flex items-center space-x-3">
                            {item.photos && item.photos[0] && (
                              <img 
                                src={item.photos[0]} 
                                alt={item.name}
                                className="w-10 h-10 rounded object-cover"
                              />
                            )}
                            <div>
                              <p className="font-medium">{item.name}</p>
                              <p className="text-sm text-muted-foreground">
                                Qty: {item.quantity} • ${item.price}
                              </p>
                            </div>
                          </div>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => removeFromCart(item.id)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>

                {/* Discounts & Promotions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Apply Discounts and Promotions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Discount Code:</label>
                      <Input
                        placeholder="Enter discount code"
                        value={discountCode}
                        onChange={(e) => setDiscountCode(e.target.value)}
                      />
                      {discountCode === '153FMRADIOSP#N132' && (
                        <p className="text-sm text-green-600 mt-1">
                          ✓ 25% off - Special promotion by 153FM Radio
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Order Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {(() => {
                      const totals = calculateTotal();
                      return (
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Totals:</span>
                            <span>${totals.subtotal}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Taxes: 17%</span>
                            <span>+${totals.tax}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Shipping:</span>
                            <span>None</span>
                          </div>
                          {parseFloat(totals.discount) > 0 && (
                            <div className="flex justify-between text-green-600">
                              <span>Discounts: 17%</span>
                              <span>-${totals.discount}</span>
                            </div>
                          )}
                          <hr />
                          <div className="flex justify-between font-bold text-lg">
                            <span>Totals to pay:</span>
                            <span>${totals.total}</span>
                          </div>
                        </div>
                      );
                    })()}
                    
                    <div className="space-y-2 mt-6">
                      <p className="text-sm text-muted-foreground">
                        Process various payment methods (credit card, mobile payments, etc.)
                      </p>
                      <div className="flex space-x-2">
                        <Button className="flex-1" onClick={processCheckout}>
                          <CreditCard className="w-4 h-4 mr-2" />
                          Process Payment
                        </Button>
                      </div>
                      <div className="flex space-x-2 mt-2">
                        <Button variant="outline" size="sm">
                          <Mail className="w-4 h-4 mr-2" />
                          Email
                        </Button>
                        <Button variant="outline" size="sm">
                          <FileText className="w-4 h-4 mr-2" />
                          Print
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Manage order status (mark as pending, shipped, completed, etc.)
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeSection === 'orders' && (
            <Card>
              <CardHeader>
                <CardTitle>Order Management System</CardTitle>
                <CardDescription>Track and manage the entire lifecycle of customer orders</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Filter className="w-4 h-4 mr-2" />
                        Filter
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Export
                      </Button>
                    </div>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      New Order
                    </Button>
                  </div>
                  
                  {orders.map((order) => (
                    <div key={order.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">Order #{order.id.slice(0, 8)}</h3>
                          <p className="text-sm text-muted-foreground">
                            {new Date(order.created_at).toLocaleDateString()} • {order.customer_name}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={
                            order.status === 'completed' ? 'default' :
                            order.status === 'pending' ? 'secondary' :
                            order.status === 'shipped' ? 'outline' : 'destructive'
                          }>
                            {order.status}
                          </Badge>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Customer:</span> {order.customer_email}
                        </div>
                        <div>
                          <span className="font-medium">Total:</span> ${order.total_amount.toFixed(2)}
                        </div>
                        <div>
                          <span className="font-medium">Payment:</span> {order.payment_status}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Truck className="w-4 h-4 mr-1" />
                          Ship
                        </Button>
                        <Button variant="outline" size="sm">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Complete
                        </Button>
                        <Button variant="outline" size="sm">
                          <Receipt className="w-4 h-4 mr-1" />
                          Invoice
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {activeSection === 'inventory' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div className="flex space-x-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search inventory..."
                      className="pl-10 w-80"
                    />
                  </div>
                  <Button variant="outline">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                  </Button>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline">
                    <Upload className="w-4 h-4 mr-2" />
                    Bulk Upload
                  </Button>
                  <Button variant="outline">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Low Stock Alerts
                  </Button>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Product
                  </Button>
                </div>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Inventory Management</CardTitle>
                  <CardDescription>Real-time control and detailed insights into product stock levels</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {merchantItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          {item.photos && item.photos[0] && (
                            <img 
                              src={item.photos[0]} 
                              alt={item.name}
                              className="w-16 h-16 rounded object-cover"
                            />
                          )}
                          <div>
                            <h3 className="font-medium">{item.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {item.category} • {item.brand} • Stock: {item.stock_quantity || 0}
                            </p>
                            <p className="text-sm font-medium">${item.price}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={
                            (item.stock_quantity || 0) > 10 ? 'default' :
                            (item.stock_quantity || 0) > 0 ? 'secondary' : 'destructive'
                          }>
                            {(item.stock_quantity || 0) > 10 ? 'In Stock' :
                             (item.stock_quantity || 0) > 0 ? 'Low Stock' : 'Out of Stock'}
                          </Badge>
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                          <Button variant="outline" size="sm">
                            <RefreshCw className="w-4 h-4 mr-1" />
                            Restock
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeSection === 'customers' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Customer Relationship Management</CardTitle>
                  <CardDescription>Understand and engage with customers directly</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Customer Profiles</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Total Customers:</span>
                            <span className="font-medium">{new Set(orders.map(o => o.customer_email)).size}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Repeat Customers:</span>
                            <span className="font-medium">78%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Avg. Order Value:</span>
                            <span className="font-medium">
                              ${stats.totalOrders > 0 ? (stats.totalSales / stats.totalOrders).toFixed(2) : '0.00'}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Communication</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <Button className="w-full" variant="outline">
                            <MessageSquare className="w-4 h-4 mr-2" />
                            In-App Messages
                          </Button>
                          <Button className="w-full" variant="outline">
                            <Mail className="w-4 h-4 mr-2" />
                            Email Campaigns
                          </Button>
                          <Button className="w-full" variant="outline">
                            <Bell className="w-4 h-4 mr-2" />
                            Notifications
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Loyalty Programs</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <Button className="w-full" variant="outline">
                            <Tag className="w-4 h-4 mr-2" />
                            Manage Rewards
                          </Button>
                          <Button className="w-full" variant="outline">
                            <Percent className="w-4 h-4 mr-2" />
                            Create Offers
                          </Button>
                          <div className="text-sm text-muted-foreground">
                            <p>Active members: 156</p>
                            <p>Points distributed: 12,450</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeSection === 'financial' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Monthly Revenue</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${stats.monthlyRevenue.toFixed(2)}</div>
                    <p className="text-xs text-muted-foreground">+12% from last month</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Total Payouts</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${(stats.totalSales * 0.85).toFixed(2)}</div>
                    <p className="text-xs text-muted-foreground">After 15% commission</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Pending Payouts</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${(stats.monthlyRevenue * 0.85).toFixed(2)}</div>
                    <p className="text-xs text-muted-foreground">Next payout: Dec 15</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Transaction Fees</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${(stats.totalSales * 0.15).toFixed(2)}</div>
                    <p className="text-xs text-muted-foreground">MyDresser commission</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Financial Reports & Payouts</CardTitle>
                  <CardDescription>Transparent oversight of all financial transactions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-medium mb-3">Sales Reports</h3>
                      <div className="space-y-2">
                        <Button variant="outline" className="w-full justify-start">
                          <FileText className="w-4 h-4 mr-2" />
                          Daily Sales Report
                        </Button>
                        <Button variant="outline" className="w-full justify-start">
                          <FileText className="w-4 h-4 mr-2" />
                          Monthly Summary
                        </Button>
                        <Button variant="outline" className="w-full justify-start">
                          <FileText className="w-4 h-4 mr-2" />
                          Product Performance
                        </Button>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium mb-3">Payout Management</h3>
                      <div className="space-y-2">
                        <Button variant="outline" className="w-full justify-start">
                          <DollarSign className="w-4 h-4 mr-2" />
                          Payout History
                        </Button>
                        <Button variant="outline" className="w-full justify-start">
                          <Calendar className="w-4 h-4 mr-2" />
                          Schedule Payout
                        </Button>
                        <Button variant="outline" className="w-full justify-start">
                          <FileText className="w-4 h-4 mr-2" />
                          Tax Documents
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeSection === 'support' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Support & Resources</CardTitle>
                  <CardDescription>Access help, documentation, and tools for success</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Knowledge Base</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <Button variant="outline" className="w-full justify-start">
                          <BookOpen className="w-4 h-4 mr-2" />
                          Getting Started Guide
                        </Button>
                        <Button variant="outline" className="w-full justify-start">
                          <BookOpen className="w-4 h-4 mr-2" />
                          Product Management
                        </Button>
                        <Button variant="outline" className="w-full justify-start">
                          <BookOpen className="w-4 h-4 mr-2" />
                          Order Fulfillment
                        </Button>
                        <Button variant="outline" className="w-full justify-start">
                          <BookOpen className="w-4 h-4 mr-2" />
                          Marketing Tools
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Contact Support</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <Button className="w-full justify-start">
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Live Chat Support
                        </Button>
                        <Button variant="outline" className="w-full justify-start">
                          <Mail className="w-4 h-4 mr-2" />
                          Email Support
                        </Button>
                        <Button variant="outline" className="w-full justify-start">
                          <Phone className="w-4 h-4 mr-2" />
                          Phone Support
                        </Button>
                        <div className="text-sm text-muted-foreground">
                          <p>Average response time: 2 hours</p>
                          <p>Support available 24/7</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Performance</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Store Rating:</span>
                            <span className="flex items-center">
                              <Star className="w-4 h-4 text-yellow-500 mr-1" />
                              {stats.averageRating}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Response Rate:</span>
                            <span>98%</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>On-time Shipping:</span>
                            <span>95%</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Customer Satisfaction:</span>
                            <span>4.8/5</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>MyDresser Updates & Announcements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-start space-x-3">
                        <Bell className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-blue-900">New Feature: AI-Powered Pricing</h4>
                          <p className="text-sm text-blue-700">
                            Our new AI system can now suggest optimal pricing for your products based on market trends.
                          </p>
                          <p className="text-xs text-blue-600 mt-1">2 days ago</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-start space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-green-900">System Maintenance Complete</h4>
                          <p className="text-sm text-green-700">
                            All systems are now fully operational with improved performance and security.
                          </p>
                          <p className="text-xs text-green-600 mt-1">1 week ago</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MerchantTerminal;