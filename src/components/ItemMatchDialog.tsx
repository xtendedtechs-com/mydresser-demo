import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Heart, ShoppingCart } from 'lucide-react';
import { WardrobeItem } from '@/hooks/useWardrobe';
import { MerchantItem } from '@/hooks/useMerchantItems';

interface ItemMatchDialogProps {
  isOpen: boolean;
  onClose: () => void;
  wardrobeItem: WardrobeItem;
  merchantItem: MerchantItem;
  matchScore: number;
  matchReasons: string[];
  onAccept: () => void;
  onReject: () => void;
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
  const getMatchColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPhotoUrl = (photos: any): string => {
    if (!photos) return '/placeholder.svg';
    if (typeof photos === 'string') return photos;
    if (photos.main) return photos.main;
    if (Array.isArray(photos) && photos.length > 0) return photos[0];
    return '/placeholder.svg';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-primary" />
            Perfect Match Found!
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Match Score */}
          <div className="text-center">
            <div className={`text-4xl font-bold ${getMatchColor(matchScore)}`}>
              {Math.round(matchScore * 100)}%
            </div>
            <p className="text-muted-foreground">Match Score</p>
          </div>

          {/* Items Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Your Item */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Heart className="w-4 h-4" />
                  Your Item
                </h3>
                <div className="space-y-3">
                  <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                    <img
                      src={getPhotoUrl(wardrobeItem.photos)}
                      alt={wardrobeItem.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder.svg';
                      }}
                    />
                  </div>
                  <div>
                    <h4 className="font-medium">{wardrobeItem.name}</h4>
                    {wardrobeItem.brand && (
                      <p className="text-sm text-muted-foreground">{wardrobeItem.brand}</p>
                    )}
                    <div className="flex flex-wrap gap-1 mt-2">
                      <Badge variant="outline">{wardrobeItem.category}</Badge>
                      {wardrobeItem.color && (
                        <Badge variant="outline">{wardrobeItem.color}</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Suggested Item */}
            <Card className="border-primary">
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4" />
                  Similar Item Available
                </h3>
                <div className="space-y-3">
                  <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                    <img
                      src={getPhotoUrl(merchantItem.photos)}
                      alt={merchantItem.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder.svg';
                      }}
                    />
                  </div>
                  <div>
                    <h4 className="font-medium">{merchantItem.name}</h4>
                    {merchantItem.brand && (
                      <p className="text-sm text-muted-foreground">{merchantItem.brand}</p>
                    )}
                    <div className="flex flex-wrap gap-1 mt-2">
                      <Badge variant="outline">{merchantItem.category}</Badge>
                      {merchantItem.color && (
                        <Badge variant="outline">{merchantItem.color}</Badge>
                      )}
                      <Badge variant="secondary">${merchantItem.price}</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Match Reasons */}
          <div>
            <h3 className="font-semibold mb-3">Why this matches:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {matchReasons.map((reason, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  {reason}
                </div>
              ))}
            </div>
          </div>

          {/* Enhancement Benefits */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2 text-sm">Accepting this match will:</h3>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>✓ Update your item with verified merchant details</li>
              <li>✓ Add accurate brand, material, and sizing information</li>
              <li>✓ Link to merchant item for future reference</li>
              <li>✓ Enhance outfit recommendations accuracy</li>
            </ul>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onReject}>
            Not Interested
          </Button>
          <Button onClick={onAccept} className="gap-2">
            <ShoppingCart className="w-4 h-4" />
            View in Marketplace
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ItemMatchDialog;