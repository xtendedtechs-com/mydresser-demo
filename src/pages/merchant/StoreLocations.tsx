import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useStoreLocations } from '@/hooks/useStoreLocations';
import { MapPin, Plus, Users, Phone, Mail } from 'lucide-react';

const StoreLocations = () => {
  const { locations, staff, isLoading, createLocation, addStaff } = useStoreLocations() as any;
  const [locationDialogOpen, setLocationDialogOpen] = useState(false);
  const [staffDialogOpen, setStaffDialogOpen] = useState(false);
  const [newLocation, setNewLocation] = useState({
    location_name: '',
    address: {},
    phone: '',
    email: '',
  });
  const [newStaff, setNewStaff] = useState({
    store_location_id: '',
    staff_name: '',
    staff_email: '',
    staff_role: 'cashier',
  });

  if (isLoading) {
    return <div className="p-8">Loading store locations...</div>;
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container max-w-7xl mx-auto p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Store Locations</h1>
            <p className="text-muted-foreground">Manage your physical store locations and staff</p>
          </div>
          <div className="flex gap-2">
            <Dialog open={staffDialogOpen} onOpenChange={setStaffDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Users className="w-4 h-4 mr-2" />
                  Add Staff
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Staff Member</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Staff Name</Label>
                    <Input
                      placeholder="John Doe"
                      value={newStaff.staff_name}
                      onChange={(e) => setNewStaff({ ...newStaff, staff_name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input
                      type="email"
                      placeholder="john@example.com"
                      value={newStaff.staff_email}
                      onChange={(e) => setNewStaff({ ...newStaff, staff_email: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Role</Label>
                    <select
                      className="w-full border rounded-md p-2"
                      value={newStaff.staff_role}
                      onChange={(e) => setNewStaff({ ...newStaff, staff_role: e.target.value })}
                    >
                      <option value="cashier">Cashier</option>
                      <option value="manager">Manager</option>
                      <option value="assistant">Assistant</option>
                    </select>
                  </div>
                  <div>
                    <Label>Location</Label>
                    <select
                      className="w-full border rounded-md p-2"
                      value={newStaff.store_location_id}
                      onChange={(e) => setNewStaff({ ...newStaff, store_location_id: e.target.value })}
                    >
                      <option value="">Select location</option>
                      {locations?.map((location) => (
                        <option key={location.id} value={location.id}>
                          {location.location_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <Button className="w-full" onClick={() => {
                    addStaff(newStaff);
                    setStaffDialogOpen(false);
                  }}>
                    Add Staff Member
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={locationDialogOpen} onOpenChange={setLocationDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Location
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Store Location</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Location Name</Label>
                    <Input
                      placeholder="Downtown Store"
                      value={newLocation.location_name}
                      onChange={(e) => setNewLocation({ ...newLocation, location_name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <Input
                      placeholder="+1 (555) 123-4567"
                      value={newLocation.phone}
                      onChange={(e) => setNewLocation({ ...newLocation, phone: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input
                      type="email"
                      placeholder="store@example.com"
                      value={newLocation.email}
                      onChange={(e) => setNewLocation({ ...newLocation, email: e.target.value })}
                    />
                  </div>
                  <Button className="w-full" onClick={() => {
                    createLocation(newLocation);
                    setLocationDialogOpen(false);
                  }}>
                    Create Location
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Locations Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {locations && locations.length > 0 ? (
            locations.map((location) => (
              <Card key={location.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-6 h-6 text-primary" />
                    <div>
                      <h3 className="font-semibold text-lg">{location.location_name}</h3>
                      <Badge variant={location.is_active ? 'default' : 'secondary'} className="mt-1">
                        {location.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  {location.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span>{location.phone}</span>
                    </div>
                  )}
                  {location.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span>{location.email}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span>{staff?.filter(s => s.store_location_id === location.id).length || 0} staff members</span>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <Card className="p-12 text-center col-span-2">
              <MapPin className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Locations Yet</h3>
              <p className="text-muted-foreground mb-4">
                Add your first store location to start managing multiple stores
              </p>
              <Button onClick={() => setLocationDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Location
              </Button>
            </Card>
          )}
        </div>

        {/* Staff List */}
        {staff && staff.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Staff Members</h2>
            <Card className="p-6">
              <div className="space-y-3">
                {staff.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-semibold">{member.staff_name}</div>
                      <div className="text-sm text-muted-foreground">{member.staff_email}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{member.staff_role}</Badge>
                      <Badge variant={member.is_active ? 'default' : 'secondary'}>
                        {member.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default StoreLocations;
