import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, Wand2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";

const styleGoals = [
  { id: "professional", label: "More Professional", description: "Elevate your work wardrobe" },
  { id: "casual", label: "More Casual", description: "Relaxed and comfortable" },
  { id: "trendy", label: "More Trendy", description: "Stay on top of fashion" },
  { id: "classic", label: "More Classic", description: "Timeless elegance" },
  { id: "bold", label: "More Bold", description: "Express your personality" },
  { id: "minimalist", label: "More Minimalist", description: "Simple and refined" },
];

export const StyleTransformationTool = () => {
  const [selectedGoal, setSelectedGoal] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recommendations, setRecommendations] = useState<any>(null);
  const { toast } = useToast();

  const handleAnalyze = async () => {
    if (!selectedGoal) return;

    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-style-transform", {
        body: { styleGoal: selectedGoal },
      });

      if (error) throw error;

      setRecommendations(data);
      toast({
        title: "Analysis Complete",
        description: "Your style transformation plan is ready!",
      });
    } catch (error) {
      console.error("Style transformation error:", error);
      toast({
        title: "Error",
        description: "Failed to generate transformation plan. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Wand2 className="h-5 w-5 text-primary" />
          <CardTitle>Style Transformation</CardTitle>
        </div>
        <CardDescription>
          Transform your style with AI-powered recommendations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <Label>Choose Your Style Goal</Label>
          <RadioGroup value={selectedGoal} onValueChange={setSelectedGoal}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {styleGoals.map((goal) => (
                <div
                  key={goal.id}
                  className={`flex items-start space-x-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedGoal === goal.id
                      ? "border-primary bg-primary/5"
                      : "hover:border-primary/50"
                  }`}
                  onClick={() => setSelectedGoal(goal.id)}
                >
                  <RadioGroupItem value={goal.id} id={goal.id} className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor={goal.id} className="cursor-pointer font-medium">
                      {goal.label}
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {goal.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </RadioGroup>
        </div>

        <Button
          onClick={handleAnalyze}
          disabled={!selectedGoal || isAnalyzing}
          className="w-full"
          size="lg"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing Your Style...
            </>
          ) : (
            <>
              <Wand2 className="mr-2 h-4 w-4" />
              Generate Transformation Plan
            </>
          )}
        </Button>

        {recommendations && (
          <div className="space-y-4 pt-4 border-t">
            <h3 className="font-semibold">Your Transformation Plan</h3>
            
            <div className="space-y-3">
              <div>
                <Label className="text-sm">Items to Keep</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {recommendations.itemsToKeep?.map((item: string, idx: number) => (
                    <Badge key={idx} variant="secondary">
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-sm">Items to Add</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {recommendations.itemsToAdd?.map((item: string, idx: number) => (
                    <Badge key={idx} variant="default">
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-sm">Style Tips</Label>
                <ul className="list-disc list-inside space-y-1 mt-2 text-sm text-muted-foreground">
                  {recommendations.styleTips?.map((tip: string, idx: number) => (
                    <li key={idx}>{tip}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
