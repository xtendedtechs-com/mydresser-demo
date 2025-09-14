import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Search, Filter, X, Sparkles } from 'lucide-react';

interface SearchFilters {
  query: string;
  category: string;
  brand: string;
  color: string;
  size: string;
  priceRange: [number, number];
  condition: string;
  occasion: string;
  season: string;
  tags: string[];
}

interface AdvancedSearchProps {
  onSearch: (filters: SearchFilters) => void;
  onClear: () => void;
}

export const AdvancedSearch = ({ onSearch, onClear }: AdvancedSearchProps) => {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    category: '',
    brand: '',
    color: '',
    size: '',
    priceRange: [0, 1000],
    condition: '',
    occasion: '',
    season: '',
    tags: []
  });

  const categories = ['tops', 'bottoms', 'outerwear', 'shoes', 'accessories', 'dresses'];
  const brands = ['Nike', 'Adidas', 'Zara', 'H&M', 'Uniqlo', 'Levi\'s', 'Gap', 'Target'];
  const colors = ['Black', 'White', 'Navy', 'Gray', 'Beige', 'Brown', 'Red', 'Blue', 'Green'];
  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const conditions = ['excellent', 'good', 'fair', 'needs repair'];
  const occasions = ['casual', 'work', 'formal', 'party', 'sport', 'vacation'];
  const seasons = ['spring', 'summer', 'fall', 'winter', 'all-season'];

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const addTag = (tag: string) => {
    if (tag && !filters.tags.includes(tag)) {
      handleFilterChange('tags', [...filters.tags, tag]);
    }
  };

  const removeTag = (tag: string) => {
    handleFilterChange('tags', filters.tags.filter(t => t !== tag));
  };

  const clearFilters = () => {
    setFilters({
      query: '',
      category: '',
      brand: '',
      color: '',
      size: '',
      priceRange: [0, 1000],
      condition: '',
      occasion: '',
      season: '',
      tags: []
    });
    onClear();
  };

  const handleSearch = () => {
    onSearch(filters);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Search className="w-5 h-5" />
          <span>Advanced Search</span>
        </CardTitle>
        <CardDescription>Find exactly what you're looking for</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Search Query */}
        <div className="space-y-2">
          <Label>Search Term</Label>
          <Input
            placeholder="Search by name, description, or brand..."
            value={filters.query}
            onChange={(e) => handleFilterChange('query', e.target.value)}
          />
        </div>

        <Separator />

        {/* Category & Brand */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={filters.category} onValueChange={(value) => handleFilterChange('category', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Any category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any category</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Brand</Label>
            <Select value={filters.brand} onValueChange={(value) => handleFilterChange('brand', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Any brand" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any brand</SelectItem>
                {brands.map(brand => (
                  <SelectItem key={brand} value={brand}>
                    {brand}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Color & Size */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Color</Label>
            <Select value={filters.color} onValueChange={(value) => handleFilterChange('color', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Any color" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any color</SelectItem>
                {colors.map(color => (
                  <SelectItem key={color} value={color}>
                    {color}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Size</Label>
            <Select value={filters.size} onValueChange={(value) => handleFilterChange('size', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Any size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any size</SelectItem>
                {sizes.map(size => (
                  <SelectItem key={size} value={size}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Price Range */}
        <div className="space-y-2">
          <Label>Price Range: ${filters.priceRange[0]} - ${filters.priceRange[1]}</Label>
          <Slider
            value={filters.priceRange}
            onValueChange={(value) => handleFilterChange('priceRange', value as [number, number])}
            max={1000}
            min={0}
            step={10}
            className="w-full"
          />
        </div>

        {/* Condition & Occasion */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Condition</Label>
            <Select value={filters.condition} onValueChange={(value) => handleFilterChange('condition', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Any condition" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any condition</SelectItem>
                {conditions.map(condition => (
                  <SelectItem key={condition} value={condition}>
                    {condition.charAt(0).toUpperCase() + condition.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Occasion</Label>
            <Select value={filters.occasion} onValueChange={(value) => handleFilterChange('occasion', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Any occasion" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any occasion</SelectItem>
                {occasions.map(occasion => (
                  <SelectItem key={occasion} value={occasion}>
                    {occasion.charAt(0).toUpperCase() + occasion.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Season */}
        <div className="space-y-2">
          <Label>Season</Label>
          <Select value={filters.season} onValueChange={(value) => handleFilterChange('season', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Any season" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Any season</SelectItem>
              {seasons.map(season => (
                <SelectItem key={season} value={season}>
                  {season.charAt(0).toUpperCase() + season.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <Label>Tags</Label>
          <div className="flex flex-wrap gap-2 mb-2">
            {filters.tags.map(tag => (
              <Badge key={tag} variant="secondary" className="flex items-center space-x-1">
                <span>{tag}</span>
                <X 
                  className="w-3 h-3 cursor-pointer" 
                  onClick={() => removeTag(tag)}
                />
              </Badge>
            ))}
          </div>
          <Input
            placeholder="Add tag and press Enter..."
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                addTag(e.currentTarget.value);
                e.currentTarget.value = '';
              }
            }}
          />
        </div>

        <Separator />

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <Button onClick={handleSearch} className="flex-1">
            <Search className="w-4 h-4 mr-2" />
            Search
          </Button>
          <Button variant="outline" onClick={clearFilters}>
            <Filter className="w-4 h-4 mr-2" />
            Clear All
          </Button>
        </div>

        {/* AI Suggestion */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <Sparkles className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm font-medium">AI Search Tip</p>
                <p className="text-sm text-muted-foreground">
                  Try searching for style descriptions like "casual summer look" or "professional office wear" 
                  for smarter results!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
};