import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Search, Filter, Heart } from "lucide-react";
import { useWardrobe } from "@/hooks/useWardrobe";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import AddItemWithMatching from "@/components/AddItemWithMatching";

interface WardrobeManagerProps {
  className?: string;
}

const WardrobeManager = ({ className }: WardrobeManagerProps) => {
  const { items, loading, refetch } = useWardrobe();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [addItemOpen, setAddItemOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  useEffect(() => {
    // Create sample items if none exist
    const initializeSampleData = async () => {
      if (items.length === 0 && !loading) {
        try {
          const { error } = await supabase.rpc('create_sample_wardrobe_items');
          if (error) {
            console.error('Error creating sample items:', error);
          } else {
            toast({
              title: "Welcome to your wardrobe!",
              description: "We've added some sample items to get you started.",
            });
            refetch(); // Refresh the items
          }
        } catch (error) {
          console.error('Error initializing sample data:', error);
        }
      }
    };

    initializeSampleData();
  }, [items.length, loading, refetch, toast]);

  const categories = ["all", "tops", "bottoms", "dresses", "outerwear", "shoes", "accessories"];
  
  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-64 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading your wardrobe...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">My Wardrobe</h2>
          <p className="text-muted-foreground">{items.length} items in your collection</p>
        </div>
        
        <Button 
          className="w-full sm:w-auto"
          onClick={() => setAddItemOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Item
        </Button>
        
        <AddItemWithMatching 
          open={addItemOpen} 
          onOpenChange={setAddItemOpen} 
        />
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search your wardrobe..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="whitespace-nowrap"
            >
              {category === "all" ? "All" : category.charAt(0).toUpperCase() + category.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Items Grid */}
      {filteredItems.length === 0 ? (
        <Card className="p-8">
          <div className="text-center space-y-4">
            <div className="text-4xl">👗</div>
            <h3 className="text-lg font-semibold">
              {searchQuery || selectedCategory !== "all" 
                ? "No items found" 
                : "Your wardrobe is empty"}
            </h3>
            <p className="text-muted-foreground">
              {searchQuery || selectedCategory !== "all"
                ? "Try adjusting your search or filter criteria"
                : "Add some clothing items to get started with your digital wardrobe"}
            </p>
            {!searchQuery && selectedCategory === "all" && (
              <Button onClick={() => setAddItemOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Item
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredItems.map((item) => (
            <Card key={item.id} className="group hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="aspect-square bg-muted rounded-lg mb-3 overflow-hidden">
                  {item.photos && typeof item.photos === 'object' && 'main' in item.photos ? (
                    <img
                      src={item.photos.main as string}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">
                      👕
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-sm leading-tight">{item.name}</h3>
                    {item.is_favorite && (
                      <Heart className="w-4 h-4 text-red-500 fill-current" />
                    )}
                  </div>
                  
                  {item.brand && (
                    <p className="text-xs text-muted-foreground">{item.brand}</p>
                  )}
                  
                  <div className="flex flex-wrap gap-1">
                    <Badge variant="secondary" className="text-xs">
                      {item.category}
                    </Badge>
                    {item.color && (
                      <Badge variant="outline" className="text-xs">
                        {item.color}
                      </Badge>
                    )}
                  </div>
                  
                  {item.purchase_price && (
                    <p className="text-xs font-medium">${item.purchase_price}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default WardrobeManager;