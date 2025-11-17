import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CustomerCRM } from '@/components/merchant/CustomerCRM';
import { LoyaltyProgram } from '@/components/merchant/LoyaltyProgram';
import { Users, Award } from 'lucide-react';

const MerchantTerminalCustomers = () => {
  return (
    <div className="container mx-auto p-6 space-y-6 animate-fade-in">
      <div className="glass-card p-6 rounded-[20px] shadow-[var(--shadow-md)]">
        <h1 className="text-3xl font-bold">Customer Management</h1>
        <p className="text-muted-foreground mt-1">Manage customer relationships and loyalty programs</p>
      </div>

      <Tabs defaultValue="crm" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2 bg-secondary/50 p-1 rounded-[16px]">
          <TabsTrigger value="crm" className="gap-2 rounded-[12px]">
            <Users className="h-4 w-4" />
            CRM
          </TabsTrigger>
          <TabsTrigger value="loyalty" className="gap-2 rounded-[12px]">
            <Award className="h-4 w-4" />
            Loyalty Program
          </TabsTrigger>
        </TabsList>

        <TabsContent value="crm" className="animate-fade-in">
          <CustomerCRM />
        </TabsContent>

        <TabsContent value="loyalty" className="animate-fade-in">
          <LoyaltyProgram />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MerchantTerminalCustomers;
