import { Routes, Route, Navigate } from "react-router-dom";
import { AppProviders } from "@/components/providers/AppProviders";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
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

const TerminalApp = () => {
  const { isAuthenticated, loading, profile } = useProfile();

  if (loading) {
    return <LoadingSpinner message="Loading Terminal..." />;
  }

  const isMerchant = isAuthenticated && profile?.role === 'merchant';

  return (
    <AppProviders>
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
            <Route path="/pos" element={<MerchantTerminal />} />
            <Route path="/analytics" element={<MerchantAnalyticsPage />} />
            <Route path="/customer-relations" element={<CustomerRelations />} />
            <Route path="/financial-reports" element={<FinancialReports />} />
            <Route path="/support" element={<SupportsResources />} />
            <Route path="/page/:merchantId" element={<MerchantPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        )}
    </AppProviders>
  );
};

export default TerminalApp;
