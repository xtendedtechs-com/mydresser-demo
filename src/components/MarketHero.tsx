import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Sparkles, TrendingUp } from "lucide-react";

const MarketHero = () => {
  return (
    <Card className="relative overflow-hidden bg-gradient-to-r from-primary/10 via-accent/5 to-primary/5">
      <div className="absolute inset-0 bg-[url('/api/placeholder/600/300')] bg-cover bg-center opacity-20"></div>
      <div className="relative p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-primary/20 text-primary">
            <Sparkles className="w-3 h-3 mr-1" />
            AI Curated
          </Badge>
          <Badge variant="outline">
            <TrendingUp className="w-3 h-3 mr-1" />
            Trending Now
          </Badge>
        </div>
        
        <div className="space-y-2">
          <h2 className="text-xl font-bold fashion-text-gradient">
            Your Perfect Style Awaits
          </h2>
          <p className="text-sm text-muted-foreground">
            Discover outfits curated by AI based on your style profile, size, and preferences
          </p>
        </div>

        <div className="flex gap-3">
          <Button size="sm" className="flex-1">
            Explore Suggestions
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          <Button variant="outline" size="sm">
            Style Quiz
          </Button>
        </div>

        {/* Featured Stats */}
        <div className="grid grid-cols-3 gap-4 pt-2">
          <div className="text-center">
            <div className="text-lg font-bold text-primary">2.5k</div>
            <div className="text-xs text-muted-foreground">New Items</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-primary">150+</div>
            <div className="text-xs text-muted-foreground">Merchants</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-primary">95%</div>
            <div className="text-xs text-muted-foreground">Match Rate</div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default MarketHero;