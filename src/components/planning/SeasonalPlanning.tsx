import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Cloud, ShoppingBag, Archive, Trash2, Lightbulb } from "lucide-react";
import { useWardrobe } from "@/hooks/useWardrobe";
import { seasonalPlanning, SeasonalRecommendation } from "@/services/seasonalPlanning";
import { useToast } from "@/hooks/use-toast";

const SeasonalPlanning = () => {
  const { items } = useWardrobe();
  const [recommendations, setRecommendations] = useState<SeasonalRecommendation | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (items.length > 0) {
      generateRecommendations();
    }
  }, [items]);

  const generateRecommendations = () => {
    setLoading(true);
    try {
      const recs = seasonalPlanning.getSeasonalRecommendations(items);
      setRecommendations(recs);
    } catch (error) {
      console.error('Seasonal planning error:', error);
      toast({
        title: "Planning Failed",
        description: "Could not generate seasonal recommendations",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getSeasonIcon = (season: string) => {
    const icons: Record<string, string> = {
      spring: '🌸',
      summer: '☀️',
      fall: '🍂',
      winter: '❄️'
    };
    return icons[season] || '🌍';
  };

  const purchasePriorities = recommendations 
    ? seasonalPlanning.getPurchasePriorities(items, 500)
    : [];

  const storageTips = recommendations
    ? seasonalPlanning.getStorageTips(recommendations.season)
    : [];

  if (loading) {
    return (
      <Card className="p-8">
        <div className="text-center">
          <p className="text-muted-foreground">Analyzing your wardrobe...</p>
        </div>
      </Card>
    );
  }

  if (!recommendations) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            {getSeasonIcon(recommendations.season)}
            Seasonal Planning
          </h2>
          <p className="text-muted-foreground">Smart wardrobe management for {recommendations.season}</p>
        </div>
        <Button onClick={generateRecommendations} variant="outline">
          <Cloud className="w-4 h-4 mr-2" />
          Refresh Analysis
        </Button>
      </div>

      {/* Season Overview */}
      <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10">
        <h3 className="font-semibold mb-2">Season Insights</h3>
        <p className="text-sm text-muted-foreground">{recommendations.reasoning}</p>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10">
              <Archive className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Keep Active</p>
              <p className="text-2xl font-bold">{recommendations.itemsToKeep.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Archive className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Store Away</p>
              <p className="text-2xl font-bold">{recommendations.itemsToStore.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-500/10">
              <Trash2 className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Donate</p>
              <p className="text-2xl font-bold">{recommendations.itemsToDonate.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-yellow-500/10">
              <ShoppingBag className="w-5 h-5 text-yellow-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">To Buy</p>
              <p className="text-2xl font-bold">{recommendations.itemsToBuy.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Detailed Recommendations */}
      <Tabs defaultValue="shopping">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="shopping">Shopping List</TabsTrigger>
          <TabsTrigger value="storage">Storage Tips</TabsTrigger>
          <TabsTrigger value="donate">Donate</TabsTrigger>
        </TabsList>

        <TabsContent value="shopping" className="space-y-4">
          <Card className="p-4">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5" />
              Recommended Purchases
            </h3>
            <div className="space-y-3">
              {purchasePriorities.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">{item.item}</span>
                    <Badge 
                      variant={
                        item.priority === 'high' ? 'destructive' :
                        item.priority === 'medium' ? 'default' : 'secondary'
                      }
                    >
                      {item.priority} priority
                    </Badge>
                  </div>
                  <span className="text-sm text-muted-foreground">~${item.estimatedCost}</span>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="storage" className="space-y-4">
          <Card className="p-4">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Lightbulb className="w-5 h-5" />
              Storage Best Practices
            </h3>
            <ul className="space-y-2">
              {storageTips.map((tip, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <span className="text-primary mt-1">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-4">
            <h3 className="font-semibold mb-4">Items to Store</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {recommendations.itemsToStore.slice(0, 8).map((item) => (
                <div key={item.id} className="aspect-square rounded-lg overflow-hidden border">
                  <img
                    src={item.photos?.[0] || '/placeholder.svg'}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="donate" className="space-y-4">
          <Card className="p-4">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Trash2 className="w-5 h-5" />
              Donation Suggestions
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              These items haven't been worn in 6+ months. Consider donating them to make space for items you'll actually use.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {recommendations.itemsToDonate.map((item) => (
                <div key={item.id} className="relative group">
                  <div className="aspect-square rounded-lg overflow-hidden border">
                    <img
                      src={item.photos?.[0] || '/placeholder.svg'}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Badge variant="secondary">{item.wear_count} wears</Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SeasonalPlanning;
