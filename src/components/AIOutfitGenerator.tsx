import { useState } from 'react';
import { Sparkles, Calendar, Cloud, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { myDresserAI } from '@/services/myDresserAI';
import { myDresserWeather } from '@/services/myDresserWeather';
import { supabase } from '@/integrations/supabase/client';

interface AIOutfitGeneratorProps {
  wardrobeItems: any[];
  onOutfitGenerated?: (outfit: any) => void;
}

export const AIOutfitGenerator = ({ wardrobeItems, onOutfitGenerated }: AIOutfitGeneratorProps) => {
  const [generating, setGenerating] = useState(false);
  const [occasion, setOccasion] = useState<string>('casual');
  const [weather, setWeather] = useState<string>('moderate');
  const { toast } = useToast();

  const generateOutfit = async () => {
    if (wardrobeItems.length < 3) {
      toast({
        title: 'Not Enough Items',
        description: 'Add at least 3 items to your wardrobe to generate outfits',
        variant: 'destructive'
      });
      return;
    }

    setGenerating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Generate style profile
      const styleProfile = await myDresserAI.generatePersonalStyleProfile(wardrobeItems);

      // Get weather data
      const weatherData = myDresserWeather.generateWeatherData('Current Location');

      // Generate recommendations
      const recommendations = await myDresserAI.generateSmartRecommendations(
        wardrobeItems,
        styleProfile,
        {
          occasion,
          weather: weatherData,
          time: new Date().toISOString()
        }
      );

      const outfitRecs = recommendations.filter(r => r.type === 'outfit');
      
      if (outfitRecs.length === 0) {
        toast({
          title: 'No Outfits Found',
          description: 'Try adding more diverse items to your wardrobe',
          variant: 'destructive'
        });
        return;
      }

      // Take the first recommendation and create an outfit
      const bestOutfit = outfitRecs[0];
      
      // Determine season from current month
      const currentMonth = new Date().getMonth();
      const season = currentMonth >= 2 && currentMonth <= 4 ? 'spring' :
                     currentMonth >= 5 && currentMonth <= 7 ? 'summer' :
                     currentMonth >= 8 && currentMonth <= 10 ? 'fall' : 'winter';

      // Create outfit in database
      const { data: outfit, error } = await supabase
        .from('outfits')
        .insert({
          user_id: user.id,
          name: bestOutfit.title,
          occasion: occasion,
          season: season,
          is_ai_generated: true,
          ai_generation_prompt: bestOutfit.description,
          weather_conditions: weatherData as any
        })
        .select()
        .single();

      if (error) throw error;

      // Add items to outfit (parse from recommendation)
      const itemIds = wardrobeItems.slice(0, 4).map(item => item.id);
      for (const itemId of itemIds) {
        await supabase
          .from('outfit_items')
          .insert({
            outfit_id: outfit.id,
            wardrobe_item_id: itemId
          });
      }

      toast({
        title: 'Outfit Generated! ✨',
        description: bestOutfit.title
      });

      if (onOutfitGenerated) {
        onOutfitGenerated(outfit);
      }

    } catch (error) {
      console.error('Outfit generation error:', error);
      toast({
        title: 'Generation Failed',
        description: 'Could not generate outfit. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">AI Outfit Generator</h3>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">
            <Calendar className="w-4 h-4 inline mr-1" />
            Occasion
          </label>
          <Select value={occasion} onValueChange={setOccasion}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="casual">Casual</SelectItem>
              <SelectItem value="business">Business</SelectItem>
              <SelectItem value="formal">Formal</SelectItem>
              <SelectItem value="athletic">Athletic</SelectItem>
              <SelectItem value="date">Date Night</SelectItem>
              <SelectItem value="party">Party</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">
            <Cloud className="w-4 h-4 inline mr-1" />
            Weather
          </label>
          <Select value={weather} onValueChange={setWeather}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hot">Hot (25°C+)</SelectItem>
              <SelectItem value="moderate">Moderate (15-25°C)</SelectItem>
              <SelectItem value="cool">Cool (5-15°C)</SelectItem>
              <SelectItem value="cold">Cold (below 5°C)</SelectItem>
              <SelectItem value="rainy">Rainy</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button 
          onClick={generateOutfit}
          disabled={generating || wardrobeItems.length < 3}
          className="w-full"
        >
          {generating ? (
            <>
              <Sparkles className="w-4 h-4 mr-2 animate-spin" />
              Generating Perfect Outfit...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate AI Outfit
            </>
          )}
        </Button>

        {wardrobeItems.length < 3 && (
          <p className="text-xs text-muted-foreground text-center">
            Add at least 3 items to unlock AI outfit generation
          </p>
        )}
      </div>
    </Card>
  );
};
