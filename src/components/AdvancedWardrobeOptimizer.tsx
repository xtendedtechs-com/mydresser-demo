import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles,
  ShoppingBag,
  Shirt,
  Package,
  BarChart3
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useWardrobe } from "@/hooks/useWardrobe";

interface GapAnalysis {
  category: string;
  current: number;
  recommended: number;
  gap: number;
  priority: 'high' | 'medium' | 'low';
  suggestions: string[];
}

interface OptimizationScore {
  overall: number;
  versatility: number;
  balance: number;
  quality: number;
  sustainability: number;
}

const AdvancedWardrobeOptimizer = () => {
  const [gaps, setGaps] = useState<GapAnalysis[]>([]);
  const [scores, setScores] = useState<OptimizationScore>({
    overall: 0,
    versatility: 0,
    balance: 0,
    quality: 0,
    sustainability: 0
  });
  const [loading, setLoading] = useState(false);
  const { items } = useWardrobe();
  const { toast } = useToast();

  useEffect(() => {
    if (items.length > 0) {
      analyzeWardrobe();
    }
  }, [items]);

  const analyzeWardrobe = async () => {
    setLoading(true);
    try {
      // Analyze wardrobe composition
      const categoryCounts: { [key: string]: number } = {};
      items.forEach(item => {
        categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
      });

      // Define ideal wardrobe composition
      const idealComposition: { [key: string]: number } = {
        'tops': 12,
        'bottoms': 8,
        'dresses': 6,
        'outerwear': 4,
        'shoes': 6,
        'accessories': 10
      };

      // Calculate gaps
      const gapAnalysis: GapAnalysis[] = Object.entries(idealComposition).map(([category, recommended]) => {
        const current = categoryCounts[category] || 0;
        const gap = Math.max(0, recommended - current);
        const priority = gap > 4 ? 'high' : gap > 2 ? 'medium' : 'low';

        return {
          category,
          current,
          recommended,
          gap,
          priority,
          suggestions: generateSuggestions(category, gap)
        };
      });

      setGaps(gapAnalysis.sort((a, b) => b.gap - a.gap));

      // Calculate optimization scores
      const versatilityScore = calculateVersatilityScore(items);
      const balanceScore = calculateBalanceScore(categoryCounts, idealComposition);
      const qualityScore = calculateQualityScore(items);
      const sustainabilityScore = calculateSustainabilityScore(items);
      const overallScore = Math.round((versatilityScore + balanceScore + qualityScore + sustainabilityScore) / 4);

      setScores({
        overall: overallScore,
        versatility: versatilityScore,
        balance: balanceScore,
        quality: qualityScore,
        sustainability: sustainabilityScore
      });

    } catch (error) {
      console.error('Error analyzing wardrobe:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateSuggestions = (category: string, gap: number): string[] => {
    const suggestions: { [key: string]: string[] } = {
      tops: ['Basic white t-shirt', 'Button-down shirt', 'Casual sweater', 'Blouse'],
      bottoms: ['Dark jeans', 'Black trousers', 'Casual shorts', 'Skirt'],
      dresses: ['Little black dress', 'Casual day dress', 'Maxi dress'],
      outerwear: ['Denim jacket', 'Light cardigan', 'Winter coat', 'Blazer'],
      shoes: ['White sneakers', 'Black boots', 'Comfortable flats', 'Dress shoes'],
      accessories: ['Statement necklace', 'Leather bag', 'Sunglasses', 'Watch', 'Scarf']
    };

    return (suggestions[category] || []).slice(0, gap);
  };

  const calculateVersatilityScore = (items: any[]): number => {
    // Items with neutral colors and basic styles score higher
    const versatileColors = ['black', 'white', 'navy', 'gray', 'beige'];
    const versatileItems = items.filter(item => 
      versatileColors.some(color => item.color?.toLowerCase().includes(color))
    );
    return Math.min(100, Math.round((versatileItems.length / Math.max(items.length, 1)) * 100));
  };

  const calculateBalanceScore = (current: { [key: string]: number }, ideal: { [key: string]: number }): number => {
    let totalDiff = 0;
    let totalIdeal = 0;

    Object.entries(ideal).forEach(([category, idealCount]) => {
      const currentCount = current[category] || 0;
      totalDiff += Math.abs(currentCount - idealCount);
      totalIdeal += idealCount;
    });

    const balanceRatio = 1 - (totalDiff / (totalIdeal * 2));
    return Math.max(0, Math.min(100, Math.round(balanceRatio * 100)));
  };

  const calculateQualityScore = (items: any[]): number => {
    // Items marked as favorite or with high wear count indicate quality
    const qualityItems = items.filter(item => item.is_favorite || (item.wear_count && item.wear_count > 5));
    return Math.min(100, Math.round((qualityItems.length / Math.max(items.length, 1)) * 100));
  };

  const calculateSustainabilityScore = (items: any[]): number => {
    // Mock calculation - in production, check for eco tags, second-hand, etc.
    const sustainableItems = items.filter(item => 
      item.tags?.some((tag: string) => ['sustainable', 'eco', 'organic', 'recycled'].includes(tag.toLowerCase()))
    );
    return Math.min(100, Math.round((sustainableItems.length / Math.max(items.length, 1)) * 100));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'medium': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'low': return 'bg-green-500/10 text-green-500 border-green-500/20';
      default: return 'bg-muted';
    }
  };

  const ScoreCard = ({ title, score, icon: Icon }: { title: string; score: number; icon: any }) => (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">{title}</span>
        </div>
        <Badge variant={score >= 80 ? "default" : score >= 60 ? "secondary" : "destructive"}>
          {score}%
        </Badge>
      </div>
      <Progress value={score} className="h-2" />
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-primary" />
            Wardrobe Optimizer
          </h2>
          <p className="text-muted-foreground">AI-powered insights to perfect your wardrobe</p>
        </div>
        <Button onClick={analyzeWardrobe} disabled={loading}>
          <Sparkles className="w-4 h-4 mr-2" />
          Analyze
        </Button>
      </div>

      {/* Overall Score */}
      <Card className="p-6 bg-gradient-to-br from-primary/10 to-accent/10">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-1">Overall Optimization Score</h3>
            <p className="text-sm text-muted-foreground">Based on versatility, balance, quality & sustainability</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-primary">{scores.overall}%</div>
            <Badge variant={scores.overall >= 80 ? "default" : "secondary"} className="mt-2">
              {scores.overall >= 80 ? 'Excellent' : scores.overall >= 60 ? 'Good' : 'Needs Work'}
            </Badge>
          </div>
        </div>
      </Card>

      {/* Detailed Scores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <ScoreCard title="Versatility" score={scores.versatility} icon={Sparkles} />
        <ScoreCard title="Balance" score={scores.balance} icon={BarChart3} />
        <ScoreCard title="Quality" score={scores.quality} icon={CheckCircle2} />
        <ScoreCard title="Sustainability" score={scores.sustainability} icon={Package} />
      </div>

      {/* Gap Analysis */}
      <Tabs defaultValue="gaps" className="w-full">
        <TabsList>
          <TabsTrigger value="gaps">Wardrobe Gaps</TabsTrigger>
          <TabsTrigger value="recommendations">AI Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="gaps" className="space-y-3 mt-4">
          {gaps.length > 0 ? (
            gaps.map((gap, idx) => (
              <Card key={idx} className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Shirt className="w-5 h-5 text-primary" />
                      <h4 className="font-semibold capitalize">{gap.category}</h4>
                      <Badge className={getPriorityColor(gap.priority)}>
                        {gap.priority} priority
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 mb-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">Current: </span>
                        <span className="font-medium">{gap.current}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Recommended: </span>
                        <span className="font-medium">{gap.recommended}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Gap: </span>
                        <span className="font-medium text-primary">{gap.gap}</span>
                      </div>
                    </div>

                    {gap.suggestions.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Suggestions:</p>
                        <div className="flex flex-wrap gap-2">
                          {gap.suggestions.map((suggestion, i) => (
                            <Badge key={i} variant="outline">
                              {suggestion}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {gap.gap > 0 && (
                    <Button size="sm" variant="outline">
                      <ShoppingBag className="w-4 h-4 mr-2" />
                      Shop
                    </Button>
                  )}
                </div>
              </Card>
            ))
          ) : (
            <Card className="p-8 text-center">
              <CheckCircle2 className="w-12 h-12 mx-auto text-green-500 mb-3" />
              <p className="font-semibold mb-1">Your wardrobe is well-balanced!</p>
              <p className="text-sm text-muted-foreground">No major gaps detected</p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-3 mt-4">
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold mb-1">Focus on Basics</h4>
                  <p className="text-sm text-muted-foreground">
                    Build a foundation with versatile neutral pieces that work with everything
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold mb-1">Quality Over Quantity</h4>
                  <p className="text-sm text-muted-foreground">
                    Invest in well-made pieces that will last longer and look better
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold mb-1">Add Statement Pieces</h4>
                  <p className="text-sm text-muted-foreground">
                    Include a few unique items to express your personal style
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedWardrobeOptimizer;
