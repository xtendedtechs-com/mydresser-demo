import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MerchantAnalyticsDashboard } from '@/components/MerchantAnalyticsDashboard';
import { PredictiveAnalytics } from '@/components/merchant/PredictiveAnalytics';
import { BarChart3, Brain } from 'lucide-react';

const MerchantTerminalAnalytics = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics & Insights</h1>
        <p className="text-muted-foreground">Performance metrics and AI-powered predictions</p>
      </div>

      <Tabs defaultValue="analytics" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="analytics" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="predictive" className="gap-2">
            <Brain className="h-4 w-4" />
            Predictive AI
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analytics">
          <MerchantAnalyticsDashboard />
        </TabsContent>

        <TabsContent value="predictive">
          <PredictiveAnalytics />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MerchantTerminalAnalytics;
