import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, X } from "lucide-react";

interface StylePreferencesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const COMMON_COLORS = ["Black", "White", "Navy", "Gray", "Beige", "Brown", "Blue", "Red", "Green", "Pink"];
const COMMON_BRANDS = ["Zara", "H&M", "Nike", "Adidas", "Uniqlo", "Levi's", "Gap", "Ralph Lauren"];
const STYLE_KEYWORDS = ["Casual", "Formal", "Sporty", "Minimalist", "Vintage", "Bohemian", "Streetwear", "Classic"];
const OCCASIONS = ["Work", "Casual", "Party", "Sport", "Formal", "Travel", "Weekend"];

export const StylePreferencesDialog = ({ open, onOpenChange }: StylePreferencesDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(false);
  const { toast } = useToast();
  
  const [favoriteColors, setFavoriteColors] = useState<string[]>([]);
  const [favoriteBrands, setFavoriteBrands] = useState<string[]>([]);
  const [styleKeywords, setStyleKeywords] = useState<string[]>([]);
  const [preferredOccasions, setPreferredOccasions] = useState<string[]>([]);
  const [sustainabilityPriority, setSustainabilityPriority] = useState(50);
  const [newColor, setNewColor] = useState("");
  const [newBrand, setNewBrand] = useState("");

  useEffect(() => {
    if (open) {
      fetchPreferences();
    }
  }, [open]);

  const fetchPreferences = async () => {
    setFetchingData(true);
    try {
      const { data, error } = await supabase
        .from('style_preferences')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setFavoriteColors(data.favorite_colors || []);
        setFavoriteBrands(data.favorite_brands || []);
        setStyleKeywords(data.style_keywords || []);
        setPreferredOccasions(data.preferred_occasions || []);
        setSustainabilityPriority(data.sustainability_priority || 50);
      }
    } catch (error: any) {
      console.error('Error fetching preferences:', error);
    } finally {
      setFetchingData(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('style_preferences')
        .upsert({
          user_id: user.id,
          favorite_colors: favoriteColors,
          favorite_brands: favoriteBrands,
          style_keywords: styleKeywords,
          preferred_occasions: preferredOccasions,
          sustainability_priority: sustainabilityPriority,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Preferences saved",
        description: "Your style preferences have been updated.",
      });

      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error saving preferences",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleItem = (item: string, list: string[], setter: (list: string[]) => void) => {
    if (list.includes(item)) {
      setter(list.filter(i => i !== item));
    } else {
      setter([...list, item]);
    }
  };

  const addCustomItem = (value: string, list: string[], setter: (list: string[]) => void, clearInput: () => void) => {
    if (value.trim() && !list.includes(value.trim())) {
      setter([...list, value.trim()]);
      clearInput();
    }
  };

  if (fetchingData) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Style Preferences</DialogTitle>
          <DialogDescription>
            Customize your style preferences to get better outfit recommendations
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Favorite Colors */}
          <div className="space-y-3">
            <Label>Favorite Colors</Label>
            <div className="flex flex-wrap gap-2">
              {COMMON_COLORS.map((color) => (
                <Badge
                  key={color}
                  variant={favoriteColors.includes(color) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleItem(color, favoriteColors, setFavoriteColors)}
                >
                  {color}
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add custom color..."
                value={newColor}
                onChange={(e) => setNewColor(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    addCustomItem(newColor, favoriteColors, setFavoriteColors, () => setNewColor(""));
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => addCustomItem(newColor, favoriteColors, setFavoriteColors, () => setNewColor(""))}
              >
                Add
              </Button>
            </div>
            {favoriteColors.filter(c => !COMMON_COLORS.includes(c)).map((color) => (
              <Badge key={color} variant="secondary" className="mr-2">
                {color}
                <X
                  className="ml-1 h-3 w-3 cursor-pointer"
                  onClick={() => setFavoriteColors(favoriteColors.filter(c => c !== color))}
                />
              </Badge>
            ))}
          </div>

          {/* Favorite Brands */}
          <div className="space-y-3">
            <Label>Favorite Brands</Label>
            <div className="flex flex-wrap gap-2">
              {COMMON_BRANDS.map((brand) => (
                <Badge
                  key={brand}
                  variant={favoriteBrands.includes(brand) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleItem(brand, favoriteBrands, setFavoriteBrands)}
                >
                  {brand}
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add custom brand..."
                value={newBrand}
                onChange={(e) => setNewBrand(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    addCustomItem(newBrand, favoriteBrands, setFavoriteBrands, () => setNewBrand(""));
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => addCustomItem(newBrand, favoriteBrands, setFavoriteBrands, () => setNewBrand(""))}
              >
                Add
              </Button>
            </div>
          </div>

          {/* Style Keywords */}
          <div className="space-y-3">
            <Label>Style Keywords</Label>
            <div className="flex flex-wrap gap-2">
              {STYLE_KEYWORDS.map((keyword) => (
                <Badge
                  key={keyword}
                  variant={styleKeywords.includes(keyword) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleItem(keyword, styleKeywords, setStyleKeywords)}
                >
                  {keyword}
                </Badge>
              ))}
            </div>
          </div>

          {/* Preferred Occasions */}
          <div className="space-y-3">
            <Label>Preferred Occasions</Label>
            <div className="flex flex-wrap gap-2">
              {OCCASIONS.map((occasion) => (
                <Badge
                  key={occasion}
                  variant={preferredOccasions.includes(occasion) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleItem(occasion, preferredOccasions, setPreferredOccasions)}
                >
                  {occasion}
                </Badge>
              ))}
            </div>
          </div>

          {/* Sustainability Priority */}
          <div className="space-y-3">
            <Label>Sustainability Priority ({sustainabilityPriority}%)</Label>
            <Slider
              value={[sustainabilityPriority]}
              onValueChange={(value) => setSustainabilityPriority(value[0])}
              max={100}
              step={10}
            />
            <p className="text-xs text-muted-foreground">
              Higher values prioritize sustainable and eco-friendly recommendations
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Preferences"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
