import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BrandPartnershipsPortal } from '@/components/BrandPartnershipsPortal';
import { BulkOrderingSystem } from '@/components/BulkOrderingSystem';

const BrandPartnershipsPage = () => {
  return (
    <div className="min-h-screen bg-background p-6 space-y-6 animate-fade-in">
      <Tabs defaultValue="partnerships" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="partnerships">Partnerships</TabsTrigger>
          <TabsTrigger value="bulk-orders">Bulk Orders</TabsTrigger>
        </TabsList>

        <TabsContent value="partnerships" className="mt-6">
          <BrandPartnershipsPortal />
        </TabsContent>

        <TabsContent value="bulk-orders" className="mt-6">
          <BulkOrderingSystem />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BrandPartnershipsPage;
