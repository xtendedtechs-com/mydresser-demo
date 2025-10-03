import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MultiStoreManager } from '@/components/MultiStoreManager';
import { CentralizedInventory } from '@/components/CentralizedInventory';
import { Store, Package } from 'lucide-react';

export default function MultiStoreManagementPage() {
  return (
    <div className="container max-w-7xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Multi-Store Management</h1>
        <p className="text-muted-foreground">
          Manage multiple locations, franchises, and centralized inventory
        </p>
      </div>

      <Tabs defaultValue="stores" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="stores" className="flex items-center gap-2">
            <Store className="h-4 w-4" />
            Store Locations
          </TabsTrigger>
          <TabsTrigger value="inventory" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Centralized Inventory
          </TabsTrigger>
        </TabsList>

        <TabsContent value="stores">
          <MultiStoreManager />
        </TabsContent>

        <TabsContent value="inventory">
          <CentralizedInventory />
        </TabsContent>
      </Tabs>
    </div>
  );
}
