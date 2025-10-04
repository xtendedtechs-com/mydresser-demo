import { Button } from '@/components/ui/button';
import { Activity } from 'lucide-react';
import { useMerchantAnalytics } from '@/hooks/useMerchantAnalytics';
import { MerchantDashboardOverview } from '@/components/merchant/MerchantDashboardOverview';
import { MerchantCustomPanel } from '@/components/merchant/MerchantCustomPanel';

const MerchantTerminalDashboard = () => {
  const { calculateDailyAnalytics, isCalculating } = useMerchantAnalytics();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Sales overview and performance metrics</p>
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

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <MerchantDashboardOverview />
        </div>
        <div>
          <MerchantCustomPanel />
        </div>
      </div>
    </div>
  );
};

export default MerchantTerminalDashboard;
