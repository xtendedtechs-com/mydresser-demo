import { useState } from 'react';
import { ShoppingCart, CreditCard, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { myDresserPayments } from '@/services/myDresserPayments';
import { supabase } from '@/integrations/supabase/client';

interface CheckoutItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface CheckoutFlowProps {
  items: CheckoutItem[];
  merchantId: string;
  onComplete?: (orderId: string) => void;
  onCancel?: () => void;
}

export const CheckoutFlow = ({ items, merchantId, onComplete, onCancel }: CheckoutFlowProps) => {
  const [step, setStep] = useState<'details' | 'payment' | 'complete'>('details');
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: ''
  });

  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: ''
  });

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.08; // 8% tax
  const shipping = subtotal > 50 ? 0 : 9.99;
  const total = subtotal + tax + shipping;

  const handleCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerInfo.name || !customerInfo.email) {
      toast({
        title: 'Required Fields',
        description: 'Please fill in all customer information',
        variant: 'destructive'
      });
      return;
    }
    setStep('payment');
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Process payment through MyDresser payment system
      const paymentMethod = {
        id: 'pm_' + Date.now(),
        type: 'card' as const,
        last4: paymentInfo.cardNumber.slice(-4),
        brand: 'Visa',
        expiryMonth: parseInt(paymentInfo.expiryMonth),
        expiryYear: parseInt(paymentInfo.expiryYear),
        isDefault: false
      };

      const paymentResult = await myDresserPayments.processPayment(
        total,
        'USD',
        paymentMethod,
        `Order from MyDresser`,
        { merchantId, items: items.map(i => i.id) }
      );

      if (!paymentResult.success) {
        throw new Error(paymentResult.error || 'Payment failed');
      }

      // Create order in database
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          merchant_id: merchantId,
          customer_name: customerInfo.name,
          customer_email: customerInfo.email,
          customer_phone: customerInfo.phone || '',
          items: items as any,
          subtotal: subtotal,
          tax_amount: tax,
          shipping_amount: shipping,
          total_amount: total,
          status: 'pending',
          payment_status: 'paid',
          payment_method: 'card'
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      for (const item of items) {
        await supabase
          .from('order_items')
          .insert({
            order_id: order.id,
            merchant_item_id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity
          });
      }

      setStep('complete');
      toast({
        title: 'Order Placed! 🎉',
        description: `Order #${order.id.slice(0, 8)} has been confirmed`
      });

      if (onComplete) {
        onComplete(order.id);
      }

    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: 'Payment Failed',
        description: error instanceof Error ? error.message : 'Please try again',
        variant: 'destructive'
      });
    } finally {
      setProcessing(false);
    }
  };

  if (step === 'complete') {
    return (
      <Card className="p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-2xl font-bold mb-2">Order Complete!</h3>
        <p className="text-muted-foreground mb-6">
          Thank you for your purchase. You'll receive a confirmation email shortly.
        </p>
        <Button onClick={() => window.location.href = '/'}>
          Continue Shopping
        </Button>
      </Card>
    );
  }

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div className="space-y-6">
        {step === 'details' && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Customer Information</h3>
            <form onSubmit={handleCustomerSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={customerInfo.name}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={customerInfo.email}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={customerInfo.phone}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                />
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  Continue to Payment
                </Button>
              </div>
            </form>
          </Card>
        )}

        {step === 'payment' && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Payment Information
            </h3>
            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              <div>
                <Label htmlFor="cardNumber">Card Number *</Label>
                <Input
                  id="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  value={paymentInfo.cardNumber}
                  onChange={(e) => setPaymentInfo({ ...paymentInfo, cardNumber: e.target.value })}
                  maxLength={16}
                  required
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="expiryMonth">Month *</Label>
                  <Input
                    id="expiryMonth"
                    placeholder="MM"
                    value={paymentInfo.expiryMonth}
                    onChange={(e) => setPaymentInfo({ ...paymentInfo, expiryMonth: e.target.value })}
                    maxLength={2}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="expiryYear">Year *</Label>
                  <Input
                    id="expiryYear"
                    placeholder="YY"
                    value={paymentInfo.expiryYear}
                    onChange={(e) => setPaymentInfo({ ...paymentInfo, expiryYear: e.target.value })}
                    maxLength={2}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="cvv">CVV *</Label>
                  <Input
                    id="cvv"
                    placeholder="123"
                    value={paymentInfo.cvv}
                    onChange={(e) => setPaymentInfo({ ...paymentInfo, cvv: e.target.value })}
                    maxLength={3}
                    required
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setStep('details')} className="flex-1">
                  Back
                </Button>
                <Button type="submit" disabled={processing} className="flex-1">
                  {processing ? 'Processing...' : `Pay $${total.toFixed(2)}`}
                </Button>
              </div>
            </form>
          </Card>
        )}
      </div>

      <div>
        <Card className="p-6 sticky top-4">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Order Summary
          </h3>
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span>{item.name} × {item.quantity}</span>
                <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <Separator />
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
              </div>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
