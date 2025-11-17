import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, Share2, ShoppingCart, Star, Truck, Shield, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useMerchantItems, MerchantItem } from '@/hooks/useMerchantItems';
import ProductCard from '@/components/ProductCard';
import { ErrorState } from '@/components/ErrorState';
import { Skeleton } from '@/components/ui/skeleton';

const ItemDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getMerchantItem, getSimilarItems, getItemsByBrand, getItemsBySimilarColor, getPhotoUrls } = useMerchantItems();
  
  const [item, setItem] = useState<MerchantItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [similarItems, setSimilarItems] = useState<MerchantItem[]>([]);
  const [brandItems, setBrandItems] = useState<MerchantItem[]>([]);
  const [colorItems, setColorItems] = useState<MerchantItem[]>([]);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    if (id) {
      loadItemDetails(id);
    }
  }, [id]);

  const loadItemDetails = async (itemId: string) => {
    try {
      setLoading(true);
      const itemData = await getMerchantItem(itemId);
      
      if (!itemData) {
        toast({
          title: "Item not found",
          description: "The requested item could not be found.",
          variant: "destructive",
        });
        navigate('/marketplace');
        return;
      }

      setItem(itemData);
      
      // Load related items
      const similar = getSimilarItems(itemData);
      const brand = getItemsByBrand(itemData.brand || '');
      const color = getItemsBySimilarColor(itemData.color || '');
      
      setSimilarItems(similar);
      setBrandItems(brand);
      setColorItems(color);
    } catch (error) {
      console.error('Error loading item details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    toast({
      title: "Added to Cart",
      description: `${item?.name} has been added to your cart.`,
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: item?.name,
        text: item?.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied",
        description: "Item link has been copied to your clipboard.",
      });
    }
  };

  const toggleLike = () => {
    setIsLiked(!isLiked);
    toast({
      title: isLiked ? "Removed from favorites" : "Added to favorites",
      description: isLiked 
        ? `${item?.name} removed from your favorites.`
        : `${item?.name} added to your favorites.`,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="container max-w-6xl mx-auto">
          <Skeleton className="h-8 w-32 mb-6" />
          <div className="grid lg:grid-cols-2 gap-8">
            <Skeleton className="h-[500px] w-full rounded-[var(--radius)]" />
            <div className="space-y-4">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <ErrorState
          title="Item not found"
          message="The requested item could not be found or is no longer available."
          onRetry={() => navigate('/market')}
        />
      </div>
    );
  }

  const photos = getPhotoUrls(item);
  const discountPercentage = item.original_price 
    ? Math.round(((item.original_price - item.price) / item.original_price) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={20} />
            Back
          </Button>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLike}
              className={isLiked ? "text-red-500" : ""}
            >
              <Heart size={20} fill={isLiked ? "currentColor" : "none"} />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleShare}>
              <Share2 size={20} />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Images */}
          <div className="space-y-4">
            <div className="aspect-square rounded-xl overflow-hidden bg-muted">
              <img
                src={photos[selectedImageIndex] || "/placeholder.svg"}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            </div>
            {photos.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {photos.map((photo, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImageIndex === index 
                        ? "border-primary" 
                        : "border-border hover:border-muted-foreground"
                    }`}
                  >
                    <img
                      src={photo}
                      alt={`${item.name} ${index + 1}`}
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
              <div className="flex items-center gap-2 mb-2">
                {item.is_premium && <Badge variant="secondary">Premium</Badge>}
                {item.is_featured && <Badge variant="default">Featured</Badge>}
                {discountPercentage > 0 && (
                  <Badge variant="destructive">{discountPercentage}% OFF</Badge>
                )}
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-2">{item.name}</h1>
              <p className="text-lg text-muted-foreground mb-4">{item.brand}</p>
              
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className="text-yellow-400"
                      fill="currentColor"
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">(4.8)</span>
              </div>

              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl font-bold text-foreground">
                  ${item.price}
                </span>
                {item.original_price && (
                  <span className="text-xl text-muted-foreground line-through">
                    ${item.original_price}
                  </span>
                )}
              </div>
            </div>

            {item.description && (
              <div>
                <h3 className="font-semibold text-foreground mb-2">Description</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 text-sm">
              {item.category && (
                <div>
                  <span className="font-medium text-foreground">Category:</span>
                  <span className="text-muted-foreground ml-2">{item.category}</span>
                </div>
              )}
              {item.color && (
                <div>
                  <span className="font-medium text-foreground">Color:</span>
                  <span className="text-muted-foreground ml-2">{item.color}</span>
                </div>
              )}
              {item.material && (
                <div>
                  <span className="font-medium text-foreground">Material:</span>
                  <span className="text-muted-foreground ml-2">{item.material}</span>
                </div>
              )}
              {item.condition && (
                <div>
                  <span className="font-medium text-foreground">Condition:</span>
                  <span className="text-muted-foreground ml-2">{item.condition}</span>
                </div>
              )}
            </div>

            {item.size && item.size.length > 0 && (
              <div>
                <h3 className="font-semibold text-foreground mb-2">Available Sizes</h3>
                 <div className="flex gap-2 flex-wrap">
                   {Array.isArray(item.size) ? item.size.map((size, index) => (
                     <Badge key={index} variant="outline">{size}</Badge>
                   )) : item.size ? (
                     <Badge variant="outline">{item.size}</Badge>
                   ) : null}
                 </div>
              </div>
            )}

            <Separator />

            <div className="space-y-4">
              <Button 
                size="lg" 
                className="w-full"
                onClick={handleAddToCart}
              >
                <ShoppingCart className="mr-2" size={20} />
                Add to Cart
              </Button>
              
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Truck className="mr-2" size={16} />
                  Free Shipping
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Shield className="mr-2" size={16} />
                  Secure Payment
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <RotateCcw className="mr-2" size={16} />
                  Easy Returns
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Related Items Sections */}
        {similarItems.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">Similar Items</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {similarItems.slice(0, 8).map((relatedItem) => (
                <ProductCard
                  key={relatedItem.id}
                  item={{
                    id: parseInt(relatedItem.id),
                    title: relatedItem.name,
                    price: relatedItem.price,
                    originalPrice: relatedItem.original_price,
                    image: getPhotoUrls(relatedItem)[0] || "/placeholder.svg",
                    brand: relatedItem.brand || "",
                    rating: 4.8,
                    likes: 0,
                    category: relatedItem.category,
                    merchant: relatedItem.brand || "Unknown",
                    condition: relatedItem.condition,
                    isNew: relatedItem.condition === 'new',
                    isPremium: relatedItem.is_premium,
                    isSecondHand: relatedItem.condition !== 'new'
                  }}
                  onAction={(action, id) => {
                    if (action === 'view') {
                      navigate(`/item/${relatedItem.id}`);
                    }
                  }}
                />
              ))}
            </div>
          </section>
        )}

        {brandItems.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">More from {item.brand}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {brandItems.slice(0, 8).map((relatedItem) => (
              <ProductCard
                key={relatedItem.id}
                item={{
                  id: parseInt(relatedItem.id),
                  title: relatedItem.name,
                  price: relatedItem.price,
                  originalPrice: relatedItem.original_price,
                  image: getPhotoUrls(relatedItem)[0] || "/placeholder.svg",
                  brand: relatedItem.brand || "",
                  rating: 4.8,
                  likes: 0,
                  category: relatedItem.category,
                  merchant: relatedItem.brand || "Unknown",
                  condition: relatedItem.condition,
                  isNew: relatedItem.condition === 'new',
                  isPremium: relatedItem.is_premium,
                  isSecondHand: relatedItem.condition !== 'new'
                }}
                onAction={(action, id) => {
                  if (action === 'view') {
                    navigate(`/item/${relatedItem.id}`);
                  }
                }}
              />
            ))}
            </div>
          </section>
        )}

        {colorItems.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-6">Similar Color Items</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {colorItems.slice(0, 8).map((relatedItem) => (
              <ProductCard
                key={relatedItem.id}
                item={{
                  id: parseInt(relatedItem.id),
                  title: relatedItem.name,
                  price: relatedItem.price,
                  originalPrice: relatedItem.original_price,
                  image: getPhotoUrls(relatedItem)[0] || "/placeholder.svg",
                  brand: relatedItem.brand || "",
                  rating: 4.8,
                  likes: 0,
                  category: relatedItem.category,
                  merchant: relatedItem.brand || "Unknown",
                  condition: relatedItem.condition,
                  isNew: relatedItem.condition === 'new',
                  isPremium: relatedItem.is_premium,
                  isSecondHand: relatedItem.condition !== 'new'
                }}
                onAction={(action, id) => {
                  if (action === 'view') {
                    navigate(`/item/${relatedItem.id}`);
                  }
                }}
              />
            ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default ItemDetail;