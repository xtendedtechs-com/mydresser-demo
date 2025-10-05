import { useState } from 'react';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useSubscription } from '@/hooks/useSubscription';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { PaymentMethod } from '@/services/myDresserPayments';
import { useNavigate } from 'react-router-dom';

const PricingPage = () => {
  const navigate = useNavigate();
  const { plans, currentSubscription, subscribeToPlan, isSubscribing } = useSubscription();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    billingName: '',
  });

  const handleSelectPlan = (plan: any) => {
    if (plan.tier === 'free') {
      navigate('/dashboard');
      return;
    }
    setSelectedPlan(plan);
    setShowPaymentDialog(true);
  };

  const handleSubscribe = () => {
    if (!selectedPlan) return;

    const paymentMethod: PaymentMethod = {
      type: 'card',
      cardNumber: paymentData.cardNumber,
      cardExpiry: `${paymentData.expiryMonth}/${paymentData.expiryYear}`,
      cardCVV: paymentData.cvv,
    };

    subscribeToPlan({
      planId: selectedPlan.id,
      paymentMethod,
    });

    setShowPaymentDialog(false);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(price);
  };

  if (!plans) return <div className="p-8">Loading plans...</div>;

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container max-w-7xl mx-auto p-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
          <p className="text-muted-foreground text-lg">
            Unlock premium features with MyDresser subscriptions
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <Label htmlFor="billing-cycle">Monthly</Label>
            <Switch
              id="billing-cycle"
              checked={billingCycle === 'yearly'}
              onCheckedChange={(checked) => setBillingCycle(checked ? 'yearly' : 'monthly')}
            />
            <Label htmlFor="billing-cycle">
              Yearly <span className="text-primary">(Save 20%)</span>
            </Label>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan: any) => {
            const price = billingCycle === 'monthly' ? (plan as any).price_monthly : (plan as any).price_yearly / 12;
            const isCurrentPlan = (currentSubscription as any)?.tier === (plan as any).tier;
            const isPremium = ['premium', 'professional'].includes((plan as any).tier);

            return (
              <Card
                key={plan.id}
                className={`p-6 relative ${
                  isPremium ? 'border-primary shadow-lg' : ''
                }`}
              >
                {isPremium && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
                    Popular
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-muted-foreground text-sm mb-4">{plan.description}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">{formatPrice(price)}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  {billingCycle === 'yearly' && (plan as any).tier !== 'free' && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {formatPrice((plan as any).price_yearly)} billed annually
                    </p>
                  )}
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className="w-full"
                  variant={isPremium ? 'default' : 'outline'}
                  disabled={isCurrentPlan || isSubscribing}
                  onClick={() => handleSelectPlan(plan)}
                >
                  {isCurrentPlan ? 'Current Plan' : 'Select Plan'}
                </Button>
              </Card>
            );
          })}
        </div>

        {/* Payment Dialog */}
        <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Payment Information</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              <div>
                <Label>Card Number</Label>
                <Input
                  placeholder="1234 5678 9012 3456"
                  value={paymentData.cardNumber}
                  onChange={(e) => setPaymentData({ ...paymentData, cardNumber: e.target.value })}
                  maxLength={16}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Month</Label>
                  <Input
                    placeholder="MM"
                    value={paymentData.expiryMonth}
                    onChange={(e) => setPaymentData({ ...paymentData, expiryMonth: e.target.value })}
                    maxLength={2}
                  />
                </div>
                <div>
                  <Label>Year</Label>
                  <Input
                    placeholder="YYYY"
                    value={paymentData.expiryYear}
                    onChange={(e) => setPaymentData({ ...paymentData, expiryYear: e.target.value })}
                    maxLength={4}
                  />
                </div>
                <div>
                  <Label>CVV</Label>
                  <Input
                    placeholder="123"
                    value={paymentData.cvv}
                    onChange={(e) => setPaymentData({ ...paymentData, cvv: e.target.value })}
                    maxLength={4}
                    type="password"
                  />
                </div>
              </div>

              <div>
                <Label>Cardholder Name</Label>
                <Input
                  placeholder="John Doe"
                  value={paymentData.billingName}
                  onChange={(e) => setPaymentData({ ...paymentData, billingName: e.target.value })}
                />
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm font-semibold mb-2">Order Summary</p>
                <div className="flex justify-between text-sm">
                  <span>{selectedPlan?.name} Plan</span>
                  <span>
                    {formatPrice(
                      billingCycle === 'monthly'
                        ? selectedPlan?.priceMonthly || 0
                        : selectedPlan?.priceYearly || 0
                    )}
                  </span>
                </div>
              </div>

              <Button
                className="w-full"
                onClick={handleSubscribe}
                disabled={isSubscribing || !paymentData.cardNumber || !paymentData.billingName}
              >
                {isSubscribing ? 'Processing...' : 'Subscribe Now'}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                🔒 Your payment information is encrypted and secure
              </p>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default PricingPage;
