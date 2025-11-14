import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Users, Plus, Shield, UserCog, Mail, Crown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUserRoles } from '@/hooks/useUserRoles';

export const OrganizationMembers = () => {
  const { toast } = useToast();
  const { roles, isAdmin } = useUserRoles();
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);

  const mockMembers = [
    { id: '1', name: 'John Doe', email: 'john@example.com', role: 'admin', status: 'active', joinedAt: '2024-01-15' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'manager', status: 'active', joinedAt: '2024-02-20' },
    { id: '3', name: 'Mike Johnson', email: 'mike@example.com', role: 'staff', status: 'active', joinedAt: '2024-03-10' },
  ];

  const rolePermissions = {
    admin: ['all_access', 'manage_users', 'manage_settings', 'view_reports', 'manage_inventory'],
    manager: ['manage_inventory', 'view_reports', 'manage_staff', 'process_orders'],
    staff: ['process_orders', 'view_inventory', 'customer_service'],
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Organization Members</h2>
          <p className="text-muted-foreground">Manage team members and their access permissions</p>
        </div>
        <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
          <DialogTrigger asChild>
            <Button disabled={!isAdmin}>
              <Plus className="w-4 h-4 mr-2" />
              Invite Member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite Team Member</DialogTitle>
              <DialogDescription>Send an invitation to join your organization</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Email Address</Label>
                <Input type="email" placeholder="colleague@example.com" />
              </div>
              <div>
                <Label>Assign Role</Label>
                <Select defaultValue="staff">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Custom Role Name (Optional)</Label>
                <Input placeholder="e.g., Senior Sales Associate" />
              </div>
              <Button className="w-full" onClick={() => {
                toast({ title: "Invitation Sent", description: "Team member invitation has been sent" });
                setInviteDialogOpen(false);
              }}>
                <Mail className="w-4 h-4 mr-2" />
                Send Invitation
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Members</p>
                <p className="text-2xl font-bold">{mockMembers.length}</p>
              </div>
              <Users className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Admins</p>
                <p className="text-2xl font-bold">1</p>
              </div>
              <Crown className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Managers</p>
                <p className="text-2xl font-bold">1</p>
              </div>
              <Shield className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Staff</p>
                <p className="text-2xl font-bold">1</p>
              </div>
              <UserCog className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="members" className="space-y-6">
        <TabsList>
          <TabsTrigger value="members">Team Members</TabsTrigger>
          <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
          <TabsTrigger value="custom">Custom Roles</TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Members</CardTitle>
              <CardDescription>Manage your team members and their roles</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockMembers.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium">{member.name}</p>
                      <p className="text-sm text-muted-foreground">{member.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <Badge variant={member.role === 'admin' ? 'default' : 'secondary'}>
                        {member.role}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        Joined {new Date(member.joinedAt).toLocaleDateString()}
                      </p>
                    </div>
                    {isAdmin && (
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Role Permissions</CardTitle>
              <CardDescription>Default permissions for each role</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {Object.entries(rolePermissions).map(([role, permissions]) => (
                <div key={role} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      <h3 className="font-semibold capitalize">{role}</h3>
                    </div>
                    {isAdmin && (
                      <Button variant="ghost" size="sm">Edit</Button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {permissions.map((permission) => (
                      <div key={permission} className="flex items-center gap-2">
                        <Checkbox checked disabled />
                        <span className="text-sm">{permission.replace(/_/g, ' ')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="custom" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Custom Roles</CardTitle>
                  <CardDescription>Create specialized roles with custom permissions</CardDescription>
                </div>
                <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
                  <DialogTrigger asChild>
                    <Button disabled={!isAdmin}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Role
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Create Custom Role</DialogTitle>
                      <DialogDescription>Define a new role with specific permissions</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Role Name</Label>
                        <Input placeholder="e.g., Senior Sales Lead" />
                      </div>
                      <div>
                        <Label>Base Role Template</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Start from existing role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="manager">Manager</SelectItem>
                            <SelectItem value="staff">Staff</SelectItem>
                            <SelectItem value="none">None (Start from scratch)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Permissions</Label>
                        <div className="border rounded-lg p-4 space-y-2">
                          {['Manage Inventory', 'Process Orders', 'View Reports', 'Manage Staff', 'Customer Service'].map((perm) => (
                            <div key={perm} className="flex items-center gap-2">
                              <Checkbox />
                              <span className="text-sm">{perm}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <Button className="w-full" onClick={() => {
                        toast({ title: "Role Created", description: "Custom role has been created successfully" });
                        setRoleDialogOpen(false);
                      }}>
                        Create Custom Role
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center py-8">
                No custom roles created yet. Create one to get started.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
