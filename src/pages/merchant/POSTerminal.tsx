import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { usePOSTerminal } from '@/hooks/usePOSTerminal';
import { useStoreLocations } from '@/hooks/useStoreLocations';
import { Monitor, DollarSign, Receipt, RefreshCw, Plus, Settings } from 'lucide-react';
import { format } from 'date-fns';

const POSTerminal = () => {
  const { terminals, transactions, isLoading, createTerminal, syncInventory, isSyncing } = usePOSTerminal();
  const { locations } = useStoreLocations();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newTerminal, setNewTerminal] = useState({
    store_location_id: '',
    terminal_name: '',
    device_id: '',
  });

  const handleCreateTerminal = () => {
    createTerminal(newTerminal);
    setCreateDialogOpen(false);
    setNewTerminal({ store_location_id: '', terminal_name: '', device_id: '' });
  };

  if (isLoading) {
    return <div className="p-8">Loading POS system...</div>;
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container max-w-7xl mx-auto p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">POS Terminal</h1>
            <p className="text-muted-foreground">Manage your point-of-sale terminals and transactions</p>
          </div>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Terminal
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New POS Terminal</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Terminal Name</Label>
                  <Input
                    placeholder="Main Counter Terminal"
                    value={newTerminal.terminal_name}
                    onChange={(e) => setNewTerminal({ ...newTerminal, terminal_name: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Device ID</Label>
                  <Input
                    placeholder="DEVICE-001"
                    value={newTerminal.device_id}
                    onChange={(e) => setNewTerminal({ ...newTerminal, device_id: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Store Location</Label>
                  <select
                    className="w-full border rounded-md p-2"
                    value={newTerminal.store_location_id}
                    onChange={(e) => setNewTerminal({ ...newTerminal, store_location_id: e.target.value })}
                  >
                    <option value="">Select location</option>
                    {locations?.map((location) => (
                      <option key={location.id} value={location.id}>
                        {location.location_name}
                      </option>
                    ))}
                  </select>
                </div>
                <Button className="w-full" onClick={handleCreateTerminal}>
                  Create Terminal
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="terminals" className="space-y-6">
          <TabsList>
            <TabsTrigger value="terminals">Terminals</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="terminals" className="space-y-4">
            {terminals && terminals.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {terminals.map((terminal) => (
                  <Card key={terminal.id} className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Monitor className="w-8 h-8 text-primary" />
                        <div>
                          <h3 className="font-semibold">{terminal.terminal_name}</h3>
                          <p className="text-sm text-muted-foreground">{terminal.terminal_code}</p>
                        </div>
                      </div>
                      <Badge variant={terminal.is_active ? 'default' : 'secondary'}>
                        {terminal.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <div className="space-y-2 mb-4">
                      <div className="text-sm">
                        <span className="text-muted-foreground">Device: </span>
                        {terminal.device_id}
                      </div>
                      {terminal.last_sync_at && (
                        <div className="text-sm">
                          <span className="text-muted-foreground">Last Sync: </span>
                          {format(new Date(terminal.last_sync_at), 'MMM dd, h:mm a')}
                        </div>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => syncInventory(terminal.id)}
                      disabled={isSyncing}
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Sync Inventory
                    </Button>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <Monitor className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No Terminals Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first POS terminal to start processing transactions
                </p>
                <Button onClick={() => setCreateDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Terminal
                </Button>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="transactions" className="space-y-4">
            {transactions && transactions.length > 0 ? (
              <div className="space-y-3">
                {transactions.map((transaction) => (
                  <Card key={transaction.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary/10 rounded-full">
                          <DollarSign className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-semibold">{transaction.receipt_number}</div>
                          <div className="text-sm text-muted-foreground">
                            {format(new Date(transaction.created_at), 'MMM dd, yyyy • h:mm a')}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold">${transaction.amount.toFixed(2)}</div>
                        <Badge variant="secondary">{transaction.payment_method}</Badge>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <Receipt className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No Transactions Yet</h3>
                <p className="text-muted-foreground">
                  Transactions will appear here once you start processing sales
                </p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="settings">
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Settings className="w-5 h-5" />
                <h3 className="text-lg font-semibold">POS Settings</h3>
              </div>
              <p className="text-muted-foreground">
                Configure your POS system settings, payment methods, and security options
              </p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default POSTerminal;
