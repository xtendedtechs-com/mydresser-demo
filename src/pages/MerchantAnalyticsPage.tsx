import { MerchantAnalyticsDashboard } from '@/components/MerchantAnalyticsDashboard';
import { AdvancedPredictiveAnalytics } from '@/components/AdvancedPredictiveAnalytics';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const MerchantAnalyticsPage = () => {
  return (
    <div className="min-h-screen bg-background p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold">Merchant Analytics</h1>
        <p className="text-muted-foreground">Comprehensive analytics and AI-powered predictions for your business</p>
      </div>

      <Tabs defaultValue="current" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="current">Current Analytics</TabsTrigger>
          <TabsTrigger value="predictive">Predictive AI</TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="space-y-6 mt-6">
          <MerchantAnalyticsDashboard />
        </TabsContent>

        <TabsContent value="predictive" className="space-y-6 mt-6">
          <AdvancedPredictiveAnalytics type="merchant" timeframe="30d" />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MerchantAnalyticsPage;