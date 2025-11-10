import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Share2, Download, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface VTOShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl: string;
  outfitName: string;
}

const VTOShareDialog = ({ open, onOpenChange, imageUrl, outfitName }: VTOShareDialogProps) => {
  const [copied, setCopied] = useState(false);
  const [watermarkText, setWatermarkText] = useState("MyDresser AI");
  const { toast } = useToast();

  const addWatermark = async (): Promise<string> => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return imageUrl;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    return new Promise((resolve) => {
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Draw image
        ctx.drawImage(img, 0, 0);
        
        // Add watermark
        ctx.save();
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = 'white';
        ctx.font = `${Math.floor(img.height * 0.03)}px Arial`;
        ctx.textAlign = 'right';
        ctx.textBaseline = 'bottom';
        
        // Add background for better visibility
        const textMetrics = ctx.measureText(watermarkText);
        const textHeight = parseInt(ctx.font);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(
          img.width - textMetrics.width - 20,
          img.height - textHeight - 15,
          textMetrics.width + 15,
          textHeight + 10
        );
        
        // Draw text
        ctx.fillStyle = 'white';
        ctx.fillText(watermarkText, img.width - 10, img.height - 10);
        ctx.restore();
        
        resolve(canvas.toDataURL('image/jpeg', 0.95));
      };
      
      img.src = imageUrl;
    });
  };

  const downloadWithWatermark = async () => {
    try {
      const watermarkedUrl = await addWatermark();
      const link = document.createElement('a');
      link.href = watermarkedUrl;
      link.download = `${outfitName.replace(/\s+/g, '-')}-vto-${Date.now()}.jpg`;
      link.click();
      
      toast({
        title: "Downloaded",
        description: "Image saved with watermark"
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download Failed",
        description: "Could not download image",
        variant: "destructive"
      });
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(imageUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      
      toast({
        title: "Copied",
        description: "Image URL copied to clipboard"
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Could not copy to clipboard",
        variant: "destructive"
      });
    }
  };

  const shareNative = async () => {
    try {
      const watermarkedUrl = await addWatermark();
      const blob = await fetch(watermarkedUrl).then(r => r.blob());
      const file = new File([blob], `${outfitName}-vto.jpg`, { type: 'image/jpeg' });
      
      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `${outfitName} - Virtual Try-On`,
          text: 'Check out my virtual try-on result!'
        });
        
        toast({
          title: "Shared",
          description: "Content shared successfully"
        });
      } else {
        toast({
          title: "Share Not Supported",
          description: "Use download or copy URL instead",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Virtual Try-On</DialogTitle>
          <DialogDescription>
            Share your virtual try-on result with watermark
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="watermark">Watermark Text</Label>
            <Input
              id="watermark"
              value={watermarkText}
              onChange={(e) => setWatermarkText(e.target.value)}
              placeholder="Enter watermark text"
            />
          </div>

          <div className="aspect-square rounded-lg overflow-hidden border">
            <img src={imageUrl} alt="VTO Result" className="w-full h-full object-cover" />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button onClick={downloadWithWatermark} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
            
            <Button onClick={shareNative} variant="outline">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            
            <Button onClick={copyToClipboard} variant="outline" className="col-span-2">
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy URL
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VTOShareDialog;
