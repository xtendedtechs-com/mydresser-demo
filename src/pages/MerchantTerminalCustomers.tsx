import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CustomerCRM } from '@/components/merchant/CustomerCRM';
import { LoyaltyProgram } from '@/components/merchant/LoyaltyProgram';
import { Users, Award } from 'lucide-react';

const MerchantTerminalCustomers = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Customer Management</h1>
        <p className="text-muted-foreground">Manage customer relationships and loyalty programs</p>
      </div>

      <Tabs defaultValue="crm" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="crm" className="gap-2">
            <Users className="h-4 w-4" />
            CRM
          </TabsTrigger>
          <TabsTrigger value="loyalty" className="gap-2">
            <Award className="h-4 w-4" />
            Loyalty Program
          </TabsTrigger>
        </TabsList>

        <TabsContent value="crm">
          <CustomerCRM />
        </TabsContent>

        <TabsContent value="loyalty">
          <LoyaltyProgram />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MerchantTerminalCustomers;
