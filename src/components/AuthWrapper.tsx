import { Routes, Route } from "react-router-dom";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import Navigation from "@/components/Navigation";
import { useProfile } from "@/hooks/useProfile";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import { CommandPalette } from "@/components/CommandPalette";
import { QuickActionsMenu } from "@/components/QuickActionsMenu";
import { KeyboardShortcutsHelper } from "@/components/KeyboardShortcutsHelper";

// Pages
import Index from "@/pages/Index";
import Wardrobe from "@/pages/Wardrobe";
import Account from "@/pages/Account";
import Add from "@/pages/Add";
import Market from "@/pages/Market";
import MarketItemDetail from "@/pages/MarketItemDetail";
import ItemDetail from "@/pages/ItemDetail";
import WardrobeItemDetail from "@/pages/WardrobeItemDetail";
import ProfileSetup from "@/pages/ProfileSetup";
import Auth from "@/pages/Auth";
import Landing from "@/pages/Landing";
import NotFound from "@/pages/NotFound";
import ServiceSettingsPage from "@/pages/ServiceSettingsPage";
import SettingsPage from "@/pages/SettingsPage";
import MyStyle from "@/pages/MyStyle";
import { DailyOutfitGenerator } from "@/components/DailyOutfitGenerator";
import SocialPage from "@/pages/SocialPage";
import AIRecommendationsPage from "@/pages/AIRecommendationsPage";
import AIAssistantPage from "@/pages/AIAssistantPage";
import WardrobeInsightsPage from "@/pages/WardrobeInsightsPage";
import SecondDresserPage from "@/pages/SecondDresserPage";
import MyMirrorPage from "@/pages/MyMirrorPage";
import WardrobeBuilder from "@/pages/WardrobeBuilder";
import ComprehensiveSettingsPage from "@/pages/ComprehensiveSettingsPage";
import IntegrationsPage from "@/pages/IntegrationsPage";
import DiscoveryPage from "@/pages/DiscoveryPage";
import CommunityPage from "@/pages/CommunityPage";
import DiscoverPage from "@/pages/DiscoverPage";
import InternationalPage from "@/pages/InternationalPage";
import InternationalSettingsPage from "@/pages/InternationalSettingsPage";
import SupportsResources from "@/pages/SupportsResources";
import ReportsAnalyticsPage from "@/pages/ReportsAnalyticsPage";
import UserAnalyticsPage from "@/pages/UserAnalyticsPage";
import MerchantAnalyticsPage from "@/pages/MerchantAnalyticsPage";
import OutfitDetail from "@/pages/OutfitDetail";
import SecurityPage from "@/pages/SecurityPage";
import AIHub from "@/pages/AIHub";
import AdvancedWardrobeInsights from "@/pages/AdvancedWardrobeInsights";
import AIStyleHub from "@/pages/AIStyleHub";
import SustainabilityPage from "@/pages/SustainabilityPage";
import GamificationPage from "@/pages/GamificationPage";
import AdvancedAnalyticsPage from "@/pages/AdvancedAnalyticsPage";
import PersonalizationHub from "@/pages/PersonalizationHub";
import AdvancedAnalyticsPage from "@/pages/AdvancedAnalyticsPage";
import StyleChallengesPage from "@/pages/StyleChallengesPage";
import WardrobeOptimizerPage from "@/pages/WardrobeOptimizerPage";
import VirtualFittingRoom from "@/pages/VirtualFittingRoom";
import AdvancedAIPage from "@/pages/AdvancedAIPage";
import PersonalShoppingPage from "@/pages/PersonalShoppingPage";
import NotificationsPage from "@/pages/NotificationsPage";
import AuthenticationSettings from "@/pages/settings/AuthenticationSettings";
import AIInsightsPage from "@/pages/AIInsightsPage";
import CollaborationPage from "@/pages/CollaborationPage";
import AIStyleAssistantPage from "@/pages/AIStyleAssistantPage";
import VerificationPage from "@/pages/VerificationPage";
import WardrobeAnalyticsPage from "@/pages/WardrobeAnalyticsPage";
import UnifiedAIHub from "@/components/UnifiedAIHub";

