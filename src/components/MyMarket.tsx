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

interface MerchantProduct {
  id: string;
  merchant_id: string;
  merchant_name: string;
  merchant_verified: boolean;
  name: string;
  brand: string;
  description: string;
  price: number;
  original_price?: number;
  category: string;
  size: string[];
  color: string;
  photos: string[];
  in_stock: boolean;
  stock_quantity: number;
  rating: number;
  reviews_count: number;
  shipping_free: boolean;
  featured: boolean;
  created_at: string;
}

const MyMarket = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [products, setProducts] = useState<MerchantProduct[]>([]);
  const [likedItems, setLikedItems] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(false);

  // Mock merchant products data
  const mockProducts: MerchantProduct[] = [
    {
      id: "mp1",
      merchant_id: "m1",
      merchant_name: "Elite Fashion Co.",
      merchant_verified: true,
      name: "Premium Wool Coat",
      brand: "Hugo Boss",
      description: "Luxurious wool blend coat perfect for winter elegance",
      price: 299,
      original_price: 399,
      category: "outerwear",
      size: ["S", "M", "L", "XL"],
      color: "Black",
      photos: ["/placeholder.svg"],
      in_stock: true,
      stock_quantity: 15,
      rating: 4.8,
      reviews_count: 124,
      shipping_free: true,
      featured: true,
      created_at: "2024-01-15"
    },
    {
      id: "mp2", 
      merchant_id: "m2",
      merchant_name: "Urban Style Hub",
      merchant_verified: true,
      name: "Designer Skinny Jeans",
      brand: "Calvin Klein",
      description: "Modern fit denim with premium stretch fabric",
      price: 89,
      original_price: 120,
      category: "bottoms",
      size: ["28", "29", "30", "31", "32", "34"],
      color: "Dark Blue",
      photos: ["/placeholder.svg"],
      in_stock: true,
      stock_quantity: 32,
      rating: 4.6,
      reviews_count: 89,
      shipping_free: true,
      featured: false,
      created_at: "2024-01-14"
    },
    {
      id: "mp3",
      merchant_id: "m3", 
      merchant_name: "Luxury Boutique",
      merchant_verified: true,
      name: "Silk Evening Dress",
      brand: "Armani",
      description: "Elegant silk dress for special occasions",
      price: 450,
      category: "dresses",
      size: ["XS", "S", "M", "L"],
      color: "Emerald Green",
      photos: ["/placeholder.svg"],
      in_stock: true,
      stock_quantity: 8,
      rating: 4.9,
      reviews_count: 67,
      shipping_free: true,
      featured: true,
      created_at: "2024-01-13"
    },
    {
      id: "mp4",
      merchant_id: "m4",
      merchant_name: "Active Wear Pro",
      merchant_verified: true,
      name: "Performance Running Shoes",
      brand: "Adidas",
      description: "Professional running shoes with boost technology",
      price: 140,
      original_price: 180,
      category: "shoes",
      size: ["7", "8", "9", "10", "11", "12"],
      color: "White/Black",
      photos: ["/placeholder.svg"],
      in_stock: true,
      stock_quantity: 25,
      rating: 4.7,
      reviews_count: 203,
      shipping_free: true,
      featured: false,
      created_at: "2024-01-12"
    },
    {
      id: "mp5",
      merchant_id: "m5",
      merchant_name: "Classic Menswear",
      merchant_verified: true,
      name: "Business Shirt",
      brand: "Brooks Brothers",
      description: "Classic cotton business shirt with modern fit",
      price: 75,
      category: "tops",
      size: ["S", "M", "L", "XL", "XXL"],
      color: "White",
      photos: ["/placeholder.svg"],
      in_stock: true,
      stock_quantity: 40,
      rating: 4.5,
      reviews_count: 156,
      shipping_free: false,
      featured: false,
      created_at: "2024-01-11"
    },
    {
      id: "mp6",
      merchant_id: "m6",
      merchant_name: "Trendy Accessories",
      merchant_verified: false,
      name: "Leather Handbag",
      brand: "Michael Kors",
      description: "Genuine leather handbag with multiple compartments",
      price: 195,
      original_price: 250,
      category: "accessories",
      size: ["One Size"],
      color: "Brown",
      photos: ["/placeholder.svg"],
      in_stock: true,
      stock_quantity: 12,
      rating: 4.4,
      reviews_count: 78,
      shipping_free: true,
      featured: false,
      created_at: "2024-01-10"
    }
  ];

  const categories = [
    "all", "tops", "bottoms", "outerwear", "dresses", "shoes", "accessories"
  ];

  useEffect(() => {
    setProducts(mockProducts);
  }, []);

  const getFilteredProducts = () => {
    let filtered = products;

    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.merchant_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter(product => 
        product.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    return filtered;
  };

  const handleProductClick = (product: MerchantProduct) => {
    navigate(`/market/product/${product.id}`);
  };

  const handleLike = (productId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLikedItems(prev => {
      const newLiked = new Set(prev);
      if (newLiked.has(productId)) {
        newLiked.delete(productId);
        toast({ title: "Removed from favorites" });
      } else {
        newLiked.add(productId);
        toast({ title: "Added to favorites" });
      }
      return newLiked;
    });
  };

  const handleAddToCart = (product: MerchantProduct, e: React.MouseEvent) => {
    e.stopPropagation();
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  const featuredProducts = getFilteredProducts().filter(p => p.featured);
  const regularProducts = getFilteredProducts().filter(p => !p.featured);

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
            <div className="text-2xl font-bold text-primary">1,247</div>
            <div className="text-sm text-muted-foreground">Premium Products</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">156</div>
            <div className="text-sm text-muted-foreground">Verified Merchants</div>
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
            {featuredProducts.map((product) => (
              <Card 
                key={product.id} 
                className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
                onClick={() => handleProductClick(product)}
              >
                <div className="aspect-square bg-muted overflow-hidden rounded-t-lg relative">
                  <img
                    src={product.photos[0] || "/placeholder.svg"}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Featured badge */}
                  <div className="absolute top-2 left-2">
                    <Badge className="bg-yellow-500 text-white">
                      <Star className="w-3 h-3 mr-1" />
                      Featured
                    </Badge>
                  </div>
                  
                  {/* Merchant verification */}
                  {product.merchant_verified && (
                    <div className="absolute top-2 right-2">
                      <Badge variant="outline" className="bg-white/90 text-blue-700 border-blue-300">
                        <Shield className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    </div>
                  )}

                  {/* Actions overlay */}
                  <div className="absolute bottom-2 right-2 flex gap-1">
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-8 w-8 bg-white/90 hover:bg-white"
                      onClick={(e) => handleLike(product.id, e)}
                    >
                      <Heart 
                        className={`h-4 w-4 ${likedItems.has(product.id) ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} 
                      />
                    </Button>
                    <Button
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => handleAddToCart(product, e)}
                    >
                      <ShoppingCart className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold truncate">{product.name}</h3>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-400 fill-current" />
                        <span className="text-xs text-muted-foreground">{product.rating}</span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground truncate">{product.brand}</p>
                    <p className="text-xs text-muted-foreground truncate">{product.merchant_name}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-primary">${product.price}</span>
                        {product.original_price && (
                          <span className="text-sm line-through text-muted-foreground">
                            ${product.original_price}
                          </span>
                        )}
                      </div>
                      {product.shipping_free && (
                        <Badge variant="outline" className="text-xs">
                          <Truck className="w-3 h-3 mr-1" />
                          Free Shipping
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* All Products */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">All Products</h2>
        
        {regularProducts.length === 0 && featuredProducts.length === 0 ? (
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
            {regularProducts.map((product) => (
              <Card 
                key={product.id} 
                className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
                onClick={() => handleProductClick(product)}
              >
                <div className="aspect-square bg-muted overflow-hidden rounded-t-lg relative">
                  <img
                    src={product.photos[0] || "/placeholder.svg"}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Merchant verification */}
                  {product.merchant_verified && (
                    <div className="absolute top-2 right-2">
                      <Badge variant="outline" className="bg-white/90 text-blue-700 border-blue-300">
                        <Shield className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    </div>
                  )}

                  {/* Sale badge */}
                  {product.original_price && (
                    <div className="absolute top-2 left-2">
                      <Badge className="bg-red-500 text-white">
                        -{Math.round(((product.original_price - product.price) / product.original_price) * 100)}%
                      </Badge>
                    </div>
                  )}

                  {/* Actions overlay */}
                  <div className="absolute bottom-2 right-2 flex gap-1">
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-8 w-8 bg-white/90 hover:bg-white"
                      onClick={(e) => handleLike(product.id, e)}
                    >
                      <Heart 
                        className={`h-4 w-4 ${likedItems.has(product.id) ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} 
                      />
                    </Button>
                    <Button
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => handleAddToCart(product, e)}
                    >
                      <ShoppingCart className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold truncate">{product.name}</h3>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-400 fill-current" />
                        <span className="text-xs text-muted-foreground">{product.rating}</span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground truncate">{product.brand}</p>
                    <p className="text-xs text-muted-foreground truncate">{product.merchant_name}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-primary">${product.price}</span>
                        {product.original_price && (
                          <span className="text-sm line-through text-muted-foreground">
                            ${product.original_price}
                          </span>
                        )}
                      </div>
                      {product.shipping_free && (
                        <Badge variant="outline" className="text-xs">
                          <Truck className="w-3 h-3 mr-1" />
                          Free Shipping
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyMarket;