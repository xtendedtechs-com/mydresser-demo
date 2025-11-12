import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  Settings
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
import DailyOutfitWithVTO from "@/components/DailyOutfitWithVTO";
import { getPrimaryPhotoUrl } from "@/utils/photoHelpers";
import { Link } from "react-router-dom";

interface DailyOutfitProps {
  date?: Date;
}

export const RealDailyOutfit = ({ date = new Date() }: DailyOutfitProps) => {
  const navigate = useNavigate();
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

  // Load VTO photo from new system or fallback to old profile photo
  useEffect(() => {
    const loadVTOPhoto = async () => {
      // Try new VTO photos system first
      if (photos.length > 0) {
        if (settings?.enable_random_vto_photo) {
          const randomPhoto = getRandomActivePhoto();
          if (randomPhoto) {
            setUserPhoto(randomPhoto.photo_url);
            return;
          }
        } else {
          // Use the first active photo or the most recent one
          const activePhotos = photos.filter(p => p.is_active);
          const photoToUse = activePhotos.length > 0 ? activePhotos[0] : photos[0];
          if (photoToUse) {
            setUserPhoto(photoToUse.photo_url);
            return;
          }
        }
      }

      // Fallback to old system - check profile.vto_photo_url
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('vto_photo_url')
            .eq('user_id', user.id)
            .single();
          
          if (profile?.vto_photo_url) {
            setUserPhoto(profile.vto_photo_url);
          }
        }
      } catch (error) {
        console.error('Error loading VTO photo:', error);
      }
    };

    loadVTOPhoto();
  }, [photos, settings, getRandomActivePhoto]);

  useEffect(() => {
    if (!wardrobeLoading && !preferencesLoading && wardrobeItems.length > 0 && !outfit) {
      const timer = setTimeout(() => {
        generateDailyOutfit();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [wardrobeLoading, preferencesLoading]);

  // VTO generation is now handled by the legacy, stable component (DailyOutfitWithVTO)
  // to ensure reliability after dashboard redesign.

  // Helper: Generate a descriptive, varied name for the outfit with unique seed
  const generateOutfitName = (genOutfit: any, w: any, seed = Date.now()) => {
    const items = genOutfit?.items || [];
    const cats = items.map((it: any) => (it.category || '').toLowerCase());
    const hasFormal = cats.some((c: string) => ['suit', 'blazer', 'dress_shirt', 'oxfords'].includes(c));
    const hasSporty = cats.some((c: string) => ['sneakers', 'hoodie', 'activewear'].includes(c));
    const hasOuter = cats.some((c: string) => ['coat', 'jacket', 'outerwear'].includes(c));

    const formalPool = ['The Dapper', 'The Gentleman', 'Classy Guy', 'Modern Executive', 'Midnight Tux', 'Sharp Edge', 'Refined Look'];
    const smartPool = ['Urban Classic', 'Polished Minimal', 'Smart Casual', 'City Sharp', 'Tailored Ease', 'Modern Edge', 'Street Elegant'];
    const casualPool = ['Easy Breezy', 'Streetwise', 'Everyday Flow', 'Weekend Mode', 'Clean Lines', 'Relaxed Vibe', 'Casual Chic'];
    const cozyPool = ['Warm Layers', 'Cozy Chic', 'Frost Ready', 'Breezy Layers', 'Cloud Soft', 'Winter Embrace', 'Snug Style'];

    let pool = casualPool;
    if (hasFormal) pool = formalPool;
    else if (hasOuter) pool = cozyPool;
    else if (hasSporty) pool = smartPool;

    // Use seed for deterministic but unique selection
    const index = Math.floor((seed % 997) % pool.length);
    const pick = pool[index];
    
    // Prefer AI-provided but replace generic names
    const aiName: string | undefined = genOutfit?.name;
    const generic = !aiName || /daily pick|outfit|look/gi.test(aiName);
    return generic ? pick : aiName!;
  };

  // Helper: Generate a weather-aware explanation
  const generateOutfitDescription = (genOutfit: any, w: any) => {
    const items = genOutfit?.items || [];
    const count = items.length;
    const temp = Math.round(w?.temperature ?? 0);
    const cond = (w?.condition || 'mixed').toLowerCase();
    const feels = Math.round(w?.feelsLike ?? temp);
    const loc = w?.location === 'Estimated Location' ? 'your area' : w?.location || 'your area';

    const mentions: string[] = [];
    if (cond.includes('rain')) mentions.push('water-friendly layers');
    if (cond.includes('snow')) mentions.push('insulating pieces');
    if (cond.includes('clear')) mentions.push('clean lines');
    if (cond.includes('cloud')) mentions.push('balanced tones');
    if (temp <= 8) mentions.push('warm textures');
    if (temp >= 26) mentions.push('breathable fabrics');

    const core = mentions.slice(0, 2).join(' and ') || 'complimentary detailing';

    return `Built for ${cond} at ${temp}°C (feels ${feels}°C) in ${loc}, this ${count}-piece combo balances comfort and style with ${core}. Each item is chosen to work together in silhouette and color.`;
  };

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

      // Generate outfit using AI with unique seed to ensure variety
      const outfitAI = new OutfitAI();
      const generatedOutfit = await outfitAI.generateOutfit({
        wardrobeItems,
        weather: weatherData,
        preferences: preferences?.suggestion_settings || {},
        occasion: 'daily'
      });

      console.log('Generated outfit with name:', generatedOutfit.name);
      console.log('Generated outfit reasoning:', generatedOutfit.reasoning);

      // Save outfit to database with AI-generated name and description
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: savedOutfit } = await supabase
          .from('outfits')
          .insert({
            user_id: user.id,
            name: generatedOutfit.name || `Daily Pick ${Date.now()}`,
            occasion: 'casual',
            season: 'all-season',
            is_ai_generated: true,
            ai_generation_prompt: generatedOutfit.reasoning,
            weather_conditions: weatherData,
            notes: generatedOutfit.reasoning || `Generated on ${new Date().toLocaleDateString()}`,
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

      // Force new outfit state with unique timestamp to trigger re-render
      const uniqueSeed = Date.now() + Math.floor(Math.random() * 1000);
      const computedName = generateOutfitName(generatedOutfit, weatherData, uniqueSeed);
      const computedReasoning = generateOutfitDescription(generatedOutfit, weatherData);
      const newOutfit = {
        ...generatedOutfit,
        id: generatedOutfit.id || `temp-${uniqueSeed}`,
        name: computedName,
        reasoning: computedReasoning,
        confidence: Math.round((generatedOutfit.confidence || 0.85) * 100),
        _seed: uniqueSeed // Track seed for debugging
      };
      
      console.log('Setting new outfit state:', newOutfit.name, newOutfit.reasoning, 'seed:', uniqueSeed);
      setOutfit(newOutfit);
    } catch (error) {
      console.error('Error generating outfit:', error);
      toast.error('Failed to generate outfit');
    } finally {
      setLoading(false);
    }
  };

  const regenerateOutfit = async () => {
    setRegenerating(true);
    setVtoImage(null); // Clear old VTO
    setOutfit(null); // Clear old outfit completely to force new name and description
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

  const generateVTO = async (photoUrl?: string) => {
    const photo = photoUrl || userPhoto;
    if (!photo || !outfit) return;

    setGeneratingVTO(true);
    try {
      // Convert storage URL to base64 if needed
      let imageData = photo;
      if (photo.startsWith('http')) {
        const response = await fetch(photo);
        const blob = await response.blob();
        imageData = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
      }

      const { data, error } = await supabase.functions.invoke('ai-virtual-tryon', {
        body: {
          userImage: imageData,
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
          <Button onClick={() => navigate('/add')}>
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
          <div className="flex-1">
            <CardTitle className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <span>{outfit.name || 'Daily Outfit'}</span>
            </CardTitle>
            <div className="flex items-center flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>{date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
              </div>
              {weather && (
                <>
                  <div className="flex items-center space-x-1">
                    <Cloud className="w-4 h-4" />
                    <span>{weather.condition}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Thermometer className="w-4 h-4" />
                    <span>{Math.round(weather.temperature)}°C</span>
                  </div>
                </>
              )}
              <Badge variant="secondary">{outfit.confidence || 85}% match</Badge>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={regenerateOutfit}
            disabled={regenerating}
            title="Generate new outfit"
          >
            <RefreshCw className={`w-4 h-4 ${regenerating ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <DailyOutfitWithVTO outfit={outfit} userPhoto={userPhoto || undefined} />

        {/* Outfit Items */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {outfit.items?.map((item: any, index: number) => (
            <Link key={item.id || index} to={`/wardrobe/item/${item.id}`} className="block text-center">
              <div className="relative mb-2">
                <Avatar className="w-20 h-20 mx-auto">
                  <AvatarImage src={getPrimaryPhotoUrl(item.photos, item.category)} />
                  <AvatarFallback>{item.name?.slice(0, 2)?.toUpperCase() || 'IT'}</AvatarFallback>
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
            </Link>
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