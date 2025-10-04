import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Loader2, TrendingUp, Lightbulb, Palette, ShoppingBag } from 'lucide-react';
import { useWardrobe } from '@/hooks/useWardrobe';
import { useOutfits } from '@/hooks/useOutfits';
import { useStylePreferences } from '@/hooks/useStylePreferences';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const AIStyleInsights = () => {
  const { items } = useWardrobe();
  const { outfits } = useOutfits();
  const { preferences } = useStylePreferences();
  const { toast } = useToast();
  const [insights, setInsights] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const generateInsights = async () => {
    setLoading(true);
    try {
      // Prepare wardrobe data
      const wardrobeData = {
        totalItems: items.length,
        categories: items.reduce((acc: any, item) => {
          acc[item.category] = (acc[item.category] || 0) + 1;
          return acc;
        }, {}),
        colors: items.reduce((acc: any, item) => {
          if (item.color) acc[item.color] = (acc[item.color] || 0) + 1;
          return acc;
        }, {}),
        brands: items.reduce((acc: any, item) => {
          if (item.brand) acc[item.brand] = (acc[item.brand] || 0) + 1;
          return acc;
        }, {}),
      };

      // Get recent outfits
      const recentOutfits = outfits.slice(0, 10).map(outfit => ({
        name: outfit.name,
        occasion: outfit.occasion,
        season: outfit.season,
        is_favorite: outfit.is_favorite,
      }));

      const { data, error } = await supabase.functions.invoke('ai-style-insights', {
        body: {
          wardrobeData,
          recentOutfits,
          preferences: preferences || {},
        },
      });

      if (error) throw error;

      setInsights(data.insights);
      toast({
        title: 'Insights Generated',
        description: 'Your personalized style insights are ready!',
      });
    } catch (error: any) {
      console.error('Error generating insights:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to generate insights',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const parseInsights = (text: string) => {
    const sections = text.split(/\d+\.\s+/).filter(Boolean);
    return sections.map((section, index) => {
      const [title, ...content] = section.split(':');
      return {
        title: title.trim(),
        content: content.join(':').trim(),
      };
    });
  };

  const getSectionIcon = (title: string) => {
    if (title.toLowerCase().includes('identity')) return <Sparkles className="w-5 h-5" />;
    if (title.toLowerCase().includes('strength')) return <TrendingUp className="w-5 h-5" />;
    if (title.toLowerCase().includes('gap') || title.toLowerCase().includes('opportunit')) return <ShoppingBag className="w-5 h-5" />;
    if (title.toLowerCase().includes('color')) return <Palette className="w-5 h-5" />;
    if (title.toLowerCase().includes('tip')) return <Lightbulb className="w-5 h-5" />;
    return <Sparkles className="w-5 h-5" />;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            AI Style Insights
          </CardTitle>
          <CardDescription>
            Get personalized analysis of your style and wardrobe composition
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!insights ? (
            <div className="text-center py-8">
              <Sparkles className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">
                Generate AI-powered insights about your personal style, wardrobe strengths, and opportunities for growth
              </p>
              <Button onClick={generateInsights} disabled={loading || items.length === 0}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Insights
                  </>
                )}
              </Button>
              {items.length === 0 && (
                <p className="text-sm text-muted-foreground mt-4">
                  Add items to your wardrobe to get personalized insights
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <Badge variant="secondary" className="text-sm">
                  <Sparkles className="w-3 h-3 mr-1" />
                  AI Generated
                </Badge>
                <Button variant="outline" size="sm" onClick={generateInsights} disabled={loading}>
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Refresh Insights'
                  )}
                </Button>
              </div>

              <div className="space-y-4">
                {parseInsights(insights).map((section, index) => (
                  <Card key={index}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {getSectionIcon(section.title)}
                        {section.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {section.content}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
