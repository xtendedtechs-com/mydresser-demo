import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import { useGarmentAnalysis } from '@/hooks/useGarmentAnalysis';
import { Card } from '@/components/ui/card';

interface AIAnalysisButtonProps {
  imageUrl: string;
  onAnalysisComplete?: (analysis: any) => void;
}

export const AIAnalysisButton = ({ imageUrl, onAnalysisComplete }: AIAnalysisButtonProps) => {
  const { analyzeGarment, isAnalyzing } = useGarmentAnalysis();

  const handleAnalyze = async () => {
    const analysis = await analyzeGarment(imageUrl);
    if (analysis && onAnalysisComplete) {
      onAnalysisComplete(analysis);
    }
  };

  return (
    <Button
      onClick={handleAnalyze}
      disabled={isAnalyzing || !imageUrl}
      variant="outline"
      className="gap-2"
    >
      <Sparkles className="h-4 w-4" />
      {isAnalyzing ? 'Analyzing...' : 'AI Analyze'}
    </Button>
  );
};

interface ColorPaletteProps {
  colors: Array<{ hex: string; name: string; percentage: number }>;
}

export const ColorPalette = ({ colors }: ColorPaletteProps) => {
  if (!colors || colors.length === 0) return null;

  return (
    <Card className="p-4">
      <h4 className="text-sm font-medium mb-3">Detected Colors</h4>
      <div className="flex gap-2 flex-wrap">
        {colors.map((color, index) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-full border-2 border-border"
              style={{ backgroundColor: color.hex }}
              title={`${color.name} (${color.percentage}%)`}
            />
            <div className="text-xs">
              <div className="font-medium">{color.name}</div>
              <div className="text-muted-foreground">{color.percentage}%</div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
