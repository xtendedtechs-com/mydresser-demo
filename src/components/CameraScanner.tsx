import { useRef, useState, useCallback } from 'react';
import { Camera, X, Loader2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface CameraScannerProps {
  onScanComplete: (data: any) => void;
  onClose: () => void;
}

export const CameraScanner = ({ onScanComplete, onClose }: CameraScannerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const { toast } = useToast();

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setCameraActive(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast({
        title: 'Camera Error',
        description: 'Could not access camera. Please check permissions.',
        variant: 'destructive'
      });
    }
  }, [toast]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      setCameraActive(false);
    }
  }, []);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.drawImage(videoRef.current, 0, 0);
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    
    setCapturedImage(imageData);
    stopCamera();
  }, [stopCamera]);

  const analyzeCapturedImage = useCallback(async () => {
    if (!capturedImage) return;

    setIsScanning(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-clothing-scanner', {
        body: { imageData: capturedImage }
      });

      if (error) throw error;

      if (data?.success && data?.analysis) {
        toast({
          title: 'Scan Complete!',
          description: `Detected: ${data.analysis.name}`,
        });
        
        onScanComplete({
          ...data.analysis,
          photo: capturedImage
        });
        onClose();
      } else {
        throw new Error(data?.error || 'Failed to analyze image');
      }
    } catch (error: any) {
      console.error('Error analyzing image:', error);
      toast({
        title: 'Analysis Failed',
        description: error.message || 'Could not analyze the clothing item',
        variant: 'destructive'
      });
    } finally {
      setIsScanning(false);
    }
  }, [capturedImage, onScanComplete, onClose, toast]);

  const retakePhoto = useCallback(() => {
    setCapturedImage(null);
    startCamera();
  }, [startCamera]);

  // Start camera on mount
  useState(() => {
    startCamera();
    return () => stopCamera();
  });

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Scan Clothing Item</h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="relative aspect-[4/3] bg-muted rounded-lg overflow-hidden mb-4">
          {capturedImage ? (
            <img 
              src={capturedImage} 
              alt="Captured" 
              className="w-full h-full object-cover"
            />
          ) : (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          )}

          {!cameraActive && !capturedImage && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Button onClick={startCamera} size="lg">
                <Camera className="mr-2 h-5 w-5" />
                Start Camera
              </Button>
            </div>
          )}
        </div>

        <div className="flex gap-2 justify-center">
          {cameraActive && !capturedImage && (
            <Button onClick={capturePhoto} size="lg" className="flex-1">
              <Camera className="mr-2 h-5 w-5" />
              Capture Photo
            </Button>
          )}

          {capturedImage && (
            <>
              <Button 
                onClick={retakePhoto} 
                variant="outline" 
                size="lg"
                disabled={isScanning}
              >
                <RotateCcw className="mr-2 h-5 w-5" />
                Retake
              </Button>
              
              <Button 
                onClick={analyzeCapturedImage} 
                size="lg" 
                className="flex-1"
                disabled={isScanning}
              >
                {isScanning ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Camera className="mr-2 h-5 w-5" />
                    Analyze Item
                  </>
                )}
              </Button>
            </>
          )}
        </div>

        <p className="text-sm text-muted-foreground text-center mt-4">
          Position the clothing item in the frame and capture a clear photo. 
          Our AI will identify the item and suggest details.
        </p>
      </CardContent>
    </Card>
  );
};
