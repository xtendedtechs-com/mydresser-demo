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
import ComprehensiveSettingsPanel from "@/components/ComprehensiveSettingsPanel";
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
    if (category === 'mystyle') {
      navigate('/mystyle');
    } else {
      navigate(`/service-settings/${category}`);
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

        <ComprehensiveSettingsPanel />

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
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3">
              <User className="w-8 h-8 text-primary" />
              <h1 className="text-3xl lg:text-4xl font-bold fashion-text-gradient">
                MyDresser Account
              </h1>
            </div>
            <p className="text-muted-foreground text-lg">
              Manage your profile, preferences, and account settings
            </p>
          </div>

          {/* Profile Header */}
          {profile && <ProfileHeader profile={profile} />}

          {/* Quick Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="text-center p-4">
              <div className="space-y-2">
                <Shirt className="w-6 h-6 mx-auto text-primary" />
                <div className="text-2xl font-bold">--</div>
                <div className="text-sm text-muted-foreground">Wardrobe Items</div>
              </div>
            </Card>
            <Card className="text-center p-4">
              <div className="space-y-2">
                <Heart className="w-6 h-6 mx-auto text-primary" />
                <div className="text-2xl font-bold">--</div>
                <div className="text-sm text-muted-foreground">Favorite Outfits</div>
              </div>
            </Card>
            <Card className="text-center p-4">
              <div className="space-y-2">
                <Calendar className="w-6 h-6 mx-auto text-primary" />
                <div className="text-2xl font-bold">{profile.style_score || 0}</div>
                <div className="text-sm text-muted-foreground">Style Score</div>
              </div>
            </Card>
            <Card className="text-center p-4">
              <div className="space-y-2">
                <UserCheck className="w-6 h-6 mx-auto text-primary" />
                <div className="text-2xl font-bold">{profile.auth_level}</div>
                <div className="text-sm text-muted-foreground">Auth Level</div>
              </div>
            </Card>
          </div>

          {/* Account Settings Sections */}
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
              <TabsTrigger value="mystyle">My Style</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Profile Management
                  </CardTitle>
                  <CardDescription>
                    Edit your profile information and account details
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Dialog open={profileEditOpen} onOpenChange={setProfileEditOpen}>
                    <DialogTrigger asChild>
                      <Button className="w-full">
                        Edit Profile Information
                      </Button>
                    </DialogTrigger>
                    <ProfileEditDialog open={profileEditOpen} onOpenChange={setProfileEditOpen} />
                  </Dialog>
                </CardContent>
              </Card>

              {/* Account Settings Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {accountSettings.map((setting) => (
                  <Card key={setting.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4" onClick={setting.onClick}>
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="font-medium flex items-center gap-2">
                            {setting.label}
                            {setting.highlighted && <Badge variant="secondary" className="text-xs">Important</Badge>}
                          </div>
                          {setting.description && (
                            <p className="text-sm text-muted-foreground">{setting.description}</p>
                          )}
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* App Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="w-5 h-5" />
                      App Settings
                    </CardTitle>
                    <CardDescription>Configure app behavior and preferences</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {appSettings.map((setting) => (
                      <div key={setting.id} className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-muted/50" onClick={setting.onClick}>
                        <div>
                          <div className="font-medium">{setting.label}</div>
                          <div className="text-sm text-muted-foreground">{setting.description}</div>
                        </div>
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Personalization Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Palette className="w-5 h-5" />
                      Personalization
                    </CardTitle>
                    <CardDescription>Customize your MyDresser experience</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {personalizationSettings.map((setting) => (
                      <div key={setting.id} className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-muted/50" onClick={setting.onClick}>
                        <div>
                          <div className="font-medium flex items-center gap-2">
                            {setting.label}
                            {setting.highlighted && <Badge variant="outline" className="text-xs">New</Badge>}
                          </div>
                          <div className="text-sm text-muted-foreground">{setting.description}</div>
                        </div>
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Service Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    MyDresser Services
                  </CardTitle>
                  <CardDescription>Configure AI-powered features and services</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {serviceSettings.map((setting) => (
                      <div key={setting.id} className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors" onClick={setting.onClick}>
                        <div className="space-y-1">
                          <div className="font-medium flex items-center gap-2">
                            {setting.label}
                            {setting.highlighted && <Badge variant="secondary" className="text-xs">Featured</Badge>}
                          </div>
                          <div className="text-sm text-muted-foreground">{setting.description}</div>
                        </div>
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="mystyle" className="space-y-6">
              {renderMyStyle()}
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              {renderAnalytics()}
            </TabsContent>

            <TabsContent value="security" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Security & Authentication
                  </CardTitle>
                  <CardDescription>
                    Manage your security settings and authentication methods
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ComprehensiveAuthSystem />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Sign Out */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Sign Out</h3>
                  <p className="text-sm text-muted-foreground">Sign out of your MyDresser account</p>
                </div>
                <Button variant="outline" onClick={handleSignOut}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Account;