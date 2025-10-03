import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Loader2, TrendingUp, Palette, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useWardrobe } from "@/hooks/useWardrobe";

export const PersonalStyleReport = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [report, setReport] = useState<any>(null);
  const { items } = useWardrobe();
  const { toast } = useToast();

  const generateReport = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-style-consultant", {
        body: { 
          action: "generate_report",
          wardrobeItems: items 
        },
      });

      if (error) throw error;

      setReport(data.report);
      toast({
        title: "Report Generated",
        description: "Your personal style report is ready!",
      });
    } catch (error) {
      console.error("Report generation error:", error);
      toast({
        title: "Error",
        description: "Failed to generate style report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <CardTitle>Personal Style Report</CardTitle>
          </div>
          {report && (
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export PDF
            </Button>
          )}
        </div>
        <CardDescription>
          Get a comprehensive analysis of your personal style
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!report ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">
              Generate a detailed report analyzing your wardrobe, style preferences, and personalized recommendations.
            </p>
            <Button onClick={generateReport} disabled={isGenerating} size="lg">
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Report...
                </>
              ) : (
                <>
                  <FileText className="mr-2 h-4 w-4" />
                  Generate My Style Report
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Style Score */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-lg font-semibold flex items-center gap-2">
                  <Star className="h-5 w-5 text-primary" />
                  Overall Style Score
                </Label>
                <span className="text-2xl font-bold text-primary">
                  {report.styleScore}/100
                </span>
              </div>
              <Progress value={report.styleScore} className="h-3" />
            </div>

            {/* Style Profile */}
            <div className="space-y-3">
              <Label className="text-lg font-semibold flex items-center gap-2">
                <Palette className="h-5 w-5 text-primary" />
                Your Style Profile
              </Label>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Dominant Style</p>
                  <p className="font-semibold mt-1">{report.dominantStyle}</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Color Palette</p>
                  <p className="font-semibold mt-1">{report.colorPalette}</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Wardrobe Size</p>
                  <p className="font-semibold mt-1">{report.wardrobeSize} items</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Versatility Score</p>
                  <p className="font-semibold mt-1">{report.versatilityScore}/10</p>
                </div>
              </div>
            </div>

            {/* Strengths */}
            <div className="space-y-3">
              <Label className="text-lg font-semibold flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Your Style Strengths
              </Label>
              <div className="flex flex-wrap gap-2">
                {report.strengths?.map((strength: string, idx: number) => (
                  <Badge key={idx} variant="default">
                    {strength}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div className="space-y-3">
              <Label className="text-lg font-semibold">Growth Opportunities</Label>
              <ul className="space-y-2">
                {report.recommendations?.map((rec: string, idx: number) => (
                  <li key={idx} className="flex gap-2 text-sm">
                    <span className="text-primary">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const Label = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={className}>{children}</div>
);
