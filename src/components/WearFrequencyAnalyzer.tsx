import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useWardrobe } from "@/hooks/useWardrobe";
import { Calendar, TrendingUp, AlertCircle, Shirt, Package } from "lucide-react";
import { cn } from "@/lib/utils";

interface WearFrequencyData {
  itemId: string;
  itemName: string;
  category: string;
  wearCount: number;
  lastWorn: Date | null;
  costPerWear: number;
  frequency: "high" | "medium" | "low" | "never";
}

export const WearFrequencyAnalyzer = () => {
  const { items } = useWardrobe();
  const [wearData, setWearData] = useState<WearFrequencyData[]>([]);
  const [filter, setFilter] = useState<"all" | "high" | "medium" | "low" | "never">("all");

  useEffect(() => {
    if (!items) return;

    const analyzedData: WearFrequencyData[] = items.map((item) => {
      // Simulate wear count (in production, this would come from tracking data)
      const wearCount = Math.floor(Math.random() * 50);
      const daysSinceLastWorn = Math.floor(Math.random() * 90);
      const lastWorn = wearCount > 0 
        ? new Date(Date.now() - daysSinceLastWorn * 24 * 60 * 60 * 1000)
        : null;

      const costPerWear = wearCount > 0 && item.purchase_price
        ? item.purchase_price / wearCount
        : item.purchase_price || 0;

      let frequency: WearFrequencyData["frequency"];
      if (wearCount === 0) frequency = "never";
      else if (wearCount >= 20) frequency = "high";
      else if (wearCount >= 10) frequency = "medium";
      else frequency = "low";

      return {
        itemId: item.id,
        itemName: item.name,
        category: item.category,
        wearCount,
        lastWorn,
        costPerWear,
        frequency,
      };
    });

    setWearData(analyzedData.sort((a, b) => b.wearCount - a.wearCount));
  }, [items]);

  const filteredData = filter === "all" 
    ? wearData 
    : wearData.filter(item => item.frequency === filter);

  const stats = {
    high: wearData.filter(d => d.frequency === "high").length,
    medium: wearData.filter(d => d.frequency === "medium").length,
    low: wearData.filter(d => d.frequency === "low").length,
    never: wearData.filter(d => d.frequency === "never").length,
  };

  const frequencyConfig = {
    high: { label: "High Use", color: "text-green-600", bg: "bg-green-100 dark:bg-green-950", progress: 100 },
    medium: { label: "Medium Use", color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-950", progress: 60 },
    low: { label: "Low Use", color: "text-yellow-600", bg: "bg-yellow-100 dark:bg-yellow-950", progress: 30 },
    never: { label: "Never Worn", color: "text-red-600", bg: "bg-red-100 dark:bg-red-950", progress: 0 },
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(stats).map(([key, count]) => {
          const config = frequencyConfig[key as keyof typeof frequencyConfig];
          return (
            <Card key={key} className="cursor-pointer" onClick={() => setFilter(key as any)}>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className={cn("text-2xl font-bold", config.color)}>{count}</p>
                  <p className="text-xs text-muted-foreground mt-1">{config.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("all")}
        >
          All Items
        </Button>
        {Object.keys(frequencyConfig).map((key) => (
          <Button
            key={key}
            variant={filter === key ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(key as any)}
          >
            {frequencyConfig[key as keyof typeof frequencyConfig].label}
          </Button>
        ))}
      </div>

      {/* Items List */}
      <Card>
        <CardHeader>
          <CardTitle>Wear Frequency Details</CardTitle>
          <CardDescription>
            Track how often you wear each item and optimize your wardrobe
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {filteredData.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No items in this category</p>
            </div>
          ) : (
            filteredData.slice(0, 20).map((item) => {
              const config = frequencyConfig[item.frequency];
              return (
                <div key={item.itemId} className="space-y-2">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Shirt className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <p className="font-medium truncate">{item.itemName}</p>
                        <Badge variant="outline" className="text-xs">
                          {item.category}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          {item.wearCount} wears
                        </span>
                        {item.lastWorn && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {Math.floor((Date.now() - item.lastWorn.getTime()) / (1000 * 60 * 60 * 24))} days ago
                          </span>
                        )}
                        {item.costPerWear > 0 && (
                          <span className="font-medium">
                            ${item.costPerWear.toFixed(2)}/wear
                          </span>
                        )}
                      </div>
                    </div>
                    <Badge variant="secondary" className={cn("flex-shrink-0", config.bg, config.color)}>
                      {config.label}
                    </Badge>
                  </div>
                  <Progress value={config.progress} className="h-2" />
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* Recommendations */}
      {stats.never > 0 && (
        <Card className="border-yellow-200 dark:border-yellow-800">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <CardTitle className="text-base">Wardrobe Optimization</CardTitle>
            </div>
            <CardDescription>
              You have {stats.never} items you've never worn. Consider:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-sm space-y-2 list-disc list-inside text-muted-foreground">
              <li>Creating outfits with these items</li>
              <li>Listing unused items on 2ndDresser</li>
              <li>Donating items that don't fit your style</li>
              <li>Getting AI styling suggestions</li>
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
