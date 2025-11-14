import { MerchantRegister } from '@/components/merchant/MerchantRegister';
import { MobilePOSInterface } from '@/components/merchant/MobilePOSInterface';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShoppingCart, Smartphone } from 'lucide-react';

const MerchantTerminalRegister = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">POS System</h1>
        <p className="text-muted-foreground">Process sales and manage transactions</p>
      </div>
      
      <Tabs defaultValue="register" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="register" className="gap-2">
            <ShoppingCart className="h-4 w-4" />
            Register
          </TabsTrigger>
          <TabsTrigger value="mobile" className="gap-2">
            <Smartphone className="h-4 w-4" />
            Mobile POS
          </TabsTrigger>
        </TabsList>

        <TabsContent value="register">
          <MerchantRegister />
        </TabsContent>

        <TabsContent value="mobile">
          <MobilePOSInterface />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MerchantTerminalRegister;
