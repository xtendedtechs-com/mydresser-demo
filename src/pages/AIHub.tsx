import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, Shirt, MessageSquare, TrendingUp, Cloud, Scan, BarChart3 } from "lucide-react";
import { AIOutfitGenerator } from "@/components/AIOutfitGenerator";
import { EnhancedAIStyleChat } from "@/components/EnhancedAIStyleChat";
import { SmartOutfitRecommendations } from "@/components/SmartOutfitRecommendations";
import { DailyOutfitGenerator } from "@/components/DailyOutfitGenerator";
import { AIWardrobeAnalyzer } from "@/components/AIWardrobeAnalyzer";
import { AIImageStyleAnalyzer } from "@/components/AIImageStyleAnalyzer";
import { useWardrobe } from "@/hooks/useWardrobe";
import { Badge } from "@/components/ui/badge";

const AIHub = () => {
  const { items: wardrobeItems, loading } = useWardrobe();
  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container max-w-6xl mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Sparkles className="h-8 w-8 text-primary" />
                <h1 className="text-3xl font-bold">AI Fashion Hub</h1>
                <Badge variant="secondary" className="ml-2">Powered by Gemini</Badge>
              </div>
              <p className="text-muted-foreground">
                Advanced AI tools for wardrobe analysis, style consultation, and personalized recommendations
              </p>
            </div>
          </div>
        </div>

        {/* AI Features Tabs */}
        <Tabs defaultValue="daily" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="daily" className="flex items-center gap-2">
              <Cloud className="h-4 w-4" />
              Daily
            </TabsTrigger>
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="analyzer" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analyzer
            </TabsTrigger>
            <TabsTrigger value="scanner" className="flex items-center gap-2">
              <Scan className="h-4 w-4" />
              Scanner
            </TabsTrigger>
            <TabsTrigger value="generator" className="flex items-center gap-2">
              <Shirt className="h-4 w-4" />
              Generator
            </TabsTrigger>
            <TabsTrigger value="recommendations" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Smart Tips
            </TabsTrigger>
          </TabsList>

          <TabsContent value="daily" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Daily Outfit Suggestion</CardTitle>
                <CardDescription>
                  Get AI-powered outfit suggestions based on weather, your schedule, and personal style
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DailyOutfitGenerator />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="generator" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>AI Outfit Generator</CardTitle>
                <CardDescription>
                  Create complete outfits from your wardrobe using AI matching algorithms
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AIOutfitGenerator wardrobeItems={wardrobeItems} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Smart Recommendations</CardTitle>
                <CardDescription>
                  Discover outfit combinations and styling tips tailored to your preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SmartOutfitRecommendations />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="chat" className="space-y-4 mt-6">
            <EnhancedAIStyleChat />
          </TabsContent>

          <TabsContent value="analyzer" className="space-y-4 mt-6">
            <AIWardrobeAnalyzer />
          </TabsContent>

          <TabsContent value="scanner" className="space-y-4 mt-6">
            <AIImageStyleAnalyzer />
          </TabsContent>
        </Tabs>

        {/* AI Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">AI Suggestions Used</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">47</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Outfit Matches</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">234</div>
              <p className="text-xs text-muted-foreground">Total combinations found</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Style Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">92%</div>
              <p className="text-xs text-muted-foreground">Based on AI analysis</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AIHub;
