import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { DollarSign, Eye, Heart, MessageCircle, Package, Truck, Star, Filter, Search, MapPin, Clock, Plus, Recycle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useWardrobe } from '@/hooks/useWardrobe';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useProfile } from '@/hooks/useProfile';
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
  const { user } = useProfile();
  const { items } = useWardrobe();
  const { preferences, updatePreferences } = useUserPreferences();
  const { toast } = useToast();
  
  const [marketItems, setMarketItems] = useState<MarketItem[]>([]);
  const [likedItems, setLikedItems] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeTab, setActiveTab] = useState('browse');
  const [loading, setLoading] = useState(false);
  // Use real market data instead of mock data
  useEffect(() => {
    const fetchMarketItems = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('market_items')
          .select('*')
          .eq('source_type', 'user')
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(50);

        if (error) throw error;

        const formattedItems: MarketItem[] = (data || []).map(item => ({
          id: item.id,
          seller_id: item.seller_id,
          item_id: item.id,
          title: item.title,
          description: item.description,
          price: item.price,
          original_price: item.original_price,
          condition: item.condition,
          size: item.size || 'Unknown',
          brand: item.brand,
          category: item.category,
          photos: Array.isArray(item.photos) ? item.photos.map(p => String(p)) : [],
          seller_name: 'Anonymous Seller',
          seller_rating: 4.5,
          location: item.location || 'Unknown',
          status: 'available',
          listed_at: item.created_at,
          views: item.views_count || 0,
          likes: item.likes_count || 0,
          shipping_options: ['standard']
        }));

        setMarketItems(formattedItems);
      } catch (error) {
        console.error('Error in fetchMarketItems:', error);
        // Fallback to mock data if database fails
        setMarketItems(mockMarketItems);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchMarketItems();
    } else {
      setMarketItems(mockMarketItems);
      setLoading(false);
    }
  }, [user?.id]);

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
    },
    {
      id: '5',
      seller_id: 'user5',
      item_id: 'item5',
      title: 'Bohemian Summer Maxi Dress',
      description: 'Flowy and comfortable, perfect for summer events.',
      price: 55,
      original_price: 95,
      condition: 'excellent',
      size: 'L',
      brand: 'Free People',
      category: 'dresses',
      photos: ['/placeholder.svg'],
      seller_name: 'BohoChic',
      seller_rating: 4.7,
      location: 'Portland, OR',
      status: 'available',
      listed_at: '2024-01-11',
      views: 28,
      likes: 9,
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
                         item.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.seller_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', 'tops', 'bottoms', 'outerwear', 'shoes', 'dresses', 'accessories'];

  const handleItemClick = (item: MarketItem) => {
    navigate(`/market/2nddresser/item/${item.id}`);
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

  const handleChat = (item: MarketItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to chat with sellers.",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Opening chat",
      description: `Starting conversation with ${item.seller_name}...`,
    });
  };

  const handleSellItem = () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to sell items on 2ndDresser.",
        variant: "destructive",
      });
      return;
    }
    
    if (!preferences.marketplace_settings?.allow_selling) {
      enableMarketplace();
      return;
    }
    
    navigate('/market/2nddresser/sell');
  };

  if (!preferences.marketplace_settings?.allow_selling) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Recycle className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl">Welcome to 2ndDresser</CardTitle>
            <p className="text-muted-foreground">
              The sustainable fashion marketplace where your wardrobe gets a second life
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
                  Turn your unused clothes into cash
                </p>
              </div>
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <Eye className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold">Discover Unique Pieces</h3>
                <p className="text-sm text-muted-foreground">
                  Find one-of-a-kind fashion items from real people
                </p>
              </div>
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                  <Recycle className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold">Sustainable Fashion</h3>
                <p className="text-sm text-muted-foreground">
                  Reduce waste and support circular fashion
                </p>
              </div>
            </div>
            
            <div className="bg-muted rounded-lg p-6 text-center space-y-4">
              <div className="grid grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary">2,847</div>
                  <div className="text-xs text-muted-foreground">Items Listed</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">1,205</div>
                  <div className="text-xs text-muted-foreground">Happy Sellers</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">892</div>
                  <div className="text-xs text-muted-foreground">Sold This Week</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">$45</div>
                  <div className="text-xs text-muted-foreground">Avg. Price</div>
                </div>
              </div>
            </div>
            
            <div className="text-center space-y-4">
              <Button onClick={enableMarketplace} size="lg" className="w-full md:w-auto">
                <Recycle className="mr-2 h-5 w-5" />
                Join 2ndDresser Community
              </Button>
              <p className="text-xs text-muted-foreground">
                Start buying and selling pre-loved fashion items
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
              <Recycle className="h-5 w-5 text-white" />
            </div>
            2ndDresser Market
          </h1>
          <p className="text-muted-foreground">
            Discover unique pre-loved fashion from your community
          </p>
        </div>
        <Button onClick={handleSellItem}>
          <Plus className="mr-2 h-4 w-4" />
          Sell an Item
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="browse">Browse</TabsTrigger>
          <TabsTrigger value="favorites">Favorites</TabsTrigger>
          <TabsTrigger value="my-listings">My Listings</TabsTrigger>
          <TabsTrigger value="purchases">Purchases</TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-6 mt-6">
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
                    <div className="aspect-square bg-muted overflow-hidden rounded-t-lg relative">
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
                        <Badge 
                          variant="outline" 
                          className={`bg-white/90 ${
                            item.condition === 'excellent' ? 'text-green-700 border-green-300' :
                            item.condition === 'good' ? 'text-blue-700 border-blue-300' :
                            'text-orange-700 border-orange-300'
                          }`}
                        >
                          {item.condition}
                        </Badge>
                      </div>
                      
                      {/* Heart icon */}
                      <div className="absolute bottom-2 right-2">
                        <Button 
                          size="sm" 
                          variant="secondary" 
                          className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
                          onClick={(e) => handleLike(item.id, e)}
                        >
                          <Heart 
                            className={`h-4 w-4 ${likedItems.has(item.id) ? 'fill-red-500 text-red-500' : ''}`} 
                          />
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
                          <span className="text-xs text-muted-foreground">
                            • {item.seller_name}
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
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            <span>{item.views}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Heart className="h-3 w-3" />
                            <span>{item.likes}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 pt-2">
                        <Button 
                          size="sm" 
                          className="flex-1"
                          onClick={(e) => handleChat(item, e)}
                        >
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
        </TabsContent>

        <TabsContent value="favorites" className="space-y-6 mt-6">
          <Card>
            <CardContent className="p-12 text-center">
              <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No favorites yet</h3>
              <p className="text-muted-foreground">
                Items you like will appear here
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="my-listings" className="space-y-6 mt-6">
          <Card>
            <CardContent className="p-12 text-center">
              <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No listings yet</h3>
              <p className="text-muted-foreground mb-4">
                Start selling your pre-loved fashion items
              </p>
              <Button onClick={handleSellItem}>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Listing
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="purchases" className="space-y-6 mt-6">
          <Card>
            <CardContent className="p-12 text-center">
              <DollarSign className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No purchases yet</h3>
              <p className="text-muted-foreground">
                Your purchase history will appear here
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SecondDresserMarket;