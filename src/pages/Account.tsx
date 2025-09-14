import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Palette, ChevronRight, Shirt } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import ProfileHeader from "@/components/ProfileHeader";
import SettingsSection from "@/components/SettingsSection";
import ProfileEditDialog from "@/components/ProfileEditDialog";
import SettingsDialog from "@/components/SettingsDialog";
import ServiceSettingsDialog from "@/components/ServiceSettingsDialog";
import WardrobeManager from "@/components/WardrobeManager";
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
  const [profileEditOpen, setProfileEditOpen] = useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [serviceDialogOpen, setServiceDialogOpen] = useState(false);
  const [currentSetting, setCurrentSetting] = useState({ type: '', title: '', description: '' });

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

  const openSettingsDialog = (type: string, title: string, description: string) => {
    setCurrentSetting({ type, title, description });
    setSettingsDialogOpen(true);
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
      onClick: () => openSettingsDialog('account', 'Account Settings', 'Manage your account details and security')
    },
    {
      id: 'authentication',
      label: 'Authentication',
      description: `Current level: ${profile.auth_level}`,
      onClick: () => openSettingsDialog('authentication', 'Authentication Settings', 'Manage your security and authentication preferences'),
      highlighted: profile.auth_level === 'base'
    },
    {
      id: 'profile',
      label: 'My profile',
      description: 'Edit your profile information',
      onClick: () => setProfileEditOpen(true)
    },
    {
      id: 'privacy',
      label: 'Privacy',
      description: 'Control your privacy settings',
      onClick: () => openSettingsDialog('privacy', 'Privacy Settings', 'Control who can see your profile and content')
    },
    {
      id: 'data',
      label: 'My data',
      description: 'Manage your personal data',
      onClick: () => openSettingsDialog('data', 'Data Management', 'Export, backup, or delete your personal data')
    },
    {
      id: 'preferences',
      label: 'My preferences',
      description: 'Customize your preferences',
      onClick: () => openSettingsDialog('preferences', 'App Preferences', 'Customize how the app works for you')
    }
  ];

  const appSettings: SettingItem[] = [
    {
      id: 'general',
      label: 'General',
      description: 'General app settings',
      onClick: () => openSettingsDialog('general', 'General Settings', 'Configure general app behavior and preferences')
    },
    {
      id: 'permissions',
      label: 'Permissions',
      description: 'App permissions',
      onClick: () => openSettingsDialog('permissions', 'App Permissions', 'Manage what the app can access on your device')
    },
    {
      id: 'notifications',
      label: 'Notifications',
      description: 'Notification preferences',
      onClick: () => openSettingsDialog('notifications', 'Notification Settings', 'Control what notifications you receive')
    }
  ];

  const personalizationSettings: SettingItem[] = [
    {
      id: 'behavior',
      label: 'Modify app behaviour',
      description: 'Customize how the app works for you',
      onClick: () => openSettingsDialog('behavior', 'App Behavior', 'Customize how the app behaves and responds')
    },
    {
      id: 'suggestions',
      label: 'Personalize suggestions',
      description: 'Tailor recommendations to your style',
      onClick: () => openSettingsDialog('suggestions', 'Suggestion Settings', 'Customize your personalized recommendations')
    },
    {
      id: 'theme',
      label: 'Customize theme',
      description: 'Change the app appearance',
      onClick: () => openSettingsDialog('theme', 'Theme Settings', 'Customize the app appearance and colors'),
      highlighted: true
    }
  ];

  const openServiceDialog = (type: string, title: string, description: string) => {
    setCurrentSetting({ type, title, description });
    setServiceDialogOpen(true);
  };

  const serviceSettings: SettingItem[] = [
    {
      id: 'weather',
      label: 'Weather settings',
      description: 'Configure weather-based recommendations',
      onClick: () => openServiceDialog('weather', 'Weather Settings', 'Configure weather-based outfit recommendations')
    },
    {
      id: 'outfit',
      label: "Today's Outfit",
      description: 'Daily outfit generation settings',
      onClick: () => openServiceDialog('outfit', 'Outfit Settings', 'Customize your daily outfit recommendations')
    },
    {
      id: 'wardrobe',
      label: 'My Wardrobe',
      description: 'Wardrobe management settings',
      onClick: () => openServiceDialog('wardrobe', 'Wardrobe Settings', 'Configure your wardrobe organization and preferences')
    },
    {
      id: 'inventory',
      label: 'Inventory',
      description: 'Manage your clothing inventory',
      onClick: () => openServiceDialog('wardrobe', 'Inventory Management', 'Organize and track your clothing items')
    },
    {
      id: 'market',
      label: 'Market & 2ndDresser',
      description: 'Marketplace and second-hand settings',
      onClick: () => openServiceDialog('market', 'Market Settings', 'Configure marketplace and second-hand preferences')
    },
    {
      id: 'assistant',
      label: 'AI Assistant',
      description: 'AI styling assistant settings',
      onClick: () => openServiceDialog('assistant', 'AI Assistant', 'Customize your AI styling assistant preferences')
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
    <div className="min-h-screen bg-background pb-20 lg:pb-0">
      <div className="max-w-4xl mx-auto px-4 py-6 lg:py-8 space-y-6">
        {/* Header */}
        <div className="text-center lg:text-left">
          <h1 className="text-2xl lg:text-3xl font-bold fashion-text-gradient flex items-center justify-center lg:justify-start gap-2">
            <span>👤</span>
            MYDRESSER ACCOUNT
          </h1>
        </div>

        {/* Desktop Layout */}
        <div className="lg:grid lg:grid-cols-3 lg:gap-8 space-y-6 lg:space-y-0">
          {/* Left Column - Profile & Quick Actions */}
          <div className="lg:col-span-1 space-y-6">
            <ProfileHeader profile={profile} />
            
            {/* Search Bar */}
            <Card className="p-4">
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="What would you like to do?"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90">
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
          </div>

          {/* Right Column - Settings & Wardrobe */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="settings" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="settings" className="flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  Settings
                </TabsTrigger>
                <TabsTrigger value="wardrobe" className="flex items-center gap-2">
                  <Shirt className="w-4 h-4" />
                  Wardrobe
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="settings" className="space-y-6 mt-6">
                <div className="grid gap-6">
                  <SettingsSection title="Account" items={accountSettings} />
                  <SettingsSection title="App" items={appSettings} />
                  <SettingsSection title="Personalization" items={personalizationSettings} />
                  <SettingsSection title="Services settings" items={serviceSettings} />
                </div>
              </TabsContent>
              
              <TabsContent value="wardrobe" className="mt-6">
                <WardrobeManager />
              </TabsContent>
            </Tabs>
          </div>
        </div>

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

      {/* Dialogs */}
      <ProfileEditDialog 
        open={profileEditOpen} 
        onOpenChange={setProfileEditOpen} 
      />
      <SettingsDialog
        open={settingsDialogOpen}
        onOpenChange={setSettingsDialogOpen}
      />
      <ServiceSettingsDialog
        open={serviceDialogOpen}
        onOpenChange={setServiceDialogOpen}
        serviceType={currentSetting.type}
        title={currentSetting.title}
        description={currentSetting.description}
      />
    </div>
  );
};

export default Account;