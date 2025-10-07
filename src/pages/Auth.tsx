import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
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
import SupabaseCaptcha from "@/components/SupabaseCaptcha";

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
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin");
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  // CAPTCHA states
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [captchaToken, setCaptchaToken] = useState("");
  const [requestCount, setRequestCount] = useState(0);

  // Get invitation token from URL parameters
  useEffect(() => {
    const inviteToken = searchParams.get("invite");
    if (inviteToken) {
      setInvitationToken(inviteToken);
      setShowInviteField(true);
    }
  }, [searchParams]);

  // Check if signup is allowed
  const checkSignupAllowed = async () => {
    try {
      const response = await supabase.functions.invoke("auth-security", {
        body: { action: "check_signup_allowed" },
      });

      if (response.data) {
        if (!response.data.allowed) {
          setSignupBlocked(true);
          setBlockReason(response.data.reason || "Signup is currently disabled");
          setShowInviteField(true);
        }
        return response.data.allowed;
      }
      return false;
    } catch (error) {
      setSignupBlocked(true);
      setBlockReason("Unable to verify signup permissions. Please try again later.");
      return false;
    }
  };

  // Rate limiting check
  const checkRateLimit = async (action: string) => {
    try {
      const identifier = `${window.location.hostname}_${Date.now()}`;
      const response = await supabase.functions.invoke("auth-security", {
        body: {
          action: "rate_limit_check",
          data: {
            identifier,
            action,
            limit: action === "login" ? 5 : 3,
            windowMinutes: 15,
          },
        },
      });

      return response.data?.allowed !== false;
    } catch (error) {
      console.warn("Rate limit check failed:", error);
      return true; // Allow on error to not block legitimate users
    }
  };

  // Security audit logging
  const auditLog = async (action: string, success: boolean, details?: any) => {
    try {
      await supabase.functions.invoke("auth-security", {
        body: {
          action: "audit_log",
          data: {
            action,
            success,
            details,
            resource: "auth",
          },
        },
      });
    } catch (error) {
      console.warn("Audit logging failed:", error);
    }
  };

  const validateInvitation = async (token: string) => {
    try {
      const response = await supabase.functions.invoke("auth-security", {
        body: {
          action: "validate_invitation",
          data: { token },
        },
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
      const canProceed = await checkRateLimit("signup");
      if (!canProceed) {
        throw new Error("Too many signup attempts. Please try again later.");
      }

      // Check signup permissions
      const signupAllowed = await checkSignupAllowed();
      if (!signupAllowed) {
        if (invitationToken) {
          const validInvite = await validateInvitation(invitationToken);
          if (!validInvite) {
            throw new Error("Invalid invitation token");
          }
        } else {
          throw new Error("Signup is currently restricted. Please contact support for an invitation.");
        }
      }

      // Input validation
      if (password.length < 8) {
        throw new Error("Password must be at least 8 characters long");
      }

      if (!email.includes("@")) {
        throw new Error("Please enter a valid email address");
      }

      // Prepare auth options
      const authOptions = {
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/profile-setup`,
          data: {
            full_name: fullName,
            phone: phone,
            invitation_token: invitationToken || undefined,
          },
        },
      };

      // CAPTCHA disabled for testing: no captchaToken passed
      const { error } = await supabase.auth.signUp(authOptions as any);

      if (error) throw error;

      await auditLog("user_signup", true, { email, invitation_used: !!invitationToken });

      // Reset CAPTCHA state on success
      setShowCaptcha(false);
      setCaptchaToken("");

      toast({
        title: "Account created successfully!",
        description: "Please check your email to verify your account.",
      });
    } catch (error: any) {
      await auditLog("user_signup", false, { email, error: error.message });

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
      const canProceed = await checkRateLimit("login");
      if (!canProceed) {
        throw new Error("Too many login attempts. Please try again later.");
      }

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      await auditLog("user_signin", true, { email });

      // Reset CAPTCHA state on success
      setShowCaptcha(false);
      setCaptchaToken("");

      toast({
        title: "Welcome back!",
        description: "You have been signed in successfully.",
      });

      // Get user data and navigate appropriately - regular users go to main app
      navigate("/");
    } catch (error: any) {
      await auditLog("user_signin", false, { email, error: error.message });

      toast({
        title: "Error signing in",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Remove merchant handlers - they're now in separate MerchantAuth component

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-6">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
              <path
                d="M16.0001 5.33325C14.7624 5.33325 13.5754 5.82492 12.7002 6.70009C11.8251 7.57526 11.3334 8.76224 11.3334 9.99992H14.0001C14.0001 9.46949 14.2108 8.96078 14.5859 8.58571C14.9609 8.21063 15.4696 7.99992 16.0001 7.99992C16.5305 7.99992 17.0392 8.21063 17.4143 8.58571C17.7894 8.96078 18.0001 9.46949 18.0001 9.99992C18.0001 10.5304 17.7894 11.0391 17.4143 11.4141C17.0392 11.7892 16.5305 11.9999 16.0001 11.9999C15.2667 11.9999 14.6667 12.5999 14.6667 13.3333V15.6666L3.20008 24.2666C2.97621 24.4345 2.81084 24.6686 2.7274 24.9357C2.64396 25.2028 2.64668 25.4894 2.73517 25.7549C2.82366 26.0204 2.99345 26.2513 3.22047 26.4149C3.44749 26.5785 3.72024 26.6666 4.00008 26.6666H28.0001C28.2799 26.6666 28.5527 26.5785 28.7797 26.4149C29.0067 26.2513 29.1765 26.0204 29.265 25.7549C29.3535 25.4894 29.3562 25.2028 29.2728 24.9357C29.1893 24.6686 29.024 24.4345 28.8001 24.2666L17.3334 15.6666V14.4666C18.2956 14.1797 19.1396 13.5902 19.7401 12.7855C20.3406 11.9808 20.6656 11.004 20.6667 9.99992C20.6667 8.76224 20.1751 7.57526 19.2999 6.70009C18.4247 5.82492 17.2378 5.33325 16.0001 5.33325ZM16.0001 17.9999L24.0001 23.9999H8.00008L16.0001 17.9999Z"
                fill="black"
              />
            </svg>
            <h1 className="text-3xl font-bold fashion-text-gradient">MyDresser</h1>
          </div>
          <p className="text-muted-foreground">Taking care of what you wear.</p>
        </div>

        {/* Auth Form */}
        <Card>
          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as "signin" | "signup")}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={handleSignIn}>
                <CardHeader>
                  <CardTitle>Sign In</CardTitle>
                  <CardDescription>Log in to MyDresser.</CardDescription>
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

                  {/* CAPTCHA temporarily disabled for testing */}
                  {/* <div className="mt-4">
                    <SupabaseCaptcha onVerify={(token) => setCaptchaToken(token)} />
                  </div> */}
                </CardContent>
                <CardFooter className="flex flex-col gap-2">
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Sign In
                  </Button>
                  <div className="text-center w-full">
                    <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                      Forgot your password?
                    </Link>
                  </div>
                </CardFooter>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp}>
                <CardHeader>
                  <CardTitle>Create Account</CardTitle>
                  <CardDescription>
                    {signupBlocked ? "Invitation required for early access" : "Join the fashion platform"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {signupBlocked && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>{blockReason}</AlertDescription>
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

                  {/* CAPTCHA temporarily disabled for testing */}
                  {/* <div className="mt-4">
                    <SupabaseCaptcha onVerify={(token) => setCaptchaToken(token)} />
                  </div> */}
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Account
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>
          </Tabs>
        </Card>

        <div className="space-y-2">
          <div className="text-center text-sm text-muted-foreground">Wearing without worrying.</div>
          <div className="text-center">
            <a href="/terminal">
              <Button variant="link">Are you a merchant? Access MyMarket here</Button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
