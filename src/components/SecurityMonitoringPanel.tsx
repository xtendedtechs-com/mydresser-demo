import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, AlertTriangle, CheckCircle, Clock, MapPin, Smartphone } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface LoginAttempt {
  id: string;
  timestamp: string;
  location: string;
  device: string;
  success: boolean;
  ipAddress: string;
}

interface ActiveSession {
  id: string;
  device: string;
  location: string;
  lastActive: string;
  current: boolean;
}

export const SecurityMonitoringPanel = () => {
  // Mock data - in production, fetch from Supabase
  const recentLogins: LoginAttempt[] = [
    {
      id: "1",
      timestamp: "2 minutes ago",
      location: "New York, US",
      device: "Chrome on MacOS",
      success: true,
      ipAddress: "192.168.1.1"
    },
    {
      id: "2",
      timestamp: "1 day ago",
      location: "London, UK",
      device: "Safari on iPhone",
      success: true,
      ipAddress: "192.168.1.2"
    },
    {
      id: "3",
      timestamp: "2 days ago",
      location: "Unknown",
      device: "Unknown Browser",
      success: false,
      ipAddress: "203.0.113.0"
    }
  ];

  const activeSessions: ActiveSession[] = [
    {
      id: "1",
      device: "Chrome on MacOS",
      location: "New York, US",
      lastActive: "Active now",
      current: true
    },
    {
      id: "2",
      device: "Safari on iPhone",
      location: "New York, US",
      lastActive: "2 hours ago",
      current: false
    }
  ];

  return (
    <div className="space-y-6">
      {/* Security Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Security Status
          </CardTitle>
          <CardDescription>Your account security overview</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-4 bg-background-subtle rounded-lg">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <div className="text-sm text-text-muted">Protection Level</div>
                <div className="font-semibold">Strong</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-background-subtle rounded-lg">
              <Shield className="h-8 w-8 text-primary" />
              <div>
                <div className="text-sm text-text-muted">2FA Status</div>
                <div className="font-semibold">Enabled</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-background-subtle rounded-lg">
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
              <div>
                <div className="text-sm text-text-muted">Recent Alerts</div>
                <div className="font-semibold">1 Failed Login</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Login Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Login Activity
          </CardTitle>
          <CardDescription>Monitor access to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px]">
            <div className="space-y-4">
              {recentLogins.map((login, index) => (
                <div key={login.id}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`mt-1 ${login.success ? 'text-green-500' : 'text-destructive'}`}>
                        {login.success ? <CheckCircle className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{login.device}</span>
                          {login.success ? (
                            <Badge variant="outline" className="text-xs">Success</Badge>
                          ) : (
                            <Badge variant="destructive" className="text-xs">Failed</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-text-muted">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {login.location}
                          </span>
                          <span>{login.ipAddress}</span>
                        </div>
                        <div className="text-xs text-text-muted">{login.timestamp}</div>
                      </div>
                    </div>
                  </div>
                  {index < recentLogins.length - 1 && <Separator className="mt-4" />}
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Active Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Active Sessions
          </CardTitle>
          <CardDescription>Devices currently logged into your account</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activeSessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between p-4 bg-background-subtle rounded-lg">
                <div className="flex items-center gap-3">
                  <Smartphone className="h-5 w-5 text-text-muted" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{session.device}</span>
                      {session.current && (
                        <Badge variant="secondary" className="text-xs">Current</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-text-muted mt-1">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {session.location}
                      </span>
                      <span>{session.lastActive}</span>
                    </div>
                  </div>
                </div>
                {!session.current && (
                  <button className="text-sm text-destructive hover:underline">
                    Revoke
                  </button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
