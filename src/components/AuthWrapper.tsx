import { Routes, Route } from "react-router-dom";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import Navigation from "@/components/Navigation";
import { useProfile } from "@/hooks/useProfile";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { OfflineIndicator } from "@/components/OfflineIndicator";

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
            <Route path="/integrations" element={<IntegrationsPage />} />
            <Route path="/discovery" element={<DiscoveryPage />} />
            <Route path="/discover" element={<DiscoverPage />} />
            <Route path="/community" element={<CommunityPage />} />
            <Route path="/international" element={<InternationalPage />} />
            <Route path="/support" element={<SupportsResources />} />
            <Route path="/reports" element={<ReportsAnalyticsPage />} />
            <Route path="/analytics" element={<UserAnalyticsPage />} />
            <Route path="/merchant-analytics" element={<MerchantAnalyticsPage />} />
            <Route path="/account" element={<Account />} />
            <Route path="/mystyle" element={<MyStyle />} />
            <Route path="/service-settings/:service" element={<ServiceSettingsPage />} />
            <Route path="/settings/:category" element={<SettingsPage />} />
            <Route path="/item/:id" element={<ItemDetail />} />
            <Route path="/wardrobe/item/:id" element={<WardrobeItemDetail />} />
            <Route path="/wardrobe/outfit/:id" element={<OutfitDetail />} />
            <Route path="/security" element={<SecurityPage />} />
            <Route path="/ai-hub" element={<AIHub />} />
            <Route path="/ai-style-hub" element={<AIStyleHub />} />
            <Route path="/sustainability" element={<SustainabilityPage />} />
            <Route path="/challenges" element={<GamificationPage />} />
            <Route path="/profile-setup" element={<ProfileSetup />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Navigation />
        </>
      )}
    </>
  );
};
