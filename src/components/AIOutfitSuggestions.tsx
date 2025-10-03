import { useState } from 'react';
import { Sparkles, RefreshCw, Calendar, Cloud } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useWardrobe } from '@/hooks/useWardrobe';
import { useToast } from '@/hooks/use-toast';

export const AIOutfitSuggestions = () => {
  const { items } = useWardrobe();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [occasion, setOccasion] = useState('casual');
  const [temperature, setTemperature] = useState('20');

  const generateSuggestion = async () => {
    if (items.length < 3) {
      toast({
        title: 'Not enough items',
        description: 'You need at least 3 items in your wardrobe for AI suggestions.',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    setSuggestion(null);

    try {
      const FUNCTION_URL = 'https://bdfyrtobxkwxobjspxjo.supabase.co/functions/v1/ai-outfit-suggestions';
      
      const response = await fetch(FUNCTION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJkZnlydG9ieGt3eG9ianNweGpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3NjU3NzEsImV4cCI6MjA3MzM0MTc3MX0.Ck8RUCFUdezGr46gj_4caj-kBegzp_O7nzqR0AelCmc'
        },
        body: JSON.stringify({
          wardrobeItems: items.map(item => ({
            id: item.id,
            category: item.category,
            name: item.name,
            color: item.color,
            brand: item.brand,
            condition: item.condition,
            season: item.season
          })),
          occasion,
          weather: {
            temperature: parseInt(temperature),
            condition: 'clear'
          }
        })
      });

      if (response.status === 429) {
        toast({
          title: 'Rate limit exceeded',
          description: 'Please wait a moment before generating another suggestion.',
          variant: 'destructive'
        });
        return;
      }

      if (response.status === 402) {
        toast({
          title: 'AI credits depleted',
          description: 'Please add credits to continue using AI features.',
          variant: 'destructive'
        });
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to generate suggestion');
      }

      const data = await response.json();
      setSuggestion(data.suggestion);
      
      toast({
        title: 'Outfit generated! ✨',
        description: 'Your personalized AI outfit is ready'
      });

    } catch (error) {
      console.error('Suggestion error:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate suggestion. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          AI Outfit Suggestions
        </CardTitle>
        <CardDescription>
          Get personalized outfit recommendations powered by AI
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Controls */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block flex items-center gap-2">
              <Calendar className="h-4 w-4" />
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
                <SelectItem value="date">Date Night</SelectItem>
                <SelectItem value="party">Party</SelectItem>
                <SelectItem value="sport">Sport/Athletic</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block flex items-center gap-2">
              <Cloud className="h-4 w-4" />
              Temperature (°C)
            </label>
            <Select value={temperature} onValueChange={setTemperature}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="-5">-5°C (Very Cold)</SelectItem>
                <SelectItem value="5">5°C (Cold)</SelectItem>
                <SelectItem value="15">15°C (Cool)</SelectItem>
                <SelectItem value="20">20°C (Mild)</SelectItem>
                <SelectItem value="25">25°C (Warm)</SelectItem>
                <SelectItem value="30">30°C (Hot)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button 
          onClick={generateSuggestion} 
          disabled={loading || items.length < 3}
          className="w-full"
          size="lg"
        >
          {loading ? (
            <>
              <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-5 w-5" />
              Generate AI Outfit
            </>
          )}
        </Button>

        {/* Suggestion Display */}
        {suggestion && (
          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <div className="prose prose-sm max-w-none">
                <p className="whitespace-pre-wrap text-sm">{suggestion}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {items.length < 3 && (
          <p className="text-sm text-muted-foreground text-center">
            Add at least 3 items to your wardrobe to use AI suggestions
          </p>
        )}
      </CardContent>
    </Card>
  );
};
