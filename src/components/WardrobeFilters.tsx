import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface FilterOptions {
  categories: string[];
  colors: string[];
  brands: string[];
  seasons: string[];
  conditions: string[];
  priceRange: [number, number];
}

interface WardrobeFiltersProps {
  onFilterChange: (filters: FilterOptions) => void;
  activeFilters: FilterOptions;
}

export const WardrobeFilters = ({ onFilterChange, activeFilters }: WardrobeFiltersProps) => {
  const categories = [
    { id: 'tops', label: 'Tops' },
    { id: 'bottoms', label: 'Bottoms' },
    { id: 'dresses', label: 'Dresses' },
    { id: 'outerwear', label: 'Outerwear' },
    { id: 'shoes', label: 'Shoes' },
    { id: 'accessories', label: 'Accessories' },
  ];

  const colors = [
    { id: 'black', label: 'Black', color: '#000000' },
    { id: 'white', label: 'White', color: '#FFFFFF' },
    { id: 'red', label: 'Red', color: '#FF0000' },
    { id: 'blue', label: 'Blue', color: '#0000FF' },
    { id: 'green', label: 'Green', color: '#00FF00' },
    { id: 'yellow', label: 'Yellow', color: '#FFFF00' },
    { id: 'gray', label: 'Gray', color: '#808080' },
    { id: 'brown', label: 'Brown', color: '#8B4513' },
  ];

  const seasons = [
    { id: 'spring', label: 'Spring' },
    { id: 'summer', label: 'Summer' },
    { id: 'fall', label: 'Fall' },
    { id: 'winter', label: 'Winter' },
    { id: 'all-season', label: 'All Season' },
  ];

  const conditions = [
    { id: 'excellent', label: 'Excellent' },
    { id: 'good', label: 'Good' },
    { id: 'fair', label: 'Fair' },
  ];

  const hasActiveFilters = 
    activeFilters.categories.length > 0 ||
    activeFilters.colors.length > 0 ||
    activeFilters.seasons.length > 0 ||
    activeFilters.conditions.length > 0;

  const clearAllFilters = () => {
    onFilterChange({
      categories: [],
      colors: [],
      brands: [],
      seasons: [],
      conditions: [],
      priceRange: [0, 1000],
    });
  };

  return (
    <Card>
      <CardContent className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Filters</h3>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearAllFilters}>
              <X className="h-4 w-4 mr-1" />
              Clear All
            </Button>
          )}
        </div>

        {/* Active Filters */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2">
            {activeFilters.categories.map((cat) => (
              <Badge key={cat} variant="secondary">
                {cat}
                <X className="h-3 w-3 ml-1 cursor-pointer" />
              </Badge>
            ))}
            {activeFilters.colors.map((color) => (
              <Badge key={color} variant="secondary">
                {color}
                <X className="h-3 w-3 ml-1 cursor-pointer" />
              </Badge>
            ))}
          </div>
        )}

        {/* Categories */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Categories</Label>
          <div className="space-y-2">
            {categories.map((category) => (
              <div key={category.id} className="flex items-center space-x-2">
                <Checkbox id={category.id} />
                <label
                  htmlFor={category.id}
                  className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {category.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Colors */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Colors</Label>
          <div className="grid grid-cols-4 gap-2">
            {colors.map((color) => (
              <div
                key={color.id}
                className="flex flex-col items-center gap-1 cursor-pointer"
              >
                <div
                  className="w-10 h-10 rounded-full border-2 border-border"
                  style={{ backgroundColor: color.color }}
                />
                <span className="text-xs">{color.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Seasons */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Seasons</Label>
          <div className="space-y-2">
            {seasons.map((season) => (
              <div key={season.id} className="flex items-center space-x-2">
                <Checkbox id={season.id} />
                <label
                  htmlFor={season.id}
                  className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {season.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Condition */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Condition</Label>
          <div className="space-y-2">
            {conditions.map((condition) => (
              <div key={condition.id} className="flex items-center space-x-2">
                <Checkbox id={condition.id} />
                <label
                  htmlFor={condition.id}
                  className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {condition.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Price Range */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Price Range</Label>
          <Slider
            defaultValue={[0, 1000]}
            max={1000}
            step={10}
            className="w-full"
          />
          <div className="flex items-center justify-between text-sm text-text-muted">
            <span>$0</span>
            <span>$1000+</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
