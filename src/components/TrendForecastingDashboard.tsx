import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, TrendingDown, Sparkles, Calendar, Target, AlertCircle } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";

interface TrendData {
  name: string;
  momentum: number;
  confidence: number;
  category: string;
  prediction: 'rising' | 'stable' | 'declining';
}

interface ForecastData {
  month: string;
  popularity: number;
  predicted: number;
}

const trendData: TrendData[] = [
  { name: "Oversized Blazers", momentum: 92, confidence: 88, category: "Outerwear", prediction: "rising" },
  { name: "Wide-Leg Trousers", momentum: 85, confidence: 82, category: "Bottoms", prediction: "rising" },
  { name: "Neutral Tones", momentum: 78, confidence: 90, category: "Color", prediction: "stable" },
  { name: "Sustainable Fabrics", momentum: 95, confidence: 85, category: "Material", prediction: "rising" },
  { name: "Skinny Jeans", momentum: 42, confidence: 88, category: "Bottoms", prediction: "declining" },
  { name: "Neon Colors", momentum: 38, confidence: 75, category: "Color", prediction: "declining" },
];

const forecastData: ForecastData[] = [
  { month: "Jan", popularity: 65, predicted: 68 },
  { month: "Feb", popularity: 70, predicted: 72 },
  { month: "Mar", popularity: 75, predicted: 78 },
  { month: "Apr", popularity: 82, predicted: 85 },
  { month: "May", popularity: 88, predicted: 90 },
  { month: "Jun", popularity: 92, predicted: 95 },
];

const seasonalTrends = [
  { season: "Spring 2025", trends: ["Pastel Colors", "Lightweight Layers", "Floral Patterns"], confidence: 85 },
  { season: "Summer 2025", trends: ["Linen Fabrics", "Bright Whites", "Breathable Cuts"], confidence: 82 },
  { season: "Fall 2025", trends: ["Earth Tones", "Oversized Silhouettes", "Leather Accents"], confidence: 78 },
  { season: "Winter 2025", trends: ["Rich Textures", "Monochrome Looks", "Statement Coats"], confidence: 75 },
];

export function TrendForecastingDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold">Trend Forecasting</h2>
          <p className="text-muted-foreground">AI-powered fashion trend predictions</p>
        </div>
        <Badge variant="outline" className="gap-1">
          <Sparkles className="h-3 w-3" />
          AI Predictions
        </Badge>
      </div>

      <Tabs defaultValue="current" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="current">Current Trends</TabsTrigger>
          <TabsTrigger value="forecast">Forecast</TabsTrigger>
          <TabsTrigger value="seasonal">Seasonal</TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {trendData.map((trend) => (
              <Card key={trend.name}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base">{trend.name}</CardTitle>
                    {trend.prediction === "rising" ? (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    ) : trend.prediction === "declining" ? (
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    ) : (
                      <Target className="h-4 w-4 text-blue-500" />
                    )}
                  </div>
                  <CardDescription>{trend.category}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Momentum</span>
                      <span className="font-medium">{trend.momentum}%</span>
                    </div>
                    <Progress value={trend.momentum} className="h-2" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Confidence</span>
                      <span className="font-medium">{trend.confidence}%</span>
                    </div>
                    <Progress value={trend.confidence} className="h-2" />
                  </div>
                  <Badge 
                    variant={trend.prediction === "rising" ? "default" : trend.prediction === "declining" ? "destructive" : "secondary"}
                    className="w-full justify-center"
                  >
                    {trend.prediction === "rising" ? "Rising" : trend.prediction === "declining" ? "Declining" : "Stable"}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="forecast" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>6-Month Trend Projection</CardTitle>
              <CardDescription>
                AI-predicted popularity trajectory for sustainable fashion
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={forecastData}>
                  <defs>
                    <linearGradient id="colorPopularity" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="popularity" 
                    stroke="hsl(var(--primary))" 
                    fillOpacity={1} 
                    fill="url(#colorPopularity)" 
                    name="Current"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="predicted" 
                    stroke="hsl(var(--chart-2))" 
                    strokeDasharray="5 5"
                    fillOpacity={1} 
                    fill="url(#colorPredicted)" 
                    name="Predicted"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Key Insights</CardTitle>
              <CardDescription>AI-generated trend analysis</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                <TrendingUp className="h-5 w-5 text-green-500 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-sm">Sustainable fashion continues strong growth</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Expected to reach 95% popularity by June 2025
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <Target className="h-5 w-5 text-blue-500 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-sm">Oversized silhouettes dominating</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    92% momentum with high confidence across demographics
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-sm">Skinny fits declining rapidly</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Consider updating wardrobe with wider cuts for longevity
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seasonal" className="space-y-4">
          {seasonalTrends.map((season) => (
            <Card key={season.season}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <CardTitle className="text-lg">{season.season}</CardTitle>
                  </div>
                  <Badge variant="outline">{season.confidence}% Confidence</Badge>
                </div>
                <CardDescription>Predicted trending styles</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {season.trends.map((trend) => (
                    <Badge key={trend} variant="secondary" className="text-sm">
                      {trend}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
