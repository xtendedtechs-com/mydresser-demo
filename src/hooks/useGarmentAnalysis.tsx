import { useState } from 'react';
import { garmentClassifier } from '@/services/aiModels/garmentClassifier';
import { colorExtractor, type ExtractedColor } from '@/services/aiModels/colorExtractor';
import { useToast } from '@/hooks/use-toast';

export interface GarmentAnalysis {
  category: string;
  confidence: number;
  colors: ExtractedColor[];
  dominantColor: string;
  suggestedTags: string[];
}

export const useGarmentAnalysis = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const analyzeGarment = async (imageUrl: string): Promise<GarmentAnalysis | null> => {
    setIsAnalyzing(true);
    
    try {
      // Run classification and color extraction in parallel
      const [classification, colors] = await Promise.all([
        garmentClassifier.classifyGarment(imageUrl),
        colorExtractor.extractColors(imageUrl, 5)
      ]);

      const dominantColor = colors[0]?.name || 'Unknown';
      
      // Generate suggested tags
      const suggestedTags = [
        classification.category,
        dominantColor.toLowerCase(),
        ...colors.slice(1, 3).map(c => c.name.toLowerCase())
      ].filter((tag, index, self) => self.indexOf(tag) === index);

      const analysis: GarmentAnalysis = {
        category: classification.category,
        confidence: classification.confidence,
        colors,
        dominantColor,
        suggestedTags
      };

      toast({
        title: 'Analysis Complete',
        description: `Detected: ${classification.category} (${Math.round(classification.confidence * 100)}% confidence)`,
      });

      return analysis;
    } catch (error) {
      console.error('Garment analysis error:', error);
      toast({
        title: 'Analysis Failed',
        description: 'Could not analyze the garment image',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  };

  return {
    analyzeGarment,
    isAnalyzing
  };
};
