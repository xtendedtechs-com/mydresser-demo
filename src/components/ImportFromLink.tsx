import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useWardrobe } from '@/hooks/useWardrobe';
import { Loader2, Link, Check, X } from 'lucide-react';

interface ImportFromLinkProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ParsedProduct {
  name: string;
  brand?: string;
  price?: number;
  description?: string;
  images?: string[];
  category?: string;
  color?: string;
  material?: string;
  size?: string;
}

const ImportFromLink = ({ open, onOpenChange }: ImportFromLinkProps) => {
  const { toast } = useToast();
  const { addItem } = useWardrobe();
  
  const [productUrl, setProductUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [parsedProduct, setParsedProduct] = useState<ParsedProduct | null>(null);
  const [customCategory, setCustomCategory] = useState('');
  const [customOccasion, setCustomOccasion] = useState('');
  const [customSeason, setCustomSeason] = useState('');
  const [notes, setNotes] = useState('');

  const supportedRetailers = [
    'ASOS', 'Zara', 'H&M', 'Shein', 'Nike', 'Adidas', 'Uniqlo', 
    'Forever 21', 'Urban Outfitters', 'Nordstrom', 'Amazon Fashion'
  ];

  const categories = [
    'Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Shoes', 
    'Accessories', 'Underwear', 'Activewear', 'Formal'
  ];

  const occasions = ['Casual', 'Work', 'Formal', 'Party', 'Sport', 'Travel'];
  const seasons = ['Spring', 'Summer', 'Fall', 'Winter', 'All Seasons'];

  const parseProductFromUrl = async (url: string): Promise<ParsedProduct | null> => {
    try {
      // Simulate parsing - in real implementation, this would use web scraping or APIs
      const domain = new URL(url).hostname.toLowerCase();
      
      // Mock parsing logic based on domain
      if (domain.includes('asos.com')) {
        return {
          name: 'ASOS Design Oversized T-Shirt',
          brand: 'ASOS',
          price: 29.99,
          description: 'Comfortable oversized cotton t-shirt',
          category: 'Tops',
          color: 'Black',
          material: 'Cotton',
          images: ['/placeholder.svg']
        };
      } else if (domain.includes('zara.com')) {
        return {
          name: 'Zara Basic Denim Jeans',
          brand: 'Zara',
          price: 49.95,
          description: 'Classic fit denim jeans',
          category: 'Bottoms',
          color: 'Blue',
          material: 'Denim',
          images: ['/placeholder.svg']
        };
      } else if (domain.includes('hm.com')) {
        return {
          name: 'H&M Cotton Hoodie',
          brand: 'H&M',
          price: 24.99,
          description: 'Cozy cotton blend hoodie',
          category: 'Tops',
          color: 'Gray',
          material: 'Cotton Blend',
          images: ['/placeholder.svg']
        };
      }
      
      // Generic parsing for other URLs
      return {
        name: 'Imported Fashion Item',
        description: 'Product imported from link',
        category: 'Tops',
        images: ['/placeholder.svg']
      };
    } catch (error) {
      console.error('Error parsing URL:', error);
      return null;
    }
  };

  const handleParseUrl = async () => {
    if (!productUrl.trim()) {
      toast({
        title: "URL Required",
        description: "Please enter a product URL to parse.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const parsed = await parseProductFromUrl(productUrl);
      
      if (parsed) {
        setParsedProduct(parsed);
        toast({
          title: "Product Parsed Successfully!",
          description: "Review the details and add to your wardrobe.",
        });
      } else {
        toast({
          title: "Unable to Parse Product",
          description: "Could not extract product information from this URL.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Parsing Error",
        description: "An error occurred while parsing the product URL.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToWardrobe = async () => {
    if (!parsedProduct) return;

    try {
      setIsLoading(true);
      
      const itemData = {
        name: parsedProduct.name,
        category: customCategory || parsedProduct.category || 'Tops',
        brand: parsedProduct.brand,
        color: parsedProduct.color,
        size: parsedProduct.size,
        material: parsedProduct.material,
        season: customSeason || 'All Seasons',
        occasion: customOccasion || 'Casual',
        condition: 'Excellent',
        purchase_price: parsedProduct.price,
        location_in_wardrobe: '',
        notes: notes || parsedProduct.description,
        tags: ['imported'],
        photos: parsedProduct.images,
        user_id: '',
        wear_count: 0,
        is_favorite: false
      };

      await addItem(itemData);
      
      toast({
        title: "Item Added Successfully!",
        description: `${parsedProduct.name} has been added to your wardrobe.`,
      });
      
      // Reset form
      setProductUrl('');
      setParsedProduct(null);
      setCustomCategory('');
      setCustomOccasion('');
      setCustomSeason('');
      setNotes('');
      onOpenChange(false);
      
    } catch (error) {
      console.error('Error adding item:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link className="w-5 h-5" />
            Import from Link
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Paste a product link from supported retailers to automatically import item details.
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Supported Retailers */}
          <div>
            <Label className="text-sm font-medium">Supported Retailers</Label>
            <div className="flex flex-wrap gap-1 mt-2">
              {supportedRetailers.map(retailer => (
                <Badge key={retailer} variant="outline" className="text-xs">
                  {retailer}
                </Badge>
              ))}
            </div>
          </div>

          {/* URL Input */}
          <div>
            <Label htmlFor="productUrl">Product URL *</Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="productUrl"
                value={productUrl}
                onChange={(e) => setProductUrl(e.target.value)}
                placeholder="https://www.asos.com/product/..."
                className="flex-1"
              />
              <Button 
                onClick={handleParseUrl} 
                disabled={isLoading || !productUrl.trim()}
                className="px-6"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Parse'
                )}
              </Button>
            </div>
          </div>

          {/* Parsed Product Preview */}
          {parsedProduct && (
            <Card className="border-green-200 bg-green-50/50">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  <h4 className="font-medium text-green-800">Product Parsed Successfully</h4>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">NAME</Label>
                    <p className="font-medium">{parsedProduct.name}</p>
                  </div>
                  {parsedProduct.brand && (
                    <div>
                      <Label className="text-xs text-muted-foreground">BRAND</Label>
                      <p className="font-medium">{parsedProduct.brand}</p>
                    </div>
                  )}
                  {parsedProduct.price && (
                    <div>
                      <Label className="text-xs text-muted-foreground">PRICE</Label>
                      <p className="font-medium">${parsedProduct.price}</p>
                    </div>
                  )}
                  {parsedProduct.category && (
                    <div>
                      <Label className="text-xs text-muted-foreground">CATEGORY</Label>
                      <p className="font-medium">{parsedProduct.category}</p>
                    </div>
                  )}
                  {parsedProduct.color && (
                    <div>
                      <Label className="text-xs text-muted-foreground">COLOR</Label>
                      <p className="font-medium">{parsedProduct.color}</p>
                    </div>
                  )}
                  {parsedProduct.material && (
                    <div>
                      <Label className="text-xs text-muted-foreground">MATERIAL</Label>
                      <p className="font-medium">{parsedProduct.material}</p>
                    </div>
                  )}
                </div>
                {parsedProduct.description && (
                  <div>
                    <Label className="text-xs text-muted-foreground">DESCRIPTION</Label>
                    <p className="text-sm text-muted-foreground">{parsedProduct.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Customization Options */}
          {parsedProduct && (
            <div className="space-y-4">
              <h4 className="font-medium">Customize Details</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="customCategory">Category</Label>
                  <select
                    id="customCategory"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    className="w-full mt-1 px-3 py-2 border border-input bg-background rounded-md text-sm"
                  >
                    <option value="">Use parsed: {parsedProduct.category || 'None'}</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="customOccasion">Occasion</Label>
                  <select
                    id="customOccasion"
                    value={customOccasion}
                    onChange={(e) => setCustomOccasion(e.target.value)}
                    className="w-full mt-1 px-3 py-2 border border-input bg-background rounded-md text-sm"
                  >
                    <option value="">Auto-detect</option>
                    {occasions.map(occ => (
                      <option key={occ} value={occ}>{occ}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="customSeason">Season</Label>
                  <select
                    id="customSeason"
                    value={customSeason}
                    onChange={(e) => setCustomSeason(e.target.value)}
                    className="w-full mt-1 px-3 py-2 border border-input bg-background rounded-md text-sm"
                  >
                    <option value="">Auto-detect</option>
                    {seasons.map(season => (
                      <option key={season} value={season}>{season}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any personal notes about this item..."
                  rows={3}
                  className="mt-1"
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            {parsedProduct && (
              <Button 
                onClick={handleAddToWardrobe} 
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Check className="w-4 h-4 mr-2" />
                )}
                Add to Wardrobe
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ImportFromLink;