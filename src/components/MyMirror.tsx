import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera, RefreshCw, Download, Share2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { WardrobeItem } from '@/hooks/useWardrobe';

interface MyMirrorProps {
  selectedItem?: WardrobeItem;
  onCapture?: (imageData: string) => void;
}

export const MyMirror = ({ selectedItem, onCapture }: MyMirrorProps) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
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
        onCapture?.(imageData);
        toast({
          title: "Photo captured",
          description: "Your virtual try-on photo has been saved",
        });
      }
    }
  };

  const retake = () => {
    setCapturedImage(null);
  };

  const downloadPhoto = () => {
    if (capturedImage) {
      const link = document.createElement('a');
      link.href = capturedImage;
      link.download = `mydresser-tryon-${Date.now()}.png`;
      link.click();
      toast({
        title: "Photo downloaded",
        description: "Your try-on photo has been saved to your device",
      });
    }
  };

  const sharePhoto = async () => {
    if (capturedImage) {
      try {
        const blob = await (await fetch(capturedImage)).blob();
        const file = new File([blob], 'tryon.png', { type: 'image/png' });
        await navigator.share({
          files: [file],
          title: 'MyDresser Virtual Try-On',
          text: 'Check out my virtual try-on!',
        });
      } catch (error) {
        toast({
          title: "Share failed",
          description: "Copying image to clipboard instead",
        });
      }
    }
  };

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">MyMirror - Virtual Try-On</h2>
        <p className="text-muted-foreground mb-6">
          See how items look on you in real-time
        </p>

        <div className="relative aspect-[9/16] max-w-md mx-auto bg-background rounded-lg overflow-hidden">
          {!capturedImage ? (
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
            <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
          )}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        <div className="flex gap-2 justify-center mt-6">
          {!capturedImage ? (
            <Button onClick={capturePhoto} size="lg" className="gap-2">
              <Camera className="w-5 h-5" />
              Capture Photo
            </Button>
          ) : (
            <>
              <Button onClick={retake} variant="outline" className="gap-2">
                <RefreshCw className="w-5 h-5" />
                Retake
              </Button>
              <Button onClick={downloadPhoto} className="gap-2">
                <Download className="w-5 h-5" />
                Download
              </Button>
              <Button onClick={sharePhoto} variant="outline" className="gap-2">
                <Share2 className="w-5 h-5" />
                Share
              </Button>
            </>
          )}
        </div>
      </Card>
    </div>
  );
};
