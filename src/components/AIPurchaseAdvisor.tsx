import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, AlertCircle, CheckCircle2, TrendingUp, DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useWardrobe } from "@/hooks/useWardrobe";

interface PurchaseAnalysis {
  recommendation: 'buy' | 'wait' | 'skip';
  score: number;
  reasons: string[];
  alternativeSuggestions: string[];
  costPerWear: number;
  wardrobeGapFill: string;
  versatilityScore: number;
}

export const AIPurchaseAdvisor = () => {
  const [itemName, setItemName] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [itemDescription, setItemDescription] = useState("");
  const [analysis, setAnalysis] = useState<PurchaseAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { items } = useWardrobe();

  const analyzePurchase = async () => {
    if (!itemName || !itemPrice) {
      toast.error("Please provide item name and price");
      return;
    }

    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-purchase-analyzer', {
        body: {
          itemToAnalyze: {
            name: itemName,
            price: parseFloat(itemPrice),
            description: itemDescription
          },
          wardrobeData: items.map(item => ({
            category: item.category,
            brand: item.brand,
            color: item.color,
            tags: item.tags,
            wear_count: item.wear_count,
            price: item.purchase_price
          })),
          budget: {
            monthly: 500,
            preferred_price_range: [50, 200]
          }
        }
      });

      if (error) throw error;

      setAnalysis(data);
      toast.success("Purchase analysis complete!");
    } catch (error) {
      console.error('Purchase analysis error:', error);
      toast.error("Failed to analyze purchase. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getRecommendationColor = (rec: string) => {
    switch (rec) {
      case 'buy': return 'bg-green-500';
      case 'wait': return 'bg-yellow-500';
      case 'skip': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getRecommendationIcon = (rec: string) => {
    switch (rec) {
      case 'buy': return <CheckCircle2 className="h-5 w-5" />;
      case 'wait': return <AlertCircle className="h-5 w-5" />;
      case 'skip': return <AlertCircle className="h-5 w-5" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-primary" />
            AI Purchase Advisor
          </CardTitle>
          <CardDescription>
            Get intelligent recommendations before making a purchase
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="itemName">Item Name</Label>
            <Input
              id="itemName"
              placeholder="e.g., Black Leather Jacket"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="itemPrice">Price ($)</Label>
            <Input
              id="itemPrice"
              type="number"
              placeholder="199.99"
              value={itemPrice}
              onChange={(e) => setItemPrice(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="itemDescription">Description (Optional)</Label>
            <Textarea
              id="itemDescription"
              placeholder="Add details about style, material, brand..."
              value={itemDescription}
              onChange={(e) => setItemDescription(e.target.value)}
              rows={3}
            />
          </div>

          <Button
            onClick={analyzePurchase}
            disabled={isAnalyzing}
            className="w-full"
          >
            {isAnalyzing ? "Analyzing..." : "Analyze Purchase"}
          </Button>
        </CardContent>
      </Card>

      {analysis && (
        <Card>
          <CardContent className="pt-6 space-y-6">
            {/* Recommendation Badge */}
            <div className="flex items-center justify-center">
              <Badge
                className={`${getRecommendationColor(analysis.recommendation)} text-white text-lg px-6 py-2`}
              >
                <span className="mr-2">{getRecommendationIcon(analysis.recommendation)}</span>
                {analysis.recommendation.toUpperCase()}
              </Badge>
            </div>

            {/* Score Metrics */}
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="pt-6 text-center">
                  <TrendingUp className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <div className="text-2xl font-bold">{analysis.score}%</div>
                  <div className="text-sm text-text-muted">Overall Score</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <DollarSign className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <div className="text-2xl font-bold">${analysis.costPerWear.toFixed(2)}</div>
                  <div className="text-sm text-text-muted">Cost Per Wear</div>
                </CardContent>
              </Card>
            </div>

            {/* Reasons */}
            <div>
              <h3 className="font-semibold mb-3">Analysis</h3>
              <ul className="space-y-2">
                {analysis.reasons.map((reason, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Wardrobe Gap */}
            {analysis.wardrobeGapFill && (
              <div>
                <h3 className="font-semibold mb-2">Wardrobe Impact</h3>
                <p className="text-sm text-text-muted">{analysis.wardrobeGapFill}</p>
              </div>
            )}

            {/* Versatility */}
            <div>
              <h3 className="font-semibold mb-2">Versatility Score</h3>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-background-subtle rounded-full h-2">
                  <div
                    className="bg-primary h-full rounded-full transition-all"
                    style={{ width: `${analysis.versatilityScore}%` }}
                  />
                </div>
                <span className="text-sm font-medium">{analysis.versatilityScore}%</span>
              </div>
            </div>

            {/* Alternative Suggestions */}
            {analysis.alternativeSuggestions.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">Alternative Suggestions</h3>
                <div className="space-y-2">
                  {analysis.alternativeSuggestions.map((suggestion, i) => (
                    <div key={i} className="p-3 bg-background-subtle rounded-lg text-sm">
                      {suggestion}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
