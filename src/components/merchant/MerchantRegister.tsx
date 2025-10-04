import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useMerchantItems } from '@/hooks/useMerchantItems';
import { usePayments, PaymentMethod } from '@/hooks/usePayments';
import { useToast } from '@/hooks/use-toast';
import { Scan, Search, ShoppingCart, Trash2, Plus, Minus, CreditCard } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  size?: string;
}

type PaymentType = 'card' | 'bank' | 'digital_wallet';

export const MerchantRegister = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [paymentType, setPaymentType] = useState<PaymentType>('card');
  const { items } = useMerchantItems();
  const { processPayment, processing } = usePayments();
  const { toast } = useToast();

  const filteredItems = items?.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addToCart = (item: any, size?: string) => {
    const existingItem = cart.find(ci => ci.id === item.id && ci.size === size);
    
    if (existingItem) {
      setCart(cart.map(ci => 
        ci.id === item.id && ci.size === size
          ? { ...ci, quantity: ci.quantity + 1 }
          : ci
      ));
    } else {
      setCart([...cart, {
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: 1,
        size
      }]);
    }

    toast({
      title: 'Item Added',
      description: `${item.name} added to cart`,
    });
  };

  const updateQuantity = (itemId: string, size: string | undefined, change: number) => {
    setCart(cart.map(item => {
      if (item.id === itemId && item.size === size) {
        const newQuantity = Math.max(0, item.quantity + change);
        return { ...item, quantity: newQuantity };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const removeFromCart = (itemId: string, size: string | undefined) => {
    setCart(cart.filter(item => !(item.id === itemId && item.size === size)));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast({
        title: 'Empty Cart',
        description: 'Please add items to cart before checking out',
        variant: 'destructive',
      });
      return;
    }

    const paymentMethod: PaymentMethod = {
      type: paymentType
    };

    const result = await processPayment(
      cartTotal,
      'USD',
      paymentMethod,
      'In-store purchase',
      { items: cart, customerEmail }
    );

    if (result.success) {
      setCart([]);
      setCustomerEmail('');
      toast({
        title: 'Sale Completed',
        description: `Transaction completed successfully. Total: $${cartTotal.toFixed(2)}`,
      });
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Product Search & Selection */}
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Product Lookup</CardTitle>
            <CardDescription>Search or scan items to add to transaction</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search items by name or category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" size="icon">
                <Scan className="h-4 w-4" />
              </Button>
            </div>

            <div className="max-h-[400px] overflow-y-auto space-y-2">
              {filteredItems?.slice(0, 10).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent cursor-pointer"
                  onClick={() => addToCart(item)}
                >
                  <div className="flex-1">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">{item.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">${item.price}</p>
                    <Badge variant="secondary" className="text-xs">
                      Stock: {item.stock_quantity}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Shopping Cart & Checkout */}
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Current Transaction
            </CardTitle>
            <CardDescription>{cart.length} items in cart</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {cart.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <ShoppingCart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No items in cart</p>
              </div>
            ) : (
              <>
                <div className="max-h-[300px] overflow-y-auto space-y-2">
                  {cart.map((item, index) => (
                    <div key={`${item.id}-${item.size}-${index}`} className="flex items-center gap-3 p-3 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{item.name}</p>
                        {item.size && (
                          <Badge variant="outline" className="text-xs">Size: {item.size}</Badge>
                        )}
                        <p className="text-sm text-muted-foreground">${item.price} each</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.id, item.size, -1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center font-semibold">{item.quantity}</span>
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.id, item.size, 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={() => removeFromCart(item.id, item.size)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="text-right font-bold">
                        ${(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="space-y-3">
                  <Input
                    placeholder="Customer email (optional)"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    type="email"
                  />

                  <Select value={paymentType} onValueChange={(v) => setPaymentType(v as PaymentType)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="card">Credit/Debit Card</SelectItem>
                      <SelectItem value="bank">Bank Transfer</SelectItem>
                      <SelectItem value="digital_wallet">Digital Wallet</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="flex items-center justify-between text-lg font-bold pt-2">
                    <span>Total:</span>
                    <span className="text-2xl">${cartTotal.toFixed(2)}</span>
                  </div>

                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={handleCheckout}
                    disabled={processing || cart.length === 0}
                  >
                    <CreditCard className="mr-2 h-5 w-5" />
                    {processing ? 'Processing...' : 'Complete Sale'}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
