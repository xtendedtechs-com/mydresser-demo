import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WardrobeAnalyticsCard } from "@/components/WardrobeAnalyticsCard";
import { WearFrequencyTracker } from "@/components/WearFrequencyTracker";
import { WardrobeInsightsDashboard } from "@/components/WardrobeInsightsDashboard";
import { BarChart3, Clock, Sparkles } from "lucide-react";

const AdvancedWardrobeInsights = () => {
  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container max-w-6xl mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Wardrobe Insights</h1>
          <p className="text-muted-foreground">
            Understand your wardrobe better with analytics and smart recommendations
          </p>
        </div>

        {/* Insights Tabs */}
        <Tabs defaultValue="analytics" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="frequency" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Wear Tracking
            </TabsTrigger>
            <TabsTrigger value="ai" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              AI Insights
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analytics" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <WardrobeAnalyticsCard />
              <div className="space-y-6">
                <WardrobeInsightsDashboard />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="frequency" className="mt-6">
            <WearFrequencyTracker />
          </TabsContent>

          <TabsContent value="ai" className="mt-6">
            <WardrobeInsightsDashboard />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdvancedWardrobeInsights;
