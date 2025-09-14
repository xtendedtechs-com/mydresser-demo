import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertCircle, Shield, Users, KeyRound, CheckCircle, XCircle, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from '@/hooks/useProfile';

interface Invitation {
  id: string;
  email: string;
  token: string;
  invited_by: string;
  expires_at: string;
  used_at: string | null;
  created_at: string;
}

interface SecurityAlert {
  id: string;
  type: 'login_failure' | 'suspicious_activity' | 'rate_limit' | 'data_breach';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: string;
  resolved: boolean;
}

const SecurityDashboard = () => {
  const { profile } = useProfile();
  const { toast } = useToast();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [newInviteEmail, setNewInviteEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [securityAlerts] = useState<SecurityAlert[]>([
    {
      id: '1',
      type: 'rate_limit',
      severity: 'medium',
      message: 'Multiple rate limit violations detected from IP 192.168.1.100',
      timestamp: new Date().toISOString(),
      resolved: false
    },
    {
      id: '2',
      type: 'suspicious_activity',
      severity: 'high',
      message: 'Unusual login pattern detected for user@example.com',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      resolved: true
    }
  ]);

  useEffect(() => {
    if (profile?.role === 'admin') {
      fetchInvitations();
    }
  }, [profile]);

  const fetchInvitations = async () => {
    try {
      const { data, error } = await supabase.rpc('list_invitations_admin');
      if (error) throw error;
      setInvitations(data || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to fetch invitations',
        variant: 'destructive'
      });
    }
  };

  const createInvitation = async () => {
    if (!newInviteEmail.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter an email address',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('create_invitation_admin', {
        invitation_email: newInviteEmail.trim()
      });

      if (error) throw error;

      toast({
        title: 'Invitation Created',
        description: `Invitation sent to ${newInviteEmail}`,
      });

      setNewInviteEmail('');
      fetchInvitations();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create invitation',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const revokeInvitation = async (token: string) => {
    try {
      const { data, error } = await supabase.rpc('revoke_invitation_admin', {
        invitation_token: token
      });

      if (error) throw error;

      if (data) {
        toast({
          title: 'Invitation Revoked',
          description: 'The invitation has been revoked successfully',
        });
        fetchInvitations();
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to revoke invitation',
        variant: 'destructive'
      });
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (profile?.role !== 'admin') {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            <Shield className="w-12 h-12 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
            <p>You need admin privileges to access the security dashboard.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Security Dashboard</h1>
          <p className="text-muted-foreground">Monitor platform security and manage user access</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Alerts</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {securityAlerts.filter(alert => !alert.resolved).length}
            </div>
            <p className="text-xs text-muted-foreground">Unresolved alerts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">MFA Enabled</CardTitle>
            <KeyRound className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">847</div>
            <p className="text-xs text-muted-foreground">68.6% of users</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="invitations" className="space-y-4">
        <TabsList>
          <TabsTrigger value="invitations">User Invitations</TabsTrigger>
          <TabsTrigger value="alerts">Security Alerts</TabsTrigger>
          <TabsTrigger value="audit">Audit Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="invitations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Manage User Invitations</CardTitle>
              <CardDescription>
                Create and manage invitations for new users to join the platform
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter email address..."
                  value={newInviteEmail}
                  onChange={(e) => setNewInviteEmail(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && createInvitation()}
                />
                <Button onClick={createInvitation} disabled={loading}>
                  <Plus className="w-4 h-4 mr-2" />
                  Invite
                </Button>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invitations.map((invitation) => (
                    <TableRow key={invitation.id}>
                      <TableCell className="font-medium">{invitation.email}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={invitation.used_at ? "default" : "secondary"}
                          className={invitation.used_at ? "bg-green-100 text-green-800" : ""}
                        >
                          {invitation.used_at ? (
                            <><CheckCircle className="w-3 h-3 mr-1" />Used</>
                          ) : (
                            <>Pending</>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(invitation.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {new Date(invitation.expires_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {!invitation.used_at && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => revokeInvitation(invitation.token)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Alerts</CardTitle>
              <CardDescription>
                Monitor and respond to security incidents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {securityAlerts.map((alert) => (
                  <div key={alert.id} className="flex items-start justify-between p-4 border rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertCircle className={`w-5 h-5 mt-0.5 ${
                        alert.severity === 'critical' ? 'text-red-600' :
                        alert.severity === 'high' ? 'text-orange-600' :
                        alert.severity === 'medium' ? 'text-yellow-600' :
                        'text-blue-600'
                      }`} />
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={getSeverityColor(alert.severity)}>
                            {alert.severity.toUpperCase()}
                          </Badge>
                          {alert.resolved && (
                            <Badge variant="outline" className="text-green-600">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Resolved
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm font-medium">{alert.message}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(alert.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    {!alert.resolved && (
                      <Button variant="outline" size="sm">
                        Mark Resolved
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Audit Logs</CardTitle>
              <CardDescription>
                View detailed logs of all security-related activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Shield className="w-12 h-12 mx-auto mb-4" />
                <p>Audit log integration coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SecurityDashboard;