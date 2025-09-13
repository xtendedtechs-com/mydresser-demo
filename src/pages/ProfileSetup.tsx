import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useProfile } from "@/hooks/useProfile";
import { useContactInfo } from "@/hooks/useContactInfo";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Loader2, User, Mail, MapPin, Instagram, Facebook, Sparkles } from "lucide-react";

const ProfileSetup = () => {
  const { profile, updateProfile, loading: profileLoading } = useProfile();
  const { updateContactInfo } = useContactInfo();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  // Profile form state
  const [formData, setFormData] = useState({
    full_name: "",
    bio: "",
    location: "",
    avatar_url: "",
    is_profile_public: false,
  });

  // Contact info form state
  const [contactData, setContactData] = useState({
    email: "",
    social_instagram: "",
    social_facebook: "",
    social_tiktok: "",
  });

  useEffect(() => {
    if (profile && !profileLoading) {
      // If profile is already set up, redirect to home
      if (profile.full_name && profile.bio) {
        navigate("/");
        return;
      }
      // Pre-populate form with existing data
      setFormData({
        full_name: profile.full_name || "",
        bio: profile.bio || "",
        location: profile.location || "",
        avatar_url: profile.avatar_url || "",
        is_profile_public: profile.is_profile_public || false,
      });
    }
  }, [profile, profileLoading, navigate]);

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleComplete = async () => {
    if (!profile) return;
    
    setLoading(true);
    try {
      // Update profile
      await updateProfile({
        full_name: formData.full_name,
        bio: formData.bio,
        location: formData.location,
        avatar_url: formData.avatar_url,
        is_profile_public: formData.is_profile_public,
      });

      // Update contact info if provided
      if (contactData.email || contactData.social_instagram || contactData.social_facebook || contactData.social_tiktok) {
        await updateContactInfo(contactData);
      }

      toast({
        title: "Welcome to MyDresser! 🎉",
        description: "Your profile has been set up successfully.",
      });
      
      navigate("/");
    } catch (error: any) {
      toast({
        title: "Error setting up profile",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const canProceedStep1 = formData.full_name.trim().length > 0;
  const canProceedStep2 = formData.bio.trim().length > 0;

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-6">
      <div className="w-full max-w-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold fashion-text-gradient">Welcome to MyDresser</h1>
          </div>
          <p className="text-muted-foreground">Let's set up your fashion profile</p>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center justify-center space-x-2">
          {[1, 2, 3].map((stepNumber) => (
            <div
              key={stepNumber}
              className={`w-3 h-3 rounded-full ${
                stepNumber <= step ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {step === 1 && "Basic Information"}
              {step === 2 && "Tell us about your style"}
              {step === 3 && "Contact & Social"}
            </CardTitle>
            <CardDescription>
              {step === 1 && "Let's start with the basics"}
              {step === 2 && "Help us understand your fashion preferences"}
              {step === 3 && "Connect with the fashion community (optional)"}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Step 1: Basic Information */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      placeholder="Enter your full name"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="City, Country"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="avatar_url">Profile Picture URL</Label>
                  <Input
                    id="avatar_url"
                    value={formData.avatar_url}
                    onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                    placeholder="https://example.com/avatar.jpg"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Style Bio */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="bio">Tell us about your style *</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Describe your fashion style, favorite brands, occasions you dress for, or anything that represents your fashion identity..."
                    rows={6}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_profile_public"
                    checked={formData.is_profile_public}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_profile_public: checked })}
                  />
                  <Label htmlFor="is_profile_public">Make my profile public</Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  Public profiles can be discovered by other users and help build the fashion community.
                </p>
              </div>
            )}

            {/* Step 3: Contact & Social */}
            {step === 3 && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground mb-4">
                  Connect your social profiles to share your style and discover others. All fields are optional.
                </p>

                <div className="space-y-2">
                  <Label htmlFor="email">Contact Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      id="email"
                      type="email"
                      value={contactData.email}
                      onChange={(e) => setContactData({ ...contactData, email: e.target.value })}
                      placeholder="your.email@example.com"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="instagram">Instagram</Label>
                  <div className="relative">
                    <Instagram className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      id="instagram"
                      value={contactData.social_instagram}
                      onChange={(e) => setContactData({ ...contactData, social_instagram: e.target.value })}
                      placeholder="@yourusername"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="facebook">Facebook</Label>
                  <div className="relative">
                    <Facebook className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      id="facebook"
                      value={contactData.social_facebook}
                      onChange={(e) => setContactData({ ...contactData, social_facebook: e.target.value })}
                      placeholder="facebook.com/yourprofile"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tiktok">TikTok</Label>
                  <Input
                    id="tiktok"
                    value={contactData.social_tiktok}
                    onChange={(e) => setContactData({ ...contactData, social_tiktok: e.target.value })}
                    placeholder="@yourtiktok"
                  />
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex justify-between pt-6">
              <Button 
                variant="outline" 
                onClick={handleBack}
                disabled={step === 1}
              >
                Back
              </Button>
              
              {step < 3 ? (
                <Button 
                  onClick={handleNext}
                  disabled={
                    (step === 1 && !canProceedStep1) ||
                    (step === 2 && !canProceedStep2)
                  }
                >
                  Next
                </Button>
              ) : (
                <Button onClick={handleComplete} disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Complete Setup
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <Button variant="ghost" onClick={() => navigate("/")} className="text-sm">
            Skip setup for now
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProfileSetup;