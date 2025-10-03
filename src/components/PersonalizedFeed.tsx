import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ShoppingBag, Users, Heart, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FeedItem {
  id: string;
  type: "recommendation" | "outfit" | "market" | "social";
  title: string;
  description: string;
  image: string;
  tags: string[];
  aiReason?: string;
  price?: number;
  likes?: number;
  userName?: string;
}

export const PersonalizedFeed = () => {
  const [feedItems] = useState<FeedItem[]>([
    {
      id: "1",
      type: "recommendation",
      title: "Perfect Match for Your Navy Blazer",
      description: "These cream trousers would complete your business casual look",
      image: "/placeholder.svg",
      tags: ["AI suggested", "business casual"],
      aiReason: "Based on your recent outfit preferences and wardrobe analysis",
    },
    {
      id: "2",
      type: "outfit",
      title: "Summer Evening Look",
      description: "Try this combination for your upcoming dinner event",
      image: "/placeholder.svg",
      tags: ["evening", "summer", "elegant"],
      aiReason: "Weather-optimized for tonight's forecast",
    },
    {
      id: "3",
      type: "market",
      title: "Vintage Leather Jacket",
      description: "Premium leather, excellent condition - matches your style",
      image: "/placeholder.svg",
      tags: ["vintage", "leather", "outerwear"],
      price: 149.99,
      aiReason: "88% style match with your saved preferences",
    },
    {
      id: "4",
      type: "social",
      title: "Sarah's Office Look",
      description: "Your connection shared this minimalist outfit",
      image: "/placeholder.svg",
      tags: ["office", "minimalist"],
      likes: 42,
      userName: "Sarah Johnson",
    },
  ]);

  const { toast } = useToast();

  const handleAction = (action: string, itemId: string) => {
    toast({
      title: action,
      description: "Action processed successfully",
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "recommendation":
        return <Sparkles className="h-4 w-4" />;
      case "market":
        return <ShoppingBag className="h-4 w-4" />;
      case "social":
        return <Users className="h-4 w-4" />;
      default:
        return <Sparkles className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "recommendation":
        return "bg-purple-500/10 text-purple-700 dark:text-purple-300";
      case "market":
        return "bg-green-500/10 text-green-700 dark:text-green-300";
      case "social":
        return "bg-blue-500/10 text-blue-700 dark:text-blue-300";
      default:
        return "bg-muted";
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <CardTitle>For You</CardTitle>
        </div>
        <CardDescription>
          Personalized recommendations based on your style and preferences
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {feedItems.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <div className="flex flex-col sm:flex-row">
                <div className="relative w-full sm:w-48 h-48 flex-shrink-0">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                  <Badge
                    className={`absolute top-2 left-2 ${getTypeColor(item.type)}`}
                  >
                    {getTypeIcon(item.type)}
                    <span className="ml-1 capitalize">{item.type}</span>
                  </Badge>
                </div>

                <div className="flex-1 p-4">
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold text-lg mb-1">{item.title}</h3>
                      {item.userName && (
                        <p className="text-sm text-muted-foreground">
                          by {item.userName}
                        </p>
                      )}
                    </div>

                    <p className="text-sm">{item.description}</p>

                    {item.aiReason && (
                      <div className="flex items-start gap-2 p-2 bg-primary/5 rounded">
                        <Sparkles className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-muted-foreground">{item.aiReason}</p>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-1">
                      {item.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-2">
                        {item.price && (
                          <span className="text-lg font-bold text-primary">
                            ${item.price.toFixed(2)}
                          </span>
                        )}
                        {item.likes !== undefined && (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Heart className="h-4 w-4" />
                            <span className="text-sm">{item.likes}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAction("Saved", item.id)}
                        >
                          <Heart className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAction("Shared", item.id)}
                        >
                          <Share2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleAction("Viewed", item.id)}
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
