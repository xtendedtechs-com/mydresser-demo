import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from '@/hooks/useProfile';
import { X, Plus, Upload, Tag } from 'lucide-react';
import React from 'react';
import { FileUpload } from '@/components/FileUpload';
import { getAllPhotoUrls } from '@/utils/photoHelpers';

interface AddMerchantProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProductAdded: () => void;
  editProduct?: any;
}

const AddMerchantProductDialog = ({ open, onOpenChange, onProductAdded, editProduct }: AddMerchantProductDialogProps) => {
  const { user } = useProfile();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    brand: '',
    price: '',
    original_price: '',
    condition: 'new',
    color: '',
    material: '',
    occasion: '',
    season: '',
    stock_quantity: '1',
    is_featured: false,
    is_premium: false,
    status: 'draft'
  });
  
  const [sizes, setSizes] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [styleTags, setStyleTags] = useState<string[]>([]);
  const [photos, setPhotos] = useState<string[]>([]);
  const [videos, setVideos] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [newStyleTag, setNewStyleTag] = useState('');
  const [newPhoto, setNewPhoto] = useState('');
  const [newVideo, setNewVideo] = useState('');
  const [loading, setLoading] = useState(false);

  // Reset and populate form when editProduct changes
  React.useEffect(() => {
    if (editProduct) {
      setFormData({
        name: editProduct.name || '',
        description: editProduct.description || '',
        category: editProduct.category || '',
        brand: editProduct.brand || '',
        price: editProduct.price?.toString() || '',
        original_price: editProduct.original_price?.toString() || '',
        condition: editProduct.condition || 'new',
        color: editProduct.color || '',
        material: editProduct.material || '',
        occasion: editProduct.occasion || '',
        season: editProduct.season || '', 
        stock_quantity: editProduct.stock_quantity?.toString() || '1',
        is_featured: editProduct.is_featured || false,
        is_premium: editProduct.is_premium || false,
        status: editProduct.status || 'draft'
      });
      setSizes(editProduct.size || []);
      setTags(editProduct.tags || []);
      setStyleTags(editProduct.style_tags || []);
      setPhotos(getAllPhotoUrls(editProduct.photos));
      setVideos(Array.isArray(editProduct.videos) ? editProduct.videos : []);
    } else {
      // Reset form for new product
      setFormData({
        name: '', description: '', category: '', brand: '', price: '',
        original_price: '', condition: 'new', color: '', material: '',
        occasion: '', season: '', stock_quantity: '1', is_featured: false,
        is_premium: false, status: 'active'
      });
      setSizes([]);
      setTags([]);
      setStyleTags([]);
      setPhotos([]);
      setVideos([]);
    }
  }, [editProduct]);

  const categories = [
    'Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Shoes', 'Accessories', 
    'Activewear', 'Swimwear', 'Lingerie', 'Formal', 'Casual'
  ];

  const conditions = [
    { value: 'new', label: 'New with tags' },
    { value: 'excellent', label: 'Excellent condition' },
    { value: 'good', label: 'Good condition' },
    { value: 'fair', label: 'Fair condition' }
  ];

  const seasons = ['Spring', 'Summer', 'Fall', 'Winter', 'All Season'];
  const occasions = ['Casual', 'Business', 'Formal', 'Party', 'Sports', 'Beach', 'Travel'];

  const addSize = (size: string) => {
    if (size && !sizes.includes(size)) {
      setSizes([...sizes, size]);
    }
  };

  const removeSize = (size: string) => {
    setSizes(sizes.filter(s => s !== size));
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const addStyleTag = () => {
    if (newStyleTag.trim() && !styleTags.includes(newStyleTag.trim())) {
      setStyleTags([...styleTags, newStyleTag.trim()]);
      setNewStyleTag('');
    }
  };

  const addPhoto = () => {
    if (newPhoto.trim() && !photos.includes(newPhoto.trim()) && photos.length < 20) {
      setPhotos([...photos, newPhoto.trim()]);
      setNewPhoto('');
    }
  };

  const addVideo = () => {
    if (newVideo.trim() && !videos.includes(newVideo.trim()) && videos.length < 2) {
      setVideos([...videos, newVideo.trim()]);
      setNewVideo('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const productData = {
        ...formData,
        merchant_id: user.id,
        price: parseFloat(formData.price),
        original_price: formData.original_price ? parseFloat(formData.original_price) : null,
        stock_quantity: parseInt(formData.stock_quantity.toString()),
        size: sizes,
        tags,
        style_tags: styleTags,
        photos: photos.length > 0 ? (photos.length === 1 ? { main: photos[0] } : { main: photos[0], urls: photos }) : null,
        videos: videos.length > 0 ? (videos.length === 1 ? { main: videos[0] } : { main: videos[0], urls: videos }) : null,
      };

      let result;
      if (editProduct) {
        result = await supabase
          .from('merchant_items')
          .update(productData)
          .eq('id', editProduct.id)
          .eq('merchant_id', user.id)
          .select()
          .single();
      } else {
        result = await supabase
          .from('merchant_items')
          .insert([productData])
          .select()
          .single();
      }

      if (result.error) throw result.error;

      toast({
        title: editProduct ? "Product Updated" : "Product Added",
        description: `${formData.name} has been ${editProduct ? 'updated' : 'added to your inventory'} successfully.`,
      });

      onProductAdded();
      onOpenChange(false);
      
      // Reset form
      setFormData({
        name: '', description: '', category: '', brand: '', price: '',
        original_price: '', condition: 'new', color: '', material: '',
        occasion: '', season: '', stock_quantity: '1', is_featured: false,
        is_premium: false, status: 'draft'
      });
      setSizes([]);
      setTags([]);
      setStyleTags([]);
      setPhotos([]);
      setVideos([]);
    } catch (error) {
      console.error('Error saving product:', error);
      toast({
        title: "Error",
        description: "Failed to save product. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
          <DialogDescription>
            {editProduct ? 'Update product details' : 'Add a new product to your inventory'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <Card>
              <CardContent className="space-y-4 pt-4">
                <h3 className="font-semibold">Basic Information</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(cat => (
                          <SelectItem key={cat} value={cat.toLowerCase()}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="brand">Brand</Label>
                    <Input
                      id="brand"
                      value={formData.brand}
                      onChange={(e) => setFormData({...formData, brand: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="color">Color</Label>
                    <Input
                      id="color"
                      value={formData.color}
                      onChange={(e) => setFormData({...formData, color: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="material">Material</Label>
                    <Input
                      id="material"
                      value={formData.material}
                      onChange={(e) => setFormData({...formData, material: e.target.value})}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pricing & Inventory */}
            <Card>
              <CardContent className="space-y-4 pt-4">
                <h3 className="font-semibold">Pricing & Inventory</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="original_price">Original Price</Label>
                    <Input
                      id="original_price"
                      type="number"
                      step="0.01"
                      value={formData.original_price}
                      onChange={(e) => setFormData({...formData, original_price: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="stock_quantity">Stock Quantity</Label>
                    <Input
                      id="stock_quantity"
                      type="number"
                      value={formData.stock_quantity.toString()}
                      onChange={(e) => setFormData({...formData, stock_quantity: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="condition">Condition</Label>
                    <Select value={formData.condition} onValueChange={(value) => setFormData({...formData, condition: value})}>
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

                {/* Sizes */}
                <div className="space-y-2">
                  <Label>Available Sizes</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {sizes.map(size => (
                      <Badge key={size} variant="secondary" className="cursor-pointer">
                        {size}
                        <X className="w-3 h-3 ml-1" onClick={() => removeSize(size)} />
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map(size => (
                      <Button
                        key={size}
                        type="button"
                        variant={sizes.includes(size) ? "default" : "outline"}
                        size="sm"
                        onClick={() => sizes.includes(size) ? removeSize(size) : addSize(size)}
                      >
                        {size}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Status and Options */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="is_featured">Featured Product</Label>
                    <Switch
                      id="is_featured"
                      checked={formData.is_featured}
                      onCheckedChange={(checked) => setFormData({...formData, is_featured: checked})}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="is_premium">Premium Product</Label>
                    <Switch
                      id="is_premium"
                      checked={formData.is_premium}
                      onCheckedChange={(checked) => setFormData({...formData, is_premium: checked})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Publication Status</Label>
                    <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="available">Available (Visible to customers)</SelectItem>
                        <SelectItem value="draft">Draft (Not visible)</SelectItem>
                        <SelectItem value="reserved">Reserved</SelectItem>
                        <SelectItem value="sold">Sold</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Details */}
          <Card>
            <CardContent className="space-y-4 pt-4">
              <h3 className="font-semibold">Additional Details</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="occasion">Occasion</Label>
                  <Select value={formData.occasion} onValueChange={(value) => setFormData({...formData, occasion: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select occasion" />
                    </SelectTrigger>
                    <SelectContent>
                      {occasions.map(occasion => (
                        <SelectItem key={occasion} value={occasion.toLowerCase()}>{occasion}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="season">Season</Label>
                  <Select value={formData.season} onValueChange={(value) => setFormData({...formData, season: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select season" />
                    </SelectTrigger>
                    <SelectContent>
                      {seasons.map(season => (
                        <SelectItem key={season} value={season.toLowerCase()}>{season}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {tags.map(tag => (
                    <Badge key={tag} variant="outline">
                      {tag}
                      <X className="w-3 h-3 ml-1 cursor-pointer" onClick={() => setTags(tags.filter(t => t !== tag))} />
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add tag"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <Button type="button" onClick={addTag}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Style Tags */}
              <div className="space-y-2">
                <Label>Style Tags</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {styleTags.map(tag => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                      <X className="w-3 h-3 ml-1 cursor-pointer" onClick={() => setStyleTags(styleTags.filter(t => t !== tag))} />
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add style tag (e.g., minimalist, vintage)"
                    value={newStyleTag}
                    onChange={(e) => setNewStyleTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addStyleTag())}
                  />
                  <Button type="button" onClick={addStyleTag}>
                    <Tag className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Photos */}
              <div className="space-y-4">
                <div>
                  <Label>Product Photos (Max 20)</Label>
                  <p className="text-sm text-muted-foreground">Upload up to 20 high-quality photos of your product</p>
                </div>
                
                {/* Photo Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                  {photos.map((photo, index) => (
                    <div key={index} className="relative group">
                      <img src={photo} alt={`Product ${index + 1}`} className="w-full h-24 object-cover rounded border" />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => setPhotos(photos.filter((_, i) => i !== index))}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>

                {/* File Upload */}
                {photos.length < 20 && (
                  <div className="space-y-3">
                    <FileUpload
                      type="image"
                      onUpload={(url) => setPhotos(prev => [...prev, url])}
                      maxSize={5}
                      accept="image/*"
                    />
                    
                    {/* URL Input Alternative */}
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">Or add URL</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add photo URL"
                        value={newPhoto}
                        onChange={(e) => setNewPhoto(e.target.value)}
                      />
                      <Button 
                        type="button" 
                        onClick={addPhoto}
                        disabled={!newPhoto.trim()}
                        variant="outline"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {photos.length >= 20 && (
                  <p className="text-sm text-orange-500">Maximum of 20 photos reached</p>
                )}
              </div>

              {/* Videos */}
              <div className="space-y-4">
                <div>
                  <Label>Product Videos (Max 2)</Label>
                  <p className="text-sm text-muted-foreground">Add up to 2 videos to showcase your product</p>
                </div>
                
                {/* Video Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                  {videos.map((video, index) => (
                    <div key={index} className="relative group">
                      <video src={video} className="w-full h-24 object-cover rounded border" controls />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => setVideos(videos.filter((_, i) => i !== index))}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>

                {/* File Upload */}
                {videos.length < 2 && (
                  <div className="space-y-3">
                    <FileUpload
                      type="video"
                      onUpload={(url) => setVideos(prev => [...prev, url])}
                      maxSize={50}
                      accept="video/*"
                    />
                    
                    {/* URL Input Alternative */}
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">Or add URL</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add video URL"
                        value={newVideo}
                        onChange={(e) => setNewVideo(e.target.value)}
                      />
                      <Button 
                        type="button" 
                        onClick={addVideo}
                        disabled={!newVideo.trim()}
                        variant="outline"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {videos.length >= 2 && (
                  <p className="text-sm text-orange-500">Maximum of 2 videos reached</p>
                )}
              </div>
            </CardContent>
          </Card>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : editProduct ? 'Update Product' : 'Add Product'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddMerchantProductDialog;