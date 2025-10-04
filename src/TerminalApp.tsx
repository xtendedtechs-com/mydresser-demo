import { Routes, Route, Navigate } from "react-router-dom";
import { MerchantNavigation } from "@/components/MerchantNavigation";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { useProfile } from "@/hooks/useProfile";

// Merchant Pages
import MerchantLanding from "@/pages/MerchantLanding";
import MerchantAuth from "@/components/MerchantAuth";
import MerchantTerminalPage from "@/pages/MerchantTerminalPage";
import MerchantTerminalDashboard from "@/pages/MerchantTerminalDashboard";
import MerchantTerminalRegister from "@/pages/MerchantTerminalRegister";
import MerchantTerminalInventory from "@/pages/MerchantTerminalInventory";
import MerchantTerminalSettings from "@/pages/MerchantTerminalSettings";
import MerchantPage from "@/pages/MerchantPage";
import MerchantAnalyticsPage from "@/pages/MerchantAnalyticsPage";
import EnhancedMerchantDashboard from "@/pages/EnhancedMerchantDashboard";
import CustomerRelations from "@/pages/CustomerRelations";
import FinancialReports from "@/pages/FinancialReports";
import MerchantTerminalSupport from '@/pages/MerchantTerminalSupport';
import MerchantInventoryManagement from "@/pages/MerchantInventoryManagement";
import MerchantOrders from "@/pages/MerchantOrders";
import NotFound from "@/pages/NotFound";
import MultiStoreManagementPage from "@/pages/MultiStoreManagementPage";
import BrandPartnershipsPage from "@/pages/BrandPartnershipsPage";
import AdvancedMerchantReports from "@/pages/AdvancedMerchantReports";
import MerchantToolsPage from "@/pages/MerchantToolsPage";

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
          <>
            <MerchantNavigation />
            <main className="md:pl-64 min-h-screen bg-background">
              <Routes>
                <Route path="/" element={<MerchantTerminalDashboard />} />
                <Route path="/register" element={<MerchantTerminalRegister />} />
                <Route path="/inventory" element={<MerchantTerminalInventory />} />
                <Route path="/orders" element={<MerchantOrders />} />
                <Route path="/customers" element={<CustomerRelations />} />
                <Route path="/financial" element={<FinancialReports />} />
                <Route path="/partnerships" element={<BrandPartnershipsPage />} />
                <Route path="/page" element={<MerchantPage />} />
                <Route path="/settings" element={<MerchantTerminalSettings />} />
                <Route path="/support" element={<MerchantTerminalSupport />} />
                <Route path="/tools" element={<MerchantToolsPage />} />
                <Route path="/dashboard" element={<EnhancedMerchantDashboard />} />
                <Route path="/analytics" element={<MerchantAnalyticsPage />} />
                <Route path="/reports" element={<AdvancedMerchantReports />} />
                <Route path="/customer-relations" element={<CustomerRelations />} />
                <Route path="/financial-reports" element={<FinancialReports />} />
                <Route path="/multi-store" element={<MultiStoreManagementPage />} />
                <Route path="/brand-partnerships" element={<BrandPartnershipsPage />} />
                <Route path="/page/:merchantId" element={<MerchantPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
          </>
        )}
    </>
  );
};

export default TerminalApp;
