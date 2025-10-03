import { useState } from 'react';
import { Store, Plus, MapPin, TrendingUp, Package, Users, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useStoreLocations } from '@/hooks/useStoreLocations';
import { Skeleton } from '@/components/ui/skeleton';
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

export const MultiStoreManager = () => {
  const { locations, loading, addLocation, deleteLocation } = useStoreLocations();
  const [isAddingStore, setIsAddingStore] = useState(false);
  const [newStore, setNewStore] = useState({
    location_name: '',
    address: { street: '', city: '', state: '', zip: '', country: '' },
    phone: '',
    email: '',
    manager_name: '',
    manager_contact: '',
    is_primary: false,
  });

  const { toast } = useToast();

  const handleAddStore = async () => {
    if (!newStore.location_name || !newStore.address.street || !newStore.manager_name) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all store details',
        variant: 'destructive',
      });
      return;
    }

    try {
      await addLocation(newStore);
      setNewStore({
        location_name: '',
        address: { street: '', city: '', state: '', zip: '', country: '' },
        phone: '',
        email: '',
        manager_name: '',
        manager_contact: '',
        is_primary: false,
      });
      setIsAddingStore(false);
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleDeleteStore = async (id: string) => {
    const store = locations.find(s => s.id === id);
    if (window.confirm(`Are you sure you want to delete ${store?.location_name}?`)) {
      await deleteLocation(id);
    }
  };

  const getTotalMetrics = () => ({
    activeStores: locations.filter(l => l.is_active).length,
    totalLocations: locations.length,
  });

  const metrics = getTotalMetrics();

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'bg-green-500/10 text-green-600' : 'bg-gray-500/10 text-gray-600';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-full" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

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
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Store Location</DialogTitle>
              <DialogDescription>
                Add a new store or franchise location to your network
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
              <div className="space-y-2">
                <Label htmlFor="store-name">Store Name *</Label>
                <Input
                  id="store-name"
                  placeholder="e.g., Downtown Flagship"
                  value={newStore.location_name}
                  onChange={(e) => setNewStore({ ...newStore, location_name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="street">Street Address *</Label>
                <Input
                  id="street"
                  placeholder="e.g., 123 Main St"
                  value={newStore.address.street}
                  onChange={(e) => setNewStore({ 
                    ...newStore, 
                    address: { ...newStore.address, street: e.target.value }
                  })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    placeholder="e.g., New York"
                    value={newStore.address.city}
                    onChange={(e) => setNewStore({ 
                      ...newStore, 
                      address: { ...newStore.address, city: e.target.value }
                    })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">State/Province</Label>
                  <Input
                    id="state"
                    placeholder="e.g., NY"
                    value={newStore.address.state}
                    onChange={(e) => setNewStore({ 
                      ...newStore, 
                      address: { ...newStore.address, state: e.target.value }
                    })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="zip">ZIP/Postal Code</Label>
                  <Input
                    id="zip"
                    placeholder="e.g., 10001"
                    value={newStore.address.zip}
                    onChange={(e) => setNewStore({ 
                      ...newStore, 
                      address: { ...newStore.address, zip: e.target.value }
                    })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    placeholder="e.g., USA"
                    value={newStore.address.country}
                    onChange={(e) => setNewStore({ 
                      ...newStore, 
                      address: { ...newStore.address, country: e.target.value }
                    })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="manager">Store Manager *</Label>
                <Input
                  id="manager"
                  placeholder="e.g., John Doe"
                  value={newStore.manager_name}
                  onChange={(e) => setNewStore({ ...newStore, manager_name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="manager-contact">Manager Contact</Label>
                <Input
                  id="manager-contact"
                  placeholder="e.g., +1 234 567 8900"
                  value={newStore.manager_contact}
                  onChange={(e) => setNewStore({ ...newStore, manager_contact: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Store Phone</Label>
                  <Input
                    id="phone"
                    placeholder="e.g., +1 234 567 8900"
                    value={newStore.phone}
                    onChange={(e) => setNewStore({ ...newStore, phone: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Store Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="e.g., store@example.com"
                    value={newStore.email}
                    onChange={(e) => setNewStore({ ...newStore, email: e.target.value })}
                  />
                </div>
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
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Locations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Store className="h-4 w-4 text-primary" />
              <span className="text-2xl font-bold">{metrics.totalLocations}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Stores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-2xl font-bold">{metrics.activeStores}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Inactive Stores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-gray-600" />
              <span className="text-2xl font-bold">{metrics.totalLocations - metrics.activeStores}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Store List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Store Locations</h3>
        
        {locations.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Store className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-2">No stores yet</p>
              <p className="text-muted-foreground mb-4">
                Get started by adding your first store location
              </p>
              <Button onClick={() => setIsAddingStore(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add First Store
              </Button>
            </CardContent>
          </Card>
        ) : (
          locations.map((store) => (
            <Card key={store.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Store className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{store.location_name}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <MapPin className="h-3 w-3" />
                        {store.address?.street && `${store.address.street}, `}
                        {store.address?.city && `${store.address.city}`}
                        {store.address?.state && `, ${store.address.state}`}
                      </CardDescription>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className={getStatusColor(store.is_active)}>
                          {store.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                        {store.is_primary && (
                          <Badge variant="outline">Primary Location</Badge>
                        )}
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
                    <p className="font-medium">{store.manager_name || 'Not assigned'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Phone</p>
                    <p className="font-medium">{store.phone || 'Not set'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Email</p>
                    <p className="font-medium">{store.email || 'Not set'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Manager Contact</p>
                    <p className="font-medium">{store.manager_contact || 'Not set'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
