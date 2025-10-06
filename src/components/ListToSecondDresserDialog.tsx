import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { WardrobeItem } from '@/hooks/useWardrobe';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface ListToSecondDresserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  wardrobeItem: WardrobeItem;
}

export const ListToSecondDresserDialog = ({ open, onOpenChange, wardrobeItem }: ListToSecondDresserDialogProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    price: '',
    originalPrice: wardrobeItem.purchase_price?.toString() || '',
    condition: wardrobeItem.condition || 'good',
    description: wardrobeItem.notes || '',
    shipping: true,
    shippingCost: '5',
    localPickup: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.price || parseFloat(formData.price) <= 0) {
      toast({
        title: 'Invalid price',
        description: 'Please enter a valid price',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Create market item entry
      const { error } = await supabase.from('market_items').insert({
        seller_id: user.id,
        wardrobe_item_id: wardrobeItem.id,
        title: wardrobeItem.name,
        description: formData.description,
        price: parseFloat(formData.price),
        original_price: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
        condition: formData.condition,
        size: wardrobeItem.size || '',
        brand: wardrobeItem.brand,
        category: wardrobeItem.category,
        color: wardrobeItem.color,
        material: wardrobeItem.material,
        photos: wardrobeItem.photos,
        tags: wardrobeItem.tags || [],
        shipping_options: {
          shipping_available: formData.shipping,
          shipping_cost: parseFloat(formData.shippingCost),
          local_pickup: formData.localPickup,
        },
        status: 'available',
      });

      if (error) throw error;

      toast({
        title: 'Item listed successfully',
        description: 'Your item is now available on 2ndDresser',
      });

      onOpenChange(false);
    } catch (error: any) {
      console.error('Error listing item:', error);
      toast({
        title: 'Error listing item',
        description: error.message || 'Something went wrong',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>List to 2ndDresser</DialogTitle>
          <DialogDescription>
            List your item on 2ndDresser marketplace
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Item: {wardrobeItem.name}</Label>
            <p className="text-sm text-muted-foreground">
              {wardrobeItem.brand && `${wardrobeItem.brand} • `}
              {wardrobeItem.category}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Price ($) *</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0"
              placeholder="50.00"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="originalPrice">Original Price ($)</Label>
            <Input
              id="originalPrice"
              type="number"
              step="0.01"
              min="0"
              placeholder="100.00"
              value={formData.originalPrice}
              onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="condition">Condition *</Label>
            <Select value={formData.condition} onValueChange={(value) => setFormData({ ...formData, condition: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">New with Tags</SelectItem>
                <SelectItem value="like-new">Like New</SelectItem>
                <SelectItem value="excellent">Excellent</SelectItem>
                <SelectItem value="good">Good</SelectItem>
                <SelectItem value="fair">Fair</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe your item, any wear details, sizing info..."
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="space-y-3">
            <Label>Shipping Options</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="shipping"
                  checked={formData.shipping}
                  onCheckedChange={(checked) => setFormData({ ...formData, shipping: !!checked })}
                />
                <Label htmlFor="shipping" className="font-normal">Offer Shipping</Label>
              </div>
              
              {formData.shipping && (
                <div className="ml-6 space-y-2">
                  <Label htmlFor="shippingCost" className="text-sm">Shipping Cost ($)</Label>
                  <Input
                    id="shippingCost"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="5.00"
                    value={formData.shippingCost}
                    onChange={(e) => setFormData({ ...formData, shippingCost: e.target.value })}
                  />
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="localPickup"
                  checked={formData.localPickup}
                  onCheckedChange={(checked) => setFormData({ ...formData, localPickup: !!checked })}
                />
                <Label htmlFor="localPickup" className="font-normal">Allow Local Pickup</Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              List Item
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};