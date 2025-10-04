import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreditCard, Wallet, Building2 } from 'lucide-react';
import { PaymentMethod } from '@/services/myDresserPayments';
import { usePayments } from '@/hooks/usePayments';
import { supabase } from '@/integrations/supabase/client';

interface CheckoutFlowProps {
  amount: number;
  itemId?: string;
  orderId?: string;
  sellerId?: string;
  merchantId?: string;
  type: 'marketplace' | 'order';
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const CheckoutFlow = ({
  amount,
  itemId,
  orderId,
  sellerId,
  merchantId,
  type,
  onSuccess,
  onCancel,
}: CheckoutFlowProps) => {
  const [paymentType, setPaymentType] = useState<'card' | 'bank' | 'digital_wallet'>('card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardHolder, setCardHolder] = useState('');

  const { processing, processMarketplaceSale, processOrderPayment } = usePayments();

  const handlePayment = async () => {
    const paymentMethod: PaymentMethod = {
      type: paymentType,
      ...(paymentType === 'card' && {
        cardNumber,
        cardExpiry,
        cardCVV: cardCvv,
      }),
    };

    let result;
    
    if (type === 'marketplace' && itemId && sellerId) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      result = await processMarketplaceSale(
        sellerId,
        user.id,
        itemId,
        amount,
        paymentMethod
      );
    } else if (type === 'order' && orderId && merchantId) {
      result = await processOrderPayment(
        orderId,
        amount,
        paymentMethod,
        merchantId
      );
    }

    if (result?.success && onSuccess) {
      onSuccess();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Complete Payment</CardTitle>
        <CardDescription>
          Total Amount: ${amount.toFixed(2)}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Payment Method Selection */}
        <div className="space-y-2">
          <Label>Payment Method</Label>
          <div className="grid grid-cols-3 gap-4">
            <Button
              type="button"
              variant={paymentType === 'card' ? 'default' : 'outline'}
              onClick={() => setPaymentType('card')}
              className="flex flex-col items-center gap-2 h-auto py-4"
            >
              <CreditCard className="h-6 w-6" />
              <span>Card</span>
            </Button>
            <Button
              type="button"
              variant={paymentType === 'bank' ? 'default' : 'outline'}
              onClick={() => setPaymentType('bank')}
              className="flex flex-col items-center gap-2 h-auto py-4"
            >
              <Building2 className="h-6 w-6" />
              <span>Bank</span>
            </Button>
            <Button
              type="button"
              variant={paymentType === 'digital_wallet' ? 'default' : 'outline'}
              onClick={() => setPaymentType('digital_wallet')}
              className="flex flex-col items-center gap-2 h-auto py-4"
            >
              <Wallet className="h-6 w-6" />
              <span>Wallet</span>
            </Button>
          </div>
        </div>

        {/* Card Payment Form */}
        {paymentType === 'card' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cardHolder">Cardholder Name</Label>
              <Input
                id="cardHolder"
                placeholder="John Doe"
                value={cardHolder}
                onChange={(e) => setCardHolder(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cardNumber">Card Number</Label>
              <Input
                id="cardNumber"
                placeholder="1234 5678 9012 3456"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value.replace(/\s/g, ''))}
                maxLength={16}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiry">Expiry Date</Label>
                <Input
                  id="expiry"
                  placeholder="MM/YY"
                  value={cardExpiry}
                  onChange={(e) => setCardExpiry(e.target.value)}
                  maxLength={5}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cvv">CVV</Label>
                <Input
                  id="cvv"
                  placeholder="123"
                  type="password"
                  value={cardCvv}
                  onChange={(e) => setCardCvv(e.target.value)}
                  maxLength={4}
                />
              </div>
            </div>
          </div>
        )}

        {/* Bank Transfer Info */}
        {paymentType === 'bank' && (
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                Bank transfer will be processed securely through MyDresser payment system.
                You'll receive confirmation once the transfer is complete.
              </p>
            </div>
          </div>
        )}

        {/* Digital Wallet Info */}
        {paymentType === 'digital_wallet' && (
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                Your MyDresser wallet will be charged ${amount.toFixed(2)}.
                This is a fast and secure payment method.
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button
            onClick={handlePayment}
            disabled={processing || (paymentType === 'card' && (!cardNumber || !cardExpiry || !cardCvv || !cardHolder))}
            className="flex-1"
          >
            {processing ? 'Processing...' : `Pay $${amount.toFixed(2)}`}
          </Button>
          {onCancel && (
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={processing}
            >
              Cancel
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
