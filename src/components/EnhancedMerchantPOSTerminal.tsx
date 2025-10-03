import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useMerchantAnalytics } from '@/hooks/useMerchantAnalytics';
import { useOrders } from '@/hooks/useOrders';
import { useMerchantItems } from '@/hooks/useMerchantItems';
import { 
  ShoppingCart, 
  Package, 
  TrendingUp, 
  AlertCircle,
  Barcode,
  CreditCard,
  Users,
  DollarSign,
  Clock,
  CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export const EnhancedMerchantPOSTerminal = () => {
  const [activeTab, setActiveTab] = useState('checkout');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [barcode, setBarcode] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');

  const { analytics, isLoading: analyticsLoading } = useMerchantAnalytics();
  const { orders } = useOrders();
  const { items } = useMerchantItems();

  const todaysOrders = orders?.filter(order => {
    const orderDate = new Date(order.created_at);
    const today = new Date();
    return orderDate.toDateString() === today.toDateString();
  }) || [];

  const totalSales = todaysOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
  const pendingOrders = orders?.filter(order => order.status === 'pending').length || 0;
  const lowStockItems = items?.filter(item => (item.stock_quantity || 0) < 10).length || 0;

  const addToCart = () => {
    const item = items?.find(i => i.id === barcode || i.name.toLowerCase().includes(barcode.toLowerCase()));
    if (item) {
      const existingItem = cart.find(c => c.id === item.id);
      if (existingItem) {
        setCart(cart.map(c => c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c));
      } else {
        setCart([...cart, { id: item.id, name: item.name, price: item.price, quantity: 1 }]);
      }
      setBarcode('');
      toast.success(`${item.name} added to cart`);
    } else {
      toast.error('Item not found');
    }
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter(item => item.id !== id));
    toast.info('Item removed from cart');
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setCart(cart.map(item => item.id === id ? { ...item, quantity } : item));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const processPayment = () => {
    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }
    
    // Here you would integrate with actual payment processing
    toast.success('Payment processed successfully!');
    setCart([]);
    setCustomerEmail('');
  };

  const quickStats = [
    {
      title: "Today's Sales",
      value: `$${totalSales.toFixed(2)}`,
      subtitle: `${todaysOrders.length} orders`,
      icon: DollarSign,
      color: 'text-green-600'
    },
    {
      title: 'Pending Orders',
      value: pendingOrders,
      subtitle: 'Awaiting fulfillment',
      icon: Clock,
      color: 'text-yellow-600'
    },
    {
      title: 'Items Sold',
      value: todaysOrders.reduce((sum, order) => sum + (order.items?.length || 0), 0),
      subtitle: 'Today',
      icon: Package,
      color: 'text-blue-600'
    },
    {
      title: 'Low Stock',
      value: lowStockItems,
      subtitle: 'Items need restock',
      icon: AlertCircle,
      color: 'text-red-600'
    }
  ];

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 space-y-4 sm:space-y-6 pb-20 md:pb-6">
      <div className="container max-w-7xl mx-auto">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">POS Terminal</h1>
            <p className="text-sm sm:text-base text-muted-foreground">Process sales and manage orders</p>
          </div>
          <Badge variant="outline" className="text-sm sm:text-lg px-3 sm:px-4 py-1.5 sm:py-2">
            <CheckCircle className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            System Online
          </Badge>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="container max-w-7xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {quickStats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="pt-4 sm:pt-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">{stat.title}</p>
                  <p className="text-xl sm:text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1 truncate">{stat.subtitle}</p>
                </div>
                <stat.icon className={`h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      </div>

      {/* Main POS Interface */}
      <div className="container max-w-7xl mx-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="checkout" className="text-xs sm:text-sm">
              <ShoppingCart className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Checkout</span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="text-xs sm:text-sm">
              <Package className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Orders</span>
            </TabsTrigger>
            <TabsTrigger value="customers" className="text-xs sm:text-sm">
              <Users className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Customers</span>
            </TabsTrigger>
          </TabsList>

        <TabsContent value="checkout" className="space-y-4 mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Scan Item */}
            <Card>
              <CardHeader>
                <CardTitle>Scan Item</CardTitle>
                <CardDescription>Scan barcode or search by name</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Label htmlFor="barcode">Barcode / Item Name</Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        id="barcode"
                        value={barcode}
                        onChange={(e) => setBarcode(e.target.value)}
                        placeholder="Scan or type item..."
                        onKeyPress={(e) => e.key === 'Enter' && addToCart()}
                      />
                      <Button onClick={addToCart}>
                        <Barcode className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Cart Items */}
                <div className="space-y-2">
                  <h3 className="font-semibold">Cart Items</h3>
                  {cart.length === 0 ? (
                    <p className="text-muted-foreground text-sm">Cart is empty</p>
                  ) : (
                    cart.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex-1">
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">${item.price.toFixed(2)} each</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            -
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            +
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => removeFromCart(item.id)}
                          >
                            ×
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Payment */}
            <Card>
              <CardHeader>
                <CardTitle>Payment</CardTitle>
                <CardDescription>Process customer payment</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="customer-email">Customer Email (Optional)</Label>
                  <Input
                    id="customer-email"
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="customer@example.com"
                    className="mt-2"
                  />
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-lg">
                    <span>Subtotal:</span>
                    <span>${cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Tax (10%):</span>
                    <span>${(cartTotal * 0.1).toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-2xl font-bold">
                    <span>Total:</span>
                    <span>${(cartTotal * 1.1).toFixed(2)}</span>
                  </div>
                </div>

                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={processPayment}
                  disabled={cart.length === 0}
                >
                  <CreditCard className="mr-2 h-5 w-5" />
                  Process Payment
                </Button>

                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" onClick={() => setCart([])}>
                    Clear Cart
                  </Button>
                  <Button variant="outline">
                    Save for Later
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>View and manage customer orders</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {todaysOrders.slice(0, 10).map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 border rounded">
                    <div>
                      <p className="font-medium">Order #{order.id.slice(0, 8)}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${order.total_amount?.toFixed(2)}</p>
                      <Badge variant={order.status === 'completed' ? 'default' : 'secondary'}>
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                ))}
                {todaysOrders.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">No orders today</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers">
          <Card>
            <CardHeader>
              <CardTitle>Customer Management</CardTitle>
              <CardDescription>Coming soon - Customer profiles and history</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Customer management features will be available in the next update.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
};
