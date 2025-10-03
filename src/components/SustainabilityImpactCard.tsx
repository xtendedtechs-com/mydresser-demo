import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Droplets, Leaf, Recycle, TrendingUp } from 'lucide-react';
import { useSustainability } from '@/hooks/useSustainability';

export const SustainabilityImpactCard = () => {
  const { metrics, getSustainabilityLevel } = useSustainability();

  if (!metrics) return null;

  const level = getSustainabilityLevel(metrics.circular_economy_score);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Leaf className="w-5 h-5 text-green-600" />
          Your Sustainability Impact
        </CardTitle>
        <CardDescription>
          Contributing to a circular fashion economy
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Circular Economy Score */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Circular Economy Score</span>
            <span className={`text-2xl font-bold ${level.color}`}>
              {level.icon} {metrics.circular_economy_score}
            </span>
          </div>
          <Progress value={metrics.circular_economy_score} className="h-2" />
          <p className="text-xs text-muted-foreground text-center">
            {level.label}
          </p>
        </div>

        {/* Impact Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Recycle className="w-4 h-4 text-green-600" />
              <span className="font-medium">Items Resold</span>
            </div>
            <p className="text-2xl font-bold">{metrics.items_resold}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <span className="font-medium">Secondhand Purchases</span>
            </div>
            <p className="text-2xl font-bold">{metrics.items_purchased_secondhand}</p>
          </div>
        </div>

        {/* Environmental Savings */}
        <div className="space-y-3 p-4 rounded-lg bg-green-50 dark:bg-green-950">
          <p className="text-sm font-semibold text-green-900 dark:text-green-100">
            Environmental Savings
          </p>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-green-700 dark:text-green-300">
                <Leaf className="w-4 h-4" />
                CO₂ Saved
              </span>
              <span className="font-bold text-green-900 dark:text-green-100">
                {metrics.co2_saved_kg.toFixed(1)} kg
              </span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                <Droplets className="w-4 h-4" />
                Water Saved
              </span>
              <span className="font-bold text-blue-900 dark:text-blue-100">
                {metrics.water_saved_liters.toLocaleString()} L
              </span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
                <Recycle className="w-4 h-4" />
                Waste Prevented
              </span>
              <span className="font-bold text-orange-900 dark:text-orange-100">
                {metrics.waste_prevented_kg.toFixed(1)} kg
              </span>
            </div>
          </div>
        </div>

        <p className="text-xs text-center text-muted-foreground">
          By participating in circular fashion, you're helping reduce the environmental impact of clothing production
        </p>
      </CardContent>
    </Card>
  );
};
