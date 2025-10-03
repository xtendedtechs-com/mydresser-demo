import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, Calendar, TrendingUp, Sun, Cloud, Droplets, Heart, Star } from "lucide-react";
import { useState } from "react";

interface PredictiveOutfit {
  id: string;
  title: string;
  occasion: string;
  confidence: number;
  reasoning: string;
  weather: string;
  date: string;
  items: string[];
  score: number;
  tags: string[];
}

const upcomingEvents = [
  { 
    id: "1",
    title: "Business Meeting Outfit",
    occasion: "Work Meeting",
    confidence: 92,
    reasoning: "Based on your calendar event 'Q4 Planning Meeting' on Dec 15",
    weather: "Cool, 12°C",
    date: "Tomorrow, 9:00 AM",
    items: ["Navy Blazer", "White Shirt", "Gray Trousers", "Black Oxfords"],
    score: 95,
    tags: ["Professional", "Confidence-Boost", "Weather-Appropriate"]
  },
  {
    id: "2", 
    title: "Weekend Brunch Style",
    occasion: "Casual Social",
    confidence: 88,
    reasoning: "Typical Saturday pattern + sunny weather forecast",
    weather: "Sunny, 18°C",
    date: "Saturday, 11:00 AM",
    items: ["Beige Chinos", "Light Blue Shirt", "Brown Loafers", "Sunglasses"],
    score: 90,
    tags: ["Relaxed", "Stylish", "Comfortable"]
  },
  {
    id: "3",
    title: "Gym Session Ready",
    occasion: "Workout",
    confidence: 85,
    reasoning: "You usually work out Monday evenings",
    weather: "Indoor",
    date: "Monday, 6:00 PM",
    items: ["Performance T-shirt", "Athletic Shorts", "Running Shoes", "Gym Bag"],
    score: 88,
    tags: ["Functional", "Breathable", "Motivating"]
  },
];

const seasonalPredictions = [
  {
    season: "Next Week",
    trend: "Layering Weather",
    confidence: 90,
    suggestions: [
      { item: "Light Sweater", reason: "Temperature dropping to 8-12°C", priority: "high" },
      { item: "Trench Coat", reason: "Rain forecast for 3 days", priority: "high" },
      { item: "Ankle Boots", reason: "Wet weather protection", priority: "medium" },
    ]
  },
  {
    season: "Next Month",
    trend: "Winter Transition",
    confidence: 85,
    suggestions: [
      { item: "Wool Coat", reason: "Sub-zero temperatures expected", priority: "high" },
      { item: "Thermal Layers", reason: "Cold weather base layers", priority: "medium" },
      { item: "Winter Scarf", reason: "Essential for comfort", priority: "medium" },
    ]
  },
];

const stylePatterns = [
  { 
    pattern: "Professional Weekdays",
    frequency: "Mon-Fri, 9 AM - 5 PM",
    dominantStyle: "Smart Business",
    confidence: 94,
    recommendation: "Keep 3-4 business outfits ready"
  },
  {
    pattern: "Active Mornings", 
    frequency: "Mon, Wed, Fri - 6 AM",
    dominantStyle: "Athletic",
    confidence: 88,
    recommendation: "Prepare workout clothes night before"
  },
  {
    pattern: "Social Weekends",
    frequency: "Sat-Sun, Afternoons",
    dominantStyle: "Smart Casual",
    confidence: 82,
    recommendation: "Balance comfort with style"
  },
];

export function PredictiveOutfitRecommendations() {
  const [savedOutfits, setSavedOutfits] = useState<string[]>([]);

  const handleSaveOutfit = (id: string) => {
    if (savedOutfits.includes(id)) {
      setSavedOutfits(savedOutfits.filter(outfitId => outfitId !== id));
    } else {
      setSavedOutfits([...savedOutfits, id]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold">Predictive Recommendations</h2>
          <p className="text-muted-foreground">AI-powered outfit suggestions based on your schedule</p>
        </div>
        <Badge variant="outline" className="gap-1">
          <Sparkles className="h-3 w-3" />
          ML Predictions
        </Badge>
      </div>

      <Tabs defaultValue="upcoming" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="seasonal">Seasonal</TabsTrigger>
          <TabsTrigger value="patterns">Patterns</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          {upcomingEvents.map((outfit) => {
            const isSaved = savedOutfits.includes(outfit.id);
            
            return (
              <Card key={outfit.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <CardTitle className="text-lg">{outfit.title}</CardTitle>
                        <Badge variant="outline" className="text-xs">
                          {outfit.confidence}% Match
                        </Badge>
                      </div>
                      <CardDescription className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {outfit.date}
                        </span>
                        <span className="flex items-center gap-1">
                          {outfit.weather.includes("Sunny") ? <Sun className="h-3 w-3" /> : 
                           outfit.weather.includes("Rain") ? <Droplets className="h-3 w-3" /> : 
                           <Cloud className="h-3 w-3" />}
                          {outfit.weather}
                        </span>
                      </CardDescription>
                    </div>
                    <Button
                      variant={isSaved ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleSaveOutfit(outfit.id)}
                      className="gap-1"
                    >
                      <Heart className={`h-4 w-4 ${isSaved ? "fill-current" : ""}`} />
                      {isSaved ? "Saved" : "Save"}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-sm flex items-start gap-2">
                      <Sparkles className="h-4 w-4 text-primary mt-0.5" />
                      <span className="flex-1">{outfit.reasoning}</span>
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">Suggested Items:</p>
                    <div className="flex flex-wrap gap-2">
                      {outfit.items.map((item) => (
                        <Badge key={item} variant="secondary">
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex gap-2">
                      {outfit.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-current text-amber-500" />
                      <span className="font-medium text-sm">{outfit.score}/100</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="seasonal" className="space-y-4">
          {seasonalPredictions.map((prediction) => (
            <Card key={prediction.season}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{prediction.season}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <TrendingUp className="h-3 w-3" />
                      {prediction.trend}
                    </CardDescription>
                  </div>
                  <Badge variant="outline">{prediction.confidence}% Confidence</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {prediction.suggestions.map((suggestion) => (
                    <div 
                      key={suggestion.item}
                      className={`flex items-start justify-between p-3 rounded-lg border ${
                        suggestion.priority === 'high' 
                          ? 'bg-primary/10 border-primary/20' 
                          : 'bg-muted/50 border-border'
                      }`}
                    >
                      <div className="flex-1">
                        <p className="font-medium text-sm">{suggestion.item}</p>
                        <p className="text-xs text-muted-foreground mt-1">{suggestion.reason}</p>
                      </div>
                      <Badge variant={suggestion.priority === 'high' ? 'default' : 'secondary'}>
                        {suggestion.priority}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="patterns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Style Patterns</CardTitle>
              <CardDescription>
                AI-detected patterns from your wardrobe usage and calendar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {stylePatterns.map((pattern) => (
                <div key={pattern.pattern} className="p-4 rounded-lg border bg-card">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-medium">{pattern.pattern}</h4>
                      <p className="text-sm text-muted-foreground">{pattern.frequency}</p>
                    </div>
                    <Badge variant="outline">{pattern.confidence}%</Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Dominant Style:</span>
                      <span className="font-medium">{pattern.dominantStyle}</span>
                    </div>
                    <div className="p-2 rounded bg-muted/50 text-sm">
                      💡 {pattern.recommendation}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
