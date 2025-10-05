import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { 
  Store, 
  Monitor, 
  Users, 
  TrendingUp, 
  Activity,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';

interface POSTerminal {
  id: string;
  terminal_name: string;
  terminal_code: string;
  is_active: boolean;
  last_sync_at: string | null;
  store_location_id: string;
  security_level: string;
}

interface StoreAnalytics {
  date: string;
  total_transactions: number;
  total_revenue: number;
  average_transaction_value: number;
  conversion_rate: number;
}

export default function POSDashboard() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [terminals, setTerminals] = useState<POSTerminal[]>([]);
  const [analytics, setAnalytics] = useState<StoreAnalytics | null>(null);
  const [syncing, setSyncing] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load POS terminals
      const { data: terminalsData, error: terminalsError } = await supabase
        .from('pos_terminals' as any)
        .select('*')
        .order('created_at', { ascending: false }) as any;

      if (terminalsError) throw terminalsError;
      setTerminals(terminalsData || []);

      // Load today's analytics
      const { data: analyticsData, error: analyticsError } = await supabase
        .from('store_analytics' as any)
        .select('*')
        .eq('date', new Date().toISOString().split('T')[0])
        .single() as any;

      if (!analyticsError && analyticsData) {
        setAnalytics(analyticsData);
      }
    } catch (error) {
      console.error('Failed to load POS dashboard:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const syncInventory = async (terminalId: string) => {
    try {
      setSyncing(terminalId);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .rpc('sync_store_inventory' as any, {
          p_merchant_id: user.id,
          p_terminal_id: terminalId,
          p_sync_type: 'incremental'
        }) as any;

      if (error) throw error;

      toast({
        title: "Sync Complete",
        description: `Synced ${data.items_synced} items in ${data.duration_ms}ms`
      });

      await loadDashboardData();
    } catch (error) {
      console.error('Sync failed:', error);
      toast({
        title: "Sync Failed",
        description: "Failed to sync inventory",
        variant: "destructive"
      });
    } finally {
      setSyncing(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Store className="w-8 h-8" />
              POS Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your physical store operations
            </p>
          </div>
          <Button onClick={loadDashboardData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Analytics Cards */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <Activity className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Today's Transactions</p>
                  <p className="text-2xl font-bold">{analytics.total_transactions}</p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Today's Revenue</p>
                  <p className="text-2xl font-bold">${analytics.total_revenue.toFixed(2)}</p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3">
                <Monitor className="w-8 h-8 text-purple-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Avg Transaction</p>
                  <p className="text-2xl font-bold">${analytics.average_transaction_value.toFixed(2)}</p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-orange-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Conversion Rate</p>
                  <p className="text-2xl font-bold">{analytics.conversion_rate}%</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Tabs */}
        <Tabs defaultValue="terminals" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="terminals">POS Terminals</TabsTrigger>
            <TabsTrigger value="staff">Staff Management</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="terminals" className="space-y-4">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Active POS Terminals</h3>
              <div className="space-y-4">
                {terminals.length === 0 ? (
                  <p className="text-muted-foreground">No POS terminals configured</p>
                ) : (
                  terminals.map((terminal) => (
                    <Card key={terminal.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Monitor className={`w-8 h-8 ${terminal.is_active ? 'text-green-600' : 'text-gray-400'}`} />
                          <div>
                            <p className="font-semibold">{terminal.terminal_name}</p>
                            <p className="text-sm text-muted-foreground">Code: {terminal.terminal_code}</p>
                            <p className="text-xs text-muted-foreground">
                              Last sync: {terminal.last_sync_at ? new Date(terminal.last_sync_at).toLocaleString() : 'Never'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded text-xs ${
                            terminal.security_level === 'maximum' ? 'bg-green-100 text-green-800' :
                            terminal.security_level === 'enhanced' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {terminal.security_level}
                          </span>
                          <Button
                            size="sm"
                            onClick={() => syncInventory(terminal.id)}
                            disabled={syncing === terminal.id || !terminal.is_active}
                          >
                            {syncing === terminal.id ? (
                              <>
                                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                Syncing...
                              </>
                            ) : (
                              <>
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Sync
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="staff">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Store Staff</h3>
              <p className="text-muted-foreground">Staff management interface will be displayed here</p>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Store Performance</h3>
              <p className="text-muted-foreground">Detailed analytics will be displayed here</p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
