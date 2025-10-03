import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useOutfits } from '@/hooks/useOutfits';
import { useWardrobe } from '@/hooks/useWardrobe';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';
import { LoadingSpinner } from './shared/LoadingSpinner';

interface OutfitBuilderProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const OutfitBuilder = ({ open, onOpenChange }: OutfitBuilderProps) => {
  const { createOutfit } = useOutfits();
  const { items, loading } = useWardrobe();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [occasion, setOccasion] = useState('');
  const [season, setSeason] = useState('');

  const handleSubmit = () => {
    if (!name || selectedItems.length === 0) {
      return;
    }

    createOutfit({
      name,
      description,
      occasion,
      season,
      is_favorite: false,
      is_public: false,
      wear_count: 0,
    });

    // Reset form
    setName('');
    setDescription('');
    setOccasion('');
    setSeason('');
    setSelectedItems([]);
    onOpenChange(false);
  };

  const toggleItem = (itemId: string) => {
    setSelectedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  if (loading) {
    return <LoadingSpinner message="Loading wardrobe..." />;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Create New Outfit</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-4">
          <div className="space-y-4">
            {/* Outfit Details */}
            <div className="space-y-2">
              <Label htmlFor="name">Outfit Name*</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Summer Casual, Office Meeting"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe this outfit..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="occasion">Occasion</Label>
                <Select value={occasion} onValueChange={setOccasion}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select occasion" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="casual">Casual</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="formal">Formal</SelectItem>
                    <SelectItem value="sport">Sport</SelectItem>
                    <SelectItem value="party">Party</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="season">Season</Label>
                <Select value={season} onValueChange={setSeason}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select season" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="spring">Spring</SelectItem>
                    <SelectItem value="summer">Summer</SelectItem>
                    <SelectItem value="fall">Fall</SelectItem>
                    <SelectItem value="winter">Winter</SelectItem>
                    <SelectItem value="all-season">All Season</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Selected Items */}
            {selectedItems.length > 0 && (
              <div className="space-y-2">
                <Label>Selected Items ({selectedItems.length})</Label>
                <div className="flex flex-wrap gap-2">
                  {selectedItems.map(itemId => {
                    const item = items.find(i => i.id === itemId);
                    return (
                      <Badge key={itemId} variant="secondary" className="gap-1">
                        {item?.name}
                        <X
                          size={14}
                          className="cursor-pointer"
                          onClick={() => toggleItem(itemId)}
                        />
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Wardrobe Items Selection */}
            <div className="space-y-2">
              <Label>Select Items from Wardrobe</Label>
              <div className="grid grid-cols-2 gap-2">
                {items.map(item => (
                  <div
                    key={item.id}
                    onClick={() => toggleItem(item.id)}
                    className={`p-3 border rounded-lg cursor-pointer transition-all ${
                      selectedItems.includes(item.id)
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                        selectedItems.includes(item.id) ? 'bg-primary border-primary' : 'border-border'
                      }`}>
                        {selectedItems.includes(item.id) && <Plus size={12} className="text-primary-foreground" />}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.category}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!name || selectedItems.length === 0}
          >
            Create Outfit
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
