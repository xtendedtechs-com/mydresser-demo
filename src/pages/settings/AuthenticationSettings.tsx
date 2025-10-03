import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ComprehensiveAuthSystem from "@/components/ComprehensiveAuthSystem";
import { SecurityMonitoringPanel } from "@/components/SecurityMonitoringPanel";
import { Shield, Lock, Activity } from "lucide-react";
import Navigation from "@/components/Navigation";

const AuthenticationSettings = () => {
  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Authentication & Security</h1>
          <p className="text-text-muted">
            Manage your account security, authentication methods, and monitor account activity
          </p>
        </div>

        <Tabs defaultValue="settings" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto">
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
            <TabsTrigger value="monitoring" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              <span className="hidden sm:inline">Activity</span>
            </TabsTrigger>
            <TabsTrigger value="advanced" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Advanced</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Authentication Methods</CardTitle>
                <CardDescription>
                  Configure multi-factor authentication and manage your authentication levels
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ComprehensiveAuthSystem />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="monitoring" className="space-y-6">
            <SecurityMonitoringPanel />
          </TabsContent>

          <TabsContent value="advanced" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Advanced Security Settings</CardTitle>
                <CardDescription>
                  Configure advanced security features and policies
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-semibold">Session Management</h3>
                  <p className="text-sm text-text-muted">
                    Automatically log out inactive sessions after 30 minutes
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold">Login Alerts</h3>
                  <p className="text-sm text-text-muted">
                    Receive notifications for new device logins
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold">Data Export</h3>
                  <p className="text-sm text-text-muted">
                    Download your account data and security logs
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <Navigation />
    </div>
  );
};

export default AuthenticationSettings;