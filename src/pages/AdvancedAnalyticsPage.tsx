import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Target, TrendingUp, Activity } from "lucide-react";
import ComparativeAnalyticsDashboard from "@/components/ComparativeAnalyticsDashboard";
import PerformanceBenchmarkDashboard from "@/components/PerformanceBenchmarkDashboard";
import { AdvancedPredictiveAnalytics } from "@/components/AdvancedPredictiveAnalytics";
import { TrendForecastingDashboard } from "@/components/TrendForecastingDashboard";

const AdvancedAnalyticsPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-6 px-4 max-w-7xl">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <BarChart3 className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">Advanced Analytics</h1>
          </div>
          <p className="text-muted-foreground">
            Deep insights, comparisons, and performance benchmarks for data-driven decisions
          </p>
        </div>

        <Tabs defaultValue="comparative" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
            <TabsTrigger value="comparative" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">Comparative</span>
            </TabsTrigger>
            <TabsTrigger value="benchmarks" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              <span className="hidden sm:inline">Benchmarks</span>
            </TabsTrigger>
            <TabsTrigger value="predictive" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              <span className="hidden sm:inline">Predictive</span>
            </TabsTrigger>
            <TabsTrigger value="trends" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Trends</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="comparative" className="space-y-6">
            <ComparativeAnalyticsDashboard />
          </TabsContent>

          <TabsContent value="benchmarks" className="space-y-6">
            <PerformanceBenchmarkDashboard />
          </TabsContent>

          <TabsContent value="predictive" className="space-y-6">
            <AdvancedPredictiveAnalytics type="user" timeframe="30d" />
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <TrendForecastingDashboard />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdvancedAnalyticsPage;
