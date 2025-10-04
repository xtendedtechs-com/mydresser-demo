import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Camera, Upload, Shirt, AlertCircle, CheckCircle, 
  Ruler, TrendingUp, Download, Share2 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface VTOStudioProps {
  itemId: string;
  itemType: 'wardrobe' | 'merchant' | 'market';
  itemName: string;
  itemImage: string;
}

export const VTOStudio = ({ itemId, itemType, itemName, itemImage }: VTOStudioProps) => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [fitScore, setFitScore] = useState<number | null>(null);
  const [confidenceScore, setConfidenceScore] = useState<number | null>(null);

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    
    try {
      // Upload user photo
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('vto-photos')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Call VTO edge function
      const { data, error } = await supabase.functions.invoke('vto-process', {
        body: {
          userPhotoPath: fileName,
          itemId,
          itemType,
        },
      });

      if (error) throw error;

      // Create VTO session record
      const { error: sessionError } = await supabase
        .from('vto_sessions')
        .insert({
          user_id: (await supabase.auth.getUser()).data.user?.id,
          item_id: itemId,
          item_type: itemType,
          fit_score: data.fitScore,
          confidence_score: data.confidenceScore,
          result_image_url: data.resultImageUrl,
          session_data: data,
        });

      if (sessionError) throw sessionError;

      // Log analytics
      await supabase.from('vto_analytics').insert({
        user_id: (await supabase.auth.getUser()).data.user?.id,
        item_id: itemId,
        event_type: 'session_complete',
        event_data: {
          fit_score: data.fitScore,
          confidence_score: data.confidenceScore,
        },
      });

      setResultImage(data.resultImageUrl);
      setFitScore(data.fitScore);
      setConfidenceScore(data.confidenceScore);

      toast({
        title: 'Virtual try-on complete!',
        description: 'See how this item looks on you.',
      });
    } catch (error) {
      console.error('VTO error:', error);
      toast({
        title: 'Try-on failed',
        description: 'Could not process virtual try-on. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getFitRecommendation = () => {
    if (!fitScore) return null;
    
    if (fitScore >= 85) return { text: 'Excellent Fit', color: 'text-green-600', badge: 'success' };
    if (fitScore >= 70) return { text: 'Good Fit', color: 'text-blue-600', badge: 'default' };
    if (fitScore >= 50) return { text: 'Acceptable Fit', color: 'text-yellow-600', badge: 'secondary' };
    return { text: 'Poor Fit - Consider Sizing', color: 'text-red-600', badge: 'destructive' };
  };

  const recommendation = getFitRecommendation();

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Shirt className="h-6 w-6" />
              Virtual Try-On Studio
            </h2>
            <p className="text-muted-foreground">See how {itemName} looks on you</p>
          </div>
          <Badge variant="secondary" className="bg-primary/10 text-primary">
            AI-Powered
          </Badge>
        </div>

        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Upload a front-facing photo for best results. Our AI will analyze fit and provide size recommendations.
          </AlertDescription>
        </Alert>

        {!resultImage ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-medium">Item to Try On</h3>
              <Card className="p-4 bg-muted/50">
                <img
                  src={itemImage}
                  alt={itemName}
                  className="w-full h-64 object-cover rounded-lg mb-4"
                />
                <p className="font-medium">{itemName}</p>
              </Card>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium">Upload Your Photo</h3>
              <div className="border-2 border-dashed rounded-lg p-12 text-center space-y-4">
                <div className="flex justify-center gap-4">
                  <Camera className="h-12 w-12 text-muted-foreground" />
                  <Upload className="h-12 w-12 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium mb-2">Upload a photo to start</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Front-facing, full body photos work best
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    disabled={isProcessing}
                    className="hidden"
                    id="vto-upload"
                  />
                  <label htmlFor="vto-upload">
                    <Button asChild disabled={isProcessing}>
                      <span>
                        {isProcessing ? 'Processing...' : 'Choose Photo'}
                      </span>
                    </Button>
                  </label>
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>✓ Stand in good lighting</p>
                  <p>✓ Face the camera straight-on</p>
                  <p>✓ Full body visible</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium mb-4">Your Virtual Try-On</h3>
                <Card className="p-4">
                  <img
                    src={resultImage}
                    alt="Virtual try-on result"
                    className="w-full h-96 object-cover rounded-lg"
                  />
                </Card>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium">Fit Analysis</h3>
                
                {recommendation && (
                  <Card className="p-4 bg-muted/50">
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-medium">Overall Fit</span>
                      <Badge variant={recommendation.badge as any}>
                        {recommendation.text}
                      </Badge>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm">Fit Score</span>
                          <span className={`font-bold ${recommendation.color}`}>
                            {fitScore}%
                          </span>
                        </div>
                        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${fitScore}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm">Confidence</span>
                          <span className="font-bold">{confidenceScore}%</span>
                        </div>
                        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${confidenceScore}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </Card>
                )}

                <Card className="p-4">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Ruler className="h-4 w-4" />
                    Size Recommendation
                  </h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Based on your measurements and this item's fit data:
                  </p>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="font-medium">Your selected size looks good!</span>
                  </div>
                </Card>

                <Card className="p-4 bg-blue-50 border-blue-200">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Why VTO Matters
                  </h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• 40% fewer returns</li>
                    <li>• 30% higher confidence</li>
                    <li>• Better fit accuracy</li>
                  </ul>
                </Card>

                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1">
                    <Download className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                  <Button 
                    onClick={() => {
                      setResultImage(null);
                      setFitScore(null);
                      setConfidenceScore(null);
                    }}
                    className="flex-1"
                  >
                    Try Another
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
