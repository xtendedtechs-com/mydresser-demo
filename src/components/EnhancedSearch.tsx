import { useState, useEffect } from 'react';
import { Search, Filter, SortAsc, X, Calendar, Tag, Palette, Shirt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { useWardrobe, WardrobeItem } from '@/hooks/useWardrobe';
import { useMerchantItems } from '@/hooks/useMerchantItems';
import { useDebounce } from '@/hooks/useDebounce';

interface SearchFilters {
  categories: string[];
  colors: string[];
  brands: string[];
  sizes: string[];
  occasions: string[];
  seasons: string[];
  materials: string[];
  priceRange: [number, number];
  condition?: string[];
  tags: string[];
}

interface SearchResult {
  type: 'wardrobe' | 'market' | 'outfit' | 'collection';
  item: any;
  score: number;
  matchedFields: string[];
}

interface EnhancedSearchProps {
  onResults?: (results: SearchResult[]) => void;
  searchScope?: 'all' | 'wardrobe' | 'market' | 'outfits' | 'collections';
  placeholder?: string;
  autoFocus?: boolean;
}

const EnhancedSearch = ({ 
  onResults, 
  searchScope = 'all',
  placeholder = "Search items, brands, styles, or colors...",
  autoFocus = false 
}: EnhancedSearchProps) => {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({
    categories: [],
    colors: [],
    brands: [],
    sizes: [],
    occasions: [],
    seasons: [],
    materials: [],
    priceRange: [0, 500],
    condition: [],
    tags: []
  });
  const [sortBy, setSortBy] = useState<'relevance' | 'price-low' | 'price-high' | 'newest' | 'name'>('relevance');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const { items: wardrobeItems } = useWardrobe();
  const { items: marketItems } = useMerchantItems();
  const debouncedQuery = useDebounce(query, 300);

  // Search options based on available data
  const searchOptions = {
    categories: ['tops', 'bottoms', 'outerwear', 'dresses', 'shoes', 'accessories', 'underwear', 'activewear'],
    colors: ['black', 'white', 'gray', 'blue', 'red', 'green', 'yellow', 'purple', 'pink', 'brown', 'beige', 'navy'],
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '28', '30', '32', '34', '36', '38', '40', '42'],
    occasions: ['casual', 'work', 'formal', 'party', 'sport', 'beach', 'date', 'travel'],
    seasons: ['spring', 'summer', 'fall', 'winter', 'all-season'],
    materials: ['cotton', 'polyester', 'wool', 'silk', 'linen', 'denim', 'leather', 'synthetic'],
    conditions: ['new', 'like-new', 'good', 'fair', 'poor']
  };

  useEffect(() => {
    loadRecentSearches();
  }, []);

  useEffect(() => {
    if (debouncedQuery || hasActiveFilters()) {
      performSearch();
    } else {
      setResults([]);
    }
  }, [debouncedQuery, filters, sortBy]);

  useEffect(() => {
    if (onResults) {
      onResults(results);
    }
  }, [results, onResults]);

  const loadRecentSearches = () => {
    const saved = localStorage.getItem('mydresser_recent_searches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  };

  const saveRecentSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    const updated = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 10);
    setRecentSearches(updated);
    localStorage.setItem('mydresser_recent_searches', JSON.stringify(updated));
  };

  const hasActiveFilters = (): boolean => {
    return filters.categories.length > 0 ||
           filters.colors.length > 0 ||
           filters.brands.length > 0 ||
           filters.sizes.length > 0 ||
           filters.occasions.length > 0 ||
           filters.seasons.length > 0 ||
           filters.materials.length > 0 ||
           filters.condition?.length > 0 ||
           filters.tags.length > 0 ||
           filters.priceRange[0] > 0 ||
           filters.priceRange[1] < 500;
  };

  const performSearch = () => {
    const searchResults: SearchResult[] = [];

    // Search wardrobe items
    if (searchScope === 'all' || searchScope === 'wardrobe') {
      wardrobeItems.forEach(item => {
        const score = calculateItemScore(item, query, filters, 'wardrobe');
        if (score > 0) {
          searchResults.push({
            type: 'wardrobe',
            item,
            score,
            matchedFields: getMatchedFields(item, query, filters)
          });
        }
      });
    }

    // Search market items
    if (searchScope === 'all' || searchScope === 'market') {
      marketItems.forEach(item => {
        const score = calculateItemScore(item, query, filters, 'market');
        if (score > 0) {
          searchResults.push({
            type: 'market',
            item,
            score,
            matchedFields: getMatchedFields(item, query, filters)
          });
        }
      });
    }

    // Sort results
    const sortedResults = sortResults(searchResults, sortBy);
    setResults(sortedResults);

    // Save recent search
    if (query.trim()) {
      saveRecentSearch(query.trim());
    }
  };

  const calculateItemScore = (item: any, searchQuery: string, searchFilters: SearchFilters, itemType: 'wardrobe' | 'market'): number => {
    let score = 0;
    const query = searchQuery.toLowerCase().trim();
    
    if (!query && !hasActiveFilters()) return 0;

    // Text matching
    if (query) {
      // Name/Title match (highest priority)
      const name = (item.name || item.title || '').toLowerCase();
      if (name.includes(query)) {
        score += name.startsWith(query) ? 100 : 50;
      }

      // Brand match
      if (item.brand?.toLowerCase().includes(query)) {
        score += 30;
      }

      // Category match
      if (item.category?.toLowerCase().includes(query)) {
        score += 20;
      }

      // Description match
      if (item.description?.toLowerCase().includes(query)) {
        score += 10;
      }

      // Tags match
      if (item.tags?.some((tag: string) => tag.toLowerCase().includes(query))) {
        score += 15;
      }

      // Color match
      if (item.color?.toLowerCase().includes(query) || 
          (Array.isArray(item.colors) && item.colors.some((c: string) => c.toLowerCase().includes(query)))) {
        score += 20;
      }
    }

    // Filter matching
    if (hasActiveFilters()) {
      let filterMatches = 0;
      let totalFilters = 0;

      // Category filter
      if (searchFilters.categories.length > 0) {
        totalFilters++;
        if (searchFilters.categories.includes(item.category?.toLowerCase())) {
          filterMatches++;
        }
      }

      // Color filter
      if (searchFilters.colors.length > 0) {
        totalFilters++;
        const itemColors = Array.isArray(item.colors) ? item.colors : [item.color];
        if (itemColors.some((color: string) => 
          searchFilters.colors.includes(color?.toLowerCase())
        )) {
          filterMatches++;
        }
      }

      // Brand filter
      if (searchFilters.brands.length > 0) {
        totalFilters++;
        if (searchFilters.brands.includes(item.brand?.toLowerCase())) {
          filterMatches++;
        }
      }

      // Size filter
      if (searchFilters.sizes.length > 0) {
        totalFilters++;
        const itemSizes = Array.isArray(item.size) ? item.size : [item.size];
        if (itemSizes.some((size: string) => searchFilters.sizes.includes(size))) {
          filterMatches++;
        }
      }

      // Price filter (for market items)
      if (itemType === 'market' && item.price !== undefined) {
        const [minPrice, maxPrice] = searchFilters.priceRange;
        if (item.price >= minPrice && item.price <= maxPrice) {
          score += 10;
        } else if (searchFilters.priceRange[0] > 0 || searchFilters.priceRange[1] < 500) {
          return 0; // Exclude if outside price range
        }
      }

      // Apply filter score
      if (totalFilters > 0) {
        const filterScore = (filterMatches / totalFilters) * 50;
        score += filterScore;
        
        // If no filters match, reduce score significantly
        if (filterMatches === 0) {
          score *= 0.1;
        }
      }
    }

    return score;
  };

  const getMatchedFields = (item: any, searchQuery: string, searchFilters: SearchFilters): string[] => {
    const matched: string[] = [];
    const query = searchQuery.toLowerCase();

    if (query) {
      if ((item.name || item.title || '').toLowerCase().includes(query)) matched.push('name');
      if (item.brand?.toLowerCase().includes(query)) matched.push('brand');
      if (item.category?.toLowerCase().includes(query)) matched.push('category');
      if (item.description?.toLowerCase().includes(query)) matched.push('description');
      if (item.color?.toLowerCase().includes(query)) matched.push('color');
    }

    // Add filter matches
    if (searchFilters.categories.includes(item.category?.toLowerCase())) matched.push('category');
    if (searchFilters.brands.includes(item.brand?.toLowerCase())) matched.push('brand');
    
    return matched;
  };

  const sortResults = (searchResults: SearchResult[], sortType: string): SearchResult[] => {
    return [...searchResults].sort((a, b) => {
      switch (sortType) {
        case 'price-low':
          return (a.item.price || 0) - (b.item.price || 0);
        case 'price-high':
          return (b.item.price || 0) - (a.item.price || 0);
        case 'newest':
          return new Date(b.item.created_at || 0).getTime() - new Date(a.item.created_at || 0).getTime();
        case 'name':
          return (a.item.name || a.item.title || '').localeCompare(b.item.name || b.item.title || '');
        case 'relevance':
        default:
          return b.score - a.score;
      }
    });
  };

  const clearFilters = () => {
    setFilters({
      categories: [],
      colors: [],
      brands: [],
      sizes: [],
      occasions: [],
      seasons: [],
      materials: [],
      priceRange: [0, 500],
      condition: [],
      tags: []
    });
  };

  const addFilter = (type: keyof SearchFilters, value: string) => {
    if (type === 'priceRange') return;
    
    setFilters(prev => ({
      ...prev,
      [type]: Array.isArray(prev[type]) 
        ? [...(prev[type] as string[]), value]
        : [value]
    }));
  };

  const removeFilter = (type: keyof SearchFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [type]: Array.isArray(prev[type])
        ? (prev[type] as string[]).filter(v => v !== value)
        : prev[type]
    }));
  };

  const handleRecentSearch = (searchTerm: string) => {
    setQuery(searchTerm);
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('mydresser_recent_searches');
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      {/* Main Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="pl-10 pr-20"
        />
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
          <Popover open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
            <PopoverTrigger asChild>
              <Button size="sm" variant="outline">
                <Filter className="w-4 h-4 mr-1" />
                Filters
                {hasActiveFilters() && (
                  <Badge className="ml-1 h-4 w-4 p-0 flex items-center justify-center text-xs">
                    !
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Filters</h4>
                  <Button size="sm" variant="ghost" onClick={clearFilters}>
                    Clear All
                  </Button>
                </div>

                <Tabs defaultValue="category" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="category">Category</TabsTrigger>
                    <TabsTrigger value="style">Style</TabsTrigger>
                    <TabsTrigger value="price">Price</TabsTrigger>
                  </TabsList>

                  <TabsContent value="category" className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium">Categories</Label>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {searchOptions.categories.map((cat) => (
                          <div key={cat} className="flex items-center space-x-2">
                            <Checkbox
                              id={`cat-${cat}`}
                              checked={filters.categories.includes(cat)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  addFilter('categories', cat);
                                } else {
                                  removeFilter('categories', cat);
                                }
                              }}
                            />
                            <Label htmlFor={`cat-${cat}`} className="text-sm capitalize">
                              {cat}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <Label className="text-sm font-medium">Sizes</Label>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {searchOptions.sizes.map((size) => (
                          <Badge
                            key={size}
                            variant={filters.sizes.includes(size) ? "default" : "outline"}
                            className="cursor-pointer"
                            onClick={() => {
                              if (filters.sizes.includes(size)) {
                                removeFilter('sizes', size);
                              } else {
                                addFilter('sizes', size);
                              }
                            }}
                          >
                            {size}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="style" className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium">Colors</Label>
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        {searchOptions.colors.map((color) => (
                          <div key={color} className="flex items-center space-x-2">
                            <Checkbox
                              id={`color-${color}`}
                              checked={filters.colors.includes(color)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  addFilter('colors', color);
                                } else {
                                  removeFilter('colors', color);
                                }
                              }}
                            />
                            <Label htmlFor={`color-${color}`} className="text-sm capitalize">
                              {color}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <Label className="text-sm font-medium">Occasions</Label>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {searchOptions.occasions.map((occasion) => (
                          <Badge
                            key={occasion}
                            variant={filters.occasions.includes(occasion) ? "default" : "outline"}
                            className="cursor-pointer"
                            onClick={() => {
                              if (filters.occasions.includes(occasion)) {
                                removeFilter('occasions', occasion);
                              } else {
                                addFilter('occasions', occasion);
                              }
                            }}
                          >
                            {occasion}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="price" className="space-y-3">
                    {searchScope !== 'wardrobe' && (
                      <div>
                        <Label className="text-sm font-medium">
                          Price Range: ${filters.priceRange[0]} - ${filters.priceRange[1]}
                        </Label>
                        <Slider
                          value={filters.priceRange}
                          onValueChange={(value) => 
                            setFilters(prev => ({ ...prev, priceRange: value as [number, number] }))
                          }
                          max={500}
                          min={0}
                          step={10}
                          className="mt-2"
                        />
                      </div>
                    )}

                    {searchScope === 'market' && (
                      <div>
                        <Label className="text-sm font-medium">Condition</Label>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          {searchOptions.conditions.map((condition) => (
                            <div key={condition} className="flex items-center space-x-2">
                              <Checkbox
                                id={`condition-${condition}`}
                                checked={filters.condition?.includes(condition)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    addFilter('condition', condition);
                                  } else {
                                    removeFilter('condition', condition);
                                  }
                                }}
                              />
                              <Label htmlFor={`condition-${condition}`} className="text-sm capitalize">
                                {condition}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            </PopoverContent>
          </Popover>

          <Select value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
            <SelectTrigger className="w-24">
              <SortAsc className="w-4 h-4 mr-1" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance">Relevance</SelectItem>
              <SelectItem value="price-low">Price ↑</SelectItem>
              <SelectItem value="price-high">Price ↓</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="name">Name</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Active Filters */}
      {hasActiveFilters() && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(filters).map(([key, values]) => {
            if (key === 'priceRange') {
              if (values[0] > 0 || values[1] < 500) {
                return (
                  <Badge key={key} variant="secondary" className="gap-1">
                    ${values[0]} - ${values[1]}
                    <X 
                      className="w-3 h-3 cursor-pointer" 
                      onClick={() => setFilters(prev => ({ ...prev, priceRange: [0, 500] }))}
                    />
                  </Badge>
                );
              }
              return null;
            }
            
            if (Array.isArray(values) && values.length > 0) {
              return values.map((value) => (
                <Badge key={`${key}-${value}`} variant="secondary" className="gap-1">
                  {value}
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => removeFilter(key as keyof SearchFilters, value)}
                  />
                </Badge>
              ));
            }
            return null;
          })}
        </div>
      )}

      {/* Recent Searches */}
      {!query && recentSearches.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Recent Searches</CardTitle>
              <Button size="sm" variant="ghost" onClick={clearRecentSearches}>
                Clear
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((search, index) => (
                <Badge 
                  key={index}
                  variant="outline" 
                  className="cursor-pointer hover:bg-accent"
                  onClick={() => handleRecentSearch(search)}
                >
                  {search}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Results Count */}
      {(query || hasActiveFilters()) && (
        <div className="text-sm text-muted-foreground">
          {results.length} result{results.length !== 1 ? 's' : ''} found
        </div>
      )}
    </div>
  );
};

export default EnhancedSearch;