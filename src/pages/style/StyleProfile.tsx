import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User, Palette, TrendingUp, Save, RefreshCw } from 'lucide-react';

interface StyleProfile {
  style_personality: string[];
  color_palette: {
    primary: string[];
    secondary: string[];
    accent: string[];
  };
  body_type: string;
  preferred_fits: string[];
  budget_range: {
    min: number;
    max: number;
  };
  sustainability_preference: string;
  brand_preferences: string[];
  avoided_brands: string[];
}

export default function StyleProfile() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [profile, setProfile] = useState<StyleProfile>({
    style_personality: [],
    color_palette: { primary: [], secondary: [], accent: [] },
    body_type: '',
    preferred_fits: [],
    budget_range: { min: 0, max: 1000 },
    sustainability_preference: 'medium',
    brand_preferences: [],
    avoided_brands: []
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_style_profiles' as any)
        .select('*')
        .eq('user_id', user.id)
        .single() as any;

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setProfile({
          style_personality: data.style_personality || [],
          color_palette: data.color_palette || { primary: [], secondary: [], accent: [] },
          body_type: data.body_type || '',
          preferred_fits: data.preferred_fits || [],
          budget_range: data.budget_range || { min: 0, max: 1000 },
          sustainability_preference: data.sustainability_preference || 'medium',
          brand_preferences: data.brand_preferences || [],
          avoided_brands: data.avoided_brands || []
        });
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .rpc('upsert_style_profile' as any, {
          p_user_id: user.id,
          p_profile_data: profile
        }) as any;

      if (error) throw error;

      toast({
        title: "Profile Saved",
        description: "Your style profile has been updated successfully"
      });
    } catch (error) {
      console.error('Failed to save profile:', error);
      toast({
        title: "Error",
        description: "Failed to save style profile",
        variant: "destructive"
      });
    }
  };

  const analyzeWardrobe = async () => {
    try {
      setAnalyzing(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .rpc('analyze_user_style' as any, {
          p_user_id: user.id
        }) as any;

      if (error) throw error;

      toast({
        title: "Analysis Complete",
        description: "Your wardrobe has been analyzed. Check the insights!"
      });

      // Update profile with analysis results
      if (data.style_personality) {
        setProfile(prev => ({
          ...prev,
          style_personality: data.style_personality,
          color_palette: {
            primary: data.dominant_colors || prev.color_palette.primary,
            secondary: prev.color_palette.secondary,
            accent: prev.color_palette.accent
          }
        }));
      }
    } catch (error: any) {
      console.error('Failed to analyze:', error);
      if (error.message?.includes('rate limit')) {
        toast({
          title: "Rate Limit Reached",
          description: "You've used your daily analysis quota. Try again tomorrow.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Analysis Failed",
          description: "Failed to analyze your wardrobe",
          variant: "destructive"
        });
      }
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <User className="w-8 h-8" />
              Style Profile
            </h1>
            <p className="text-muted-foreground mt-1">
              Define your personal style preferences
            </p>
          </div>
          <Button onClick={analyzeWardrobe} disabled={analyzing}>
            {analyzing ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <TrendingUp className="w-4 h-4 mr-2" />
                Analyze Wardrobe
              </>
            )}
          </Button>
        </div>

        {/* Style Personality */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Style Personality
          </h3>
          <div className="space-y-4">
            <div>
              <Label>Body Type</Label>
              <Select
                value={profile.body_type}
                onValueChange={(value) => setProfile({ ...profile, body_type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select body type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="athletic">Athletic</SelectItem>
                  <SelectItem value="pear">Pear</SelectItem>
                  <SelectItem value="apple">Apple</SelectItem>
                  <SelectItem value="hourglass">Hourglass</SelectItem>
                  <SelectItem value="rectangle">Rectangle</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Sustainability Preference</Label>
              <Select
                value={profile.sustainability_preference}
                onValueChange={(value) => setProfile({ ...profile, sustainability_preference: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low - Price focused</SelectItem>
                  <SelectItem value="medium">Medium - Balanced</SelectItem>
                  <SelectItem value="high">High - Eco-conscious</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Budget Range */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Budget Range</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Minimum ($)</Label>
              <Input
                type="number"
                value={profile.budget_range.min}
                onChange={(e) => setProfile({
                  ...profile,
                  budget_range: { ...profile.budget_range, min: parseInt(e.target.value) || 0 }
                })}
              />
            </div>
            <div>
              <Label>Maximum ($)</Label>
              <Input
                type="number"
                value={profile.budget_range.max}
                onChange={(e) => setProfile({
                  ...profile,
                  budget_range: { ...profile.budget_range, max: parseInt(e.target.value) || 0 }
                })}
              />
            </div>
          </div>
        </Card>

        {/* Color Palette */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Favorite Colors</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Your color palette is analyzed from your wardrobe. Use the "Analyze Wardrobe" button to update.
          </p>
          <div className="flex gap-2 flex-wrap">
            {profile.color_palette.primary.map((color, idx) => (
              <div
                key={idx}
                className="w-12 h-12 rounded-full border-2 border-border flex items-center justify-center"
                style={{ backgroundColor: color }}
              >
                <span className="text-xs font-semibold text-white drop-shadow">
                  {color}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Save Button */}
        <Button onClick={saveProfile} className="w-full" size="lg">
          <Save className="w-4 h-4 mr-2" />
          Save Profile
        </Button>
      </div>
    </div>
  );
}
