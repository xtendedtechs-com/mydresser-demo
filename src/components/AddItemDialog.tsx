import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Plus, X, Camera } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { FileUpload } from './FileUpload';
import { CameraScanner } from './CameraScanner';

interface AddItemDialogProps {
  onItemAdded: () => void;
}

export const AddItemDialog = ({ onItemAdded }: AddItemDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [sizes, setSizes] = useState<string[]>([]);
  const [sizeInput, setSizeInput] = useState('');
  const [uploadedPhotos, setUploadedPhotos] = useState<any[]>([]);
  const [uploadedVideos, setUploadedVideos] = useState<any[]>([]);
  
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

  const handleScanComplete = (scanData: any) => {
    // Pre-fill form with scanned data
    setFormData(prev => ({
      ...prev,
      name: scanData.name || prev.name,
      category: scanData.category || prev.category,
      brand: scanData.brand || prev.brand,
      color: scanData.color || prev.color,
      material: scanData.material || prev.material,
      condition: scanData.condition || prev.condition,
      season: scanData.season || prev.season,
      occasion: scanData.occasion || prev.occasion,
      description: scanData.description || prev.description,
    }));

    // Add style tags
    if (scanData.style_tags && Array.isArray(scanData.style_tags)) {
      setTags(prev => [...new Set([...prev, ...scanData.style_tags])]);
    }

    // Add scanned photo
    if (scanData.photo) {
      setUploadedPhotos(prev => [{
        url: scanData.photo,
        name: 'scanned-photo.jpg',
        type: 'image/jpeg'
      }, ...prev]);
    }

    setShowScanner(false);
    
    toast({
      title: 'Scan Complete!',
      description: `Item detected with ${Math.round((scanData.confidence || 0.8) * 100)}% confidence`,
    });
  };

  const resetForm = () => {
    setFormData({
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
    setTags([]);
    setSizes([]);
    setUploadedPhotos([]);
    setUploadedVideos([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Prepare photos object from uploaded files
      const photosObject = uploadedPhotos.length > 0 ? {
        main: uploadedPhotos[0]?.url,
        additional: uploadedPhotos.slice(1).map(file => file.url),
        files: uploadedPhotos
      } : null;

      // Prepare videos object from uploaded files
      const videosObject = uploadedVideos.length > 0 ? {
        files: uploadedVideos
      } : null;

      const { error } = await supabase
        .from('merchant_items')
        .insert({
          merchant_id: user.id,
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
          videos: videosObject,
        });

      if (error) throw error;

      toast({
        title: 'Item Added Successfully',
        description: `${formData.name} has been added to your inventory.`
      });

      setOpen(false);
      resetForm();
      onItemAdded();
    } catch (error: any) {
      toast({
        title: 'Error Adding Item',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Add Item
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Item to Inventory</DialogTitle>
          </DialogHeader>
          
          {showScanner ? (
            <CameraScanner 
              onScanComplete={handleScanComplete}
              onClose={() => setShowScanner(false)}
            />
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Camera Scanner Button */}
              <Card className="border-dashed border-2 border-primary/20">
                <CardContent className="pt-6 text-center">
                  <Button 
                    type="button"
                    variant="outline" 
                    size="lg"
                    onClick={() => setShowScanner(true)}
                    className="gap-2"
                  >
                    <Camera className="w-5 h-5" />
                    Scan Item with Camera
                  </Button>
                  <p className="text-sm text-muted-foreground mt-2">
                    Use AI to automatically detect and fill item details
                  </p>
                </CardContent>
              </Card>
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

          {/* Media Upload */}
          <Card>
            <CardHeader>
              <CardTitle>Photos & Videos</CardTitle>
              <CardDescription>Add photos and videos to your wardrobe item</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Photo and video upload functionality is available in the merchant terminal.
              </p>
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
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Adding Item...' : 'Add Item'}
            </Button>
          </div>
        </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};