import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Shield, 
  Smartphone, 
  Key, 
  Lock, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  Eye,
  EyeOff,
  User,
  Settings
} from "lucide-react";
import MFASetup from "@/components/MFASetup";

const ComprehensiveAuthSystem = () => {
  const navigate = useNavigate();
  const { profile, loading } = useProfile();
  const { toast } = useToast();
  
  const [authLevel, setAuthLevel] = useState<'base' | 'intermediate' | 'advanced'>('base');
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [securityScore, setSecurityScore] = useState(45);
  const [activeTab, setActiveTab] = useState('overview');
  const [showMFASetup, setShowMFASetup] = useState(false);

  useEffect(() => {
    if (profile) {
      setAuthLevel(profile.auth_level);
      calculateSecurityScore();
    }
  }, [profile]);

  const calculateSecurityScore = () => {
    let score = 20; // Base score for having an account
    
    if (profile?.auth_level === 'intermediate') score += 30;
    if (profile?.auth_level === 'advanced') score += 50;
    if (mfaEnabled) score += 25;
    
    setSecurityScore(Math.min(score, 100));
  };

  const upgradeAuthLevel = async (targetLevel: 'intermediate' | 'advanced') => {
    if (targetLevel === 'intermediate') {
      // For intermediate, we just need additional verification
      try {
        await supabase
          .from('profiles')
          .update({ auth_level: 'intermediate' })
          .eq('user_id', profile?.user_id);
          
        setAuthLevel('intermediate');
        toast({
          title: "Authentication Upgraded",
          description: "Your account is now at Intermediate security level.",
        });
      } catch (error) {
        toast({
          title: "Upgrade Failed",
          description: "Failed to upgrade authentication level.",
          variant: "destructive",
        });
      }
    } else if (targetLevel === 'advanced') {
      // For advanced, require MFA setup
      setShowMFASetup(true);
    }
  };

  const getAuthLevelColor = (level: string) => {
    switch (level) {
      case 'base': return 'bg-red-100 text-red-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSecurityRecommendations = () => {
    const recommendations = [];
    
    if (authLevel === 'base') {
      recommendations.push({
        title: 'Upgrade to Intermediate Security',
        description: 'Add phone verification for better account protection',
        action: () => upgradeAuthLevel('intermediate'),
        actionText: 'Upgrade Now'
      });
    }
    
    if (authLevel !== 'advanced') {
      recommendations.push({
        title: 'Enable Multi-Factor Authentication',
        description: 'Add an extra layer of security with 2FA',
        action: () => upgradeAuthLevel('advanced'),
        actionText: 'Setup MFA'
      });
    }
    
    if (recommendations.length === 0) {
      recommendations.push({
        title: 'Security Optimal',
        description: 'Your account has maximum security enabled',
        action: null,
        actionText: 'Complete'
      });
    }
    
    return recommendations;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading security settings...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Shield className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>
              Please sign in to access security settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => navigate('/auth')}>
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Shield className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold fashion-text-gradient">Security Center</h1>
          </div>
          <p className="text-muted-foreground">
            Manage your account security and authentication settings
          </p>
        </div>

        {/* Security Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Security Overview</span>
              <Badge className={getAuthLevelColor(authLevel) + ' capitalize'}>
                {authLevel} Level
              </Badge>
            </CardTitle>
            <CardDescription>
              Your current security status and authentication level
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Security Score</span>
                <span className="text-lg font-semibold">{securityScore}/100</span>
              </div>
              <Progress value={securityScore} className="h-2" />
              
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-500">
                    {authLevel === 'advanced' ? '✓' : '○'}
                  </div>
                  <p className="text-sm text-muted-foreground">2FA Enabled</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-500">
                    {profile.email ? '✓' : '○'}
                  </div>
                  <p className="text-sm text-muted-foreground">Email Verified</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="authentication">Authentication</TabsTrigger>
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Security Recommendations</CardTitle>
                <CardDescription>
                  Improve your account security with these suggestions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {getSecurityRecommendations().map((rec, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">{rec.title}</h4>
                        <p className="text-sm text-muted-foreground">{rec.description}</p>
                      </div>
                      {rec.action && (
                        <Button onClick={rec.action} variant="outline">
                          {rec.actionText}
                        </Button>
                      )}
                      {!rec.action && (
                        <CheckCircle className="w-6 h-6 text-green-500" />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="authentication" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Authentication Methods</CardTitle>
                <CardDescription>
                  Manage how you sign in to your account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5" />
                      <div>
                        <h4 className="font-medium">Email & Password</h4>
                        <p className="text-sm text-muted-foreground">Primary authentication method</p>
                      </div>
                    </div>
                    <Badge variant="outline">Active</Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Smartphone className="w-5 h-5" />
                      <div>
                        <h4 className="font-medium">Two-Factor Authentication</h4>
                        <p className="text-sm text-muted-foreground">
                          {authLevel === 'advanced' ? 'Authenticator app enabled' : 'Add extra security layer'}
                        </p>
                      </div>
                    </div>
                    {authLevel === 'advanced' ? (
                      <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                    ) : (
                      <Button 
                        variant="outline" 
                        onClick={() => setShowMFASetup(true)}
                      >
                        Setup
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sessions" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Active Sessions</CardTitle>
                <CardDescription>
                  Manage devices that are signed in to your account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <Settings className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium">Current Session</h4>
                        <p className="text-sm text-muted-foreground">
                          {new Date().toLocaleString()} • This device
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline">Active</Badge>
                  </div>

                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={async () => {
                      await supabase.auth.signOut();
                      toast({
                        title: "Signed out",
                        description: "All sessions have been terminated.",
                      });
                      navigate('/auth');
                    }}
                  >
                    Sign Out All Devices
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* MFA Setup Modal */}
      {showMFASetup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="w-full max-w-md">
            <MFASetup onComplete={() => {
              setShowMFASetup(false);
              setAuthLevel('advanced');
              setMfaEnabled(true);
              calculateSecurityScore();
            }} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ComprehensiveAuthSystem;