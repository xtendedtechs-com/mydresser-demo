import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Search, Palette, ChevronRight } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import ProfileHeader from "@/components/ProfileHeader";
import SettingsSection from "@/components/SettingsSection";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SettingItem {
  id: string;
  label: string;
  description?: string;
  onClick?: () => void;
  highlighted?: boolean;
}

const Account = () => {
  const { profile, loading } = useProfile();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Signed out successfully",
        description: "You have been signed out of your account.",
      });
    } catch (error) {
      toast({
        title: "Error signing out",
        description: "There was an error signing out. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-20 px-4 py-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background pb-20 px-4 py-6 flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Please sign in</h1>
          <p className="text-muted-foreground">You need to be signed in to view your account.</p>
          <Button onClick={() => window.location.href = '/auth'}>
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  const accountSettings: SettingItem[] = [
    {
      id: 'account',
      label: 'Account',
      description: 'Manage your account settings',
      onClick: () => toast({ title: "Coming soon", description: "Account settings will be available soon." })
    },
    {
      id: 'authentication',
      label: 'Authentication',
      description: `Current level: ${profile.auth_level}`,
      onClick: () => toast({ title: "Coming soon", description: "Authentication settings will be available soon." }),
      highlighted: profile.auth_level === 'base'
    },
    {
      id: 'profile',
      label: 'My profile',
      description: 'Edit your profile information',
      onClick: () => toast({ title: "Coming soon", description: "Profile editing will be available soon." })
    },
    {
      id: 'privacy',
      label: 'Privacy',
      description: 'Control your privacy settings',
      onClick: () => toast({ title: "Coming soon", description: "Privacy settings will be available soon." })
    },
    {
      id: 'data',
      label: 'My data',
      description: 'Manage your personal data',
      onClick: () => toast({ title: "Coming soon", description: "Data management will be available soon." })
    },
    {
      id: 'preferences',
      label: 'My preferences',
      description: 'Customize your preferences',
      onClick: () => toast({ title: "Coming soon", description: "Preferences will be available soon." })
    }
  ];

  const appSettings: SettingItem[] = [
    {
      id: 'general',
      label: 'General',
      description: 'General app settings',
      onClick: () => toast({ title: "Coming soon", description: "General settings will be available soon." })
    },
    {
      id: 'permissions',
      label: 'Permissions',
      description: 'App permissions',
      onClick: () => toast({ title: "Coming soon", description: "Permissions will be available soon." })
    },
    {
      id: 'app-privacy',
      label: 'Privacy',
      description: 'App privacy settings',
      onClick: () => toast({ title: "Coming soon", description: "App privacy will be available soon." })
    }
  ];

  const personalizationSettings: SettingItem[] = [
    {
      id: 'behavior',
      label: 'Modify app behaviour',
      description: 'Customize how the app works for you',
      onClick: () => toast({ title: "Coming soon", description: "Behavior settings will be available soon." })
    },
    {
      id: 'suggestions',
      label: 'Personalize suggestions',
      description: 'Tailor recommendations to your style',
      onClick: () => toast({ title: "Coming soon", description: "Suggestion settings will be available soon." })
    },
    {
      id: 'theme',
      label: 'Customize theme',
      description: 'Change the app appearance',
      onClick: () => toast({ title: "Coming soon", description: "Theme customization will be available soon." }),
      highlighted: true
    }
  ];

  const serviceSettings: SettingItem[] = [
    {
      id: 'weather',
      label: 'Weather settings',
      description: 'Configure weather-based recommendations',
      onClick: () => toast({ title: "Coming soon", description: "Weather settings will be available soon." })
    },
    {
      id: 'outfit',
      label: "Today's Outfit",
      description: 'Daily outfit generation settings',
      onClick: () => toast({ title: "Coming soon", description: "Outfit settings will be available soon." })
    },
    {
      id: 'wardrobe',
      label: 'My Wardrobe',
      description: 'Wardrobe management settings',
      onClick: () => toast({ title: "Coming soon", description: "Wardrobe settings will be available soon." })
    },
    {
      id: 'inventory',
      label: 'Inventory',
      description: 'Manage your clothing inventory',
      onClick: () => toast({ title: "Coming soon", description: "Inventory settings will be available soon." })
    },
    {
      id: 'market',
      label: 'Market & 2ndDresser',
      description: 'Marketplace and second-hand settings',
      onClick: () => toast({ title: "Coming soon", description: "Market settings will be available soon." })
    },
    {
      id: 'assistant',
      label: 'AI Assistant',
      description: 'AI styling assistant settings',
      onClick: () => toast({ title: "Coming soon", description: "AI Assistant settings will be available soon." })
    }
  ];

  // Add merchant-specific settings for merchant users
  if (profile.role === 'merchant') {
    serviceSettings.push({
      id: 'merchants',
      label: 'Merchant Tools',
      description: 'Access merchant dashboard and tools',
      onClick: () => toast({ title: "Coming soon", description: "Merchant tools will be available soon." }),
      highlighted: true
    });
  }

  // Add professional-specific settings for professional users
  if (profile.role === 'professional') {
    serviceSettings.push({
      id: 'professional',
      label: 'Professional Services',
      description: 'Manage your styling services',
      onClick: () => toast({ title: "Coming soon", description: "Professional services will be available soon." }),
      highlighted: true
    });
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="px-4 py-6 space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold fashion-text-gradient flex items-center justify-center gap-2">
            <span>👤</span>
            MYDRESSER ACCOUNT
          </h1>
        </div>

        {/* Profile Header */}
        <ProfileHeader profile={profile} />

        {/* Search Bar */}
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="What would you like to do?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Palette className="w-4 h-4 mr-2" />
              MY STYLE
            </Button>
          </div>
        </Card>

        {/* Data Collection Notice */}
        <Card className="p-4 bg-accent/30">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Data collection & processing</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </div>
        </Card>

        {/* Settings Sections */}
        <SettingsSection title="Account" items={accountSettings} />
        <SettingsSection title="App" items={appSettings} />
        <SettingsSection title="Personalization" items={personalizationSettings} />
        <SettingsSection title="Services settings" items={serviceSettings} />

        {/* Sign Out */}
        <div className="pt-6">
          <Button
            variant="outline"
            onClick={handleSignOut}
            className="w-full"
          >
            Sign out
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Account;