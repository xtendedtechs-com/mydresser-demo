import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Heart, 
  ShoppingCart, 
  Star, 
  MapPin,
  Eye,
  MoreHorizontal
} from "lucide-react";
import { MerchantItem } from "@/hooks/useMerchantItems";

interface MerchantItemCardProps {
  item: MerchantItem;
  onAction?: (action: string, itemId: string) => void;
}

const MerchantItemCard = ({ item, onAction }: MerchantItemCardProps) => {
  const discountPercentage = item.original_price 
    ? Math.round(((item.original_price - item.price) / item.original_price) * 100)
    : 0;

  const getPhotoUrl = () => {
    if (!item.photos) return '/placeholder.svg';
    if (typeof item.photos === 'string') return item.photos;
    if (Array.isArray(item.photos) && item.photos.length > 0) return item.photos[0];
    return '/placeholder.svg';
  };

  return (
    <Card className="overflow-hidden bg-background hover:shadow-lg transition-all duration-200">
      {/* Image Container */}
      <div className="relative aspect-[3/4] bg-muted">
        <img
          src={getPhotoUrl()}
          alt={item.name}
          className="w-full h-full object-cover"
        />
        
        {/* Overlay Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {item.is_featured && (
            <Badge variant="secondary" className="text-xs bg-yellow-500 text-white">
              Featured
            </Badge>
          )}
          {item.is_premium && (
            <Badge variant="secondary" className="text-xs bg-purple-500 text-white">
              Premium
            </Badge>
          )}
          {discountPercentage > 0 && (
            <Badge variant="destructive" className="text-xs">
              -{discountPercentage}%
            </Badge>
          )}
        </div>

        {/* Action Buttons */}
        <div className="absolute top-2 right-2 flex flex-col gap-1">
          <Button
            variant="secondary"
            size="icon"
            className="h-7 w-7 bg-background/80 hover:bg-background"
            onClick={() => onAction?.("Like", item.id)}
          >
            <Heart className="w-3 h-3" />
          </Button>
        </div>

        {/* Quick View on Hover */}
        <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
          <Button 
            variant="secondary" 
            size="sm"
            onClick={() => window.location.href = `/market/item/${item.id}`}
          >
            <Eye className="w-4 h-4 mr-2" />
            Quick View
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 space-y-2">
        {/* Brand Info */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            <span>{item.brand || 'Unknown Brand'}</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            <span>4.8</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="font-medium text-sm leading-tight line-clamp-2">
          {item.name}
        </h3>

        {/* Description */}
        {item.description && (
          <p className="text-xs text-muted-foreground line-clamp-1">
            {item.description}
          </p>
        )}

        {/* Condition */}
        <Badge variant="outline" className="text-xs">
          {item.condition}
        </Badge>

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm">${item.price}</span>
          {item.original_price && item.original_price !== item.price && (
            <span className="text-xs text-muted-foreground line-through">
              ${item.original_price}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <Button 
            size="sm" 
            className="flex-1 h-8 text-xs"
            onClick={() => onAction?.("Add to Cart", item.id)}
          >
            <ShoppingCart className="w-3 h-3 mr-1" />
            Add to Cart
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            className="h-8 w-8"
            onClick={() => onAction?.("More", item.id)}
          >
            <MoreHorizontal className="w-3 h-3" />
          </Button>
        </div>

        {/* Category and Stock */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
          <span>{item.category}</span>
          <span>{item.stock_quantity} in stock</span>
        </div>
      </div>
    </Card>
  );
};

export default MerchantItemCard;