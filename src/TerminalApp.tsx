import { Routes, Route, Navigate } from "react-router-dom";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { useProfile } from "@/hooks/useProfile";

// Merchant Pages
import MerchantLanding from "@/pages/MerchantLanding";
import MerchantAuth from "@/components/MerchantAuth";
import MerchantTerminal from "@/pages/MerchantTerminal";
import MerchantPage from "@/pages/MerchantPage";
import MerchantAnalyticsPage from "@/pages/MerchantAnalyticsPage";
import EnhancedMerchantDashboard from "@/pages/EnhancedMerchantDashboard";
import CustomerRelations from "@/pages/CustomerRelations";
import FinancialReports from "@/pages/FinancialReports";
import SupportsResources from "@/pages/SupportsResources";
import NotFound from "@/pages/NotFound";
import MultiStoreManagementPage from "@/pages/MultiStoreManagementPage";
import BrandPartnershipsPage from "@/pages/BrandPartnershipsPage";

const TerminalApp = () => {
  const { isAuthenticated, loading, profile } = useProfile();

  if (loading) {
    return <LoadingSpinner message="Loading Terminal..." />;
  }

  const isMerchant = isAuthenticated && profile?.role === 'merchant';

  return (
    <>
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
            <Route path="/dashboard" element={<EnhancedMerchantDashboard />} />
            <Route path="/analytics" element={<MerchantAnalyticsPage />} />
            <Route path="/customer-relations" element={<CustomerRelations />} />
            <Route path="/financial-reports" element={<FinancialReports />} />
            <Route path="/multi-store" element={<MultiStoreManagementPage />} />
            <Route path="/brand-partnerships" element={<BrandPartnershipsPage />} />
            <Route path="/settings" element={<MerchantTerminal />} />
            <Route path="/support" element={<SupportsResources />} />
            <Route path="/page/:merchantId" element={<MerchantPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        )}
    </>
  );
};

export default TerminalApp;
