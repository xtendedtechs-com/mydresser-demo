import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Camera, CameraOff, Loader2, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { WardrobeItem } from "@/hooks/useWardrobe";
import { getPrimaryPhotoUrl } from "@/utils/photoHelpers";
import { localVTO } from "@/services/localVTO";

interface WebcamVTOProps {
  outfit: {
    id: string;
    items: WardrobeItem[];
    name: string;
  };
}

const WebcamVTO = ({ outfit }: WebcamVTOProps) => {
  const [isActive, setIsActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [vtoResult, setVtoResult] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const startWebcam = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        }
      });
      
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setIsActive(true);
      
      toast({
        title: "Webcam Started",
        description: "Position yourself for the virtual try-on"
      });
    } catch (error) {
      console.error('Webcam error:', error);
      toast({
        title: "Webcam Error",
        description: "Could not access camera",
        variant: "destructive"
      });
    }
  };

  const stopWebcam = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsActive(false);
    setCapturedImage(null);
    setVtoResult(null);
  };

  const captureAndProcess = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    setIsProcessing(true);
    const canvas = canvasRef.current;
    const video = videoRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);
    const imageData = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedImage(imageData);

    try {
      const result = await localVTO.generateVTO({
        userImage: imageData,
        clothingItems: outfit.items.map(item => ({
          id: item.id,
          name: item.name,
          category: item.category,
          photo: getPrimaryPhotoUrl(item.photos, item.category)
        }))
      });

      setVtoResult(result.imageUrl);
      
      toast({
        title: "Try-On Complete",
        description: `Processed in ${(result.processingTime / 1000).toFixed(1)}s`
      });
    } catch (error: any) {
      console.error('VTO error:', error);
      toast({
        title: "Try-On Failed",
        description: error.message || "Could not process image",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadResult = () => {
    if (!vtoResult) return;
    
    const link = document.createElement('a');
    link.href = vtoResult;
    link.download = `vto-${outfit.name}-${Date.now()}.jpg`;
    link.click();
  };

  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-[3/4] bg-muted">
        {!isActive ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Button onClick={startWebcam} size="lg">
              <Camera className="w-5 h-5 mr-2" />
              Start Live Try-On
            </Button>
          </div>
        ) : (
          <>
            {vtoResult ? (
              <img
                src={vtoResult}
                alt="VTO Result"
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
            
            <canvas ref={canvasRef} className="hidden" />
            
            <div className="absolute top-2 left-2">
              <Badge variant="secondary" className="bg-red-500 text-white">
                <div className="w-2 h-2 rounded-full bg-white mr-2 animate-pulse" />
                LIVE
              </Badge>
            </div>

            {isProcessing && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            )}
          </>
        )}
      </div>

      <div className="p-4 space-y-3">
        {isActive && (
          <div className="flex gap-2">
            {!vtoResult ? (
              <>
                <Button 
                  onClick={captureAndProcess}
                  disabled={isProcessing}
                  className="flex-1"
                >
                  {isProcessing ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Camera className="w-4 h-4 mr-2" />
                  )}
                  Try On Outfit
                </Button>
                <Button onClick={stopWebcam} variant="outline">
                  <CameraOff className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <>
                <Button onClick={downloadResult} variant="outline" className="flex-1">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button 
                  onClick={() => {
                    setVtoResult(null);
                    setCapturedImage(null);
                  }}
                  variant="outline"
                >
                  Try Again
                </Button>
                <Button onClick={stopWebcam} variant="outline">
                  <CameraOff className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

export default WebcamVTO;
