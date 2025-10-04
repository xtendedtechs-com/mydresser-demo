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
  Sparkles,
  Loader2,
  RefreshCw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSocial } from "@/hooks/useSocial";
import ReactionButton from "@/components/ReactionButton";
import { useWardrobe, WardrobeItem } from "@/hooks/useWardrobe";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { weatherService, WeatherData } from "@/services/weatherService";
import { calendarService, CalendarEvent } from "@/services/calendarService";
import { supabase } from "@/integrations/supabase/client";
import SmartOutfitEngine from "@/services/smartOutfitEngine";
import VirtualTryOn from "@/components/VirtualTryOn";
import { getPrimaryPhotoUrl } from "@/utils/photoHelpers";

const getTimeSlot = (timeOfDay: string): string => {
  const times: Record<string, string> = {
    morning: 'Morning (6AM - 12PM)',
    afternoon: 'Afternoon (12PM - 5PM)',
    evening: 'Evening (5PM - 10PM)',
    night: 'Night (10PM - 6AM)'
  };
  return times[timeOfDay] || times.morning;
};

const getNextUpdate = (currentTime: string): string => {
  const updates: Record<string, string> = {
    morning: 'Afternoon at 12:00 PM',
    afternoon: 'Evening at 5:00 PM',
    evening: 'Tomorrow morning',
    night: 'Tomorrow morning'
  };
  return updates[currentTime] || 'Tomorrow morning';
};

const getCurrentSeason = (): string => {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'fall';
  return 'winter';
};

const generateOutfitName = (items: WardrobeItem[], occasion: string): string => {
  const hasJacket = items.some(i => i.category === 'outerwear' || i.category === 'jackets');
  const hasDress = items.some(i => i.category === 'dresses');
  
  if (hasDress) return `Elegant ${occasion} Dress Outfit`;
  if (hasJacket && occasion === 'business') return 'Professional Power Suit';
  if (hasJacket) return 'Layered Street Style';
  if (occasion === 'casual') return 'Casual Day Look';
  if (occasion === 'formal') return 'Formal Evening Ensemble';
  return 'Daily Outfit';
};

const generateReasoning = (items: WardrobeItem[], weather: WeatherData | null, occasion: string): string => {
  const temp = weather?.temperature || 20;
  const condition = weather?.condition || 'mild';
  
  let reason = `Perfect ${occasion} outfit for ${condition} weather at ${temp}°C. `;
  
  if (temp < 15) reason += 'Layered for warmth. ';
  if (temp > 25) reason += 'Breathable and light. ';
  
  const colors = items.map(i => i.color).filter(Boolean);
  if (colors.length > 0) {
    reason += `Features ${colors.slice(0, 2).join(' and ')} tones. `;
  }
  
  return reason;
};

const extractTags = (items: WardrobeItem[], occasion: string): string[] => {
  const tags = new Set<string>();
  tags.add(occasion);
  tags.add(getCurrentSeason());
  
  items.forEach(item => {
    if (item.tags) {
      item.tags.forEach(tag => tags.add(tag));
    }
  });
  
  return Array.from(tags).slice(0, 5);
};

interface OutfitItem extends WardrobeItem {
  // Additional properties specific to outfit display can be added here
}

interface DailyOutfitData {
  id: string;
  items: WardrobeItem[];
  name: string;
  reasoning: string;
  confidence: number;
  tags: string[];
  timeSlot: string;
  weatherConditions: WeatherData;
  nextUpdate: string;
  photo?: string;
}

