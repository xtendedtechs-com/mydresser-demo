import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSubscription } from '@/hooks/useSubscription';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Calendar, TrendingUp, Shield } from 'lucide-react';
import { format } from 'date-fns';

const ManageSubscription = () => {
  const navigate = useNavigate();
  const { currentSubscription, cancelSubscription, isCancelling } = useSubscription();

  if (!currentSubscription) {
    return <div className="p-8">Loading subscription...</div>;
  }

  const plan = (currentSubscription as any).subscription_plans;
  const isFree = (currentSubscription as any).tier === 'free';

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container max-w-4xl mx-auto p-8">
        <h1 className="text-3xl font-bold mb-8">Manage Subscription</h1>

        {/* Current Plan */}
        <Card className="p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold mb-2">
                {plan?.name || 'Free'} Plan
              </h2>
              <Badge variant={isFree ? 'secondary' : 'default'}>
                {(currentSubscription as any).status}
              </Badge>
            </div>
            {!isFree && (
              <div className="text-right">
                <p className="text-3xl font-bold">
                  ${plan?.price_monthly || 0}
                </p>
                <p className="text-sm text-muted-foreground">/month</p>
              </div>
            )}
          </div>

          {!isFree && (
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Next billing date</p>
                  <p className="font-semibold">
                    {(currentSubscription as any).current_period_end
                      ? format(new Date((currentSubscription as any).current_period_end), 'MMM dd, yyyy')
                      : 'N/A'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Billing cycle</p>
                  <p className="font-semibold">{(currentSubscription as any).billing_cycle}</p>
                </div>
              </div>
            </div>
          )}

          {(currentSubscription as any).cancel_at_period_end && (
            <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm text-destructive font-semibold">
                Your subscription will be cancelled on{' '}
                {format(new Date((currentSubscription as any).current_period_end), 'MMMM dd, yyyy')}
              </p>
            </div>
          )}
        </Card>

        {/* Features */}
        {plan && (
          <Card className="p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Your Features
            </h3>
            <ul className="space-y-2">
              {(plan.features as string[]).map((feature, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <span className="text-primary">•</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </Card>
        )}

        {/* Actions */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Subscription Actions
          </h3>

          <div className="space-y-3">
            {isFree ? (
              <Button
                className="w-full"
                onClick={() => navigate('/subscription/pricing')}
              >
                Upgrade to Premium
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate('/subscription/pricing')}
                >
                  Change Plan
                </Button>

                {!(currentSubscription as any).cancel_at_period_end && (
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => cancelSubscription()}
                    disabled={isCancelling}
                  >
                    {isCancelling ? 'Cancelling...' : 'Cancel Subscription'}
                  </Button>
                )}
              </>
            )}

            <Button
              variant="ghost"
              className="w-full"
              onClick={() => navigate('/subscription/billing')}
            >
              View Billing History
            </Button>
          </div>
        </Card>

        {/* Security Notice */}
        <div className="mt-6 p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground text-center">
            🔒 All transactions are secured with enterprise-grade encryption
          </p>
        </div>
      </div>
    </div>
  );
};

export default ManageSubscription;
