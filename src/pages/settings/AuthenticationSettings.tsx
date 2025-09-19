import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ComprehensiveAuthSystem from "@/components/ComprehensiveAuthSystem";

const AuthenticationSettings = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Authentication & Security</CardTitle>
          <CardDescription>
            Manage your account security settings, multi-factor authentication, and authentication levels
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ComprehensiveAuthSystem />
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthenticationSettings;