import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MerchantDashboardOverview } from '@/components/merchant/MerchantDashboardOverview';
import { MerchantRegister } from '@/components/merchant/MerchantRegister';
import { MerchantCustomPanel } from '@/components/merchant/MerchantCustomPanel';
import { MerchantInventoryManager } from '@/components/merchant/MerchantInventoryManager';
import { Button } from '@/components/ui/button';
import { Activity } from 'lucide-react';
import { useMerchantAnalytics } from '@/hooks/useMerchantAnalytics';

const MerchantPOSPage = () => {
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
          description: 'Please sign in to access the POS terminal',
          variant: 'destructive',
        });
        navigate('/auth');
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
          description: 'Only merchants can access the POS terminal',
          variant: 'destructive',
        });
        navigate('/');
      }
    };

    checkMerchantStatus();
  }, [navigate, toast]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">MyDresser POS Terminal</h1>
          <p className="text-muted-foreground">Complete merchant operations dashboard</p>
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

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 lg:w-auto">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="register">Register</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
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

        <TabsContent value="inventory">
          <MerchantInventoryManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MerchantPOSPage;
