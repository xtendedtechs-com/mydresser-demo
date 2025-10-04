import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Heart, 
  Eye, 
  Edit, 
  Trash2, 
  Calendar,
  Tag,
  MapPin,
  Star
} from "lucide-react";
import { WardrobeItem } from "@/hooks/useWardrobe";
import { getPrimaryPhotoUrl, getCategoryPlaceholderImage } from "@/utils/photoHelpers";

interface WardrobeItemCardProps {
  item: WardrobeItem;
  onToggleFavorite: (id: string, isFavorite: boolean) => void;
  onMarkAsWorn: (id: string) => void;
  onEdit: (item: WardrobeItem) => void;
  onDelete: (id: string) => void;
  onView: (item: WardrobeItem) => void;
}

const WardrobeItemCard = ({ 
  item, 
  onToggleFavorite, 
  onMarkAsWorn, 
  onEdit, 
  onDelete, 
  onView 
}: WardrobeItemCardProps) => {
  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'excellent': return 'bg-green-500';
      case 'good': return 'bg-blue-500';
      case 'fair': return 'bg-yellow-500';
      case 'poor': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const daysSinceWorn = item.last_worn 
    ? Math.floor((new Date().getTime() - new Date(item.last_worn).getTime()) / (1000 * 3600 * 24))
    : null;

  return (
    <Card className="overflow-hidden bg-background hover:shadow-lg transition-all duration-200">
      {/* Image Container */}
      <div className="relative aspect-[3/4] bg-muted">
        <img
          src={getPrimaryPhotoUrl(item.photos, item.category)}
          alt={`${item.name} - ${item.category}`}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = getCategoryPlaceholderImage(item.category);
          }}
        />
        
        {/* Overlay Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {item.is_favorite && (
            <Badge variant="secondary" className="text-xs bg-red-500 text-white">
              <Heart className="w-3 h-3 mr-1" />
              Favorite
            </Badge>
          )}
          <Badge 
            variant="secondary" 
            className={`text-xs text-white ${getConditionColor(item.condition)}`}
          >
            {item.condition}
          </Badge>
        </div>

        {/* Action Buttons */}
        <div className="absolute top-2 right-2 flex flex-col gap-1">
          <Button
            variant="secondary"
            size="icon"
            className="h-7 w-7 bg-background/80 hover:bg-background"
            onClick={() => onToggleFavorite(item.id, !item.is_favorite)}
          >
            <Heart className={`w-3 h-3 ${item.is_favorite ? 'fill-red-500 text-red-500' : ''}`} />
          </Button>
        </div>

        {/* Quick View on Hover */}
        <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
          <Button 
            variant="secondary" 
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              window.location.href = `/wardrobe/item/${item.id}`;
            }}
          >
            <Eye className="w-4 h-4 mr-2" />
            View Details
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 space-y-2">
        {/* Brand and Category */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{item.brand || 'No Brand'}</span>
          <Badge variant="outline" className="text-xs">
            {item.category}
          </Badge>
        </div>

        {/* Title */}
        <h3 className="font-medium text-sm leading-tight line-clamp-2">
          {item.name}
        </h3>

        {/* Details */}
        <div className="space-y-1">
          {item.color && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div 
                className="w-3 h-3 rounded-full border"
                style={{ backgroundColor: item.color.toLowerCase() }}
              />
              <span>{item.color}</span>
              {item.size && <span>• Size {item.size}</span>}
            </div>
          )}
          
          {item.location_in_wardrobe && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="w-3 h-3" />
              <span>{item.location_in_wardrobe}</span>
            </div>
          )}
        </div>

        {/* Wear Stats */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>Worn {item.wear_count} times</span>
          </div>
          {daysSinceWorn !== null && (
            <span>{daysSinceWorn === 0 ? 'Today' : `${daysSinceWorn}d ago`}</span>
          )}
        </div>

        {/* Tags */}
        {item.tags && item.tags.length > 0 && (
          <div className="flex items-center gap-1 text-xs">
            <Tag className="w-3 h-3 text-muted-foreground" />
            <div className="flex flex-wrap gap-1">
              {item.tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {item.tags.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{item.tags.length - 3}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <Button 
            size="sm" 
            className="flex-1 h-8 text-xs"
            onClick={() => onMarkAsWorn(item.id)}
          >
            Mark as Worn
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            className="h-8 w-8"
            onClick={() => onEdit(item)}
          >
            <Edit className="w-3 h-3" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            className="h-8 w-8 text-destructive hover:bg-destructive hover:text-destructive-foreground"
            onClick={() => onDelete(item.id)}
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default WardrobeItemCard;