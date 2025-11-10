import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ZoomIn, ZoomOut, RotateCw, Move } from "lucide-react";

interface VTO3DControlsProps {
  imageUrl: string;
  onImageUpdate: (url: string) => void;
}

const VTO3DControls = ({ imageUrl, onImageUpdate }: VTO3DControlsProps) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const resetView = () => {
    setZoom(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  };

  return (
    <div className="space-y-4">
      <div 
        className="relative aspect-square rounded-lg overflow-hidden border bg-muted cursor-move"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <img
          src={imageUrl}
          alt="VTO 3D View"
          className="absolute inset-0 w-full h-full object-contain"
          style={{
            transform: `scale(${zoom}) rotate(${rotation}deg) translate(${position.x}px, ${position.y}px)`,
            transition: isDragging ? 'none' : 'transform 0.2s ease',
            cursor: isDragging ? 'grabbing' : 'grab'
          }}
          draggable={false}
        />
      </div>

      <Card className="p-4 space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Zoom</label>
            <span className="text-sm text-muted-foreground">{zoom.toFixed(1)}x</span>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              size="icon" 
              variant="outline"
              onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <Slider
              value={[zoom]}
              min={0.5}
              max={3}
              step={0.1}
              onValueChange={(value) => setZoom(value[0])}
              className="flex-1"
            />
            <Button 
              size="icon" 
              variant="outline"
              onClick={() => setZoom(Math.min(3, zoom + 0.1))}
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Rotation</label>
            <span className="text-sm text-muted-foreground">{rotation}°</span>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              size="icon" 
              variant="outline"
              onClick={() => setRotation((rotation - 15) % 360)}
            >
              <RotateCw className="w-4 h-4 scale-x-[-1]" />
            </Button>
            <Slider
              value={[rotation]}
              min={0}
              max={360}
              step={15}
              onValueChange={(value) => setRotation(value[0])}
              className="flex-1"
            />
            <Button 
              size="icon" 
              variant="outline"
              onClick={() => setRotation((rotation + 15) % 360)}
            >
              <RotateCw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={resetView} variant="outline" className="flex-1">
            <Move className="w-4 h-4 mr-2" />
            Reset View
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Click and drag to pan the image
        </p>
      </Card>
    </div>
  );
};

export default VTO3DControls;
