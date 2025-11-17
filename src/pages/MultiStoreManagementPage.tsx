import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MultiStoreManager } from '@/components/MultiStoreManager';
import { CentralizedInventory } from '@/components/CentralizedInventory';
import { StaffScheduling } from '@/components/merchant/StaffScheduling';
import { OrganizationMembers } from '@/components/merchant/OrganizationMembers';
import { Store, Package, Calendar, Users } from 'lucide-react';

export default function MultiStoreManagementPage() {
  return (
    <div className="container max-w-7xl mx-auto py-8 px-4 animate-fade-in">
      <div className="mb-8 glass-card p-6 rounded-[20px] shadow-[var(--shadow-md)]">
        <h1 className="text-3xl font-bold mb-2">Multi-Store Management</h1>
        <p className="text-muted-foreground">
          Manage locations, inventory, staff, and team members
        </p>
      </div>

      <Tabs defaultValue="stores" className="space-y-6">
        <TabsList className="grid w-full max-w-2xl grid-cols-4 bg-secondary/50 p-1 rounded-[16px]">
          <TabsTrigger value="stores" className="flex items-center gap-2 rounded-[12px]">
            <Store className="h-4 w-4" />
            Locations
          </TabsTrigger>
          <TabsTrigger value="inventory" className="flex items-center gap-2 rounded-[12px]">
            <Package className="h-4 w-4" />
            Inventory
          </TabsTrigger>
          <TabsTrigger value="scheduling" className="flex items-center gap-2 rounded-[12px]">
            <Calendar className="h-4 w-4" />
            Scheduling
          </TabsTrigger>
          <TabsTrigger value="team" className="flex items-center gap-2 rounded-[12px]">
            <Users className="h-4 w-4" />
            Team
          </TabsTrigger>
        </TabsList>

        <TabsContent value="stores" className="animate-fade-in">
          <MultiStoreManager />
        </TabsContent>

        <TabsContent value="inventory" className="animate-fade-in">
          <CentralizedInventory />
        </TabsContent>

        <TabsContent value="scheduling" className="animate-fade-in">
          <StaffScheduling />
        </TabsContent>

        <TabsContent value="team" className="animate-fade-in">
          <OrganizationMembers />
        </TabsContent>
      </Tabs>
    </div>
  );
}
