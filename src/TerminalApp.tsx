import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, Navigate } from "react-router-dom";
import SecurityHeaders from "@/components/SecurityHeaders";
import { useProfile } from "@/hooks/useProfile";

// Merchant Pages
import MerchantLanding from "@/pages/MerchantLanding";
import MerchantAuth from "@/components/MerchantAuth";
import MerchantTerminal from "@/pages/MerchantTerminal";
import MerchantPage from "@/pages/MerchantPage";
import MerchantAnalyticsPage from "@/pages/MerchantAnalyticsPage";
import CustomerRelations from "@/pages/CustomerRelations";
import FinancialReports from "@/pages/FinancialReports";
import SupportsResources from "@/pages/SupportsResources";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const TerminalApp = () => {
  const { isAuthenticated, loading, profile } = useProfile();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-muted-foreground">Loading Terminal...</p>
            </div>
          </div>
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  // Check if user is a merchant
  const isMerchant = isAuthenticated && profile?.role === 'merchant';

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SecurityHeaders />
        <Toaster />
        <Sonner />
        {!isAuthenticated ? (
          <Routes>
            <Route path="/" element={<MerchantLanding />} />
            <Route path="/auth" element={<MerchantAuth />} />
            <Route path="*" element={<Navigate to="/terminal" replace />} />
          </Routes>
        ) : !isMerchant ? (
          <Routes>
            <Route path="*" element={
              <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center space-y-4">
                  <h2 className="text-2xl font-bold">Access Denied</h2>
                  <p className="text-muted-foreground">This terminal is for merchants only.</p>
                </div>
              </div>
            } />
          </Routes>
        ) : (
          <Routes>
            <Route path="/" element={<MerchantTerminal />} />
            <Route path="/analytics" element={<MerchantAnalyticsPage />} />
            <Route path="/customer-relations" element={<CustomerRelations />} />
            <Route path="/financial-reports" element={<FinancialReports />} />
            <Route path="/support" element={<SupportsResources />} />
            <Route path="/page/:merchantId" element={<MerchantPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        )}
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default TerminalApp;
