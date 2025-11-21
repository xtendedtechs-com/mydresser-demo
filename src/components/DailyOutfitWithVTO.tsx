import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Camera, Sparkles, Settings2, History, ArrowLeftRight, Share2, Maximize2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { WardrobeItem } from "@/hooks/useWardrobe";
import { getPrimaryPhotoUrl } from "@/utils/photoHelpers";
import { localVTO, VTOConfig } from "@/services/localVTO";
import { SizeRecommendation } from "@/services/sizeRecommendation";
import { BodyShape } from "@/services/bodyShapeAnalysis";
import { useVTOHistory } from "@/hooks/useVTOHistory";
import WebcamVTO from "./vto/WebcamVTO";
import VTOShareDialog from "./vto/VTOShareDialog";
import VTO3DControls from "./vto/VTO3DControls";

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
  const [bodyShape, setBodyShape] = useState<BodyShape | null>(null);
  const [processingTime, setProcessingTime] = useState<number>(0);
  const [showAdjustments, setShowAdjustments] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [show3DView, setShow3DView] = useState(false);
  const [adjustments, setAdjustments] = useState<VTOConfig['manualAdjustments']>({});
  const { toast } = useToast();
  const vtoHistory = useVTOHistory();

  useEffect(() => {
    if (userPhoto && outfit.items.length > 0) {
      generateVTO();
    }
  }, [outfit.id, userPhoto]);

  // Helper to convert URLs for canvas compatibility
  const convertBlobToDataUrl = async (url: string): Promise<string> => {
    const { convertToDataUrl } = await import('@/utils/blobHelpers');
    return convertToDataUrl(url);
  };

  const generateVTO = async () => {
    if (!userPhoto) return;

    setIsGenerating(true);
    try {
      console.log('Starting VTO generation...');
      
      // Convert user photo if it's a blob URL
      const userImageUrl = await convertBlobToDataUrl(userPhoto);
      
      // Prepare clothing items with resolved storage URLs and blob conversion
      const { getPrimaryPhotoUrlAsync } = await import('@/utils/photoHelpers');
      const clothingItemsPromises = outfit.items.map(async (item) => {
        // First resolve storage URLs (signed URLs if needed)
        const photoUrl = await getPrimaryPhotoUrlAsync(item.photos, item.category);
        // Then convert blobs to data URLs for canvas operations
        const convertedUrl = await convertBlobToDataUrl(photoUrl);
        return {
          id: item.id,
          name: item.name,
          category: item.category,
          photo: convertedUrl
        };
      });
      
      const clothingItems = await Promise.all(clothingItemsPromises);
      console.log('Clothing items prepared for VTO:', clothingItems.length);
      
      // Try Canvas AI VTO first (skip MediaPipe due to sandbox limitations)
      let result: { imageUrl: string; sizeRecommendations: SizeRecommendation[]; bodyShape: BodyShape; processingTime: number };
      try {
        const { aiVTO } = await import('@/services/aiVTO');
        result = await aiVTO.generateVTO({
          userImage: userImageUrl,
          clothingItems
        });
        console.log('VTO generated successfully with Canvas AI');
      } catch (aiError) {
        console.warn('Canvas AI VTO failed, trying Remote AI:', aiError);
        const { tryRemoteVTO } = await import('@/services/aiVTORemote');
        const remote = await tryRemoteVTO({
          userImage: userImageUrl,
          clothingItems: clothingItems.map(item => ({ id: item.id, name: item.name, category: item.category }))
        });
        result = {
          imageUrl: remote.imageUrl,
          sizeRecommendations: [],
          bodyShape: { type: 'rectangle', shoulderWidth: 0, waistWidth: 0, hipWidth: 0, torsoLength: 0, legLength: 0, bustToWaistRatio: 1, waistToHipRatio: 1 },
          processingTime: remote.processingTime ?? 0
        };
        toast({ title: 'Using Cloud VTO', description: 'Generated via remote AI fallback' });
      }

      setVtoImage(result.imageUrl);
      setSizeRecommendations(result.sizeRecommendations);
      setBodyShape(result.bodyShape);
      setProcessingTime(result.processingTime);
      
      // Add to history
      vtoHistory.addToHistory({
        imageUrl: result.imageUrl,
        outfitId: outfit.id,
        processingTime: result.processingTime
      });
      
      toast({
        title: "Virtual Try-On Ready",
        description: `Generated in ${(result.processingTime / 1000).toFixed(1)}s - ${result.bodyShape.type} body shape detected!`
      });
    } catch (error: any) {
      console.error('VTO generation error:', error);
      toast({
        title: "VTO Generation Failed",
        description: error.message || "Could not process image. Please try with a different photo showing full body.",
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
    <>
      <Tabs defaultValue="photo" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="photo">Photo Upload</TabsTrigger>
          <TabsTrigger value="webcam">Live Webcam</TabsTrigger>
        </TabsList>

        <TabsContent value="photo">
          <Card className="overflow-hidden">
            <div className="relative aspect-[3/4] bg-muted">
              {isGenerating ? (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                  <div className="text-center space-y-2">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto" />
                    <p className="text-sm text-muted-foreground">Generating virtual try-on...</p>
                    <p className="text-xs text-muted-foreground">This may take a few seconds...</p>
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
        
        <div className="absolute top-2 left-2 flex gap-2 flex-wrap max-w-[calc(100%-1rem)]">
          <Badge variant="secondary" className="bg-primary text-primary-foreground">
            <Sparkles className="w-3 h-3 mr-1" />
            AI Try-On
          </Badge>
          {processingTime > 0 && (
            <Badge variant="outline" className="bg-background/80">
              {(processingTime / 1000).toFixed(1)}s
            </Badge>
          )}
          {bodyShape && (
            <Badge variant="outline" className="bg-background/80">
              {bodyShape.type}
            </Badge>
          )}
        </div>
      </div>

      <div className="p-4 pb-24 space-y-3">
        <div className="flex items-center justify-between">
          <Badge variant="outline">{outfit.confidence}% Match</Badge>
          <div className="flex gap-2">
            {vtoImage && (
              <>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setShowShareDialog(true)}
                  title="Share"
                >
                  <Share2 className="w-4 h-4" />
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setShow3DView(!show3DView)}
                  title="3D View"
                >
                  <Maximize2 className="w-4 h-4" />
                </Button>
              </>
            )}
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => setShowHistory(!showHistory)}
              title="View History"
            >
              <History className="w-4 h-4" />
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => vtoHistory.toggleComparison()}
              title="Compare"
              disabled={vtoHistory.history.length < 2}
            >
              <ArrowLeftRight className="w-4 h-4" />
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => setShowAdjustments(!showAdjustments)}
              title="Adjustments"
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

        {bodyShape && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Body Analysis:</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>Shape: <span className="font-semibold">{bodyShape.type}</span></div>
              <div>Shoulder: <span className="font-semibold">{Math.round(bodyShape.shoulderWidth)}px</span></div>
              <div>Waist: <span className="font-semibold">{Math.round(bodyShape.waistWidth)}px</span></div>
              <div>Hip: <span className="font-semibold">{Math.round(bodyShape.hipWidth)}px</span></div>
            </div>
          </div>
        )}

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

        {showHistory && vtoHistory.history.length > 0 && (
          <div className="space-y-2 pt-3 border-t">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">VTO History ({vtoHistory.history.length})</p>
              <Button size="sm" variant="ghost" onClick={vtoHistory.clearHistory}>Clear</Button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {vtoHistory.history.slice(0, 6).map((item) => (
                <div 
                  key={item.id}
                  className={`relative aspect-square rounded overflow-hidden cursor-pointer border-2 ${
                    vtoHistory.selectedItems.includes(item.id) ? 'border-primary' : 'border-transparent'
                  }`}
                  onClick={() => vtoHistory.comparisonMode && vtoHistory.toggleItemSelection(item.id)}
                >
                  <img src={item.imageUrl} alt="VTO" className="w-full h-full object-cover" />
                  <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1">
                    {(item.processingTime / 1000).toFixed(1)}s
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {vtoHistory.comparisonMode && vtoHistory.getComparisonItems().length === 2 && (
          <div className="space-y-2 pt-3 border-t">
            <p className="text-sm font-medium">Comparison:</p>
            <div className="grid grid-cols-2 gap-2">
              {vtoHistory.getComparisonItems().map((item) => (
                <div key={item.id} className="relative aspect-square rounded overflow-hidden">
                  <img src={item.imageUrl} alt="Comparison" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}

        {show3DView && vtoImage && (
          <div className="space-y-2 pt-3 border-t">
            <p className="text-sm font-medium">3D View Controls:</p>
            <VTO3DControls imageUrl={vtoImage} onImageUpdate={setVtoImage} />
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
        </TabsContent>

        <TabsContent value="webcam">
          <WebcamVTO outfit={outfit} />
        </TabsContent>
      </Tabs>

      {vtoImage && (
        <VTOShareDialog
          open={showShareDialog}
          onOpenChange={setShowShareDialog}
          imageUrl={vtoImage}
          outfitName={outfit.name}
        />
      )}
    </>
  );
};

export default DailyOutfitWithVTO;
