import { useState } from 'react';
import { Store, Plus, MapPin, TrendingUp, Package, Users, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface StoreLocation {
  id: string;
  name: string;
  address: string;
  city: string;
  manager: string;
  status: 'active' | 'inactive' | 'coming-soon';
  type: 'flagship' | 'franchise' | 'outlet';
  revenue: number;
  inventory: number;
  customers: number;
  employees: number;
}

export const MultiStoreManager = () => {
  const [stores, setStores] = useState<StoreLocation[]>([
    {
      id: '1',
      name: 'Downtown Flagship',
      address: '123 Main St',
      city: 'New York',
      manager: 'Sarah Johnson',
      status: 'active',
      type: 'flagship',
      revenue: 125000,
      inventory: 1543,
      customers: 856,
      employees: 12,
    },
    {
      id: '2',
      name: 'West Side Branch',
      address: '456 West Ave',
      city: 'New York',
      manager: 'Mike Chen',
      status: 'active',
      type: 'franchise',
      revenue: 87000,
      inventory: 892,
      customers: 523,
      employees: 8,
    },
  ]);

  const [isAddingStore, setIsAddingStore] = useState(false);
  const [newStore, setNewStore] = useState({
    name: '',
    address: '',
    city: '',
    manager: '',
    type: 'franchise' as const,
  });

  const { toast } = useToast();

  const handleAddStore = () => {
    if (!newStore.name || !newStore.address || !newStore.city || !newStore.manager) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all store details',
        variant: 'destructive',
      });
      return;
    }

    const store: StoreLocation = {
      id: Date.now().toString(),
      ...newStore,
      status: 'coming-soon',
      revenue: 0,
      inventory: 0,
      customers: 0,
      employees: 0,
    };

    setStores([...stores, store]);
    setNewStore({ name: '', address: '', city: '', manager: '', type: 'franchise' });
    setIsAddingStore(false);

    toast({
      title: 'Store Added',
      description: `${store.name} has been added to your network`,
    });
  };

  const handleDeleteStore = (id: string) => {
    setStores(stores.filter(s => s.id !== id));
    toast({
      title: 'Store Removed',
      description: 'The store has been removed from your network',
    });
  };

  const getTotalMetrics = () => ({
    totalRevenue: stores.reduce((sum, s) => sum + s.revenue, 0),
    totalInventory: stores.reduce((sum, s) => sum + s.inventory, 0),
    totalCustomers: stores.reduce((sum, s) => sum + s.customers, 0),
    totalEmployees: stores.reduce((sum, s) => sum + s.employees, 0),
    activeStores: stores.filter(s => s.status === 'active').length,
  });

  const metrics = getTotalMetrics();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/10 text-green-600';
      case 'inactive': return 'bg-gray-500/10 text-gray-600';
      case 'coming-soon': return 'bg-blue-500/10 text-blue-600';
      default: return 'bg-gray-500/10 text-gray-600';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'flagship': return 'bg-purple-500/10 text-purple-600';
      case 'franchise': return 'bg-orange-500/10 text-orange-600';
      case 'outlet': return 'bg-teal-500/10 text-teal-600';
      default: return 'bg-gray-500/10 text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Multi-Store Management</h2>
          <p className="text-muted-foreground">
            Manage all your store locations from one dashboard
          </p>
        </div>

        <Dialog open={isAddingStore} onOpenChange={setIsAddingStore}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Store
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Store Location</DialogTitle>
              <DialogDescription>
                Add a new store or franchise location to your network
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="store-name">Store Name</Label>
                <Input
                  id="store-name"
                  placeholder="e.g., Downtown Flagship"
                  value={newStore.name}
                  onChange={(e) => setNewStore({ ...newStore, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  placeholder="e.g., 123 Main St"
                  value={newStore.address}
                  onChange={(e) => setNewStore({ ...newStore, address: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  placeholder="e.g., New York"
                  value={newStore.city}
                  onChange={(e) => setNewStore({ ...newStore, city: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="manager">Store Manager</Label>
                <Input
                  id="manager"
                  placeholder="e.g., John Doe"
                  value={newStore.manager}
                  onChange={(e) => setNewStore({ ...newStore, manager: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Store Type</Label>
                <Select
                  value={newStore.type}
                  onValueChange={(value: any) => setNewStore({ ...newStore, type: value })}
                >
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="flagship">Flagship Store</SelectItem>
                    <SelectItem value="franchise">Franchise</SelectItem>
                    <SelectItem value="outlet">Outlet Store</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddingStore(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddStore}>Add Store</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Network Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Stores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Store className="h-4 w-4 text-primary" />
              <span className="text-2xl font-bold">{metrics.activeStores}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-2xl font-bold">${(metrics.totalRevenue / 1000).toFixed(0)}K</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Inventory
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-blue-600" />
              <span className="text-2xl font-bold">{metrics.totalInventory}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Customers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-purple-600" />
              <span className="text-2xl font-bold">{metrics.totalCustomers}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Employees
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-orange-600" />
              <span className="text-2xl font-bold">{metrics.totalEmployees}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Store List */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Stores</TabsTrigger>
          <TabsTrigger value="flagship">Flagship</TabsTrigger>
          <TabsTrigger value="franchise">Franchise</TabsTrigger>
          <TabsTrigger value="outlet">Outlet</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {stores.map((store) => (
            <Card key={store.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Store className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{store.name}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <MapPin className="h-3 w-3" />
                        {store.address}, {store.city}
                      </CardDescription>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className={getStatusColor(store.status)}>
                          {store.status}
                        </Badge>
                        <Badge className={getTypeColor(store.type)}>
                          {store.type}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteStore(store.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Manager</p>
                    <p className="font-medium">{store.manager}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Revenue</p>
                    <p className="font-medium">${(store.revenue / 1000).toFixed(1)}K</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Inventory</p>
                    <p className="font-medium">{store.inventory} items</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Customers</p>
                    <p className="font-medium">{store.customers}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="flagship" className="space-y-4">
          {stores.filter(s => s.type === 'flagship').map((store) => (
            <Card key={store.id}>
              {/* ... same card content ... */}
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="franchise" className="space-y-4">
          {stores.filter(s => s.type === 'franchise').map((store) => (
            <Card key={store.id}>
              {/* ... same card content ... */}
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="outlet" className="space-y-4">
          {stores.filter(s => s.type === 'outlet').map((store) => (
            <Card key={store.id}>
              {/* ... same card content ... */}
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};
