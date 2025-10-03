import { WardrobeInsightsDashboard } from '@/components/WardrobeInsightsDashboard';

const WardrobeInsightsPage = () => {
  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Wardrobe Insights</h1>
        <p className="text-muted-foreground mt-2">
          AI-powered analysis of your wardrobe patterns and recommendations
        </p>
      </div>
      <WardrobeInsightsDashboard />
    </div>
  );
};

export default WardrobeInsightsPage;
