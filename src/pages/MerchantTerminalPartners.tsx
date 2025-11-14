import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { AutoReorderSystem } from '@/components/merchant/AutoReorderSystem';
import { 
  Handshake, Plus, TrendingUp, Package, 
  Search, Filter, Send, FileText, CheckCircle, Clock, RefreshCw
} from 'lucide-react';

const MerchantTerminalPartners = () => {
  const { toast } = useToast();
  const [partnerDialogOpen, setPartnerDialogOpen] = useState(false);
  const [bulkOrderDialogOpen, setBulkOrderDialogOpen] = useState(false);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Brand Partnerships</h1>
          <p className="text-muted-foreground">Manage collaborations and bulk orders</p>
        </div>
        <Dialog open={partnerDialogOpen} onOpenChange={setPartnerDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Partnership
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Partnership Request</DialogTitle>
              <DialogDescription>
                Submit a partnership proposal to collaborate with brands
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Brand Name</label>
                <Input placeholder="Enter brand name" />
              </div>
              <div>
                <label className="text-sm font-medium">Partnership Type</label>
                <Select defaultValue="wholesale">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="wholesale">Wholesale</SelectItem>
                    <SelectItem value="consignment">Consignment</SelectItem>
                    <SelectItem value="exclusive">Exclusive Distribution</SelectItem>
                    <SelectItem value="collaboration">Brand Collaboration</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Proposal Details</label>
                <Textarea placeholder="Describe your partnership proposal..." rows={4} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setPartnerDialogOpen(false)}>Cancel</Button>
              <Button onClick={() => {
                toast({ title: "Proposal Submitted", description: "Your partnership request has been sent" });
                setPartnerDialogOpen(false);
              }}>
                <Send className="w-4 h-4 mr-2" />
                Submit Proposal
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="active" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 max-w-2xl">
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Orders</TabsTrigger>
          <TabsTrigger value="auto-reorder" className="gap-2">
            <RefreshCw className="h-3 w-3" />
            Auto-Reorder
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <Handshake className="w-8 h-8 text-green-600 mb-2" />
                <p className="text-sm font-medium text-muted-foreground">Active Partnerships</p>
                <p className="text-2xl font-bold">0</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <TrendingUp className="w-8 h-8 text-blue-600 mb-2" />
                <p className="text-sm font-medium text-muted-foreground">Partnership Revenue</p>
                <p className="text-2xl font-bold">$0.00</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <Package className="w-8 h-8 text-purple-600 mb-2" />
                <p className="text-sm font-medium text-muted-foreground">Products Sourced</p>
                <p className="text-2xl font-bold">0</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Active Partnerships</CardTitle>
              <CardDescription>Your current brand collaborations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <Handshake className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No active partnerships yet</p>
                <p className="text-sm mt-2">Create a partnership request to start collaborating with brands</p>
                <Button className="mt-4" onClick={() => setPartnerDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Partnership
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pending Requests</CardTitle>
              <CardDescription>Partnership proposals awaiting review</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No pending partnership requests</p>
                <p className="text-sm mt-2">Your submitted proposals will appear here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bulk" className="space-y-6">
          <div className="flex justify-end mb-4">
            <Dialog open={bulkOrderDialogOpen} onOpenChange={setBulkOrderDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  New Bulk Order
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Bulk Order</DialogTitle>
                  <DialogDescription>
                    Place a large quantity order from a brand partner
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Partner Brand</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select brand" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No partners available</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Product Category</label>
                    <Input placeholder="e.g., T-shirts, Jeans" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Quantity</label>
                    <Input type="number" placeholder="Minimum order quantity" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Additional Notes</label>
                    <Textarea placeholder="Special requirements, sizes, colors..." rows={3} />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setBulkOrderDialogOpen(false)}>Cancel</Button>
                  <Button onClick={() => {
                    toast({ title: "Order Submitted", description: "Your bulk order request has been sent" });
                    setBulkOrderDialogOpen(false);
                  }}>
                    Submit Order
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Bulk Orders</CardTitle>
              <CardDescription>Large quantity orders from brand partners</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No bulk orders yet</p>
                <p className="text-sm mt-2">Place bulk orders to stock your inventory with partner brands</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="auto-reorder">
          <AutoReorderSystem />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MerchantTerminalPartners;
