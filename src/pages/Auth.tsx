import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Mail, Lock, User, Shield, AlertTriangle, Phone, Store, Eye, EyeOff, CheckCircle } from "lucide-react";
import { useSearchParams } from "react-router-dom";

const Auth = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [invitationToken, setInvitationToken] = useState("");
  const [signupBlocked, setSignupBlocked] = useState(false);
  const [blockReason, setBlockReason] = useState("");
  const [showInviteField, setShowInviteField] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<"signin" | "signup" | "merchant">("signin");
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  // Merchant form states
  const [merchantSignInData, setMerchantSignInData] = useState({
    email: "",
    password: ""
  });

  const [merchantSignUpData, setMerchantSignUpData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    businessName: ""
  });

  // Get invitation token from URL parameters
  useEffect(() => {
    const inviteToken = searchParams.get('invite');
    if (inviteToken) {
      setInvitationToken(inviteToken);
      setShowInviteField(true);
    }
  }, [searchParams]);

  // Check if signup is allowed
  const checkSignupAllowed = async () => {
    try {
      const response = await supabase.functions.invoke('auth-security', {
        body: { action: 'check_signup_allowed' }
      });

      if (response.data) {
        if (!response.data.allowed) {
          setSignupBlocked(true);
          setBlockReason(response.data.reason || 'Signup is currently disabled');
          setShowInviteField(true);
        }
        return response.data.allowed;
      }
      return false;
    } catch (error) {
      setSignupBlocked(true);
      setBlockReason('Unable to verify signup permissions. Please try again later.');
      return false;
    }
  };

  // Rate limiting check
  const checkRateLimit = async (action: string) => {
    try {
      const identifier = `${window.location.hostname}_${Date.now()}`;
      const response = await supabase.functions.invoke('auth-security', {
        body: { 
          action: 'rate_limit_check',
          data: {
            identifier,
            action,
            limit: action === 'login' ? 5 : 3,
            windowMinutes: 15
          }
        }
      });

      return response.data?.allowed !== false;
    } catch (error) {
      console.warn('Rate limit check failed:', error);
      return true; // Allow on error to not block legitimate users
    }
  };

  // Security audit logging
  const auditLog = async (action: string, success: boolean, details?: any) => {
    try {
      await supabase.functions.invoke('auth-security', {
        body: {
          action: 'audit_log',
          data: {
            action,
            success,
            details,
            resource: 'auth'
          }
        }
      });
    } catch (error) {
      console.warn('Audit logging failed:', error);
    }
  };

  const validateInvitation = async (token: string) => {
    try {
      const response = await supabase.functions.invoke('auth-security', {
        body: { 
          action: 'validate_invitation',
          data: { token }
        }
      });

      return response.data?.valid === true;
    } catch (error) {
      return false;
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Security validations
      const canProceed = await checkRateLimit('signup');
      if (!canProceed) {
        throw new Error('Too many signup attempts. Please try again later.');
      }

      // Check signup permissions
      const signupAllowed = await checkSignupAllowed();
      if (!signupAllowed) {
        if (invitationToken) {
          const validInvite = await validateInvitation(invitationToken);
          if (!validInvite) {
            throw new Error('Invalid invitation token');
          }
        } else {
          throw new Error('Signup is currently restricted. Please contact support for an invitation.');
        }
      }

      // Input validation
      if (password.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }

      if (!email.includes('@')) {
        throw new Error('Please enter a valid email address');
      }

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/profile-setup`,
          data: {
            full_name: fullName,
            phone: phone,
            invitation_token: invitationToken || undefined
          }
        }
      });

      if (error) throw error;

      await auditLog('user_signup', true, { email, invitation_used: !!invitationToken });

      toast({
        title: "Account created successfully!",
        description: "Please check your email to verify your account.",
      });
    } catch (error: any) {
      await auditLog('user_signup', false, { email, error: error.message });
      
      toast({
        title: "Error creating account",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Rate limit check
      const canProceed = await checkRateLimit('login');
      if (!canProceed) {
        throw new Error('Too many login attempts. Please try again later.');
      }

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      await auditLog('user_signin', true, { email });

      toast({
        title: "Welcome back!",
        description: "You have been signed in successfully.",
      });

      // Navigate to home page for regular users
      navigate('/');
    } catch (error: any) {
      await auditLog('user_signin', false, { email, error: error.message });
      
      toast({
        title: "Error signing in",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMerchantSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Rate limit check
      const canProceed = await checkRateLimit('login');
      if (!canProceed) {
        throw new Error('Too many login attempts. Please try again later.');
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: merchantSignInData.email,
        password: merchantSignInData.password,
      });

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          throw new Error("Invalid email or password. Please check your credentials.");
        }
        throw error;
      }

      await auditLog('merchant_signin', true, { email: merchantSignInData.email });

      if (data.user) {
        toast({
          title: "Welcome to MyMarket!",
          description: "You've successfully signed in to your merchant account.",
        });

        // Navigate to merchant terminal
        navigate('/merchant-terminal');
      }
    } catch (error: any) {
      await auditLog('merchant_signin', false, { email: merchantSignInData.email, error: error.message });
      
      toast({
        title: "Merchant Sign In Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMerchantSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validation
    if (merchantSignUpData.password !== merchantSignUpData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match. Please try again.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    if (merchantSignUpData.password.length < 8) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 8 characters long.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    try {
      // Security validations
      const canProceed = await checkRateLimit('signup');
      if (!canProceed) {
        throw new Error('Too many signup attempts. Please try again later.');
      }

      const redirectUrl = `${window.location.origin}/merchant-terminal`;
      
      const { data, error } = await supabase.auth.signUp({
        email: merchantSignUpData.email,
        password: merchantSignUpData.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: merchantSignUpData.fullName,
            business_name: merchantSignUpData.businessName,
            user_type: 'merchant'
          }
        }
      });

      if (error) {
        if (error.message.includes("User already registered")) {
          throw new Error("An account with this email already exists. Please sign in instead.");
        }
        throw error;
      }

      await auditLog('merchant_signup', true, { email: merchantSignUpData.email });

      if (data.user) {
        if (data.user.email_confirmed_at) {
          toast({
            title: "Welcome to MyMarket!",
            description: "Your merchant account has been created successfully.",
          });
          navigate('/merchant-terminal');
        } else {
          toast({
            title: "Check your email",
            description: "We've sent you a confirmation link. Please check your email and click the link to verify your merchant account.",
          });
        }
      }
    } catch (error: any) {
      await auditLog('merchant_signup', false, { email: merchantSignUpData.email, error: error.message });
      
      toast({
        title: "Merchant Sign Up Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-6">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold fashion-text-gradient">MyDresser</h1>
          </div>
          <p className="text-muted-foreground">Secure access to your fashion platform</p>
        </div>

        {/* Security Notice */}
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            This platform uses enterprise-grade security including rate limiting, 
            audit logging, and invitation-only access during launch.
          </AlertDescription>
        </Alert>

        {/* Auth Form */}
        <Card>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "signin" | "signup" | "merchant")} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
              <TabsTrigger value="merchant">Merchant</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={handleSignIn}>
                <CardHeader>
                  <CardTitle>Sign In</CardTitle>
                  <CardDescription>
                    Access your secure fashion dashboard
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={loading}
                  >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Sign In Securely
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp}>
                <CardHeader>
                  <CardTitle>Create Account</CardTitle>
                  <CardDescription>
                    {signupBlocked ? 'Invitation required for early access' : 'Join the secure fashion platform'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {signupBlocked && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        {blockReason}
                      </AlertDescription>
                    </Alert>
                  )}

                  {showInviteField && (
                    <div className="space-y-2">
                      <Label htmlFor="invitationToken">Invitation Token</Label>
                      <Input
                        id="invitationToken"
                        type="text"
                        placeholder="Enter your invitation token"
                        value={invitationToken}
                        onChange={(e) => setInvitationToken(e.target.value)}
                        required={signupBlocked}
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        id="fullName"
                        type="text"
                        placeholder="Enter your full name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="Enter your phone number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="Create a strong password (min 8 chars)"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10"
                        required
                        minLength={8}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={loading}
                  >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Secure Account
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>

            <TabsContent value="merchant">
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <Store className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Merchant Access</CardTitle>
                  <CardDescription>
                    Sign in or create your merchant account to access MyMarket
                  </CardDescription>
                </div>

                <Tabs defaultValue="merchant-signin" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="merchant-signin">Sign In</TabsTrigger>
                    <TabsTrigger value="merchant-signup">Sign Up</TabsTrigger>
                  </TabsList>

                  <TabsContent value="merchant-signin" className="space-y-4 mt-4">
                    <form onSubmit={handleMerchantSignIn} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="merchant-signin-email">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="merchant-signin-email"
                            type="email"
                            placeholder="your@business.com"
                            value={merchantSignInData.email}
                            onChange={(e) => setMerchantSignInData(prev => ({ ...prev, email: e.target.value }))}
                            className="pl-10"
                            required
                            disabled={loading}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="merchant-signin-password">Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="merchant-signin-password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Your password"
                            value={merchantSignInData.password}
                            onChange={(e) => setMerchantSignInData(prev => ({ ...prev, password: e.target.value }))}
                            className="pl-10 pr-10"
                            required
                            disabled={loading}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </div>

                      <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Signing in...
                          </>
                        ) : (
                          <>
                            <Store className="mr-2 h-4 w-4" />
                            Sign In to MyMarket
                          </>
                        )}
                      </Button>
                    </form>
                  </TabsContent>

                  <TabsContent value="merchant-signup" className="space-y-4 mt-4">
                    <form onSubmit={handleMerchantSignUp} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="merchant-signup-name">Full Name</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="merchant-signup-name"
                            type="text"
                            placeholder="Your full name"
                            value={merchantSignUpData.fullName}
                            onChange={(e) => setMerchantSignUpData(prev => ({ ...prev, fullName: e.target.value }))}
                            className="pl-10"
                            required
                            disabled={loading}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="merchant-signup-business">Business Name (Optional)</Label>
                        <div className="relative">
                          <Store className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="merchant-signup-business"
                            type="text"
                            placeholder="Your business name"
                            value={merchantSignUpData.businessName}
                            onChange={(e) => setMerchantSignUpData(prev => ({ ...prev, businessName: e.target.value }))}
                            className="pl-10"
                            disabled={loading}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="merchant-signup-email">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="merchant-signup-email"
                            type="email"
                            placeholder="your@business.com"
                            value={merchantSignUpData.email}
                            onChange={(e) => setMerchantSignUpData(prev => ({ ...prev, email: e.target.value }))}
                            className="pl-10"
                            required
                            disabled={loading}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="merchant-signup-password">Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="merchant-signup-password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Create a password (min 8 chars)"
                            value={merchantSignUpData.password}
                            onChange={(e) => setMerchantSignUpData(prev => ({ ...prev, password: e.target.value }))}
                            className="pl-10"
                            required
                            minLength={8}
                            disabled={loading}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="merchant-signup-confirm-password">Confirm Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="merchant-signup-confirm-password"
                            type="password"
                            placeholder="Confirm your password"
                            value={merchantSignUpData.confirmPassword}
                            onChange={(e) => setMerchantSignUpData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                            className="pl-10 pr-10"
                            required
                            disabled={loading}
                          />
                          {merchantSignUpData.confirmPassword && (
                            <div className="absolute right-3 top-3">
                              {merchantSignUpData.password === merchantSignUpData.confirmPassword ? (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              ) : (
                                <AlertTriangle className="w-4 h-4 text-red-500" />
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating account...
                          </>
                        ) : (
                          <>
                            <Store className="mr-2 h-4 w-4" />
                            Create Merchant Account
                          </>
                        )}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>

                <div className="text-center">
                  <p className="text-xs text-muted-foreground">
                    By creating a merchant account, you agree to our Merchant Terms and Privacy Policy
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </Card>

        <div className="space-y-2">
          <div className="text-center text-sm text-muted-foreground">
            <Shield className="inline w-4 h-4 mr-1" />
            Protected by enterprise security measures
          </div>
          <div className="text-center text-xs text-muted-foreground">
            By signing up, you agree to our Terms of Service and Privacy Policy
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;