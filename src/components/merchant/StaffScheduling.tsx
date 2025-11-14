import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar as CalendarIcon, Plus, Users, Clock, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const StaffScheduling = () => {
  const { toast } = useToast();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);

  const mockStaff = [
    { id: '1', name: 'Sarah Johnson', role: 'Manager', status: 'on-duty' },
    { id: '2', name: 'Mike Chen', role: 'Sales Associate', status: 'on-duty' },
    { id: '3', name: 'Emma Davis', role: 'Sales Associate', status: 'off-duty' },
    { id: '4', name: 'James Wilson', role: 'Cashier', status: 'on-break' },
  ];

  const todaySchedule = [
    { staff: 'Sarah Johnson', shift: '9:00 AM - 5:00 PM', role: 'Manager', location: 'Main Store' },
    { staff: 'Mike Chen', shift: '10:00 AM - 6:00 PM', role: 'Sales', location: 'Main Store' },
    { staff: 'Emma Davis', shift: '2:00 PM - 10:00 PM', role: 'Sales', location: 'Downtown' },
    { staff: 'James Wilson', shift: '9:00 AM - 5:00 PM', role: 'Cashier', location: 'Main Store' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Staff Scheduling</h2>
          <p className="text-muted-foreground">Manage employee schedules and shifts</p>
        </div>
        <Dialog open={scheduleDialogOpen} onOpenChange={setScheduleDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Shift
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Schedule New Shift</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Select Staff Member</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockStaff.map((staff) => (
                      <SelectItem key={staff.id} value={staff.id}>
                        {staff.name} - {staff.role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start Time</Label>
                  <Input type="time" defaultValue="09:00" />
                </div>
                <div>
                  <Label>End Time</Label>
                  <Input type="time" defaultValue="17:00" />
                </div>
              </div>
              <div>
                <Label>Location</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="main">Main Store</SelectItem>
                    <SelectItem value="downtown">Downtown Branch</SelectItem>
                    <SelectItem value="mall">Mall Location</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Role for This Shift</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="sales">Sales Associate</SelectItem>
                    <SelectItem value="cashier">Cashier</SelectItem>
                    <SelectItem value="stock">Stock Associate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full" onClick={() => {
                toast({ title: "Shift Scheduled", description: "Employee shift has been added" });
                setScheduleDialogOpen(false);
              }}>
                Schedule Shift
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
                <p className="text-sm text-muted-foreground">On Duty</p>
                <p className="text-2xl font-bold">6</p>
              </div>
              <Users className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Off Duty</p>
                <p className="text-2xl font-bold">8</p>
              </div>
              <Users className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">This Week</p>
                <p className="text-2xl font-bold">240h</p>
              </div>
              <Clock className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Locations</p>
                <p className="text-2xl font-bold">3</p>
              </div>
              <MapPin className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="calendar" className="space-y-6">
        <TabsList>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="today">Today's Schedule</TabsTrigger>
          <TabsTrigger value="staff">Staff List</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Select Date</CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="rounded-md border"
                />
              </CardContent>
            </Card>
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Schedule for {date?.toLocaleDateString()}</CardTitle>
                <CardDescription>View and manage shifts for selected date</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {todaySchedule.map((shift, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{shift.staff}</p>
                      <p className="text-sm text-muted-foreground">{shift.role}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{shift.shift}</p>
                      <Badge variant="outline">{shift.location}</Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="today" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Today's Shifts</CardTitle>
              <CardDescription>Currently scheduled employees</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {todaySchedule.map((shift, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium">{shift.staff}</p>
                      <p className="text-sm text-muted-foreground">{shift.role} • {shift.location}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{shift.shift}</p>
                    <Badge>Active</Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="staff" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Staff Members</CardTitle>
              <CardDescription>View team members and their current status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockStaff.map((staff) => (
                <div key={staff.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium">{staff.name}</p>
                      <p className="text-sm text-muted-foreground">{staff.role}</p>
                    </div>
                  </div>
                  <Badge 
                    variant={staff.status === 'on-duty' ? 'default' : staff.status === 'on-break' ? 'secondary' : 'outline'}
                  >
                    {staff.status}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
