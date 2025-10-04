import { useState } from 'react';
import { Users, Plus, Edit, Trash2, MapPin, Mail, Phone, DollarSign } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useMerchantEmployees } from '@/hooks/useMerchantEmployees';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export const EmployeeManagement = () => {
  const { employees, loading, addEmployee, updateEmployee, deleteEmployee } = useMerchantEmployees();
  const { locations } = useStoreLocations();
  const [isAddingEmployee, setIsAddingEmployee] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    employee_name: '',
    employee_email: '',
    employee_phone: '',
    position: '',
    location_id: '',
    hourly_rate: '',
    hire_date: '',
    permissions: {
      can_process_sales: true,
      can_manage_inventory: false,
      can_view_reports: false,
    },
  });

  const handleAddEmployee = async () => {
    if (!newEmployee.employee_name || !newEmployee.employee_email || !newEmployee.position) {
      return;
    }

    try {
      await addEmployee({
        ...newEmployee,
        hourly_rate: newEmployee.hourly_rate ? parseFloat(newEmployee.hourly_rate) : null,
        location_id: newEmployee.location_id || null,
      });

      setNewEmployee({
        employee_name: '',
        employee_email: '',
        employee_phone: '',
        position: '',
        location_id: '',
        hourly_rate: '',
        hire_date: '',
        permissions: {
          can_process_sales: true,
          can_manage_inventory: false,
          can_view_reports: false,
        },
      });
      setIsAddingEmployee(false);
    } catch (error) {
      // Error handled by hook
    }
  };

  const getLocationName = (locationId: string | null) => {
    if (!locationId) return 'No location assigned';
    return locations.find(loc => loc.id === locationId)?.location_name || 'Unknown location';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-full" />
        <div className="grid grid-cols-3 gap-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Employee Management</h2>
          <p className="text-muted-foreground">
            Manage your team and assign permissions
          </p>
        </div>

        <Dialog open={isAddingEmployee} onOpenChange={setIsAddingEmployee}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Employee
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Employee</DialogTitle>
              <DialogDescription>
                Add a new team member and assign their role and permissions
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., John Doe"
                  value={newEmployee.employee_name}
                  onChange={(e) => setNewEmployee({ ...newEmployee, employee_name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="e.g., john@example.com"
                  value={newEmployee.employee_email}
                  onChange={(e) => setNewEmployee({ ...newEmployee, employee_email: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  placeholder="e.g., +1 234 567 8900"
                  value={newEmployee.employee_phone}
                  onChange={(e) => setNewEmployee({ ...newEmployee, employee_phone: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="position">Position *</Label>
                <Input
                  id="position"
                  placeholder="e.g., Sales Associate"
                  value={newEmployee.position}
                  onChange={(e) => setNewEmployee({ ...newEmployee, position: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Assigned Location</Label>
                <Select
                  value={newEmployee.location_id}
                  onValueChange={(value) => setNewEmployee({ ...newEmployee, location_id: value })}
                >
                  <SelectTrigger id="location">
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No specific location</SelectItem>
                    {locations.map((location) => (
                      <SelectItem key={location.id} value={location.id}>
                        {location.location_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hourly-rate">Hourly Rate ($)</Label>
                  <Input
                    id="hourly-rate"
                    type="number"
                    step="0.01"
                    placeholder="e.g., 15.00"
                    value={newEmployee.hourly_rate}
                    onChange={(e) => setNewEmployee({ ...newEmployee, hourly_rate: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hire-date">Hire Date</Label>
                  <Input
                    id="hire-date"
                    type="date"
                    value={newEmployee.hire_date}
                    onChange={(e) => setNewEmployee({ ...newEmployee, hire_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label>Permissions</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="sales"
                      checked={newEmployee.permissions.can_process_sales}
                      onCheckedChange={(checked) =>
                        setNewEmployee({
                          ...newEmployee,
                          permissions: { ...newEmployee.permissions, can_process_sales: !!checked },
                        })
                      }
                    />
                    <label htmlFor="sales" className="text-sm cursor-pointer">
                      Can process sales
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="inventory"
                      checked={newEmployee.permissions.can_manage_inventory}
                      onCheckedChange={(checked) =>
                        setNewEmployee({
                          ...newEmployee,
                          permissions: { ...newEmployee.permissions, can_manage_inventory: !!checked },
                        })
                      }
                    />
                    <label htmlFor="inventory" className="text-sm cursor-pointer">
                      Can manage inventory
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="reports"
                      checked={newEmployee.permissions.can_view_reports}
                      onCheckedChange={(checked) =>
                        setNewEmployee({
                          ...newEmployee,
                          permissions: { ...newEmployee.permissions, can_view_reports: !!checked },
                        })
                      }
                    />
                    <label htmlFor="reports" className="text-sm cursor-pointer">
                      Can view reports
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddingEmployee(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddEmployee}>Add Employee</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              Total Employees
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">{employees.length}</span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4 text-green-600" />
              Active
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold text-green-600">
              {employees.filter(e => e.is_active).length}
            </span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Assigned Locations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">
              {new Set(employees.map(e => e.location_id).filter(Boolean)).size}
            </span>
          </CardContent>
        </Card>
      </div>

      {/* Employee List */}
      <div className="space-y-4">
        {employees.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-2">No employees yet</p>
              <p className="text-muted-foreground mb-4">
                Start building your team by adding employees
              </p>
              <Button onClick={() => setIsAddingEmployee(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add First Employee
              </Button>
            </CardContent>
          </Card>
        ) : (
          employees.map((employee) => (
            <Card key={employee.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-primary/10 rounded-full">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{employee.employee_name}</CardTitle>
                      <CardDescription className="mt-1">
                        {employee.position}
                      </CardDescription>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant={employee.is_active ? 'default' : 'secondary'}>
                          {employee.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                        <Badge variant="outline">
                          {getLocationName(employee.location_id)}
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
                      onClick={() => deleteEmployee(employee.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{employee.employee_email}</span>
                  </div>
                  {employee.employee_phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{employee.employee_phone}</span>
                    </div>
                  )}
                  {employee.hourly_rate && (
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span>${employee.hourly_rate}/hr</span>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-1">
                    {employee.permissions?.can_process_sales && (
                      <Badge variant="outline" className="text-xs">Sales</Badge>
                    )}
                    {employee.permissions?.can_manage_inventory && (
                      <Badge variant="outline" className="text-xs">Inventory</Badge>
                    )}
                    {employee.permissions?.can_view_reports && (
                      <Badge variant="outline" className="text-xs">Reports</Badge>
                    )}
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
