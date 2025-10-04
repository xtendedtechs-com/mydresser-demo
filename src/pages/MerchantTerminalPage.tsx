import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Activity, BarChart3, ShoppingCart, Package, Users, DollarSign, Handshake, Globe, Settings, HelpCircle } from 'lucide-react';
import { useMerchantAnalytics } from '@/hooks/useMerchantAnalytics';
import { MerchantDashboardOverview } from '@/components/merchant/MerchantDashboardOverview';
import { MerchantRegister } from '@/components/merchant/MerchantRegister';
import { MerchantCustomPanel } from '@/components/merchant/MerchantCustomPanel';
import { MerchantInventoryManager } from '@/components/merchant/MerchantInventoryManager';
import { EnhancedMerchantPageEditor } from '@/components/EnhancedMerchantPageEditor';
import { MerchantSettingsPanel } from '@/components/settings/MerchantSettingsPanel';
import CustomerRelations from '@/pages/CustomerRelations';
import FinancialReports from '@/pages/FinancialReports';
import SupportResources from '@/pages/SupportsResources';
import BrandPartnershipsPage from '@/pages/BrandPartnershipsPage';
import MerchantOrders from '@/pages/MerchantOrders';

const MerchantTerminalPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('dashboard');
  const { calculateDailyAnalytics, isCalculating } = useMerchantAnalytics();

  useEffect(() => {
    const checkMerchantStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: 'Authentication Required',
          description: 'Please sign in to access the terminal',
          variant: 'destructive',
        });
        navigate('/terminal/auth');
        return;
      }

      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      const isMerchant = roles?.some(r => r.role === 'merchant');
      
      if (!isMerchant) {
        toast({
          title: 'Access Denied',
          description: 'Only merchants can access the terminal',
          variant: 'destructive',
        });
        navigate('/terminal');
      }
    };

    checkMerchantStatus();
  }, [navigate, toast]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">MyDresser POS Terminal</h1>
          <p className="text-muted-foreground">Complete merchant operations center</p>
        </div>
        <Button 
          onClick={() => calculateDailyAnalytics()}
          disabled={isCalculating}
          variant="outline"
        >
          <Activity className="w-4 h-4 mr-2" />
          {isCalculating ? 'Updating...' : 'Update Analytics'}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 lg:grid-cols-10">
          <TabsTrigger value="dashboard" className="gap-1">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden lg:inline">Dashboard</span>
          </TabsTrigger>
          <TabsTrigger value="register" className="gap-1">
            <ShoppingCart className="h-4 w-4" />
            <span className="hidden lg:inline">Register</span>
          </TabsTrigger>
          <TabsTrigger value="orders" className="gap-1">
            <Package className="h-4 w-4" />
            <span className="hidden lg:inline">Orders</span>
          </TabsTrigger>
          <TabsTrigger value="inventory" className="gap-1">
            <Package className="h-4 w-4" />
            <span className="hidden lg:inline">Inventory</span>
          </TabsTrigger>
          <TabsTrigger value="customers" className="gap-1">
            <Users className="h-4 w-4" />
            <span className="hidden lg:inline">Customers</span>
          </TabsTrigger>
          <TabsTrigger value="financial" className="gap-1">
            <DollarSign className="h-4 w-4" />
            <span className="hidden lg:inline">Financial</span>
          </TabsTrigger>
          <TabsTrigger value="partnerships" className="gap-1">
            <Handshake className="h-4 w-4" />
            <span className="hidden lg:inline">Partners</span>
          </TabsTrigger>
          <TabsTrigger value="page" className="gap-1">
            <Globe className="h-4 w-4" />
            <span className="hidden lg:inline">Page</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-1">
            <Settings className="h-4 w-4" />
            <span className="hidden lg:inline">Settings</span>
          </TabsTrigger>
          <TabsTrigger value="support" className="gap-1">
            <HelpCircle className="h-4 w-4" />
            <span className="hidden lg:inline">Support</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <MerchantDashboardOverview />
            </div>
            <div>
              <MerchantCustomPanel />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="register">
          <MerchantRegister />
        </TabsContent>

        <TabsContent value="orders">
          <MerchantOrders />
        </TabsContent>

        <TabsContent value="inventory">
          <MerchantInventoryManager />
        </TabsContent>

        <TabsContent value="customers">
          <CustomerRelations />
        </TabsContent>

        <TabsContent value="financial">
          <FinancialReports />
        </TabsContent>

        <TabsContent value="partnerships">
          <BrandPartnershipsPage />
        </TabsContent>

        <TabsContent value="page">
          <EnhancedMerchantPageEditor />
        </TabsContent>

        <TabsContent value="settings">
          <MerchantSettingsPanel />
        </TabsContent>

        <TabsContent value="support">
          <SupportResources />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MerchantTerminalPage;
