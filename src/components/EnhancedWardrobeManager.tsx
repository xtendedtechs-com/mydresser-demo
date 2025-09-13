import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  Star, 
  Heart, 
  Calendar, 
  TrendingUp, 
  Shirt, 
  Palette, 
  Tag,
  BarChart3,
  PlusCircle,
  Camera,
  Scan,
  Sparkles,
  Archive,
  RefreshCw,
  SortAsc
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useWardrobe, WardrobeItem } from "@/hooks/useWardrobe";
import WardrobeItemCard from "@/components/WardrobeItemCard";

interface WardrobeAnalytics {
  totalItems: number;
  totalValue: number;
  averageWearCount: number;
  mostWornItem: WardrobeItem | null;
  leastWornItems: WardrobeItem[];
  colorDistribution: Record<string, number>;
  categoryDistribution: Record<string, number>;
  seasonalAnalysis: Record<string, number>;
  brandAnalysis: Record<string, number>;
  wearFrequency: Record<string, number>;
  costPerWear: Record<string, number>;
}

export const EnhancedWardrobeManager = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedColor, setSelectedColor] = useState("all");
  const [selectedSeason, setSelectedSeason] = useState("all");
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [analytics, setAnalytics] = useState<WardrobeAnalytics | null>(null);
  
  const { toast } = useToast();
  const { items, loading, addItem, updateItem, deleteItem } = useWardrobe();

  useEffect(() => {
    if (items.length > 0) {
      calculateAnalytics();
    }
  }, [items]);

  const calculateAnalytics = () => {
    const totalItems = items.length;
    const totalValue = items.reduce((sum, item) => sum + (item.purchase_price || 0), 0);
    const averageWearCount = items.reduce((sum, item) => sum + item.wear_count, 0) / totalItems;
    
    // Find most worn item
    const mostWornItem = items.reduce((prev, current) => 
      (prev.wear_count > current.wear_count) ? prev : current
    );

    // Find least worn items (wear count <= 2)
    const leastWornItems = items.filter(item => item.wear_count <= 2);

    // Color distribution
    const colorDistribution: Record<string, number> = {};
    items.forEach(item => {
      const color = item.color || 'Unknown';
      colorDistribution[color] = (colorDistribution[color] || 0) + 1;
    });

    // Category distribution
    const categoryDistribution: Record<string, number> = {};
    items.forEach(item => {
      categoryDistribution[item.category] = (categoryDistribution[item.category] || 0) + 1;
    });

    // Seasonal analysis
    const seasonalAnalysis: Record<string, number> = {};
    items.forEach(item => {
      const season = item.season || 'all-season';
      seasonalAnalysis[season] = (seasonalAnalysis[season] || 0) + 1;
    });

    // Brand analysis
    const brandAnalysis: Record<string, number> = {};
    items.forEach(item => {
      const brand = item.brand || 'Unknown';
      brandAnalysis[brand] = (brandAnalysis[brand] || 0) + 1;
    });

    // Wear frequency analysis
    const wearFrequency: Record<string, number> = {
      'Never worn': items.filter(item => item.wear_count === 0).length,
      'Rarely worn (1-2)': items.filter(item => item.wear_count >= 1 && item.wear_count <= 2).length,
      'Occasionally worn (3-10)': items.filter(item => item.wear_count >= 3 && item.wear_count <= 10).length,
      'Frequently worn (10+)': items.filter(item => item.wear_count > 10).length,
    };

    // Cost per wear analysis
    const costPerWear: Record<string, number> = {};
    items.forEach(item => {
      if (item.purchase_price && item.wear_count > 0) {
        const cpw = item.purchase_price / item.wear_count;
        const range = cpw < 1 ? '<$1' : cpw < 5 ? '$1-5' : cpw < 10 ? '$5-10' : cpw < 25 ? '$10-25' : '$25+';
        costPerWear[range] = (costPerWear[range] || 0) + 1;
      }
    });

    setAnalytics({
      totalItems,
      totalValue,
      averageWearCount,
      mostWornItem,
      leastWornItems,
      colorDistribution,
      categoryDistribution,
      seasonalAnalysis,
      brandAnalysis,
      wearFrequency,
      costPerWear
    });
  };

  const getFilteredAndSortedItems = () => {
    let filtered = items.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (item.brand?.toLowerCase().includes(searchTerm.toLowerCase())) ||
                           (item.color?.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
      const matchesColor = selectedColor === "all" || item.color === selectedColor;
      const matchesSeason = selectedSeason === "all" || item.season === selectedSeason;
      const matchesBrand = selectedBrand === "all" || item.brand === selectedBrand;

      return matchesSearch && matchesCategory && matchesColor && matchesSeason && matchesBrand;
    });

    // Sort items
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "recent": return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case "oldest": return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case "worn-most": return b.wear_count - a.wear_count;
        case "worn-least": return a.wear_count - b.wear_count;
        case "price-high": return (b.purchase_price || 0) - (a.purchase_price || 0);
        case "price-low": return (a.purchase_price || 0) - (b.purchase_price || 0);
        case "name": return a.name.localeCompare(b.name);
        case "favorites": return (b.is_favorite ? 1 : 0) - (a.is_favorite ? 1 : 0);
        default: return 0;
      }
    });

    return filtered;
  };

  const getUniqueValues = (field: keyof WardrobeItem) => {
    const values = [...new Set(items.map(item => item[field]).filter(Boolean))];
    return values.sort();
  };

  const handleBulkAction = async (action: string, selectedItems: string[]) => {
    try {
      switch (action) {
        case "favorite":
          for (const itemId of selectedItems) {
            await updateItem(itemId, { is_favorite: true });
          }
          toast({ title: `${selectedItems.length} items added to favorites` });
          break;
        case "archive":
          // Archive functionality would be implemented here
          toast({ title: `${selectedItems.length} items archived` });
          break;
        case "delete":
          for (const itemId of selectedItems) {
            await deleteItem(itemId);
          }
          toast({ title: `${selectedItems.length} items deleted` });
          break;
      }
    } catch (error) {
      toast({ title: "Bulk action failed", variant: "destructive" });
    }
  };

  const filteredItems = getFilteredAndSortedItems();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Wardrobe</h1>
          <p className="text-muted-foreground">{items.length} items in your collection</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setShowAnalytics(!showAnalytics)}
            className="gap-2"
          >
            <BarChart3 className="w-4 h-4" />
            Analytics
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <PlusCircle className="w-4 h-4" />
                Add Item
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Item</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Button variant="outline" className="w-full gap-2">
                  <Camera className="w-4 h-4" />
                  Take Photo
                </Button>
                <Button variant="outline" className="w-full gap-2">
                  <Scan className="w-4 h-4" />
                  Scan Barcode/QR
                </Button>
                <Button variant="outline" className="w-full gap-2">
                  <Sparkles className="w-4 h-4" />
                  AI Recognition
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Analytics Panel */}
      {showAnalytics && analytics && (
        <Card className="bg-gradient-to-r from-primary/5 to-accent/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Wardrobe Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{analytics.totalItems}</div>
                <div className="text-sm text-muted-foreground">Total Items</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">${analytics.totalValue.toFixed(0)}</div>
                <div className="text-sm text-muted-foreground">Total Value</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{analytics.averageWearCount.toFixed(1)}</div>
                <div className="text-sm text-muted-foreground">Avg Wear Count</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{analytics.leastWornItems.length}</div>
                <div className="text-sm text-muted-foreground">Underused Items</div>
              </div>
            </div>

            <Tabs defaultValue="colors" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="colors">Colors</TabsTrigger>
                <TabsTrigger value="categories">Categories</TabsTrigger>
                <TabsTrigger value="seasons">Seasons</TabsTrigger>
                <TabsTrigger value="brands">Brands</TabsTrigger>
                <TabsTrigger value="usage">Usage</TabsTrigger>
              </TabsList>
              
              <TabsContent value="colors" className="space-y-2">
                {Object.entries(analytics.colorDistribution).map(([color, count]) => (
                  <div key={color} className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full border bg-${color.toLowerCase()}-500`} />
                      <span>{color}</span>
                    </div>
                    <Badge variant="secondary">{count}</Badge>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="categories" className="space-y-2">
                {Object.entries(analytics.categoryDistribution).map(([category, count]) => (
                  <div key={category} className="flex justify-between items-center">
                    <span className="capitalize">{category}</span>
                    <Badge variant="secondary">{count}</Badge>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="seasons" className="space-y-2">
                {Object.entries(analytics.seasonalAnalysis).map(([season, count]) => (
                  <div key={season} className="flex justify-between items-center">
                    <span className="capitalize">{season}</span>
                    <Badge variant="secondary">{count}</Badge>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="brands" className="space-y-2">
                {Object.entries(analytics.brandAnalysis).slice(0, 10).map(([brand, count]) => (
                  <div key={brand} className="flex justify-between items-center">
                    <span>{brand}</span>
                    <Badge variant="secondary">{count}</Badge>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="usage" className="space-y-2">
                {Object.entries(analytics.wearFrequency).map(([range, count]) => (
                  <div key={range} className="flex justify-between items-center">
                    <span>{range}</span>
                    <Badge variant="secondary">{count}</Badge>
                  </div>
                ))}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, brand, color, or material..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {getUniqueValues('category').map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedColor} onValueChange={setSelectedColor}>
                <SelectTrigger>
                  <SelectValue placeholder="Color" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Colors</SelectItem>
                  {getUniqueValues('color').map(color => (
                    <SelectItem key={color} value={color}>{color}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedSeason} onValueChange={setSelectedSeason}>
                <SelectTrigger>
                  <SelectValue placeholder="Season" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Seasons</SelectItem>
                  {getUniqueValues('season').map(season => (
                    <SelectItem key={season} value={season}>{season}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                <SelectTrigger>
                  <SelectValue placeholder="Brand" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Brands</SelectItem>
                  {getUniqueValues('brand').map(brand => (
                    <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Recently Added</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="worn-most">Most Worn</SelectItem>
                  <SelectItem value="worn-least">Least Worn</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="name">Name A-Z</SelectItem>
                  <SelectItem value="favorites">Favorites First</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex gap-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("list")}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Items Grid/List */}
      <div className={viewMode === "grid" 
        ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        : "space-y-4"
      }>
        {filteredItems.map((item) => (
          <WardrobeItemCard 
            key={item.id} 
            item={item} 
            onToggleFavorite={(id, isFavorite) => updateItem(id, { is_favorite: isFavorite })}
            onMarkAsWorn={(id) => updateItem(id, { 
              last_worn: new Date().toISOString(),
              wear_count: item.wear_count + 1 
            })}
            onEdit={(item) => {
              toast({ title: "Edit functionality", description: "Item editing coming soon!" });
            }}
            onDelete={deleteItem}
            onView={(item) => {
              toast({ title: "View details", description: `Viewing ${item.name}` });
            }}
          />
        ))}
      </div>

      {filteredItems.length === 0 && (
        <Card className="p-8 text-center">
          <div className="space-y-4">
            <Shirt className="w-12 h-12 mx-auto text-muted-foreground" />
            <div>
              <h3 className="font-semibold">No items found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search or filter criteria
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default EnhancedWardrobeManager;