import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search, 
  Filter, 
  Heart, 
  ShoppingCart,
  Star,
  Eye,
  Crown,
  Truck,
  Shield
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMarketItems } from "@/hooks/useMarketItems";
import { getPrimaryPhotoUrl } from "@/utils/photoHelpers";

const MyMarket = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { items, getFeaturedItems, loading } = useMarketItems();
  
  const [likedItems, setLikedItems] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = [
    "all", "tops", "bottoms", "outerwear", "dresses", "shoes", "accessories"
  ];

  const getFilteredProducts = () => {
    let filtered = items.filter((item: any) => item.status === 'available');

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter((item: any) => {
        const name = (item.title || '').toLowerCase();
        const brand = (item.brand || '').toLowerCase();
        return name.includes(q) || brand.includes(q);
      });
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter((item: any) => 
        (item.category || '').toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    return filtered;
  };

  const handleProductClick = (item: any) => {
    navigate(`/market/item/${item.id}`);
  };

  const handleLike = (itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
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

  const handleAddToCart = (item: any, e: React.MouseEvent) => {
    e.stopPropagation();
    toast({
      title: "Added to cart",
      description: `${item.title} has been added to your cart.`,
    });
  };

  const filteredProducts = getFilteredProducts();
  const featuredProducts = getFeaturedItems().filter(item => 
    filteredProducts.some(fp => fp.id === item.id)
  );
  const regularProducts = filteredProducts.filter((item: any) => !item.is_featured);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
              <Crown className="h-5 w-5 text-white" />
            </div>
            MyMarket
          </h1>
          <p className="text-muted-foreground">
            Discover premium fashion from verified merchants
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products, brands, or merchants..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
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

            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Market Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{items.length}</div>
            <div className="text-sm text-muted-foreground">Available Products</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{featuredProducts.length}</div>
            <div className="text-sm text-muted-foreground">Featured Items</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">24/7</div>
            <div className="text-sm text-muted-foreground">Customer Support</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">Free</div>
            <div className="text-sm text-muted-foreground">Premium Shipping</div>
          </CardContent>
        </Card>
      </div>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            <h2 className="text-xl font-semibold">Featured Products</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {featuredProducts.map((item: any) => {
              const photoUrl = getPrimaryPhotoUrl(item.photos, item.category);
              const displayName = item.title || 'Item';
              
              return (
                <Card 
                  key={item.id} 
                  className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
                  onClick={() => handleProductClick(item)}
                >
                  <div className="aspect-square bg-muted overflow-hidden rounded-t-lg relative">
                    <img
                      src={photoUrl}
                      alt={displayName}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    
                    {/* Featured badge */}
                    <div className="absolute top-2 left-2">
                      <Badge className="bg-yellow-500 text-white">
                        <Star className="w-3 h-3 mr-1" />
                        Featured
                      </Badge>
                    </div>
                    
                    {/* Premium badge */}
                    {item.is_premium && (
                      <div className="absolute top-2 right-2">
                        <Badge variant="outline" className="bg-white/90 text-purple-700 border-purple-300">
                          <Shield className="w-3 h-3 mr-1" />
                          Premium
                        </Badge>
                      </div>
                    )}

                    {/* Actions overlay */}
                    <div className="absolute bottom-2 right-2 flex gap-1">
                      <Button
                        size="icon"
                        variant="secondary"
                        className="h-8 w-8 bg-white/90 hover:bg-white"
                        onClick={(e) => handleLike(item.id, e)}
                      >
                        <Heart 
                          className={`h-4 w-4 ${likedItems.has(item.id) ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} 
                        />
                      </Button>
                      <Button
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => handleAddToCart(item, e)}
                      >
                        <ShoppingCart className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold truncate">{displayName}</h3>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-400 fill-current" />
                          <span className="text-xs text-muted-foreground">4.8</span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground truncate">{item.brand}</p>
                      <p className="text-xs text-muted-foreground truncate">{item.category}</p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-primary">${item.price}</span>
                          {item.original_price && item.original_price > item.price && (
                            <span className="text-sm line-through text-muted-foreground">
                              ${item.original_price}
                            </span>
                          )}
                        </div>
                        <Badge variant="outline" className="text-xs">
                          <Truck className="w-3 h-3 mr-1" />
                          Free Shipping
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* All Products */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">All Products</h2>
        
        {filteredProducts.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No products found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search or filters
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {regularProducts.map((item: any) => {
              const photoUrl = getPrimaryPhotoUrl(item.photos, item.category);
              const displayName = item.title || 'Item';
              
              return (
                <Card 
                  key={item.id} 
                  className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
                  onClick={() => handleProductClick(item)}
                >
                  <div className="aspect-square bg-muted overflow-hidden rounded-t-lg relative">
                    <img
                      src={photoUrl}
                      alt={displayName}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    
                    {/* Premium badge */}
                    {item.is_premium && (
                      <div className="absolute top-2 right-2">
                        <Badge variant="outline" className="bg-white/90 text-purple-700 border-purple-300">
                          <Shield className="w-3 h-3 mr-1" />
                          Premium
                        </Badge>
                      </div>
                    )}

                    {/* Sale badge */}
                    {item.original_price && item.original_price > item.price && (
                      <div className="absolute top-2 left-2">
                        <Badge className="bg-red-500 text-white">
                          -{Math.round(((item.original_price - item.price) / item.original_price) * 100)}%
                        </Badge>
                      </div>
                    )}

                    {/* Actions overlay */}
                    <div className="absolute bottom-2 right-2 flex gap-1">
                      <Button
                        size="icon"
                        variant="secondary"
                        className="h-8 w-8 bg-white/90 hover:bg-white"
                        onClick={(e) => handleLike(item.id, e)}
                      >
                        <Heart 
                          className={`h-4 w-4 ${likedItems.has(item.id) ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} 
                        />
                      </Button>
                      <Button
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => handleAddToCart(item, e)}
                      >
                        <ShoppingCart className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold truncate">{displayName}</h3>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-400 fill-current" />
                          <span className="text-xs text-muted-foreground">4.8</span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground truncate">{item.brand}</p>
                      <p className="text-xs text-muted-foreground truncate">{item.category}</p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-primary">${item.price}</span>
                          {item.original_price && item.original_price > item.price && (
                            <span className="text-sm line-through text-muted-foreground">
                              ${item.original_price}
                            </span>
                          )}
                        </div>
                        <Badge variant="outline" className="text-xs">
                          <Truck className="w-3 h-3 mr-1" />
                          Free Shipping
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyMarket;
