import { AdvancedAIRecommendations } from '@/components/AdvancedAIRecommendations';

const AIRecommendationsPage = () => {
  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">AI Style Recommendations</h1>
          <p className="text-muted-foreground">
            Personalized outfit suggestions powered by artificial intelligence
          </p>
        </div>
        <AdvancedAIRecommendations />
      </div>
    </div>
  );
};

export default AIRecommendationsPage;