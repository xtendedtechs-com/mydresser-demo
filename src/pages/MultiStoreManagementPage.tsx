import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MultiStoreManager } from '@/components/MultiStoreManager';
import { CentralizedInventory } from '@/components/CentralizedInventory';
import { StaffScheduling } from '@/components/merchant/StaffScheduling';
import { OrganizationMembers } from '@/components/merchant/OrganizationMembers';
import { Store, Package, Calendar, Users } from 'lucide-react';

export default function MultiStoreManagementPage() {
  return (
    <div className="container max-w-7xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Multi-Store Management</h1>
        <p className="text-muted-foreground">
          Manage locations, inventory, staff, and team members
        </p>
      </div>

      <Tabs defaultValue="stores" className="space-y-6">
        <TabsList className="grid w-full max-w-2xl grid-cols-4">
          <TabsTrigger value="stores" className="flex items-center gap-2">
            <Store className="h-4 w-4" />
            Locations
          </TabsTrigger>
          <TabsTrigger value="inventory" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Inventory
          </TabsTrigger>
          <TabsTrigger value="scheduling" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Scheduling
          </TabsTrigger>
          <TabsTrigger value="team" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Team
          </TabsTrigger>
        </TabsList>

        <TabsContent value="stores">
          <MultiStoreManager />
        </TabsContent>

        <TabsContent value="inventory">
          <CentralizedInventory />
        </TabsContent>

        <TabsContent value="scheduling">
          <StaffScheduling />
        </TabsContent>

        <TabsContent value="team">
          <OrganizationMembers />
        </TabsContent>
      </Tabs>
    </div>
  );
}
