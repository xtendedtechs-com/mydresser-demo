import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Leaf, TrendingDown, Award, Target } from "lucide-react";
import { useWardrobe } from "@/hooks/useWardrobe";

interface CarbonMetrics {
  totalSaved: number;
  monthlyAverage: number;
  itemsReworn: number;
  sustainabilityScore: number;
  treesEquivalent: number;
  waterSaved: number;
}

export const CarbonFootprintTracker = () => {
  const { items } = useWardrobe();
  const [metrics, setMetrics] = useState<CarbonMetrics>({
    totalSaved: 0,
    monthlyAverage: 0,
    itemsReworn: 0,
    sustainabilityScore: 0,
    treesEquivalent: 0,
    waterSaved: 0,
  });

  useEffect(() => {
    // Calculate carbon metrics based on wardrobe usage
    const calculateMetrics = () => {
      const totalItems = items.length;
      const estimatedCO2PerItem = 15; // kg CO2 per new garment
      const rewearRate = 0.7; // 70% rewear rate assumed
      
      const totalSaved = totalItems * estimatedCO2PerItem * rewearRate;
      const monthlyAverage = totalSaved / 12;
      const itemsReworn = Math.floor(totalItems * rewearRate);
      const sustainabilityScore = Math.min(100, Math.floor(rewearRate * 100 + 20));
      const treesEquivalent = totalSaved / 21; // 21kg CO2 per tree/year
      const waterSaved = totalItems * 2700 * rewearRate; // liters

      setMetrics({
        totalSaved,
        monthlyAverage,
        itemsReworn,
        sustainabilityScore,
        treesEquivalent,
        waterSaved,
      });
    };

    calculateMetrics();
  }, [items]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Leaf className="h-5 w-5 text-green-600" />
          <CardTitle>Carbon Footprint Tracker</CardTitle>
        </div>
        <CardDescription>
          Your environmental impact through sustainable fashion choices
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Sustainability Score */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              <span className="font-semibold">Sustainability Score</span>
            </div>
            <span className="text-2xl font-bold text-green-600">
              {metrics.sustainabilityScore}
            </span>
          </div>
          <Progress value={metrics.sustainabilityScore} className="h-3" />
          <p className="text-xs text-muted-foreground">
            {metrics.sustainabilityScore >= 80
              ? "Excellent! You're a sustainability champion"
              : metrics.sustainabilityScore >= 60
              ? "Great work! Keep building sustainable habits"
              : "Good start! There's room to grow"}
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">CO₂ Saved</span>
            </div>
            <p className="text-2xl font-bold">{metrics.totalSaved.toFixed(1)}</p>
            <p className="text-xs text-muted-foreground">kg this year</p>
          </div>

          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Leaf className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Trees Saved</span>
            </div>
            <p className="text-2xl font-bold">{metrics.treesEquivalent.toFixed(1)}</p>
            <p className="text-xs text-muted-foreground">equivalent impact</p>
          </div>

          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Water Saved</span>
            </div>
            <p className="text-2xl font-bold">
              {(metrics.waterSaved / 1000).toFixed(1)}
            </p>
            <p className="text-xs text-muted-foreground">thousand liters</p>
          </div>

          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Award className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium">Items Reworn</span>
            </div>
            <p className="text-2xl font-bold">{metrics.itemsReworn}</p>
            <p className="text-xs text-muted-foreground">this month</p>
          </div>
        </div>

        {/* Monthly Impact */}
        <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Monthly Average</p>
              <p className="text-xs text-muted-foreground">CO₂ emissions prevented</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-green-600">
                {metrics.monthlyAverage.toFixed(1)}
              </p>
              <p className="text-xs text-muted-foreground">kg/month</p>
            </div>
          </div>
        </div>

        {/* Achievements */}
        <div className="space-y-2">
          <p className="text-sm font-semibold">Recent Achievements</p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Leaf className="h-3 w-3" />
              Eco Warrior
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Award className="h-3 w-3" />
              30-Day Streak
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              <TrendingDown className="h-3 w-3" />
              100kg CO₂ Saved
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
