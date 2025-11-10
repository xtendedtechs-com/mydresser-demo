import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Loader2, Camera, Sparkles, Settings2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { WardrobeItem } from "@/hooks/useWardrobe";
import { getPrimaryPhotoUrl } from "@/utils/photoHelpers";
import { localVTO, VTOConfig } from "@/services/localVTO";
import { SizeRecommendation } from "@/services/sizeRecommendation";

interface DailyOutfitWithVTOProps {
  outfit: {
    id: string;
    items: WardrobeItem[];
    name: string;
    reasoning: string;
    confidence: number;
  };
  userPhoto?: string | null;
}

const DailyOutfitWithVTO = ({ outfit, userPhoto }: DailyOutfitWithVTOProps) => {
  const [vtoImage, setVtoImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [sizeRecommendations, setSizeRecommendations] = useState<SizeRecommendation[]>([]);
  const [processingTime, setProcessingTime] = useState<number>(0);
  const [showAdjustments, setShowAdjustments] = useState(false);
  const [adjustments, setAdjustments] = useState<VTOConfig['manualAdjustments']>({});
  const { toast } = useToast();

  useEffect(() => {
    if (userPhoto && outfit.items.length > 0) {
      generateVTO();
    }
  }, [outfit.id, userPhoto]);

  const generateVTO = async () => {
    if (!userPhoto) return;

    setIsGenerating(true);
    try {
      const result = await localVTO.generateVTO({
        userImage: userPhoto,
        clothingItems: outfit.items.map(item => ({
          id: item.id,
          name: item.name,
          category: item.category,
          photo: getPrimaryPhotoUrl(item.photos, item.category)
        })),
        manualAdjustments: adjustments
      });

      setVtoImage(result.imageUrl);
      setSizeRecommendations(result.sizeRecommendations);
      setProcessingTime(result.processingTime);
      
      toast({
        title: "Virtual Try-On Ready",
        description: `Generated in ${(result.processingTime / 1000).toFixed(1)}s with size recommendations!`
      });
    } catch (error: any) {
      console.error('VTO generation error:', error);
      toast({
        title: "VTO Generation Failed",
        description: error.message || "Could not detect pose in image. Make sure the full body is visible.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  if (!userPhoto) {
    return (
      <Card className="p-6 bg-muted/50">
        <div className="text-center space-y-2">
          <Camera className="w-12 h-12 mx-auto text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Upload a photo to see yourself in this outfit
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-[3/4] bg-muted">
        {isGenerating ? (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80">
            <div className="text-center space-y-2">
              <Loader2 className="w-8 h-8 animate-spin mx-auto" />
              <p className="text-sm text-muted-foreground">Generating virtual try-on...</p>
            </div>
          </div>
        ) : vtoImage ? (
          <img
            src={vtoImage}
            alt="Virtual Try-On"
            className="w-full h-full object-cover"
          />
        ) : (
          <img
            src={userPhoto}
            alt="Your Photo"
            className="w-full h-full object-cover"
          />
        )}
        
        <div className="absolute top-2 left-2 flex gap-2">
          <Badge variant="secondary" className="bg-primary text-primary-foreground">
            <Sparkles className="w-3 h-3 mr-1" />
            AI Try-On
          </Badge>
          {processingTime > 0 && (
            <Badge variant="outline" className="bg-background/80">
              {(processingTime / 1000).toFixed(1)}s
            </Badge>
          )}
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <Badge variant="outline">{outfit.confidence}% Match</Badge>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => setShowAdjustments(!showAdjustments)}
            >
              <Settings2 className="w-4 h-4" />
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={generateVTO}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>Regenerate</>
              )}
            </Button>
          </div>
        </div>

        {sizeRecommendations.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Size Recommendations:</p>
            <div className="flex flex-wrap gap-2">
              {sizeRecommendations.map((rec, idx) => (
                <Badge key={idx} variant="secondary">
                  {rec.category}: {rec.size} ({Math.round(rec.confidence * 100)}%)
                </Badge>
              ))}
            </div>
          </div>
        )}

        {showAdjustments && outfit.items.length > 0 && (
          <div className="space-y-3 pt-3 border-t">
            <p className="text-sm font-medium">Manual Adjustments:</p>
            {outfit.items.map((item) => (
              <div key={item.id} className="space-y-2">
                <p className="text-xs text-muted-foreground">{item.name}</p>
                <div className="space-y-1">
                  <label className="text-xs">Scale</label>
                  <Slider
                    value={[adjustments[item.id]?.scale ?? 1]}
                    min={0.5}
                    max={1.5}
                    step={0.1}
                    onValueChange={(value) => {
                      setAdjustments(prev => ({
                        ...prev,
                        [item.id]: { x: prev[item.id]?.x ?? 0, y: prev[item.id]?.y ?? 0, scale: value[0] }
                      }));
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};

export default DailyOutfitWithVTO;
