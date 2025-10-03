import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Recycle, Droplets, Wind, ShoppingBag, TrendingUp } from "lucide-react";
import { useWardrobe } from "@/hooks/useWardrobe";

interface BrandScore {
  name: string;
  score: number;
  category: "excellent" | "good" | "fair" | "poor";
  certifications: string[];
}

export const SustainabilityInsights = () => {
  const { items } = useWardrobe();

  const brandScores: BrandScore[] = [
    {
      name: "Patagonia",
      score: 95,
      category: "excellent",
      certifications: ["B-Corp", "Fair Trade", "1% for the Planet"],
    },
    {
      name: "Everlane",
      score: 82,
      category: "good",
      certifications: ["Transparent Pricing", "Ethical Factories"],
    },
    {
      name: "Zara",
      score: 65,
      category: "fair",
      certifications: ["Join Life Collection"],
    },
  ];

  const materialImpact = [
    {
      material: "Organic Cotton",
      impact: "low",
      waterUsage: "-91%",
      co2: "-46%",
      icon: Droplets,
    },
    {
      material: "Recycled Polyester",
      impact: "low",
      waterUsage: "-90%",
      co2: "-75%",
      icon: Recycle,
    },
    {
      material: "Conventional Cotton",
      impact: "high",
      waterUsage: "High",
      co2: "High",
      icon: Wind,
    },
  ];

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getImpactColor = (impact: string) => {
    if (impact === "low") return "bg-green-500/10 text-green-700 dark:text-green-300";
    if (impact === "medium") return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-300";
    return "bg-red-500/10 text-red-700 dark:text-red-300";
  };

  return (
    <div className="space-y-6">
      {/* Material Impact */}
      <Card>
        <CardHeader>
          <CardTitle>Material Impact</CardTitle>
          <CardDescription>
            Environmental impact of materials in your wardrobe
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {materialImpact.map((material) => {
              const Icon = material.icon;
              return (
                <div
                  key={material.material}
                  className="flex items-center gap-4 p-4 border rounded-lg"
                >
                  <Icon className="h-8 w-8 text-primary flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold">{material.material}</p>
                      <Badge className={getImpactColor(material.impact)}>
                        {material.impact} impact
                      </Badge>
                    </div>
                    <div className="flex gap-4 text-sm">
                      <span className="text-muted-foreground">
                        Water: {material.waterUsage}
                      </span>
                      <span className="text-muted-foreground">
                        CO₂: {material.co2}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Brand Sustainability Scores */}
      <Card>
        <CardHeader>
          <CardTitle>Brand Sustainability</CardTitle>
          <CardDescription>
            Sustainability ratings for brands in your wardrobe
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {brandScores.map((brand) => (
              <div key={brand.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold">{brand.name}</span>
                  </div>
                  <span className={`text-xl font-bold ${getScoreColor(brand.score)}`}>
                    {brand.score}
                  </span>
                </div>
                <Progress value={brand.score} className="h-2" />
                <div className="flex flex-wrap gap-1">
                  {brand.certifications.map((cert) => (
                    <Badge key={cert} variant="outline" className="text-xs">
                      {cert}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Circular Fashion Goals */}
      <Card>
        <CardHeader>
          <CardTitle>Circular Fashion Goals</CardTitle>
          <CardDescription>
            Your progress toward sustainable fashion practices
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Rewear items 30+ times</span>
              <span className="font-medium">12/20 items</span>
            </div>
            <Progress value={60} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Buy secondhand items</span>
              <span className="font-medium">8/10 this year</span>
            </div>
            <Progress value={80} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Donate unused items</span>
              <span className="font-medium">5/15 items</span>
            </div>
            <Progress value={33} className="h-2" />
          </div>

          <Button className="w-full mt-4">
            <TrendingUp className="mr-2 h-4 w-4" />
            Set New Goals
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
