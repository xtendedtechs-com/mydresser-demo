import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useWardrobe } from "@/hooks/useWardrobe";
import { useNavigate } from "react-router-dom";
import { ShoppingBag, AlertTriangle, CheckCircle2, TrendingUp, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface GapCategory {
  category: string;
  current: number;
  recommended: number;
  priority: "high" | "medium" | "low";
  suggestions: string[];
}

export const WardrobeGapAnalysis = () => {
  const { items } = useWardrobe();
  const navigate = useNavigate();
  const [gaps, setGaps] = useState<GapCategory[]>([]);

  useEffect(() => {
    if (!items) return;

    // Count items by category
    const categoryCounts: Record<string, number> = {};
    items.forEach(item => {
      categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
    });

    // Define ideal wardrobe composition
    const idealComposition: Record<string, { min: number; suggestions: string[] }> = {
      tops: { 
        min: 10, 
        suggestions: ["Basic t-shirts", "Button-down shirts", "Sweaters", "Blouses"]
      },
      bottoms: { 
        min: 8, 
        suggestions: ["Jeans", "Dress pants", "Casual pants", "Shorts"]
      },
      dresses: { 
        min: 3, 
        suggestions: ["Casual dress", "Formal dress", "Summer dress"]
      },
      outerwear: { 
        min: 5, 
        suggestions: ["Jacket", "Blazer", "Coat", "Cardigan"]
      },
      shoes: { 
        min: 6, 
        suggestions: ["Sneakers", "Formal shoes", "Boots", "Sandals"]
      },
      accessories: { 
        min: 4, 
        suggestions: ["Belt", "Scarf", "Hat", "Bag"]
      },
    };

    // Analyze gaps
    const analysis: GapCategory[] = Object.entries(idealComposition).map(([category, ideal]) => {
      const current = categoryCounts[category] || 0;
      const gap = ideal.min - current;
      const percentage = (current / ideal.min) * 100;

      let priority: GapCategory["priority"];
      if (percentage < 30) priority = "high";
      else if (percentage < 70) priority = "medium";
      else priority = "low";

      return {
        category,
        current,
        recommended: ideal.min,
        priority: gap > 0 ? priority : "low",
        suggestions: ideal.suggestions,
      };
    });

    setGaps(analysis.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }));
  }, [items]);

  const priorityConfig = {
    high: {
      label: "High Priority",
      color: "text-red-600",
      bg: "bg-red-100 dark:bg-red-950",
      border: "border-red-200 dark:border-red-800",
      icon: AlertTriangle,
    },
    medium: {
      label: "Medium Priority",
      color: "text-yellow-600",
      bg: "bg-yellow-100 dark:bg-yellow-950",
      border: "border-yellow-200 dark:border-yellow-800",
      icon: TrendingUp,
    },
    low: {
      label: "Well Stocked",
      color: "text-green-600",
      bg: "bg-green-100 dark:bg-green-950",
      border: "border-green-200 dark:border-green-800",
      icon: CheckCircle2,
    },
  };

  const highPriorityGaps = gaps.filter(g => g.priority === "high").length;
  const totalGaps = gaps.filter(g => g.current < g.recommended).length;

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card className={cn(
        "border-2",
        highPriorityGaps > 0 
          ? "border-red-200 dark:border-red-800" 
          : "border-green-200 dark:border-green-800"
      )}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Wardrobe Gap Analysis
          </CardTitle>
          <CardDescription>
            {totalGaps === 0 
              ? "Your wardrobe is well-balanced!" 
              : `${totalGaps} categories could use more items`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {highPriorityGaps > 0 ? (
            <div className="flex items-center gap-2 p-4 rounded-lg bg-red-50 dark:bg-red-950 text-red-900 dark:text-red-100">
              <AlertTriangle className="h-5 w-5 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-semibold text-sm">
                  {highPriorityGaps} high-priority {highPriorityGaps === 1 ? "gap" : "gaps"} detected
                </p>
                <p className="text-xs mt-1 opacity-80">
                  These categories are significantly under-represented in your wardrobe
                </p>
              </div>
              <Button 
                size="sm" 
                onClick={() => navigate("/market")}
                className="flex-shrink-0"
              >
                Shop Now
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2 p-4 rounded-lg bg-green-50 dark:bg-green-950 text-green-900 dark:text-green-100">
              <CheckCircle2 className="h-5 w-5" />
              <p className="text-sm font-medium">
                Your wardrobe has good variety across all categories!
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Gap Details */}
      <div className="space-y-4">
        {gaps.map((gap) => {
          const config = priorityConfig[gap.priority];
          const percentage = (gap.current / gap.recommended) * 100;
          const needsMore = gap.current < gap.recommended;
          
          return (
            <Card key={gap.category} className={cn("border", config.border)}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <config.icon className={cn("h-5 w-5", config.color)} />
                    <CardTitle className="text-base capitalize">
                      {gap.category}
                    </CardTitle>
                  </div>
                  <Badge variant="outline" className={cn(config.bg, config.color)}>
                    {config.label}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Current: {gap.current} items
                    </span>
                    <span className="text-muted-foreground">
                      Recommended: {gap.recommended}
                    </span>
                  </div>
                  <Progress 
                    value={Math.min(percentage, 100)} 
                    className={cn("h-2", percentage < 30 && "bg-red-200")}
                  />
                  <p className="text-xs text-muted-foreground">
                    {needsMore 
                      ? `Add ${gap.recommended - gap.current} more ${gap.category} for a balanced wardrobe`
                      : "This category is well-stocked"}
                  </p>
                </div>

                {/* Suggestions */}
                {needsMore && gap.suggestions.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Suggested items:</p>
                    <div className="flex flex-wrap gap-2">
                      {gap.suggestions.map((suggestion, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {suggestion}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                {needsMore && (
                  <div className="flex gap-2 pt-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex-1"
                      onClick={() => navigate(`/market?category=${gap.category}`)}
                    >
                      <ShoppingBag className="mr-2 h-4 w-4" />
                      Browse {gap.category}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex-1"
                      onClick={() => navigate("/ai-style-assistant")}
                    >
                      <Sparkles className="mr-2 h-4 w-4" />
                      Get AI Advice
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
