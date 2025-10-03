import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, TrendingUp, ShoppingBag, Sparkles } from "lucide-react";
import Navigation from "@/components/Navigation";
import { AITrendAnalyzer } from "@/components/AITrendAnalyzer";
import { AIPurchaseAdvisor } from "@/components/AIPurchaseAdvisor";
import { AIShoppingAssistant } from "@/components/AIShoppingAssistant";

const AIInsightsPage = () => {
  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Brain className="h-8 w-8 text-primary" />
            AI Insights Hub
          </h1>
          <p className="text-text-muted">
            Intelligent wardrobe analysis, trend forecasting, and purchase recommendations powered by AI
          </p>
        </div>

        <Tabs defaultValue="trends" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="trends" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Trend Analysis</span>
              <span className="sm:hidden">Trends</span>
            </TabsTrigger>
            <TabsTrigger value="purchase" className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" />
              <span className="hidden sm:inline">Purchase Advisor</span>
              <span className="sm:hidden">Purchase</span>
            </TabsTrigger>
            <TabsTrigger value="shopping" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              <span className="hidden sm:inline">Shopping Assistant</span>
              <span className="sm:hidden">Shopping</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="trends">
            <AITrendAnalyzer />
          </TabsContent>

          <TabsContent value="purchase">
            <AIPurchaseAdvisor />
          </TabsContent>

          <TabsContent value="shopping">
            <AIShoppingAssistant />
          </TabsContent>
        </Tabs>
      </div>
      <Navigation />
    </div>
  );
};

export default AIInsightsPage;
