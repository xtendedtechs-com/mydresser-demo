import { Routes, Route, Navigate } from "react-router-dom";
import { MerchantNavigation } from "@/components/MerchantNavigation";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { useProfile } from "@/hooks/useProfile";

// Merchant Pages
import MerchantLanding from "@/pages/MerchantLanding";
import MerchantAuth from "@/components/MerchantAuth";
import MerchantTerminalDashboard from "@/pages/MerchantTerminalDashboard";
import MerchantTerminalRegister from "@/pages/MerchantTerminalRegister";
import MerchantTerminalInventory from "@/pages/MerchantTerminalInventory";
import MerchantTerminalSettings from "@/pages/MerchantTerminalSettings";
import MerchantTerminalSupport from '@/pages/MerchantTerminalSupport';
import MerchantTerminalAnalytics from '@/pages/MerchantTerminalAnalytics';
import MerchantTerminalPartners from '@/pages/MerchantTerminalPartners';
import MerchantTerminalFinancial from '@/pages/MerchantTerminalFinancial';
import MerchantTerminalCustomers from '@/pages/MerchantTerminalCustomers';
import MerchantTerminalPage from '@/pages/MerchantTerminalPage';
import MerchantTerminalMarketing from '@/pages/MerchantTerminalMarketing';
import MerchantPage from "@/pages/MerchantPage";
import MerchantOrders from "@/pages/MerchantOrders";
import NotFound from "@/pages/NotFound";
import MultiStoreManagementPage from "@/pages/MultiStoreManagementPage";
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
                <Route path="/customers" element={<MerchantTerminalCustomers />} />
                <Route path="/financial" element={<MerchantTerminalFinancial />} />
                <Route path="/partnerships" element={<MerchantTerminalPartners />} />
                <Route path="/analytics" element={<MerchantTerminalAnalytics />} />
                <Route path="/page" element={<MerchantTerminalPage />} />
                <Route path="/marketing" element={<MerchantTerminalMarketing />} />
                <Route path="/settings" element={<MerchantTerminalSettings />} />
                <Route path="/support" element={<MerchantTerminalSupport />} />
                <Route path="/tools" element={<MerchantToolsPage />} />
                <Route path="/multi-store" element={<MultiStoreManagementPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
          </>
        )}
    </>
  );
};

export default TerminalApp;
