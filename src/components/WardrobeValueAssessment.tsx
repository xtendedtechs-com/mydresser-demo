import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useWardrobe } from "@/hooks/useWardrobe";
import { DollarSign, TrendingUp, TrendingDown, Package, Sparkles, PieChart } from "lucide-react";
import { cn } from "@/lib/utils";

interface CategoryValue {
  category: string;
  totalValue: number;
  itemCount: number;
  averageValue: number;
  percentage: number;
}

export const WardrobeValueAssessment = () => {
  const { items } = useWardrobe();
  const [totalValue, setTotalValue] = useState(0);
  const [categoryValues, setCategoryValues] = useState<CategoryValue[]>([]);
  const [estimatedCurrentValue, setEstimatedCurrentValue] = useState(0);

  useEffect(() => {
    if (!items) return;

    // Calculate total purchase value
    const total = items.reduce((sum, item) => sum + (item.purchase_price || 0), 0);
    setTotalValue(total);

    // Estimate current value (typically 30-50% of purchase price for clothing)
    const estimated = total * 0.4;
    setEstimatedCurrentValue(estimated);

    // Calculate by category
    const categoryMap = new Map<string, { value: number; count: number }>();
    
    items.forEach(item => {
      const existing = categoryMap.get(item.category) || { value: 0, count: 0 };
      categoryMap.set(item.category, {
        value: existing.value + (item.purchase_price || 0),
        count: existing.count + 1,
      });
    });

    const categories: CategoryValue[] = Array.from(categoryMap.entries()).map(([category, data]) => ({
      category,
      totalValue: data.value,
      itemCount: data.count,
      averageValue: data.value / data.count,
      percentage: (data.value / total) * 100,
    }));

    setCategoryValues(categories.sort((a, b) => b.totalValue - a.totalValue));
  }, [items]);

  const stats = [
    {
      label: "Total Investment",
      value: `$${totalValue.toFixed(2)}`,
      description: "Original purchase value",
      icon: DollarSign,
      color: "text-blue-600",
    },
    {
      label: "Estimated Value",
      value: `$${estimatedCurrentValue.toFixed(2)}`,
      description: "Current resale value",
      icon: TrendingDown,
      color: "text-orange-600",
    },
    {
      label: "Total Items",
      value: items?.length || 0,
      description: "In your wardrobe",
      icon: Package,
      color: "text-purple-600",
    },
    {
      label: "Avg. Item Value",
      value: items?.length ? `$${(totalValue / items.length).toFixed(2)}` : "$0",
      description: "Per item",
      icon: Sparkles,
      color: "text-green-600",
    },
  ];

  const depreciationRate = ((totalValue - estimatedCurrentValue) / totalValue) * 100;

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <stat.icon className={cn("h-5 w-5", stat.color)} />
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
              <p className="text-xs text-muted-foreground opacity-75">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Depreciation Insight */}
      <Card className="border-orange-200 dark:border-orange-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingDown className="h-5 w-5 text-orange-600" />
            Value Depreciation
          </CardTitle>
          <CardDescription>
            Your wardrobe has depreciated by approximately {depreciationRate.toFixed(1)}%
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={depreciationRate} className="h-3 mb-4" />
          <div className="text-sm text-muted-foreground space-y-2">
            <p>💡 <strong>Tip:</strong> Consider selling rarely-worn items on 2ndDresser to recoup value</p>
            <p>📊 Average clothing retains 30-50% of purchase value after one year</p>
          </div>
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5 text-primary" />
            Value by Category
          </CardTitle>
          <CardDescription>
            See where your wardrobe investment is distributed
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {categoryValues.map((cat) => (
            <div key={cat.category} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium capitalize">{cat.category}</p>
                    <Badge variant="outline" className="text-xs">
                      {cat.itemCount} items
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>${cat.totalValue.toFixed(2)} total</span>
                    <span>${cat.averageValue.toFixed(2)} avg</span>
                  </div>
                </div>
                <Badge variant="secondary">
                  {cat.percentage.toFixed(1)}%
                </Badge>
              </div>
              <Progress value={cat.percentage} className="h-2" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">💰 Value Optimization Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="text-sm space-y-2 text-muted-foreground list-disc list-inside">
            <li>List high-value, rarely-worn items on 2ndDresser marketplace</li>
            <li>Focus on cost-per-wear to maximize value from each purchase</li>
            <li>Invest in versatile pieces that work with multiple outfits</li>
            <li>Consider quality over quantity for better long-term value</li>
            <li>Maintain items properly to preserve resale value</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};
