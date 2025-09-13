import { Heart, Star, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

interface ClothingItemProps {
  id: string;
  name: string;
  brand: string;
  price?: string;
  image: string;
  category: string;
  isLiked?: boolean;
  isStarred?: boolean;
  onLike?: (id: string) => void;
  onStar?: (id: string) => void;
  onClick?: (id: string) => void;
  size?: "sm" | "md" | "lg";
}

const ClothingItem = ({
  id,
  name,
  brand,
  price,
  image,
  category,
  isLiked = false,
  isStarred = false,
  onLike,
  onStar,
  onClick,
  size = "md",
}: ClothingItemProps) => {
  const sizeClasses = {
    sm: "aspect-square",
    md: "aspect-[3/4]",
    lg: "aspect-[3/4]",
  };

  return (
    <div 
      className="fashion-card cursor-pointer group"
      onClick={() => onClick?.(id)}
    >
      <div className={cn("relative overflow-hidden rounded-t-xl", sizeClasses[size])}>
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute top-2 right-2 flex gap-1">
          {onStar && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onStar(id);
              }}
              className={cn(
                "p-1.5 rounded-full backdrop-blur-sm transition-colors",
                isStarred
                  ? "bg-fashion-orange text-white"
                  : "bg-white/80 text-gray-600 hover:bg-white"
              )}
            >
              <Star size={14} fill={isStarred ? "currentColor" : "none"} />
            </button>
          )}
          {onLike && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onLike(id);
              }}
              className={cn(
                "p-1.5 rounded-full backdrop-blur-sm transition-colors",
                isLiked
                  ? "bg-red-500 text-white"
                  : "bg-white/80 text-gray-600 hover:bg-white"
              )}
            >
              <Heart size={14} fill={isLiked ? "currentColor" : "none"} />
            </button>
          )}
        </div>
        <div className="absolute bottom-2 left-2">
          <span className="px-2 py-1 bg-black/70 text-white text-xs rounded-full">
            {category}
          </span>
        </div>
      </div>
      
      <div className="p-3">
        <div className="flex justify-between items-start mb-1">
          <h3 className="font-medium text-sm text-foreground truncate flex-1">
            {name}
          </h3>
          <button className="text-gray-400 hover:text-gray-600 ml-2">
            <MoreHorizontal size={16} />
          </button>
        </div>
        <p className="text-xs text-muted-foreground mb-1">{brand}</p>
        {price && (
          <p className="text-sm font-semibold text-fashion-orange">{price}</p>
        )}
      </div>
    </div>
  );
};

export default ClothingItem;