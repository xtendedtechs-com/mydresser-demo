import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, TrendingUp, Package, Sparkles } from "lucide-react";
import { useWardrobe } from "@/hooks/useWardrobe";
import { useToast } from "@/hooks/use-toast";

const SmartClosetOrganizer = () => {
  const { items } = useWardrobe();
  const [seasonalItems, setSeasonalItems] = useState<any[]>([]);
  const [underutilized, setUnderutilized] = useState<any[]>([]);
  const [trending, setTrending] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (items.length > 0) {
      analyzeWardrobe();
    }
  }, [items]);

  const analyzeWardrobe = () => {
    const currentMonth = new Date().getMonth();
    
    // Seasonal recommendations
    const seasons = ['winter', 'spring', 'summer', 'fall'];
    const currentSeason = seasons[Math.floor(currentMonth / 3)];
    
    const seasonal = items.filter(item => 
      item.season?.toLowerCase().includes(currentSeason)
    );
    setSeasonalItems(seasonal);

    // Find underutilized items
    const underused = items
      .filter(item => item.wear_count < 3)
      .sort((a, b) => a.wear_count - b.wear_count)
      .slice(0, 10);
    setUnderutilized(underused);

    // Trending items (most worn recently)
    const recent = items
      .filter(item => item.last_worn)
      .sort((a, b) => new Date(b.last_worn!).getTime() - new Date(a.last_worn!).getTime())
      .slice(0, 10);
    setTrending(recent);
  };

  const getCategoryStats = () => {
    const categories = items.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(categories)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  };

  const getColorStats = () => {
    const colors = items
      .filter(item => item.color)
      .reduce((acc, item) => {
        const color = item.color!.toLowerCase();
        acc[color] = (acc[color] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    return Object.entries(colors)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  };

  const suggestDonations = () => {
    const suggestions = items.filter(item => 
      item.wear_count === 0 && 
      item.created_at && 
      new Date().getTime() - new Date(item.created_at).getTime() > 180 * 24 * 60 * 60 * 1000
    );

    toast({
      title: "Donation Suggestions",
      description: `Found ${suggestions.length} items you haven't worn in 6+ months`
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Smart Closet Organizer</h2>
          <p className="text-muted-foreground">AI-powered wardrobe insights</p>
        </div>
        <Button onClick={suggestDonations} variant="outline">
          <Package className="w-4 h-4 mr-2" />
          Donation Suggestions
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Package className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Items</p>
              <p className="text-2xl font-bold">{items.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10">
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Favorites</p>
              <p className="text-2xl font-bold">
                {items.filter(i => i.is_favorite).length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-yellow-500/10">
              <Sparkles className="w-5 h-5 text-yellow-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Underutilized</p>
              <p className="text-2xl font-bold">{underutilized.length}</p>
            </div>
          </div>
        </Card>
      </div>

      <Tabs defaultValue="seasonal">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="seasonal">Seasonal</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
        </TabsList>

        <TabsContent value="seasonal" className="space-y-4">
          <Card className="p-4">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Current Season Recommendations
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {seasonalItems.slice(0, 8).map((item) => (
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

        <TabsContent value="analytics" className="space-y-4">
          <Card className="p-4">
            <h3 className="font-semibold mb-4">Wardrobe Breakdown</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Top Categories</p>
                <div className="flex flex-wrap gap-2">
                  {getCategoryStats().map(([category, count]) => (
                    <Badge key={category} variant="secondary">
                      {category}: {count}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Top Colors</p>
                <div className="flex flex-wrap gap-2">
                  {getColorStats().map(([color, count]) => (
                    <Badge key={color} variant="outline">
                      {color}: {count}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="font-semibold mb-4">Wear Frequency</h3>
            <div className="space-y-2">
              {trending.slice(0, 5).map((item) => (
                <div key={item.id} className="flex items-center justify-between p-2 rounded-lg bg-muted">
                  <span className="text-sm">{item.name}</span>
                  <Badge>{item.wear_count} wears</Badge>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="suggestions" className="space-y-4">
          <Card className="p-4">
            <h3 className="font-semibold mb-4">Underutilized Items</h3>
            <p className="text-sm text-muted-foreground mb-4">
              These items could use more love!
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {underutilized.slice(0, 8).map((item) => (
                <div key={item.id} className="relative">
                  <div className="aspect-square rounded-lg overflow-hidden border">
                    <img
                      src={item.photos?.[0] || '/placeholder.svg'}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <Badge className="absolute top-2 right-2" variant="secondary">
                    {item.wear_count} wears
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SmartClosetOrganizer;
