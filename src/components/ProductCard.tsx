import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { 
  Heart, 
  ShoppingCart, 
  Star, 
  MapPin,
  Eye,
  MoreHorizontal,
  Shield
} from "lucide-react";

interface ProductItem {
  id: number;
  title: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  image: string;
  brand?: string;
  merchant?: string;
  seller?: string;
  rating: number;
  likes: number;
  category?: string;
  isNew?: boolean;
  isPremium?: boolean;
  isOutfit?: boolean;
  isSecondHand?: boolean;
  condition?: string;
  description?: string;
}

interface ProductCardProps {
  item: ProductItem;
  onAction: (action: string, itemId: number) => void;
}

const ProductCard = ({ item, onAction }: ProductCardProps) => {
  const navigate = useNavigate();
  const discountPercentage = item.originalPrice 
    ? Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)
    : item.discount || 0;

  return (
    <Card className="overflow-hidden bg-background hover:shadow-lg transition-all duration-200">
      {/* Image Container */}
      <div className="relative aspect-[3/4] bg-muted">
        <img
          src={item.image}
          alt={item.title}
          className="w-full h-full object-cover"
        />
        
        {/* Overlay Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {item.isNew && (
            <Badge variant="secondary" className="text-xs bg-green-500 text-white">
              New
            </Badge>
          )}
          {item.isPremium && (
            <Badge variant="secondary" className="text-xs bg-yellow-500 text-white">
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
            onClick={() => onAction("Like", item.id)}
          >
            <Heart className="w-3 h-3" />
          </Button>
          {item.isOutfit && (
            <Button
              variant="secondary"
              size="icon"
              className="h-7 w-7 bg-background/80 hover:bg-background"
              onClick={() => onAction("Try", item.id)}
            >
              <Eye className="w-3 h-3" />
            </Button>
          )}
        </div>

        {/* Quick View on Hover */}
        <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
          <Button 
            variant="secondary" 
            size="sm"
            onClick={() => navigate(`/market/item/${item.id}`)}
          >
            <Eye className="w-4 h-4 mr-2" />
            Quick View
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 space-y-2">
        {/* Merchant/Seller Info */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            {item.isSecondHand ? (
              <>
                <Shield className="w-3 h-3" />
                <span>{item.seller}</span>
              </>
            ) : (
              <>
                <MapPin className="w-3 h-3" />
                <span>{item.merchant}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            <span>{item.rating}</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="font-medium text-sm leading-tight line-clamp-2">
          {item.title}
        </h3>

        {/* Description for outfits */}
        {item.description && (
          <p className="text-xs text-muted-foreground line-clamp-1">
            {item.description}
          </p>
        )}

        {/* Condition for second-hand items */}
        {item.condition && (
          <Badge variant="outline" className="text-xs">
            {item.condition}
          </Badge>
        )}

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm">${item.price}</span>
          {item.originalPrice && item.originalPrice !== item.price && (
            <span className="text-xs text-muted-foreground line-through">
              ${item.originalPrice}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <Button 
            size="sm" 
            className="flex-1 h-8 text-xs"
            onClick={() => onAction("Add to Cart", item.id)}
          >
            <ShoppingCart className="w-3 h-3 mr-1" />
            {item.isSecondHand ? "Buy" : "Add"}
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            className="h-8 w-8"
            onClick={() => onAction("More", item.id)}
          >
            <MoreHorizontal className="w-3 h-3" />
          </Button>
        </div>

        {/* Engagement Stats */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
          <span>{item.likes} likes</span>
          {item.category && <span>{item.category}</span>}
        </div>
      </div>
    </Card>
  );
};

export default ProductCard;