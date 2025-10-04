import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Save, 
  X, 
  Plus, 
  Minus,
  Shirt,
  Search,
  Replace
} from "lucide-react";
import { useWardrobe } from "@/hooks/useWardrobe";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { getPrimaryPhotoUrl } from "@/utils/photoHelpers";

interface EditOutfitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  outfit: any;
  onOutfitUpdated?: (updatedOutfit: any) => void;
}

const EditOutfitDialog = ({ open, onOpenChange, outfit, onOutfitUpdated }: EditOutfitDialogProps) => {
  const { items: wardrobeItems } = useWardrobe();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: '',
    notes: '',
    occasion: '',
    season: ''
  });
  
  const [outfitItems, setOutfitItems] = useState<any[]>([]);
  const [availableItems, setAvailableItems] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (outfit && open) {
      setFormData({
        name: outfit.name || '',
        notes: outfit.notes || '',
        occasion: outfit.occasion || '',
        season: outfit.season || ''
      });
      
      setOutfitItems(outfit.items || []);
      setAvailableItems(wardrobeItems.filter(item => 
        !outfit.items?.some((outfitItem: any) => outfitItem.id === item.id)
      ));
    }
  }, [outfit, open, wardrobeItems]);

  const filteredAvailableItems = availableItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.brand?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addItemToOutfit = (item: any) => {
    setOutfitItems(prev => [...prev, item]);
    setAvailableItems(prev => prev.filter(availableItem => availableItem.id !== item.id));
  };

  const removeItemFromOutfit = (itemId: string) => {
    const removedItem = outfitItems.find(item => item.id === itemId);
    if (removedItem) {
      setOutfitItems(prev => prev.filter(item => item.id !== itemId));
      setAvailableItems(prev => [...prev, removedItem]);
    }
  };

  const replaceItem = (oldItemId: string, newItem: any) => {
    const oldItem = outfitItems.find(item => item.id === oldItemId);
    if (oldItem) {
      setOutfitItems(prev => prev.map(item => 
        item.id === oldItemId ? newItem : item
      ));
      setAvailableItems(prev => 
        prev.filter(item => item.id !== newItem.id).concat([oldItem])
      );
    }
  };

  const saveOutfit = async () => {
    try {
      setLoading(true);
      
      if (!formData.name.trim()) {
        toast({
          title: "Name Required",
          description: "Please enter a name for your outfit",
          variant: "destructive"
        });
        return;
      }

      if (outfitItems.length === 0) {
        toast({
          title: "Items Required",
          description: "Please add at least one item to your outfit",
          variant: "destructive"
        });
        return;
      }

      // Update outfit details
      const { error: outfitError } = await supabase
        .from('outfits')
        .update({
          name: formData.name,
          notes: formData.notes,
          occasion: formData.occasion,
          season: formData.season,
          updated_at: new Date().toISOString()
        })
        .eq('id', outfit.id);

      if (outfitError) throw outfitError;

      // Delete existing outfit items
      const { error: deleteError } = await supabase
        .from('outfit_items')
        .delete()
        .eq('outfit_id', outfit.id);

      if (deleteError) throw deleteError;

      // Insert new outfit items
      const outfitItemsData = outfitItems.map(item => ({
        outfit_id: outfit.id,
        wardrobe_item_id: item.id,
        item_type: item.category
      }));

      const { error: insertError } = await supabase
        .from('outfit_items')
        .insert(outfitItemsData);

      if (insertError) throw insertError;

      toast({
        title: "Outfit Updated",
        description: "Your outfit has been updated successfully"
      });

      // Notify parent component
      if (onOutfitUpdated) {
        onOutfitUpdated({
          ...outfit,
          ...formData,
          items: outfitItems
        });
      }

      onOpenChange(false);
    } catch (error) {
      console.error('Error saving outfit:', error);
      toast({
        title: "Error",
        description: "Failed to save outfit. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const occasions = ['Casual', 'Work', 'Formal', 'Party', 'Sport', 'Travel'];
  const seasons = ['Spring', 'Summer', 'Fall', 'Winter', 'All Seasons'];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shirt className="w-5 h-5" />
            Edit Outfit
          </DialogTitle>
          <DialogDescription>
            Customize your outfit by editing details and swapping items
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Outfit Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Outfit Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="My amazing outfit"
              />
            </div>
            
            <div>
              <Label htmlFor="occasion">Occasion</Label>
              <select
                id="occasion"
                value={formData.occasion}
                onChange={(e) => setFormData(prev => ({ ...prev, occasion: e.target.value }))}
                className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
              >
                <option value="">Select occasion</option>
                {occasions.map(occasion => (
                  <option key={occasion} value={occasion.toLowerCase()}>{occasion}</option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="season">Season</Label>
              <select
                id="season"
                value={formData.season}
                onChange={(e) => setFormData(prev => ({ ...prev, season: e.target.value }))}
                className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
              >
                <option value="">Select season</option>
                {seasons.map(season => (
                  <option key={season} value={season.toLowerCase()}>{season}</option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Add notes about this outfit..."
                rows={3}
              />
            </div>
          </div>

          {/* Current Outfit Items */}
          <div>
            <Label className="text-base font-semibold">Current Outfit Items ({outfitItems.length})</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
              {outfitItems.map(item => (
                <Card key={item.id} className="relative">
                  <CardContent className="p-3 text-center">
                    <Avatar className="w-16 h-16 mx-auto mb-2">
                      <AvatarImage src={getPrimaryPhotoUrl(item.photos, item.category)} />
                      <AvatarFallback>{item.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <p className="text-sm font-medium line-clamp-1">{item.name}</p>
                    <Badge variant="outline" className="text-xs mt-1">{item.category}</Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-1 right-1 w-6 h-6"
                      onClick={() => removeItemFromOutfit(item.id)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
              
              {outfitItems.length === 0 && (
                <div className="col-span-full text-center py-8 text-muted-foreground">
                  <Shirt className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No items in outfit yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Available Items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-base font-semibold">Add Items from Wardrobe</Label>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="max-h-64 overflow-y-auto border rounded-lg p-3">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {filteredAvailableItems.map(item => (
                  <Card key={item.id} className="cursor-pointer hover:bg-accent/50 transition-colors">
                    <CardContent className="p-3 text-center">
                      <Avatar className="w-12 h-12 mx-auto mb-2">
                        <AvatarImage src={item.photos?.main || '/placeholder.svg'} />
                        <AvatarFallback>{item.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <p className="text-xs font-medium line-clamp-1 mb-1">{item.name}</p>
                      <Badge variant="outline" className="text-xs mb-2">{item.category}</Badge>
                      <Button
                        size="sm"
                        onClick={() => addItemToOutfit(item)}
                        className="w-full"
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Add
                      </Button>
                    </CardContent>
                  </Card>
                ))}
                
                {filteredAvailableItems.length === 0 && (
                  <div className="col-span-full text-center py-4 text-muted-foreground">
                    <p className="text-sm">
                      {searchQuery ? 'No items match your search' : 'No available items'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={saveOutfit} disabled={loading} className="flex-1">
              {loading ? (
                <>Loading...</>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditOutfitDialog;