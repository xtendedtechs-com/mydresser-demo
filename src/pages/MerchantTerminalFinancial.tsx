import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MerchantFinancialDashboard } from '@/components/merchant/MerchantFinancialDashboard';
import { SupplierManagement } from '@/components/merchant/SupplierManagement';
import { DollarSign, Truck } from 'lucide-react';

const MerchantTerminalFinancial = () => {
  return (
    <div className="container mx-auto p-6 space-y-6 animate-fade-in">
      <div className="glass-card p-6 rounded-[20px] shadow-[var(--shadow-md)]">
        <h1 className="text-3xl font-bold">Financial Management</h1>
        <p className="text-muted-foreground mt-1">Track finances and manage supplier relationships</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2 bg-secondary/50 p-1 rounded-[16px]">
          <TabsTrigger value="overview" className="gap-2 rounded-[12px]">
            <DollarSign className="h-4 w-4" />
            Financial Overview
          </TabsTrigger>
          <TabsTrigger value="suppliers" className="gap-2 rounded-[12px]">
            <Truck className="h-4 w-4" />
            Suppliers
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="animate-fade-in">
          <MerchantFinancialDashboard />
        </TabsContent>

        <TabsContent value="suppliers" className="animate-fade-in">
          <SupplierManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MerchantTerminalFinancial;
