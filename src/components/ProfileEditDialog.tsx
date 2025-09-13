import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useProfile, UserProfile } from "@/hooks/useProfile";
import { useContactInfo } from "@/hooks/useContactInfo";
import { useToast } from "@/hooks/use-toast";
import { Loader2, User, Mail, MapPin, Instagram, Facebook } from "lucide-react";

interface ProfileEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ProfileEditDialog = ({ open, onOpenChange }: ProfileEditDialogProps) => {
  const { profile, updateProfile } = useProfile();
  const { contactInfo, updateContactInfo } = useContactInfo();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Profile form state
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || "",
    bio: profile?.bio || "",
    location: profile?.location || "",
    avatar_url: profile?.avatar_url || "",
    is_profile_public: profile?.is_profile_public || false,
  });

  // Contact info form state
  const [contactData, setContactData] = useState({
    email: contactInfo?.email || "",
    social_instagram: contactInfo?.social_instagram || "",
    social_facebook: contactInfo?.social_facebook || "",
    social_tiktok: contactInfo?.social_tiktok || "",
  });

  const handleSave = async () => {
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

      // Update contact info
      await updateContactInfo(contactData);

      toast({
        title: "Profile updated successfully",
        description: "Your profile information has been saved.",
      });
      
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error updating profile",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Edit Profile
          </DialogTitle>
          <DialogDescription>
            Update your profile information and contact details
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>
            
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="Enter your full name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Tell us about yourself and your style..."
                rows={4}
              />
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
              <Label htmlFor="avatar_url">Avatar URL</Label>
              <Input
                id="avatar_url"
                value={formData.avatar_url}
                onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                placeholder="https://example.com/avatar.jpg"
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
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact Information</h3>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
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
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileEditDialog;