import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MerchantFinancialDashboard } from '@/components/merchant/MerchantFinancialDashboard';
import { SupplierManagement } from '@/components/merchant/SupplierManagement';
import { DollarSign, Truck } from 'lucide-react';

const MerchantTerminalFinancial = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Financial Management</h1>
        <p className="text-muted-foreground">Track finances and manage supplier relationships</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="overview" className="gap-2">
            <DollarSign className="h-4 w-4" />
            Financial Overview
          </TabsTrigger>
          <TabsTrigger value="suppliers" className="gap-2">
            <Truck className="h-4 w-4" />
            Suppliers
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <MerchantFinancialDashboard />
        </TabsContent>

        <TabsContent value="suppliers">
          <SupplierManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MerchantTerminalFinancial;
