import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { 
  Search, 
  Filter, 
  Heart, 
  Share2, 
  ShoppingBag,
  Star,
  MapPin,
  Clock,
  DollarSign,
  Truck,
  Shield,
  MessageCircle,
  Camera,
  Plus,
  Grid3X3,
  List,
  Sparkles,
  Recycle,
  Award,
  TrendingUp,
  ChevronRight,
  SortAsc,
  Eye,
  ThumbsUp
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMerchantItems } from "@/hooks/useMerchantItems";
import { useProfile } from "@/hooks/useProfile";

interface MarketplaceItem {
  id: string;
  seller_id: string;
  seller: {
    id: string;
    display_name: string;
    avatar_url?: string;
    rating: number;
    verified: boolean;
    response_rate: number;
    items_sold: number;
  };
  title: string;
  description: string;
  price: number;
  original_price?: number;
  category: string;
  brand?: string;
  size: string;
  condition: 'new' | 'like-new' | 'good' | 'fair';
  color: string;
  material?: string;
  images: string[];
  location: string;
  shipping_options: {
    local_pickup: boolean;
    shipping_available: boolean;
    shipping_cost?: number;
  };
  created_at: string;
  updated_at: string;
  likes_count: number;
  views_count: number;
  is_sold: boolean;
  is_featured: boolean;
  sustainability_score?: number;
  tags: string[];
}

interface SustainabilityBadge {
  type: 'eco-friendly' | 'vintage' | 'upcycled' | 'donation';
  label: string;
  description: string;
}

