import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Camera, RefreshCw, Download, Share2, Wand2, Sparkles, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { WardrobeItem } from '@/hooks/useWardrobe';
import { supabase } from '@/integrations/supabase/client';
import { removeBackground, loadImage } from '@/utils/backgroundRemoval';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface MyMirrorProps {
  selectedItem?: WardrobeItem;
  onCapture?: (imageData: string) => void;
}

export const MyMirror = ({ selectedItem, onCapture }: MyMirrorProps) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 1280, height: 720 }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      toast({
        title: "Camera access denied",
        description: "Please allow camera access to use MyMirror",
        variant: "destructive",
      });
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const imageData = canvasRef.current.toDataURL('image/png');
        setCapturedImage(imageData);
        setProcessedImage(null);
        onCapture?.(imageData);
        toast({
          title: "Photo captured",
          description: "Ready for virtual try-on and AI enhancements",
        });
      }
    }
  };

  const handleVirtualTryOn = async () => {
    if (!capturedImage || !selectedItem) {
      toast({
        title: "Missing requirements",
        description: "Please capture a photo and select a wardrobe item",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setProcessingStep('Preparing virtual try-on...');

    try {
      const { data, error } = await supabase.functions.invoke('ai-virtual-tryon', {
        body: {
          userImage: capturedImage,
          clothingItem: {
            name: selectedItem.name,
            category: selectedItem.category,
            color: selectedItem.color,
            brand: selectedItem.brand,
          }
        }
      });

      if (error) throw error;

      if (data.editedImage) {
        setProcessedImage(data.editedImage);
        toast({
          title: "Virtual try-on complete! ✨",
          description: "Your outfit has been virtually applied",
        });
      }
    } catch (error: any) {
      console.error('Virtual try-on error:', error);
      toast({
        title: "Try-on failed",
        description: error.message || "Failed to apply virtual try-on",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setProcessingStep('');
    }
  };

  const handleStyleTransform = async (styleType: string) => {
    const imageToTransform = processedImage || capturedImage;
    if (!imageToTransform) {
      toast({
        title: "No image",
        description: "Please capture a photo first",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setProcessingStep(`Applying ${styleType} transformation...`);

    try {
      const { data, error } = await supabase.functions.invoke('ai-style-transform', {
        body: {
          image: imageToTransform,
          styleTransform: styleType
        }
      });

      if (error) throw error;

      if (data.transformedImage) {
        setProcessedImage(data.transformedImage);
        toast({
          title: "Style applied! ✨",
          description: `Your photo has been transformed with ${styleType} style`,
        });
      }
    } catch (error: any) {
      console.error('Style transform error:', error);
      toast({
        title: "Transform failed",
        description: error.message || "Failed to apply style transformation",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setProcessingStep('');
    }
  };

  const handleRemoveBackground = async () => {
    const imageToProcess = processedImage || capturedImage;
    if (!imageToProcess) {
      toast({
        title: "No image",
        description: "Please capture a photo first",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setProcessingStep('Removing background with AI...');

    try {
      // Convert base64 to blob
      const response = await fetch(imageToProcess);
      const blob = await response.blob();
      
      // Load image
      const img = await loadImage(blob);
      
      // Remove background
      const resultBlob = await removeBackground(img);
      
      // Convert back to base64
      const reader = new FileReader();
      reader.onloadend = () => {
        setProcessedImage(reader.result as string);
        toast({
          title: "Background removed! ✨",
          description: "Your image now has a transparent background",
        });
      };
      reader.readAsDataURL(resultBlob);
    } catch (error: any) {
      console.error('Background removal error:', error);
      toast({
        title: "Background removal failed",
        description: "Failed to process the image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setProcessingStep('');
    }
  };

  const retake = () => {
    setCapturedImage(null);
    setProcessedImage(null);
  };

  const downloadPhoto = () => {
    const imageToDownload = processedImage || capturedImage;
    if (imageToDownload) {
      const link = document.createElement('a');
      link.href = imageToDownload;
      link.download = `mydresser-${Date.now()}.png`;
      link.click();
      toast({
        title: "Photo downloaded",
        description: "Your photo has been saved to your device",
      });
    }
  };

  const sharePhoto = async () => {
    const imageToShare = processedImage || capturedImage;
    if (imageToShare) {
      try {
        const blob = await (await fetch(imageToShare)).blob();
        const file = new File([blob], 'mydresser-tryon.png', { type: 'image/png' });
        await navigator.share({
          files: [file],
          title: 'MyDresser Virtual Try-On',
          text: 'Check out my virtual try-on!',
        });
      } catch (error) {
        toast({
          title: "Share not supported",
          description: "Your browser doesn't support sharing",
        });
      }
    }
  };

  const displayImage = processedImage || capturedImage;

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <div className="relative aspect-[9/16] max-w-md mx-auto bg-background rounded-lg overflow-hidden border-2 border-border">
          {!displayImage ? (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              {selectedItem && (
                <div className="absolute bottom-4 left-4 right-4 bg-background/90 backdrop-blur p-3 rounded-lg">
                  <p className="text-sm font-medium">{selectedItem.name}</p>
                  <p className="text-xs text-muted-foreground">{selectedItem.brand}</p>
                </div>
              )}
            </>
          ) : (
            <div className="relative w-full h-full">
              <img src={displayImage} alt="Captured" className="w-full h-full object-cover" />
              {isProcessing && (
                <div className="absolute inset-0 bg-background/80 backdrop-blur flex items-center justify-center">
                  <div className="text-center space-y-3">
                    <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
                    <p className="text-sm font-medium">{processingStep}</p>
                  </div>
                </div>
              )}
            </div>
          )}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Controls */}
        <div className="mt-6 space-y-4">
          {!displayImage ? (
            <Button onClick={capturePhoto} size="lg" className="w-full gap-2">
              <Camera className="w-5 h-5" />
              Capture Photo
            </Button>
          ) : (
            <>
              {/* AI Actions */}
              {selectedItem && !processedImage && (
                <Button 
                  onClick={handleVirtualTryOn} 
                  className="w-full gap-2"
                  disabled={isProcessing}
                >
                  <Wand2 className="w-5 h-5" />
                  Virtual Try-On with AI
                </Button>
              )}

              {/* Style Transform Options */}
              <div className="grid grid-cols-2 gap-2">
                <Select onValueChange={handleStyleTransform} disabled={isProcessing}>
                  <SelectTrigger>
                    <SelectValue placeholder="Apply Style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vintage">Vintage</SelectItem>
                    <SelectItem value="modern">Modern</SelectItem>
                    <SelectItem value="elegant">Elegant</SelectItem>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                  </SelectContent>
                </Select>

                <Button 
                  onClick={handleRemoveBackground}
                  variant="outline"
                  disabled={isProcessing}
                  className="gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Remove BG
                </Button>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button onClick={retake} variant="outline" className="flex-1 gap-2">
                  <RefreshCw className="w-5 h-5" />
                  Retake
                </Button>
                <Button onClick={downloadPhoto} className="flex-1 gap-2">
                  <Download className="w-5 h-5" />
                  Download
                </Button>
                <Button onClick={sharePhoto} variant="outline" className="flex-1 gap-2">
                  <Share2 className="w-5 h-5" />
                  Share
                </Button>
              </div>
            </>
          )}
        </div>
      </Card>

      {displayImage && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              AI Features
            </CardTitle>
            <CardDescription className="text-xs">
              Enhance your photo with AI-powered tools
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <Badge variant="outline" className="justify-center py-2">Virtual Try-On</Badge>
              <Badge variant="outline" className="justify-center py-2">Style Transform</Badge>
              <Badge variant="outline" className="justify-center py-2">Background Removal</Badge>
              <Badge variant="outline" className="justify-center py-2">AI Enhancement</Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
