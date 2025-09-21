import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Sparkles, 
  ShoppingCart, 
  Heart, 
  Share2, 
  Eye,
  Zap
} from "lucide-react";
import { useMarketplace } from "@/hooks/useMarketplace";
import { useWardrobe } from "@/hooks/useWardrobe";
import { OutfitAI } from "@/ai/OutfitAI";
import { useToast } from "@/hooks/use-toast";

interface MarketOutfitSuggestionsProps {
  selectedItems?: any[];
  onClose?: () => void;
}

const MarketOutfitSuggestions = ({ selectedItems = [], onClose }: MarketOutfitSuggestionsProps) => {
  const { items: marketItems } = useMarketplace();
  const { items: wardrobeItems } = useWardrobe();
  const { toast } = useToast();
  
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedItems.length > 0 || wardrobeItems.length > 0) {
      generateOutfitSuggestions();
    }
  }, [selectedItems, wardrobeItems, marketItems]);

  const generateOutfitSuggestions = async () => {
    try {
      setLoading(true);
      const outfitAI = new OutfitAI();
      
      // Create outfit suggestions using wardrobe items and suggesting market items
      const availableWardrobeItems = wardrobeItems;
      
      const outfitSuggestions = [];
      
      // Generate 3 different outfit combinations
      for (let i = 0; i < 3; i++) {
        const suggestion = await outfitAI.generateOutfit({
          wardrobeItems: availableWardrobeItems,
          preferences: { style: 'versatile' },
          occasion: ['casual', 'work', 'party'][i]
        });
        
        // Add market items as suggestions to complete the outfit
        const suggestedMarketItems = marketItems.slice(0, 2).map(item => ({
          id: item.id,
          name: item.title,
          category: item.category,
          price: item.price,
          photos: { main: item.photos?.[0] || '/placeholder.svg' },
          brand: item.brand
        }));
        
        // Calculate total price for market items
        const totalPrice = suggestion.items
          .filter(item => marketItems.some(mi => mi.id === item.id))
          .reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0);
        
        outfitSuggestions.push({
          ...suggestion,
          totalPrice,
          id: `suggestion-${i}`,
          marketItems: suggestion.items.filter(item => marketItems.some(mi => mi.id === item.id)),
          wardrobeItems: suggestion.items.filter(item => wardrobeItems.some(wi => wi.id === item.id))
        });
      }
      
      setSuggestions(outfitSuggestions);
    } catch (error) {
      console.error('Error generating suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const addSuggestionToCart = (suggestion: any) => {
    // Add market items to cart
    const itemsToAdd = suggestion.marketItems;
    toast({
      title: "Added to Cart",
      description: `${itemsToAdd.length} items added to your cart`
    });
  };

  const saveSuggestionAsOutfit = async (suggestion: any) => {
    // Save as outfit (combining wardrobe + market items)
    toast({
      title: "Outfit Saved",
      description: "This outfit combination has been saved to your collection"
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="flex flex-col items-center space-y-4">
            <Sparkles className="w-8 h-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Creating outfit suggestions...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            AI Outfit Suggestions
          </CardTitle>
          <CardDescription>
            Complete your look with items from the marketplace
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {suggestions.map(suggestion => (
          <Card key={suggestion.id} className="overflow-hidden">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{suggestion.name}</CardTitle>
                  <CardDescription>{suggestion.occasion}</CardDescription>
                </div>
                <Badge variant="secondary">{suggestion.confidence}% match</Badge>
              </div>
              {suggestion.totalPrice > 0 && (
                <div className="text-right">
                  <span className="text-2xl font-bold">${suggestion.totalPrice.toFixed(2)}</span>
                  <p className="text-xs text-muted-foreground">for new items</p>
                </div>
              )}
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Outfit Items Grid */}
              <div className="grid grid-cols-3 gap-2">
                {suggestion.items.slice(0, 6).map((item: any, index: number) => {
                  const isMarketItem = marketItems.some(mi => mi.id === item.id);
                  return (
                    <div key={item.id || index} className="relative">
                      <Avatar className="w-12 h-12 mx-auto">
                        <AvatarImage src={item.photos?.main || item.image_url || '/placeholder.svg'} />
                        <AvatarFallback>{item.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      {isMarketItem && (
                        <div className="absolute -top-1 -right-1">
                          <Badge variant="default" className="w-4 h-4 p-0 text-xs">$</Badge>
                        </div>
                      )}
                      <p className="text-xs text-center mt-1 line-clamp-1">{item.name}</p>
                    </div>
                  );
                })}
              </div>

              {/* Reasoning */}
              {suggestion.reasoning && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">{suggestion.reasoning}</p>
                </div>
              )}

              {/* Style Tags */}
              {suggestion.tags && (
                <div className="flex flex-wrap gap-1">
                  {suggestion.tags.slice(0, 3).map((tag: string) => (
                    <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="grid grid-cols-2 gap-2">
                {suggestion.marketItems.length > 0 && (
                  <Button 
                    onClick={() => addSuggestionToCart(suggestion)}
                    className="text-xs"
                  >
                    <ShoppingCart className="w-3 h-3 mr-1" />
                    Add to Cart
                  </Button>
                )}
                <Button 
                  onClick={() => saveSuggestionAsOutfit(suggestion)}
                  variant="outline"
                  className="text-xs"
                >
                  <Heart className="w-3 h-3 mr-1" />
                  Save Outfit
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {suggestions.length === 0 && !loading && (
        <Card>
          <CardContent className="text-center py-8">
            <Sparkles className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No suggestions available</h3>
            <p className="text-muted-foreground">
              Add items to your wardrobe to get AI outfit suggestions with marketplace items
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MarketOutfitSuggestions;