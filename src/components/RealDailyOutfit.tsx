import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Sparkles, 
  RefreshCw, 
  Heart, 
  Share2, 
  Calendar, 
  Thermometer, 
  Cloud,
  Loader2,
  Edit,
  ShoppingBag,
  Camera,
  Upload
} from "lucide-react";
import { useWardrobe } from "@/hooks/useWardrobe";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { useDailyOutfitSuggestions } from "@/hooks/useDailyOutfitSuggestions";
import { useVTOPhotos } from "@/hooks/useVTOPhotos";
import { useUserSettings } from "@/hooks/useUserSettings";
import { OutfitAI } from "@/ai/OutfitAI";
import { weatherService } from "@/services/weatherService";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import EditOutfitDialog from "./EditOutfitDialog";
import MarketOutfitSuggestions from "./MarketOutfitSuggestions";

interface DailyOutfitProps {
  date?: Date;
}

export const RealDailyOutfit = ({ date = new Date() }: DailyOutfitProps) => {
  const { items: wardrobeItems, loading: wardrobeLoading } = useWardrobe();
  const { preferences, loading: preferencesLoading } = useUserPreferences();
  const { createSuggestion, acceptSuggestion, rejectSuggestion } = useDailyOutfitSuggestions();
  const { photos, getRandomActivePhoto } = useVTOPhotos();
  const { settings } = useUserSettings();
  
  const [outfit, setOutfit] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [weather, setWeather] = useState<any>(null);
  const [regenerating, setRegenerating] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [showMarketSuggestions, setShowMarketSuggestions] = useState(false);
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [vtoImage, setVtoImage] = useState<string | null>(null);
  const [generatingVTO, setGeneratingVTO] = useState(false);

  // Load VTO photo based on settings (random or first active)
  useEffect(() => {
    if (photos.length > 0) {
      if (settings?.enable_random_vto_photo) {
        const randomPhoto = getRandomActivePhoto();
        if (randomPhoto) {
          setUserPhoto(randomPhoto.photo_url);
        }
      } else {
        // Use the first active photo or the most recent one
        const activePhotos = photos.filter(p => p.is_active);
        const photoToUse = activePhotos.length > 0 ? activePhotos[0] : photos[0];
        if (photoToUse) {
          setUserPhoto(photoToUse.photo_url);
        }
      }
    }
  }, [photos, settings, getRandomActivePhoto]);

  useEffect(() => {
    if (!wardrobeLoading && !preferencesLoading && wardrobeItems.length > 0 && !outfit) {
      const timer = setTimeout(() => {
        generateDailyOutfit();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [wardrobeLoading, preferencesLoading]);

  // Generate VTO when outfit and userPhoto are both available
  useEffect(() => {
    if (outfit && userPhoto && !vtoImage && !generatingVTO) {
      generateVTO();
    }
  }, [outfit, userPhoto]);

  const generateDailyOutfit = async () => {
    if (!wardrobeItems.length) return;
    
    try {
      setLoading(true);
      
      // Get weather data
      let weatherData = null;
      try {
        if (navigator.geolocation) {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
          });
          weatherData = await weatherService.getCurrentWeather(
            position.coords.latitude, 
            position.coords.longitude
          );
        } else {
          weatherData = await weatherService.getCurrentWeather();
        }
        setWeather(weatherData);
      } catch (error) {
        console.warn('Weather data unavailable:', error);
      }

      // Generate outfit using AI
      const outfitAI = new OutfitAI();
      const generatedOutfit = await outfitAI.generateOutfit({
        wardrobeItems,
        weather: weatherData,
        preferences: preferences?.suggestion_settings || {},
        occasion: 'daily'
      });

      // Save outfit to database
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: savedOutfit } = await supabase
          .from('outfits')
          .insert({
            user_id: user.id,
            name: generatedOutfit.name || 'Daily AI Pick',
            occasion: 'casual',
            season: 'all-season',
            is_ai_generated: true,
            ai_generation_prompt: generatedOutfit.reasoning,
            weather_conditions: weatherData,
            notes: `Generated on ${new Date().toLocaleDateString()}`,
            is_favorite: false
          })
          .select()
          .single();

        if (savedOutfit) {
          // Link outfit items
          for (const item of generatedOutfit.items) {
            await supabase.from('outfit_items').insert({
              outfit_id: savedOutfit.id,
              wardrobe_item_id: item.id,
              item_type: item.category
            });
          }
          generatedOutfit.id = savedOutfit.id;
        }
      }

      setOutfit({
        ...generatedOutfit,
        name: generatedOutfit.name || 'Daily AI Pick',
        confidence: Math.round((generatedOutfit.confidence || 0.85) * 100)
      });
    } catch (error) {
      console.error('Error generating outfit:', error);
      toast.error('Failed to generate outfit');
    } finally {
      setLoading(false);
    }
  };

  const regenerateOutfit = async () => {
    setRegenerating(true);
    await generateDailyOutfit();
    setRegenerating(false);
    toast.success('New outfit generated!');
  };

  const saveOutfit = async () => {
    if (!outfit) return;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Create suggestion and mark as accepted
      await createSuggestion({
        outfit_id: outfit.id,
        suggestion_date: new Date().toISOString().split('T')[0],
        time_slot: getCurrentTimeSlot(),
        weather_data: weather,
        occasion: 'casual',
        confidence_score: outfit.confidence || 85,
        is_accepted: true,
        is_rejected: false
      });

      await supabase
        .from('outfits')
        .update({ is_favorite: true })
        .eq('id', outfit.id);

      toast.success('Outfit saved to favorites!');
    } catch (error) {
      toast.error('Failed to save outfit');
    }
  };

  const shareOutfit = async () => {
    if (!outfit) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `My ${outfit.name}`,
          text: `Check out my ${outfit.name} outfit! Generated by MyDresser AI.`,
          url: window.location.href
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      await navigator.clipboard.writeText(
        `Check out my ${outfit.name} outfit! Generated by MyDresser AI.`
      );
      toast.success('Copied to clipboard!');
    }
  };

  const editOutfit = () => {
    setEditDialogOpen(true);
  };

  const handleOutfitUpdated = (updatedOutfit: any) => {
    setOutfit(updatedOutfit);
  };

  const getCurrentTimeSlot = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const photoUrl = reader.result as string;
      setUserPhoto(photoUrl);
      
      // Save to profile
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('profiles')
          .update({ vto_photo_url: photoUrl })
          .eq('user_id', user.id);
      }
      
      toast.success('Photo uploaded! Generating virtual try-on...');
      generateVTO(photoUrl);
    };
    reader.readAsDataURL(file);
  };

  const generateVTO = async (photoUrl?: string) => {
    const photo = photoUrl || userPhoto;
    if (!photo || !outfit) return;

    setGeneratingVTO(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-virtual-tryon', {
        body: {
          userImage: photo,
          clothingItems: outfit.items.map((item: any) => ({
            id: item.id,
            name: item.name,
            category: item.category,
            color: item.color,
            brand: item.brand,
            photo: item.photos?.main || item.photos?.[0] || '/placeholder.svg'
          }))
        }
      });

      if (error) throw error;

      if (data?.editedImageUrl) {
        setVtoImage(data.editedImageUrl);
        toast.success('Virtual try-on ready!');
      }
    } catch (error: any) {
      console.error('VTO generation error:', error);
      toast.error(error.message || 'Failed to generate virtual try-on');
    } finally {
      setGeneratingVTO(false);
    }
  };

  if (wardrobeLoading || preferencesLoading) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center py-8">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading your wardrobe...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading && !outfit) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center py-8">
          <div className="flex flex-col items-center space-y-4">
            <Sparkles className="w-8 h-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Generating your perfect outfit...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!outfit && wardrobeItems.length === 0) {
    return (
      <Card className="w-full">
        <CardContent className="text-center py-8">
          <Sparkles className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground mb-4">
            Add some items to your wardrobe to get AI-powered outfit suggestions!
          </p>
          <Button onClick={() => window.location.href = '/add'}>
            Add Items to Wardrobe
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!outfit) {
    return (
      <Card className="w-full">
        <CardContent className="text-center py-8">
          <Button onClick={generateDailyOutfit} disabled={loading}>
            <Sparkles className="w-4 h-4 mr-2" />
            Generate Daily Outfit
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <span>{outfit.name}</span>
            </CardTitle>
            <CardDescription className="flex items-center space-x-4 mt-2">
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>{date.toLocaleDateString()}</span>
              </div>
              {weather && (
                <div className="flex items-center space-x-1">
                  <Thermometer className="w-4 h-4" />
                  <span>{Math.round(weather.temperature)}°C</span>
                </div>
              )}
              <Badge variant="secondary">{outfit.confidence}% match</Badge>
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={regenerateOutfit}
            disabled={regenerating}
          >
            <RefreshCw className={`w-4 h-4 ${regenerating ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Virtual Try-On Section */}
        <div className="relative">
          <div className="aspect-[3/4] bg-muted rounded-lg overflow-hidden">
            {generatingVTO ? (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                <div className="text-center space-y-2">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                  <p className="text-sm text-muted-foreground">Generating virtual try-on...</p>
                </div>
              </div>
            ) : vtoImage ? (
              <img
                src={vtoImage}
                alt="Virtual Try-On Result"
                className="w-full h-full object-cover"
              />
            ) : userPhoto ? (
              <img
                src={userPhoto}
                alt="Your Photo"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center space-y-4 p-6">
                  <Camera className="w-12 h-12 mx-auto text-muted-foreground" />
                  <div>
                    <h3 className="font-semibold mb-2">Upload Your Photo</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      See yourself in this outfit with AI virtual try-on
                    </p>
                  </div>
                  <Button asChild variant="outline">
                    <label className="cursor-pointer">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Photo
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </label>
                  </Button>
                </div>
              </div>
            )}
            
            {(vtoImage || userPhoto) && (
              <div className="absolute top-2 left-2">
                <Badge className="bg-primary text-primary-foreground">
                  <Sparkles className="w-3 h-3 mr-1" />
                  AI Virtual Try-On
                </Badge>
              </div>
            )}

            {userPhoto && (
              <div className="absolute bottom-2 right-2">
                <Button 
                  size="sm"
                  variant="secondary"
                  asChild
                >
                  <label className="cursor-pointer">
                    <Upload className="w-3 h-3 mr-1" />
                    Change
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                </Button>
              </div>
            )}
          </div>

          {vtoImage && (
            <div className="mt-2 text-center">
              <p className="text-xs text-muted-foreground">
                💡 AI-generated preview. Actual fit may vary.
              </p>
            </div>
          )}
        </div>
        {/* Weather Info */}
        {weather && (
          <div className="flex items-center justify-center space-x-4 p-3 bg-muted rounded-lg">
            <Cloud className="w-5 h-5 text-muted-foreground" />
            <div className="text-sm">
              <span className="font-medium">{weather.condition}</span>
              <span className="text-muted-foreground ml-2">
                {Math.round(weather.temperature)}°C
              </span>
            </div>
          </div>
        )}

        {/* Outfit Items */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {outfit.items?.map((item: any, index: number) => (
            <div key={item.id || index} className="text-center">
              <div className="relative mb-2">
                <Avatar className="w-20 h-20 mx-auto">
                  <AvatarImage src={item.photos?.main || '/placeholder.svg'} />
                  <AvatarFallback>{item.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <Badge 
                  variant="secondary" 
                  className="absolute -top-1 -right-1 text-xs"
                >
                  {item.category}
                </Badge>
              </div>
              <p className="text-sm font-medium">{item.name}</p>
              <p className="text-xs text-muted-foreground">{item.brand}</p>
            </div>
          ))}
        </div>

        {/* Outfit Reasoning */}
        {outfit.reasoning && (
          <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
            <h4 className="font-medium text-sm mb-2">Why this outfit works:</h4>
            <p className="text-sm text-muted-foreground">{outfit.reasoning}</p>
          </div>
        )}

        {/* Style Tags */}
        {outfit.tags && (
          <div className="flex flex-wrap gap-2">
            {outfit.tags.map((tag: string) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <Button onClick={saveOutfit} variant="outline">
            <Heart className="w-4 h-4 mr-2" />
            Save
          </Button>
          <Button onClick={editOutfit} variant="outline">
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button onClick={shareOutfit} variant="outline">
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button 
            onClick={() => setShowMarketSuggestions(true)} 
            variant="outline"
          >
            <ShoppingBag className="w-4 h-4 mr-2" />
            Shop Look
          </Button>
          <Button onClick={regenerateOutfit} disabled={regenerating} className="md:col-span-2">
            <RefreshCw className="w-4 h-4 mr-2" />
            New Pick
          </Button>
        </div>
      </CardContent>
      
      {/* Edit Dialog */}
      <EditOutfitDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        outfit={outfit}
        onOutfitUpdated={handleOutfitUpdated}
      />

      {/* Market Suggestions Dialog */}
      {showMarketSuggestions && (
        <MarketOutfitSuggestions 
          onClose={() => setShowMarketSuggestions(false)}
        />
      )}
    </Card>
  );
};