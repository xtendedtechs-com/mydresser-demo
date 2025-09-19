import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Database, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  Users, 
  ShoppingBag, 
  Shirt,
  TrendingUp,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from '@/hooks/useProfile';
import { useToast } from '@/hooks/use-toast';

interface DataConnection {
  name: string;
  status: 'connected' | 'disconnected' | 'error' | 'loading';
  description: string;
  icon: any;
  count?: number;
  lastSync?: string;
  error?: string;
}

const RealDataConnector = () => {
  const { user } = useProfile();
  const { toast } = useToast();
  const [connections, setConnections] = useState<DataConnection[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (user) {
      checkDataConnections();
    }
  }, [user]);

  const checkDataConnections = async () => {
    setLoading(true);
    const newConnections: DataConnection[] = [];

    try {
      // Check Profile Data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      newConnections.push({
        name: 'User Profile',
        status: profileError ? 'error' : 'connected',
        description: 'Personal profile information',
        icon: Users,
        error: profileError?.message,
        lastSync: profileData?.updated_at ? new Date(profileData.updated_at).toLocaleDateString() : undefined
      });

      // Check Wardrobe Data
      const { data: wardrobeData, error: wardrobeError } = await supabase
        .from('wardrobe_items')
        .select('id, created_at')
        .eq('user_id', user?.id);

      newConnections.push({
        name: 'Wardrobe Items',
        status: wardrobeError ? 'error' : 'connected',
        description: 'Your clothing items and accessories',
        icon: Shirt,
        count: wardrobeData?.length || 0,
        error: wardrobeError?.message,
        lastSync: wardrobeData?.[0]?.created_at ? new Date(wardrobeData[0].created_at).toLocaleDateString() : undefined
      });

      // Check Outfits Data
      const { data: outfitsData, error: outfitsError } = await supabase
        .from('outfits')
        .select('id, created_at')
        .eq('user_id', user?.id);

      newConnections.push({
        name: 'Saved Outfits',
        status: outfitsError ? 'error' : 'connected',
        description: 'Your outfit combinations',
        icon: Calendar,
        count: outfitsData?.length || 0,
        error: outfitsError?.message,
        lastSync: outfitsData?.[0]?.created_at ? new Date(outfitsData[0].created_at).toLocaleDateString() : undefined
      });

      // Check User Preferences
      const { data: preferencesData, error: preferencesError } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      newConnections.push({
        name: 'User Preferences',
        status: preferencesError ? 'error' : 'connected',
        description: 'Your app settings and preferences',
        icon: Database,
        error: preferencesError?.message,
        lastSync: preferencesData?.updated_at ? new Date(preferencesData.updated_at).toLocaleDateString() : undefined
      });

      // Check Social Data
      const { data: socialData, error: socialError } = await supabase
        .from('user_follows')
        .select('id')
        .or(`follower_id.eq.${user?.id},following_id.eq.${user?.id}`);

      newConnections.push({
        name: 'Social Connections',
        status: socialError ? 'error' : 'connected',
        description: 'Your followers and following',
        icon: Users,
        count: socialData?.length || 0,
        error: socialError?.message
      });

      // Check Market Activity (if merchant)
      const { data: merchantData } = await supabase
        .from('merchant_profiles')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (merchantData) {
        const { data: merchantItems, error: merchantError } = await supabase
          .from('merchant_items')
          .select('id, created_at')
          .eq('merchant_id', user?.id);

        newConnections.push({
          name: 'Merchant Items',
          status: merchantError ? 'error' : 'connected',
          description: 'Your marketplace listings',
          icon: ShoppingBag,
          count: merchantItems?.length || 0,
          error: merchantError?.message,
          lastSync: merchantItems?.[0]?.created_at ? new Date(merchantItems[0].created_at).toLocaleDateString() : undefined
        });
      }

      setConnections(newConnections);
    } catch (error: any) {
      console.error('Error checking data connections:', error);
      toast({
        title: "Error checking data connections",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshConnection = async (connectionName: string) => {
    setConnections(prev => prev.map(conn => 
      conn.name === connectionName 
        ? { ...conn, status: 'loading' }
        : conn
    ));

    // Simulate refresh delay
    setTimeout(() => {
      checkDataConnections();
    }, 1000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'loading':
        return <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />;
      default:
        return <Database className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return <Badge variant="default">Connected</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      case 'loading':
        return <Badge variant="secondary">Loading...</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <Database className="w-12 h-12 animate-pulse text-primary mx-auto" />
            <p className="text-lg font-medium">Checking data connections...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const connectedCount = connections.filter(c => c.status === 'connected').length;
  const errorCount = connections.filter(c => c.status === 'error').length;

  return (
    <div className="space-y-6">
      {/* Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-6 h-6" />
            Data Connections
          </CardTitle>
          <CardDescription>
            Real-time status of your data connections and sync status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium">{connectedCount} Connected</span>
            </div>
            {errorCount > 0 && (
              <div className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-600" />
                <span className="text-sm font-medium">{errorCount} Errors</span>
              </div>
            )}
            <Button size="sm" variant="outline" onClick={checkDataConnections}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh All
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Connection Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {connections.map((connection) => {
          const Icon = connection.icon;
          
          return (
            <Card key={connection.name}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Icon className="w-6 h-6 text-primary" />
                    <div>
                      <h3 className="font-medium">{connection.name}</h3>
                      <p className="text-sm text-muted-foreground">{connection.description}</p>
                    </div>
                  </div>
                  {getStatusIcon(connection.status)}
                </div>

                <div className="space-y-2">
                  {getStatusBadge(connection.status)}
                  
                  {connection.count !== undefined && (
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{connection.count} items</span>
                    </div>
                  )}
                  
                  {connection.lastSync && (
                    <div className="text-xs text-muted-foreground">
                      Last sync: {connection.lastSync}
                    </div>
                  )}
                  
                  {connection.error && (
                    <Alert variant="destructive" className="mt-2">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription className="text-xs">
                        {connection.error}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => refreshConnection(connection.name)}
                    disabled={connection.status === 'loading'}
                    className="w-full"
                  >
                    {connection.status === 'loading' ? (
                      <>
                        <RefreshCw className="w-3 h-3 mr-2 animate-spin" />
                        Refreshing...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-3 h-3 mr-2" />
                        Refresh
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Data Health Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Data Health Summary</CardTitle>
          <CardDescription>
            Overview of your data integrity and availability
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">{connectedCount}</p>
              <p className="text-sm text-muted-foreground">Active Connections</p>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <Database className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">{connections.length}</p>
              <p className="text-sm text-muted-foreground">Total Data Sources</p>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <TrendingUp className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">
                {Math.round((connectedCount / connections.length) * 100)}%
              </p>
              <p className="text-sm text-muted-foreground">Connection Health</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RealDataConnector;