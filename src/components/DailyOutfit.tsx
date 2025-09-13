import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Heart, 
  RotateCcw, 
  ThumbsDown,
  Clock,
  Calendar,
  Thermometer,
  ChevronUp,
  Share2,
  Plus,
  Star,
  Edit3,
  MapPin,
  Sparkles
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSocial } from "@/hooks/useSocial";
import ReactionButton from "@/components/ReactionButton";

interface OutfitItem {
  id: string;
  name: string;
  category: string;
  brand?: string;
  color?: string;
  image?: string;
  type: 'top' | 'bottom' | 'shoes' | 'accessory' | 'outerwear';
}

interface DailyOutfitData {
  id: string;
  name: string;
  occasion: string;
  timeSlot: string;
  weatherConditions: {
    temperature: number;
    condition: string;
    humidity?: number;
  };
  items: OutfitItem[];
  confidence: number;
  reasoning: string;
  nextUpdate: string;
  photo?: string;
}

const DailyOutfit = () => {
  const [outfit, setOutfit] = useState<DailyOutfitData | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const { toast } = useToast();
  const { addReaction, removeReaction } = useSocial();

  useEffect(() => {
    // Load user photo and initial outfit
    loadUserPhoto();
    generateOutfit();
  }, []);

  const loadUserPhoto = async () => {
    // In a real implementation, this would load from user profile
    // For now, we'll use a placeholder
    setUserPhoto("/api/placeholder/300/400");
  };

  const generateOutfit = async () => {
    setIsGenerating(true);
    try {
      // Simulate AI outfit generation
      // In production, this would call your AI service
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockOutfit: DailyOutfitData = {
        id: `outfit-${Date.now()}`,
        name: "Professional Chic",
        occasion: "Work Meeting",
        timeSlot: "9:00 AM - 5:00 PM",
        weatherConditions: {
          temperature: 22,
          condition: "Partly Cloudy",
          humidity: 65
        },
        items: [
          {
            id: "1",
            name: "Classic White Button-Down",
            category: "Shirts",
            brand: "COS",
            color: "White",
            type: "top",
            image: "/api/placeholder/200/250"
          },
          {
            id: "2", 
            name: "High-Waisted Trousers",
            category: "Pants",
            brand: "Zara",
            color: "Navy",
            type: "bottom",
            image: "/api/placeholder/200/250"
          },
          {
            id: "3",
            name: "Leather Pumps",
            category: "Shoes",
            brand: "Cole Haan",
            color: "Black",
            type: "shoes",
            image: "/api/placeholder/200/250"
          },
          {
            id: "4",
            name: "Structured Blazer",
            category: "Jackets",
            brand: "Massimo Dutti",
            color: "Navy",
            type: "outerwear",
            image: "/api/placeholder/200/250"
          }
        ],
        confidence: 92,
        reasoning: "Perfect for your 2 PM client presentation. The structured blazer adds authority while the classic pieces ensure comfort throughout your busy day.",
        nextUpdate: "7:00 PM (Evening Casual)",
        photo: "/api/placeholder/300/400"
      };

      setOutfit(mockOutfit);
    } catch (error) {
      toast({
        title: "Error generating outfit",
        description: "Failed to create your daily outfit. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleLike = async () => {
    if (!outfit) return;
    
    try {
      await addReaction("outfit", outfit.id, "like");
      toast({
        title: "Outfit liked! 💖",
        description: "We'll remember your style preferences.",
      });
    } catch (error) {
      console.error("Error liking outfit:", error);
    }
  };

  const handleDislike = async () => {
    if (!outfit) return;
    
    try {
      await addReaction("outfit", outfit.id, "dislike");
      toast({
        title: "Thanks for the feedback",
        description: "We'll avoid similar combinations in the future.",
      });
      // Auto-generate new outfit after dislike
      generateOutfit();
    } catch (error) {
      console.error("Error disliking outfit:", error);
    }
  };

  const handleRegenerate = () => {
    toast({
      title: "Generating new outfit...",
      description: "Creating a fresh look for you!",
    });
    generateOutfit();
  };

  const handleItemAction = (action: string, item?: OutfitItem) => {
    const target = item ? item.name : "entire outfit";
    toast({
      title: `${action} ${target}`,
      description: `Successfully ${action.toLowerCase()}ed ${target}!`,
    });
  };

  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'sunny': return '☀️';
      case 'cloudy': return '☁️';
      case 'partly cloudy': return '⛅';
      case 'rainy': return '🌧️';
      case 'snowy': return '❄️';
      default: return '🌤️';
    }
  };

  if (!outfit) {
    return (
      <Card className="p-6 bg-gradient-to-r from-primary/10 to-accent/10">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <div>
            <h3 className="font-semibold">Generating Your Perfect Outfit</h3>
            <p className="text-sm text-muted-foreground">
              Analyzing your schedule, weather, and style preferences...
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Outfit Display */}
      <Card className="overflow-hidden bg-gradient-to-b from-background to-accent/5">
        {/* Header */}
        <div className="p-4 border-b bg-gradient-to-r from-primary/5 to-accent/5">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <h2 className="font-bold text-lg">Today's Outfit</h2>
                <Badge variant="secondary" className="text-xs">
                  {outfit.confidence}% match
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{outfit.timeSlot}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Thermometer className="w-3 h-3" />
                  <span>{outfit.weatherConditions.temperature}°C</span>
                  <span>{getWeatherIcon(outfit.weatherConditions.condition)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  <span>{outfit.occasion}</span>
                </div>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
            >
              <ChevronUp className={`w-4 h-4 transition-transform ${showDetails ? 'rotate-180' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Outfit Visualization */}
        <div className="relative">
          <div className="aspect-[3/4] bg-muted relative overflow-hidden">
            {userPhoto ? (
              <img
                src={userPhoto}
                alt="Your outfit visualization"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <div className="text-4xl mb-2">👤</div>
                  <p className="text-sm">Upload a photo to see outfits on you!</p>
                </div>
              </div>
            )}
            
            {/* Outfit overlay info */}
            <div className="absolute top-4 left-4 right-4">
              <div className="bg-black/60 backdrop-blur-sm rounded-lg p-3 text-white">
                <h3 className="font-semibold">{outfit.name}</h3>
                <p className="text-xs opacity-90">{outfit.reasoning}</p>
              </div>
            </div>

            {/* Action buttons overlay */}
            <div className="absolute bottom-4 left-4 right-4">
              <div className="flex gap-2 justify-center">
                <Button
                  variant="secondary"
                  size="icon"
                  className="bg-black/60 backdrop-blur-sm text-white hover:bg-black/80"
                  onClick={handleDislike}
                  disabled={isGenerating}
                >
                  <ThumbsDown className="w-4 h-4" />
                </Button>
                
                <Button
                  variant="secondary"
                  size="icon"
                  className="bg-black/60 backdrop-blur-sm text-white hover:bg-black/80"
                  onClick={handleRegenerate}
                  disabled={isGenerating}
                >
                  <RotateCcw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                </Button>
                
                <Button
                  variant="secondary"
                  size="icon"
                  className="bg-black/60 backdrop-blur-sm text-white hover:bg-black/80"
                  onClick={handleLike}
                  disabled={isGenerating}
                >
                  <Heart className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Outfit Details - Expandable */}
        {showDetails && (
          <div className="p-4 space-y-4 border-t">
            {/* Item Breakdown */}
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <span>Outfit Breakdown</span>
                <Badge variant="outline" className="text-xs">
                  {outfit.items.length} items
                </Badge>
              </h4>
              
              <div className="grid grid-cols-2 gap-3">
                {outfit.items.map((item) => (
                  <Card key={item.id} className="p-3 hover:shadow-md transition-shadow">
                    <div className="flex gap-3">
                      <div className="w-12 h-16 bg-muted rounded overflow-hidden flex-shrink-0">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h5 className="font-medium text-sm truncate">{item.name}</h5>
                        <p className="text-xs text-muted-foreground">{item.brand}</p>
                        <Badge variant="secondary" className="text-xs mt-1">
                          {item.category}
                        </Badge>
                      </div>
                    </div>
                    
                    {/* Item Actions */}
                    <div className="flex gap-1 mt-3">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6"
                        onClick={() => handleItemAction("Like", item)}
                      >
                        <Heart className="w-3 h-3" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6"
                        onClick={() => handleItemAction("Star", item)}
                      >
                        <Star className="w-3 h-3" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6"
                        onClick={() => handleItemAction("Add", item)}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Outfit Actions */}
            <div className="flex gap-2 pt-2 border-t">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={() => handleItemAction("Add to Collection")}
              >
                <Plus className="w-4 h-4 mr-2" />
                Save Outfit
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleItemAction("Edit")}
              >
                <Edit3 className="w-4 h-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleItemAction("Share")}
              >
                <Share2 className="w-4 h-4" />
              </Button>
            </div>

            {/* Next Outfit Preview */}
            {outfit.nextUpdate && (
              <div className="bg-accent/20 rounded-lg p-3">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span className="font-medium">Next outfit:</span>
                  <span className="text-muted-foreground">{outfit.nextUpdate}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Social Reactions */}
      <div className="flex items-center justify-center gap-4">
        <ReactionButton
          targetType="outfit"
          targetId={outfit.id}
          reactionType="like"
          size="md"
          showCount={true}
        />
        <ReactionButton
          targetType="outfit"
          targetId={outfit.id}
          reactionType="love"
          size="md"
          showCount={true}
        />
        <ReactionButton
          targetType="outfit"
          targetId={outfit.id}
          reactionType="star"
          size="md"
          showCount={true}
        />
      </div>
    </div>
  );
};

export default DailyOutfit;