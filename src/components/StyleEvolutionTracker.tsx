import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, Calendar, Award, Target, Palette, Sparkles } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";

interface StylePeriod {
  period: string;
  dominantStyle: string;
  colors: string[];
  categories: string[];
  confidence: number;
}

interface StyleMetric {
  category: string;
  current: number;
  previous: number;
}

const evolutionTimeline: StylePeriod[] = [
  { 
    period: "Jan 2024", 
    dominantStyle: "Casual Comfort", 
    colors: ["Navy", "Gray", "White"], 
    categories: ["Jeans", "T-shirts", "Sneakers"],
    confidence: 78
  },
  { 
    period: "Apr 2024", 
    dominantStyle: "Smart Casual", 
    colors: ["Beige", "White", "Blue"], 
    categories: ["Chinos", "Button-ups", "Loafers"],
    confidence: 82
  },
  { 
    period: "Jul 2024", 
    dominantStyle: "Minimalist Chic", 
    colors: ["Black", "White", "Cream"], 
    categories: ["Blazers", "Trousers", "Boots"],
    confidence: 88
  },
  { 
    period: "Oct 2024", 
    dominantStyle: "Modern Professional", 
    colors: ["Charcoal", "Navy", "Burgundy"], 
    categories: ["Suits", "Dress Shirts", "Oxfords"],
    confidence: 92
  },
];

const styleMetrics: StyleMetric[] = [
  { category: "Versatility", current: 85, previous: 72 },
  { category: "Sophistication", current: 78, previous: 65 },
  { category: "Sustainability", current: 82, previous: 68 },
  { category: "Color Harmony", current: 88, previous: 75 },
  { category: "Trend Alignment", current: 75, previous: 70 },
];

const radarData = [
  { subject: 'Formal', current: 85, previous: 65 },
  { subject: 'Casual', current: 70, previous: 90 },
  { subject: 'Sporty', current: 45, previous: 55 },
  { subject: 'Trendy', current: 75, previous: 60 },
  { subject: 'Classic', current: 90, previous: 70 },
  { subject: 'Bold', current: 55, previous: 45 },
];

const styleScoreHistory = [
  { month: "Jan", score: 72 },
  { month: "Feb", score: 75 },
  { month: "Mar", score: 78 },
  { month: "Apr", score: 82 },
  { month: "May", score: 85 },
  { month: "Jun", score: 88 },
  { month: "Jul", score: 90 },
  { month: "Aug", score: 92 },
  { month: "Sep", score: 91 },
  { month: "Oct", score: 94 },
  { month: "Nov", score: 95 },
  { month: "Dec", score: 97 },
];

const milestones = [
  { title: "Style Transformation", description: "Evolved from casual to professional style", date: "6 months ago", achieved: true },
  { title: "Color Mastery", description: "Mastered neutral color coordination", date: "4 months ago", achieved: true },
  { title: "Wardrobe Optimization", description: "Achieved 85% versatility score", date: "3 months ago", achieved: true },
  { title: "Trend Pioneer", description: "Adopted sustainable fashion early", date: "2 months ago", achieved: true },
  { title: "Style Icon", description: "Reach 100 style score", date: "In progress", achieved: false },
];

export function StyleEvolutionTracker() {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold">Style Evolution</h2>
          <p className="text-muted-foreground">Track your personal style journey</p>
        </div>
        <Badge variant="outline" className="gap-1">
          <Sparkles className="h-3 w-3" />
          AI Analysis
        </Badge>
      </div>

      <Tabs defaultValue="timeline" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
          <TabsTrigger value="comparison">Compare</TabsTrigger>
          <TabsTrigger value="milestones">Milestones</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Style Score Evolution</CardTitle>
              <CardDescription>Your style confidence has grown 35% this year</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={styleScoreHistory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={3}
                    dot={{ fill: 'hsl(var(--primary))', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            {evolutionTimeline.map((period) => (
              <Card key={period.period}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <CardTitle className="text-base">{period.period}</CardTitle>
                    </div>
                    <Badge variant="outline">{period.confidence}%</Badge>
                  </div>
                  <CardDescription className="font-medium">{period.dominantStyle}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Color Palette</p>
                    <div className="flex gap-2">
                      {period.colors.map((color) => (
                        <Badge key={color} variant="secondary" className="text-xs">
                          {color}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Key Pieces</p>
                    <div className="flex flex-wrap gap-2">
                      {period.categories.map((category) => (
                        <Badge key={category} variant="outline" className="text-xs">
                          {category}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Style Metrics Growth</CardTitle>
              <CardDescription>Compare current vs. previous period</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {styleMetrics.map((metric) => {
                const growth = metric.current - metric.previous;
                const growthPercent = ((growth / metric.previous) * 100).toFixed(0);
                
                return (
                  <div key={metric.category} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{metric.category}</span>
                        <Badge variant={growth > 0 ? "default" : "secondary"} className="gap-1">
                          <TrendingUp className="h-3 w-3" />
                          +{growthPercent}%
                        </Badge>
                      </div>
                      <span className="text-sm text-muted-foreground">{metric.current}/100</span>
                    </div>
                    <div className="space-y-1">
                      <Progress value={metric.current} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Previous: {metric.previous}</span>
                        <span>Current: {metric.current}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Style Profile Comparison</CardTitle>
              <CardDescription>Current style vs. 6 months ago</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar 
                    name="Current" 
                    dataKey="current" 
                    stroke="hsl(var(--primary))" 
                    fill="hsl(var(--primary))" 
                    fillOpacity={0.3} 
                  />
                  <Radar 
                    name="Previous" 
                    dataKey="previous" 
                    stroke="hsl(var(--muted-foreground))" 
                    fill="hsl(var(--muted-foreground))" 
                    fillOpacity={0.1} 
                  />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Key Transformations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/10 border border-primary/20">
                <Palette className="h-5 w-5 text-primary mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-sm">Style Maturity</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Transitioned from casual-heavy to balanced professional style
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/10 border border-primary/20">
                <Target className="h-5 w-5 text-primary mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-sm">Color Sophistication</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Evolved from bright colors to refined neutral palette
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="milestones" className="space-y-4">
          {milestones.map((milestone) => (
            <Card key={milestone.title} className={milestone.achieved ? "" : "opacity-60"}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`mt-1 h-8 w-8 rounded-full flex items-center justify-center ${
                      milestone.achieved ? "bg-primary" : "bg-muted"
                    }`}>
                      <Award className={`h-4 w-4 ${milestone.achieved ? "text-primary-foreground" : "text-muted-foreground"}`} />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{milestone.title}</CardTitle>
                      <CardDescription>{milestone.description}</CardDescription>
                    </div>
                  </div>
                  <Badge variant={milestone.achieved ? "default" : "outline"}>
                    {milestone.date}
                  </Badge>
                </div>
              </CardHeader>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
