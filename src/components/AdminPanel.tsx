import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Shield, Users, Mail, Activity, AlertTriangle, CheckCircle, X } from 'lucide-react';
import { useUserRoles } from '@/hooks/useUserRoles';
import { SecurityStatusAlert } from './SecurityStatusAlert';

interface SecurityLog {
  id: string;
  user_id?: string;
  action: string;
  resource?: string;
  success: boolean;
  created_at: string;
  details?: any;
}

interface Invitation {
  id: string;
  email: string;
  token: string;
  expires_at: string;
  used_at?: string;
  created_at: string;
}

const AdminPanel = () => {
  const [loading, setLoading] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [securityLogs, setSecurityLogs] = useState<SecurityLog[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [signupEnabled, setSignupEnabled] = useState(false);
  const { toast } = useToast();
  const { isAdmin, isLoading: rolesLoading } = useUserRoles();

  useEffect(() => {
    if (!rolesLoading && isAdmin) {
      loadSecurityLogs();
      loadInvitations();
      checkSignupStatus();
    }
  }, [isAdmin, rolesLoading]);

  // Prevent non-admins from viewing
  if (rolesLoading) {
    return (
      <div className="max-w-6xl mx-auto p-8 text-center">
        <Shield className="h-12 w-12 mx-auto mb-4 text-primary animate-pulse" />
        <p className="text-muted-foreground">Verifying admin access...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="max-w-6xl mx-auto p-8 text-center">
        <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-destructive" />
        <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
        <p className="text-muted-foreground">You do not have admin privileges to view this panel.</p>
      </div>
    );
  }

  const loadSecurityLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('security_audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setSecurityLogs(data || []);
    } catch (error) {
      console.error('Error loading security logs:', error);
    }
  };

  const loadInvitations = async () => {
    try {
      const { data, error } = await supabase
        .from('user_invitations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvitations(data || []);
    } catch (error) {
      console.error('Error loading invitations:', error);
    }
  };

  const checkSignupStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('setting_value')
        .eq('setting_key', 'signup_enabled')
        .single();

      if (!error && data) {
        setSignupEnabled((data.setting_value as any)?.enabled || false);
      }
    } catch (error) {
      console.error('Error checking signup status:', error);
    }
  };

  const createInvitation = async () => {
    if (!inviteEmail || !inviteEmail.includes('@')) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase.functions.invoke('auth-security', {
        body: {
          action: 'create_invitation',
          data: {
            email: inviteEmail,
            invited_by: user.id
          }
        }
      });

      if (error || !data.success) {
        throw new Error(data.error || 'Failed to create invitation');
      }

      toast({
        title: "Invitation created",
        description: `Invitation sent to ${inviteEmail}. Token: ${data.token}`,
      });

      setInviteEmail('');
      loadInvitations();
    } catch (error: any) {
      toast({
        title: "Error creating invitation",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleSignup = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('admin_settings')
        .update({
          setting_value: {
            enabled: !signupEnabled,
            reason: signupEnabled ? 'Signup disabled by admin' : 'Signup enabled by admin'
          }
        })
        .eq('setting_key', 'signup_enabled');

      if (error) throw error;

      setSignupEnabled(!signupEnabled);
      toast({
        title: signupEnabled ? "Signup disabled" : "Signup enabled",
        description: `Public signup is now ${!signupEnabled ? 'enabled' : 'disabled'}.`,
      });
    } catch (error: any) {
      toast({
        title: "Error updating signup setting",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getActionBadgeVariant = (action: string) => {
    if (action.includes('signin') || action.includes('signup')) return 'default';
    if (action.includes('failed') || action.includes('error')) return 'destructive';
    return 'secondary';
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Security Admin Panel</h1>
          <p className="text-muted-foreground">Manage application security and access controls</p>
        </div>
      </div>

      <SecurityStatusAlert />

      <Tabs defaultValue="invitations" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="invitations">Invitations</TabsTrigger>
          <TabsTrigger value="settings">Security Settings</TabsTrigger>
          <TabsTrigger value="audit">Audit Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="invitations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Create Invitation
              </CardTitle>
              <CardDescription>
                Send secure invitations to allow new user registrations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="inviteEmail">Email Address</Label>
                <div className="flex gap-2">
                  <Input
                    id="inviteEmail"
                    type="email"
                    placeholder="user@example.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                  <Button onClick={createInvitation} disabled={loading}>
                    {loading ? 'Creating...' : 'Send Invite'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Invitations</CardTitle>
              <CardDescription>
                Manage and track sent invitations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {invitations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No invitations sent yet
                </div>
              ) : (
                <div className="space-y-3">
                  {invitations.slice(0, 10).map((invite) => (
                    <div key={invite.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="space-y-1">
                        <div className="font-medium">{invite.email}</div>
                        <div className="text-xs text-muted-foreground">
                          Created: {new Date(invite.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {invite.used_at ? (
                          <Badge variant="default">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Used
                          </Badge>
                        ) : new Date(invite.expires_at) < new Date() ? (
                          <Badge variant="destructive">
                            <X className="h-3 w-3 mr-1" />
                            Expired
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Pending</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Signup Controls
              </CardTitle>
              <CardDescription>
                Control who can create new accounts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Public Signup</h3>
                  <p className="text-sm text-muted-foreground">
                    Allow anyone to create an account without invitation
                  </p>
                </div>
                <Button
                  variant={signupEnabled ? "destructive" : "default"}
                  onClick={toggleSignup}
                  disabled={loading}
                >
                  {signupEnabled ? 'Disable Signup' : 'Enable Signup'}
                </Button>
              </div>
              
              <Alert variant={signupEnabled ? "destructive" : "default"}>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  {signupEnabled 
                    ? 'WARNING: Public signup is enabled. Anyone can create an account.'
                    : 'Signup is restricted. New users need invitations to register.'
                  }
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Security Status</CardTitle>
              <CardDescription>
                Current security measures in place
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>User roles system with RLS protection ✅ NEW</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Session validation with security definer ✅ NEW</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Sensitive data masking functions ✅ NEW</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Row Level Security (RLS) enabled on all tables</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Rate limiting active for authentication</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Security audit logging with field tracking ✅ IMPROVED</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Content Security Policy headers active</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Multi-factor authentication available</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Security Audit Logs
              </CardTitle>
              <CardDescription>
                Monitor security events and authentication activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              {securityLogs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No security logs available
                </div>
              ) : (
                <div className="space-y-2">
                  {securityLogs.map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant={getActionBadgeVariant(log.action)}>
                            {log.action}
                          </Badge>
                          {log.success ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <X className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(log.created_at).toLocaleString()}
                          {log.user_id && ` • User: ${log.user_id.substring(0, 8)}...`}
                        </div>
                        {log.details && (
                          <div className="text-xs text-muted-foreground">
                            {JSON.stringify(log.details, null, 2).substring(0, 100)}...
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <Badge variant={log.success ? "default" : "destructive"}>
                          {log.success ? 'Success' : 'Failed'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPanel;