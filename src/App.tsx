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
import ItemDetail from "@/pages/ItemDetail";
import WardrobeItemDetail from "@/pages/WardrobeItemDetail";
import ProfileSetup from "@/pages/ProfileSetup";
import NotFound from "./pages/NotFound";
import { useProfile } from "@/hooks/useProfile";

const queryClient = new QueryClient();

const App = () => {
  const [activeTab, setActiveTab] = useState("home");
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

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return <Home />;
      case "marketplace":
        return <Market />;
      case "wardrobe":
        return <Wardrobe />;
      case "add":
        return <Add />;
      case "account":
        return <Account />;
      default:
        return <Home />;
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SecurityHeaders />
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/item/:id" element={<ItemDetail />} />
            <Route path="/wardrobe-item/:id" element={<WardrobeItemDetail />} />
            <Route path="/profile-setup" element={<ProfileSetup />} />
            <Route path="/*" element={
              <div className="relative">
                {renderContent()}
                <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
              </div>
            } />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;