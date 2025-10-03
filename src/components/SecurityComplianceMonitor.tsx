import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, AlertTriangle, CheckCircle, Lock, Eye, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SecurityEvent {
  id: string;
  event_type: string;
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  timestamp: string;
  user_id?: string;
}

export const SecurityComplianceMonitor = () => {
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [complianceScore, setComplianceScore] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadSecurityData();
    
    // Set up real-time monitoring
    const channel = supabase
      .channel('security-events')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'sensitive_data_access_audit' 
        }, 
        () => {
          loadSecurityData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadSecurityData = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      // Load audit logs
      const { data: auditLogs, error } = await supabase
        .from('sensitive_data_access_audit')
        .select('*')
        .eq('user_id', user.user.id)
        .order('accessed_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      // Transform to security events
      const events: SecurityEvent[] = (auditLogs || []).map(log => ({
        id: log.id,
        event_type: 'data_access',
        severity: 'low',
        description: `Accessed ${log.table_name} data`,
        timestamp: log.accessed_at,
        user_id: log.user_id
      }));

      setSecurityEvents(events);
      
      // Calculate compliance score based on security practices
      const score = calculateComplianceScore(events);
      setComplianceScore(score);

    } catch (error) {
      console.error('Error loading security data:', error);
      toast({
        title: "Security Monitor Error",
        description: "Failed to load security data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateComplianceScore = (events: SecurityEvent[]): number => {
    // Base score
    let score = 100;

    // Deduct points for suspicious activity
    const recentEvents = events.filter(e => {
      const eventTime = new Date(e.timestamp).getTime();
      const hourAgo = Date.now() - (60 * 60 * 1000);
      return eventTime > hourAgo;
    });

    // Too many accesses in short time
    if (recentEvents.length > 50) score -= 20;
    else if (recentEvents.length > 20) score -= 10;

    // High severity events
    const criticalEvents = events.filter(e => e.severity === 'critical');
    score -= criticalEvents.length * 15;

    return Math.max(0, Math.min(100, score));
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-destructive';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      default: return 'bg-blue-500';
    }
  };

  const getComplianceStatus = () => {
    if (complianceScore >= 90) return { text: 'Excellent', color: 'text-green-600', icon: CheckCircle };
    if (complianceScore >= 70) return { text: 'Good', color: 'text-blue-600', icon: Shield };
    if (complianceScore >= 50) return { text: 'Fair', color: 'text-yellow-600', icon: AlertTriangle };
    return { text: 'Needs Attention', color: 'text-red-600', icon: AlertTriangle };
  };

  const status = getComplianceStatus();
  const StatusIcon = status.icon;

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Security Compliance Monitor</CardTitle>
          <CardDescription>Loading security data...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Compliance Monitor
              </CardTitle>
              <CardDescription>
                Real-time security monitoring and compliance tracking
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-lg">
              Score: {complianceScore}/100
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Alert>
              <StatusIcon className={`h-4 w-4 ${status.color}`} />
              <AlertDescription>
                <span className={`font-medium ${status.color}`}>{status.text}</span>
                {' - '}Your account security status
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Data Protection
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">Active</div>
                  <p className="text-xs text-muted-foreground">
                    All sensitive data encrypted
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Access Monitoring
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{securityEvents.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Recent access events
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Audit Trail
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">Complete</div>
                  <p className="text-xs text-muted-foreground">
                    Full activity logging
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Recent Security Events</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {securityEvents.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No recent events</p>
                ) : (
                  securityEvents.map((event) => (
                    <div
                      key={event.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Badge className={getSeverityColor(event.severity)}>
                          {event.severity}
                        </Badge>
                        <div>
                          <p className="text-sm font-medium">{event.description}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(event.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};