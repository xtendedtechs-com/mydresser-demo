import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  ShoppingBag, 
  Search, 
  Filter, 
  Star, 
  Heart,
  TrendingUp,
  Users,
  Store,
  Sparkles,
  MapPin,
  Clock,
  DollarSign,
  Shield,
  Zap
} from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { useMerchantItems } from '@/hooks/useMerchantItems';
import { AdvancedSearch } from './AdvancedSearch';
import { SocialFeedCard } from './SocialFeedCard';
import { toast } from 'sonner';

export const ComprehensiveMarketplace = () => {
  const { user, profile } = useProfile();
  const { items: merchantItems } = useMerchantItems();
  
  const [activeTab, setActiveTab] = useState('discover');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [filteredItems, setFilteredItems] = useState<any[]>([]);

  // Mock data for demonstration - in production, this would come from APIs
  const trendingItems = [
    {
      id: '1',
      name: 'Vintage Denim Jacket',
      price: 89.99,
      originalPrice: 129.99,
      brand: 'Levi\'s',
      image: '/placeholder.svg',
      merchant: 'StyleHub',
      rating: 4.8,
      reviews: 142,
      condition: 'excellent',
      tags: ['vintage', 'denim', 'casual']
    },
    {
      id: '2',
      name: 'Silk Scarf Collection',
      price: 45.00,
      brand: 'Hermès',
      image: '/placeholder.svg',
      merchant: 'LuxuryResale',
      rating: 4.9,
      reviews: 89,
      condition: 'new',
      tags: ['luxury', 'silk', 'accessories']
    }
  ];

  const socialPosts = [
    {
      id: '1',
      user: {
        id: 'user1',
        name: 'Sarah Style',
        avatar: '/placeholder.svg',
        role: 'professional'
      },
      content: {
        type: 'outfit' as const,
        title: 'Perfect Fall Transition Look',
        description: 'Mixing textures for a cozy yet chic autumn outfit',
        images: ['/placeholder.svg', '/placeholder.svg'],
        tags: ['fall', 'layering', 'cozy']
      },
      engagement: {
        likes: 234,
        comments: 18,
        shares: 12
      },
      metadata: {
        createdAt: '2024-01-15T10:30:00Z',
        location: 'New York'
      }
    }
  ];

  const professionalStylists = [
    {
      id: '1',
      name: 'Emma Rodriguez',
      specialties: ['Sustainable Fashion', 'Color Analysis'],
      rating: 4.9,
      clients: 150,
      price: '$75/session',
      avatar: '/placeholder.svg',
      verified: true
    },
    {
      id: '2',
      name: 'Marcus Chen',
      specialties: ['Menswear', 'Corporate Style'],
      rating: 4.8,
      clients: 98,
      price: '$65/session',
      avatar: '/placeholder.svg',
      verified: true
    }
  ];

  const featuredMerchants = [
    {
      id: '1',
      name: 'Sustainable Threads',
      description: 'Eco-friendly fashion for the conscious consumer',
      rating: 4.7,
      products: 284,
      logo: '/placeholder.svg',
      verified: true,
      tags: ['sustainable', 'organic', 'fair-trade']
    },
    {
      id: '2',
      name: 'Vintage Vault',
      description: 'Curated vintage pieces from the 70s-90s',
      rating: 4.6,
      products: 156,
      logo: '/placeholder.svg',
      verified: true,
      tags: ['vintage', 'retro', 'unique']
    }
  ];

  useEffect(() => {
    // Filter items based on search
    if (searchQuery) {
      const filtered = merchantItems.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredItems(filtered);
    } else {
      setFilteredItems(merchantItems);
    }
  }, [searchQuery, merchantItems]);

  const handleAdvancedSearch = (filters: any) => {
    // Advanced filtering logic
    let filtered = merchantItems;

    if (filters.query) {
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(filters.query.toLowerCase())
      );
    }

    if (filters.category) {
      filtered = filtered.filter(item => item.category === filters.category);
    }

    if (filters.brand) {
      filtered = filtered.filter(item => item.brand === filters.brand);
    }

    // Add more filter conditions...

    setFilteredItems(filtered);
    setShowAdvancedSearch(false);
    toast.success(`Found ${filtered.length} items matching your criteria`);
  };

  const handleLike = (itemId: string) => {
    toast.success('Added to favorites!');
  };

  const handleAddToCart = (itemId: string) => {
    toast.success('Added to cart!');
  };

  const handleBookStylist = (stylistId: string) => {
    toast.success('Booking request sent!');
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border z-10">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold">MyDresser Market</h1>
              <p className="text-sm text-muted-foreground">Discover, Shop, Connect</p>
            </div>
            <Badge variant="secondary" className="flex items-center space-x-1">
              <Shield className="w-4 h-4" />
              <span>Verified Marketplace</span>
            </Badge>
          </div>

          {/* Search Bar */}
          <div className="flex space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search items, brands, or styles..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>
      </header>

      <main className="px-4 py-6">
        {/* Advanced Search */}
        {showAdvancedSearch && (
          <div className="mb-6">
            <AdvancedSearch 
              onSearch={handleAdvancedSearch}
              onClear={() => {
                setFilteredItems(merchantItems);
                setShowAdvancedSearch(false);
              }}
            />
          </div>
        )}

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="discover">Discover</TabsTrigger>
            <TabsTrigger value="shop">Shop</TabsTrigger>
            <TabsTrigger value="stylists">Stylists</TabsTrigger>
            <TabsTrigger value="social">Social</TabsTrigger>
          </TabsList>

          {/* Discover Tab */}
          <TabsContent value="discover" className="space-y-6">
            {/* Trending Items */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5" />
                  <span>Trending Now</span>
                </CardTitle>
                <CardDescription>Popular items in your area</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {trendingItems.map(item => (
                    <Card key={item.id} className="overflow-hidden">
                      <div className="aspect-square relative">
                        <img 
                          src={item.image} 
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                        <Badge className="absolute top-2 right-2 bg-red-500">
                          -{Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}%
                        </Badge>
                      </div>
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <h3 className="font-medium">{item.name}</h3>
                          <p className="text-sm text-muted-foreground">{item.brand}</p>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold">${item.price}</span>
                            {item.originalPrice && (
                              <span className="text-sm text-muted-foreground line-through">
                                ${item.originalPrice}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 text-sm">
                            <div className="flex items-center">
                              <Star className="w-4 h-4 text-yellow-400 fill-current" />
                              <span className="ml-1">{item.rating}</span>
                            </div>
                            <span className="text-muted-foreground">({item.reviews} reviews)</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {item.tags.slice(0, 2).map(tag => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <div className="flex space-x-2 pt-2">
                            <Button size="sm" className="flex-1">
                              <ShoppingBag className="w-4 h-4 mr-2" />
                              Add to Cart
                            </Button>
                            <Button size="sm" variant="outline">
                              <Heart className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Featured Merchants */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Store className="w-5 h-5" />
                  <span>Featured Merchants</span>
                </CardTitle>
                <CardDescription>Verified sellers in our marketplace</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {featuredMerchants.map(merchant => (
                    <Card key={merchant.id} className="p-4">
                      <div className="flex items-start space-x-4">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={merchant.logo} />
                          <AvatarFallback>{merchant.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-medium">{merchant.name}</h3>
                            {merchant.verified && (
                              <Badge variant="secondary" className="text-xs">
                                <Shield className="w-3 h-3 mr-1" />
                                Verified
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {merchant.description}
                          </p>
                          <div className="flex items-center space-x-4 text-sm">
                            <div className="flex items-center">
                              <Star className="w-4 h-4 text-yellow-400 fill-current" />
                              <span className="ml-1">{merchant.rating}</span>
                            </div>
                            <span>{merchant.products} products</span>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {merchant.tags.map(tag => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <Button size="sm">Visit Store</Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Shop Tab */}
          <TabsContent value="shop" className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredItems.slice(0, 12).map(item => (
                <Card key={item.id} className="overflow-hidden">
                  <div className="aspect-square relative">
                    <img 
                      src={item.photos?.main || '/placeholder.svg'} 
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                      onClick={() => handleLike(item.id)}
                    >
                      <Heart className="w-4 h-4" />
                    </Button>
                  </div>
                  <CardContent className="p-3">
                    <div className="space-y-2">
                      <h3 className="font-medium text-sm">{item.name}</h3>
                      <p className="text-xs text-muted-foreground">{item.brand}</p>
                      <div className="flex items-center justify-between">
                        <span className="font-bold">${item.price}</span>
                        <Badge variant="outline" className="text-xs">
                          {item.condition}
                        </Badge>
                      </div>
                      <Button 
                        size="sm" 
                        className="w-full text-xs"
                        onClick={() => handleAddToCart(item.id)}
                      >
                        Add to Cart
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredItems.length === 0 && (
              <Card>
                <CardContent className="text-center py-8">
                  <ShoppingBag className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No items found matching your search</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => {
                      setSearchQuery('');
                      setShowAdvancedSearch(false);
                    }}
                  >
                    Clear Search
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Stylists Tab */}
          <TabsContent value="stylists" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Sparkles className="w-5 h-5" />
                  <span>Professional Stylists</span>
                </CardTitle>
                <CardDescription>Book personal styling sessions with verified professionals</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {professionalStylists.map(stylist => (
                    <Card key={stylist.id} className="p-4">
                      <div className="flex items-start space-x-4">
                        <Avatar className="w-16 h-16">
                          <AvatarImage src={stylist.avatar} />
                          <AvatarFallback>{stylist.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-medium">{stylist.name}</h3>
                            {stylist.verified && (
                              <Badge variant="secondary" className="text-xs">
                                <Shield className="w-3 h-3 mr-1" />
                                Verified Pro
                              </Badge>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-2 mb-2">
                            {stylist.specialties.map(specialty => (
                              <Badge key={specialty} variant="outline" className="text-xs">
                                {specialty}
                              </Badge>
                            ))}
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <div className="flex items-center">
                              <Star className="w-4 h-4 text-yellow-400 fill-current" />
                              <span className="ml-1">{stylist.rating}</span>
                            </div>
                            <div className="flex items-center">
                              <Users className="w-4 h-4 mr-1" />
                              <span>{stylist.clients} clients</span>
                            </div>
                            <div className="flex items-center">
                              <DollarSign className="w-4 h-4 mr-1" />
                              <span>{stylist.price}</span>
                            </div>
                          </div>
                        </div>
                        <Button 
                          size="sm"
                          onClick={() => handleBookStylist(stylist.id)}
                        >
                          Book Session
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Styling Services Info */}
            <Card className="bg-gradient-to-r from-primary/10 to-secondary/10">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <Zap className="w-8 h-8 text-primary" />
                  <div>
                    <h3 className="font-medium mb-2">Personal Styling Services</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Get personalized fashion advice from certified stylists. Services include wardrobe audits, 
                      personal shopping, and style consultations.
                    </p>
                    <Button size="sm">Learn More</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Social Tab */}
          <TabsContent value="social" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>Fashion Community</span>
                </CardTitle>
                <CardDescription>See what the community is wearing and sharing</CardDescription>
              </CardHeader>
            </Card>

            <div className="space-y-6">
              {socialPosts.map(post => (
                <SocialFeedCard key={post.id} post={post} />
              ))}
            </div>

            {/* Call to Action */}
            <Card className="bg-muted/50">
              <CardContent className="text-center py-8">
                <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-medium mb-2">Join the Conversation</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Share your outfits and get inspired by the community
                </p>
                <Button>Share Your Style</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};