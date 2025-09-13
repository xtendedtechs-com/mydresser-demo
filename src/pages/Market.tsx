import { useState } from "react";
import { useNavigate as useRRNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Filter, 
  Heart, 
  ShoppingCart, 
  Star,
  MapPin,
  Store,
  Users,
  Zap,
  Shield,
  Eye,
  TrendingUp,
  Plus
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMerchantItems } from "@/hooks/useMerchantItems";
import ProductCard from "@/components/ProductCard";
import MarketHero from "@/components/MarketHero";
import CategorySection from "@/components/CategorySection";

const Market = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedTab, setSelectedTab] = useState("mydresser");
  const { toast } = useToast();
  const navigate = useRRNavigate();
  const { 
    items: merchantItems, 
    loading, 
    getFeaturedItems, 
    getPremiumItems,
    getItemsByCategory,
    searchItems,
    getPhotoUrls 
  } = useMerchantItems();

  // Sample data for demonstration
  const featuredOutfits = [
    {
      id: 1,
      title: "Professional Chic",
      items: ["Black Blazer", "White Shirt", "Dark Jeans"],
      price: 189.99,
      originalPrice: 249.99,
      discount: 24,
      image: "/api/placeholder/300/400",
      merchant: "StyleHub",
      rating: 4.8,
      likes: 234
    },
    {
      id: 2,
      title: "Casual Friday",
      items: ["Knit Sweater", "Chinos", "Sneakers"],
      price: 139.99,
      originalPrice: 179.99,
      discount: 22,
      image: "/api/placeholder/300/400",
      merchant: "TrendSpot",
      rating: 4.6,
      likes: 187
    }
  ];

  const featuredItems = [
    {
      id: 1,
      title: "Classic Denim Jacket",
      price: 79.99,
      originalPrice: 99.99,
      discount: 20,
      image: "/api/placeholder/250/300",
      merchant: "DenisCo",
      rating: 4.7,
      likes: 156,
      category: "Jackets",
      isNew: true
    },
    {
      id: 2,
      title: "Cotton T-Shirt",
      price: 24.99,
      originalPrice: 34.99,
      discount: 29,
      image: "/api/placeholder/250/300",
      merchant: "BasicWear",
      rating: 4.5,
      likes: 89,
      category: "T-Shirts",
      isPremium: true
    }
  ];

  const categories = [
    { name: "Shirts", count: 1247, icon: "👔" },
    { name: "Dresses", count: 892, icon: "👗" },
    { name: "Jeans", count: 634, icon: "👖" },
    { name: "Shoes", count: 1089, icon: "👟" },
    { name: "Accessories", count: 456, icon: "👜" },
    { name: "Jackets", count: 378, icon: "🧥" }
  ];

  const handleItemAction = (action: string, itemId: number) => {
    toast({
      title: `${action} Item`,
      description: `Item ${itemId} has been ${action.toLowerCase()}ed to your list.`,
    });
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b">
        <div className="px-4 py-4 space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold fashion-text-gradient">Market</h1>
            <div className="flex gap-2">
              <Button variant="outline" size="icon">
                <Filter className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search outfits, items, brands..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Tab Navigation */}
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="mydresser" className="flex items-center gap-2">
                <Store className="w-4 h-4" />
                MyDresser Market
              </TabsTrigger>
              <TabsTrigger value="2nddresser" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                2ndDresser
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="px-4 space-y-6">
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          {/* MyDresser Market Tab */}
          <TabsContent value="mydresser" className="space-y-6 mt-6">
            {/* Hero Section */}
            <MarketHero />

            {/* Quick Actions */}
            <Card className="p-4 bg-primary/5">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">AI-Powered Suggestions</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  variant="outline" 
                  className="h-auto p-3 flex-col items-start"
                  onClick={() => handleItemAction("Generate", 0)}
                >
                  <TrendingUp className="w-5 h-5 mb-2 self-center" />
                  <span className="text-sm font-medium">Complete Outfit</span>
                  <span className="text-xs text-muted-foreground">Based on your style</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-auto p-3 flex-col items-start"
                  onClick={() => handleItemAction("Suggest", 0)}
                >
                  <Eye className="w-5 h-5 mb-2 self-center" />
                  <span className="text-sm font-medium">Try Mirror</span>
                  <span className="text-xs text-muted-foreground">Virtual try-on</span>
                </Button>
              </div>
            </Card>

            {/* Featured Outfits */}
            <CategorySection
              title="Featured Outfits"
              subtitle="Curated combinations from top merchants"
              icon="✨"
            >
              <div className="grid grid-cols-2 gap-4">
                {featuredOutfits.map((outfit) => (
                  <ProductCard
                    key={outfit.id}
                    item={{
                      ...outfit,
                      isOutfit: true,
                      description: outfit.items.join(" • ")
                    }}
                    onAction={(action) => handleItemAction(action, outfit.id)}
                  />
                ))}
              </div>
            </CategorySection>

            {/* Featured Items */}
            <CategorySection
              title="Featured Items"
              subtitle="Trending pieces from verified merchants"
              icon="🔥"
            >
              <div className="grid grid-cols-2 gap-4">
                {featuredItems.map((item) => (
                  <ProductCard
                    key={item.id}
                    item={item}
                    onAction={(action) => handleItemAction(action, item.id)}
                  />
                ))}
              </div>
            </CategorySection>

            {/* Categories */}
            <CategorySection
              title="Shop by Category"
              subtitle="Find exactly what you're looking for"
              icon="📂"
            >
              <div className="grid grid-cols-3 gap-3">
                {categories.map((category) => (
                  <Card 
                    key={category.name}
                    className="p-4 text-center cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setActiveFilter(category.name.toLowerCase())}
                  >
                    <div className="text-2xl mb-2">{category.icon}</div>
                    <h4 className="font-medium text-sm">{category.name}</h4>
                    <p className="text-xs text-muted-foreground">{category.count} items</p>
                  </Card>
                ))}
              </div>
            </CategorySection>

            {/* Popular Sizes */}
            <CategorySection
              title="Popular in Your Size"
              subtitle="Items that fit users with similar measurements"
              icon="📏"
            >
              <div className="grid grid-cols-2 gap-4">
                {featuredItems.slice(0, 4).map((item) => (
                  <ProductCard
                    key={`size-${item.id}`}
                    item={item}
                    onAction={(action) => handleItemAction(action, item.id)}
                  />
                ))}
              </div>
            </CategorySection>
          </TabsContent>

          {/* 2ndDresser Tab */}
          <TabsContent value="2nddresser" className="space-y-6 mt-6">
            {/* Verification Status */}
            <Card className="p-4 bg-accent/20 border-accent">
              <div className="flex items-center gap-3">
                <Shield className="w-6 h-6 text-accent-foreground" />
                <div className="flex-1">
                  <h3 className="font-semibold text-accent-foreground">Verification Required</h3>
                  <p className="text-sm text-muted-foreground">
                    Complete KYC verification to buy, sell, or exchange items
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Start Verification
                </Button>
              </div>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4">
              <Card className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">1.2k</div>
                <div className="text-xs text-muted-foreground">Items Listed</div>
              </Card>
              <Card className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">98%</div>
                <div className="text-xs text-muted-foreground">Success Rate</div>
              </Card>
              <Card className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">4.9</div>
                <div className="text-xs text-muted-foreground">Avg Rating</div>
              </Card>
            </div>

            {/* Recent Listings */}
            <CategorySection
              title="Recent Listings"
              subtitle="Fresh items from verified users"
              icon="🆕"
            >
              <div className="grid grid-cols-2 gap-4">
                {featuredItems.map((item) => (
                  <ProductCard
                    key={`2nd-${item.id}`}
                    item={{
                      ...item,
                      price: item.price * 0.6, // Used item pricing
                      originalPrice: item.price,
                      isSecondHand: true,
                      seller: "User12345",
                      condition: "Like New"
                    }}
                    onAction={(action) => handleItemAction(action, item.id)}
                  />
                ))}
              </div>
            </CategorySection>

            {/* Sell Your Items */}
            <Card className="p-6 bg-gradient-to-r from-primary/5 to-accent/5">
              <div className="text-center space-y-4">
                <div className="text-3xl">💰</div>
                <h3 className="font-bold text-lg">Turn Your Closet Into Cash</h3>
                <p className="text-sm text-muted-foreground">
                  Sell items you no longer wear to other fashion enthusiasts
                </p>
                <Button className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  List Your Items
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Market;