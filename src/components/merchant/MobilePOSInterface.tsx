import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Plus, Minus, Trash2, CreditCard, DollarSign, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export function MobilePOSInterface() {
  const { toast } = useToast();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const products = [
    { id: '1', name: 'Classic T-Shirt', price: 29.99, category: 'Tops' },
    { id: '2', name: 'Denim Jeans', price: 79.99, category: 'Bottoms' },
    { id: '3', name: 'Leather Jacket', price: 199.99, category: 'Outerwear' },
    { id: '4', name: 'Sneakers', price: 89.99, category: 'Footwear' },
    { id: '5', name: 'Baseball Cap', price: 24.99, category: 'Accessories' },
    { id: '6', name: 'Summer Dress', price: 59.99, category: 'Dresses' },
  ];

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addToCart = (product: typeof products[0]) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      setCart(cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(cart.map(item =>
      item.id === id
        ? { ...item, quantity: Math.max(1, item.quantity + delta) }
        : item
    ).filter(item => item.quantity > 0));
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = total * 0.1;
  const finalTotal = total + tax;

  const processPayment = (method: string) => {
    toast({
      title: 'Payment processed',
      description: `$${finalTotal.toFixed(2)} charged via ${method}`
    });
    setCart([]);
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="border-b p-4">
        <h1 className="text-xl font-bold">Mobile POS</h1>
        <p className="text-sm text-muted-foreground">Touch-optimized interface</p>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Products Section */}
        <div className="flex-1 flex flex-col border-r">
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 text-base"
              />
            </div>
          </div>

          <ScrollArea className="flex-1 p-4">
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredProducts.map(product => (
                <Card
                  key={product.id}
                  className="cursor-pointer hover:bg-accent transition-colors"
                  onClick={() => addToCart(product)}
                >
                  <CardContent className="p-4">
                    <div className="aspect-square bg-muted rounded-lg mb-3 flex items-center justify-center">
                      <Package className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <h3 className="font-medium text-sm mb-1">{product.name}</h3>
                    <p className="text-lg font-bold">${product.price}</p>
                    <Badge variant="secondary" className="mt-2 text-xs">
                      {product.category}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Cart Section */}
        <div className="w-full md:w-96 flex flex-col">
          <div className="p-4 border-b">
            <h2 className="font-semibold text-lg">Current Order</h2>
          </div>

          <ScrollArea className="flex-1 p-4">
            {cart.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Cart is empty</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cart.map(item => (
                  <Card key={item.id}>
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="font-medium text-sm">{item.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            ${item.price} each
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.id, -1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center font-medium">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.id, 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <p className="font-bold">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Totals & Payment */}
          {cart.length > 0 && (
            <div className="border-t p-4 space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax (10%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total</span>
                  <span>${finalTotal.toFixed(2)}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  size="lg"
                  className="h-14"
                  onClick={() => processPayment('Card')}
                >
                  <CreditCard className="h-5 w-5 mr-2" />
                  Card
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-14"
                  onClick={() => processPayment('Cash')}
                >
                  <DollarSign className="h-5 w-5 mr-2" />
                  Cash
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const Package = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  </svg>
);

const ShoppingCart = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);
