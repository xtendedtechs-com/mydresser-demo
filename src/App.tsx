import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import SecurityHeaders from "@/components/SecurityHeaders";
import Home from "@/pages/Home";
import Wardrobe from "@/pages/Wardrobe";
import Account from "@/pages/Account";
import Add from "@/pages/Add";
import Auth from "@/pages/Auth";
import Market from "@/pages/Market";
import MarketItemDetail from "@/pages/MarketItemDetail";
import ItemDetail from "@/pages/ItemDetail";
import WardrobeItemDetail from "@/pages/WardrobeItemDetail";
import ProfileSetup from "@/pages/ProfileSetup";
import MerchantTerminal from "@/pages/MerchantTerminal";
import NotFound from "./pages/NotFound";
import EnhancedWardrobeManager from "@/components/EnhancedWardrobeManager";
import EnhancedMarketplace from "@/components/EnhancedMarketplace";
import SmartOutfitMatcher from "@/components/SmartOutfitMatcher";
import { useProfile } from "@/hooks/useProfile";

const queryClient = new QueryClient();

const App = () => {
  const { isAuthenticated, loading } = useProfile();

  // Avoid hard reload redirects; routing/guards handled below

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-muted-foreground">Loading...</p>
            </div>
          </div>
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  // Show auth page if not authenticated (except for auth route itself)
  if (!isAuthenticated) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Auth />
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  // Remove old tab system - no longer needed

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SecurityHeaders />
        <Toaster />
        <Sonner />
        <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/wardrobe" element={<Wardrobe />} />
          <Route path="/wardrobe/enhanced" element={<EnhancedWardrobeManager />} />
          <Route path="/market" element={<Market />} />
          <Route path="/market/item/:id" element={<MarketItemDetail />} />
          <Route path="/marketplace" element={<EnhancedMarketplace />} />
          <Route path="/add" element={<Add />} />
          <Route path="/merchant-terminal" element={<MerchantTerminal />} />
          <Route path="/smart-matcher" element={<SmartOutfitMatcher />} />
          <Route path="/account" element={<Account />} />
          <Route path="/item/:id" element={<ItemDetail />} />
          <Route path="/wardrobe/item/:id" element={<WardrobeItemDetail />} />
          <Route path="/profile-setup" element={<ProfileSetup />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
          <Navigation />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;