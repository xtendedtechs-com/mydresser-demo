import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Shield, AlertTriangle, CheckCircle, ShoppingCart, Star } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface MarketItem {
  id: string;
  name: string;
  price: number;
  merchant_id: string;
  merchant_name?: string;
  image_url: string;
  description?: string;
}

interface MerchantVerification {
  trust_score: number;
  verification_tier: string;
  is_suspended: boolean;
}

export const SecureMarketplace = () => {
  const [items, setItems] = useState<MarketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<MarketItem | null>(null);
  const [merchantInfo, setMerchantInfo] = useState<MerchantVerification | null>(null);
  const [rateLimitInfo, setRateLimitInfo] = useState<{ hourly_remaining: number } | null>(null);
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadMarketItems();
    checkRateLimit();
  }, []);

  const loadMarketItems = async () => {
    try {
      // In a real implementation, this would fetch from market_items table
      // For now, we'll use a placeholder
      setItems([]);
    } catch (error) {
      console.error('Failed to load market items:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkRateLimit = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase.rpc('check_market_purchase_limit' as any, {
        p_user_id: user.id,
        p_amount: 0
      }) as any;

      if (error) throw error;

      const limitData = data?.[0];
      if (limitData) {
        setRateLimitInfo({
          hourly_remaining: limitData.hourly_remaining
        });
      }
    } catch (error) {
      console.error('Rate limit check failed:', error);
    }
  };

  const loadMerchantVerification = async (merchantId: string) => {
    try {
      const { data, error } = await supabase
        .from('market_merchant_verification')
        .select('trust_score, verification_tier, is_suspended')
        .eq('user_id', merchantId)
        .single();

      if (error) throw error;

      setMerchantInfo(data);
    } catch (error) {
      console.error('Failed to load merchant info:', error);
      setMerchantInfo(null);
    }
  };

  const handlePurchaseClick = async (item: MarketItem) => {
    setSelectedItem(item);
    await loadMerchantVerification(item.merchant_id);
    setShowPurchaseDialog(true);
  };

  const confirmPurchase = async () => {
    if (!selectedItem) return;

    setPurchasing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Check rate limit
      const { data: limitData } = await supabase.rpc('check_market_purchase_limit' as any, {
        p_user_id: user.id,
        p_amount: selectedItem.price
      }) as any;

      const limit = limitData?.[0];
      if (!limit?.allowed) {
        toast({
          title: "Purchase Limit Reached",
          description: limit?.reason || "Please try again later",
          variant: "destructive"
        });
        return;
      }

      // Check merchant is not suspended
      if (merchantInfo?.is_suspended) {
        toast({
          title: "Merchant Suspended",
          description: "This merchant is currently suspended and cannot process sales.",
          variant: "destructive"
        });
        return;
      }

      // Process purchase via edge function
      const { data, error } = await supabase.functions.invoke('process-market-purchase', {
        body: {
          itemId: selectedItem.id,
          merchantId: selectedItem.merchant_id,
          amount: selectedItem.price
        }
      });

      if (error) throw error;

      toast({
        title: "Purchase Successful!",
        description: "Your order has been confirmed."
      });

      setShowPurchaseDialog(false);
      await checkRateLimit();
    } catch (error) {
      console.error('Purchase failed:', error);
      toast({
        title: "Purchase Failed",
        description: error instanceof Error ? error.message : "Unable to complete purchase",
        variant: "destructive"
      });
    } finally {
      setPurchasing(false);
    }
  };

  const getTrustBadge = (score: number) => {
    if (score >= 80) return { label: 'Trusted', color: 'bg-green-500' };
    if (score >= 60) return { label: 'Verified', color: 'bg-blue-500' };
    if (score >= 40) return { label: 'Standard', color: 'bg-yellow-500' };
    return { label: 'New', color: 'bg-gray-500' };
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>MyDresser Market</CardTitle>
              <CardDescription>Shop from verified merchants</CardDescription>
            </div>
            {rateLimitInfo && (
              <Badge variant="outline" className="flex items-center gap-2">
                <ShoppingCart className="w-3 h-3" />
                {rateLimitInfo.hourly_remaining} purchases left
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading items...</div>
          ) : items.length === 0 ? (
            <div className="text-center py-8 space-y-2">
              <p className="text-muted-foreground">No items available yet</p>
              <p className="text-sm text-muted-foreground">Check back soon for new additions!</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
                <Card key={item.id} className="overflow-hidden">
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-full h-48 object-cover"
                  />
                  <CardContent className="p-4 space-y-3">
                    <div>
                      <h3 className="font-semibold">{item.name}</h3>
                      <p className="text-sm text-muted-foreground">{item.merchant_name}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold">${item.price}</span>
                      <Button size="sm" onClick={() => handlePurchaseClick(item)}>
                        Buy Now
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Purchase Confirmation Dialog */}
      <AlertDialog open={showPurchaseDialog} onOpenChange={setShowPurchaseDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Purchase</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4">
                <div>
                  <p className="font-semibold">{selectedItem?.name}</p>
                  <p className="text-2xl font-bold">${selectedItem?.price}</p>
                </div>

                {merchantInfo && (
                  <div className="space-y-2 p-3 bg-muted rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Merchant</span>
                      <Badge className={getTrustBadge(merchantInfo.trust_score).color}>
                        <Shield className="w-3 h-3 mr-1" />
                        {getTrustBadge(merchantInfo.trust_score).label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm">Trust Score: {merchantInfo.trust_score}/100</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <CheckCircle className="w-3 h-3" />
                      {merchantInfo.verification_tier} verification
                    </div>
                  </div>
                )}

                {merchantInfo && merchantInfo.trust_score < 50 && (
                  <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                    <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
                    <div className="text-sm text-yellow-900 dark:text-yellow-100">
                      <p className="font-medium">Lower Trust Score</p>
                      <p className="text-xs">This merchant is newer. Proceed with caution.</p>
                    </div>
                  </div>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={purchasing}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmPurchase} disabled={purchasing}>
              {purchasing ? 'Processing...' : 'Confirm Purchase'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
