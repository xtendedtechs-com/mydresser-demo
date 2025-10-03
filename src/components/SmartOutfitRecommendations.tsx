import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Sparkles, TrendingUp, Cloud } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useWardrobe } from '@/hooks/useWardrobe';
import { supabase } from '@/integrations/supabase/client';

interface OutfitRecommendation {
  name: string;
  items: string[];
  confidence_score: number;
  styling_tips: string;
  occasion_match?: number;
  weather_appropriate?: boolean;
}

export const SmartOutfitRecommendations = () => {
  const [occasion, setOccasion] = useState('casual');
  const [recommendations, setRecommendations] = useState<OutfitRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { items } = useWardrobe();

  const generateRecommendations = async () => {
    if (!items || items.length < 3) {
      toast({
        title: 'Need More Items',
        description: 'Add at least 3 items to your wardrobe to get AI recommendations',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-outfit-recommendations', {
        body: {
          wardrobeItems: items.map(item => ({
            name: item.name,
            category: item.category,
            color: item.color,
            brand: item.brand,
            season: item.season,
          })),
          occasion,
          weather: {
            temperature: 20,
            condition: 'mild',
          },
          preferences: null,
        },
      });

      if (error) throw error;

      if (data?.outfits) {
        setRecommendations(data.outfits);
        toast({
          title: 'Recommendations Generated',
          description: `Found ${data.outfits.length} outfit suggestions for you`,
        });
      }
    } catch (error: any) {
      console.error('Error generating recommendations:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to generate recommendations',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Smart Outfit Recommendations
          </CardTitle>
          <CardDescription>
            AI-powered outfit suggestions based on your wardrobe
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Select value={occasion} onValueChange={setOccasion}>
              <SelectTrigger className="flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="casual">Casual</SelectItem>
                <SelectItem value="business">Business</SelectItem>
                <SelectItem value="formal">Formal</SelectItem>
                <SelectItem value="party">Party</SelectItem>
                <SelectItem value="date">Date Night</SelectItem>
                <SelectItem value="workout">Workout</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              onClick={generateRecommendations} 
              disabled={loading || !items || items.length < 3}
            >
              {loading ? 'Generating...' : 'Get Recommendations'}
            </Button>
          </div>

          {items && items.length < 3 && (
            <p className="text-sm text-muted-foreground">
              Add at least 3 items to your wardrobe to unlock AI recommendations
            </p>
          )}
        </CardContent>
      </Card>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {recommendations.map((outfit, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{outfit.name}</CardTitle>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    {outfit.confidence_score}%
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Items:</h4>
                  <ul className="text-sm space-y-1">
                    {outfit.items.map((item, i) => (
                      <li key={i} className="text-muted-foreground">• {item}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">Styling Tips:</h4>
                  <p className="text-sm text-muted-foreground">{outfit.styling_tips}</p>
                </div>

                {outfit.weather_appropriate !== undefined && (
                  <Badge variant={outfit.weather_appropriate ? 'default' : 'secondary'}>
                    <Cloud className="w-3 h-3 mr-1" />
                    {outfit.weather_appropriate ? 'Weather Appropriate' : 'Check Weather'}
                  </Badge>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
