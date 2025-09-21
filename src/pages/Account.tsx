import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Settings, 
  User, 
  Shield, 
  Bell, 
  Palette, 
  HelpCircle, 
  LogOut,
  ChevronRight,
  Sparkles,
  UserCheck,
  Calendar,
  Heart,
  Shirt,
  Search,
  BarChart3
} from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import ProfileEditDialog from "@/components/ProfileEditDialog";
import EnhancedThemeSelector from "@/components/EnhancedThemeSelector";
import ThemeCustomizer from "@/components/ThemeCustomizer";
import ComprehensiveAuthSystem from "@/components/ComprehensiveAuthSystem";
import AccessibilitySettings from "@/components/AccessibilitySettings";
import NotificationCenter from "@/components/NotificationCenter";
import EnhancedWardrobeManager from "@/components/EnhancedWardrobeManager";
import ProfileHeader from "@/components/ProfileHeader";
import SettingsSection from "@/components/SettingsSection";
import UserAnalyticsDashboard from "@/components/UserAnalyticsDashboard";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SettingItem {
  id: string;
  label: string;
  description?: string;
  onClick?: () => void;
  highlighted?: boolean;
}

const Account = () => {
  const navigate = useNavigate();
  const { profile, loading } = useProfile();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [profileEditOpen, setProfileEditOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("profile");

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

  const navigateToSettings = (category: string) => {
    // Set active section instead of navigating
    if (category === 'mystyle') {
      navigate('/mystyle');
    } else {
      setActiveSection(category);
    }
  };

  const handleMyStyleClick = () => {
    navigate('/mystyle');
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
      onClick: () => navigateToSettings('account')
    },
    {
      id: 'authentication',
      label: 'Authentication',
      description: `Current level: ${profile.auth_level}`,
      onClick: () => navigateToSettings('authentication'),
      highlighted: profile.auth_level === 'base'
    },
    {
      id: 'profile',
      label: 'My profile',
      description: 'Edit your profile information',
      onClick: () => navigateToSettings('profile')
    },
    {
      id: 'privacy',
      label: 'Privacy & Data Rights',
      description: 'GDPR/CCPA compliance & data management',
      onClick: () => navigateToSettings('privacy'),
      highlighted: true
    },
    {
      id: 'data',
      label: 'My data',
      description: 'Export or delete your personal data',
      onClick: () => navigateToSettings('data')
    },
    {
      id: 'preferences',
      label: 'My preferences',
      description: 'Customize your preferences',
      onClick: () => navigateToSettings('preferences')
    }
  ];

  const appSettings: SettingItem[] = [
    {
      id: 'general',
      label: 'General',
      description: 'General app settings',
      onClick: () => navigateToSettings('general')
    },
    {
      id: 'permissions',
      label: 'Permissions',
      description: 'App permissions',
      onClick: () => navigateToSettings('permissions')
    },
    {
      id: 'notifications',
      label: 'Notifications',
      description: 'Notification preferences',
      onClick: () => navigateToSettings('notifications')
    }
  ];

  const personalizationSettings: SettingItem[] = [
    {
      id: 'behavior',
      label: 'Modify app behaviour',
      description: 'Customize how the app works for you',
      onClick: () => navigateToSettings('behavior')
    },
    {
      id: 'suggestions',
      label: 'Personalize suggestions',
      description: 'Tailor recommendations to your style',
      onClick: () => navigateToSettings('suggestions')
    },
    {
      id: 'theme',
      label: 'Customize theme',
      description: 'Change the app appearance',
      onClick: () => navigateToSettings('theme'),
      highlighted: true
    },
    {
      id: 'mystyle',
      label: 'My Style',
      description: 'Define your personal style preferences',
      onClick: () => navigateToSettings('mystyle'),
      highlighted: true
    }
  ];

  const navigateToServiceSettings = (service: string) => {
    navigate(`/service-settings/${service}`);
  };

  const serviceSettings: SettingItem[] = [
    {
      id: 'weather',
      label: 'Weather settings',
      description: 'Configure weather-based recommendations',
      onClick: () => navigateToServiceSettings('weather')
    },
    {
      id: 'outfit',
      label: "Today's Outfit",
      description: 'Daily outfit generation settings',
      onClick: () => navigateToServiceSettings('outfit')
    },
    {
      id: 'wardrobe',
      label: 'My Wardrobe',
      description: 'Wardrobe management settings',
      onClick: () => navigateToServiceSettings('wardrobe')
    },
    {
      id: 'inventory',
      label: 'Inventory',
      description: 'Manage your clothing inventory',
      onClick: () => navigateToServiceSettings('wardrobe')
    },
    {
      id: 'market',
      label: 'Market & 2ndDresser',
      description: 'Marketplace and second-hand settings',
      onClick: () => navigateToServiceSettings('market')
    },
    {
      id: 'assistant',
      label: 'AI Assistant',
      description: 'AI styling assistant settings',
      onClick: () => navigateToServiceSettings('assistant')
    }
  ];

  // Add admin security dashboard for admin users
  if (profile.role === 'admin') {
    serviceSettings.unshift({
      id: 'security',
      label: 'Security Dashboard',
      description: 'Manage platform security and invitations',
      onClick: () => navigateToServiceSettings('security'),
      highlighted: true
    });
  }

  // Add merchant-specific settings for merchant users
  if (profile.role === 'merchant') {
    serviceSettings.push({
      id: 'merchants',
      label: 'Merchant Tools',
      description: 'Access merchant dashboard and tools',
      onClick: () => navigate('/merchant-terminal'),
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

  const renderProfile = () => {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-2xl lg:text-3xl font-bold fashion-text-gradient flex items-center justify-center gap-2">
            <span>👤</span>
            MYDRESSER ACCOUNT
          </h1>
        </div>

        <ProfileHeader profile={profile} />
        
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
            <Button 
              className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={handleMyStyleClick}
            >
              <Palette className="w-4 h-4 mr-2" />
              MY STYLE
            </Button>
          </div>
        </Card>

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
    );
  };

  const renderMyStyle = () => {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <h2 className="text-2xl font-bold">My Style</h2>
        </div>
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground mb-4">
              Define your personal style preferences and let our AI learn from your choices.
            </p>
            <Button onClick={handleMyStyleClick} className="w-full">
              <Palette className="w-4 h-4 mr-2" />
              Manage My Style
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderSettings = () => {
    if (!activeSection) {
      return (
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            <h2 className="text-2xl font-bold">Settings</h2>
          </div>
          <div className="grid gap-6">
            <SettingsSection title="Account" items={accountSettings} />
            <SettingsSection title="App" items={appSettings} />
            <SettingsSection title="Personalization" items={personalizationSettings} />
            <SettingsSection title="Services settings" items={serviceSettings} />
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <Button 
          variant="ghost" 
          onClick={() => setActiveSection(null)}
          className="mb-4"
        >
          ← Back to Settings
        </Button>
        
        {activeSection === 'profile' && (
          <ProfileEditDialog 
            open={true} 
            onOpenChange={() => setActiveSection(null)}
          />
        )}
        
        {activeSection === 'theme' && <ThemeCustomizer />}
        
        {activeSection === 'authentication' && <ComprehensiveAuthSystem />}
        
        {activeSection === 'accessibility' && <AccessibilitySettings />}
        
        {activeSection === 'notifications' && <NotificationCenter />}
        
        {activeSection === 'general' && (
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">General app configuration options coming soon.</p>
            </CardContent>
          </Card>
        )}
        
        {activeSection === 'permissions' && (
          <Card>
            <CardHeader>
              <CardTitle>App Permissions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Permission management coming soon.</p>
            </CardContent>
          </Card>
        )}
        
        {activeSection === 'preferences' && (
          <Card>
            <CardHeader>
              <CardTitle>User Preferences</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Preference management coming soon.</p>
            </CardContent>
          </Card>
        )}
        
        {activeSection === 'help' && (
          <Card>
            <CardHeader>
              <CardTitle>Help & Support</CardTitle>
              <CardDescription>Get assistance with MyDresser</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => window.open('https://docs.mydresser.app', '_blank')}
                >
                  <HelpCircle className="w-4 h-4 mr-2" />
                  Documentation & FAQ
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => {
                    toast({
                      title: "Contact Support",
                      description: "Support team will respond within 24 hours.",
                    });
                  }}
                >
                  <User className="w-4 h-4 mr-2" />
                  Contact Support
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => {
                    toast({
                      title: "Feedback Sent",
                      description: "Thank you for your feedback!",
                    });
                  }}
                >
                  <Heart className="w-4 h-4 mr-2" />
                  Send Feedback
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const renderAnalytics = () => {
    if (!profile) return null;

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          <h2 className="text-2xl font-bold">Analytics</h2>
        </div>
        <UserAnalyticsDashboard />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full max-w-md mx-auto">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="mystyle">My Style</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            {renderProfile()}
          </TabsContent>

          <TabsContent value="mystyle">
            {renderMyStyle()}
          </TabsContent>

          <TabsContent value="settings">
            {renderSettings()}
          </TabsContent>

          <TabsContent value="analytics">
            {renderAnalytics()}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Account;