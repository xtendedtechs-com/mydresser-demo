import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { checkPasswordStrength, sanitizeInput } from '@/utils/security';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const accessToken = searchParams.get('access_token');
  const passwordStrength = checkPasswordStrength(password);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!accessToken) {
      toast.error('Invalid reset link. Please request a new one.');
      return;
    }

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (passwordStrength.score < 3) {
      toast.error('Password is too weak. ' + passwordStrength.feedback.join(', '));
      return;
    }

    setLoading(true);

    try {
      // Audit log: Password reset attempt
      await supabase.functions.invoke('auth-security', {
        body: {
          action: 'audit_log',
          user_id: null,
          event_action: 'password_reset_attempt',
          resource: 'auth.users',
          success: false,
          details: { via: 'reset_link' }
        }
      });

      const { error } = await supabase.auth.updateUser({
        password: sanitizeInput(password)
      });

      if (error) throw error;

      // Audit log: Successful password reset
      await supabase.functions.invoke('auth-security', {
        body: {
          action: 'audit_log',
          user_id: null,
          event_action: 'password_reset_success',
          resource: 'auth.users',
          success: true,
          details: { via: 'reset_link' }
        }
      });

      toast.success('Password reset successfully');
      navigate('/auth');
    } catch (error: any) {
      console.error('Password reset error:', error);
      toast.error(error.message || 'Failed to reset password');
      
      // Audit log: Failed password reset
      await supabase.functions.invoke('auth-security', {
        body: {
          action: 'audit_log',
          user_id: null,
          event_action: 'password_reset_failed',
          resource: 'auth.users',
          success: false,
          details: { error: error.message, via: 'reset_link' }
        }
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Reset Password</CardTitle>
          <CardDescription>
            Enter your new password below
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter new password"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              
              {password && (
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-1 flex-1 bg-border rounded overflow-hidden">
                      <div 
                        className={`h-full transition-all ${
                          passwordStrength.score < 2 ? 'bg-destructive' :
                          passwordStrength.score < 4 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {passwordStrength.score < 2 ? 'Weak' :
                       passwordStrength.score < 4 ? 'Medium' : 'Strong'}
                    </span>
                  </div>
                  {passwordStrength.feedback.length > 0 && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        {passwordStrength.feedback.join(', ')}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
              />
              {confirmPassword && password === confirmPassword && (
                <div className="flex items-center gap-1 text-sm text-green-600">
                  <CheckCircle size={16} />
                  <span>Passwords match</span>
                </div>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;
