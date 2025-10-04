import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CheckoutFlow } from './CheckoutFlow';
import { MarketItem } from '@/hooks/useMarketItems';
import { useMarketplaceTransactions } from '@/hooks/useMarketplaceTransactions';

interface PurchaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: MarketItem;
  onSuccess?: () => void;
}

export const PurchaseDialog = ({ open, onOpenChange, item, onSuccess }: PurchaseDialogProps) => {
  const { createTransaction } = useMarketplaceTransactions();

  const handlePurchaseSuccess = async () => {
    // Create transaction record
    await createTransaction({
      item_id: item.id,
      seller_id: item.seller_id,
      price: item.price,
      shipping_cost: item.shipping_options?.shipping_cost || 0,
    });
    
    onOpenChange(false);
    if (onSuccess) onSuccess();
  };

  const totalAmount = item.price + (item.shipping_options?.shipping_cost || 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Purchase {item.title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Order Summary */}
          <div className="border rounded-lg p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Item Price</span>
              <span className="font-medium">${item.price.toFixed(2)}</span>
            </div>
            {item.shipping_options?.shipping_cost > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className="font-medium">${item.shipping_options.shipping_cost.toFixed(2)}</span>
              </div>
            )}
            <div className="border-t pt-2 flex justify-between font-bold">
              <span>Total</span>
              <span>${totalAmount.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment Form */}
          <CheckoutFlow
            amount={totalAmount}
            itemId={item.id}
            sellerId={item.seller_id}
            type="marketplace"
            onSuccess={handlePurchaseSuccess}
            onCancel={() => onOpenChange(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
