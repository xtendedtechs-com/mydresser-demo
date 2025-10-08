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
  BarChart3,
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
import { AdvancedPredictiveAnalytics } from "@/components/AdvancedPredictiveAnalytics";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import VirtualTryOn from "@/components/VirtualTryOn";
import { useWardrobe } from "@/hooks/useWardrobe";
import { useTranslation } from "react-i18next";
import { AppVersion } from "@/components/AppVersion";

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
  const { items } = useWardrobe();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [profileEditOpen, setProfileEditOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: t("account.logout"),
        description: "You have been signed out of your account.",
      });
    } catch (error) {
      toast({
        title: t("common.error"),
        description: "There was an error signing out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleMyStyleClick = () => {
    navigate("/mystyle");
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
          <Button onClick={() => (window.location.href = "/auth")}>Sign In</Button>
        </div>
      </div>
    );
  }

  const accountSettings: SettingItem[] = [
    {
      id: "account",
      label: "Account",
      description: "Manage your account settings",
      onClick: () => navigate("/settings/account"),
    },
    {
      id: "authentication",
      label: "Authentication",
      description: `Current level: ${profile.auth_level}`,
      onClick: () => navigate("/settings/authentication"),
      highlighted: profile.auth_level === "base",
    },
    {
      id: "verification",
      label: "Verification Center",
      description: "Verify merchant or professional status",
      onClick: () => navigate("/verification"),
      highlighted: profile.role === "merchant" || profile.role === "professional",
    },
    {
      id: "profile",
      label: "My profile",
      description: "Edit your profile information",
      onClick: () => setProfileEditOpen(true),
    },
    {
      id: "payment",
      label: "Payment Settings",
      description: "Manage payment methods and billing",
      onClick: () => navigate("/settings/payment"),
      highlighted: true,
    },
    {
      id: "subscription",
      label: "Subscription & Billing",
      description: "Manage your premium subscription",
      onClick: () => navigate("/subscription/manage"),
      highlighted: true,
    },
    {
      id: "privacy",
      label: "Privacy & Data Rights",
      description: "GDPR/CCPA compliance & data management",
      onClick: () => navigate("/settings/privacy"),
      highlighted: true,
    },
    {
      id: "data",
      label: "My data",
      description: "Export or delete your personal data",
      onClick: () => navigate("/data-export"),
    },
    {
      id: "preferences",
      label: "Regional Preferences",
      description: "Language, currency, and region settings",
      onClick: () => navigate("/international"),
    },
  ];

  const appSettings: SettingItem[] = [
    {
      id: "general",
      label: "General",
      description: "General app settings",
      onClick: () => navigate("/settings/general"),
    },
    {
      id: "permissions",
      label: "App Permissions",
      description: "PWA and device permissions",
      onClick: () => navigate("/settings/pwa"),
    },
    {
      id: "notifications",
      label: "Notifications",
      description: "Notification preferences",
      onClick: () => navigate("/settings/notifications"),
    },
    {
      id: "accessibility",
      label: "Accessibility",
      description: "Accessibility features and settings",
      onClick: () => navigate("/settings/accessibility"),
    },
  ];

  const personalizationSettings: SettingItem[] = [
    {
      id: "behavior",
      label: "App Behavior",
      description: "Customize how the app works for you",
      onClick: () => navigate("/settings/app"),
    },
    {
      id: "suggestions",
      label: "AI Suggestions",
      description: "Tailor AI recommendations to your style",
      onClick: () => navigate("/settings/ai"),
    },
    {
      id: "theme",
      label: "Theme & Appearance",
      description: "Customize colors, fonts, and layout",
      onClick: () => navigate("/settings/theme"),
      highlighted: true,
    },
    {
      id: "mystyle",
      label: "My Style Profile",
      description: "Define your personal style preferences",
      onClick: () => navigate("/settings/mystyle"),
      highlighted: true,
    },
  ];

  const navigateToServiceSettings = (service: string) => {
    navigate(`/service-settings/${service}`);
  };

  const serviceSettings: SettingItem[] = [
    {
      id: "app-version",
      label: "App Version & Changelog",
      description: "View current version and update history",
      onClick: () => {}, // Will be replaced with Dialog
      highlighted: false,
    },
    {
      id: "weather",
      label: "Weather settings",
      description: "Configure weather-based recommendations",
      onClick: () => navigate("/settings/outfit"),
    },
    {
      id: "outfit",
      label: "Today's Outfit",
      description: "Daily outfit generation settings",
      onClick: () => navigate("/settings/outfit"),
    },
    {
      id: "wardrobe",
      label: "My Wardrobe",
      description: "Wardrobe management settings",
      onClick: () => navigate("/settings/wardrobe"),
    },
    {
      id: "analytics",
      label: "Wardrobe Analytics",
      description: "Advanced insights and optimization",
      onClick: () => navigate("/wardrobe-analytics"),
      highlighted: true,
    },
    {
      id: "advanced-analytics",
      label: "Advanced Analytics",
      description: "Comparative analytics and benchmarks",
      onClick: () => navigate("/analytics/advanced"),
      highlighted: true,
    },
    {
      id: "inventory",
      label: "Inventory",
      description: "Manage your clothing inventory",
      onClick: () => navigate("/settings/wardrobe"),
    },
    {
      id: "market",
      label: "Market & 2ndDresser",
      description: "Marketplace and second-hand settings",
      onClick: () => navigate("/settings/marketplace"),
    },
    {
      id: "assistant",
      label: "AI Assistant",
      description: "AI styling assistant and chat settings",
      onClick: () => navigate("/settings/ai"),
      highlighted: true,
    },
    {
      id: "ai-hub",
      label: "AI Style Hub",
      description: "Access all AI-powered features",
      onClick: () => navigate("/ai-style-hub"),
      highlighted: true,
    },
    {
      id: "social",
      label: "Social & Community",
      description: "Manage social features and connections",
      onClick: () => navigate("/settings/social"),
      highlighted: true,
    },
    {
      id: "events",
      label: "Fashion Events",
      description: "Discover and join fashion events",
      onClick: () => navigate("/community"),
    },
    {
      id: "challenges",
      label: "Style Challenges",
      description: "Participate in style competitions",
      onClick: () => navigate("/style-challenges"),
    },
    {
      id: "challenge-settings",
      label: "Challenge Settings",
      description: "Customize challenge notifications and preferences",
      onClick: () => navigate("/settings/challenges"),
    },
    {
      id: "sustainability",
      label: "Sustainability Tracker",
      description: "Track your fashion carbon footprint",
      onClick: () => navigate("/sustainability"),
      highlighted: true,
    },
    {
      id: "support",
      label: "Support & Help",
      description: "Get help, browse articles, or contact support",
      onClick: () => navigate("/support"),
      highlighted: true,
    },
    {
      id: "reports",
      label: "Reports & Data Export",
      description: "Generate reports and export your data",
      onClick: () => navigate("/reports"),
    },
  ];

  // Add admin security dashboard for admin users
  if (profile.role === "admin") {
    serviceSettings.unshift({
      id: "security",
      label: "Security Dashboard",
      description: "Manage platform security and invitations",
      onClick: () => navigate("/security"),
      highlighted: true,
    });
  }

  // Add merchant-specific settings for merchant users
  if (profile.role === "merchant") {
    serviceSettings.push({
      id: "merchants",
      label: "Merchant Tools",
      description: "Access merchant dashboard and tools",
      onClick: () => navigate("/merchant-terminal"),
      highlighted: true,
    });
  }

  // Add professional-specific settings for professional users
  if (profile.role === "professional") {
    serviceSettings.push({
      id: "professional",
      label: "Professional Services",
      description: "Manage your styling services",
      onClick: () => toast({ title: "Coming soon", description: "Professional services will be available soon." }),
      highlighted: true,
    });
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3">
              <User className="w-8 h-8 text-primary" />
              <h1 className="text-3xl lg:text-4xl font-bold fashion-text-gradient">MyDresser Account</h1>
            </div>
            <p className="text-muted-foreground text-lg">Manage your profile, preferences, and account settings</p>
          </div>

          {/* Profile Header */}
          {profile && <ProfileHeader profile={profile} />}

          {/* Quick Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            <Card className="text-center p-3 md:p-4 hover:shadow-md transition-shadow cursor-pointer">
              <div className="space-y-2">
                <Shirt className="w-5 h-5 md:w-6 md:h-6 mx-auto text-primary" />
                <div className="text-xl md:text-2xl font-bold">{items?.length || 0}</div>
                <div className="text-xs md:text-sm text-muted-foreground">Wardrobe Items</div>
              </div>
            </Card>
            <Card className="text-center p-3 md:p-4 hover:shadow-md transition-shadow cursor-pointer">
              <div className="space-y-2">
                <Heart className="w-5 h-5 md:w-6 md:h-6 mx-auto text-primary" />
                <div className="text-xl md:text-2xl font-bold">{items?.filter((i) => i.is_favorite).length || 0}</div>
                <div className="text-xs md:text-sm text-muted-foreground">Favorite Items</div>
              </div>
            </Card>
            <Card className="text-center p-3 md:p-4 hover:shadow-md transition-shadow cursor-pointer">
              <div className="space-y-2">
                <Calendar className="w-5 h-5 md:w-6 md:h-6 mx-auto text-primary" />
                <div className="text-xl md:text-2xl font-bold">{profile.style_score || 0}</div>
                <div className="text-xs md:text-sm text-muted-foreground">Style Score</div>
              </div>
            </Card>
            <Card className="text-center p-3 md:p-4 hover:shadow-md transition-shadow cursor-pointer">
              <div className="space-y-2">
                <UserCheck className="w-5 h-5 md:w-6 md:h-6 mx-auto text-primary" />
                <div className="text-xl md:text-2xl font-bold capitalize">{profile.auth_level}</div>
                <div className="text-xs md:text-sm text-muted-foreground">Auth Level</div>
              </div>
            </Card>
          </div>

          {/* Unified Settings Layout - All in One Page */}
          <div className="space-y-6">
            {/* Profile Management Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Profile Management
                </CardTitle>
                <CardDescription>Edit your profile information and account details</CardDescription>
              </CardHeader>
              <CardContent>
                <Dialog open={profileEditOpen} onOpenChange={setProfileEditOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full">Edit Profile Information</Button>
                  </DialogTrigger>
                  <ProfileEditDialog open={profileEditOpen} onOpenChange={setProfileEditOpen} />
                </Dialog>
              </CardContent>
            </Card>

            {/* VTO Photo Settings - Now a dedicated page */}
            <Card
              className="cursor-pointer hover:shadow-md transition-all"
              onClick={() => navigate("/settings/vto-photos")}
            >
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="space-y-1 flex-1">
                    <div className="font-medium flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-primary" />
                      Virtual Try-On Photos
                      <Badge variant="secondary" className="text-xs">
                        AI
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Manage photos for AI outfit visualization</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0 ml-2" />
                </div>
              </CardContent>
            </Card>

            {/* Currency & International Settings */}
            <Card className="cursor-pointer hover:shadow-md transition-all" onClick={() => navigate("/international")}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="space-y-1 flex-1">
                    <div className="font-medium flex items-center gap-2">
                      Currency & International
                      <Badge variant="secondary" className="text-xs">
                        New
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Multi-currency support and shipping settings</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0 ml-2" />
                </div>
              </CardContent>
            </Card>

            {/* Account Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>Manage your account and security</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                  {accountSettings.map((setting) => (
                    <div
                      key={setting.id}
                      className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-muted/50 active:scale-98 transition-all"
                      onClick={setting.onClick}
                    >
                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="font-medium flex items-center gap-2 text-sm md:text-base">
                          {setting.label}
                          {setting.highlighted && (
                            <Badge variant="secondary" className="text-xs">
                              Important
                            </Badge>
                          )}
                        </div>
                        {setting.description && (
                          <p className="text-xs md:text-sm text-muted-foreground line-clamp-1">{setting.description}</p>
                        )}
                      </div>
                      <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground flex-shrink-0 ml-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* App Settings */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                    <div
                      key={setting.id}
                      className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-muted/50 active:scale-98 transition-all"
                      onClick={setting.onClick}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm md:text-base">{setting.label}</div>
                        <div className="text-xs md:text-sm text-muted-foreground line-clamp-1">
                          {setting.description}
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 flex-shrink-0 ml-2" />
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
                    <div
                      key={setting.id}
                      className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-muted/50 active:scale-98 transition-all"
                      onClick={setting.onClick}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-medium flex items-center gap-2 text-sm md:text-base">
                          {setting.label}
                          {setting.highlighted && (
                            <Badge variant="outline" className="text-xs">
                              New
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs md:text-sm text-muted-foreground line-clamp-1">
                          {setting.description}
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 flex-shrink-0 ml-2" />
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                  {serviceSettings.map((setting) =>
                    setting.id === "app-version" ? (
                      <div key={setting.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-1 flex-1 min-w-0">
                          <div className="font-medium flex items-center gap-2 text-sm md:text-base">
                            {setting.label}
                          </div>
                          <p className="text-xs md:text-sm text-muted-foreground line-clamp-1">{setting.description}</p>
                        </div>
                        <AppVersion />
                      </div>
                    ) : (
                      <div
                        key={setting.id}
                        className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-muted/50 active:scale-98 transition-all"
                        onClick={setting.onClick}
                      >
                        <div className="space-y-1 flex-1 min-w-0">
                          <div className="font-medium flex items-center gap-2 text-sm md:text-base">
                            {setting.label}
                            {setting.highlighted && (
                              <Badge variant="secondary" className="text-xs">
                                Featured
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs md:text-sm text-muted-foreground line-clamp-1">
                            {setting.description}
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 flex-shrink-0 ml-2" />
                      </div>
                    ),
                  )}
                </div>
              </CardContent>
            </Card>

            {/* My Style Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  My Style
                </CardTitle>
                <CardDescription>Define your personal style preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={handleMyStyleClick} className="w-full">
                  <Palette className="w-4 h-4 mr-2" />
                  Manage My Style
                </Button>
              </CardContent>
            </Card>

            {/* Analytics Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  Analytics & Insights
                </CardTitle>
                <CardDescription>View your wardrobe and style analytics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <UserAnalyticsDashboard />
                <AdvancedPredictiveAnalytics type="user" timeframe="30d" />
              </CardContent>
            </Card>

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
      <br />
      <br />
      <br />
    </div>
  );
};

export default Account;
