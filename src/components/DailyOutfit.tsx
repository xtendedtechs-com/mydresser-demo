import { ChevronUp, RefreshCw, Heart, X, Share } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import dailyOutfitModel from "@/assets/daily-outfit-model.jpg";

interface DailyOutfitProps {
  onRegenerate?: () => void;
  onLike?: () => void;
  onDislike?: () => void;
}

const DailyOutfit = ({ onRegenerate, onLike, onDislike }: DailyOutfitProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-gradient-to-br from-fashion-neutral to-background rounded-2xl p-6 mb-6">
      <div className="text-center mb-4">
        <h2 className="text-lg font-semibold text-foreground mb-1">Today's Outfit</h2>
        <p className="text-sm text-muted-foreground">Perfect for 22°C, casual meeting</p>
      </div>

      <div className="relative">
        <div className="aspect-[3/4] max-w-sm mx-auto mb-4 rounded-xl overflow-hidden">
          <img
            src={dailyOutfitModel}
            alt="Today's outfit"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex justify-center gap-3 mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={onDislike}
            className="rounded-full w-12 h-12 p-0 border-2"
          >
            <X size={18} className="text-red-500" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onRegenerate}
            className="rounded-full w-12 h-12 p-0 border-2"
          >
            <RefreshCw size={18} />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onLike}
            className="rounded-full w-12 h-12 p-0 border-2"
          >
            <Heart size={18} className="text-fashion-orange" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="rounded-full w-12 h-12 p-0 border-2"
          >
            <Share size={18} />
          </Button>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-center gap-2 w-full py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <span>View outfit details</span>
          <ChevronUp 
            size={16} 
            className={`transition-transform ${isExpanded ? "rotate-180" : ""}`}
          />
        </button>

        {isExpanded && (
          <div className="mt-4 space-y-3">
            <div className="flex items-center gap-3 p-3 bg-card rounded-lg">
              <div className="w-12 h-12 bg-fashion-orange rounded-lg"></div>
              <div>
                <p className="font-medium text-sm">Orange Bomber Jacket</p>
                <p className="text-xs text-muted-foreground">Nike • Size M</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-card rounded-lg">
              <div className="w-12 h-12 bg-blue-900 rounded-lg"></div>
              <div>
                <p className="font-medium text-sm">Dark Denim Jeans</p>
                <p className="text-xs text-muted-foreground">Levi's • Size 32</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-card rounded-lg">
              <div className="w-12 h-12 bg-gray-100 rounded-lg"></div>
              <div>
                <p className="font-medium text-sm">White Sneakers</p>
                <p className="text-xs text-muted-foreground">Adidas • Size 42</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyOutfit;