import { Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { LoadingScreen } from "@/components/LoadingScreen";
import Navigation from "@/components/Navigation";
import { useProfile } from "@/hooks/useProfile";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import { CommandPalette } from "@/components/CommandPalette";
import { QuickAccessMenu } from "@/components/QuickAccessMenu";
import { QuickActionsMenu } from "@/components/QuickActionsMenu";
import { KeyboardShortcutsHelper } from "@/components/KeyboardShortcutsHelper";
import { useSecurityHeaders } from "@/hooks/useSecurityHeaders";
import { ErrorBoundary } from "@/components/ErrorBoundary";

// Lazy load pages for code splitting
const Index = lazy(() => import("@/pages/Index"));
const Wardrobe = lazy(() => import("@/pages/Wardrobe"));
const Account = lazy(() => import("@/pages/Account"));
const Add = lazy(() => import("@/pages/Add"));
const Market = lazy(() => import("@/pages/Market"));
const MarketItemDetail = lazy(() => import("@/pages/MarketItemDetail"));
const ItemDetail = lazy(() => import("@/pages/ItemDetail"));
const WardrobeItemDetail = lazy(() => import("@/pages/WardrobeItemDetail"));
const GeneralSettings = lazy(() => import("@/pages/settings/GeneralSettings"));
const PrivacySettingsPage = lazy(() => import("@/pages/settings/PrivacySettingsPage"));
const NotificationsSettingsPage = lazy(() => import("@/pages/settings/NotificationsSettingsPage"));
const WardrobeSettingsPage = lazy(() => import("@/pages/settings/WardrobeSettingsPage"));
const OutfitSettingsPage = lazy(() => import("@/pages/settings/OutfitSettingsPage"));
const AISettingsPage = lazy(() => import("@/pages/settings/AISettingsPage"));
const MarketplaceSettingsPage = lazy(() => import("@/pages/settings/MarketplaceSettingsPage"));
const PWASettingsPage = lazy(() => import("@/pages/settings/PWASettingsPage"));
const MyStyleSettingsPage = lazy(() => import("@/pages/settings/MyStyleSettingsPage"));
const VTOPhotoSettingsPage = lazy(() => import("@/pages/settings/VTOPhotoSettingsPage"));
const ThemeSettingsPage = lazy(() => import("@/pages/settings/ThemeSettingsPage"));
const SocialSettingsPage = lazy(() => import("@/pages/settings/SocialSettingsPage"));
const ProfileSetup = lazy(() => import("@/pages/ProfileSetup"));
const DataExportPage = lazy(() => import("@/pages/DataExportPage"));
const Auth = lazy(() => import("@/pages/Auth"));
const Landing = lazy(() => import("@/pages/Landing"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const ServiceSettingsPage = lazy(() => import("@/pages/ServiceSettingsPage"));
const MyStyle = lazy(() => import("@/pages/MyStyle"));
const DailyOutfitGenerator = lazy(() => import("@/components/DailyOutfitGenerator").then(m => ({ default: m.DailyOutfitGenerator })));
const SocialPage = lazy(() => import("@/pages/SocialPage"));
const AIRecommendationsPage = lazy(() => import("@/pages/AIRecommendationsPage"));
const AIAssistantPage = lazy(() => import("@/pages/AIAssistantPage"));
const WardrobeInsightsPage = lazy(() => import("@/pages/WardrobeInsightsPage"));
const SecondDresserPage = lazy(() => import("@/pages/SecondDresserPage"));
const TransactionsPage = lazy(() => import("@/pages/TransactionsPage"));
const MessagesPage = lazy(() => import("@/pages/MessagesPage"));
const VirtualTryOnPage = lazy(() => import("@/pages/VirtualTryOnPage"));
const MyMirrorPage = lazy(() => import("@/pages/MyMirrorPage"));
const WardrobeBuilder = lazy(() => import("@/pages/WardrobeBuilder"));
const ComprehensiveSettingsPage = lazy(() => import("@/pages/ComprehensiveSettingsPage"));
const IntegrationsPage = lazy(() => import("@/pages/IntegrationsPage"));
const DiscoveryPage = lazy(() => import("@/pages/DiscoveryPage"));
const CommunityPage = lazy(() => import("@/pages/CommunityPage"));
const DiscoverPage = lazy(() => import("@/pages/DiscoverPage"));
const InternationalPage = lazy(() => import("@/pages/InternationalPage"));
const InternationalSettingsPage = lazy(() => import("@/pages/InternationalSettingsPage"));
const SupportsResources = lazy(() => import("@/pages/SupportsResources"));
const ReportsAnalyticsPage = lazy(() => import("@/pages/ReportsAnalyticsPage"));
const UserAnalyticsPage = lazy(() => import("@/pages/UserAnalyticsPage"));
const MerchantAnalyticsPage = lazy(() => import("@/pages/MerchantAnalyticsPage"));
const OutfitDetail = lazy(() => import("@/pages/OutfitDetail"));
const SecurityPage = lazy(() => import("@/pages/SecurityPage"));
const AIHub = lazy(() => import("@/pages/AIHub"));
const AdvancedWardrobeInsights = lazy(() => import("@/pages/AdvancedWardrobeInsights"));
const AIStyleHub = lazy(() => import("@/pages/AIStyleHub"));
const SustainabilityPage = lazy(() => import("@/pages/SustainabilityPage"));
const GamificationPage = lazy(() => import("@/pages/GamificationPage"));
const AdvancedAnalyticsPage = lazy(() => import("@/pages/AdvancedAnalyticsPage"));
const PersonalizationHub = lazy(() => import("@/pages/PersonalizationHub"));
const StyleChallengesPage = lazy(() => import("@/pages/StyleChallengesPage"));
const WardrobeOptimizerPage = lazy(() => import("@/pages/WardrobeOptimizerPage"));
const VirtualFittingRoom = lazy(() => import("@/pages/VirtualFittingRoom"));
const AdvancedAIPage = lazy(() => import("@/pages/AdvancedAIPage"));
const PersonalShoppingPage = lazy(() => import("@/pages/PersonalShoppingPage"));
const NotificationsPage = lazy(() => import("@/pages/NotificationsPage"));
const AuthenticationSettings = lazy(() => import("@/pages/settings/AuthenticationSettings"));
const AIInsightsPage = lazy(() => import("@/pages/AIInsightsPage"));
const CollaborationPage = lazy(() => import("@/pages/CollaborationPage"));
const AIStylingAssistantPage = lazy(() => import("@/pages/AIStylingAssistantPage"));
const MerchantToolsPage = lazy(() => import("@/pages/MerchantToolsPage"));
const VerificationPage = lazy(() => import("@/pages/VerificationPage"));
const WardrobeAnalyticsPage = lazy(() => import("@/pages/WardrobeAnalyticsPage"));
const UnifiedAIHub = lazy(() => import("@/components/UnifiedAIHub"));
const AIStyleInsightsPage = lazy(() => import("@/pages/AIStyleInsightsPage"));
const MerchantPage = lazy(() => import("@/pages/MerchantPage").then(m => ({ default: m.MerchantPage })));
const AccountSettings = lazy(() => import("@/pages/settings/AccountSettings"));
const OutfitHistoryPage = lazy(() => import("@/pages/OutfitHistoryPage"));
const WeatherPage = lazy(() => import("@/pages/WeatherPage"));
const AppSettings = lazy(() => import("@/pages/settings/AppSettings"));
const AccessibilitySettingsPage = lazy(() => import("@/pages/settings/AccessibilitySettingsPage"));
const ChallengeSettingsPage = lazy(() => import("@/pages/settings/ChallengeSettingsPage"));

export const AuthWrapper = () => {
  const { isAuthenticated, loading } = useProfile();
  useSecurityHeaders();

  if (loading) {
    return <LoadingScreen message="Loading MyDresser..." />;
  }

  return (
    <ErrorBoundary>
      <OfflineIndicator />
      {!isAuthenticated ? (
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="*" element={<Landing />} />
          </Routes>
        </Suspense>
      ) : (
        <>
          <PWAInstallPrompt />
          <CommandPalette />
          <QuickAccessMenu />
          <QuickActionsMenu />
          <KeyboardShortcutsHelper />
          <Suspense fallback={<LoadingScreen />}>
            <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/wardrobe" element={<Wardrobe />} />
            <Route path="/market" element={<Market />} />
            <Route path="/market/item/:id" element={<MarketItemDetail />} />
            <Route path="/merchant/:merchantId" element={<MerchantPage />} />
            <Route path="/add" element={<Add />} />
            <Route path="/outfit-generator" element={<DailyOutfitGenerator />} />
            <Route path="/social" element={<SocialPage />} />
            <Route path="/ai-assistant" element={<AIAssistantPage />} />
            <Route path="/wardrobe-insights" element={<WardrobeInsightsPage />} />
            <Route path="/wardrobe-insights/advanced" element={<AdvancedWardrobeInsights />} />
            <Route path="/2nddresser" element={<SecondDresserPage />} />
            <Route path="/transactions" element={<TransactionsPage />} />
            <Route path="/messages" element={<MessagesPage />} />
            <Route path="/virtual-tryon" element={<VirtualTryOnPage />} />
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
            <Route path="/outfit-history" element={<OutfitHistoryPage />} />
            <Route path="/weather" element={<WeatherPage />} />
            <Route path="/account" element={<Account />} />
            <Route path="/profile-setup" element={<ProfileSetup />} />
            <Route path="/data-export" element={<DataExportPage />} />
            
            {/* Settings Pages */}
            <Route path="/settings/account" element={<AccountSettings />} />
            <Route path="/settings/app" element={<AppSettings />} />
            <Route path="/settings/general" element={<GeneralSettings />} />
            <Route path="/settings/privacy" element={<PrivacySettingsPage />} />
            <Route path="/settings/notifications" element={<NotificationsSettingsPage />} />
            <Route path="/settings/wardrobe" element={<WardrobeSettingsPage />} />
            <Route path="/settings/outfit" element={<OutfitSettingsPage />} />
            <Route path="/settings/ai" element={<AISettingsPage />} />
            <Route path="/settings/marketplace" element={<MarketplaceSettingsPage />} />
            <Route path="/settings/pwa" element={<PWASettingsPage />} />
            <Route path="/settings/mystyle" element={<MyStyleSettingsPage />} />
            <Route path="/settings/vto-photos" element={<VTOPhotoSettingsPage />} />
            <Route path="/settings/theme" element={<ThemeSettingsPage />} />
            <Route path="/settings/social" element={<SocialSettingsPage />} />
            <Route path="/settings/accessibility" element={<AccessibilitySettingsPage />} />
            <Route path="/settings/challenges" element={<ChallengeSettingsPage />} />
            
            <Route path="/mystyle" element={<MyStyle />} />
            <Route path="/service-settings/:service" element={<ServiceSettingsPage />} />
            
            <Route path="/item/:id" element={<ItemDetail />} />
            <Route path="/wardrobe/item/:id" element={<WardrobeItemDetail />} />
            <Route path="/wardrobe/outfit/:id" element={<OutfitDetail />} />
            <Route path="/security" element={<SecurityPage />} />
            <Route path="/ai-hub" element={<UnifiedAIHub />} />
            <Route path="/ai-style-hub" element={<AIStyleHub />} />
            <Route path="/sustainability" element={<SustainabilityPage />} />
            <Route path="/challenges" element={<StyleChallengesPage />} />
            <Route path="/style-challenges" element={<StyleChallengesPage />} />
            <Route path="/wardrobe/optimizer" element={<WardrobeOptimizerPage />} />
            <Route path="/virtual-fitting" element={<VirtualFittingRoom />} />
            <Route path="/advanced-ai" element={<AdvancedAIPage />} />
            <Route path="/personal-shopping" element={<PersonalShoppingPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/ai-insights" element={<AIInsightsPage />} />
            <Route path="/ai-style-assistant" element={<AIStylingAssistantPage />} />
            <Route path="/ai-style-insights" element={<AIStyleInsightsPage />} />
            <Route path="/merchant/tools" element={<MerchantToolsPage />} />
            <Route path="/collaborate" element={<CollaborationPage />} />
            <Route path="/verification" element={<VerificationPage />} />
            <Route path="/wardrobe-analytics" element={<WardrobeAnalyticsPage />} />
            <Route path="/profile-setup" element={<ProfileSetup />} />
            <Route path="/auth" element={<Navigate to="/" replace />} />
          </Routes>
          </Suspense>
          <Navigation />
        </>
      )}
    </ErrorBoundary>
  );
};
