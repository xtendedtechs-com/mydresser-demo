import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Loader2, Sparkles, TrendingUp, Users, Heart, ShoppingBag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useWardrobe } from "@/hooks/useWardrobe";
import { RecommendationEngine, RecommendationScore, UserPreferences, CollaborativeFiltering } from "@/services/recommendationEngine";
import { supabase } from "@/integrations/supabase/client";
import { getPrimaryPhotoUrl } from "@/utils/photoHelpers";

const PersonalizedRecommendations = () => {
  const { items: wardrobeItems } = useWardrobe();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [itemRecommendations, setItemRecommendations] = useState<RecommendationScore[]>([]);
  const [outfitRecommendations, setOutfitRecommendations] = useState<any[]>([]);
  const [collaborative, setCollaborative] = useState<CollaborativeFiltering | null>(null);
  const [recommendedItems, setRecommendedItems] = useState<any[]>([]);

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Learn user preferences
      const userPrefs = await RecommendationEngine.learnUserPreferences(user.id);
      setPreferences(userPrefs);

      // Get collaborative filtering data
      const collabData = await RecommendationEngine.findSimilarUsers(user.id);
      setCollaborative(collabData);

      // Generate item recommendations
      const itemRecs = await RecommendationEngine.generateItemRecommendations(user.id, wardrobeItems);
      setItemRecommendations(itemRecs);

      // Fetch full item details for top recommendations
      if (itemRecs.length > 0) {
        const topIds = itemRecs.slice(0, 10).map(r => r.itemId);
        const { data: items } = await supabase
          .from('merchant_items')
          .select('*')
          .in('id', topIds);
        
        if (items) {
          // Sort by recommendation score
          const sortedItems = topIds
            .map(id => items.find(i => i.id === id))
            .filter(Boolean);
          setRecommendedItems(sortedItems);
        }
      }

      // Generate outfit recommendations
      const outfitRecs = await RecommendationEngine.generatePersonalizedOutfits(
        user.id,
        wardrobeItems
      );
      setOutfitRecommendations(outfitRecs);

      toast({
        title: "Recommendations Updated",
        description: "Your personalized suggestions are ready!"
      });
    } catch (error) {
      console.error('Error loading recommendations:', error);
      toast({
        title: "Error",
        description: "Failed to load recommendations",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto" />
          <p className="text-muted-foreground">Analyzing your style preferences...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Preferences Overview */}
      {preferences && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold">Your Style Profile</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Favorite Colors</h3>
              <div className="flex flex-wrap gap-2">
                {preferences.favoriteColors.map(color => (
                  <Badge key={color} variant="secondary">{color}</Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Favorite Brands</h3>
              <div className="flex flex-wrap gap-2">
                {preferences.favoriteBrands.slice(0, 3).map(brand => (
                  <Badge key={brand} variant="secondary">{brand}</Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Preferred Styles</h3>
              <div className="flex flex-wrap gap-2">
                {preferences.preferredStyles.slice(0, 3).map(style => (
                  <Badge key={style} variant="secondary">{style}</Badge>
                ))}
              </div>
            </div>
          </div>

          {collaborative && collaborative.similarUsers.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>Found {collaborative.similarUsers.length} users with similar taste</span>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Recommendations Tabs */}
      <Tabs defaultValue="items" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="items">
            <ShoppingBag className="w-4 h-4 mr-2" />
            Items for You
          </TabsTrigger>
          <TabsTrigger value="outfits">
            <Sparkles className="w-4 h-4 mr-2" />
            Outfit Ideas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="items" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Recommended Items</h3>
            <Button variant="outline" size="sm" onClick={loadRecommendations}>
              <TrendingUp className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>

          {recommendedItems.length === 0 ? (
            <Card className="p-12">
              <div className="text-center space-y-2">
                <ShoppingBag className="w-12 h-12 mx-auto text-muted-foreground" />
                <p className="text-muted-foreground">No recommendations available yet</p>
                <p className="text-sm text-muted-foreground">
                  Add more items to your wardrobe to get personalized suggestions
                </p>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendedItems.map((item, idx) => {
                const rec = itemRecommendations.find(r => r.itemId === item.id);
                return (
                  <Card key={item.id} className="overflow-hidden">
                    <div className="aspect-square bg-muted relative">
                      {item.photos?.[0] && (
                        <img
                          src={getPrimaryPhotoUrl(item.photos, item.category)}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      )}
                      <Badge className="absolute top-2 right-2 bg-primary">
                        {rec?.confidence}% Match
                      </Badge>
                    </div>
                    <div className="p-4 space-y-3">
                      <div>
                        <h4 className="font-semibold line-clamp-1">{item.name}</h4>
                        {item.brand && (
                          <p className="text-sm text-muted-foreground">{item.brand}</p>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold">${item.price}</span>
                        {rec && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <TrendingUp className="w-4 h-4" />
                            {rec.score}
                          </div>
                        )}
                      </div>

                      {rec && rec.reasons.length > 0 && (
                        <div className="space-y-1">
                          <Progress value={rec.confidence} className="h-1" />
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {rec.reasons[0]}
                          </p>
                        </div>
                      )}

                      <Button className="w-full" size="sm">
                        View Details
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="outfits" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Personalized Outfit Ideas</h3>
            <Button variant="outline" size="sm" onClick={loadRecommendations}>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate New
            </Button>
          </div>

          {outfitRecommendations.length === 0 ? (
            <Card className="p-12">
              <div className="text-center space-y-2">
                <Sparkles className="w-12 h-12 mx-auto text-muted-foreground" />
                <p className="text-muted-foreground">No outfit ideas yet</p>
                <p className="text-sm text-muted-foreground">
                  Add at least 5 items to your wardrobe for outfit suggestions
                </p>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {outfitRecommendations.map((outfit, idx) => (
                <Card key={idx} className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold">{outfit.name}</h4>
                    <Badge variant="outline">{outfit.confidence}% Match</Badge>
                  </div>

                  <div className="flex items-center gap-4 mb-4">
                    {outfit.items.map((item: any) => (
                      <Avatar key={item.id} className="w-16 h-16 border-2">
                        <AvatarImage 
                          src={getPrimaryPhotoUrl(item.photos, item.category)} 
                          alt={item.name}
                        />
                        <AvatarFallback>{item.category[0]}</AvatarFallback>
                      </Avatar>
                    ))}
                  </div>

                  <p className="text-sm text-muted-foreground mb-4">
                    {outfit.reasoning}
                  </p>

                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {outfit.strategy}
                    </Badge>
                    <Button size="sm" className="ml-auto">
                      Try This Outfit
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PersonalizedRecommendations;
