import { useRef, useState, useCallback, useEffect } from 'react';
import { Camera, X, Loader2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useCameraScannerStore } from '@/stores/useCameraScannerStore';
import { removeBackground, loadImage } from '@/utils/backgroundRemoval';

interface CameraScannerProps {
  onScanComplete: (data: any) => void;
  onClose: () => void;
}

export const CameraScanner = ({ onScanComplete, onClose }: CameraScannerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isRemovingBg, setIsRemovingBg] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const { toast } = useToast();
  const { setActive } = useCameraScannerStore();

  // Set scanner as active on mount, inactive on unmount
  useEffect(() => {
    setActive(true);
    return () => setActive(false);
  }, [setActive]);

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

  const capturePhoto = useCallback(async () => {
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
    
    // Start background removal
    setIsRemovingBg(true);
    try {
      // Convert data URL to blob then to image element
      const response = await fetch(imageData);
      const blob = await response.blob();
      const imgElement = await loadImage(blob);
      
      // Remove background
      const processedBlob = await removeBackground(imgElement);
      
      // Convert back to data URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setProcessedImage(reader.result as string);
        setIsRemovingBg(false);
        toast({
          title: 'Background Removed',
          description: 'Image processed successfully',
        });
      };
      reader.readAsDataURL(processedBlob);
    } catch (error) {
      console.error('Background removal failed:', error);
      // Fall back to original image
      setProcessedImage(imageData);
      setIsRemovingBg(false);
      toast({
        title: 'Background removal skipped',
        description: 'Using original image',
        variant: 'default'
      });
    }
  }, [stopCamera, toast]);

  const analyzeCapturedImage = useCallback(async () => {
    if (!capturedImage) return;

    setIsScanning(true);
    try {
      // Use original image for analysis (better for AI recognition)
      const { data, error } = await supabase.functions.invoke('ai-clothing-scanner', {
        body: { imageData: capturedImage }
      });

      if (error) throw error;

      if (data?.success && data?.analysis) {
        toast({
          title: 'Scan Complete!',
          description: `Detected: ${data.analysis.name}`,
        });
        
        // Use processed (bg removed) image for the item, fallback to original
        onScanComplete({
          ...data.analysis,
          photo: processedImage || capturedImage
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
  }, [capturedImage, processedImage, onScanComplete, onClose, toast]);

  const retakePhoto = useCallback(() => {
    setCapturedImage(null);
    setProcessedImage(null);
    startCamera();
  }, [startCamera]);

  // Start camera on mount
  useState(() => {
    startCamera();
    return () => stopCamera();
  });

  return (
    <div className="fixed inset-0 z-[100] bg-black">
      <div className="relative h-full w-full flex flex-col">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-10 p-4 safe-area-inset-top bg-gradient-to-b from-black/70 to-transparent">
          <div className="flex justify-between items-center">
            <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/20">
              <X className="h-6 w-6" />
            </Button>
            <h3 className="text-lg font-semibold text-white">Scan Clothing Item</h3>
            <div className="w-10"></div>
          </div>
        </div>

        {/* Camera/Image View */}
        <div className="flex-1 relative bg-neutral-900">
          {capturedImage ? (
            <div className="relative w-full h-full">
              {/* Show processed image if available, otherwise original */}
              <img 
                src={processedImage || capturedImage} 
                alt="Captured" 
                className="w-full h-full object-contain"
              />
              {/* Loading overlay during background removal */}
              {isRemovingBg && (
                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center">
                  <Loader2 className="h-10 w-10 text-white animate-spin mb-3" />
                  <p className="text-white text-sm">Removing background...</p>
                </div>
              )}
            </div>
          ) : (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          )}

          {/* Scanning overlay */}
          {!capturedImage && cameraActive && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="border-4 border-white/50 rounded-lg w-4/5 h-3/4 relative">
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-lg"></div>
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-lg"></div>
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-lg"></div>
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-lg"></div>
              </div>
            </div>
          )}

          {!cameraActive && !capturedImage && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Button onClick={startCamera} size="lg" className="text-lg">
                <Camera className="mr-2 h-6 w-6" />
                Start Camera
              </Button>
            </div>
          )}
        </div>

        {/* Bottom Controls */}
        <div className="absolute bottom-0 left-0 right-0 z-10 p-6 pb-8 bg-gradient-to-t from-black/70 to-transparent" style={{ paddingBottom: 'max(2rem, env(safe-area-inset-bottom))' }}>

          <div className="flex flex-col gap-4">
            {cameraActive && !capturedImage && (
              <>
                <p className="text-sm text-white/80 text-center">
                  Position the clothing item in the frame
                </p>
                <Button 
                  onClick={capturePhoto} 
                  size="lg" 
                  className="w-full h-16 text-lg bg-white text-black hover:bg-white/90"
                >
                  <Camera className="mr-3 h-6 w-6" />
                  Capture Photo
                </Button>
              </>
            )}

            {capturedImage && (
              <>
                <p className="text-sm text-white/80 text-center">
                  Our AI will analyze this image
                </p>
                <div className="flex gap-3">
                  <Button 
                    onClick={retakePhoto} 
                    variant="outline" 
                    size="lg"
                    className="flex-1 h-14 bg-white/10 text-white border-white/20 hover:bg-white/20"
                    disabled={isScanning || isRemovingBg}
                  >
                    <RotateCcw className="mr-2 h-5 w-5" />
                    Retake
                  </Button>
                  
                  <Button 
                    onClick={analyzeCapturedImage} 
                    size="lg" 
                    className="flex-[2] h-14 bg-white text-black hover:bg-white/90"
                    disabled={isScanning || isRemovingBg}
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
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
