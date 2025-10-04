import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, Share2, ShoppingCart, Star, Crown, Shield, Truck, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useMarketItems, MarketItem } from '@/hooks/useMarketItems';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const MarketItemDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [marketItems, setMarketItems] = useState<any[]>([]);
  
  const [item, setItem] = useState<MarketItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    if (id) {
      loadItem(id);
    }
  }, [id]);

  const loadItem = async (itemId: string) => {
    setLoading(true);
    try {
      const { data: fetchedItem, error } = await supabase
        .from('market_items')
        .select('*')
        .eq('id', itemId)
        .single();

      if (error) throw error;
      
      setItem(fetchedItem);
      if (fetchedItem?.size && fetchedItem.size.length > 0) {
        setSelectedSize(fetchedItem.size.split(',')[0]);
      }
      
      // Load similar items
      const { data: similar } = await supabase
        .from('market_items')
        .select('*')
        .eq('category', fetchedItem.category)
        .neq('id', itemId)
        .limit(4);
      
      setMarketItems(similar || []);
    } catch (error) {
      console.error('Error loading item:', error);
      setItem(null);
    }
    setLoading(false);
  };

  const handleAddToCart = () => {
    if (!selectedSize && item?.size && item.size.length > 0) {
      toast({
        title: "Please select a size",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Added to cart!",
      description: `${item?.title} has been added to your cart.`,
    });
  };

  const handleBuyNow = () => {
    if (!selectedSize && item?.size && item.size.length > 0) {
      toast({
        title: "Please select a size",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Redirecting to checkout...",
      description: "Taking you to secure payment.",
    });
  };

  // Helper function to extract photo URLs from various formats
  const getPhotoUrls = (photos: any): string[] => {
    if (!photos) return [];
    
    // Handle string URL
    if (typeof photos === 'string') {
      return [photos];
    }
    
    // Handle array of URLs
    if (Array.isArray(photos)) {
      return photos.filter(Boolean);
    }
    
    // Handle object with urls or main property
    if (typeof photos === 'object') {
      if (photos.urls && Array.isArray(photos.urls)) {
        return photos.urls.filter(Boolean);
      }
      if (photos.main) {
        return [photos.main];
      }
    }
    
    return [];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Loading item...</p>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Item not found</h1>
          <Button onClick={() => navigate('/market')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Market
          </Button>
        </div>
      </div>
    );
  }

  const photos = getPhotoUrls(item.photos);
  const similarItems = marketItems.slice(0, 4);
  const featuredItems = marketItems.filter(i => i.is_featured && i.id !== item.id).slice(0, 8);
  const discountPercentage = item.original_price && item.original_price > item.price 
    ? Math.round(((item.original_price - item.price) / item.original_price) * 100) 
    : 0;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container flex h-16 items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => navigate('/market')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold truncate mx-4">{item.title}</h1>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsLiked(!isLiked)}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-current text-red-500' : ''}`} />
            </Button>
            <Button variant="ghost" size="icon">
              <Share2 className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container py-6">
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-muted rounded-lg overflow-hidden relative">
              {photos.length > 0 ? (
                <img
                  src={photos[selectedImage] || photos[0]}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-muted-foreground/20 flex items-center justify-center mx-auto mb-2">
                      <ShoppingCart className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">No image available</p>
                  </div>
                </div>
              )}
              
              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {discountPercentage > 0 && (
                  <Badge variant="destructive">
                    -{discountPercentage}%
                  </Badge>
                )}
              </div>
            </div>
            
            {photos.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {photos.map((photo, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square w-20 bg-muted rounded-lg overflow-hidden flex-shrink-0 border-2 transition-colors ${
                      selectedImage === index ? 'border-primary' : 'border-transparent'
                    }`}
                  >
                    <img
                      src={photo}
                      alt={`${item.title} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <Badge variant="outline">{item.category}</Badge>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-current text-yellow-400" />
                  <span className="text-sm font-medium">4.8</span>
                  <span className="text-sm text-muted-foreground">(127)</span>
                </div>
              </div>
              
              <h1 className="text-3xl font-bold mb-2">{item.title}</h1>
              {item.brand && (
                <p className="text-lg text-muted-foreground">{item.brand}</p>
              )}
              
              <div className="flex items-center gap-3 mt-4">
                <span className="text-3xl font-bold text-primary">${item.price}</span>
                {item.original_price && item.original_price > item.price && (
                  <span className="text-lg text-muted-foreground line-through">
                    ${item.original_price}
                  </span>
                )}
              </div>
            </div>

            {/* Size Selection */}
            {item.size && item.size.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">Size</h3>
                 <div className="flex flex-wrap gap-2">
                   {Array.isArray(item.size) ? item.size.map((size) => (
                     <Button
                       key={size}
                       variant={selectedSize === size ? "default" : "outline"}
                       size="sm"
                       onClick={() => setSelectedSize(size)}
                     >
                       {size}
                     </Button>
                   )) : item.size ? (
                     <Button
                       variant={selectedSize === item.size ? "default" : "outline"}
                       size="sm"
                       onClick={() => setSelectedSize(item.size as string)}
                     >
                       {item.size}
                     </Button>
                   ) : null}
                 </div>
              </div>
            )}

            {/* Color */}
            {item.color && (
              <div>
                <h3 className="font-semibold mb-2">Color</h3>
                <Badge variant="outline">{item.color}</Badge>
              </div>
            )}

            {/* Condition & Material */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-2">Condition</h3>
                <Badge variant="outline">{item.condition}</Badge>
              </div>
              {item.material && (
                <div>
                  <h3 className="font-semibold mb-2">Material</h3>
                  <Badge variant="outline">{item.material}</Badge>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button size="lg" className="w-full" onClick={handleBuyNow}>
                <ShoppingCart className="w-5 h-5 mr-2" />
                Buy Now - ${item.price}
              </Button>
              <Button size="lg" variant="outline" className="w-full" onClick={handleAddToCart}>
                Add to Cart
              </Button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 pt-4">
              <div className="text-center">
                <Shield className="w-6 h-6 mx-auto mb-2 text-green-500" />
                <p className="text-xs text-muted-foreground">Secure Payment</p>
              </div>
              <div className="text-center">
                <Truck className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                <p className="text-xs text-muted-foreground">Fast Shipping</p>
              </div>
              <div className="text-center">
                <RefreshCw className="w-6 h-6 mx-auto mb-2 text-orange-500" />
                <p className="text-xs text-muted-foreground">Easy Returns</p>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        {item.description && (
          <Card className="mb-8">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-4">About this item</h2>
              <p className="text-muted-foreground leading-relaxed">{item.description}</p>
              
              {item.tags && item.tags.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-semibold mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {item.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* About this merchant */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-4">About this merchant</h2>
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">M</span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">Merchant Store</h3>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-current text-yellow-400" />
                    <span className="text-sm font-medium">4.9</span>
                  </div>
                  <span className="text-sm text-muted-foreground">•</span>
                  <span className="text-sm text-muted-foreground">500+ items sold</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Premium fashion retailer specializing in high-quality clothing and accessories.
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-3"
                  onClick={() => navigate(`/merchant/${item.seller_id}`)}
                >
                  View Store
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Similar Items */}
        {similarItems.length > 0 && (
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-6">Best with this item</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {similarItems.map((similar) => (
                <Card 
                  key={similar.id} 
                  className="group cursor-pointer hover:shadow-lg transition-all duration-300"
                  onClick={() => navigate(`/market/item/${similar.id}`)}
                >
                  <CardContent className="p-0">
                    <div className="aspect-square bg-muted relative overflow-hidden rounded-t-lg">
                      {getPhotoUrls(similar.photos)[0] ? (
                        <img
                          src={getPhotoUrls(similar.photos)[0]}
                          alt={similar.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingCart className="w-8 h-8 text-muted-foreground" />
                        </div>
                      )}
                      <Button
                        size="icon"
                        variant="secondary"
                        className="absolute top-2 right-2 w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Handle like
                        }}
                      >
                        <Heart className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="p-3">
                      <h3 className="font-medium text-sm truncate">{similar.title}</h3>
                      <p className="text-xs text-muted-foreground truncate">{similar.brand}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="font-bold text-primary">${similar.price}</span>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-current text-yellow-400" />
                          <span className="text-xs">4.8</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Featured Items */}
        {featuredItems.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-6">Featured items</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {featuredItems.map((featured) => (
                <Card 
                  key={featured.id} 
                  className="group cursor-pointer hover:shadow-lg transition-all duration-300"
                  onClick={() => navigate(`/market/item/${featured.id}`)}
                >
                  <CardContent className="p-0">
                    <div className="aspect-square bg-muted relative overflow-hidden rounded-t-lg">
                      {getPhotoUrls(featured.photos)[0] ? (
                        <img
                          src={getPhotoUrls(featured.photos)[0]}
                          alt={featured.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingCart className="w-8 h-8 text-muted-foreground" />
                        </div>
                      )}
                      <Button
                        size="icon"
                        variant="secondary"
                        className="absolute top-2 right-2 w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Handle like
                        }}
                      >
                        <Heart className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="p-3">
                      <h3 className="font-medium text-sm truncate">{featured.title}</h3>
                      <p className="text-xs text-muted-foreground truncate">{featured.brand}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="font-bold text-primary">${featured.price}</span>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-current text-yellow-400" />
                          <span className="text-xs">4.8</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default MarketItemDetail;