export const EnhancedMarketplace = () => {
  const [activeTab, setActiveTab] = useState("browse");
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedCondition, setSelectedCondition] = useState("all");
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
  const [sortBy, setSortBy] = useState("recent");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);

  const { toast } = useToast();
  const { profile } = useProfile();

  useEffect(() => {
    loadMarketplaceItems();
  }, []);

  const loadMarketplaceItems = () => {
    // Mock marketplace data
    const mockItems: MarketplaceItem[] = [
      {
        id: "item1",
        seller_id: "seller1",
        seller: {
          id: "seller1",
          display_name: "Sarah M.",
          avatar_url: "/api/placeholder/40/40",
          rating: 4.8,
          verified: true,
          response_rate: 95,
          items_sold: 127
        },
        title: "Vintage Levi's 501 Jeans",
        description: "Classic vintage Levi's 501 jeans in excellent condition. Authentic 1990s pair with perfect fade and no damages. These are getting harder to find!",
        price: 85,
        original_price: 120,
        category: "bottoms",
        brand: "Levi's",
        size: "30x32",
        condition: "good",
        color: "Blue",
        material: "100% Cotton Denim",
        images: ["/api/placeholder/400/500", "/api/placeholder/400/500"],
        location: "Brooklyn, NY",
        shipping_options: {
          local_pickup: true,
          shipping_available: true,
          shipping_cost: 8
        },
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        likes_count: 23,
        views_count: 156,
        is_sold: false,
        is_featured: true,
        sustainability_score: 85,
        tags: ["vintage", "denim", "classic", "sustainable"]
      },
      {
        id: "item2",
        seller_id: "seller2",
        seller: {
          id: "seller2",
          display_name: "Emma K.",
          avatar_url: "/api/placeholder/40/40",
          rating: 4.9,
          verified: true,
          response_rate: 98,
          items_sold: 89
        },
        title: "COS Minimalist Wool Coat",
        description: "Beautiful minimalist wool coat from COS. Worn only a few times, like new condition. Perfect for fall/winter seasons.",
        price: 195,
        original_price: 350,
        category: "outerwear",
        brand: "COS",
        size: "M",
        condition: "like-new",
        color: "Camel",
        material: "80% Wool, 20% Polyamide",
        images: ["/api/placeholder/400/600", "/api/placeholder/400/600"],
        location: "San Francisco, CA",
        shipping_options: {
          local_pickup: false,
          shipping_available: true,
          shipping_cost: 15
        },
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        likes_count: 45,
        views_count: 298,
        is_sold: false,
        is_featured: false,
        sustainability_score: 92,
        tags: ["minimalist", "wool", "designer", "winter"]
      }
    ];
    setItems(mockItems);
  };

  const getSustainabilityBadge = (score?: number): SustainabilityBadge | null => {
    if (!score) return null;
    
    if (score >= 90) return { type: 'eco-friendly', label: 'Eco Champion', description: 'Excellent for the environment' };
    if (score >= 80) return { type: 'vintage', label: 'Vintage Value', description: 'Great sustainable choice' };
    if (score >= 70) return { type: 'upcycled', label: 'Smart Choice', description: 'Good for the planet' };
    return { type: 'donation', label: 'Conscious Buy', description: 'Better than fast fashion' };
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'new': return 'bg-green-500';
      case 'like-new': return 'bg-blue-500';
      case 'good': return 'bg-yellow-500';
      case 'fair': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getFilteredAndSortedItems = () => {
    let filtered = items.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (item.brand?.toLowerCase().includes(searchTerm.toLowerCase())) ||
                           item.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
      const matchesCondition = selectedCondition === "all" || item.condition === selectedCondition;
      const matchesPrice = item.price >= priceRange.min && item.price <= priceRange.max;

      return matchesSearch && matchesCategory && matchesCondition && matchesPrice && !item.is_sold;
    });

    // Sort items
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "recent": return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case "price-low": return a.price - b.price;
        case "price-high": return b.price - a.price;
        case "popular": return b.likes_count - a.likes_count;
        case "sustainable": return (b.sustainability_score || 0) - (a.sustainability_score || 0);
        default: return 0;
      }
    });

    return filtered;
  };

  const handleLikeItem = (itemId: string) => {
    setItems(items.map(item =>
      item.id === itemId
        ? { ...item, likes_count: item.likes_count + 1 }
        : item
    ));
    toast({ title: "Item liked!" });
  };

  const handleContactSeller = (seller: MarketplaceItem['seller']) => {
    toast({ 
      title: "Message sent!", 
      description: `You can now chat with ${seller.display_name}` 
    });
  };

  const handleBuyNow = (item: MarketplaceItem) => {
    toast({ 
      title: "Redirecting to checkout...", 
      description: `Purchasing ${item.title} for $${item.price}` 
    });
  };

  const filteredItems = getFilteredAndSortedItems();

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Second Hand Market</h1>
          <p className="text-muted-foreground">Discover unique pieces, sell with purpose</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Camera className="w-4 h-4" />
            Sell Item
          </Button>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            List for Sale
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="browse">Browse</TabsTrigger>
          <TabsTrigger value="favorites">Favorites</TabsTrigger>
          <TabsTrigger value="selling">My Listings</TabsTrigger>
          <TabsTrigger value="sold">Purchase History</TabsTrigger>
        </TabsList>

        {/* Browse Tab */}
        <TabsContent value="browse" className="space-y-6">
          {/* Search and Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search items, brands, styles..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowFilters(!showFilters)}
                    className="gap-2"
                  >
                    <Filter className="w-4 h-4" />
                    Filters
                  </Button>
                  <div className="flex gap-2">
                    <Button
                      variant={viewMode === "grid" ? "default" : "outline"}
                      size="icon"
                      onClick={() => setViewMode("grid")}
                    >
                      <Grid3X3 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={viewMode === "list" ? "default" : "outline"}
                      size="icon"
                      onClick={() => setViewMode("list")}
                    >
                      <List className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {showFilters && (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t">
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="tops">Tops</SelectItem>
                        <SelectItem value="bottoms">Bottoms</SelectItem>
                        <SelectItem value="outerwear">Outerwear</SelectItem>
                        <SelectItem value="shoes">Shoes</SelectItem>
                        <SelectItem value="accessories">Accessories</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={selectedCondition} onValueChange={setSelectedCondition}>
                      <SelectTrigger>
                        <SelectValue placeholder="Condition" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Conditions</SelectItem>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="like-new">Like New</SelectItem>
                        <SelectItem value="good">Good</SelectItem>
                        <SelectItem value="fair">Fair</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="recent">Recently Listed</SelectItem>
                        <SelectItem value="price-low">Price: Low to High</SelectItem>
                        <SelectItem value="price-high">Price: High to Low</SelectItem>
                        <SelectItem value="popular">Most Popular</SelectItem>
                        <SelectItem value="sustainable">Most Sustainable</SelectItem>
                      </SelectContent>
                    </Select>

                    <div className="flex gap-2">
                      <Input
                        placeholder="Min $"
                        type="number"
                        value={priceRange.min}
                        onChange={(e) => setPriceRange(prev => ({ ...prev, min: Number(e.target.value) }))}
                      />
                      <Input
                        placeholder="Max $"
                        type="number"
                        value={priceRange.max}
                        onChange={(e) => setPriceRange(prev => ({ ...prev, max: Number(e.target.value) }))}
                      />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Featured Items Banner */}
          <Card className="bg-gradient-to-r from-primary/10 to-accent/10">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500" />
                    Featured Items
                  </h3>
                  <p className="text-sm text-muted-foreground">Handpicked sustainable gems</p>
                </div>
                <Button variant="outline" size="sm" className="gap-2">
                  View All <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Items Grid */}
          <div className={viewMode === "grid" 
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            : "space-y-4"
          }>
            {filteredItems.map((item) => (
              <Card key={item.id} className="group overflow-hidden hover:shadow-lg transition-shadow">
                {item.is_featured && (
                  <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-semibold px-2 py-1 text-center">
                    FEATURED
                  </div>
                )}
                
                <div className="relative">
                  <img
                    src={item.images[0]}
                    alt={item.title}
                    className={viewMode === "grid" 
                      ? "w-full h-48 object-cover group-hover:scale-105 transition-transform"
                      : "w-24 h-24 object-cover rounded-lg"
                    }
                  />
                  {getSustainabilityBadge(item.sustainability_score) && (
                    <Badge 
                      variant="secondary" 
                      className="absolute top-2 left-2 text-xs gap-1"
                    >
                      <Recycle className="w-3 h-3" />
                      {getSustainabilityBadge(item.sustainability_score)!.label}
                    </Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                    onClick={() => handleLikeItem(item.id)}
                  >
                    <Heart className="w-4 h-4" />
                  </Button>
                </div>

                <CardContent className={viewMode === "grid" ? "pt-4" : "pt-4 pl-4"}>
                  <div className={viewMode === "list" ? "flex items-center gap-4" : "space-y-3"}>
                    {viewMode === "list" && (
                      <img
                        src={item.images[0]}
                        alt={item.title}
                        className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                      />
                    )}
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-semibold text-sm line-clamp-2">{item.title}</h4>
                        <div className="flex items-center gap-1">
                          <div className={`w-2 h-2 rounded-full ${getConditionColor(item.condition)}`} />
                          <span className="text-xs text-muted-foreground capitalize">{item.condition}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="font-bold text-lg">${item.price}</span>
                        {item.original_price && (
                          <span className="text-sm text-muted-foreground line-through">
                            ${item.original_price}
                          </span>
                        )}
                        {item.brand && (
                          <Badge variant="outline" className="text-xs">{item.brand}</Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {item.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {item.views_count}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          {item.likes_count}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Avatar className="w-6 h-6">
                            <AvatarImage src={item.seller.avatar_url} />
                            <AvatarFallback>{item.seller.display_name[0]}</AvatarFallback>
                          </Avatar>
                          <div className="text-xs">
                            <div className="font-medium">{item.seller.display_name}</div>
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                              {item.seller.rating}
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleContactSeller(item.seller)}
                            className="gap-1"
                          >
                            <MessageCircle className="w-3 h-3" />
                            Message
                          </Button>
                          <Button 
                            size="sm"
                            onClick={() => handleBuyNow(item)}
                            className="gap-1"
                          >
                            <ShoppingBag className="w-3 h-3" />
                            Buy
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredItems.length === 0 && (
            <Card className="p-8 text-center">
              <div className="space-y-4">
                <ShoppingBag className="w-12 h-12 mx-auto text-muted-foreground" />
                <div>
                  <h3 className="font-semibold">No items found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search or filter criteria
                  </p>
                </div>
              </div>
            </Card>
          )}
        </TabsContent>

        {/* Other tabs would be implemented similarly */}
        <TabsContent value="favorites" className="space-y-6">
          <Card className="p-8 text-center">
            <Heart className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">Your Favorite Items</h3>
            <p className="text-muted-foreground">Items you've liked will appear here</p>
          </Card>
        </TabsContent>

        <TabsContent value="selling" className="space-y-6">
          <Card className="p-8 text-center">
            <Camera className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">Your Listings</h3>
            <p className="text-muted-foreground">Manage your items for sale</p>
            <Button className="mt-4 gap-2">
              <Plus className="w-4 h-4" />
              Create New Listing
            </Button>
          </Card>
        </TabsContent>

        <TabsContent value="sold" className="space-y-6">
          <Card className="p-8 text-center">
            <ShoppingBag className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">Purchase History</h3>
            <p className="text-muted-foreground">Your buying history and receipts</p>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedMarketplace;
