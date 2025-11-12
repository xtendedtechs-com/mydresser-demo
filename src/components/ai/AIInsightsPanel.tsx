import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, TrendingUp, Heart, Calendar, Cloud } from 'lucide-react';
import { useAIRecommendations } from '@/hooks/useAIRecommendations';
import { LoadingScreen } from '@/components/LoadingScreen';
import { EmptyState } from '@/components/EmptyState';
import { OptimizedImage } from '@/components/OptimizedImage';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { type RecommendationContext } from '@/services/aiModels/outfitRecommendationEngine';

export const AIInsightsPanel = () => {
  const navigate = useNavigate();
  const {
    dailyRecommendations,
    isLoadingDaily,
    generateRecommendations,
    isGenerating,
    saveOutfit,
    isSaving,
  } = useAIRecommendations();

  const [customContext, setCustomContext] = useState<RecommendationContext>({
    occasion: 'casual',
    season: 'current',
  });

  const handleGenerateCustom = async () => {
    try {
      await generateRecommendations(customContext);
    } catch (error) {
      console.error('Failed to generate recommendations:', error);
    }
  };

  if (isLoadingDaily) {
    return <LoadingScreen message="Generating AI recommendations..." />;
  }

  if (!dailyRecommendations || dailyRecommendations.length === 0) {
    return (
      <EmptyState
        icon={Sparkles}
        title="No Recommendations Yet"
        description="Add items to your wardrobe to get AI-powered outfit suggestions"
        actionLabel="Go to Wardrobe"
        onAction={() => navigate('/wardrobe')}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            AI Outfit Recommendations
          </h2>
          <p className="text-muted-foreground mt-1">
            Personalized suggestions based on your wardrobe
          </p>
        </div>
        <Button onClick={handleGenerateCustom} disabled={isGenerating}>
          {isGenerating ? 'Generating...' : 'Generate More'}
        </Button>
      </div>

      {/* Daily Recommendations Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {dailyRecommendations.map((recommendation) => (
          <Card key={recommendation.id} className="overflow-hidden hover-lift">
            {/* Outfit Preview */}
            <div className="aspect-square bg-muted relative">
              <div className="grid grid-cols-2 gap-2 p-4 h-full">
                {recommendation.items.slice(0, 4).map((item, idx) => (
                  <div key={idx} className="relative rounded-lg overflow-hidden">
                    <OptimizedImage
                      src={item.photo_url || '/placeholder.svg'}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
              
              {/* Score Badge */}
              <div className="absolute top-2 right-2">
                <Badge variant="secondary" className="bg-background/90 backdrop-blur">
                  {Math.round(recommendation.score)}% Match
                </Badge>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
              {/* Metadata */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {recommendation.occasion && (
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span className="capitalize">{recommendation.occasion}</span>
                  </div>
                )}
                {recommendation.weather && (
                  <div className="flex items-center gap-1">
                    <Cloud className="w-4 h-4" />
                    <span className="capitalize">{recommendation.weather}</span>
                  </div>
                )}
              </div>

              {/* Reasoning */}
              <p className="text-sm">{recommendation.reasoning}</p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {recommendation.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() => saveOutfit(recommendation)}
                  disabled={isSaving}
                >
                  <Heart className="w-4 h-4 mr-1" />
                  Save Outfit
                </Button>
                <Button size="sm" variant="outline">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  View Details
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Insights Section */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          Your Style Insights
        </h3>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Most Worn Style</p>
            <p className="text-xl font-bold">Casual</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Favorite Colors</p>
            <div className="flex gap-2">
              <div className="w-6 h-6 rounded-full bg-black border-2 border-white" />
              <div className="w-6 h-6 rounded-full bg-blue-500 border-2 border-white" />
              <div className="w-6 h-6 rounded-full bg-gray-400 border-2 border-white" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Wardrobe Utilization</p>
            <p className="text-xl font-bold">67%</p>
          </div>
        </div>
      </Card>
    </div>
  );
};
