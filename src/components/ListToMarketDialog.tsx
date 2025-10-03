import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Switch } from '@/components/ui/switch';

interface ListToMarketDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  wardrobeItem: {
    id: string;
    name: string;
    description?: string;
    category: string;
    brand?: string;
    color?: string;
    size?: string;
    material?: string;
    photos?: any;
  };
}

export const ListToMarketDialog = ({ open, onOpenChange, wardrobeItem }: ListToMarketDialogProps) => {
  const { toast } = useToast();
  const [price, setPrice] = useState('');
  const [condition, setCondition] = useState('good');
  const [shippingAvailable, setShippingAvailable] = useState(true);
  const [shippingCost, setShippingCost] = useState('0');
  const [localPickup, setLocalPickup] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!price || parseFloat(price) <= 0) {
      toast({
        title: 'Invalid Price',
        description: 'Please enter a valid price.',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase.from('market_items').insert({
        seller_id: user.id,
        wardrobe_item_id: wardrobeItem.id,
        title: wardrobeItem.name,
        description: wardrobeItem.description || '',
        category: wardrobeItem.category,
        brand: wardrobeItem.brand,
        color: wardrobeItem.color,
        size: wardrobeItem.size,
        material: wardrobeItem.material,
        price: parseFloat(price),
        condition,
        photos: wardrobeItem.photos,
        shipping_options: {
          shipping_available: shippingAvailable,
          shipping_cost: parseFloat(shippingCost),
          local_pickup: localPickup,
        },
        status: 'available',
      });

      if (error) throw error;

      toast({
        title: 'Listed Successfully',
        description: 'Your item has been listed on the marketplace.',
      });

      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>List to Marketplace</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-4 bg-muted rounded-lg">
            <p className="font-medium">{wardrobeItem.name}</p>
            <p className="text-sm text-muted-foreground">{wardrobeItem.category}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Price ($)*</Label>
            <Input
              id="price"
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="condition">Condition</Label>
            <Select value={condition} onValueChange={setCondition}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="excellent">Excellent</SelectItem>
                <SelectItem value="good">Good</SelectItem>
                <SelectItem value="fair">Fair</SelectItem>
                <SelectItem value="worn">Worn</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3 pt-2 border-t">
            <div className="flex items-center justify-between">
              <Label htmlFor="shipping">Shipping Available</Label>
              <Switch
                id="shipping"
                checked={shippingAvailable}
                onCheckedChange={setShippingAvailable}
              />
            </div>

            {shippingAvailable && (
              <div className="space-y-2">
                <Label htmlFor="shippingCost">Shipping Cost ($)</Label>
                <Input
                  id="shippingCost"
                  type="number"
                  min="0"
                  step="0.01"
                  value={shippingCost}
                  onChange={(e) => setShippingCost(e.target.value)}
                />
              </div>
            )}

            <div className="flex items-center justify-between">
              <Label htmlFor="pickup">Local Pickup</Label>
              <Switch
                id="pickup"
                checked={localPickup}
                onCheckedChange={setLocalPickup}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Listing...' : 'List Item'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
