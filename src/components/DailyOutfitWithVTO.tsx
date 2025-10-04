import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Camera, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { WardrobeItem } from "@/hooks/useWardrobe";
import { getPrimaryPhotoUrl } from "@/utils/photoHelpers";

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
  const { toast } = useToast();

  useEffect(() => {
    if (userPhoto && outfit.items.length > 0) {
      generateVTO();
    }
  }, [outfit.id, userPhoto]);

  const generateVTO = async () => {
    if (!userPhoto) return;

    // Ensure we always send a directly embeddable data URL to the Edge Function
    const toDataUrl = async (src: string): Promise<string> => {
      if (src.startsWith('data:')) return src;
      try {
        const res = await fetch(src, { cache: 'no-cache' });
        const blob = await res.blob();
        return await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      } catch (e) {
        // As a last resort, just pass through (Edge will error and we surface toast)
        return src;
      }
    };

    setIsGenerating(true);
    try {
      const imageData = await toDataUrl(userPhoto);

      // Call AI virtual try-on function with user photo and outfit items
      const { data, error } = await supabase.functions.invoke('ai-virtual-tryon', {
        body: {
          userImage: imageData,
          clothingItems: outfit.items.map(item => ({
            id: item.id,
            name: item.name,
            category: item.category,
            color: item.color,
            brand: item.brand,
            photo: getPrimaryPhotoUrl(item.photos, item.category)
          }))
        }
      });

      if (error) throw error;

      if (data?.editedImageUrl) {
        setVtoImage(data.editedImageUrl);
        toast({
          title: "Virtual Try-On Ready",
          description: "Your outfit preview has been generated!"
        });
      }
    } catch (error: any) {
      console.error('VTO generation error:', error);
      toast({
        title: "VTO Generation Failed",
        description: error.message || "Could not generate virtual try-on",
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
        
        <div className="absolute top-2 left-2">
          <Badge variant="secondary" className="bg-primary text-primary-foreground">
            <Sparkles className="w-3 h-3 mr-1" />
            AI Try-On
          </Badge>
        </div>
      </div>

        <div className="flex items-center justify-between p-4">
          <Badge variant="outline">{outfit.confidence}% Match</Badge>
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
    </Card>
  );
};

export default DailyOutfitWithVTO;
