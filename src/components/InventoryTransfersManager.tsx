import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  ArrowRight, 
  Plus, 
  Check, 
  X, 
  Clock,
  Package,
  MapPin,
  TrendingUp
} from 'lucide-react';
import { useInventoryTransfers } from '@/hooks/useInventoryTransfers';
import { useStoreLocations } from '@/hooks/useStoreLocations';
import { useMerchantItems } from '@/hooks/useMerchantItems';
import { useToast } from '@/hooks/use-toast';

const InventoryTransfersManager = () => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [formData, setFormData] = useState({
    merchant_item_id: '',
    from_location_id: '',
    to_location_id: '',
    quantity: '1',
    notes: ''
  });

  const { transfers, loading, createTransfer, updateTransferStatus } = useInventoryTransfers();
  const { locations } = useStoreLocations();
  const { items } = useMerchantItems();
  const { toast } = useToast();

  const handleCreateTransfer = async () => {
    if (!formData.merchant_item_id || !formData.from_location_id || !formData.to_location_id) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    if (formData.from_location_id === formData.to_location_id) {
      toast({
        title: "Invalid Transfer",
        description: "Source and destination must be different",
        variant: "destructive"
      });
      return;
    }

    const success = await createTransfer({
      merchant_item_id: formData.merchant_item_id,
      from_location_id: formData.from_location_id,
      to_location_id: formData.to_location_id,
      quantity: parseInt(formData.quantity),
      notes: formData.notes || undefined
    });

    if (success) {
      setShowCreateDialog(false);
      setFormData({
        merchant_item_id: '',
        from_location_id: '',
        to_location_id: '',
        quantity: '1',
        notes: ''
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'approved': return 'bg-blue-500';
      case 'pending': return 'bg-yellow-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <Check className="w-4 h-4" />;
      case 'cancelled': return <X className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  // Stats
  const pendingTransfers = transfers.filter(t => t.transfer_status === 'pending').length;
  const completedToday = transfers.filter(t => 
    t.transfer_status === 'completed' && 
    new Date(t.completed_at || '').toDateString() === new Date().toDateString()
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Inventory Transfers</h2>
          <p className="text-muted-foreground">
            Manage inventory transfers between locations
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Transfer
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{pendingTransfers}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed Today</p>
                <p className="text-2xl font-bold">{completedToday}</p>
              </div>
              <Check className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Transfers</p>
                <p className="text-2xl font-bold">{transfers.length}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transfers List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transfers</CardTitle>
          <CardDescription>View and manage inventory transfers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead>To</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Loading transfers...
                    </TableCell>
                  </TableRow>
                ) : transfers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      No transfers found
                    </TableCell>
                  </TableRow>
                ) : (
                  transfers.map((transfer) => {
                    const item = items.find(i => i.id === transfer.merchant_item_id);
                    const fromLocation = locations.find(l => l.id === transfer.from_location_id);
                    const toLocation = locations.find(l => l.id === transfer.to_location_id);

                    return (
                      <TableRow key={transfer.id}>
                        <TableCell className="font-medium">
                          {item?.name || 'Unknown Item'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-muted-foreground" />
                            {fromLocation?.location_name || 'Unknown'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <ArrowRight className="w-4 h-4" />
                            <MapPin className="w-4 h-4 text-muted-foreground" />
                            {toLocation?.location_name || 'Unknown'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {transfer.quantity}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(transfer.transfer_status)}>
                            <span className="flex items-center gap-1">
                              {getStatusIcon(transfer.transfer_status)}
                              {transfer.transfer_status}
                            </span>
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(transfer.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {transfer.transfer_status === 'pending' && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => updateTransferStatus(transfer.id, 'in_transit')}
                                >
                                  Start Transfer
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => updateTransferStatus(transfer.id, 'cancelled')}
                                >
                                  Cancel
                                </Button>
                              </>
                            )}
                            {transfer.transfer_status === 'in_transit' && (
                              <Button
                                size="sm"
                                onClick={() => updateTransferStatus(transfer.id, 'completed')}
                              >
                                Complete
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Create Transfer Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Transfer</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Item *</Label>
              <Select value={formData.merchant_item_id} onValueChange={(value) => setFormData({...formData, merchant_item_id: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select item" />
                </SelectTrigger>
                <SelectContent>
                  {items.map(item => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>From Location *</Label>
              <Select value={formData.from_location_id} onValueChange={(value) => setFormData({...formData, from_location_id: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select source" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map(location => (
                    <SelectItem key={location.id} value={location.id}>
                      {location.location_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>To Location *</Label>
              <Select value={formData.to_location_id} onValueChange={(value) => setFormData({...formData, to_location_id: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select destination" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map(location => (
                    <SelectItem key={location.id} value={location.id}>
                      {location.location_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Quantity *</Label>
              <Input
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => setFormData({...formData, quantity: e.target.value})}
              />
            </div>

            <div>
              <Label>Notes</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                placeholder="Optional notes about this transfer..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateTransfer}>
              Create Transfer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InventoryTransfersManager;