import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { X, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { MerchantItem } from '@/hooks/useMerchantItems';

interface EditItemDialogProps {
  item: MerchantItem | null;
  open: boolean;
  onClose: () => void;
  onItemUpdated: () => void;
}

export const EditItemDialog = ({ item, open, onClose, onItemUpdated }: EditItemDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [sizes, setSizes] = useState<string[]>([]);
  const [sizeInput, setSizeInput] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    brand: '',
    color: '',
    material: '',
    season: '',
    occasion: '',
    price: '',
    original_price: '',
    condition: 'new',
    stock_quantity: '1',
    is_featured: false,
    is_premium: false,
  });

  const { toast } = useToast();

  const categories = [
    'tops', 'bottoms', 'outerwear', 'dresses', 'shoes', 'accessories', 'bags', 'jewelry'
  ];

  const conditions = [
    { value: 'new', label: 'New' },
    { value: 'like-new', label: 'Like New' },
    { value: 'excellent', label: 'Excellent' },
    { value: 'good', label: 'Good' },
    { value: 'fair', label: 'Fair' }
  ];

  const seasons = ['spring', 'summer', 'fall', 'winter', 'all-season'];
  const occasions = ['casual', 'business', 'formal', 'party', 'sports', 'travel'];

  useEffect(() => {
    if (item && open) {
      setFormData({
        name: item.name || '',
        description: item.description || '',
        category: item.category || '',
        brand: item.brand || '',
        color: item.color || '',
        material: item.material || '',
        season: item.season || '',
        occasion: item.occasion || '',
        price: item.price?.toString() || '',
        original_price: item.original_price?.toString() || '',
        condition: item.condition || 'new',
        stock_quantity: item.stock_quantity?.toString() || '1',
        is_featured: item.is_featured || false,
        is_premium: item.is_premium || false,
      });
      
      setTags(item.tags || []);
      setSizes(Array.isArray(item.size) ? item.size : (item.size ? [item.size] : []));
      
      // Extract photos from the photos object
      if (item.photos) {
        const photoArray = [];
        if (typeof item.photos === 'object') {
          if (item.photos.main) photoArray.push(item.photos.main);
          if (item.photos.additional && Array.isArray(item.photos.additional)) {
            photoArray.push(...item.photos.additional);
          }
        }
        setPhotos(photoArray);
      } else {
        setPhotos([]);
      }
    }
  }, [item, open]);

  const handleInputChange = (field: string, value: string | boolean | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const addSize = () => {
    if (sizeInput.trim() && !sizes.includes(sizeInput.trim())) {
      setSizes([...sizes, sizeInput.trim()]);
      setSizeInput('');
    }
  };

  const removeSize = (size: string) => {
    setSizes(sizes.filter(s => s !== size));
  };

  const addPhotoUrl = () => {
    const url = prompt('Enter photo URL:');
    if (url && !photos.includes(url)) {
      setPhotos([...photos, url]);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item) return;
    
    setLoading(true);

    try {
      const photosObject = photos.length > 0 ? { main: photos[0], additional: photos.slice(1) } : null;

      const { error } = await supabase
        .from('merchant_items')
        .update({
          name: formData.name,
          description: formData.description || null,
          category: formData.category,
          brand: formData.brand || null,
          color: formData.color || null,
          size: sizes.length > 0 ? sizes : null,
          material: formData.material || null,
          season: formData.season || null,
          occasion: formData.occasion || null,
          price: parseFloat(formData.price),
          original_price: formData.original_price ? parseFloat(formData.original_price) : null,
          condition: formData.condition,
          stock_quantity: parseInt(formData.stock_quantity),
          is_featured: formData.is_featured,
          is_premium: formData.is_premium,
          tags: tags.length > 0 ? tags : null,
          photos: photosObject,
        })
        .eq('id', item.id);

      if (error) throw error;

      toast({
        title: 'Item Updated Successfully',
        description: `${formData.name} has been updated.`
      });

      onClose();
      onItemUpdated();
    } catch (error: any) {
      toast({
        title: 'Error Updating Item',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Item</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="brand">Brand</Label>
                  <Input
                    id="brand"
                    value={formData.brand}
                    onChange={(e) => handleInputChange('brand', e.target.value)}
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
                  <Label htmlFor="condition">Condition</Label>
                  <Select value={formData.condition} onValueChange={(value) => handleInputChange('condition', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {conditions.map(condition => (
                        <SelectItem key={condition.value} value={condition.value}>
                          {condition.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="mt-4">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Details */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">Product Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="color">Color</Label>
                  <Input
                    id="color"
                    value={formData.color}
                    onChange={(e) => handleInputChange('color', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="material">Material</Label>
                  <Input
                    id="material"
                    value={formData.material}
                    onChange={(e) => handleInputChange('material', e.target.value)}
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
                        <SelectItem key={season} value={season}>
                          {season.charAt(0).toUpperCase() + season.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Sizes */}
              <div className="mt-4">
                <Label>Available Sizes</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    placeholder="Add size (e.g., S, M, L, 32, 10)"
                    value={sizeInput}
                    onChange={(e) => setSizeInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSize())}
                  />
                  <Button type="button" onClick={addSize} size="sm">
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {sizes.map(size => (
                    <Badge key={size} variant="secondary" className="gap-1">
                      {size}
                      <Button 
                        type="button"
                        variant="ghost" 
                        size="sm" 
                        className="h-auto p-0 text-xs"
                        onClick={() => removeSize(size)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing & Inventory */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">Pricing & Inventory</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="price">Price *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="original_price">Original Price</Label>
                  <Input
                    id="original_price"
                    type="number"
                    step="0.01"
                    value={formData.original_price}
                    onChange={(e) => handleInputChange('original_price', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="stock_quantity">Stock Quantity *</Label>
                  <Input
                    id="stock_quantity"
                    type="number"
                    min="0"
                    value={formData.stock_quantity}
                    onChange={(e) => handleInputChange('stock_quantity', e.target.value)}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Photos */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">Product Photos</h3>
              <Button type="button" onClick={addPhotoUrl} variant="outline" className="gap-2 mb-4">
                <Upload className="w-4 h-4" />
                Add Photo URL
              </Button>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {photos.map((photo, index) => (
                  <div key={index} className="relative group">
                    <img 
                      src={photo} 
                      alt={`Product ${index + 1}`} 
                      className="w-full aspect-square object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removePhoto(index)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tags & Settings */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">Tags & Settings</h3>
              
              {/* Tags */}
              <div className="mb-4">
                <Label>Tags</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    placeholder="Add tag"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <Button type="button" onClick={addTag} size="sm">
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      {tag}
                      <Button 
                        type="button"
                        variant="ghost" 
                        size="sm" 
                        className="h-auto p-0 text-xs"
                        onClick={() => removeTag(tag)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Settings */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="is_featured">Featured Item</Label>
                  <Switch
                    id="is_featured"
                    checked={formData.is_featured}
                    onCheckedChange={(checked) => handleInputChange('is_featured', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="is_premium">Premium Item</Label>
                  <Switch
                    id="is_premium"
                    checked={formData.is_premium}
                    onCheckedChange={(checked) => handleInputChange('is_premium', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Updating Item...' : 'Update Item'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};