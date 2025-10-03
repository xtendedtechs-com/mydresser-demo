import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WearFrequencyAnalyzer } from "@/components/WearFrequencyAnalyzer";
import { WardrobeGapAnalysis } from "@/components/WardrobeGapAnalysis";
import { WardrobeValueAssessment } from "@/components/WardrobeValueAssessment";
import { BarChart3, TrendingUp, DollarSign, Sparkles } from "lucide-react";

export default function WardrobeAnalyticsPage() {
  return (
    <div className="container mx-auto p-4 pb-20 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <BarChart3 className="h-8 w-8 text-primary" />
          Advanced Wardrobe Analytics
        </h1>
        <p className="text-muted-foreground">
          Deep insights into your wardrobe usage, value, and optimization opportunities
        </p>
      </div>

      <Tabs defaultValue="frequency" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="frequency" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Wear Frequency</span>
            <span className="sm:hidden">Frequency</span>
          </TabsTrigger>
          <TabsTrigger value="gaps" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            <span className="hidden sm:inline">Gap Analysis</span>
            <span className="sm:hidden">Gaps</span>
          </TabsTrigger>
          <TabsTrigger value="value" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            <span className="hidden sm:inline">Value Assessment</span>
            <span className="sm:hidden">Value</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="frequency" className="space-y-6">
          <WearFrequencyAnalyzer />
        </TabsContent>

        <TabsContent value="gaps" className="space-y-6">
          <WardrobeGapAnalysis />
        </TabsContent>

        <TabsContent value="value" className="space-y-6">
          <WardrobeValueAssessment />
        </TabsContent>
      </Tabs>
    </div>
  );
}
