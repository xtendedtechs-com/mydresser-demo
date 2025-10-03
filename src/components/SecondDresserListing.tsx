import { useState } from 'react';
import { Upload, DollarSign, Tag, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useFileUpload } from '@/hooks/useFileUpload';
import { PhotoUploadZone } from '@/components/PhotoUploadZone';
import { supabase } from '@/integrations/supabase/client';

interface SecondDresserListingProps {
  wardrobeItemId?: string;
  onListingCreated?: (listingId: string) => void;
}

export const SecondDresserListing = ({ wardrobeItemId, onListingCreated }: SecondDresserListingProps) => {
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const { toast } = useToast();
  const { uploadMarketPhotos } = useFileUpload();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    originalPrice: '',
    category: '',
    condition: 'good',
    brand: '',
    size: '',
    color: '',
    location: '',
    shippingAvailable: true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Upload photos first
      let photoUrls: string[] = [];
      if (selectedFiles.length > 0) {
        const tempId = Date.now().toString();
        const uploadResults = await uploadMarketPhotos(selectedFiles, user.id, tempId);
        photoUrls = uploadResults
          .filter(r => r.success)
          .map(r => r.url)
          .filter((url): url is string => url !== undefined);
      }

      // Create market listing
      const { data, error } = await supabase
        .from('market_items')
        .insert({
          seller_id: user.id,
          wardrobe_item_id: wardrobeItemId || null,
          title: formData.title,
          description: formData.description,
          price: parseFloat(formData.price),
          original_price: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
          category: formData.category.toLowerCase(),
          condition: formData.condition,
          brand: formData.brand || null,
          size: formData.size || null,
          color: formData.color || null,
          location: formData.location || null,
          photos: { urls: photoUrls },
          shipping_options: {
            shipping_available: formData.shippingAvailable,
            local_pickup: true,
            shipping_cost: formData.shippingAvailable ? 9.99 : 0
          },
          status: 'available'
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Listed Successfully! 🎉',
        description: 'Your item is now live on 2ndDresser marketplace'
      });

      if (onListingCreated) {
        onListingCreated(data.id);
      }

      // Reset form
      setFormData({
        title: '',
        description: '',
        price: '',
        originalPrice: '',
        category: '',
        condition: 'good',
        brand: '',
        size: '',
        color: '',
        location: '',
        shippingAvailable: true
      });
      setSelectedFiles([]);

    } catch (error) {
      console.error('Listing error:', error);
      toast({
        title: 'Listing Failed',
        description: error instanceof Error ? error.message : 'Please try again',
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">List on 2ndDresser</h2>
        <p className="text-muted-foreground text-sm">
          Sell your pre-loved fashion items to the MyDresser community
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Photo Upload */}
        <div>
          <Label className="mb-2 flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Item Photos *
          </Label>
          <PhotoUploadZone
            onFilesSelected={setSelectedFiles}
            maxFiles={5}
            disabled={uploading}
          />
        </div>

        {/* Title */}
        <div>
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g., Vintage Levi's Denim Jacket"
            required
          />
        </div>

        {/* Description */}
        <div>
          <Label htmlFor="description">Description *</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe the item, its condition, and why you're selling it..."
            rows={4}
            required
          />
        </div>

        {/* Category */}
        <div>
          <Label htmlFor="category">Category *</Label>
          <Select
            value={formData.category}
            onValueChange={(value) => setFormData({ ...formData, category: value })}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tops">Tops</SelectItem>
              <SelectItem value="bottoms">Bottoms</SelectItem>
              <SelectItem value="dresses">Dresses</SelectItem>
              <SelectItem value="outerwear">Outerwear</SelectItem>
              <SelectItem value="shoes">Shoes</SelectItem>
              <SelectItem value="accessories">Accessories</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Pricing */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="price" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Selling Price *
            </Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="1"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              placeholder="29.99"
              required
            />
          </div>
          <div>
            <Label htmlFor="originalPrice">Original Price</Label>
            <Input
              id="originalPrice"
              type="number"
              step="0.01"
              value={formData.originalPrice}
              onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
              placeholder="79.99"
            />
          </div>
        </div>

        {/* Condition */}
        <div>
          <Label htmlFor="condition">Condition *</Label>
          <Select
            value={formData.condition}
            onValueChange={(value) => setFormData({ ...formData, condition: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="new">New with Tags</SelectItem>
              <SelectItem value="excellent">Excellent</SelectItem>
              <SelectItem value="good">Good</SelectItem>
              <SelectItem value="fair">Fair</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Details Grid */}
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="brand">Brand</Label>
            <Input
              id="brand"
              value={formData.brand}
              onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              placeholder="Levi's"
            />
          </div>
          <div>
            <Label htmlFor="size">Size</Label>
            <Input
              id="size"
              value={formData.size}
              onChange={(e) => setFormData({ ...formData, size: e.target.value })}
              placeholder="M"
            />
          </div>
          <div>
            <Label htmlFor="color">Color</Label>
            <Input
              id="color"
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              placeholder="Blue"
            />
          </div>
        </div>

        {/* Location */}
        <div>
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="New York, NY"
          />
        </div>

        {/* Commission Info */}
        <Card className="p-4 bg-muted/50">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 mt-0.5 text-primary" />
            <div className="text-sm">
              <p className="font-medium mb-1">2ndDresser Commission: 5%</p>
              <p className="text-muted-foreground">
                You'll receive ${formData.price ? (parseFloat(formData.price) * 0.95).toFixed(2) : '0.00'} after commission
              </p>
            </div>
          </div>
        </Card>

        {/* Submit */}
        <div className="flex gap-2">
          <Button
            type="submit"
            disabled={uploading || !formData.title || !formData.category || !formData.price}
            className="flex-1"
          >
            {uploading ? 'Listing...' : 'List Item'}
          </Button>
        </div>
      </form>
    </Card>
  );
};
