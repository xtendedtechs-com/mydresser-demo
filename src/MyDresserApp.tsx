import { Routes, Route } from "react-router-dom";
import { AppProviders } from "@/components/providers/AppProviders";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import Navigation from "@/components/Navigation";
import { useProfile } from "@/hooks/useProfile";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { OfflineIndicator } from "@/components/OfflineIndicator";

// Pages
import Index from "@/pages/Index";
import Home from "@/pages/Home";
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

const MyDresserApp = () => {
  const { isAuthenticated, loading } = useProfile();

  if (loading) {
    return <LoadingSpinner message="Loading MyDresser..." />;
  }

  return (
    <AppProviders>
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
              <Route path="/2nddresser" element={<SecondDresserPage />} />
              <Route path="/mymirror" element={<MyMirrorPage />} />
              <Route path="/wardrobe-builder" element={<WardrobeBuilder />} />
              <Route path="/settings" element={<ComprehensiveSettingsPage />} />
              <Route path="/integrations" element={<IntegrationsPage />} />
              <Route path="/discovery" element={<DiscoveryPage />} />
              <Route path="/account" element={<Account />} />
              <Route path="/mystyle" element={<MyStyle />} />
              <Route path="/service-settings/:service" element={<ServiceSettingsPage />} />
              <Route path="/settings/:category" element={<SettingsPage />} />
              <Route path="/item/:id" element={<ItemDetail />} />
              <Route path="/wardrobe/item/:id" element={<WardrobeItemDetail />} />
              <Route path="/profile-setup" element={<ProfileSetup />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Navigation />
          </>
        )}
    </AppProviders>
  );
};

export default MyDresserApp;
