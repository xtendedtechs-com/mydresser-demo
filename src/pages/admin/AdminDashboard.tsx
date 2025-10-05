import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Users, AlertTriangle, TrendingUp, Activity, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SystemHealth {
  timestamp: string;
  critical_incidents: number;
  active_disputes: number;
  health_score: number;
  status: 'healthy' | 'warning' | 'critical';
}

interface DashboardMetrics {
  total_users: number;
  active_users: number;
  new_users: number;
  total_transactions: number;
  transaction_volume: number;
  open_disputes: number;
  pending_verifications: number;
  security_incidents: number;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      // Check if user has admin role
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .eq('role', 'admin')
        .single();

      if (rolesError || !roles) {
        toast({
          title: "Access Denied",
          description: "You don't have admin privileges",
          variant: "destructive"
        });
        navigate('/');
        return;
      }

      setIsAdmin(true);
      await loadDashboardData();
    } catch (error) {
      console.error('Admin access check error:', error);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const loadDashboardData = async () => {
    try {
      // Get system health
      const { data: healthData, error: healthError } = await supabase
        .rpc('get_system_health' as any) as any;

      if (!healthError && healthData) {
        setSystemHealth(healthData);
      }

      // Get latest metrics (using type assertion until types are regenerated)
      const { data: metricsData, error: metricsError } = await supabase
        .from('admin_dashboard_metrics' as any)
        .select('*')
        .order('metric_date', { ascending: false })
        .limit(1)
        .single();

      if (!metricsError && metricsData) {
        const data = metricsData as any;
        setMetrics({
          total_users: data.total_users || 0,
          active_users: data.active_users || 0,
          new_users: data.new_users || 0,
          total_transactions: data.total_transactions || 0,
          transaction_volume: data.transaction_volume || 0,
          open_disputes: data.open_disputes || 0,
          pending_verifications: data.pending_verifications || 0,
          security_incidents: data.security_incidents || 0
        });
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Shield className="w-8 h-8" />
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              System monitoring and management
            </p>
          </div>
        </div>

        {/* System Health Alert */}
        {systemHealth && systemHealth.status !== 'healthy' && (
          <Alert variant={systemHealth.status === 'critical' ? 'destructive' : 'default'}>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              System health: {systemHealth.status.toUpperCase()} - 
              {systemHealth.critical_incidents > 0 && ` ${systemHealth.critical_incidents} critical incidents`}
              {systemHealth.active_disputes > 0 && ` ${systemHealth.active_disputes} active disputes`}
            </AlertDescription>
          </Alert>
        )}

        {/* System Health Card */}
        {systemHealth && (
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  System Health
                </h3>
                <p className={`text-2xl font-bold mt-2 ${getHealthColor(systemHealth.status)}`}>
                  {systemHealth.health_score}/100
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Status</p>
                <p className={`text-lg font-semibold ${getHealthColor(systemHealth.status)}`}>
                  {systemHealth.status.toUpperCase()}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Metrics Grid */}
        {metrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-bold">{metrics.total_users}</p>
                  <p className="text-xs text-green-600">+{metrics.new_users} new</p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Transactions</p>
                  <p className="text-2xl font-bold">{metrics.total_transactions}</p>
                  <p className="text-xs text-muted-foreground">
                    ${metrics.transaction_volume.toLocaleString()}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-8 h-8 text-yellow-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Open Disputes</p>
                  <p className="text-2xl font-bold">{metrics.open_disputes}</p>
                  <p className="text-xs text-muted-foreground">Needs attention</p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3">
                <Shield className="w-8 h-8 text-red-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Security Incidents</p>
                  <p className="text-2xl font-bold">{metrics.security_incidents}</p>
                  <p className="text-xs text-muted-foreground">Last 24h</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Admin Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="disputes">Disputes</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
              <p className="text-muted-foreground">Admin activity monitoring will be displayed here</p>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">User Management</h3>
              <p className="text-muted-foreground">User management tools will be displayed here</p>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Security Monitoring</h3>
              <p className="text-muted-foreground">Security incidents and monitoring will be displayed here</p>
            </Card>
          </TabsContent>

          <TabsContent value="disputes">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Dispute Resolution</h3>
              <p className="text-muted-foreground">Open disputes requiring admin attention will be displayed here</p>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5" />
                System Settings
              </h3>
              <p className="text-muted-foreground">System configuration options will be displayed here</p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}