const DailyOutfit = () => {
  const [outfit, setOutfit] = useState<DailyOutfitData | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [dislikedOutfits, setDislikedOutfits] = useState<string[]>([]);
  const { toast } = useToast();
  const { addReaction, removeReaction } = useSocial();
  const { updateItem } = useWardrobe();
  const { items, loading: wardrobeLoading } = useWardrobe();
  const { preferences, loading: preferencesLoading } = useUserPreferences();

  useEffect(() => {
    initializeOutfit();
  }, []);

  useEffect(() => {
    if (!wardrobeLoading && !preferencesLoading && items.length > 0) {
      generateOutfit();
    }
  }, [wardrobeLoading, preferencesLoading, items]);

  const initializeOutfit = async () => {
    await Promise.all([
      loadWeather(),
      loadCalendarEvents()
    ]);
    loadUserPhoto();
    
    // Load disliked outfits from localStorage
    const saved = localStorage.getItem('dislikedOutfits');
    if (saved) {
      setDislikedOutfits(JSON.parse(saved));
    }
  };

  const loadUserPhoto = async () => {
    // Load from user profile - will be available after profile is loaded
    setUserPhoto(null);
  };

  const loadWeather = async () => {
    try {
      // Try to get user's location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            const weatherData = await weatherService.getCurrentWeather(latitude, longitude);
            setWeather(weatherData);
          },
          async () => {
            // Fallback to mock weather
            const weatherData = await weatherService.getCurrentWeather(0, 0);
            setWeather(weatherData);
          }
        );
      } else {
        // Fallback for browsers without geolocation
        const weatherData = await weatherService.getCurrentWeather(0, 0);
        setWeather(weatherData);
      }
    } catch (error) {
      console.warn('Failed to load weather:', error);
    }
  };

  const loadCalendarEvents = async () => {
    try {
      const events = await calendarService.getTodaysEvents();
      setCalendarEvents(events);
    } catch (error) {
      console.warn('Failed to load calendar events:', error);
    }
  };

  const generateOutfit = async () => {
    if (!items || items.length === 0) {
      toast({
        title: "No wardrobe items found",
        description: "Add some clothes to your wardrobe to get outfit suggestions!",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      // Determine current context
      const currentHour = new Date().getHours();
      let timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
      if (currentHour < 12) timeOfDay = 'morning';
      else if (currentHour < 17) timeOfDay = 'afternoon';
      else if (currentHour < 22) timeOfDay = 'evening';
      else timeOfDay = 'night';

      // Get occasion from preferences or default to casual
      const occasion = preferences?.notifications?.outfit_suggestions ? 'work' : 'casual';

      // Use SmartOutfitEngine for intelligent outfit generation
      const outfitItems = SmartOutfitEngine.generateOutfit(items, {
        weather: weather ? { temp: weather.temperature, condition: weather.condition } : undefined,
        occasion,
        season: getCurrentSeason(),
        avoidItems: dislikedOutfits
      });
      
      if (!outfitItems || outfitItems.length === 0) {
        throw new Error('Could not generate a valid outfit');
      }
      
      // Validate the outfit
      const validation = SmartOutfitEngine.validateOutfit(outfitItems);
      if (!validation.valid) {
        console.warn('Outfit validation issues:', validation.issues);
      }
      
      // Calculate compatibility score
      const compatibility = SmartOutfitEngine.calculateCompatibility(outfitItems);
      
      // Create outfit description
      const outfitName = generateOutfitName(outfitItems, occasion);
      const reasoning = generateReasoning(outfitItems, weather, occasion);
      
      // Convert to DailyOutfitData format
      const baseOutfitData: DailyOutfitData = {
        id: `temp-${crypto?.randomUUID?.() || Date.now()}`,
        items: outfitItems,
        name: outfitName,
        reasoning: reasoning,
        confidence: compatibility,
        tags: extractTags(outfitItems, occasion),
        timeSlot: getTimeSlot(timeOfDay),
        weatherConditions: weather || {
          temperature: 20,
          condition: 'Mild',
          humidity: 60,
          windSpeed: 5,
          description: 'Pleasant weather',
          icon: '🌤️',
          feelsLike: 20,
          location: 'Current Location'
        },
        nextUpdate: getNextUpdate(timeOfDay),
        photo: userPhoto || undefined
      };

      // Persist the generated outfit immediately so reactions/lists work with real UUID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: savedOutfit, error: outfitInsertError } = await supabase
        .from('outfits')
        .insert({
          user_id: user.id,
          name: baseOutfitData.name,
          occasion: 'casual',
          season: 'all-season',
          is_ai_generated: true,
          ai_generation_prompt: baseOutfitData.reasoning,
          weather_conditions: baseOutfitData.weatherConditions as any,
          notes: `Auto-generated at ${new Date().toISOString()}`,
          is_favorite: false
        })
        .select()
        .maybeSingle();

      if (outfitInsertError) throw outfitInsertError;

      // Link items to the saved outfit
      if (savedOutfit) {
        for (const item of baseOutfitData.items) {
          await supabase.from('outfit_items').insert({
            outfit_id: savedOutfit.id,
            wardrobe_item_id: item.id,
            item_type: item.category
          });
        }
      }

      const finalOutfit: DailyOutfitData = savedOutfit 
        ? { ...baseOutfitData, id: savedOutfit.id }
        : baseOutfitData;

      setOutfit(finalOutfit);
      
      toast({
        title: "New outfit ready!",
        description: `${finalOutfit.confidence}% match - ${finalOutfit.name}`,
      });
    } catch (error) {
      console.error('Outfit generation error:', error);
      toast({
        title: "Error generating outfit",
        description: "Failed to create your daily outfit. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Removed placeholder items - only use real user wardrobe data
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
      // Add to disliked outfits to avoid in future
      const newDisliked = [...dislikedOutfits, ...outfit.items.map(item => item.id)];
      setDislikedOutfits(newDisliked);
      localStorage.setItem('dislikedOutfits', JSON.stringify(newDisliked));
      
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

  const handleItemAction = async (action: string, item?: WardrobeItem) => {
    if (!outfit) return;

    try {
      switch (action) {
        case "Like":
          if (item) {
            await updateItem(item.id, { is_favorite: true });
            toast({
              title: "Item liked!",
              description: `${item.name} added to favorites`,
            });
          } else {
            await handleLike();
          }
          break;
        
        case "Star":
          if (item) {
            await addReaction("wardrobe_item", item.id, "star");
            toast({
              title: "Item starred!",
              description: `${item.name} added to starred items`,
            });
          }
          break;
        
        case "Add":
        case "Add to Collection":
          await saveOutfitToCollection();
          break;
        
        case "Share":
          await handleShare();
          break;
        
        case "Edit":
          toast({
            title: "Edit outfit",
            description: "Outfit editing coming soon!",
          });
          break;
        
        default:
          toast({
            title: `${action} ${item ? item.name : "entire outfit"}`,
            description: `Successfully ${action.toLowerCase()}ed!`,
          });
      }
    } catch (error) {
      console.error('Action failed:', error);
      toast({
        title: "Action failed",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const saveOutfitToCollection = async () => {
    if (!outfit) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Ensure outfit exists in DB
      let outfitId = outfit.id;
      if (String(outfitId).startsWith('temp-')) {
        const { data: savedOutfit, error: outfitError } = await supabase
          .from('outfits')
          .insert({
            user_id: user.id,
            name: outfit.name,
            occasion: 'casual',
            season: 'all-season',
            is_ai_generated: true,
            ai_generation_prompt: outfit.reasoning,
            weather_conditions: outfit.weatherConditions as any,
            notes: `Generated on ${new Date().toLocaleDateString()} with ${outfit.confidence}% confidence`,
            is_favorite: false
          })
          .select()
          .single();
        if (outfitError) throw outfitError;
        outfitId = savedOutfit.id;
        // Also persist items
        for (const item of outfit.items) {
          await supabase.from('outfit_items').insert({
            outfit_id: outfitId,
            wardrobe_item_id: item.id,
            item_type: item.category
          });
        }
      }

      // Get or create 'Outfit History' collection
      const { data: existingCollection } = await supabase
        .from('collections')
        .select('*')
        .eq('user_id', user.id)
        .eq('name', 'Outfit History')
        .maybeSingle();

      let collectionId = existingCollection?.id;
      if (!collectionId) {
        const { data: newCollection, error: collectionError } = await supabase
          .from('collections')
          .insert({
            user_id: user.id,
            name: 'Outfit History',
            description: 'Automatically saved outfits',
            type: 'outfit',
            is_public: false
          })
          .select()
          .single();
        if (collectionError) throw collectionError;
        collectionId = newCollection.id;
      }

      // Add outfit and items to the collection
      const inserts = [
        { collection_id: collectionId, outfit_id: outfitId },
        ...outfit.items.map(i => ({ collection_id: collectionId!, wardrobe_item_id: i.id }))
      ];
      await supabase.from('collection_items').insert(inserts);

      toast({
        title: 'Saved to Outfit History',
        description: `${outfit.name} and its items were saved to your collection`,
      });
    } catch (error: any) {
      console.error('Save outfit error:', error);
      toast({
        title: 'Save failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleShare = async () => {
    if (!outfit) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `My ${outfit.name}`,
          text: `Check out my ${outfit.name} outfit! ${outfit.reasoning}`,
          url: window.location.href
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback: copy to clipboard
      const shareText = `Check out my ${outfit.name} outfit! ${outfit.reasoning}`;
      await navigator.clipboard.writeText(shareText);
      toast({
        title: "Copied to clipboard!",
        description: "Share this outfit with your friends",
      });
    }
  };

  const getWeatherIcon = (condition: string) => {
    // Use weather service icon if available
    if (weather?.icon) return weather.icon as any;
    
    switch (condition.toLowerCase()) {
      case 'sunny': case 'clear': return '☀️';
      case 'cloudy': case 'overcast': return '☁️';
      case 'partly cloudy': case 'mainly clear': return '⛅';
      case 'rainy': case 'rain': case 'shower': return '🌧️';
      case 'snowy': case 'snow': return '❄️';
      case 'thunderstorm': return '⛈️';
      case 'foggy': case 'fog': return '🌫️';
      default: return '🌤️';
    }
  };


  if (wardrobeLoading || preferencesLoading) {
    return (
      <Card className="p-6 bg-gradient-to-r from-primary/10 to-accent/10">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <div>
            <h3 className="font-semibold">Loading Your Wardrobe</h3>
            <p className="text-sm text-muted-foreground">
              Preparing your personalized outfit suggestions...
            </p>
          </div>
        </div>
      </Card>
    );
  }

  if (!outfit) {
    return (
      <Card className="p-6 bg-gradient-to-r from-primary/10 to-accent/10">
        <div className="text-center space-y-4">
          <div className="text-center space-y-4">
            {isGenerating ? (
              <>
                <RefreshCw className="w-8 h-8 animate-spin mx-auto text-primary" />
                <div>
                  <h3 className="font-semibold">Creating Your Perfect Outfit</h3>
                  <p className="text-sm text-muted-foreground">
                    Analyzing weather, occasion, and your style preferences...
                  </p>
                </div>
              </>
            ) : (
              <>
                <Sparkles className="w-8 h-8 mx-auto text-primary" />
                <div>
                  <h3 className="font-semibold">Ready to Style You</h3>
                  <p className="text-sm text-muted-foreground">
                    {items.length === 0 
                      ? "Add some clothes to your wardrobe to get started!"
                      : "Click generate to create your perfect outfit"}
                  </p>
                </div>
                {items.length > 0 && (
                  <Button onClick={generateOutfit} className="mt-4">
                    Generate My Outfit
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Virtual Try-On Setup */}
      {!userPhoto && (
        <VirtualTryOn 
          onPhotoUploaded={(url) => setUserPhoto(url)}
          currentPhoto={userPhoto}
        />
      )}

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
                  <span className="text-xs">feels {outfit.weatherConditions.feelsLike}°C</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  <span>{outfit.tags?.slice(0, 2).join(', ') || outfit.name}</span>
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
                        <img
                          src={getPrimaryPhotoUrl(item.photos, item.category)}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
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