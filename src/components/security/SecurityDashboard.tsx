import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Activity,
  Lock,
  Unlock,
  Eye,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface SecurityScore {
  security_score: number;
  risk_level: string;
  failed_login_attempts: number;
  suspicious_activities: number;
  mfa_enabled: boolean;
  security_flags: string[];
}

interface SecurityIncident {
  id: string;
  incident_type: string;
  severity: string;
  status: string;
  detected_at: string;
  incident_details: any;
}

export const SecurityDashboard = () => {
  const [securityScore, setSecurityScore] = useState<SecurityScore | null>(null);
  const [incidents, setIncidents] = useState<SecurityIncident[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadSecurityData();
  }, []);

  const loadSecurityData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load security score
      const { data: scoreData, error: scoreError } = await supabase
        .from('user_security_score')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (scoreError && scoreError.code !== 'PGRST116') {
        console.error('Failed to load security score:', scoreError);
      } else if (scoreData) {
        setSecurityScore(scoreData);
      } else {
        // Initialize security score if doesn't exist
        const score = await supabase.rpc('calculate_user_security_score' as any, {
          p_user_id: user.id
        }) as any;
        
        if (score) {
          // Reload after initialization
          const { data: newScoreData } = await supabase
            .from('user_security_score')
            .select('*')
            .eq('user_id', user.id)
            .single();
          
          if (newScoreData) setSecurityScore(newScoreData);
        }
      }

      // Load recent incidents
      const { data: incidentsData } = await supabase
        .from('security_incidents')
        .select('*')
        .eq('user_id', user.id)
        .order('detected_at', { ascending: false })
        .limit(5);

      if (incidentsData) setIncidents(incidentsData);

    } catch (error) {
      console.error('Failed to load security data:', error);
      toast({
        title: "Security Data Error",
        description: "Unable to load security information",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 50) return 'text-yellow-600';
    if (score >= 30) return 'text-orange-600';
    return 'text-red-600';
  };

  const getRiskBadge = (level: string) => {
    const badges = {
      minimal: { label: 'Minimal Risk', variant: 'default' as const, color: 'bg-green-500' },
      low: { label: 'Low Risk', variant: 'secondary' as const, color: 'bg-blue-500' },
      medium: { label: 'Medium Risk', variant: 'outline' as const, color: 'bg-yellow-500' },
      high: { label: 'High Risk', variant: 'destructive' as const, color: 'bg-orange-500' },
      critical: { label: 'Critical Risk', variant: 'destructive' as const, color: 'bg-red-500' }
    };
    return badges[level as keyof typeof badges] || badges.medium;
  };

  const getSeverityIcon = (severity: string) => {
    if (severity === 'critical' || severity === 'high') return <AlertTriangle className="w-4 h-4 text-red-500" />;
    if (severity === 'medium') return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    return <CheckCircle className="w-4 h-4 text-green-500" />;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Activity className="w-8 h-8 animate-pulse text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Security Score Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Security Dashboard
              </CardTitle>
              <CardDescription>Your account security overview</CardDescription>
            </div>
            {securityScore && (
              <Badge variant={getRiskBadge(securityScore.risk_level).variant}>
                {getRiskBadge(securityScore.risk_level).label}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {securityScore ? (
            <>
              {/* Security Score */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Security Score</span>
                  <span className={`text-2xl font-bold ${getScoreColor(securityScore.security_score)}`}>
                    {securityScore.security_score}/100
                  </span>
                </div>
                <Progress value={securityScore.security_score} className="h-2" />
              </div>

              {/* Security Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    {securityScore.mfa_enabled ? (
                      <Lock className="w-4 h-4 text-green-600" />
                    ) : (
                      <Unlock className="w-4 h-4 text-red-600" />
                    )}
                    <span className="text-xs font-medium">MFA</span>
                  </div>
                  <span className="text-sm">
                    {securityScore.mfa_enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>

                <div className="p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="w-4 h-4 text-yellow-600" />
                    <span className="text-xs font-medium">Failed Logins</span>
                  </div>
                  <span className="text-xl font-bold">
                    {securityScore.failed_login_attempts}
                  </span>
                </div>

                <div className="p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Eye className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-medium">Suspicious</span>
                  </div>
                  <span className="text-xl font-bold">
                    {securityScore.suspicious_activities}
                  </span>
                </div>

                <div className="p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Activity className="w-4 h-4 text-purple-600" />
                    <span className="text-xs font-medium">Flags</span>
                  </div>
                  <span className="text-xl font-bold">
                    {securityScore.security_flags?.length || 0}
                  </span>
                </div>
              </div>

              {/* Security Flags */}
              {securityScore.security_flags && securityScore.security_flags.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Active Security Flags</h4>
                  <div className="flex flex-wrap gap-2">
                    {securityScore.security_flags.map((flag, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {flag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {securityScore.security_score < 80 && (
                <div className="p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Security Improvements
                  </h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    {!securityScore.mfa_enabled && (
                      <li>• Enable Multi-Factor Authentication (MFA)</li>
                    )}
                    {securityScore.failed_login_attempts > 0 && (
                      <li>• Review failed login attempts</li>
                    )}
                    {securityScore.suspicious_activities > 0 && (
                      <li>• Investigate suspicious activities</li>
                    )}
                    <li>• Regularly update your password</li>
                  </ul>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              No security data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Security Incidents */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Recent Security Events
          </CardTitle>
          <CardDescription>Latest security-related activities</CardDescription>
        </CardHeader>
        <CardContent>
          {incidents.length === 0 ? (
            <div className="text-center py-8 space-y-2">
              <CheckCircle className="w-12 h-12 mx-auto text-green-500" />
              <p className="text-sm text-muted-foreground">No security incidents detected</p>
              <p className="text-xs text-muted-foreground">Your account is secure</p>
            </div>
          ) : (
            <div className="space-y-3">
              {incidents.map((incident) => (
                <div
                  key={incident.id}
                  className="flex items-start gap-3 p-3 border rounded-lg"
                >
                  {getSeverityIcon(incident.severity)}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">
                        {incident.incident_type.replace(/_/g, ' ')}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {incident.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(incident.detected_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
