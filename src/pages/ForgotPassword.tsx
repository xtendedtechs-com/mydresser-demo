import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { rateLimiter, securitySchemas } from '@/utils/security';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Mail } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    // Rate limiting
    if (!rateLimiter.check(`forgot-password-${email}`, 3, 15 * 60 * 1000)) {
      toast.error('Too many password reset attempts. Please try again in 15 minutes.');
      return;
    }

    // Validate email
    const emailValidation = securitySchemas.email.safeParse(email);
    if (!emailValidation.success) {
      toast.error('Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      // Audit log: Password reset requested
      await supabase.functions.invoke('auth-security', {
        body: {
          action: 'audit_log',
          user_id: null,
          event_action: 'password_reset_requested',
          resource: 'auth.users',
          success: false,
          details: { email, via: 'forgot_password' }
        }
      });

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      // Audit log: Reset email sent
      await supabase.functions.invoke('auth-security', {
        body: {
          action: 'audit_log',
          user_id: null,
          event_action: 'password_reset_email_sent',
          resource: 'auth.users',
          success: true,
          details: { email, via: 'forgot_password' }
        }
      });

      setEmailSent(true);
      toast.success('Password reset link sent to your email');
    } catch (error: any) {
      console.error('Forgot password error:', error);
      // Don't reveal if email exists - security best practice
      setEmailSent(true);
      toast.success('If that email exists, a reset link has been sent');
      
      // Audit log: Failed attempt
      await supabase.functions.invoke('auth-security', {
        body: {
          action: 'audit_log',
          user_id: null,
          event_action: 'password_reset_failed',
          resource: 'auth.users',
          success: false,
          details: { email, error: error.message, via: 'forgot_password' }
        }
      });
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>Check Your Email</CardTitle>
            <CardDescription>
              We've sent a password reset link to <strong>{email}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertDescription className="text-sm">
                Click the link in the email to reset your password. The link will expire in 1 hour.
              </AlertDescription>
            </Alert>
            <Button asChild variant="outline" className="w-full">
              <Link to="/auth">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Sign In
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Forgot Password?</CardTitle>
          <CardDescription>
            Enter your email address and we'll send you a link to reset your password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </Button>

            <Button asChild variant="ghost" className="w-full">
              <Link to="/auth">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Sign In
              </Link>
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPassword;
