import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Star, Download, AlertTriangle } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface EnhancedVTOGeneratorProps {
  itemId: string;
  itemName: string;
  itemImage: string;
  userPhoto?: string;
}

export const EnhancedVTOGenerator = ({
  itemId,
  itemName,
  itemImage,
  userPhoto
}: EnhancedVTOGeneratorProps) => {
  const [generating, setGenerating] = useState(false);
  const [vtoResult, setVtoResult] = useState<string | null>(null);
  const [vtoLogId, setVtoLogId] = useState<string | null>(null);
  const [rating, setRating] = useState<number>(0);
  const [feedback, setFeedback] = useState('');
  const [rateLimitInfo, setRateLimitInfo] = useState<{
    hourly_remaining: number;
    daily_remaining: number;
  } | null>(null);
  const { toast } = useToast();

  const checkRateLimit = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data, error } = await supabase.rpc('check_vto_rate_limit' as any, {
        p_user_id: user.id
      }) as any;

      if (error) throw error;

      const limitData = data?.[0];
      if (!limitData?.allowed) {
        toast({
          title: "Rate Limit Reached",
          description: `Please wait. You have ${limitData?.hourly_remaining || 0} generations left this hour.`,
          variant: "destructive"
        });
        return false;
      }

      setRateLimitInfo({
        hourly_remaining: limitData.hourly_remaining,
        daily_remaining: limitData.daily_remaining
      });

      return true;
    } catch (error) {
      console.error('Rate limit check failed:', error);
      return true; // Allow generation if check fails
    }
  };

  const generateVTO = async () => {
    if (!userPhoto) {
      toast({
        title: "Photo Required",
        description: "Please upload your photo first to use virtual try-on.",
        variant: "destructive"
      });
      return;
    }

    // Check rate limit
    const canGenerate = await checkRateLimit();
    if (!canGenerate) return;

    setGenerating(true);
    const startTime = Date.now();

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Call VTO edge function
      const { data, error } = await supabase.functions.invoke('generate-vto', {
        body: {
          userPhotoUrl: userPhoto,
          itemPhotoUrl: itemImage,
          itemId: itemId,
          userId: user.id
        }
      });

      if (error) throw error;

      const processingTime = Date.now() - startTime;

      // Log successful generation
      const { data: logData } = await supabase.rpc('log_vto_generation' as any, {
        p_user_id: user.id,
        p_wardrobe_item_id: itemId,
        p_user_photo_url: userPhoto,
        p_status: 'success',
        p_result_url: data.vtoImageUrl,
        p_processing_time_ms: processingTime
      }) as any;

      if (logData && typeof logData === 'string') {
        setVtoLogId(logData);
      }

      setVtoResult(data.vtoImageUrl);
      
      // Refresh rate limit info
      await checkRateLimit();

      toast({
        title: "Virtual Try-On Complete!",
        description: `Generated in ${(processingTime / 1000).toFixed(1)}s. Please rate the quality.`
      });
    } catch (error) {
      console.error('VTO generation failed:', error);
      
      // Log failed generation
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.rpc('log_vto_generation' as any, {
          p_user_id: user.id,
          p_wardrobe_item_id: itemId,
          p_user_photo_url: userPhoto,
          p_status: 'failed',
          p_error_message: error instanceof Error ? error.message : 'Unknown error'
        }) as any;
      }

      toast({
        title: "Generation Failed",
        description: "Unable to generate virtual try-on. Please try again.",
        variant: "destructive"
      });
    } finally {
      setGenerating(false);
    }
  };

  const submitQualityFeedback = async () => {
    if (!vtoLogId || rating === 0) {
      toast({
        title: "Rating Required",
        description: "Please rate the quality before submitting.",
        variant: "destructive"
      });
      return;
    }

    try {
      await supabase.rpc('analyze_vto_quality' as any, {
        p_log_id: vtoLogId,
        p_quality_rating: rating,
        p_feedback_comment: feedback || null
      }) as any;

      toast({
        title: "Thank You!",
        description: "Your feedback helps us improve virtual try-on quality."
      });

      // Reset feedback form
      setRating(0);
      setFeedback('');
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      toast({
        title: "Feedback Failed",
        description: "Unable to submit feedback. Please try again.",
        variant: "destructive"
      });
    }
  };

  const downloadVTO = () => {
    if (!vtoResult) return;
    
    const link = document.createElement('a');
    link.href = vtoResult;
    link.download = `vto-${itemName}-${Date.now()}.png`;
    link.click();
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Virtual Try-On</CardTitle>
              <CardDescription>See how {itemName} looks on you</CardDescription>
            </div>
            {rateLimitInfo && (
              <Badge variant="outline">
                {rateLimitInfo.hourly_remaining}/10 left this hour
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {!vtoResult ? (
            <div className="text-center py-8">
              <Button
                onClick={generateVTO}
                disabled={generating || !userPhoto}
                size="lg"
                className="w-full"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating Virtual Try-On...
                  </>
                ) : (
                  'Generate Virtual Try-On'
                )}
              </Button>
              {!userPhoto && (
                <p className="text-sm text-muted-foreground mt-2 flex items-center justify-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Upload your photo in profile settings first
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative rounded-lg overflow-hidden border">
                <img
                  src={vtoResult}
                  alt="Virtual Try-On Result"
                  className="w-full h-auto"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={downloadVTO}
                  variant="outline"
                  className="flex-1"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button
                  onClick={generateVTO}
                  variant="outline"
                  className="flex-1"
                >
                  Regenerate
                </Button>
              </div>

              {/* Quality Feedback */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Rate Quality</CardTitle>
                  <CardDescription className="text-xs">
                    Help us improve by rating this result
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setRating(star)}
                        className="transition-transform hover:scale-110"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-muted-foreground'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="feedback" className="text-xs">
                      Feedback (optional)
                    </Label>
                    <Textarea
                      id="feedback"
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="Share your thoughts..."
                      rows={2}
                      className="text-sm"
                    />
                  </div>

                  <Button
                    onClick={submitQualityFeedback}
                    disabled={rating === 0}
                    size="sm"
                    className="w-full"
                  >
                    Submit Feedback
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