export const AuthWrapper = () => {
  const { isAuthenticated, loading } = useProfile();

  if (loading) {
    return <LoadingSpinner message="Loading MyDresser..." />;
  }

  return (
    <>
      <OfflineIndicator />
      {!isAuthenticated ? (
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="*" element={<Landing />} />
        </Routes>
      ) : (
        <>
          <PWAInstallPrompt />
          <CommandPalette />
          <QuickActionsMenu />
          <KeyboardShortcutsHelper />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/wardrobe" element={<Wardrobe />} />
            <Route path="/market" element={<Market />} />
            <Route path="/market/item/:id" element={<MarketItemDetail />} />
            <Route path="/add" element={<Add />} />
            <Route path="/outfit-generator" element={<DailyOutfitGenerator />} />
            <Route path="/social" element={<SocialPage />} />
            <Route path="/ai-assistant" element={<AIAssistantPage />} />
            <Route path="/wardrobe-insights" element={<WardrobeInsightsPage />} />
            <Route path="/wardrobe-insights/advanced" element={<AdvancedWardrobeInsights />} />
            <Route path="/2nddresser" element={<SecondDresserPage />} />
            <Route path="/mymirror" element={<MyMirrorPage />} />
            <Route path="/wardrobe-builder" element={<WardrobeBuilder />} />
            <Route path="/settings" element={<ComprehensiveSettingsPage />} />
            <Route path="/settings/authentication" element={<AuthenticationSettings />} />
            <Route path="/integrations" element={<IntegrationsPage />} />
            <Route path="/discovery" element={<DiscoveryPage />} />
            <Route path="/discover" element={<DiscoverPage />} />
            <Route path="/community" element={<CommunityPage />} />
            <Route path="/international" element={<InternationalSettingsPage />} />
            <Route path="/support" element={<SupportsResources />} />
            <Route path="/reports" element={<ReportsAnalyticsPage />} />
            <Route path="/analytics" element={<UserAnalyticsPage />} />
          <Route path="/analytics/advanced" element={<AdvancedAnalyticsPage />} />
          <Route path="/personalization" element={<PersonalizationHub />} />
            <Route path="/merchant-analytics" element={<MerchantAnalyticsPage />} />
            <Route path="/account" element={<Account />} />
            <Route path="/mystyle" element={<MyStyle />} />
            <Route path="/service-settings/:service" element={<ServiceSettingsPage />} />
            <Route path="/settings/:category" element={<SettingsPage />} />
            <Route path="/item/:id" element={<ItemDetail />} />
            <Route path="/wardrobe/item/:id" element={<WardrobeItemDetail />} />
            <Route path="/wardrobe/outfit/:id" element={<OutfitDetail />} />
            <Route path="/security" element={<SecurityPage />} />
            <Route path="/ai-hub" element={<UnifiedAIHub />} />
            <Route path="/ai-style-hub" element={<AIStyleHub />} />
            <Route path="/sustainability" element={<SustainabilityPage />} />
            <Route path="/challenges" element={<StyleChallengesPage />} />
            <Route path="/wardrobe/optimizer" element={<WardrobeOptimizerPage />} />
            <Route path="/virtual-fitting" element={<VirtualFittingRoom />} />
            <Route path="/advanced-ai" element={<AdvancedAIPage />} />
            <Route path="/personal-shopping" element={<PersonalShoppingPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/ai-insights" element={<AIInsightsPage />} />
            <Route path="/ai-style-assistant" element={<AIStyleAssistantPage />} />
            <Route path="/collaborate" element={<CollaborationPage />} />
            <Route path="/verification" element={<VerificationPage />} />
            <Route path="/wardrobe-analytics" element={<WardrobeAnalyticsPage />} />
            <Route path="/profile-setup" element={<ProfileSetup />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Navigation />
        </>
      )}
    </>
  );
};
