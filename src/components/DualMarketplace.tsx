import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { 
  Search, 
  Filter, 
  Heart, 
  ShoppingCart,
  Star,
  Crown,
  Sparkles,
  Store,
  Users,
  Package,
  DollarSign,
  Eye,
  MessageCircle,
  MapPin,
  Recycle,
  TrendingUp
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMerchantItems } from "@/hooks/useMerchantItems";
import { useWardrobe } from "@/hooks/useWardrobe";
import { useUserPreferences } from "@/hooks/useUserPreferences";

interface MarketItem {
  id: string;
  seller_id: string;
  item_id: string;
  title: string;
  description?: string;
  price: number;
  original_price?: number;
  condition: string;
  size: string;
  brand?: string;
  category: string;
  photos: string[];
  seller_name: string;
  seller_rating: number;
  location?: string;
  status: 'available' | 'sold' | 'reserved';
  listed_at: string;
  views: number;
  likes: number;
  shipping_options: string[];
}

const DualMarketplace = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [likedItems, setLikedItems] = useState<Set<string>>(new Set());
  
  const { toast } = useToast();
  const { items: merchantItems, getFeaturedItems, getPremiumItems, loading: merchantLoading } = useMerchantItems();
  const { preferences, updatePreferences } = useUserPreferences();
  
  // Mock 2ndDresser market items
  const [marketItems, setMarketItems] = useState<MarketItem[]>([]);

  const mockMarketItems: MarketItem[] = [
    {
      id: '1',
      seller_id: 'user1',
      item_id: 'item1',
      title: 'Designer Black Leather Jacket',
      description: 'Barely worn, excellent condition. Perfect for fall weather.',
      price: 150,
      original_price: 300,
      condition: 'excellent',
      size: 'M',
      brand: 'Zara',
      category: 'outerwear',
      photos: ['/placeholder.svg'],
      seller_name: 'StyleGuru',
      seller_rating: 4.8,
      location: 'New York, NY',
      status: 'available',
      listed_at: '2024-01-10',
      views: 24,
      likes: 8,
      shipping_options: ['standard', 'express']
    },
    {
      id: '2',
      seller_id: 'user2',
      item_id: 'item2',
      title: 'Vintage Blue Denim Jeans',
      description: 'Classic fit, great for casual wear.',
      price: 45,
      original_price: 89,
      condition: 'good',
      size: '32',
      brand: 'Levi\'s',
      category: 'bottoms',
      photos: ['/placeholder.svg'],
      seller_name: 'DenimLover',
      seller_rating: 4.5,
      location: 'Los Angeles, CA',
      status: 'available',
      listed_at: '2024-01-08',
      views: 15,
      likes: 3,
      shipping_options: ['standard']
    },
    {
      id: '3',
      seller_id: 'user3',
      item_id: 'item3',
      title: 'Elegant Evening Dress',
      description: 'Perfect for special occasions, worn only once.',
      price: 85,
      original_price: 150,
      condition: 'like-new',
      size: 'S',
      brand: 'H&M',
      category: 'dresses',
      photos: ['/placeholder.svg'],
      seller_name: 'ElegantStyle',
      seller_rating: 4.9,
      location: 'Chicago, IL',
      status: 'available',
      listed_at: '2024-01-12',
      views: 32,
      likes: 12,
      shipping_options: ['standard']
    },
    {
      id: '4',
      seller_id: 'user4',
      item_id: 'item4',
      title: 'Comfortable Running Shoes',
      description: 'Great for daily runs, still in good shape.',
      price: 65,
      original_price: 120,
      condition: 'good',
      size: '9',
      brand: 'Nike',
      category: 'shoes',
      photos: ['/placeholder.svg'],
      seller_name: 'RunnerLife',
      seller_rating: 4.6,
      location: 'Austin, TX',
      status: 'available',
      listed_at: '2024-01-09',
      views: 18,
      likes: 6,
      shipping_options: ['standard', 'express']
    }
  ];

  useEffect(() => {
    setMarketItems(mockMarketItems);
  }, []);

  const categories = [
    "all", "tops", "bottoms", "outerwear", "dresses", "shoes", 
    "accessories", "underwear", "activewear", "swimwear", "sleepwear"
  ];

  const handleLike = (itemId: string) => {
    setLikedItems(prev => {
      const newLiked = new Set(prev);
      if (newLiked.has(itemId)) {
        newLiked.delete(itemId);
        toast({ title: "Removed from favorites" });
      } else {
        newLiked.add(itemId);
        toast({ title: "Added to favorites" });
      }
      return newLiked;
    });
  };

  const handlePurchase = (item: any) => {
    toast({
      title: "Purchase initiated",
      description: `Redirecting to checkout for ${item.name || item.title}...`,
    });
  };

  const handleChat = (item: MarketItem) => {
    toast({
      title: "Opening chat",
      description: `Starting conversation with ${item.seller_name}...`,
    });
  };

  const getFilteredMerchantItems = () => {
    let filtered = merchantItems;

    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter(item => 
        item.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    return filtered;
  };

  const getFiltered2ndDresserItems = () => {
    let filtered = marketItems;

    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter(item => 
        item.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    return filtered;
  };

  const featuredItems = getFeaturedItems().slice(0, 6);
  const premiumItems = getPremiumItems().slice(0, 4);

  const enableMarketplace = async () => {
    try {
      await updatePreferences({
        marketplace_settings: {
          ...preferences.marketplace_settings,
          allow_selling: true
        }
      });
      
      toast({
        title: "Marketplace enabled",
        description: "You can now buy and sell items on 2ndDresser!",
      });
    } catch (error) {
      toast({
        title: "Error enabling marketplace",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  if (merchantLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Loading marketplace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 border-b">
        <div className="container py-12">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold tracking-tight">Fashion Marketplace</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Shop from premium merchants and discover unique pieces from the community
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mt-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search for clothing, brands, or styles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-4 py-3 text-lg"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex justify-center">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-64">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category === "all" ? "All Categories" : category.charAt(0).toUpperCase() + category.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8 space-y-12">
        {/* Merchant Marketplace Section */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Store className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Premium Merchants</h2>
              <p className="text-muted-foreground">Curated collections from verified retailers</p>
            </div>
          </div>

          {/* Featured Items */}
          {featuredItems.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-6">
                <Star className="w-5 h-5 text-yellow-500" />
                <h3 className="text-xl font-semibold">Featured Items</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {featuredItems.map((item) => (
                  <Card 
                    key={item.id} 
                    className="group cursor-pointer hover:shadow-lg transition-all duration-300"
                    onClick={() => navigate(`/market/item/${item.id}`)}
                  >
                    <CardContent className="p-0">
                      <div className="aspect-square bg-muted relative overflow-hidden rounded-t-lg">
                        {item.photos && item.photos.length > 0 ? (
                          <img
                            src={item.photos[0]}
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Sparkles className="w-8 h-8 text-muted-foreground" />
                          </div>
                        )}
                        
                        <div className="absolute top-2 left-2">
                          <Badge className="bg-yellow-500 text-yellow-900">
                            <Star className="w-3 h-3 mr-1" />
                            Featured
                          </Badge>
                        </div>

                        <Button
                          size="icon"
                          variant="secondary"
                          className="absolute top-2 right-2 w-7 h-7 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLike(item.id);
                          }}
                        >
                          <Heart className={`w-3 h-3 ${likedItems.has(item.id) ? 'fill-current' : ''}`} />
                        </Button>
                      </div>
                      
                      <div className="p-3">
                        <h4 className="font-medium text-sm truncate">{item.name}</h4>
                        <p className="text-xs text-muted-foreground truncate">{item.brand}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-sm font-bold text-primary">${item.price}</span>
                          <Badge variant="outline" className="text-xs">
                            {item.category}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Premium Collection */}
          {premiumItems.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-6">
                <Crown className="w-5 h-5 text-purple-500" />
                <h3 className="text-xl font-semibold">Premium Collection</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {premiumItems.map((item) => (
                  <Card 
                    key={item.id} 
                    className="group cursor-pointer hover:shadow-lg transition-all duration-300"
                    onClick={() => navigate(`/market/item/${item.id}`)}
                  >
                    <CardContent className="p-0">
                      <div className="aspect-[4/5] bg-muted relative overflow-hidden rounded-t-lg">
                        {item.photos && item.photos.length > 0 ? (
                          <img
                            src={item.photos[0]}
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Sparkles className="w-12 h-12 text-muted-foreground" />
                          </div>
                        )}
                        
                        <div className="absolute top-2 left-2">
                          <Badge className="bg-purple-500 text-white">
                            <Crown className="w-3 h-3 mr-1" />
                            Premium
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="p-4">
                        <h4 className="font-semibold truncate">{item.name}</h4>
                        <p className="text-sm text-muted-foreground truncate">{item.brand}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-lg font-bold text-primary">${item.price}</span>
                          <Button size="sm" onClick={(e) => {
                            e.stopPropagation();
                            handlePurchase(item);
                          }}>
                            Buy
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* All Merchant Items */}
          <div>
            <h3 className="text-xl font-semibold mb-6">All Merchant Items</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {getFilteredMerchantItems().slice(0, 8).map((item) => (
                <Card 
                  key={item.id} 
                  className="group cursor-pointer hover:shadow-lg transition-all duration-300"
                  onClick={() => navigate(`/market/item/${item.id}`)}
                >
                  <CardContent className="p-0">
                    <div className="aspect-square bg-muted relative overflow-hidden rounded-t-lg">
                        {item.photos && item.photos.length > 0 ? (
                          <img
                            src={item.photos[0]}
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingCart className="w-12 h-12 text-muted-foreground" />
                        </div>
                      )}

                      <Button
                        size="icon"
                        variant="secondary"
                        className="absolute top-2 right-2 w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLike(item.id);
                        }}
                      >
                        <Heart className={`w-4 h-4 ${likedItems.has(item.id) ? 'fill-current' : ''}`} />
                      </Button>
                    </div>
                    
                    <div className="p-4">
                      <h4 className="font-semibold truncate">{item.name}</h4>
                      <p className="text-sm text-muted-foreground truncate">{item.brand}</p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-primary">${item.price}</span>
                          {item.original_price && item.original_price > item.price && (
                            <span className="text-sm text-muted-foreground line-through">
                              ${item.original_price}
                            </span>
                          )}
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {item.category}
                        </Badge>
                      </div>
                      <Button 
                        size="sm" 
                        className="w-full mt-3"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePurchase(item);
                        }}
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Buy Now
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <Separator className="my-12" />

        {/* 2ndDresser Community Market Section */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">2ndDresser Community</h2>
              <p className="text-muted-foreground">Pre-loved fashion from the community</p>
            </div>
          </div>

          {/* Market Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">2,847</div>
                <div className="text-sm text-muted-foreground">Items Listed</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">1,205</div>
                <div className="text-sm text-muted-foreground">Active Sellers</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">892</div>
                <div className="text-sm text-muted-foreground">Sold This Week</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">$45</div>
                <div className="text-sm text-muted-foreground">Avg. Price</div>
              </CardContent>
            </Card>
          </div>

          {/* Sustainability Banner */}
          <Card className="mb-8 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-full">
                  <Recycle className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-green-800">Sustainable Fashion Impact</h3>
                  <p className="text-sm text-green-700">
                    By shopping pre-loved items, you've helped save 2,840 items from landfills this month!
                  </p>
                </div>
                <Badge className="bg-green-100 text-green-800">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +15% this month
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Community Items */}
          {!preferences?.marketplace_settings?.allow_selling ? (
            <Card>
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">Join the 2ndDresser Community</CardTitle>
                <p className="text-muted-foreground">
                  Buy and sell pre-loved fashion items from your community
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center space-y-2">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                      <DollarSign className="h-6 w-6 text-green-600" />
                    </div>
                    <h4 className="font-semibold">Earn Money</h4>
                    <p className="text-sm text-muted-foreground">
                      Sell items you no longer wear
                    </p>
                  </div>
                  <div className="text-center space-y-2">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                      <Eye className="h-6 w-6 text-blue-600" />
                    </div>
                    <h4 className="font-semibold">Discover Unique Pieces</h4>
                    <p className="text-sm text-muted-foreground">
                      Find one-of-a-kind fashion items
                    </p>
                  </div>
                  <div className="text-center space-y-2">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                      <Heart className="h-6 w-6 text-purple-600" />
                    </div>
                    <h4 className="font-semibold">Sustainable Fashion</h4>
                    <p className="text-sm text-muted-foreground">
                      Give clothes a second life
                    </p>
                  </div>
                </div>
                
                <div className="text-center">
                  <Button onClick={enableMarketplace} className="w-full md:w-auto">
                    <Package className="mr-2 h-4 w-4" />
                    Enable 2ndDresser Marketplace
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {getFiltered2ndDresserItems().map((item) => (
                <Card 
                  key={item.id} 
                  className="group cursor-pointer hover:shadow-lg transition-all duration-300"
                  onClick={() => navigate(`/market/item/${item.id}`)}
                >
                  <CardContent className="p-0">
                    <div className="aspect-square bg-muted relative overflow-hidden rounded-t-lg">
                      <img
                        src={item.photos[0] || "/placeholder.svg"}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      
                      <div className="absolute top-2 left-2">
                        <Badge className="bg-white text-black">
                          ${item.price}
                        </Badge>
                      </div>
                      
                      <div className="absolute top-2 right-2">
                        <Badge variant="outline" className="bg-white/90">
                          {item.condition}
                        </Badge>
                      </div>
                      
                      <Button
                        size="icon"
                        variant="secondary"
                        className="absolute bottom-2 right-2 w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLike(item.id);
                        }}
                      >
                        <Heart className={`w-4 h-4 ${likedItems.has(item.id) ? 'fill-current' : ''}`} />
                      </Button>
                    </div>
                    
                    <div className="p-4">
                      <h4 className="font-medium truncate">{item.title}</h4>
                      <p className="text-sm text-muted-foreground truncate">
                        {item.brand} • Size {item.size}
                      </p>
                      
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-500" fill="currentColor" />
                          <span className="text-xs text-muted-foreground">
                            {item.seller_rating}
                          </span>
                        </div>
                        {item.original_price && item.original_price > item.price && (
                          <span className="text-xs text-muted-foreground line-through">
                            ${item.original_price}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span>{item.location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          <span>{item.views}</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          className="flex-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePurchase(item);
                          }}
                        >
                          Buy
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleChat(item);
                          }}
                        >
                          <MessageCircle className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default DualMarketplace;