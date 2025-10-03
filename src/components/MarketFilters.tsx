import { useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

export interface MarketFilters {
  search: string;
  category: string;
  minPrice: number;
  maxPrice: number;
  condition: string[];
  brands: string[];
  colors: string[];
  sizes: string[];
  sustainability: boolean;
  sortBy: 'recent' | 'price_low' | 'price_high' | 'popular';
}

interface MarketFiltersProps {
  filters: MarketFilters;
  onFiltersChange: (filters: MarketFilters) => void;
  availableBrands?: string[];
  availableColors?: string[];
}

export const MarketFiltersComponent = ({ 
  filters, 
  onFiltersChange,
  availableBrands = [],
  availableColors = []
}: MarketFiltersProps) => {
  const [localFilters, setLocalFilters] = useState(filters);

  const categories = ['All', 'Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Shoes', 'Accessories'];
  const conditions = ['New', 'Excellent', 'Good', 'Fair'];
  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  const updateFilters = (updates: Partial<MarketFilters>) => {
    const newFilters = { ...localFilters, ...updates };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    const defaultFilters: MarketFilters = {
      search: '',
      category: 'All',
      minPrice: 0,
      maxPrice: 1000,
      condition: [],
      brands: [],
      colors: [],
      sizes: [],
      sustainability: false,
      sortBy: 'recent'
    };
    setLocalFilters(defaultFilters);
    onFiltersChange(defaultFilters);
  };

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Price Range */}
      <div>
        <Label className="text-sm font-medium mb-2 block">Price Range</Label>
        <div className="space-y-2">
          <Slider
            value={[localFilters.minPrice, localFilters.maxPrice]}
            onValueChange={([min, max]) => updateFilters({ minPrice: min, maxPrice: max })}
            min={0}
            max={1000}
            step={10}
            className="my-4"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>${localFilters.minPrice}</span>
            <span>${localFilters.maxPrice}</span>
          </div>
        </div>
      </div>

      {/* Condition */}
      <div>
        <Label className="text-sm font-medium mb-2 block">Condition</Label>
        <div className="space-y-2">
          {conditions.map((cond) => (
            <div key={cond} className="flex items-center space-x-2">
              <Checkbox
                id={`condition-${cond}`}
                checked={localFilters.condition.includes(cond.toLowerCase())}
                onCheckedChange={(checked) => {
                  const newConditions = checked
                    ? [...localFilters.condition, cond.toLowerCase()]
                    : localFilters.condition.filter(c => c !== cond.toLowerCase());
                  updateFilters({ condition: newConditions });
                }}
              />
              <Label htmlFor={`condition-${cond}`} className="cursor-pointer">
                {cond}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Sizes */}
      <div>
        <Label className="text-sm font-medium mb-2 block">Sizes</Label>
        <div className="grid grid-cols-3 gap-2">
          {sizes.map((size) => (
            <Button
              key={size}
              variant={localFilters.sizes.includes(size) ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                const newSizes = localFilters.sizes.includes(size)
                  ? localFilters.sizes.filter(s => s !== size)
                  : [...localFilters.sizes, size];
                updateFilters({ sizes: newSizes });
              }}
            >
              {size}
            </Button>
          ))}
        </div>
      </div>

      {/* Brands */}
      {availableBrands.length > 0 && (
        <div>
          <Label className="text-sm font-medium mb-2 block">Brands</Label>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {availableBrands.map((brand) => (
              <div key={brand} className="flex items-center space-x-2">
                <Checkbox
                  id={`brand-${brand}`}
                  checked={localFilters.brands.includes(brand)}
                  onCheckedChange={(checked) => {
                    const newBrands = checked
                      ? [...localFilters.brands, brand]
                      : localFilters.brands.filter(b => b !== brand);
                    updateFilters({ brands: newBrands });
                  }}
                />
                <Label htmlFor={`brand-${brand}`} className="cursor-pointer">
                  {brand}
                </Label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Colors */}
      {availableColors.length > 0 && (
        <div>
          <Label className="text-sm font-medium mb-2 block">Colors</Label>
          <div className="flex flex-wrap gap-2">
            {availableColors.map((color) => (
              <Button
                key={color}
                variant={localFilters.colors.includes(color) ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  const newColors = localFilters.colors.includes(color)
                    ? localFilters.colors.filter(c => c !== color)
                    : [...localFilters.colors, color];
                  updateFilters({ colors: newColors });
                }}
              >
                {color}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Sustainability */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="sustainability"
          checked={localFilters.sustainability}
          onCheckedChange={(checked) => updateFilters({ sustainability: checked as boolean })}
        />
        <Label htmlFor="sustainability" className="cursor-pointer">
          Sustainable & Eco-Friendly Only
        </Label>
      </div>
    </div>
  );

  return (
    <Card className="p-4">
      <div className="space-y-4">
        {/* Search and Sort */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search items..."
              value={localFilters.search}
              onChange={(e) => updateFilters({ search: e.target.value })}
              className="pl-10"
            />
          </div>
          
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <SlidersHorizontal className="w-4 h-4" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <div className="mt-6 overflow-y-auto max-h-[calc(100vh-8rem)]">
                <FilterContent />
              </div>
              <div className="mt-4 space-y-2">
                <Button onClick={clearFilters} variant="outline" className="w-full">
                  Clear All
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={localFilters.category === cat ? 'default' : 'outline'}
              size="sm"
              onClick={() => updateFilters({ category: cat })}
              className="whitespace-nowrap"
            >
              {cat}
            </Button>
          ))}
        </div>

        {/* Sort By */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Sort by:</span>
          <Select
            value={localFilters.sortBy}
            onValueChange={(value: any) => updateFilters({ sortBy: value })}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="price_low">Price: Low to High</SelectItem>
              <SelectItem value="price_high">Price: High to Low</SelectItem>
              <SelectItem value="popular">Most Popular</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Active Filters Display */}
        {(localFilters.condition.length > 0 || localFilters.brands.length > 0 || 
          localFilters.colors.length > 0 || localFilters.sizes.length > 0) && (
          <div className="flex flex-wrap gap-2">
            {localFilters.condition.map((cond) => (
              <Button
                key={cond}
                variant="secondary"
                size="sm"
                onClick={() => updateFilters({ 
                  condition: localFilters.condition.filter(c => c !== cond) 
                })}
              >
                {cond}
                <X className="w-3 h-3 ml-1" />
              </Button>
            ))}
            {localFilters.sizes.map((size) => (
              <Button
                key={size}
                variant="secondary"
                size="sm"
                onClick={() => updateFilters({ 
                  sizes: localFilters.sizes.filter(s => s !== size) 
                })}
              >
                {size}
                <X className="w-3 h-3 ml-1" />
              </Button>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};
