import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserPlus, Shield, Trash2 } from 'lucide-react';

interface StaffMember {
  id: string;
  staff_name: string;
  staff_email: string;
  role: string;
  is_active: boolean;
  permissions: {
    can_void: boolean;
    can_refund: boolean;
    can_discount: boolean;
    can_manage_inventory: boolean;
  };
  last_login_at: string | null;
}

export default function StaffManagement() {
  const { toast } = useToast();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newStaff, setNewStaff] = useState({
    staff_name: '',
    staff_email: '',
    staff_phone: '',
    role: 'cashier',
    pin: ''
  });

  useEffect(() => {
    loadStaff();
  }, []);

  const loadStaff = async () => {
    try {
      const { data, error } = await supabase
        .from('store_staff' as any)
        .select('*')
        .order('created_at', { ascending: false }) as any;

      if (error) throw error;
      setStaff(data || []);
    } catch (error) {
      console.error('Failed to load staff:', error);
    } finally {
      setLoading(false);
    }
  };

  const addStaff = async () => {
    try {
      if (!newStaff.staff_name || !newStaff.role || !newStaff.pin) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields",
          variant: "destructive"
        });
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Hash PIN
      const pinHash = btoa(newStaff.pin); // Basic hashing, in production use proper hashing

      const { error } = await supabase
        .from('store_staff' as any)
        .insert({
          merchant_id: user.id,
          staff_name: newStaff.staff_name,
          staff_email: newStaff.staff_email,
          staff_phone: newStaff.staff_phone,
          role: newStaff.role,
          pin_hash: pinHash
        }) as any;

      if (error) throw error;

      toast({
        title: "Staff Added",
        description: `${newStaff.staff_name} has been added successfully`
      });

      setDialogOpen(false);
      setNewStaff({
        staff_name: '',
        staff_email: '',
        staff_phone: '',
        role: 'cashier',
        pin: ''
      });
      loadStaff();
    } catch (error) {
      console.error('Failed to add staff:', error);
      toast({
        title: "Error",
        description: "Failed to add staff member",
        variant: "destructive"
      });
    }
  };

  const toggleStaffStatus = async (staffId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('store_staff' as any)
        .update({ is_active: !currentStatus })
        .eq('id', staffId) as any;

      if (error) throw error;

      toast({
        title: "Status Updated",
        description: `Staff member ${!currentStatus ? 'activated' : 'deactivated'}`
      });

      loadStaff();
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'manager': return 'bg-purple-100 text-purple-800';
      case 'cashier': return 'bg-blue-100 text-blue-800';
      case 'sales_associate': return 'bg-green-100 text-green-800';
      case 'inventory_clerk': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="animate-pulse">Loading staff...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Store Staff</h3>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="w-4 h-4 mr-2" />
              Add Staff
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Staff Member</DialogTitle>
              <DialogDescription>
                Create a new staff account with role-based permissions
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={newStaff.staff_name}
                  onChange={(e) => setNewStaff({ ...newStaff, staff_name: e.target.value })}
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newStaff.staff_email}
                  onChange={(e) => setNewStaff({ ...newStaff, staff_email: e.target.value })}
                  placeholder="john@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={newStaff.staff_phone}
                  onChange={(e) => setNewStaff({ ...newStaff, staff_phone: e.target.value })}
                  placeholder="+1234567890"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role *</Label>
                <Select value={newStaff.role} onValueChange={(value) => setNewStaff({ ...newStaff, role: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cashier">Cashier</SelectItem>
                    <SelectItem value="sales_associate">Sales Associate</SelectItem>
                    <SelectItem value="inventory_clerk">Inventory Clerk</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="pin">4-Digit PIN *</Label>
                <Input
                  id="pin"
                  type="password"
                  maxLength={4}
                  value={newStaff.pin}
                  onChange={(e) => setNewStaff({ ...newStaff, pin: e.target.value.replace(/\D/g, '') })}
                  placeholder="1234"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={addStaff}>Add Staff</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {staff.length === 0 ? (
          <Card className="p-6 text-center text-muted-foreground">
            No staff members added yet
          </Card>
        ) : (
          staff.map((member) => (
            <Card key={member.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Shield className={`w-10 h-10 ${member.is_active ? 'text-green-600' : 'text-gray-400'}`} />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{member.staff_name}</p>
                      <span className={`px-2 py-1 rounded text-xs ${getRoleBadgeColor(member.role)}`}>
                        {member.role.replace('_', ' ')}
                      </span>
                    </div>
                    {member.staff_email && (
                      <p className="text-sm text-muted-foreground">{member.staff_email}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Last login: {member.last_login_at ? new Date(member.last_login_at).toLocaleString() : 'Never'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant={member.is_active ? "outline" : "default"}
                    onClick={() => toggleStaffStatus(member.id, member.is_active)}
                  >
                    {member.is_active ? 'Deactivate' : 'Activate'}
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
