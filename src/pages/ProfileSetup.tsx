import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Sparkles, CheckCircle } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { useWardrobe } from '@/hooks/useWardrobe';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const ProfileSetup = () => {
  const navigate = useNavigate();
  const { user, profile, updateProfile } = useProfile();
  const { } = useWardrobe();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Profile form state
  const [profileData, setProfileData] = useState({
    full_name: profile?.full_name || '',
    bio: profile?.bio || '',
    location: profile?.location || '',
    avatar_url: profile?.avatar_url || ''
  });

  // Style preferences state
  const [stylePreferences, setStylePreferences] = useState({
    favoriteColors: [] as string[],
    stylePersonality: '',
    preferredBrands: [] as string[],
    budgetRange: '',
    shoppingSources: [] as string[]
  });

  // Wardrobe setup state
  const [wardrobeSetup, setWardrobeSetup] = useState({
    createSampleItems: true,
    wardrobeName: 'My Wardrobe',
    wardrobeType: 'closet'
  });

  const colorOptions = ['Black', 'White', 'Navy', 'Gray', 'Beige', 'Brown', 'Red', 'Pink', 'Orange', 'Yellow', 'Green', 'Blue', 'Purple'];
  const personalityOptions = ['Minimalist', 'Bohemian', 'Classic', 'Trendy', 'Edgy', 'Romantic', 'Sporty', 'Professional'];
  const brandOptions = ['Zara', 'H&M', 'Uniqlo', 'Nike', 'Adidas', 'Levi\'s', 'Gap', 'Target', 'Mango', 'COS'];
  const sourceOptions = ['Online Shopping', 'Department Stores', 'Boutiques', 'Thrift Stores', 'Outlet Malls', 'Luxury Retailers'];

  const handleColorToggle = (color: string) => {
    setStylePreferences(prev => ({
      ...prev,
      favoriteColors: prev.favoriteColors.includes(color)
        ? prev.favoriteColors.filter(c => c !== color)
        : [...prev.favoriteColors, color]
    }));
  };

  const handleBrandToggle = (brand: string) => {
    setStylePreferences(prev => ({
      ...prev,
      preferredBrands: prev.preferredBrands.includes(brand)
        ? prev.preferredBrands.filter(b => b !== brand)
        : [...prev.preferredBrands, brand]
    }));
  };

  const handleSourceToggle = (source: string) => {
    setStylePreferences(prev => ({
      ...prev,
      shoppingSources: prev.shoppingSources.includes(source)
        ? prev.shoppingSources.filter(s => s !== source)
        : [...prev.shoppingSources, source]
    }));
  };

  const handleProfileSubmit = async () => {
    try {
      setLoading(true);
      
      await updateProfile({
        full_name: profileData.full_name,
        bio: profileData.bio,
        location: profileData.location,
        avatar_url: profileData.avatar_url
      });

      toast.success('Profile information saved!');
      setStep(2);
    } catch (error: any) {
      toast.error('Failed to save profile: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStyleSubmit = async () => {
    try {
      setLoading(true);
      
      // Use user.id instead of profile?.user_id for authenticated user
      const userId = user?.id;
      if (!userId) {
        throw new Error('User not authenticated');
      }
      
      // Save style preferences to user_preferences table
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: userId,
          suggestion_settings: {
            favoriteColors: stylePreferences.favoriteColors,
            stylePersonality: stylePreferences.stylePersonality,
            preferredBrands: stylePreferences.preferredBrands,
            budgetRange: stylePreferences.budgetRange,
            shoppingSources: stylePreferences.shoppingSources
          }
        });

      if (error) throw error;

      toast.success('Style preferences saved!');
      setStep(3);
    } catch (error: any) {
      toast.error('Failed to save preferences: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleWardrobeSubmit = async () => {
    try {
      setLoading(true);

      // Create initial wardrobe
      const userId = user?.id;
      if (!userId) {
        throw new Error('User not authenticated');
      }
      
      const { error: wardrobeError } = await supabase
        .from('wardrobes')
        .insert({
          user_id: userId,
          name: wardrobeSetup.wardrobeName,
          type: wardrobeSetup.wardrobeType
        });

      if (wardrobeError) throw wardrobeError;

      // Create sample wardrobe items if requested
      if (wardrobeSetup.createSampleItems) {
        await supabase.rpc('create_sample_wardrobe_items');
      }

      toast.success('Wardrobe setup complete!');
      navigate('/');
    } catch (error: any) {
      toast.error('Failed to setup wardrobe: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <Camera className="w-8 h-8 text-primary" />
        </div>
        <CardTitle>Let's Set Up Your Profile</CardTitle>
        <CardDescription>
          Tell us about yourself to personalize your fashion experience
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-center">
          <div className="relative">
            <Avatar className="w-24 h-24">
              <AvatarImage src={profileData.avatar_url} />
              <AvatarFallback>
                {profileData.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <Button 
              size="icon" 
              className="absolute -bottom-2 -right-2 rounded-full w-8 h-8"
              onClick={() => toast.info('Avatar upload coming soon!')}
            >
              <Camera className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={profileData.full_name}
              onChange={(e) => setProfileData(prev => ({ ...prev, full_name: e.target.value }))}
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={profileData.bio}
              onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
              placeholder="Tell us about your style or interests (optional)"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={profileData.location}
              onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
              placeholder="City, Country (optional)"
            />
          </div>
        </div>

        <Button 
          onClick={handleProfileSubmit} 
          className="w-full" 
          disabled={loading || !profileData.full_name.trim()}
        >
          {loading ? 'Saving...' : 'Continue'}
        </Button>
      </CardContent>
    </Card>
  );

  const renderStep2 = () => (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <Sparkles className="w-8 h-8 text-primary" />
        </div>
        <CardTitle>Your Style Preferences</CardTitle>
        <CardDescription>
          Help us understand your fashion taste for better recommendations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label>Favorite Colors</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {colorOptions.map(color => (
              <Badge
                key={color}
                variant={stylePreferences.favoriteColors.includes(color) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => handleColorToggle(color)}
              >
                {color}
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <Label>Style Personality</Label>
          <Select 
            value={stylePreferences.stylePersonality} 
            onValueChange={(value) => setStylePreferences(prev => ({ ...prev, stylePersonality: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choose your style personality" />
            </SelectTrigger>
            <SelectContent>
              {personalityOptions.map(personality => (
                <SelectItem key={personality} value={personality.toLowerCase()}>
                  {personality}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Preferred Brands</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {brandOptions.map(brand => (
              <Badge
                key={brand}
                variant={stylePreferences.preferredBrands.includes(brand) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => handleBrandToggle(brand)}
              >
                {brand}
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <Label>Budget Range</Label>
          <Select 
            value={stylePreferences.budgetRange} 
            onValueChange={(value) => setStylePreferences(prev => ({ ...prev, budgetRange: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select your typical budget range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="budget">Budget-friendly ($0-50)</SelectItem>
              <SelectItem value="mid">Mid-range ($50-200)</SelectItem>
              <SelectItem value="premium">Premium ($200-500)</SelectItem>
              <SelectItem value="luxury">Luxury ($500+)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Shopping Sources</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {sourceOptions.map(source => (
              <Badge
                key={source}
                variant={stylePreferences.shoppingSources.includes(source) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => handleSourceToggle(source)}
              >
                {source}
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
            Back
          </Button>
          <Button onClick={handleStyleSubmit} disabled={loading} className="flex-1">
            {loading ? 'Saving...' : 'Continue'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderStep3 = () => (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <CheckCircle className="w-8 h-8 text-primary" />
        </div>
        <CardTitle>Setup Your Wardrobe</CardTitle>
        <CardDescription>
          Let's create your digital wardrobe to get started
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label htmlFor="wardrobeName">Wardrobe Name</Label>
          <Input
            id="wardrobeName"
            value={wardrobeSetup.wardrobeName}
            onChange={(e) => setWardrobeSetup(prev => ({ ...prev, wardrobeName: e.target.value }))}
            placeholder="Give your wardrobe a name"
          />
        </div>

        <div>
          <Label>Wardrobe Type</Label>
          <Select 
            value={wardrobeSetup.wardrobeType} 
            onValueChange={(value) => setWardrobeSetup(prev => ({ ...prev, wardrobeType: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="closet">Closet</SelectItem>
              <SelectItem value="dresser">Dresser</SelectItem>
              <SelectItem value="armoire">Armoire</SelectItem>
              <SelectItem value="walk-in">Walk-in Closet</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="createSample"
            checked={wardrobeSetup.createSampleItems}
            onChange={(e) => setWardrobeSetup(prev => ({ ...prev, createSampleItems: e.target.checked }))}
            className="w-4 h-4"
          />
          <Label htmlFor="createSample" className="text-sm">
            Add sample items to get started (recommended)
          </Label>
        </div>

        <div className="p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">
            We'll create some sample wardrobe items to help you explore MyDresser's features. 
            You can always delete or modify these later.
          </p>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
            Back
          </Button>
          <Button onClick={handleWardrobeSubmit} disabled={loading} className="flex-1">
            {loading ? 'Setting up...' : 'Complete Setup'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background p-4 flex items-center justify-center">
      <div className="w-full">
        {/* Progress indicator */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center">
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step >= i ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {i}
                </div>
                {i < 3 && (
                  <div 
                    className={`w-12 h-1 ml-2 ${
                      step > i ? 'bg-primary' : 'bg-muted'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </div>
    </div>
  );
};

export default ProfileSetup;