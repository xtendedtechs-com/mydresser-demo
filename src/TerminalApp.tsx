import { Routes, Route, Navigate } from "react-router-dom";
import { MerchantNavigation } from "@/components/MerchantNavigation";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { useProfile } from "@/hooks/useProfile";
import { PageTransition } from "@/components/PageTransition";

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
import MerchantReports from "@/pages/merchant/MerchantReports";
import Notifications from "@/pages/merchant/Notifications";
import Marketing from "@/pages/merchant/Marketing";
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
            <Route path="/" element={<PageTransition><MerchantLanding /></PageTransition>} />
            <Route path="/auth" element={<PageTransition><MerchantAuth /></PageTransition>} />
            <Route path="*" element={<Navigate to="/terminal" replace />} />
          </Routes>
        ) : !isMerchant ? (
          <Routes>
            <Route path="*" element={
              <PageTransition>
                <div className="min-h-screen bg-background flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <h2 className="text-2xl font-bold">Access Denied</h2>
                    <p className="text-muted-foreground">This terminal is for merchants only.</p>
                  </div>
                </div>
              </PageTransition>
            } />
          </Routes>
        ) : (
          <>
            <MerchantNavigation />
            <main className="md:pl-64 min-h-screen bg-background">
              <Routes>
                <Route path="/" element={<PageTransition><MerchantTerminalDashboard /></PageTransition>} />
                <Route path="/register" element={<PageTransition><MerchantTerminalRegister /></PageTransition>} />
                <Route path="/inventory" element={<PageTransition><MerchantTerminalInventory /></PageTransition>} />
                <Route path="/orders" element={<PageTransition><MerchantOrders /></PageTransition>} />
                <Route path="/customers" element={<PageTransition><MerchantTerminalCustomers /></PageTransition>} />
                <Route path="/reports" element={<PageTransition><MerchantReports /></PageTransition>} />
                <Route path="/notifications" element={<PageTransition><Notifications /></PageTransition>} />
                <Route path="/marketing" element={<PageTransition><Marketing /></PageTransition>} />
                <Route path="/financial" element={<PageTransition><MerchantTerminalFinancial /></PageTransition>} />
                <Route path="/partnerships" element={<PageTransition><MerchantTerminalPartners /></PageTransition>} />
                <Route path="/analytics" element={<PageTransition><MerchantTerminalAnalytics /></PageTransition>} />
                <Route path="/page" element={<PageTransition><MerchantTerminalPage /></PageTransition>} />
                <Route path="/settings" element={<PageTransition><MerchantTerminalSettings /></PageTransition>} />
                <Route path="/support" element={<PageTransition><MerchantTerminalSupport /></PageTransition>} />
                <Route path="/tools" element={<PageTransition><MerchantToolsPage /></PageTransition>} />
                <Route path="/multi-store" element={<PageTransition><MultiStoreManagementPage /></PageTransition>} />
                <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
              </Routes>
            </main>
          </>
        )}
    </>
  );
};

export default TerminalApp;
