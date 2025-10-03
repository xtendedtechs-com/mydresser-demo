import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Camera, Upload, Scan, RotateCw, ZoomIn, ZoomOut, Download, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TryOnItem {
  id: string;
  name: string;
  category: string;
  image: string;
  color: string;
  size: string;
}

export const VirtualTryOnStudio = () => {
  const [selectedItem, setSelectedItem] = useState<TryOnItem | null>(null);
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [zoom, setZoom] = useState([100]);
  const [rotation, setRotation] = useState(0);
  const { toast } = useToast();

  const wardrobeItems: TryOnItem[] = [
    {
      id: "1",
      name: "Classic White Shirt",
      category: "Tops",
      image: "/placeholder.svg",
      color: "White",
      size: "M",
    },
    {
      id: "2",
      name: "Navy Blazer",
      category: "Outerwear",
      image: "/placeholder.svg",
      color: "Navy",
      size: "M",
    },
    {
      id: "3",
      name: "Black Jeans",
      category: "Bottoms",
      image: "/placeholder.svg",
      color: "Black",
      size: "32",
    },
  ];

  const handlePhotoUpload = () => {
    toast({
      title: "Upload Photo",
      description: "Please upload a full-body photo for best results",
    });
    // Simulate photo upload
    setUserPhoto("/placeholder.svg");
  };

  const handleCameraCapture = () => {
    toast({
      title: "Camera Ready",
      description: "Position yourself in the frame and capture",
    });
  };

  const handleTryOn = (item: TryOnItem) => {
    setSelectedItem(item);
    toast({
      title: "Applying Item",
      description: `Virtually trying on ${item.name}...`,
    });
  };

  const handleSave = () => {
    toast({
      title: "Saved",
      description: "Virtual try-on saved to your gallery",
    });
  };

  const handleShare = () => {
    toast({
      title: "Share",
      description: "Opening share options...",
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Try-On Canvas */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Virtual Try-On Studio</CardTitle>
          <CardDescription>
            See how clothes look on you before wearing them
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Canvas Area */}
            <div className="relative aspect-[3/4] bg-muted rounded-lg overflow-hidden flex items-center justify-center">
              {userPhoto ? (
                <div className="relative w-full h-full">
                  <img
                    src={userPhoto}
                    alt="User"
                    className="w-full h-full object-cover"
                    style={{
                      transform: `scale(${zoom[0] / 100}) rotate(${rotation}deg)`,
                      transition: "transform 0.3s ease",
                    }}
                  />
                  {selectedItem && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-primary/10 backdrop-blur-sm rounded-lg p-4">
                        <p className="text-sm font-medium mb-2">
                          Trying on: {selectedItem.name}
                        </p>
                        <Badge variant="secondary">{selectedItem.category}</Badge>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center p-8">
                  <Camera className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-4">
                    Upload a photo or use your camera to get started
                  </p>
                  <div className="flex gap-2 justify-center">
                    <Button onClick={handlePhotoUpload}>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Photo
                    </Button>
                    <Button variant="outline" onClick={handleCameraCapture}>
                      <Camera className="mr-2 h-4 w-4" />
                      Use Camera
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Controls */}
            {userPhoto && (
              <div className="space-y-4 p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Controls</span>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={handleSave}>
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleShare}>
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Zoom</span>
                      <span className="text-xs font-medium">{zoom[0]}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ZoomOut className="h-4 w-4 text-muted-foreground" />
                      <Slider
                        value={zoom}
                        onValueChange={setZoom}
                        min={50}
                        max={200}
                        step={10}
                        className="flex-1"
                      />
                      <ZoomIn className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => setRotation((r) => r - 90)}
                    >
                      <RotateCw className="mr-2 h-4 w-4 transform -scale-x-100" />
                      Rotate Left
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => setRotation((r) => r + 90)}
                    >
                      <RotateCw className="mr-2 h-4 w-4" />
                      Rotate Right
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Item Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Items</CardTitle>
          <CardDescription>Choose items to try on virtually</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="wardrobe">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="wardrobe">Wardrobe</TabsTrigger>
              <TabsTrigger value="market">Market</TabsTrigger>
            </TabsList>

            <TabsContent value="wardrobe" className="space-y-3">
              {wardrobeItems.map((item) => (
                <div
                  key={item.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedItem?.id === item.id
                      ? "border-primary bg-primary/5"
                      : "hover:bg-muted/50"
                  }`}
                  onClick={() => handleTryOn(item)}
                >
                  <div className="flex gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.category}</p>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {item.color}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {item.size}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  {selectedItem?.id === item.id && (
                    <Button size="sm" className="w-full mt-2">
                      <Scan className="mr-2 h-4 w-4" />
                      Try On
                    </Button>
                  )}
                </div>
              ))}
            </TabsContent>

            <TabsContent value="market" className="space-y-3">
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">
                  Browse market items and try them on virtually before purchasing
                </p>
                <Button size="sm" className="mt-4">
                  Browse Market
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
