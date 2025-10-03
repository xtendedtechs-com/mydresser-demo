import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, ArrowUp, ArrowDown, Minus, Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Trend {
  id: string;
  name: string;
  category: string;
  popularity: number;
  change: "up" | "down" | "stable";
  changePercent: number;
  description: string;
  tags: string[];
  image: string;
  isSaved: boolean;
}

export const TrendDiscovery = () => {
  const [trends, setTrends] = useState<Trend[]>([
    {
      id: "1",
      name: "Oversized Blazers",
      category: "Outerwear",
      popularity: 92,
      change: "up",
      changePercent: 15,
      description: "Relaxed, oversized blazers are dominating street style",
      tags: ["blazer", "oversized", "business casual"],
      image: "/placeholder.svg",
      isSaved: false,
    },
    {
      id: "2",
      name: "Wide-Leg Trousers",
      category: "Bottoms",
      popularity: 88,
      change: "up",
      changePercent: 23,
      description: "Classic wide-leg silhouettes making a comeback",
      tags: ["trousers", "wide-leg", "vintage"],
      image: "/placeholder.svg",
      isSaved: true,
    },
    {
      id: "3",
      name: "Minimalist Accessories",
      category: "Accessories",
      popularity: 85,
      change: "stable",
      changePercent: 0,
      description: "Simple, elegant accessories for a refined look",
      tags: ["minimalist", "accessories", "elegant"],
      image: "/placeholder.svg",
      isSaved: false,
    },
    {
      id: "4",
      name: "Earth Tones",
      category: "Color Palette",
      popularity: 79,
      change: "up",
      changePercent: 8,
      description: "Natural, earthy colors dominating the season",
      tags: ["earth tones", "natural", "sustainable"],
      image: "/placeholder.svg",
      isSaved: false,
    },
    {
      id: "5",
      name: "Cargo Pants",
      category: "Bottoms",
      popularity: 72,
      change: "down",
      changePercent: -5,
      description: "Utility-inspired cargo pants cooling down",
      tags: ["cargo", "utility", "casual"],
      image: "/placeholder.svg",
      isSaved: false,
    },
  ]);

  const { toast } = useToast();

  const toggleSave = (trendId: string) => {
    setTrends(
      trends.map((trend) =>
        trend.id === trendId ? { ...trend, isSaved: !trend.isSaved } : trend
      )
    );
    toast({
      title: "Trend Updated",
      description: "Your saved trends have been updated",
    });
  };

  const getChangeIcon = (change: string) => {
    switch (change) {
      case "up":
        return <ArrowUp className="h-4 w-4" />;
      case "down":
        return <ArrowDown className="h-4 w-4" />;
      default:
        return <Minus className="h-4 w-4" />;
    }
  };

  const getChangeColor = (change: string) => {
    switch (change) {
      case "up":
        return "text-green-600 dark:text-green-400";
      case "down":
        return "text-red-600 dark:text-red-400";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          <CardTitle>Fashion Trends</CardTitle>
        </div>
        <CardDescription>
          Discover what's trending in fashion right now
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {trends.map((trend, index) => (
            <div
              key={trend.id}
              className="flex gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex-shrink-0">
                <div className="relative">
                  <img
                    src={trend.image}
                    alt={trend.name}
                    className="w-24 h-24 object-cover rounded"
                  />
                  <div className="absolute top-2 left-2 bg-background/80 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold">
                    #{index + 1}
                  </div>
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-lg">{trend.name}</h3>
                    <p className="text-sm text-muted-foreground">{trend.category}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleSave(trend.id)}
                    className={trend.isSaved ? "text-red-500" : ""}
                  >
                    <Heart
                      className="h-5 w-5"
                      fill={trend.isSaved ? "currentColor" : "none"}
                    />
                  </Button>
                </div>

                <p className="text-sm mb-3">{trend.description}</p>

                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-1">
                    {trend.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Popularity</p>
                      <div className="flex items-center gap-1">
                        <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all"
                            style={{ width: `${trend.popularity}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{trend.popularity}%</span>
                      </div>
                    </div>

                    <div className={`flex items-center gap-1 ${getChangeColor(trend.change)}`}>
                      {getChangeIcon(trend.change)}
                      <span className="text-sm font-medium">
                        {trend.change === "stable" ? "" : `${Math.abs(trend.changePercent)}%`}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
