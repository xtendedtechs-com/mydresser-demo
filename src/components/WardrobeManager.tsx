import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heart, Search, Plus, Loader2 } from "lucide-react";
import { useWardrobe } from "@/hooks/useWardrobe";
import AddItemWithMatching from "./AddItemWithMatching";
import { supabase } from "@/integrations/supabase/client";

interface WardrobeManagerProps {
  className?: string;
}

const WardrobeManager = ({ className }: WardrobeManagerProps) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const { items, loading, refetch } = useWardrobe();

  const categories = ["all", "tops", "bottoms", "dresses", "outerwear", "shoes", "accessories"];

  // Seed sample data if wardrobe appears too small
  useEffect(() => {
    const initializeSampleData = async () => {
      if (!loading && items.length < 8) {
        try {
          await supabase.rpc('ensure_minimum_sample_wardrobe_items', { min_count: 10 });
          refetch();
        } catch (error) {
          console.error('Error ensuring sample items:', error);
        }
      }
    };

    initializeSampleData();
  }, [loading, items.length, refetch]);

  const filteredItems = items.filter(item => {
    const matchesSearch = searchQuery === "" || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === "all" || 
      item.category.toLowerCase() === selectedCategory.toLowerCase();
    
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search and Filters */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search wardrobe items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map(category => (
              <SelectItem key={category} value={category}>
                {category === "all" ? "All Categories" : category.charAt(0).toUpperCase() + category.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Items Grid */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-12 space-y-4">
          <div className="text-muted-foreground">
            {items.length === 0 ? (
              <>
                <p className="text-lg font-medium">Your wardrobe is empty</p>
                <p className="text-sm">Add your first clothing item to get started!</p>
              </>
            ) : (
              <>
                <p className="text-lg font-medium">No items found</p>
                <p className="text-sm">Try adjusting your search or category filter</p>
              </>
            )}
          </div>
          <Button onClick={() => setShowAddDialog(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Item
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
              <Card 
                key={item.id} 
                className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/wardrobe-item/${item.id}`)}
              >
                <div className="space-y-3">
                  {/* Item Image */}
                  <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                    {item.photos && typeof item.photos === 'object' && item.photos.main ? (
                      <img
                        src={item.photos.main}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <div className="text-center">
                          <div className="text-2xl mb-2">👔</div>
                          <p className="text-xs">No photo</p>
                        </div>
                      </div>
                    )}
                  </div>

                {/* Item Details */}
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <h3 className="font-medium text-sm leading-tight">{item.name}</h3>
                    {item.is_favorite && (
                      <Heart className="w-4 h-4 text-red-500 fill-current flex-shrink-0" />
                    )}
                  </div>
                  
                  {item.brand && (
                    <p className="text-xs text-muted-foreground">{item.brand}</p>
                  )}
                  
                  <div className="flex flex-wrap gap-1">
                    <Badge variant="secondary" className="text-xs">
                      {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                    </Badge>
                    {item.color && (
                      <Badge variant="outline" className="text-xs">
                        {item.color}
                      </Badge>
                    )}
                  </div>

                  {item.purchase_price && (
                    <p className="text-xs font-medium text-primary">
                      ${item.purchase_price}
                    </p>
                  )}

                  {item.notes && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {item.notes}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <AddItemWithMatching 
        open={showAddDialog} 
        onOpenChange={setShowAddDialog}
      />
    </div>
  );
};

export default WardrobeManager;