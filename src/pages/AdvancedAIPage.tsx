import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendForecastingDashboard } from "@/components/TrendForecastingDashboard";
import { StyleEvolutionTracker } from "@/components/StyleEvolutionTracker";
import { PredictiveOutfitRecommendations } from "@/components/PredictiveOutfitRecommendations";
import { Brain, TrendingUp, History, Sparkles } from "lucide-react";

export default function AdvancedAIPage() {
  return (
    <div className="container mx-auto p-4 pb-20 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Brain className="h-8 w-8" />
          Advanced AI Intelligence
        </h1>
        <p className="text-muted-foreground">
          Machine learning-powered insights for your personal style
        </p>
      </div>

      <Tabs defaultValue="predictions" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="predictions" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            <span className="hidden sm:inline">Predictions</span>
          </TabsTrigger>
          <TabsTrigger value="trends" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Trends</span>
          </TabsTrigger>
          <TabsTrigger value="evolution" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            <span className="hidden sm:inline">Evolution</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="predictions" className="space-y-6">
          <PredictiveOutfitRecommendations />
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <TrendForecastingDashboard />
        </TabsContent>

        <TabsContent value="evolution" className="space-y-6">
          <StyleEvolutionTracker />
        </TabsContent>
      </Tabs>
    </div>
  );
}
