import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useWardrobe, WardrobeItem } from '@/hooks/useWardrobe';
import { useMerchantItems } from '@/hooks/useMerchantItems';
import { useItemMatches } from '@/hooks/useItemMatches';
import { supabase } from '@/integrations/supabase/client';
import { Upload, X } from 'lucide-react';
import ItemMatchDialog from './ItemMatchDialog';
import RealImageUpload from './RealImageUpload';

interface AddItemWithMatchingProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: Partial<{
    name: string;
    category: string;
    brand: string;
    color: string;
    material: string;
    season: string;
    occasion: string;
    condition: string;
    description: string;
    style_tags: string[];
    photo: string;
  }>;
}

const categories = [
  'tops', 'bottoms', 'dresses', 'outerwear', 'shoes', 
  'accessories', 'underwear', 'activewear', 'formal'
];

const conditions = ['Excellent', 'Good', 'Fair', 'Poor'];
const seasons = ['Spring', 'Summer', 'Fall', 'Winter', 'All Seasons'];
const occasions = ['Casual', 'Work', 'Formal', 'Party', 'Sport', 'Travel'];

const AddItemWithMatching = ({ open, onOpenChange, initialData }: AddItemWithMatchingProps) => {
  const { toast } = useToast();
  const { addItem } = useWardrobe();
  const { items: merchantItems } = useMerchantItems();
  const { findMatches } = useItemMatches();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMatchDialog, setShowMatchDialog] = useState(false);
  const [potentialMatch, setPotentialMatch] = useState<{
    wardrobeItem: WardrobeItem;
    merchantItem: any;
    matchScore: number;
    matchReasons: string[];
  } | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    brand: '',
    color: '',
    size: '',
    material: '',
    season: '',
    occasion: '',
    condition: 'excellent',
    purchase_price: '',
    location_in_wardrobe: '',
    notes: '',
    tags: [] as string[]
  });

  const [currentTag, setCurrentTag] = useState('');
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);

  // Helpers to map scan data
  const titleCase = (s?: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
  const mapCondition = (c?: string) => {
    if (!c) return undefined;
    const lc = c.toLowerCase();
    if (lc === 'new' || lc === 'like-new' || lc === 'excellent') return 'Excellent';
    if (lc === 'good') return 'Good';
    if (lc === 'fair') return 'Fair';
    return 'Good';
  };

  useEffect(() => {
    if (!initialData) return;
    setFormData(prev => ({
      ...prev,
      name: initialData.name ?? prev.name,
      category: initialData.category ?? prev.category,
      brand: initialData.brand ?? prev.brand,
      color: initialData.color ?? prev.color,
      material: initialData.material ?? prev.material,
      season: initialData.season ? (titleCase(initialData.season) as string) : prev.season,
      occasion: initialData.occasion ? (titleCase(initialData.occasion) as string) : prev.occasion,
      condition: mapCondition(initialData.condition) ?? prev.condition,
      notes: initialData.description ?? prev.notes,
      tags: Array.from(new Set([...(prev.tags || []), ...(((initialData.style_tags as string[]) || []))]))
    }));
    if (initialData.photo) {
      setPhotoUrls(prev => [initialData.photo as string, ...prev]);
    }
  }, [initialData]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()]
      }));
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.category) {
      toast({
        title: "Missing required fields",
        description: "Please fill in at least the name and category.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // Create the wardrobe item
      const itemData = {
        ...formData,
        user_id: '', // Will be set by the hook
        purchase_price: formData.purchase_price ? parseFloat(formData.purchase_price) : undefined,
        photos: photoUrls.length > 0 ? { urls: photoUrls } : undefined,
        season: formData.season.toLowerCase() || 'all-season',
        occasion: formData.occasion.toLowerCase() || 'casual',
        condition: formData.condition.toLowerCase(),
        wear_count: 0,
        is_favorite: false
      };

      const newItem = await addItem(itemData);

      // Check for matches with merchant items
      const matches = await findMatches(newItem, merchantItems);
      
      if (matches.length > 0) {
        // Show the best match
        const bestMatch = matches[0];
        setPotentialMatch({
          wardrobeItem: newItem,
          merchantItem: bestMatch.merchantItem,
          matchScore: bestMatch.matchScore,
          matchReasons: bestMatch.matchReasons
        });
        setShowMatchDialog(true);
      } else {
        toast({
          title: "Item added successfully!",
          description: `${formData.name} has been added to your wardrobe.`,
        });
        onOpenChange(false);
      }

    } catch (error) {
      console.error('Error adding item:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMatchAccept = () => {
    onOpenChange(false);
  };

  const handleMatchReject = () => {
    onOpenChange(false);
  };

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle>Add New Item</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="e.g., Blue Denim Jacket"
                />
              </div>

              <div>
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="brand">Brand</Label>
                <Input
                  id="brand"
                  value={formData.brand}
                  onChange={(e) => handleInputChange('brand', e.target.value)}
                  placeholder="e.g., Levi's"
                />
              </div>

              <div>
                <Label htmlFor="color">Color</Label>
                <Input
                  id="color"
                  value={formData.color}
                  onChange={(e) => handleInputChange('color', e.target.value)}
                  placeholder="e.g., Blue"
                />
              </div>

              <div>
                <Label htmlFor="size">Size</Label>
                <Input
                  id="size"
                  value={formData.size}
                  onChange={(e) => handleInputChange('size', e.target.value)}
                  placeholder="e.g., M, L, 32"
                />
              </div>

              <div>
                <Label htmlFor="material">Material</Label>
                <Input
                  id="material"
                  value={formData.material}
                  onChange={(e) => handleInputChange('material', e.target.value)}
                  placeholder="e.g., Cotton, Denim"
                />
              </div>

              <div>
                <Label htmlFor="season">Season</Label>
                <Select value={formData.season} onValueChange={(value) => handleInputChange('season', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select season" />
                  </SelectTrigger>
                  <SelectContent>
                    {seasons.map(season => (
                      <SelectItem key={season} value={season}>{season}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="occasion">Occasion</Label>
                <Select value={formData.occasion} onValueChange={(value) => handleInputChange('occasion', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select occasion" />
                  </SelectTrigger>
                  <SelectContent>
                    {occasions.map(occasion => (
                      <SelectItem key={occasion} value={occasion}>{occasion}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="condition">Condition</Label>
                <Select value={formData.condition} onValueChange={(value) => handleInputChange('condition', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {conditions.map(condition => (
                      <SelectItem key={condition} value={condition.toLowerCase()}>
                        {condition}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="purchase_price">Purchase Price</Label>
                <Input
                  id="purchase_price"
                  type="number"
                  step="0.01"
                  value={formData.purchase_price}
                  onChange={(e) => handleInputChange('purchase_price', e.target.value)}
                  placeholder="0.00"
                />
              </div>

              <div>
                <Label htmlFor="location">Location in Wardrobe</Label>
                <Input
                  id="location"
                  value={formData.location_in_wardrobe}
                  onChange={(e) => handleInputChange('location_in_wardrobe', e.target.value)}
                  placeholder="e.g., Main closet, top shelf"
                />
              </div>
            </div>

            {/* Photo Upload */}
            <div>
              <Label>Photos</Label>
              <RealImageUpload
                onFilesSelected={setPhotoUrls}
                type="photo"
                maxFiles={5}
                existingFiles={photoUrls}
              />
            </div>

            {/* Tags */}
            <div>
              <Label htmlFor="tags">Tags</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  id="tags"
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  placeholder="Add a tag"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <Button type="button" variant="outline" onClick={addTag}>
                  Add
                </Button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {formData.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                      {tag} ×
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Notes */}
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Any additional notes about this item..."
                rows={3}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting ? 'Adding Item...' : 'Add Item'}
              </Button>
            </div>
          </form>
        </CardContent>
        </Card>
      </div>

      {/* Match Dialog */}
      {showMatchDialog && potentialMatch && (
        <ItemMatchDialog
          isOpen={showMatchDialog}
          onClose={() => setShowMatchDialog(false)}
          wardrobeItem={potentialMatch.wardrobeItem}
          merchantItem={potentialMatch.merchantItem}
          matchScore={potentialMatch.matchScore}
          matchReasons={potentialMatch.matchReasons}
          onAccept={handleMatchAccept}
          onReject={handleMatchReject}
        />
      )}
    </>
  );
};

export default AddItemWithMatching;