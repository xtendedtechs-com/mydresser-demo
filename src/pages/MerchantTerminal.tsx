import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
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
  HelpCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMerchantItems } from '@/hooks/useMerchantItems';

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

  const { items: inventoryItems, loading } = useMerchantItems();
  const { toast } = useToast();

  const filteredInventory = inventoryItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
                  Checkout terminal
                </Button>
                <Button
                  variant={activeTab === 'orders' ? 'secondary' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setActiveTab('orders')}
                >
                  <Package className="w-4 h-4 mr-2" />
                  Orders overview
                </Button>
                <Button
                  variant={activeTab === 'performance' ? 'secondary' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setActiveTab('performance')}
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Performance overview
                </Button>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex">
          {activeTab === 'checkout' && (
            <>
              {/* Center Content - Checkout Terminal */}
              <div className="flex-1 p-6">
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-4">Checkout terminal</h2>
                    
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
                        <span>Taxes: 17% +$7.3$ 25715</span>
                        <span>${tax.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Shipping:</span>
                        <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Discounts: 17% -$64.2$</span>
                        <span>-${discount.toFixed(2)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-bold">
                        <span>Totals to pay:</span>
                        <span>${total.toFixed(2)}</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Payment */}
                  <div className="space-y-3">
                    <div className="text-sm text-muted-foreground">
                      Process various payment methods (credit card, mobile payments, etc.)
                    </div>
                    <Button className="w-full" onClick={processPayment}>
                      Process Payment
                    </Button>
                  </div>

                  {/* Receipt Generation */}
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-sm font-medium mb-3">Receipts generation:</div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => generateReceipt('email')}>
                          <Mail className="w-3 h-3 mr-1" />
                          Email
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => generateReceipt('print')}>
                          <Printer className="w-3 h-3 mr-1" />
                          Print
                        </Button>
                      </div>
                      <div className="text-xs text-muted-foreground mt-2">
                        Manage order status (mark as pending, shipped, completed, etc.)
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </aside>
            </>
          )}

          {activeTab === 'orders' && (
            <div className="flex-1 p-6">
              <div className="space-y-6">
                <h2 className="text-2xl font-bold">Orders Overview</h2>
                
                {/* Order Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <Package className="w-8 h-8 text-blue-500" />
                        <div className="ml-4">
                          <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                          <p className="text-2xl font-bold">1,247</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <ShoppingCart className="w-8 h-8 text-green-500" />
                        <div className="ml-4">
                          <p className="text-sm font-medium text-muted-foreground">Pending</p>
                          <p className="text-2xl font-bold">23</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <TrendingUp className="w-8 h-8 text-orange-500" />
                        <div className="ml-4">
                          <p className="text-sm font-medium text-muted-foreground">Completed</p>
                          <p className="text-2xl font-bold">1,198</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <DollarSign className="w-8 h-8 text-purple-500" />
                        <div className="ml-4">
                          <p className="text-sm font-medium text-muted-foreground">Revenue</p>
                          <p className="text-2xl font-bold">$45,231</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Orders */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Orders</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[1, 2, 3, 4, 5].map((order) => (
                        <div key={order} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <div className="font-medium">Order #{order}001</div>
                            <div className="text-sm text-muted-foreground">Customer: John Doe</div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">$127.99</div>
                            <Badge variant="outline">Pending</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'performance' && (
            <div className="flex-1 p-6">
              <div className="space-y-6">
                <h2 className="text-2xl font-bold">Performance Overview</h2>
                
                {/* Performance Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <BarChart3 className="w-8 h-8 text-green-500" />
                        <div className="ml-4">
                          <p className="text-sm font-medium text-muted-foreground">Today's Sales</p>
                          <p className="text-2xl font-bold">${salesData.today}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <TrendingUp className="w-8 h-8 text-blue-500" />
                        <div className="ml-4">
                          <p className="text-sm font-medium text-muted-foreground">This Week</p>
                          <p className="text-2xl font-bold">${salesData.thisWeek}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <DollarSign className="w-8 h-8 text-orange-500" />
                        <div className="ml-4">
                          <p className="text-sm font-medium text-muted-foreground">This Month</p>
                          <p className="text-2xl font-bold">${salesData.thisMonth}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <Package className="w-8 h-8 text-purple-500" />
                        <div className="ml-4">
                          <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                          <p className="text-2xl font-bold">{salesData.totalOrders}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Sales Chart Placeholder */}
                <Card>
                  <CardHeader>
                    <CardTitle>Sales Trend</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center text-muted-foreground">
                      Sales chart visualization would go here
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default MerchantTerminal;