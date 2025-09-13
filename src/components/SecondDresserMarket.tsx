import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, Eye, Heart, MessageCircle, Package, Truck, Star, Filter, Search, MapPin, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useWardrobe } from '@/hooks/useWardrobe';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useToast } from '@/hooks/use-toast';

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

const SecondDresserMarket = () => {
  const navigate = useNavigate();
  const { items } = useWardrobe();
  const { preferences, updatePreferences } = useUserPreferences();
  const { toast } = useToast();
  
  const [marketItems, setMarketItems] = useState<MarketItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [loading, setLoading] = useState(false);

  // Mock data - in real app this would come from Supabase
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
    }
  ];

  useEffect(() => {
    setMarketItems(mockMarketItems);
  }, []);

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

  const filteredItems = marketItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.brand?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesPrice = item.price >= priceRange[0] && item.price <= priceRange[1];
    
    return matchesSearch && matchesCategory && matchesPrice;
  });

  const categories = ['all', 'tops', 'bottoms', 'outerwear', 'shoes', 'dresses', 'accessories'];

  const handleItemClick = (item: MarketItem) => {
    navigate(`/market/item/${item.id}`);
  };

  const handleSellItem = () => {
    if (!preferences.marketplace_settings.allow_selling) {
      enableMarketplace();
      return;
    }
    navigate('/market/sell');
  };

  if (!preferences.marketplace_settings.allow_selling) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Welcome to 2ndDresser</CardTitle>
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
                <h3 className="font-semibold">Earn Money</h3>
                <p className="text-sm text-muted-foreground">
                  Sell items you no longer wear
                </p>
              </div>
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <Eye className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold">Discover Unique Pieces</h3>
                <p className="text-sm text-muted-foreground">
                  Find one-of-a-kind fashion items
                </p>
              </div>
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                  <Heart className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold">Sustainable Fashion</h3>
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
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">2ndDresser Market</h1>
          <p className="text-muted-foreground">
            Discover unique pre-loved fashion from your community
          </p>
        </div>
        <Button onClick={handleSellItem}>
          <DollarSign className="mr-2 h-4 w-4" />
          Sell an Item
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search items, brands, or sellers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2 overflow-x-auto">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="whitespace-nowrap"
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </Button>
              ))}
            </div>

            <Button variant="outline" size="sm">
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

      {/* Featured Items */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Featured Items</h2>
        
        {filteredItems.length === 0 ? (
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
            {filteredItems.map((item) => (
              <Card 
                key={item.id} 
                className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
                onClick={() => handleItemClick(item)}
              >
                <div className="aspect-square bg-muted overflow-hidden relative">
                  <img
                    src={item.photos[0] || "/placeholder.svg"}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Price badge */}
                  <div className="absolute top-2 left-2">
                    <Badge className="bg-white text-black">
                      ${item.price}
                    </Badge>
                  </div>
                  
                  {/* Condition badge */}
                  <div className="absolute top-2 right-2">
                    <Badge variant="outline" className="bg-white/90">
                      {item.condition}
                    </Badge>
                  </div>
                  
                  {/* Heart icon */}
                  <div className="absolute bottom-2 right-2">
                    <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
                      <Heart className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium truncate flex-1">{item.title}</h3>
                  </div>
                  
                  <p className="text-sm text-muted-foreground truncate">
                    {item.brand} • Size {item.size}
                  </p>
                  
                  <div className="flex items-center justify-between">
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
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      <span>{item.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      <span>{item.views}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" className="flex-1">
                      <MessageCircle className="mr-1 h-3 w-3" />
                      Chat
                    </Button>
                    <Button size="sm" variant="outline">
                      <Eye className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SecondDresserMarket;