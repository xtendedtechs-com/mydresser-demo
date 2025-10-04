import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useWardrobe } from '@/hooks/useWardrobe';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, TrendingUp, ShoppingBag, Palette, Package, Loader2 } from 'lucide-react';

export const AIWardrobeAnalyzer = () => {
  const { items } = useWardrobe();
  const { toast } = useToast();
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const analyzeWardrobe = async () => {
    if (!items || items.length === 0) {
      toast({
        title: 'Empty Wardrobe',
        description: 'Add some items to your wardrobe first',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-wardrobe-analysis', {
        body: { wardrobeItems: items }
      });

      if (error) throw error;

      // Parse the AI response
      let parsedAnalysis;
      try {
        parsedAnalysis = JSON.parse(data.analysis);
      } catch {
        // If not JSON, structure it manually
        parsedAnalysis = {
          healthScore: 75,
          summary: data.analysis,
          categories: {},
          recommendations: []
        };
      }

      setAnalysis(parsedAnalysis);
      
      toast({
        title: 'Analysis Complete',
        description: 'Your wardrobe has been analyzed',
      });
    } catch (error: any) {
      console.error('Analysis error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to analyze wardrobe',
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
            <Sparkles className="h-5 w-5 text-primary" />
            AI Wardrobe Analysis
          </CardTitle>
          <CardDescription>
            Get comprehensive insights about your wardrobe composition, style, and optimization opportunities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={analyzeWardrobe} 
            disabled={loading || !items?.length}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Analyze My Wardrobe
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {analysis && (
        <div className="space-y-4">
          {/* Health Score */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Wardrobe Health Score
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold">{analysis.healthScore || 75}/100</span>
                <Badge variant={analysis.healthScore >= 80 ? 'default' : 'secondary'}>
                  {analysis.healthScore >= 80 ? 'Excellent' : 'Good'}
                </Badge>
              </div>
              <Progress value={analysis.healthScore || 75} className="h-2" />
            </CardContent>
          </Card>

          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Analysis Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {analysis.summary || analysis.analysis}
              </p>
            </CardContent>
          </Card>

          {/* Color Palette */}
          {analysis.colorPalette && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Color Palette
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {analysis.colorPalette.map((color: string, idx: number) => (
                    <Badge key={idx} variant="outline">{color}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recommendations */}
          {analysis.recommendations && analysis.recommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5" />
                  Smart Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.recommendations.map((rec: string, idx: number) => (
                    <li key={idx} className="text-sm flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};