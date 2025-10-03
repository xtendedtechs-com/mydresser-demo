import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Leaf, 
  Recycle, 
  TrendingUp, 
  Award,
  ShoppingBag,
  DollarSign,
  Target
} from "lucide-react";

interface SustainabilityMetrics {
  itemsRescued: number;
  co2Saved: number;
  waterSaved: number;
  wasteReduced: number;
  moneySaved: number;
  sustainabilityScore: number;
}

interface SustainabilityImpactCardProps {
  metrics?: SustainabilityMetrics;
}

export const SustainabilityImpactCard = ({ 
  metrics = {
    itemsRescued: 0,
    co2Saved: 0,
    waterSaved: 0,
    wasteReduced: 0,
    moneySaved: 0,
    sustainabilityScore: 0
  }
}: SustainabilityImpactCardProps) => {
  const impactData = [
    {
      icon: Recycle,
      label: "Items Rescued",
      value: metrics.itemsRescued,
      unit: "items",
      color: "text-green-500",
      description: "Clothing items saved from landfill"
    },
    {
      icon: Leaf,
      label: "CO₂ Saved",
      value: metrics.co2Saved,
      unit: "kg",
      color: "text-emerald-500",
      description: "Carbon emissions prevented"
    },
    {
      icon: DollarSign,
      label: "Money Saved",
      value: metrics.moneySaved,
      unit: "$",
      color: "text-blue-500",
      description: "Saved through smart wardrobe management"
    },
    {
      icon: ShoppingBag,
      label: "Waste Reduced",
      value: metrics.wasteReduced,
      unit: "kg",
      color: "text-amber-500",
      description: "Textile waste prevented"
    }
  ];

  const getSustainabilityLevel = (score: number) => {
    if (score >= 80) return { label: "Excellent", color: "bg-green-500" };
    if (score >= 60) return { label: "Good", color: "bg-blue-500" };
    if (score >= 40) return { label: "Fair", color: "bg-yellow-500" };
    return { label: "Starting Out", color: "bg-gray-500" };
  };

  const level = getSustainabilityLevel(metrics.sustainabilityScore);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Leaf className="h-5 w-5 text-green-500" />
            Your Sustainability Impact
          </CardTitle>
          <Badge className={level.color}>
            {level.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Sustainability Score */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="font-medium">Sustainability Score</span>
            <span className="text-muted-foreground">{metrics.sustainabilityScore}/100</span>
          </div>
          <Progress value={metrics.sustainabilityScore} className="h-2" />
        </div>

        {/* Impact Metrics Grid */}
        <div className="grid grid-cols-2 gap-4">
          {impactData.map((item, index) => (
            <div 
              key={index}
              className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg bg-background ${item.color}`}>
                  <item.icon className="h-5 w-5" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className="text-2xl font-bold">
                    {item.unit === "$" && item.unit}
                    {item.value}
                    {item.unit !== "$" && ` ${item.unit}`}
                  </p>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Monthly Goal */}
        <div className="p-4 rounded-lg bg-muted/50 space-y-3">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            <span className="font-medium text-sm">Monthly Goal</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Items to rescue</span>
              <span className="font-medium">{metrics.itemsRescued}/10</span>
            </div>
            <Progress value={(metrics.itemsRescued / 10) * 100} className="h-2" />
          </div>
        </div>

        {/* Achievements */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Award className="h-4 w-4" />
            Recent Achievements
          </div>
          <div className="flex flex-wrap gap-2">
            {metrics.itemsRescued > 0 && (
              <Badge variant="secondary" className="gap-1">
                <Recycle className="h-3 w-3" />
                First Rescue
              </Badge>
            )}
            {metrics.sustainabilityScore >= 50 && (
              <Badge variant="secondary" className="gap-1">
                <TrendingUp className="h-3 w-3" />
                Eco Warrior
              </Badge>
            )}
            {metrics.moneySaved >= 100 && (
              <Badge variant="secondary" className="gap-1">
                <DollarSign className="h-3 w-3" />
                Smart Saver
              </Badge>
            )}
          </div>
        </div>

        {/* Tips */}
        <div className="p-4 rounded-lg bg-primary/5 space-y-2">
          <p className="text-sm font-medium">💡 Sustainability Tip</p>
          <p className="text-xs text-muted-foreground">
            Wearing items you already own is the most sustainable fashion choice. 
            Try to wear each item at least 30 times!
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
