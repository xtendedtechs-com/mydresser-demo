import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, DollarSign, Calendar, Shirt } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface WardrobeStats {
  totalItems: number;
  totalValue: number;
  costPerWear: number;
  mostWornCategory: string;
  seasonalDistribution: Record<string, number>;
  colorDistribution: Record<string, number>;
}

export const WardrobeAnalyticsCard = () => {
  const [stats, setStats] = useState<WardrobeStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: items } = await supabase
        .from("wardrobe_items")
        .select("*")
        .eq("user_id", user.id);

      if (items) {
        const totalItems = items.length;
        const totalValue = items.reduce(
          (sum, item) => sum + (item.purchase_price || 0),
          0
        );

        // Calculate category distribution
        const categoryCount: Record<string, number> = {};
        items.forEach((item) => {
          categoryCount[item.category] = (categoryCount[item.category] || 0) + 1;
        });

        const mostWornCategory =
          Object.entries(categoryCount).sort(([, a], [, b]) => b - a)[0]?.[0] || "N/A";

        // Calculate seasonal distribution
        const seasonalDist: Record<string, number> = {};
        items.forEach((item) => {
          if (item.season) {
            seasonalDist[item.season] = (seasonalDist[item.season] || 0) + 1;
          }
        });

        // Calculate color distribution
        const colorDist: Record<string, number> = {};
        items.forEach((item) => {
          if (item.color) {
            colorDist[item.color] = (colorDist[item.color] || 0) + 1;
          }
        });

        // Estimate cost per wear (assuming average wear count)
        const estimatedWears = totalItems * 10; // Assume 10 wears per item average
        const costPerWear = totalValue / (estimatedWears || 1);

        setStats({
          totalItems,
          totalValue,
          costPerWear,
          mostWornCategory,
          seasonalDistribution: seasonalDist,
          colorDistribution: colorDist,
        });
      }
    } catch (error) {
      console.error("Error loading analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Wardrobe Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading analytics...</p>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Wardrobe Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No data available</p>
        </CardContent>
      </Card>
    );
  }

  const topColors = Object.entries(stats.colorDistribution)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const topSeasons = Object.entries(stats.seasonalDistribution)
    .sort(([, a], [, b]) => b - a);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Wardrobe Analytics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overview Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Shirt className="h-4 w-4" />
              <span className="text-sm">Total Items</span>
            </div>
            <p className="text-2xl font-bold">{stats.totalItems}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <DollarSign className="h-4 w-4" />
              <span className="text-sm">Total Value</span>
            </div>
            <p className="text-2xl font-bold">${stats.totalValue.toFixed(0)}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm">Cost Per Wear</span>
            </div>
            <p className="text-2xl font-bold">${stats.costPerWear.toFixed(2)}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span className="text-sm">Most Worn</span>
            </div>
            <Badge variant="secondary" className="text-sm">
              {stats.mostWornCategory}
            </Badge>
          </div>
        </div>

        {/* Color Distribution */}
        <div className="space-y-3">
          <h4 className="font-semibold text-sm">Top Colors</h4>
          {topColors.map(([color, count]) => (
            <div key={color} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="capitalize">{color}</span>
                <span className="text-muted-foreground">
                  {count} items ({((count / stats.totalItems) * 100).toFixed(0)}%)
                </span>
              </div>
              <Progress value={(count / stats.totalItems) * 100} />
            </div>
          ))}
        </div>

        {/* Seasonal Distribution */}
        <div className="space-y-3">
          <h4 className="font-semibold text-sm">Seasonal Breakdown</h4>
          <div className="flex flex-wrap gap-2">
            {topSeasons.map(([season, count]) => (
              <Badge key={season} variant="outline">
                {season}: {count}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
