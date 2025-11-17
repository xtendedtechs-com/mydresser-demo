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
import { PageTransition } from "@/components/PageTransition";

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
const DresserPage = lazy(() => import("@/pages/DresserPage"));
const CollectionsPage = lazy(() => import("@/pages/CollectionsPage"));
const SocialPage = lazy(() => import("@/pages/SocialPage"));
const SocialFeed = lazy(() => import("@/pages/social/SocialFeed"));
const UserProfile = lazy(() => import("@/pages/social/UserProfile"));
const VirtualTryOn = lazy(() => import("@/pages/tryon/VirtualTryOn"));
const AIRecommendationsPage = lazy(() => import("@/pages/AIRecommendationsPage"));
const AIAssistantPage = lazy(() => import("@/pages/AIAssistantPage"));
const PaymentSettingsPage = lazy(() => import("@/pages/settings/PaymentSettings"));
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
const UserInsights = lazy(() => import("@/pages/analytics/UserInsights"));
const MerchantDashboard = lazy(() => import("@/pages/analytics/MerchantDashboard"));
const PricingPage = lazy(() => import("@/pages/subscription/PricingPage"));
const ManageSubscription = lazy(() => import("@/pages/subscription/ManageSubscription"));
const BillingHistory = lazy(() => import("@/pages/subscription/BillingHistory"));
const POSTerminal = lazy(() => import("@/pages/merchant/POSTerminal"));
const StoreLocations = lazy(() => import("@/pages/merchant/StoreLocations"));
const OutfitHistoryPage = lazy(() => import("@/pages/OutfitHistoryPage"));
const WeatherPage = lazy(() => import("@/pages/WeatherPage"));
const AppSettings = lazy(() => import("@/pages/settings/AppSettings"));
const AccessibilitySettingsPage = lazy(() => import("@/pages/settings/AccessibilitySettingsPage"));
const ChallengeSettingsPage = lazy(() => import("@/pages/settings/ChallengeSettingsPage"));
const ForgotPassword = lazy(() => import("@/pages/ForgotPassword"));
const ResetPassword = lazy(() => import("@/pages/ResetPassword"));
const SecuritySettings = lazy(() => import("@/pages/settings/SecuritySettings"));

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
            <Route path="/" element={<PageTransition><Landing /></PageTransition>} />
            <Route path="/auth" element={<PageTransition><Auth /></PageTransition>} />
            <Route path="/forgot-password" element={<PageTransition><ForgotPassword /></PageTransition>} />
            <Route path="/reset-password" element={<PageTransition><ResetPassword /></PageTransition>} />
            <Route path="*" element={<PageTransition><Landing /></PageTransition>} />
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
            <Route path="/" element={<PageTransition><Index /></PageTransition>} />
            <Route path="/wardrobe" element={<PageTransition><Wardrobe /></PageTransition>} />
            <Route path="/market" element={<PageTransition><Market /></PageTransition>} />
            <Route path="/market/item/:id" element={<PageTransition><MarketItemDetail /></PageTransition>} />
            <Route path="/merchant/:merchantId" element={<PageTransition><MerchantPage /></PageTransition>} />
            <Route path="/add" element={<PageTransition><Add /></PageTransition>} />
            <Route path="/outfit-generator" element={<PageTransition><DailyOutfitGenerator /></PageTransition>} />
            <Route path="/dresser" element={<PageTransition><DresserPage /></PageTransition>} />
            <Route path="/collections" element={<PageTransition><CollectionsPage /></PageTransition>} />
            <Route path="/social" element={<PageTransition><SocialPage /></PageTransition>} />
            <Route path="/social/feed" element={<PageTransition><SocialFeed /></PageTransition>} />
            <Route path="/profile/:userId" element={<PageTransition><UserProfile /></PageTransition>} />
            <Route path="/tryon" element={<PageTransition><VirtualTryOn /></PageTransition>} />
            <Route path="/ai-assistant" element={<PageTransition><AIAssistantPage /></PageTransition>} />
            <Route path="/wardrobe-insights" element={<PageTransition><WardrobeInsightsPage /></PageTransition>} />
            <Route path="/wardrobe-insights/advanced" element={<PageTransition><AdvancedWardrobeInsights /></PageTransition>} />
            <Route path="/2nddresser" element={<PageTransition><SecondDresserPage /></PageTransition>} />
            <Route path="/transactions" element={<PageTransition><TransactionsPage /></PageTransition>} />
            <Route path="/messages" element={<PageTransition><MessagesPage /></PageTransition>} />
            <Route path="/virtual-tryon" element={<PageTransition><VirtualTryOnPage /></PageTransition>} />
            <Route path="/mymirror" element={<PageTransition><MyMirrorPage /></PageTransition>} />
            <Route path="/wardrobe-builder" element={<PageTransition><WardrobeBuilder /></PageTransition>} />
            <Route path="/settings" element={<PageTransition><ComprehensiveSettingsPage /></PageTransition>} />
            <Route path="/settings/authentication" element={<PageTransition><AuthenticationSettings /></PageTransition>} />
            <Route path="/integrations" element={<PageTransition><IntegrationsPage /></PageTransition>} />
            <Route path="/discovery" element={<PageTransition><DiscoveryPage /></PageTransition>} />
            <Route path="/discover" element={<PageTransition><DiscoverPage /></PageTransition>} />
            <Route path="/community" element={<PageTransition><CommunityPage /></PageTransition>} />
            <Route path="/international" element={<PageTransition><InternationalSettingsPage /></PageTransition>} />
            <Route path="/support" element={<PageTransition><SupportsResources /></PageTransition>} />
            <Route path="/reports" element={<PageTransition><ReportsAnalyticsPage /></PageTransition>} />
            <Route path="/analytics" element={<PageTransition><UserAnalyticsPage /></PageTransition>} />
          <Route path="/analytics/advanced" element={<PageTransition><AdvancedAnalyticsPage /></PageTransition>} />
          <Route path="/personalization" element={<PageTransition><PersonalizationHub /></PageTransition>} />
            <Route path="/merchant-analytics" element={<PageTransition><MerchantAnalyticsPage /></PageTransition>} />
            <Route path="/outfit-history" element={<PageTransition><OutfitHistoryPage /></PageTransition>} />
            <Route path="/weather" element={<PageTransition><WeatherPage /></PageTransition>} />
            <Route path="/account" element={<PageTransition><Account /></PageTransition>} />
            <Route path="/profile-setup" element={<PageTransition><ProfileSetup /></PageTransition>} />
            <Route path="/data-export" element={<PageTransition><DataExportPage /></PageTransition>} />
            
            {/* Settings Pages */}
            <Route path="/settings/account" element={<PageTransition><AccountSettings /></PageTransition>} />
            <Route path="/settings/app" element={<PageTransition><AppSettings /></PageTransition>} />
            <Route path="/settings/general" element={<PageTransition><GeneralSettings /></PageTransition>} />
            <Route path="/settings/privacy" element={<PageTransition><PrivacySettingsPage /></PageTransition>} />
            <Route path="/settings/notifications" element={<PageTransition><NotificationsSettingsPage /></PageTransition>} />
            <Route path="/settings/wardrobe" element={<PageTransition><WardrobeSettingsPage /></PageTransition>} />
            <Route path="/settings/outfit" element={<PageTransition><OutfitSettingsPage /></PageTransition>} />
            <Route path="/settings/ai" element={<PageTransition><AISettingsPage /></PageTransition>} />
            <Route path="/settings/marketplace" element={<PageTransition><MarketplaceSettingsPage /></PageTransition>} />
            <Route path="/settings/pwa" element={<PageTransition><PWASettingsPage /></PageTransition>} />
            <Route path="/settings/mystyle" element={<PageTransition><MyStyleSettingsPage /></PageTransition>} />
            <Route path="/settings/vto-photos" element={<PageTransition><VTOPhotoSettingsPage /></PageTransition>} />
            <Route path="/settings/theme" element={<PageTransition><ThemeSettingsPage /></PageTransition>} />
            <Route path="/settings/social" element={<PageTransition><SocialSettingsPage /></PageTransition>} />
            <Route path="/settings/accessibility" element={<PageTransition><AccessibilitySettingsPage /></PageTransition>} />
            <Route path="/settings/challenges" element={<PageTransition><ChallengeSettingsPage /></PageTransition>} />
            <Route path="/settings/security" element={<PageTransition><SecuritySettings /></PageTransition>} />
            
            <Route path="/mystyle" element={<PageTransition><MyStyle /></PageTransition>} />
            <Route path="/service-settings/:service" element={<PageTransition><ServiceSettingsPage /></PageTransition>} />
            
            <Route path="/item/:id" element={<PageTransition><ItemDetail /></PageTransition>} />
            <Route path="/wardrobe/item/:id" element={<PageTransition><WardrobeItemDetail /></PageTransition>} />
            <Route path="/wardrobe/outfit/:id" element={<PageTransition><OutfitDetail /></PageTransition>} />
            <Route path="/security" element={<PageTransition><SecurityPage /></PageTransition>} />
            <Route path="/ai-hub" element={<PageTransition><UnifiedAIHub /></PageTransition>} />
            <Route path="/ai-style-hub" element={<PageTransition><AIStyleHub /></PageTransition>} />
            <Route path="/sustainability" element={<PageTransition><SustainabilityPage /></PageTransition>} />
            <Route path="/challenges" element={<PageTransition><StyleChallengesPage /></PageTransition>} />
            <Route path="/style-challenges" element={<PageTransition><StyleChallengesPage /></PageTransition>} />
            <Route path="/wardrobe/optimizer" element={<PageTransition><WardrobeOptimizerPage /></PageTransition>} />
            <Route path="/virtual-fitting" element={<PageTransition><VirtualFittingRoom /></PageTransition>} />
            <Route path="/advanced-ai" element={<PageTransition><AdvancedAIPage /></PageTransition>} />
            <Route path="/personal-shopping" element={<PageTransition><PersonalShoppingPage /></PageTransition>} />
            <Route path="/notifications" element={<PageTransition><NotificationsPage /></PageTransition>} />
            <Route path="/ai-insights" element={<PageTransition><AIInsightsPage /></PageTransition>} />
            <Route path="/ai-style-assistant" element={<PageTransition><AIStylingAssistantPage /></PageTransition>} />
            <Route path="/ai-style-insights" element={<PageTransition><AIStyleInsightsPage /></PageTransition>} />
            <Route path="/merchant/tools" element={<PageTransition><MerchantToolsPage /></PageTransition>} />
            <Route path="/collaborate" element={<PageTransition><CollaborationPage /></PageTransition>} />
            <Route path="/verification" element={<PageTransition><VerificationPage /></PageTransition>} />
            <Route path="/wardrobe-analytics" element={<PageTransition><WardrobeAnalyticsPage /></PageTransition>} />
            <Route path="/analytics/user" element={<PageTransition><UserInsights /></PageTransition>} />
            <Route path="/analytics/merchant" element={<PageTransition><MerchantDashboard /></PageTransition>} />
          <Route path="/subscription/pricing" element={<PageTransition><PricingPage /></PageTransition>} />
          <Route path="/subscription/manage" element={<PageTransition><ManageSubscription /></PageTransition>} />
          <Route path="/subscription/billing" element={<PageTransition><BillingHistory /></PageTransition>} />
          <Route path="/settings/payment" element={<PageTransition><Suspense fallback={<div>Loading...</div>}><PaymentSettingsPage /></Suspense></PageTransition>} />
            <Route path="/merchant/pos-terminal" element={<PageTransition><POSTerminal /></PageTransition>} />
            <Route path="/merchant/locations" element={<PageTransition><StoreLocations /></PageTransition>} />
            <Route path="/profile-setup" element={<PageTransition><ProfileSetup /></PageTransition>} />
            <Route path="/auth" element={<Navigate to="/" replace />} />
          </Routes>
          </Suspense>
          <Navigation />
        </>
      )}
    </ErrorBoundary>
  );
};
