import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Store,
  Package,
  Users,
  DollarSign,
  TrendingUp,
  ShoppingCart,
  Search,
  Filter,
  Plus,
  Minus,
  Eye,
  Download,
  Mail,
  Printer,
  Calendar,
  BarChart3,
  Settings,
  HelpCircle,
  AlertCircle,
  CheckCircle,
  Clock,
  Truck,
  RefreshCw,
  FileText,
  CreditCard,
  AlertTriangle,
  MessageCircle,
  Star,
  Edit,
  Trash2,
  ExternalLink,
  LogOut
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMerchantItems } from '@/hooks/useMerchantItems';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface CheckoutItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
  image?: string;
}

interface CustomerInfo {
  name: string;
  email: string;
  orderId: string;
}

interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  items: CheckoutItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  date: string;
  paymentMethod: string;
  shippingAddress: string;
}

interface InventoryAlert {
  id: string;
  itemName: string;
  currentStock: number;
  threshold: number;
  severity: 'low' | 'critical';
}

const MerchantTerminal = () => {
  const [activeTab, setActiveTab] = useState('checkout');
  const [checkoutItems, setCheckoutItems] = useState<CheckoutItem[]>([]);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: '',
    email: '',
    orderId: ''
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [discountCode, setDiscountCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [salesData] = useState({
    today: 1250,
    thisWeek: 8750,
    thisMonth: 32450,
    totalOrders: 1601
  });

  // Mock data for orders
  const [orders] = useState<Order[]>([
    {
      id: 'ORD-001',
      customerName: 'James Rostinberg',
      customerEmail: 'james@example.com',
      items: [
        { id: '1', name: 'Tommy Jeans Medium Blue', price: 99.90, quantity: 1 },
        { id: '2', name: 'New Age Ripped Blue Jeans', price: 119.90, quantity: 1 }
      ],
      total: 192.85,
      status: 'pending',
      date: '2024-01-20',
      paymentMethod: 'Credit Card',
      shippingAddress: '123 Main St, City, State'
    },
    {
      id: 'ORD-002',
      customerName: 'Sarah Wilson',
      customerEmail: 'sarah@example.com',
      items: [
        { id: '3', name: 'Classic White Shirt', price: 79.99, quantity: 2 }
      ],
      total: 159.98,
      status: 'shipped',
      date: '2024-01-19',
      paymentMethod: 'PayPal',
      shippingAddress: '456 Oak Ave, City, State'
    }
  ]);

  // Mock inventory alerts
  const [inventoryAlerts] = useState<InventoryAlert[]>([
    { id: '1', itemName: 'Tommy Jeans Medium Blue', currentStock: 3, threshold: 10, severity: 'low' },
    { id: '2', itemName: 'New Age Ripped Jeans', currentStock: 1, threshold: 5, severity: 'critical' }
  ]);

  const { items: inventoryItems, loading, refetch } = useMerchantItems();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Additional state for functionality
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [editingItem, setEditingItem] = useState<MerchantItem | null>(null);
  const [viewFilter, setViewFilter] = useState<'all' | 'in-stock' | 'low-stock' | 'out-of-stock'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'stock' | 'created_at'>('created_at');

  // Filter and sort inventory
  const getFilteredInventory = () => {
    let filtered = inventoryItems.filter(item =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Apply stock filter
    switch (viewFilter) {
      case 'in-stock':
        filtered = filtered.filter(item => item.stock_quantity > 5);
        break;
      case 'low-stock':
        filtered = filtered.filter(item => item.stock_quantity > 0 && item.stock_quantity <= 5);
        break;
      case 'out-of-stock':
        filtered = filtered.filter(item => item.stock_quantity === 0);
        break;
    }

    // Sort items
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price':
          return (a.price || 0) - (b.price || 0);
        case 'stock':
          return (a.stock_quantity || 0) - (b.stock_quantity || 0);
        case 'created_at':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

    return filtered;
  };

  const filteredInventory = getFilteredInventory();

  const subtotal = checkoutItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.17; // 17% tax
  const shipping = checkoutItems.length > 0 ? (subtotal > 100 ? 0 : 15) : 0;
  const discount = discountAmount;
  const total = subtotal + tax + shipping - discount;

  const addToCheckout = (item: any) => {
    const existingItem = checkoutItems.find(ci => ci.id === item.id);
    if (existingItem) {
      setCheckoutItems(items => 
        items.map(ci => ci.id === item.id 
          ? { ...ci, quantity: ci.quantity + 1 }
          : ci
        )
      );
    } else {
      setCheckoutItems(items => [...items, {
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: 1,
        size: item.size,
        color: item.color,
        image: item.photos?.main
      }]);
    }
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      setCheckoutItems(items => items.filter(item => item.id !== itemId));
    } else {
      setCheckoutItems(items =>
        items.map(item => item.id === itemId ? { ...item, quantity } : item)
      );
    }
  };

  const applyDiscount = () => {
    if (discountCode === '153FMRADIOSP#N132') {
      setDiscountAmount(subtotal * 0.25);
      toast({
        title: 'Discount Applied',
        description: '25% off applied successfully'
      });
    } else {
      toast({
        title: 'Invalid Code',
        description: 'Discount code not found',
        variant: 'destructive'
      });
    }
  };

  const processPayment = () => {
    if (checkoutItems.length === 0) {
      toast({
        title: 'No Items',
        description: 'Add items to cart before processing payment',
        variant: 'destructive'
      });
      return;
    }

    // Simulate payment processing
    toast({
      title: 'Payment Processed',
      description: `Order for $${total.toFixed(2)} completed successfully`
    });

    // Clear cart
    setCheckoutItems([]);
    setCustomerInfo({ name: '', email: '', orderId: '' });
    setDiscountCode('');
    setDiscountAmount(0);
  };

  const generateReceipt = (type: 'email' | 'print') => {
    toast({
      title: 'Receipt Generated',
      description: `Receipt ${type === 'email' ? 'emailed to customer' : 'sent to printer'}`
    });
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: 'Logged Out',
        description: 'You have been successfully logged out'
      });
      
      navigate('/auth');
    } catch (error: any) {
      toast({
        title: 'Logout Failed',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('merchant_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      toast({
        title: 'Item Deleted',
        description: 'Item has been removed from inventory'
      });
      
      refetch();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const handleToggleFeatured = async (item: MerchantItem) => {
    try {
      const { error } = await supabase
        .from('merchant_items')
        .update({ is_featured: !item.is_featured })
        .eq('id', item.id);

      if (error) throw error;

      toast({
        title: 'Item Updated',
        description: `Item ${item.is_featured ? 'removed from' : 'added to'} featured items`
      });
      
      refetch();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const handleUpdateStock = async (itemId: string, newStock: number) => {
    try {
      const { error } = await supabase
        .from('merchant_items')
        .update({ stock_quantity: newStock })
        .eq('id', itemId);

      if (error) throw error;

      toast({
        title: 'Stock Updated',
        description: 'Inventory level has been updated'
      });
      
      refetch();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const handleItemAdded = () => {
    refetch();
  };

  const handleItemUpdated = () => {
    refetch();
    setEditingItem(null);
  };

  const getStockStatus = (quantity: number) => {
    if (quantity === 0) return { status: 'Out of Stock', color: 'text-red-600', bg: 'bg-red-50' };
    if (quantity <= 5) return { status: 'Low Stock', color: 'text-yellow-600', bg: 'bg-yellow-50' };
    return { status: 'In Stock', color: 'text-green-600', bg: 'bg-green-50' };
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur-sm">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
              <Store className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold">DRESSER</h1>
              <p className="text-sm text-muted-foreground">Hello Vendor, take a look at your overview</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Calendar className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <Settings className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Sidebar */}
        <aside className="w-64 border-r bg-muted/30">
          <div className="p-4">
            <div className="space-y-6">
              {/* Sales Overview */}
              <div>
                <h3 className="font-medium mb-3">Sales overview</h3>
                <div className="bg-background rounded-lg p-4">
                  <div className="text-sm text-muted-foreground mb-2">Total sales</div>
                  <div className="h-24 flex items-end justify-between">
                    {[96, 85, 72, 89, 110, 125, 108].map((height, index) => (
                      <div
                        key={index}
                        className="w-4 bg-primary rounded-sm"
                        style={{ height: `${(height / 125) * 100}%` }}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground mt-2">
                    <span>16/01</span>
                    <span>17/01</span>
                    <span>18/01</span>
                    <span>19/01</span>
                    <span>20/01</span>
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="text-2xl font-bold">125k</div>
                    <div className="text-sm text-muted-foreground">Total sales</div>
                  </div>
                </div>
              </div>

              {/* Navigation Menu */}
              <div className="space-y-1">
                <Button
                  variant={activeTab === 'checkout' ? 'secondary' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setActiveTab('checkout')}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Checkout Terminal
                </Button>
                <Button
                  variant={activeTab === 'orders' ? 'secondary' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setActiveTab('orders')}
                >
                  <Package className="w-4 h-4 mr-2" />
                  Order Management
                </Button>
                <Button
                  variant={activeTab === 'inventory' ? 'secondary' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setActiveTab('inventory')}
                >
                  <Package className="w-4 h-4 mr-2" />
                  Inventory Management
                </Button>
                <Button
                  variant={activeTab === 'customers' ? 'secondary' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setActiveTab('customers')}
                >
                  <Users className="w-4 h-4 mr-2" />
                  Customer Management
                </Button>
                <Button
                  variant={activeTab === 'performance' ? 'secondary' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setActiveTab('performance')}
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Financial Reports
                </Button>
                <Button
                  variant={activeTab === 'support' ? 'secondary' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setActiveTab('support')}
                >
                  <HelpCircle className="w-4 h-4 mr-2" />
                  Support & Resources
                </Button>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex">
          {/* Checkout Terminal */}
          {activeTab === 'checkout' && (
            <>
              {/* Center Content - Checkout Terminal */}
              <div className="flex-1 p-6">
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-4">Checkout Terminal</h2>
                    
                    {/* Customer Info */}
                    <Card className="mb-6">
                      <CardHeader>
                        <CardTitle className="text-lg">Customer Information</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor="customer-name">Customer</Label>
                            <Input
                              id="customer-name"
                              placeholder="jamesrostinberg"
                              value={customerInfo.name}
                              onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                            />
                          </div>
                          <div>
                            <Label htmlFor="customer-email">Email</Label>
                            <Input
                              id="customer-email"
                              placeholder="email"
                              value={customerInfo.email}
                              onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                            />
                          </div>
                          <div>
                            <Label htmlFor="order-id">Order ID</Label>
                            <Input
                              id="order-id"
                              placeholder="Order ID"
                              value={customerInfo.orderId}
                              onChange={(e) => setCustomerInfo(prev => ({ ...prev, orderId: e.target.value }))}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Search and Browse */}
                    <div className="mb-6">
                      <Tabs defaultValue="search" className="w-full">
                        <TabsList>
                          <TabsTrigger value="search">Search by filter</TabsTrigger>
                          <TabsTrigger value="browse">Browse inventory</TabsTrigger>
                        </TabsList>
                        <TabsContent value="search">
                          <div className="relative">
                            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                            <Input
                              placeholder="Search..."
                              className="pl-10"
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                            />
                          </div>
                        </TabsContent>
                        <TabsContent value="browse">
                          <div className="text-center text-muted-foreground py-4">
                            Browse through your complete inventory
                          </div>
                        </TabsContent>
                      </Tabs>
                    </div>

                    {/* Inventory Items */}
                    <div className="space-y-3 mb-6">
                      {filteredInventory.slice(0, 3).map((item) => (
                        <Card key={item.id} className="cursor-pointer hover:bg-muted/50" onClick={() => addToCheckout(item)}>
                          <CardContent className="p-4">
                            <div className="flex items-center gap-4">
                              <div className="w-16 h-16 bg-muted rounded overflow-hidden">
                                {item.photos?.main ? (
                                  <img
                                    src={item.photos.main}
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                    👔
                                  </div>
                                )}
                              </div>
                              <div className="flex-1">
                                <h4 className="font-medium">{item.name}</h4>
                                <div className="text-sm text-muted-foreground space-y-1">
                                  <div>Size: {item.size || 'M'} Qty: 1 Price: {item.price}$</div>
                                  <div>Unit Disc: None Disc(%): None Amt: N/A</div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {/* Discounts */}
                    <Card className="mb-6">
                      <CardHeader>
                        <CardTitle className="text-lg">Apply discounts and promotions</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="bg-muted/50 p-4 rounded">
                          <div className="text-sm">
                            <div>Discount Info: 25% off Special promotion by 153FM Radio</div>
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="discount-code">Discount code:</Label>
                          <div className="flex gap-2 mt-1">
                            <Input
                              id="discount-code"
                              placeholder="153FMRADIOSP#N132"
                              value={discountCode}
                              onChange={(e) => setDiscountCode(e.target.value)}
                            />
                            <Button onClick={applyDiscount}>Apply</Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>

              {/* Right Sidebar - Order Summary */}
              <aside className="w-80 border-l bg-muted/30 p-6">
                <div className="space-y-6">
                  {/* Cart Items */}
                  <div>
                    <h3 className="font-medium mb-3">Cart Items</h3>
                    <div className="space-y-2 mb-4">
                      {checkoutItems.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-2 bg-background rounded">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-muted rounded overflow-hidden">
                              {item.image ? (
                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-xs">👔</div>
                              )}
                            </div>
                            <div>
                              <div className="text-sm font-medium">{item.name}</div>
                              <div className="text-xs text-muted-foreground">${item.price}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="w-6 h-6"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="text-sm w-6 text-center">{item.quantity}</span>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="w-6 h-6"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Totals */}
                  <Card>
                    <CardContent className="p-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Totals:</span>
                        <span>${subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Taxes: 17%</span>
                        <span>${tax.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Shipping:</span>
                        <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Discounts: 17%</span>
                        <span>-${discount.toFixed(2)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-bold">
                        <span>Totals to pay:</span>
                        <span>${total.toFixed(2)}</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Payment Processing */}
                  <div className="space-y-3">
                    <div className="text-sm text-muted-foreground">
                      Process various payment methods (credit card, mobile payments, etc.)
                    </div>
                    <Button className="w-full" onClick={processPayment}>
                      <CreditCard className="w-4 h-4 mr-2" />
                      Process Payment
                    </Button>
                  </div>

                  {/* Receipt Generation */}
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Receipts generation:</div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => generateReceipt('email')}>
                        <Mail className="w-4 h-4 mr-1" />
                        Email
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => generateReceipt('print')}>
                        <Printer className="w-4 h-4 mr-1" />
                        Print
                      </Button>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Manage order status (mark as pending, shipped, completed, etc.)
                    </div>
                  </div>
                </div>
              </aside>
            </>
          )}

          {/* Order Management System */}
          {activeTab === 'orders' && (
            <div className="flex-1 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Order Management System</h2>
                <div className="flex gap-2">
                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Export Orders
                  </Button>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    New Order
                  </Button>
                </div>
              </div>
              
              {/* Order Stats */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Orders</p>
                        <p className="text-2xl font-bold">1,234</p>
                      </div>
                      <Package className="w-8 h-8 text-primary" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Pending</p>
                        <p className="text-2xl font-bold">42</p>
                      </div>
                      <Clock className="w-8 h-8 text-orange-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Shipped</p>
                        <p className="text-2xl font-bold">1,156</p>
                      </div>
                      <Truck className="w-8 h-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Revenue</p>
                        <p className="text-2xl font-bold">$32,450</p>
                      </div>
                      <DollarSign className="w-8 h-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Orders Filter */}
              <Card className="mb-6">
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <Input placeholder="Search orders..." />
                    </div>
                    <Select>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Order Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Orders</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="shipped">Shipped</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select>
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Date Range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="today">Today</SelectItem>
                        <SelectItem value="week">This Week</SelectItem>
                        <SelectItem value="month">This Month</SelectItem>
                        <SelectItem value="year">This Year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Orders Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Items</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">{order.id}</TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{order.customerName}</div>
                              <div className="text-sm text-muted-foreground">{order.customerEmail}</div>
                            </div>
                          </TableCell>
                          <TableCell>{order.items.length} items</TableCell>
                          <TableCell>${order.total.toFixed(2)}</TableCell>
                          <TableCell>
                            <Badge variant={
                              order.status === 'pending' ? 'secondary' :
                              order.status === 'processing' ? 'default' :
                              order.status === 'shipped' ? 'outline' :
                              order.status === 'delivered' ? 'default' :
                              'destructive'
                            }>
                              {order.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{order.date}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button size="sm" variant="ghost">
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="ghost">
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="ghost">
                                <Printer className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Inventory Management */}
          {activeTab === 'inventory' && (
            <div className="flex-1 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Inventory Management</h2>
                <div className="flex gap-2">
                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Export Inventory
                  </Button>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Product
                  </Button>
                </div>
              </div>

              {/* Inventory Alerts */}
              {inventoryAlerts.length > 0 && (
                <Card className="mb-6 border-orange-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-orange-500" />
                      Inventory Alerts
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {inventoryAlerts.map((alert) => (
                        <div key={alert.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <AlertCircle className={`w-4 h-4 ${alert.severity === 'critical' ? 'text-red-500' : 'text-orange-500'}`} />
                            <div>
                              <p className="font-medium">{alert.itemName}</p>
                              <p className="text-sm text-muted-foreground">
                                Stock: {alert.currentStock} / Threshold: {alert.threshold}
                              </p>
                            </div>
                          </div>
                          <Button size="sm">Restock</Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Inventory Stats */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Products</p>
                        <p className="text-2xl font-bold">{inventoryItems.length}</p>
                      </div>
                      <Package className="w-8 h-8 text-primary" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Low Stock</p>
                        <p className="text-2xl font-bold">{inventoryAlerts.filter(a => a.severity === 'low').length}</p>
                      </div>
                      <AlertTriangle className="w-8 h-8 text-orange-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Out of Stock</p>
                        <p className="text-2xl font-bold">{inventoryAlerts.filter(a => a.severity === 'critical').length}</p>
                      </div>
                      <AlertCircle className="w-8 h-8 text-red-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Value</p>
                        <p className="text-2xl font-bold">$125,490</p>
                      </div>
                      <DollarSign className="w-8 h-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Inventory Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Product Inventory</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <Input placeholder="Search products..." className="max-w-sm" />
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {inventoryItems.slice(0, 10).map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-muted rounded overflow-hidden">
                                {item.photos?.main ? (
                                  <img src={item.photos.main} alt={item.name} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">👔</div>
                                )}
                              </div>
                              <div>
                                <div className="font-medium">{item.name}</div>
                                <div className="text-sm text-muted-foreground">{item.brand}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{item.category}</TableCell>
                          <TableCell>${item.price}</TableCell>
                          <TableCell>{item.stock_quantity || 0}</TableCell>
                          <TableCell>
                            <Badge variant={item.stock_quantity && item.stock_quantity > 10 ? 'default' : 'destructive'}>
                              {item.stock_quantity && item.stock_quantity > 10 ? 'In Stock' : 'Low Stock'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button size="sm" variant="ghost">
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="ghost">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Customer Management */}
          {activeTab === 'customers' && (
            <div className="flex-1 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Customer Relationship Management</h2>
                <div className="flex gap-2">
                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Export Customers
                  </Button>
                  <Button>
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Send Campaign
                  </Button>
                </div>
              </div>

              {/* Customer Stats */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Customers</p>
                        <p className="text-2xl font-bold">2,456</p>
                      </div>
                      <Users className="w-8 h-8 text-primary" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Active Customers</p>
                        <p className="text-2xl font-bold">1,823</p>
                      </div>
                      <CheckCircle className="w-8 h-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Avg. Order Value</p>
                        <p className="text-2xl font-bold">$87.50</p>
                      </div>
                      <DollarSign className="w-8 h-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Satisfaction</p>
                        <p className="text-2xl font-bold">4.8</p>
                      </div>
                      <Star className="w-8 h-8 text-yellow-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Customer Insights */}
              <div className="grid grid-cols-2 gap-6 mb-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Top Customers</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {['James Rostinberg', 'Sarah Wilson', 'Mike Johnson'].map((name, index) => (
                        <div key={name} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm">
                              {name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <span className="font-medium">{name}</span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            ${[1250, 980, 756][index]} spent
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Recent Reviews</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        { name: 'Sarah W.', rating: 5, comment: 'Great quality jeans!' },
                        { name: 'Mike J.', rating: 4, comment: 'Fast shipping, good service' },
                        { name: 'Anna K.', rating: 5, comment: 'Perfect fit and style' }
                      ].map((review, index) => (
                        <div key={index} className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{review.name}</span>
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">{review.comment}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Financial Reports */}
          {activeTab === 'performance' && (
            <div className="flex-1 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Financial Reports & Payouts</h2>
                <div className="flex gap-2">
                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Export Report
                  </Button>
                  <Button>
                    <FileText className="w-4 h-4 mr-2" />
                    Generate Statement
                  </Button>
                </div>
              </div>
              
              {/* Financial Stats */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Gross Revenue</p>
                        <p className="text-2xl font-bold">$38,240</p>
                      </div>
                      <TrendingUp className="w-8 h-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Commission Fees</p>
                        <p className="text-2xl font-bold">$2,294</p>
                      </div>
                      <CreditCard className="w-8 h-8 text-orange-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Net Earnings</p>
                        <p className="text-2xl font-bold">$35,946</p>
                      </div>
                      <DollarSign className="w-8 h-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Pending Payout</p>
                        <p className="text-2xl font-bold">$4,580</p>
                      </div>
                      <Clock className="w-8 h-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Revenue Chart */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Revenue Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    Revenue chart visualization will be displayed here
                  </div>
                </CardContent>
              </Card>

              {/* Recent Transactions */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Transaction ID</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[
                        { date: '2024-01-20', id: 'TXN-001', type: 'Sale', amount: 192.85, status: 'Completed' },
                        { date: '2024-01-19', id: 'TXN-002', type: 'Sale', amount: 159.98, status: 'Completed' },
                        { date: '2024-01-18', id: 'TXN-003', type: 'Refund', amount: -45.00, status: 'Processed' }
                      ].map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell>{transaction.date}</TableCell>
                          <TableCell>{transaction.id}</TableCell>
                          <TableCell>{transaction.type}</TableCell>
                          <TableCell className={transaction.amount < 0 ? 'text-red-600' : 'text-green-600'}>
                            ${Math.abs(transaction.amount).toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <Badge variant="default">{transaction.status}</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Support Resources */}
          {activeTab === 'support' && (
            <div className="flex-1 p-6">
              <h2 className="text-2xl font-bold mb-6">Support & Resources</h2>
              
              <div className="grid grid-cols-2 gap-6">
                {/* Knowledge Base */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Knowledge Base
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[
                      'Getting Started Guide',
                      'Order Management Tutorial',
                      'Inventory Setup',
                      'Payment Processing',
                      'Customer Communication'
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-2 hover:bg-muted rounded cursor-pointer">
                        <span>{item}</span>
                        <ExternalLink className="w-4 h-4 text-muted-foreground" />
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Contact Support */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageCircle className="w-5 h-5" />
                      Contact Support
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button className="w-full">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Live Chat Support
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Mail className="w-4 h-4 mr-2" />
                      Email Support
                    </Button>
                    <div className="text-center text-sm text-muted-foreground">
                      Average response time: 2-4 hours
                    </div>
                  </CardContent>
                </Card>

                {/* Performance Benchmarking */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      Performance Benchmarks
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Avg. Order Processing Time</span>
                        <span className="text-green-600">Better than 85%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Customer Satisfaction</span>
                        <span className="text-green-600">Above Average</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Return Rate</span>
                        <span className="text-yellow-600">Industry Average</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Updates & Announcements */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5" />
                      Updates & News
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        { title: 'New Analytics Dashboard', date: '2024-01-15', type: 'Feature' },
                        { title: 'Enhanced Mobile POS', date: '2024-01-10', type: 'Update' },
                        { title: 'Holiday Sales Campaign', date: '2024-01-05', type: 'Promotion' }
                      ].map((update, index) => (
                        <div key={index} className="flex justify-between items-center p-2 hover:bg-muted rounded">
                          <div>
                            <div className="font-medium">{update.title}</div>
                            <div className="text-sm text-muted-foreground">{update.date}</div>
                          </div>
                          <Badge variant="outline">{update.type}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Edit Item Dialog */}
      <EditItemDialog
        item={editingItem}
        open={!!editingItem}
        onClose={() => setEditingItem(null)}
        onItemUpdated={handleItemUpdated}
      />
    </div>
  );
};

export default MerchantTerminal;