import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import Home from "@/pages/Home";
import Wardrobe from "@/pages/Wardrobe";
import Account from "@/pages/Account";
import Auth from "@/pages/Auth";
import NotFound from "./pages/NotFound";
import { useProfile } from "@/hooks/useProfile";

const queryClient = new QueryClient();

// Placeholder components for now
const Marketplace = () => (
  <div className="min-h-screen bg-background pb-20 px-4 py-6">
    <h1 className="text-2xl font-bold fashion-text-gradient mb-4">Marketplace</h1>
    <p className="text-muted-foreground">Coming soon...</p>
  </div>
);

const Add = () => (
  <div className="min-h-screen bg-background pb-20 px-4 py-6">
    <h1 className="text-2xl font-bold fashion-text-gradient mb-4">Add Items</h1>
    <p className="text-muted-foreground">Coming soon...</p>
  </div>
);

const App = () => {
  const [activeTab, setActiveTab] = useState("home");
  const { isAuthenticated, loading } = useProfile();

  // Check for auth route
  const isAuthRoute = window.location.pathname === '/auth';

  useEffect(() => {
    // Redirect to home if authenticated and on auth page
    if (isAuthenticated && isAuthRoute) {
      window.location.href = '/';
    }
  }, [isAuthenticated, isAuthRoute]);

  const renderContent = () => {
    // Show auth page if not authenticated and trying to access account
    if (!isAuthenticated && activeTab === "account") {
      return <Auth />;
    }

    // Show auth page if on auth route
    if (isAuthRoute) {
      return <Auth />;
    }

    switch (activeTab) {
      case "home":
        return <Home />;
      case "marketplace":
        return <Marketplace />;
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
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="relative">
            {renderContent()}
            <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;