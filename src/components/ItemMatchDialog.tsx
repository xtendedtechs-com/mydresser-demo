import { useState } from 'react';
import { Check, X, ExternalLink } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { WardrobeItem } from '@/hooks/useWardrobe';
import { MerchantItem } from '@/hooks/useMerchantItems';
import { useItemMatches } from '@/hooks/useItemMatches';

interface ItemMatchDialogProps {
  isOpen: boolean;
  onClose: () => void;
  wardrobeItem: WardrobeItem;
  merchantItem: MerchantItem;
  matchScore: number;
  matchReasons: string[];
  onAccept?: () => void;
  onReject?: () => void;
}

const ItemMatchDialog = ({
  isOpen,
  onClose,
  wardrobeItem,
  merchantItem,
  matchScore,
  matchReasons,
  onAccept,
  onReject
}: ItemMatchDialogProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const { createMatch } = useItemMatches();

  const handleAccept = async () => {
    try {
      setIsProcessing(true);
      await createMatch(wardrobeItem.id, merchantItem.id, matchScore, matchReasons);
      
      toast({
        title: "Match accepted!",
        description: `We'll use ${merchantItem.name} details for your ${wardrobeItem.name}.`,
      });
      
      onAccept?.();
      onClose();
    } catch (error) {
      console.error('Error accepting match:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = () => {
    toast({
      title: "Match rejected",
      description: "We'll keep your original item details.",
    });
    
    onReject?.();
    onClose();
  };

  const getWardrobePhotoUrls = (item: WardrobeItem): string[] => {
    if (!item.photos) return [];
    if (Array.isArray(item.photos)) return item.photos;
    if (typeof item.photos === 'string') return [item.photos];
    return [];
  };

  const getMerchantPhotoUrls = (item: MerchantItem): string[] => {
    if (!item.photos) return [];
    if (Array.isArray(item.photos)) return item.photos;
    if (typeof item.photos === 'string') return [item.photos];
    return [];
  };

  const wardrobePhotos = getWardrobePhotoUrls(wardrobeItem);
  const merchantPhotos = getMerchantPhotoUrls(merchantItem);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Item Match Found!
            <Badge variant="secondary" className="text-xs">
              {Math.round(matchScore * 100)}% match
            </Badge>
          </DialogTitle>
          <DialogDescription>
            We found a merchant item that matches your wardrobe item. Would you like to use the merchant's details and photos?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Match Reasons */}
          <div>
            <h4 className="font-medium text-sm text-foreground mb-2">Why this matches:</h4>
            <div className="flex flex-wrap gap-1">
              {matchReasons.map((reason, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {reason}
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          {/* Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Your Item */}
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                Your Item
                <Badge variant="outline">Current</Badge>
              </h3>
              
              <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                <img
                  src={wardrobePhotos[0] || "/placeholder.svg"}
                  alt={wardrobeItem.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Name:</span> {wardrobeItem.name}
                </div>
                {wardrobeItem.brand && (
                  <div>
                    <span className="font-medium">Brand:</span> {wardrobeItem.brand}
                  </div>
                )}
                <div>
                  <span className="font-medium">Category:</span> {wardrobeItem.category}
                </div>
                {wardrobeItem.color && (
                  <div>
                    <span className="font-medium">Color:</span> {wardrobeItem.color}
                  </div>
                )}
                {wardrobeItem.size && (
                  <div>
                    <span className="font-medium">Size:</span> {wardrobeItem.size}
                  </div>
                )}
                {wardrobeItem.material && (
                  <div>
                    <span className="font-medium">Material:</span> {wardrobeItem.material}
                  </div>
                )}
              </div>
            </div>

            {/* Merchant Item */}
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                Merchant Item
                <Badge variant="default">Enhanced</Badge>
              </h3>
              
              <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                <img
                  src={merchantPhotos[0] || "/placeholder.svg"}
                  alt={merchantItem.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Name:</span> {merchantItem.name}
                </div>
                {merchantItem.brand && (
                  <div>
                    <span className="font-medium">Brand:</span> {merchantItem.brand}
                  </div>
                )}
                <div>
                  <span className="font-medium">Category:</span> {merchantItem.category}
                </div>
                {merchantItem.color && (
                  <div>
                    <span className="font-medium">Color:</span> {merchantItem.color}
                  </div>
                )}
                {merchantItem.size && merchantItem.size.length > 0 && (
                  <div>
                    <span className="font-medium">Sizes:</span> {merchantItem.size.join(', ')}
                  </div>
                )}
                {merchantItem.material && (
                  <div>
                    <span className="font-medium">Material:</span> {merchantItem.material}
                  </div>
                )}
                <div>
                  <span className="font-medium">Price:</span> ${merchantItem.price}
                </div>
                {merchantItem.description && (
                  <div>
                    <span className="font-medium">Description:</span>
                    <p className="text-muted-foreground mt-1">{merchantItem.description}</p>
                  </div>
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => window.open(`/item/${merchantItem.id}`, '_blank')}
              >
                <ExternalLink size={16} className="mr-2" />
                View Full Details
              </Button>
            </div>
          </div>

          {/* Benefits */}
          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="font-medium text-sm text-foreground mb-2">
              Benefits of using merchant details:
            </h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• High-quality professional photos</li>
              <li>• Detailed product information</li>
              <li>• Accurate brand and material details</li>
              <li>• Price and availability information</li>
              <li>• Enhanced wardrobe organization</li>
            </ul>
          </div>

          <Separator />

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleReject}
              disabled={isProcessing}
              className="flex-1"
            >
              <X size={16} className="mr-2" />
              Keep Original
            </Button>
            <Button
              onClick={handleAccept}
              disabled={isProcessing}
              className="flex-1"
            >
              <Check size={16} className="mr-2" />
              {isProcessing ? 'Processing...' : 'Use Merchant Details'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ItemMatchDialog;