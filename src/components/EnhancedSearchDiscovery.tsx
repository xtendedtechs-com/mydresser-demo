import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  TrendingUp, 
  Heart, 
  Clock, 
  Filter, 
  Star,
  Tag,
  MapPin,
  DollarSign,
  Sparkles
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SearchFilter {
  category?: string;
  priceRange?: { min: number; max: number };
  condition?: string;
  brand?: string;
  color?: string;
  size?: string;
  location?: string;
}

interface EnhancedSearchDiscoveryProps {
  onSearch?: (query: string, filters: SearchFilter) => void;
}

export const EnhancedSearchDiscovery = ({ onSearch }: EnhancedSearchDiscoveryProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilter>({});
  const [activeTab, setActiveTab] = useState('all');
  const { toast } = useToast();

  const trendingSearches = [
    { query: 'Winter Coats', trend: '+120%', icon: <TrendingUp className="w-3 h-3" /> },
    { query: 'Vintage Denim', trend: '+85%', icon: <Star className="w-3 h-3" /> },
    { query: 'Sustainable Fashion', trend: '+64%', icon: <Sparkles className="w-3 h-3" /> },
    { query: 'Designer Bags', trend: '+45%', icon: <Heart className="w-3 h-3" /> },
  ];

  const popularCategories = [
    { name: 'Tops', count: 1234, icon: '👕' },
    { name: 'Bottoms', count: 892, icon: '👖' },
    { name: 'Dresses', count: 567, icon: '👗' },
    { name: 'Shoes', count: 445, icon: '👟' },
    { name: 'Accessories', count: 678, icon: '👜' },
    { name: 'Outerwear', count: 234, icon: '🧥' },
  ];

  const recentSearches = [
    'Black leather jacket',
    'Nike sneakers',
    'Vintage sunglasses',
    'Summer dresses',
  ];

  const handleSearch = () => {
    if (searchQuery.trim()) {
      onSearch?.(searchQuery, filters);
      toast({
        title: 'Searching...',
        description: `Finding items matching "${searchQuery}"`,
      });
    }
  };

  const handleQuickFilter = (filterType: string, value: string) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
    toast({
      title: 'Filter Applied',
      description: `Showing ${filterType}: ${value}`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Advanced Search Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                placeholder="Search items, brands, styles, or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10 h-12 text-base"
              />
            </div>
            <Button onClick={handleSearch} size="lg" className="gap-2">
              <Search className="w-4 h-4" />
              Search
            </Button>
            <Button variant="outline" size="lg" className="gap-2">
              <Filter className="w-4 h-4" />
              Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Discovery Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="trending">Trending</TabsTrigger>
          <TabsTrigger value="recent">Recent</TabsTrigger>
          <TabsTrigger value="saved">Saved</TabsTrigger>
        </TabsList>

        {/* All Items Tab */}
        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="w-5 h-5" />
                Popular Categories
              </CardTitle>
              <CardDescription>Browse by category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {popularCategories.map((category) => (
                  <Button
                    key={category.name}
                    variant="outline"
                    className="h-auto py-4 flex flex-col items-center gap-2"
                    onClick={() => handleQuickFilter('category', category.name.toLowerCase())}
                  >
                    <span className="text-2xl">{category.icon}</span>
                    <span className="font-medium">{category.name}</span>
                    <Badge variant="secondary" className="text-xs">
                      {category.count.toLocaleString()} items
                    </Badge>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Quick Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Price Range</h4>
                  <div className="flex flex-wrap gap-2">
                    {['Under $25', '$25-$50', '$50-$100', '$100+'].map((range) => (
                      <Badge
                        key={range}
                        variant="outline"
                        className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                        onClick={() => toast({ title: 'Price filter', description: range })}
                      >
                        <DollarSign className="w-3 h-3 mr-1" />
                        {range}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">Condition</h4>
                  <div className="flex flex-wrap gap-2">
                    {['New', 'Like New', 'Good', 'Fair'].map((condition) => (
                      <Badge
                        key={condition}
                        variant="outline"
                        className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                        onClick={() => handleQuickFilter('condition', condition.toLowerCase())}
                      >
                        <Star className="w-3 h-3 mr-1" />
                        {condition}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">Location</h4>
                  <div className="flex flex-wrap gap-2">
                    {['Near Me', 'Local', 'Nationwide', 'International'].map((location) => (
                      <Badge
                        key={location}
                        variant="outline"
                        className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                        onClick={() => handleQuickFilter('location', location.toLowerCase())}
                      >
                        <MapPin className="w-3 h-3 mr-1" />
                        {location}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trending Tab */}
        <TabsContent value="trending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Trending Now
              </CardTitle>
              <CardDescription>What people are searching for</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {trendingSearches.map((item) => (
                  <div
                    key={item.query}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent cursor-pointer transition-colors"
                    onClick={() => setSearchQuery(item.query)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-primary/10">
                        {item.icon}
                      </div>
                      <span className="font-medium">{item.query}</span>
                    </div>
                    <Badge variant="secondary" className="gap-1">
                      <TrendingUp className="w-3 h-3" />
                      {item.trend}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recent Searches Tab */}
        <TabsContent value="recent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Recent Searches
              </CardTitle>
              <CardDescription>Your search history</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {recentSearches.length > 0 ? (
                  recentSearches.map((search) => (
                    <div
                      key={search}
                      className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent cursor-pointer transition-colors"
                      onClick={() => setSearchQuery(search)}
                    >
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span>{search}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No recent searches</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Saved Searches Tab */}
        <TabsContent value="saved" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5" />
                Saved Searches
              </CardTitle>
              <CardDescription>Your favorite search queries</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Heart className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No saved searches yet</p>
                <p className="text-sm mt-1">Save your favorite searches for quick access</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* AI-Powered Suggestions */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            AI Recommendations
          </CardTitle>
          <CardDescription>Personalized suggestions based on your style</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            We analyze your wardrobe, preferences, and browsing history to suggest items you'll love.
          </p>
          <Button variant="outline" className="gap-2">
            <Sparkles className="w-4 h-4" />
            Get AI Suggestions
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
