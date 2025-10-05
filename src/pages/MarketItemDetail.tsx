import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, Share2, ShoppingCart, Star, Crown, Shield, Truck, RefreshCw, MessageCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useMarketItems, MarketItem } from '@/hooks/useMarketItems';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { getAllPhotoUrls, getPrimaryPhotoUrl } from '@/utils/photoHelpers';
import { PurchaseDialog } from '@/components/PurchaseDialog';
import { MessagingDialog } from '@/components/MessagingDialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { VTOStudio } from '@/components/VTOStudio';

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
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false);
  const [showMessaging, setShowMessaging] = useState(false);
  const [showVTO, setShowVTO] = useState(false);
  const [sellerName, setSellerName] = useState<string>('Seller');
  const [merchantInfo, setMerchantInfo] = useState<any>(null);

  useEffect(() => {
    if (id) {
      loadItem(id);
    }
  }, [id]);

  const loadItem = async (itemId: string) => {
    setLoading(true);
    try {
      // Try to load from market_items first
      let { data: fetchedItem, error } = await supabase
        .from('market_items')
        .select('*')
        .eq('id', itemId)
        .maybeSingle();

      // If not found, try merchant_items
      if (!fetchedItem) {
        const { data: merchantItem, error: merchantError } = await supabase
          .from('merchant_items')
          .select('*')
          .eq('id', itemId)
          .eq('status', 'available')
          .maybeSingle();
        
        if (merchantError) throw merchantError;
        if (merchantItem) {
          // Transform merchant item to market item format with all required fields
          fetchedItem = {
            ...merchantItem,
            title: merchantItem.name,
            seller_id: merchantItem.merchant_id,
            likes_count: 0,
            views_count: 0,
            location: 'Merchant Store',
            size: Array.isArray(merchantItem.size) ? merchantItem.size : (merchantItem.size ? [merchantItem.size] : []),
            shipping_options: { shipping_available: true, shipping_cost: 0, local_pickup: false },
            sustainability_score: 75,
            status: 'available',
            wardrobe_item_id: null
          } as any;
        }
      }

      if (!fetchedItem) {
        throw new Error('Item not found');
      }

      if (!fetchedItem) {
        throw new Error('Item not found');
      }
      
      setItem(fetchedItem);
      
      // Fetch seller profile and merchant info
      const [profileResult, merchantResult, pageResult] = await Promise.all([
        supabase
          .from('profiles')
          .select('full_name, role')
          .eq('user_id', fetchedItem.seller_id)
          .single(),
        supabase
          .from('merchant_profiles')
          .select('business_name, business_type')
          .eq('user_id', fetchedItem.seller_id)
          .maybeSingle(),
        supabase
          .from('merchant_pages')
          .select('business_name, brand_story')
          .eq('merchant_id', fetchedItem.seller_id)
          .maybeSingle()
      ]);
      
      if (profileResult.data?.full_name) {
        setSellerName(profileResult.data.full_name);
      }
      
      if (merchantResult.data || pageResult.data) {
        setMerchantInfo({
          businessName: pageResult.data?.business_name || merchantResult.data?.business_name || 'Merchant Store',
          brandStory: pageResult.data?.brand_story || 'Premium fashion retailer specializing in high-quality clothing and accessories.',
          businessType: merchantResult.data?.business_type || 'Fashion Retailer'
        });
      }
      
      if (fetchedItem?.size) {
        const sizes = Array.isArray(fetchedItem.size) 
          ? fetchedItem.size 
          : fetchedItem.size.split(',');
        if (sizes.length > 0) {
          setSelectedSize(sizes[0]);
        }
      }
      
      // Load similar items from both tables
      const [marketSimilar, merchantSimilar] = await Promise.all([
        supabase
          .from('market_items')
          .select('*')
          .eq('category', fetchedItem.category)
          .neq('id', itemId)
          .limit(2),
        supabase
          .from('merchant_items')
          .select('*')
          .eq('category', fetchedItem.category)
          .neq('id', itemId)
          .limit(2)
      ]);
      
      const allSimilar = [
        ...(marketSimilar.data || []),
        ...(merchantSimilar.data?.map(item => ({
          ...item,
          title: item.name,
          seller_id: item.merchant_id
        })) || [])
      ];
      
      setMarketItems(allSimilar);
    } catch (error) {
      console.error('Error loading item:', error);
      toast({
        title: "Item not found",
        description: "This item may have been removed or doesn't exist.",
        variant: "destructive"
      });
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
    
    setShowPurchaseDialog(true);
  };

  const handlePurchaseSuccess = () => {
    toast({
      title: "Purchase Complete!",
      description: "Your order has been placed successfully.",
    });
    navigate('/transactions');
  };

  // Use photoHelpers for consistent photo handling with proper casting
  const getPhotoUrls = (photos: any): string[] => {
    return getAllPhotoUrls(photos as any);
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
              <Button 
                size="lg" 
                variant="secondary" 
                className="w-full"
                onClick={() => setShowMessaging(true)}
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Message Seller
              </Button>
              <Button 
                size="lg" 
                variant="secondary" 
                className="w-full"
                onClick={() => setShowVTO(true)}
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Try On Virtually
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
            <h2 className="text-xl font-bold mb-4">About this seller</h2>
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">
                  {merchantInfo?.businessName?.[0] || sellerName[0] || 'S'}
                </span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">
                  {merchantInfo?.businessName || sellerName}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary">{merchantInfo?.businessType || 'Seller'}</Badge>
                </div>
                {merchantInfo?.brandStory && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {merchantInfo.brandStory}
                  </p>
                )}
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

      {/* Purchase Dialog */}
      {item && (
        <>
          <PurchaseDialog
            open={showPurchaseDialog}
            onOpenChange={setShowPurchaseDialog}
            item={item}
            onSuccess={handlePurchaseSuccess}
          />
          <MessagingDialog
            open={showMessaging}
            onOpenChange={setShowMessaging}
            receiverId={item.seller_id}
            receiverName={sellerName}
            itemId={item.id}
          />
          <Dialog open={showVTO} onOpenChange={setShowVTO}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Virtual Try-On: {item.title}</DialogTitle>
              </DialogHeader>
              <VTOStudio
                itemId={item.id}
                itemType="market"
                itemName={item.title}
                itemImage={photos[0] || '/placeholder.svg'}
              />
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
};

export default MarketItemDetail;