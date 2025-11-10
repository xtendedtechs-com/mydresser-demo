import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Video, VideoOff, Hand, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { WardrobeItem } from "@/hooks/useWardrobe";
import { getPrimaryPhotoUrl } from "@/utils/photoHelpers";

interface ARMirrorModeProps {
  availableItems: WardrobeItem[];
}

const ARMirrorMode = ({ availableItems }: ARMirrorModeProps) => {
  const [isActive, setIsActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [selectedItems, setSelectedItems] = useState<WardrobeItem[]>([]);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [handGestureEnabled, setHandGestureEnabled] = useState(true);
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

  useEffect(() => {
    if (isActive && stream && videoRef.current && canvasRef.current) {
      renderLoop();
    }
  }, [isActive, stream, selectedItems]);

  const startARMirror = async () => {
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
        title: "AR Mirror Active",
        description: handGestureEnabled 
          ? "Use hand gestures to switch items - Wave to change outfit!" 
          : "Use buttons to switch items"
      });
    } catch (error) {
      console.error('AR Mirror error:', error);
      toast({
        title: "Camera Access Failed",
        description: "Could not access camera for AR mirror",
        variant: "destructive"
      });
    }
  };

  const stopARMirror = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsActive(false);
    setSelectedItems([]);
  };

  const renderLoop = () => {
    if (!isActive || !videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx || video.readyState !== 4) {
      requestAnimationFrame(renderLoop);
      return;
    }

    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Overlay selected items
    if (selectedItems.length > 0) {
      overlayClothing(ctx, canvas.width, canvas.height);
    }

    requestAnimationFrame(renderLoop);
  };

  const overlayClothing = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ) => {
    selectedItems.forEach((item) => {
      // Simple overlay positioning
      let x = 0, y = 0, w = 0, h = 0;
      
      switch (item.category.toLowerCase()) {
        case 'tops':
        case 'shirt':
          x = width * 0.25;
          y = height * 0.2;
          w = width * 0.5;
          h = height * 0.35;
          break;
        case 'bottoms':
        case 'pants':
          x = width * 0.3;
          y = height * 0.5;
          w = width * 0.4;
          h = height * 0.4;
          break;
        default:
          x = width * 0.3;
          y = height * 0.25;
          w = width * 0.4;
          h = height * 0.4;
      }

      // Draw clothing placeholder (would need actual image loading)
      ctx.save();
      ctx.globalAlpha = 0.7;
      ctx.fillStyle = item.color || '#999';
      ctx.fillRect(x, y, w, h);
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, w, h);
      
      // Draw item name
      ctx.fillStyle = '#fff';
      ctx.font = '20px Arial';
      ctx.fillText(item.name, x + 10, y + 30);
      ctx.restore();
    });
  };

  const addItem = (item: WardrobeItem) => {
    if (!selectedItems.find(i => i.id === item.id)) {
      setSelectedItems(prev => [...prev, item]);
      toast({
        title: "Item Added",
        description: `${item.name} added to AR view`
      });
    }
  };

  const removeItem = (itemId: string) => {
    setSelectedItems(prev => prev.filter(i => i.id !== itemId));
  };

  const nextItem = () => {
    if (availableItems.length === 0) return;
    const nextIndex = (currentItemIndex + 1) % availableItems.length;
    setCurrentItemIndex(nextIndex);
    const nextItem = availableItems[nextIndex];
    setSelectedItems([nextItem]);
  };

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden">
        <div className="relative aspect-video bg-muted">
          {!isActive ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Button onClick={startARMirror} size="lg">
                <Video className="w-5 h-5 mr-2" />
                Start AR Mirror
              </Button>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="hidden"
              />
              <canvas
                ref={canvasRef}
                className="w-full h-full object-cover scale-x-[-1]"
              />
              
              <div className="absolute top-2 left-2 flex gap-2">
                <Badge variant="secondary" className="bg-red-500 text-white">
                  <div className="w-2 h-2 rounded-full bg-white mr-2 animate-pulse" />
                  AR MIRROR
                </Badge>
                {handGestureEnabled && (
                  <Badge variant="outline" className="bg-background/80">
                    <Hand className="w-3 h-3 mr-1" />
                    Gestures On
                  </Badge>
                )}
              </div>

              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                <Button onClick={nextItem} variant="outline" className="bg-background/80">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Next Item
                </Button>
                <Button 
                  onClick={() => setHandGestureEnabled(!handGestureEnabled)} 
                  variant="outline"
                  className="bg-background/80"
                >
                  <Hand className="w-4 h-4" />
                </Button>
                <Button onClick={stopARMirror} variant="outline" className="bg-background/80">
                  <VideoOff className="w-4 h-4" />
                </Button>
              </div>
            </>
          )}
        </div>
      </Card>

      {isActive && (
        <Card className="p-4">
          <h3 className="font-semibold mb-3">Quick Select Items</h3>
          <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
            {availableItems.slice(0, 12).map((item) => (
              <button
                key={item.id}
                onClick={() => addItem(item)}
                className="aspect-square rounded-lg overflow-hidden border-2 border-transparent hover:border-primary transition-colors"
              >
                <img
                  src={getPrimaryPhotoUrl(item.photos, item.category)}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </Card>
      )}

      {selectedItems.length > 0 && (
        <Card className="p-4">
          <h3 className="font-semibold mb-3">Currently Wearing</h3>
          <div className="flex flex-wrap gap-2">
            {selectedItems.map((item) => (
              <Badge
                key={item.id}
                variant="secondary"
                className="cursor-pointer"
                onClick={() => removeItem(item.id)}
              >
                {item.name} ✕
              </Badge>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default ARMirrorMode;
