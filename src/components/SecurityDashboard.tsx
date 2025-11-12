import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, AlertTriangle, CheckCircle, Lock, Eye, Activity, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SecurityEvent {
  id: string;
  action: string;
  timestamp: string;
  success: boolean;
  details: any;
}

const SecurityDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [securityScore, setSecurityScore] = useState(75);
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [recentEvents, setRecentEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSecurityData();
  }, []);

  const fetchSecurityData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Check MFA status
      const { data: mfaData } = await supabase
        .from('user_mfa_settings')
        .select('totp_enabled, phone_verified')
        .eq('user_id', user.id)
        .single();

      if (mfaData) {
        setMfaEnabled(mfaData.totp_enabled || mfaData.phone_verified);
      }

      // Fetch recent security events
      const { data: events } = await supabase
        .from('security_audit_log')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (events) {
        setRecentEvents(events.map(e => ({
          id: e.id,
          action: e.action,
          timestamp: e.created_at,
          success: e.success,
          details: e.details
        })));
      }

      // Calculate security score
      let score = 50; // Base score
      if (user.email_confirmed_at) score += 15;
      if (mfaData?.totp_enabled) score += 20;
      if (mfaData?.phone_verified) score += 15;
      
      setSecurityScore(Math.min(score, 100));
    } catch (error) {
      console.error('Error fetching security data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    return 'Needs Improvement';
  };

  return (
    <div className="space-y-6">
      {/* Security Score Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Score
          </CardTitle>
          <CardDescription>
            Your account security health at a glance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-2">
            <div className={`text-6xl font-bold ${getScoreColor(securityScore)}`}>
              {securityScore}
            </div>
            <div className="text-sm text-muted-foreground">
              {getScoreLabel(securityScore)}
            </div>
            <Progress value={securityScore} className="h-2" />
          </div>

          <Separator />

          {/* Security Recommendations */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Recommendations</h4>
            
            {!mfaEnabled && (
              <div className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Enable Two-Factor Authentication</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Add an extra layer of security to your account
                  </p>
                  <Button size="sm" variant="outline" className="mt-2" onClick={() => navigate('/settings/authentication')}>
                    Enable MFA
                  </Button>
                </div>
              </div>
            )}

            {mfaEnabled && (
              <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Two-Factor Authentication Active</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Your account has enhanced protection
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Security Features */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Lock className="h-4 w-4" />
              Account Protection
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span>Email Verification</span>
              <Badge variant="outline" className="bg-green-50">
                <CheckCircle className="h-3 w-3 mr-1" />
                Active
              </Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Two-Factor Auth</span>
              <Badge variant="outline" className={mfaEnabled ? 'bg-green-50' : 'bg-gray-50'}>
                {mfaEnabled ? <CheckCircle className="h-3 w-3 mr-1" /> : <AlertTriangle className="h-3 w-3 mr-1" />}
                {mfaEnabled ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Session Management</span>
              <Badge variant="outline" className="bg-green-50">
                <CheckCircle className="h-3 w-3 mr-1" />
                Active
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Eye className="h-4 w-4" />
              Privacy Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span>Profile Visibility</span>
              <Badge variant="outline">Private</Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Data Encryption</span>
              <Badge variant="outline" className="bg-green-50">
                <CheckCircle className="h-3 w-3 mr-1" />
                Active
              </Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Activity Tracking</span>
              <Badge variant="outline">Minimal</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Security Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
          <CardDescription>
            Your recent security events and actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentEvents.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No recent security events
            </p>
          ) : (
            <div className="space-y-3">
              {recentEvents.slice(0, 5).map((event) => (
                <div key={event.id} className="flex items-start gap-3 p-3 rounded-lg border">
                  {event.success ? (
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium capitalize">
                      {event.action.replace(/_/g, ' ')}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <Clock className="h-3 w-3" />
                      {new Date(event.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <Badge variant={event.success ? "outline" : "destructive"} className="text-xs">
                    {event.success ? "Success" : "Failed"}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityDashboard;
