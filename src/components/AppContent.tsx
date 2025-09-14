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
import MerchantTerminal from "@/pages/MerchantTerminal";
import MerchantPage from "@/pages/MerchantPage";
import NotFound from "../pages/NotFound";
import EnhancedWardrobeManager from "@/components/EnhancedWardrobeManager";
import EnhancedMarketplace from "@/components/EnhancedMarketplace";
import SmartOutfitMatcher from "@/components/SmartOutfitMatcher";
import { WardrobeAnalytics } from "@/components/WardrobeAnalytics";
import { SmartLaundryTracker } from "@/components/SmartLaundryTracker";
import { DailyOutfitGenerator } from "@/components/DailyOutfitGenerator";

const AppContent = () => {
  const location = useLocation();
  const isMerchantRoute = location.pathname.startsWith('/merchant-terminal');

  return (
    <>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/wardrobe" element={<Wardrobe />} />
        <Route path="/wardrobe/enhanced" element={<EnhancedWardrobeManager />} />
        <Route path="/market" element={<Market />} />
        <Route path="/market/item/:id" element={<MarketItemDetail />} />
        <Route path="/marketplace" element={<EnhancedMarketplace />} />
        <Route path="/add" element={<Add />} />
        <Route path="/merchant-terminal" element={<MerchantTerminal />} />
        <Route path="/merchant/:id" element={<MerchantPage />} />
        <Route path="/smart-matcher" element={<SmartOutfitMatcher />} />
        <Route path="/analytics" element={<WardrobeAnalytics />} />
        <Route path="/laundry" element={<SmartLaundryTracker />} />
        <Route path="/outfit-generator" element={<DailyOutfitGenerator />} />
        <Route path="/account" element={<Account />} />
        <Route path="/item/:id" element={<ItemDetail />} />
        <Route path="/wardrobe/item/:id" element={<WardrobeItemDetail />} />
        <Route path="/profile-setup" element={<ProfileSetup />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      {/* Only show navigation for non-merchant routes */}
      {!isMerchantRoute && <Navigation />}
    </>
  );
};

export default AppContent;