import { Routes, Route, useLocation } from "react-router-dom";
import Navigation from "@/components/Navigation";
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
import MerchantAuth from "@/components/MerchantAuth";
import MerchantTerminal from "@/pages/MerchantTerminal";
import MerchantPage from "@/pages/MerchantPage";
import Auth from "@/pages/Auth";
import NotFound from "../pages/NotFound";
import ServiceSettingsPage from "@/pages/ServiceSettingsPage";
import MyStyle from "@/pages/MyStyle";
import { DailyOutfitGenerator } from "@/components/DailyOutfitGenerator";
import SocialPage from "@/pages/SocialPage";
import AIRecommendationsPage from "@/pages/AIRecommendationsPage";
import MerchantAnalyticsPage from "@/pages/MerchantAnalyticsPage";

const AppContent = () => {
  const location = useLocation();
  const isMerchantRoute = location.pathname.startsWith('/merchant-terminal');

  return (
    <>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/wardrobe" element={<Wardrobe />} />
        <Route path="/market" element={<Market />} />
        <Route path="/market/item/:id" element={<MarketItemDetail />} />
        <Route path="/add" element={<Add />} />
        <Route path="/merchant-terminal" element={<MerchantTerminal />} />
        <Route path="/merchant/:id" element={<MerchantPage />} />
        <Route path="/outfit-generator" element={<DailyOutfitGenerator />} />
        <Route path="/social" element={<SocialPage />} />
        <Route path="/ai-recommendations" element={<AIRecommendationsPage />} />
        <Route path="/merchant-analytics" element={<MerchantAnalyticsPage />} />
        <Route path="/account" element={<Account />} />
        <Route path="/mystyle" element={<MyStyle />} />
        <Route path="/service-settings/:service" element={<ServiceSettingsPage />} />
        <Route path="/item/:id" element={<ItemDetail />} />
        <Route path="/wardrobe/item/:id" element={<WardrobeItemDetail />} />
        <Route path="/profile-setup" element={<ProfileSetup />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      {/* Only show navigation for non-merchant routes */}
      {!isMerchantRoute && <Navigation />}
    </>
  );
};

export default AppContent;