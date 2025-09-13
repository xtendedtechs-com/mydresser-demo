import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

const UnifiedMarketplace = () => {
  const [activeMarket, setActiveMarket] = useState<"merchant" | "2nddresser">("merchant");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("featured");
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
      title: 'Silk Evening Dress',
      description: 'Elegant silk dress, worn once to a wedding.',
      price: 95,
      original_price: 180,
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
      shipping_options: ['standard', 'express']
    }
  ];

  useEffect(() => {
    setMarketItems(mockMarketItems);
  }, []);

  const categories = ["all", "tops", "bottoms", "outerwear", "dresses", "shoes", "accessories"];

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

  const getFilteredMerchantItems = () => {
    let filtered = merchantItems;

    if (searchQuery) {
      filtered = filtered.filter(item => 
        item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.brand?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    return filtered;
  };

  const getFiltered2ndDresserItems = () => {
    let filtered = marketItems;

    if (searchQuery) {
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.brand?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    return filtered;
  };

  const featuredItems = getFeaturedItems().slice(0, 6);
  const premiumItems = getPremiumItems().slice(0, 4);

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center space-y-4 mb-8">
          <h1 className="text-4xl font-bold tracking-tight">Fashion Marketplace</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover curated fashion from merchants and unique pre-loved pieces from the community
          </p>
        </div>

        {/* Market Toggle */}
        <div className="flex justify-center mb-8">
          <div className="flex bg-muted rounded-lg p-1">
            <Button
              variant={activeMarket === "merchant" ? "default" : "ghost"}
              className="gap-2"
              onClick={() => setActiveMarket("merchant")}
            >
              <Store className="w-4 h-4" />
              Market
            </Button>
            <Button
              variant={activeMarket === "2nddresser" ? "default" : "ghost"}
              className="gap-2"
              onClick={() => setActiveMarket("2nddresser")}
            >
              <Users className="w-4 h-4" />
              2ndDresser
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder={`Search ${activeMarket === "merchant" ? "brands and merchants" : "community items"}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
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
          </CardContent>
        </Card>

        {/* Market Content */}
        {activeMarket === "merchant" ? (
          <div className="space-y-12">
            {/* Featured Items Section */}
            {featuredItems.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-6">
                  <Star className="w-6 h-6 text-yellow-500" />
                  <h2 className="text-2xl font-bold">Featured Items</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
                  {featuredItems.map((item) => (
                    <Card key={item.id} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                      <CardContent className="p-0">
                        <div className="aspect-square bg-muted relative overflow-hidden rounded-t-lg">
                          {item.photos?.main ? (
                            <img
                              src={item.photos.main}
                              alt={item.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <div className="text-6xl text-muted-foreground">
                                {item.category.charAt(0).toUpperCase()}
                              </div>
                            </div>
                          )}
                          
                          <div className="absolute top-2 left-2 flex flex-col gap-1">
                            {item.is_featured && (
                              <Badge className="bg-yellow-500 text-yellow-900">
                                <Star className="w-3 h-3 mr-1" />
                                Featured
                              </Badge>
                            )}
                          </div>

                          <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              size="icon"
                              variant={likedItems.has(item.id) ? "default" : "secondary"}
                              className="w-8 h-8"
                              onClick={() => handleLike(item.id)}
                            >
                              <Heart className={`w-4 h-4 ${likedItems.has(item.id) ? 'fill-current' : ''}`} />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="p-4">
                          <h3 className="font-semibold truncate">{item.name}</h3>
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
                            onClick={() => handlePurchase(item)}
                          >
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            Buy Now
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {/* Premium Collection */}
            {premiumItems.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-6">
                  <Crown className="w-6 h-6 text-purple-500" />
                  <h2 className="text-2xl font-bold">Premium Collection</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {premiumItems.map((item) => (
                    <Card key={item.id} className="group hover:shadow-lg transition-all duration-300">
                      <CardContent className="p-0">
                        <div className="aspect-[4/5] bg-muted relative overflow-hidden rounded-t-lg">
                          {item.photos?.main ? (
                            <img
                              src={item.photos.main}
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
                          <h3 className="font-semibold truncate">{item.name}</h3>
                          <p className="text-sm text-muted-foreground truncate">{item.brand}</p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-lg font-bold text-primary">${item.price}</span>
                            <Button size="sm" onClick={() => handlePurchase(item)}>
                              Buy
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {/* All Merchant Items */}
            <section>
              <h2 className="text-2xl font-bold mb-6">All Items</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {getFilteredMerchantItems().map((item) => (
                  <Card key={item.id} className="group hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-0">
                      <div className="aspect-square bg-muted relative overflow-hidden rounded-t-lg">
                        {item.photos?.main ? (
                          <img
                            src={item.photos.main}
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <div className="text-6xl text-muted-foreground">
                              {item.category.charAt(0).toUpperCase()}
                            </div>
                          </div>
                        )}
                        
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="icon"
                            variant={likedItems.has(item.id) ? "default" : "secondary"}
                            className="w-8 h-8"
                            onClick={() => handleLike(item.id)}
                          >
                            <Heart className={`w-4 h-4 ${likedItems.has(item.id) ? 'fill-current' : ''}`} />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="p-4">
                        <h3 className="font-semibold truncate">{item.name}</h3>
                        <p className="text-sm text-muted-foreground truncate">{item.brand}</p>
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-lg font-bold text-primary">${item.price}</span>
                          <Button size="sm" onClick={() => handlePurchase(item)}>
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            Buy
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          </div>
        ) : (
          // 2ndDresser Market
          <div className="space-y-8">
            {/* Market Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
            <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <Recycle className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-green-800">Sustainable Fashion</h3>
                      <p className="text-sm text-green-600">Give pre-loved items a second life</p>
                    </div>
                  </div>
                  <Button variant="outline" className="border-green-300 text-green-700 hover:bg-green-50">
                    <DollarSign className="w-4 h-4 mr-2" />
                    Sell Your Items
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Community Items */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Community Items</h2>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <TrendingUp className="w-4 h-4" />
                  <span>Trending in your area</span>
                </div>
              </div>

              {getFiltered2ndDresserItems().length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No items found</h3>
                    <p className="text-muted-foreground">
                      Try adjusting your search or filters
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {getFiltered2ndDresserItems().map((item) => (
                    <Card key={item.id} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
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
                          
                          <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button 
                              size="icon"
                              variant="secondary" 
                              className="w-8 h-8"
                              onClick={() => handleLike(item.id)}
                            >
                              <Heart className={`w-4 h-4 ${likedItems.has(item.id) ? 'fill-current' : ''}`} />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="p-4 space-y-2">
                          <h3 className="font-semibold truncate">{item.title}</h3>
                          <p className="text-sm text-muted-foreground truncate">
                            {item.brand} • Size {item.size}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              <Avatar className="w-5 h-5">
                                <AvatarFallback className="text-xs">
                                  {item.seller_name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-xs text-muted-foreground">
                                {item.seller_name}
                              </span>
                              <Star className="w-3 h-3 text-yellow-500" fill="currentColor" />
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
                          
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              <span>{item.location}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              <span>{item.views}</span>
                            </div>
                          </div>
                          
                          <div className="flex gap-2 pt-2">
                            <Button size="sm" className="flex-1" onClick={() => handlePurchase(item)}>
                              <ShoppingCart className="w-3 h-3 mr-1" />
                              Buy
                            </Button>
                            <Button size="sm" variant="outline" className="flex-1">
                              <MessageCircle className="w-3 h-3 mr-1" />
                              Chat
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
        )}
      </div>
    </div>
  );
};

export default UnifiedMarketplace;