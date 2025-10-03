import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { Shield, AlertTriangle, Lock, Eye, Key, Activity } from 'lucide-react';
import { format } from 'date-fns';

export const SecurityDashboardPanel = () => {
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch security audit logs
  const { data: auditLogs, isLoading: logsLoading } = useQuery({
    queryKey: ['security-audit-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('security_audit_log' as any)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data || [];
    },
  });

  // Fetch contact info access logs
  const { data: accessLogs, isLoading: accessLoading } = useQuery({
    queryKey: ['contact-access-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contact_info_access_log' as any)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data || [];
    },
  });

  // Fetch MFA status
  const { data: mfaStatus } = useQuery<{ totp_enabled: boolean; phone_verified: boolean } | null>({
    queryKey: ['mfa-status'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_mfa_settings' as any)
        .select('totp_enabled, phone_verified')
        .maybeSingle();

      if (error) throw error;
      return (data || null) as unknown as { totp_enabled: boolean; phone_verified: boolean } | null;
    },
  });

  const securityScore = () => {
    let score = 50; // Base score
    if (mfaStatus?.totp_enabled) score += 25;
    if (mfaStatus?.phone_verified) score += 15;
    if (auditLogs && auditLogs.length > 0) score += 10;
    return Math.min(score, 100);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Overview
          </CardTitle>
          <CardDescription>
            Monitor your account security and activity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Security Score</h3>
                <p className="text-sm text-muted-foreground">
                  Current security level
                </p>
              </div>
              <div className={`text-4xl font-bold ${getScoreColor(securityScore())}`}>
                {securityScore()}%
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Lock className="h-4 w-4 text-primary" />
                    <h4 className="font-semibold">MFA Status</h4>
                  </div>
                  <Badge variant={mfaStatus?.totp_enabled ? 'default' : 'secondary'}>
                    {mfaStatus?.totp_enabled ? 'Enabled' : 'Disabled'}
                  </Badge>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Key className="h-4 w-4 text-primary" />
                    <h4 className="font-semibold">Phone Verified</h4>
                  </div>
                  <Badge variant={mfaStatus?.phone_verified ? 'default' : 'secondary'}>
                    {mfaStatus?.phone_verified ? 'Verified' : 'Not Verified'}
                  </Badge>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="h-4 w-4 text-primary" />
                    <h4 className="font-semibold">Recent Activity</h4>
                  </div>
                  <Badge variant="outline">
                    {auditLogs?.length || 0} Events
                  </Badge>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">Activity Log</TabsTrigger>
          <TabsTrigger value="access">Data Access</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Security Events</CardTitle>
              <CardDescription>
                Track important security-related activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              {logsLoading ? (
                <p className="text-sm text-muted-foreground">Loading...</p>
              ) : auditLogs && auditLogs.length > 0 ? (
                <div className="space-y-3">
                  {auditLogs.map((log: any) => (
                    <div
                      key={log.id}
                      className="flex items-start justify-between border-b pb-3 last:border-0"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`mt-1 ${log.success ? 'text-green-600' : 'text-red-600'}`}>
                          {log.success ? <Shield className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{log.action}</p>
                          <p className="text-xs text-muted-foreground">
                            Resource: {log.resource}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(log.created_at), 'MMM d, HH:mm')}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No security events recorded</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="access" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sensitive Data Access Log</CardTitle>
              <CardDescription>
                View when your contact information was accessed
              </CardDescription>
            </CardHeader>
            <CardContent>
              {accessLoading ? (
                <p className="text-sm text-muted-foreground">Loading...</p>
              ) : accessLogs && accessLogs.length > 0 ? (
                <div className="space-y-3">
                  {accessLogs.map((log: any) => (
                    <div
                      key={log.id}
                      className="flex items-start justify-between border-b pb-3 last:border-0"
                    >
                      <div className="flex items-start gap-3">
                        <Eye className="h-4 w-4 mt-1 text-primary" />
                        <div>
                          <p className="font-medium text-sm">{log.action}</p>
                          <p className="text-xs text-muted-foreground">
                            Fields: {log.accessed_fields?.join(', ') || 'N/A'}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(log.created_at), 'MMM d, HH:mm')}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No access logs found</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {(!mfaStatus?.totp_enabled || !mfaStatus?.phone_verified) && (
        <Card className="border-yellow-600">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-600">
              <AlertTriangle className="h-5 w-5" />
              Security Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {!mfaStatus?.totp_enabled && (
              <div className="flex items-center justify-between">
                <p className="text-sm">Enable Two-Factor Authentication</p>
                <Button size="sm" variant="outline">
                  Setup MFA
                </Button>
              </div>
            )}
            {!mfaStatus?.phone_verified && (
              <div className="flex items-center justify-between">
                <p className="text-sm">Verify Your Phone Number</p>
                <Button size="sm" variant="outline">
                  Verify
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
