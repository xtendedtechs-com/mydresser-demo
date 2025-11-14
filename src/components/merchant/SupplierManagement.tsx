import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Truck, Plus, Star, Package, DollarSign, Clock, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const SupplierManagement = () => {
  const { toast } = useToast();
  const [supplierDialogOpen, setSupplierDialogOpen] = useState(false);
  const [poDialogOpen, setPoDialogOpen] = useState(false);

  const mockSuppliers = [
    { id: '1', name: 'Fashion Wholesale Co.', rating: 4.8, leadTime: 7, orders: 45, status: 'active' },
    { id: '2', name: 'Global Textiles Ltd.', rating: 4.5, leadTime: 14, orders: 32, status: 'active' },
    { id: '3', name: 'Premium Fabrics Inc.', rating: 4.9, leadTime: 5, orders: 28, status: 'active' },
    { id: '4', name: 'Eco Materials Group', rating: 4.6, leadTime: 10, orders: 19, status: 'active' },
  ];

  const mockPOs = [
    { id: 'PO-2024-001', supplier: 'Fashion Wholesale Co.', date: '2024-01-15', total: 5420, status: 'pending' },
    { id: 'PO-2024-002', supplier: 'Global Textiles Ltd.', date: '2024-01-18', total: 8950, status: 'delivered' },
    { id: 'PO-2024-003', supplier: 'Premium Fabrics Inc.', date: '2024-01-20', total: 3200, status: 'in-transit' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Supplier Management</h2>
          <p className="text-muted-foreground">Manage suppliers and purchase orders</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={supplierDialogOpen} onOpenChange={setSupplierDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add Supplier
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Supplier</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Supplier Name</Label>
                  <Input placeholder="Company name" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Contact Person</Label>
                    <Input placeholder="Name" />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input type="email" placeholder="email@company.com" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Phone</Label>
                    <Input placeholder="+1 (555) 000-0000" />
                  </div>
                  <div>
                    <Label>Lead Time (days)</Label>
                    <Input type="number" placeholder="7" />
                  </div>
                </div>
                <div>
                  <Label>Payment Terms</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select terms" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="net30">Net 30</SelectItem>
                      <SelectItem value="net60">Net 60</SelectItem>
                      <SelectItem value="advance">Advance Payment</SelectItem>
                      <SelectItem value="cod">Cash on Delivery</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full" onClick={() => {
                  toast({ title: "Supplier Added", description: "New supplier has been added to your list" });
                  setSupplierDialogOpen(false);
                }}>
                  Add Supplier
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={poDialogOpen} onOpenChange={setPoDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create PO
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Create Purchase Order</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Select Supplier</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose supplier" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockSuppliers.map((supplier) => (
                        <SelectItem key={supplier.id} value={supplier.id}>
                          {supplier.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Order Date</Label>
                    <Input type="date" />
                  </div>
                  <div>
                    <Label>Expected Delivery</Label>
                    <Input type="date" />
                  </div>
                </div>
                <div>
                  <Label>Items</Label>
                  <div className="border rounded-lg p-4 space-y-2">
                    <p className="text-sm text-muted-foreground">Add items to this purchase order</p>
                    <Button variant="outline" size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Item
                    </Button>
                  </div>
                </div>
                <Button className="w-full" onClick={() => {
                  toast({ title: "PO Created", description: "Purchase order has been created" });
                  setPoDialogOpen(false);
                }}>
                  Create Purchase Order
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Suppliers</p>
                <p className="text-2xl font-bold">{mockSuppliers.length}</p>
              </div>
              <Truck className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Open POs</p>
                <p className="text-2xl font-bold">8</p>
              </div>
              <Package className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Monthly Spend</p>
                <p className="text-2xl font-bold">$24.5K</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Lead Time</p>
                <p className="text-2xl font-bold">9 days</p>
              </div>
              <Clock className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="suppliers" className="space-y-6">
        <TabsList>
          <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
          <TabsTrigger value="purchase-orders">Purchase Orders</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="suppliers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Supplier Directory</CardTitle>
              <CardDescription>Your active supplier relationships</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockSuppliers.map((supplier) => (
                <div key={supplier.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">{supplier.name}</p>
                    <div className="flex items-center gap-4 mt-1">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm">{supplier.rating}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{supplier.leadTime} days lead time</span>
                      <span className="text-sm text-muted-foreground">{supplier.orders} orders</span>
                    </div>
                  </div>
                  <Badge>{supplier.status}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="purchase-orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Purchase Orders</CardTitle>
              <CardDescription>Track your purchase orders and deliveries</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockPOs.map((po) => (
                <div key={po.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">{po.id}</p>
                    <p className="text-sm text-muted-foreground">{po.supplier} • {po.date}</p>
                  </div>
                  <div className="text-right flex items-center gap-3">
                    <div>
                      <p className="font-medium">${po.total.toLocaleString()}</p>
                      <Badge variant={
                        po.status === 'delivered' ? 'default' :
                        po.status === 'in-transit' ? 'secondary' : 'outline'
                      }>
                        {po.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Supplier Performance Metrics</CardTitle>
              <CardDescription>Analyze supplier reliability and quality</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockSuppliers.map((supplier) => (
                <div key={supplier.id} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{supplier.name}</p>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{supplier.rating}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">On-Time Delivery</p>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3 text-green-600" />
                        <span className="font-medium">94%</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Quality Score</p>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3 text-green-600" />
                        <span className="font-medium">4.8/5</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total Orders</p>
                      <span className="font-medium">{supplier.orders}</span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
