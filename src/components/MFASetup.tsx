import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Shield, Smartphone, Key, CheckCircle, AlertTriangle } from 'lucide-react';

interface MFASetupProps {
  userId: string;
  onComplete?: () => void;
}

const MFASetup = ({ userId, onComplete }: MFASetupProps) => {
  const [loading, setLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [totpSecret, setTotpSecret] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [totpEnabled, setTotpEnabled] = useState(false);
  const [step, setStep] = useState<'setup' | 'verify'>('setup');
  const { toast } = useToast();

  const setupTOTP = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('mfa-service', {
        body: {
          action: 'setup_totp',
          data: { user_id: userId }
        }
      });

      if (error) throw error;

      setTotpSecret(data.secret);
      setQrCodeUrl(data.qrCodeUrl);
      setBackupCodes(data.backupCodes);
      setStep('verify');

      toast({
        title: "TOTP Setup Ready",
        description: "Scan the QR code with your authenticator app and enter the code to verify.",
      });
    } catch (error: any) {
      toast({
        title: "Setup Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const verifyTOTP = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('mfa-service', {
        body: {
          action: 'verify_totp',
          data: { user_id: userId, code: verificationCode }
        }
      });

      if (error) throw error;

      if (data.valid) {
        setTotpEnabled(true);
        toast({
          title: "TOTP Enabled",
          description: "Two-factor authentication is now active on your account.",
        });
        onComplete?.();
      } else {
        throw new Error('Invalid verification code');
      }
    } catch (error: any) {
      toast({
        title: "Verification Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const setupPhone = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('mfa-service', {
        body: {
          action: 'setup_phone',
          data: { user_id: userId, phone_number: phoneNumber }
        }
      });

      if (error) throw error;

      toast({
        title: "Verification Code Sent",
        description: "Check your phone for the verification code.",
      });
      setStep('verify');
    } catch (error: any) {
      toast({
        title: "Setup Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const verifyPhone = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('mfa-service', {
        body: {
          action: 'verify_phone',
          data: { user_id: userId, code: verificationCode }
        }
      });

      if (error) throw error;

      if (data.valid) {
        setPhoneVerified(true);
        toast({
          title: "Phone Verified",
          description: "SMS authentication is now available on your account.",
        });
        onComplete?.();
      } else {
        throw new Error('Invalid verification code');
      }
    } catch (error: any) {
      toast({
        title: "Verification Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Shield className="h-8 w-8 text-primary" />
          <h2 className="text-2xl font-bold">Multi-Factor Authentication</h2>
        </div>
        <p className="text-muted-foreground">
          Enhance your account security with two-factor authentication
        </p>
      </div>

      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          MFA adds an extra layer of security to your account. We recommend enabling both TOTP and SMS backup.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="totp" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="totp" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            Authenticator App
          </TabsTrigger>
          <TabsTrigger value="sms" className="flex items-center gap-2">
            <Smartphone className="h-4 w-4" />
            SMS Backup
          </TabsTrigger>
        </TabsList>

        <TabsContent value="totp">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                TOTP Authenticator
                {totpEnabled && <Badge variant="secondary"><CheckCircle className="h-3 w-3 mr-1" />Enabled</Badge>}
              </CardTitle>
              <CardDescription>
                Use apps like Google Authenticator, Authy, or 1Password
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {step === 'setup' && !totpEnabled && (
                <div className="space-y-4">
                  <Button onClick={setupTOTP} disabled={loading} className="w-full">
                    {loading ? 'Setting up...' : 'Setup TOTP Authentication'}
                  </Button>
                </div>
              )}

              {step === 'verify' && qrCodeUrl && !totpEnabled && (
                <div className="space-y-4">
                  <div className="text-center space-y-4">
                    <div className="p-4 bg-white rounded-lg inline-block">
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCodeUrl)}`}
                        alt="TOTP QR Code"
                        className="w-48 h-48"
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Scan this QR code with your authenticator app
                    </p>
                    <div className="text-xs text-muted-foreground p-2 bg-muted rounded">
                      Manual setup key: <code className="font-mono">{totpSecret}</code>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="totpCode">Enter verification code from your app</Label>
                    <Input
                      id="totpCode"
                      type="text"
                      placeholder="123456"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      maxLength={6}
                    />
                  </div>

                  <Button onClick={verifyTOTP} disabled={loading || verificationCode.length !== 6} className="w-full">
                    {loading ? 'Verifying...' : 'Verify & Enable TOTP'}
                  </Button>
                </div>
              )}

              {backupCodes.length > 0 && totpEnabled && (
                <div className="space-y-2">
                  <Label>Backup Codes (Save these securely!)</Label>
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                      {backupCodes.map((code, index) => (
                        <div key={index} className="p-1 bg-background rounded text-center">
                          {code}
                        </div>
                      ))}
                    </div>
                  </div>
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Save these backup codes in a secure location. They can be used to access your account if you lose your authenticator device.
                    </AlertDescription>
                  </Alert>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sms">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                SMS Authentication
                {phoneVerified && <Badge variant="secondary"><CheckCircle className="h-3 w-3 mr-1" />Verified</Badge>}
              </CardTitle>
              <CardDescription>
                Receive verification codes via SMS as a backup method
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {step === 'setup' && !phoneVerified && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Phone Number</Label>
                    <Input
                      id="phoneNumber"
                      type="tel"
                      placeholder="+1234567890"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                    />
                  </div>
                  <Button onClick={setupPhone} disabled={loading || !phoneNumber} className="w-full">
                    {loading ? 'Sending code...' : 'Send Verification Code'}
                  </Button>
                </div>
              )}

              {step === 'verify' && !phoneVerified && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="smsCode">Verification Code</Label>
                    <Input
                      id="smsCode"
                      type="text"
                      placeholder="123456"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      maxLength={6}
                    />
                  </div>
                  <Button onClick={verifyPhone} disabled={loading || verificationCode.length !== 6} className="w-full">
                    {loading ? 'Verifying...' : 'Verify Phone Number'}
                  </Button>
                </div>
              )}

              {phoneVerified && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    SMS authentication is set up for {phoneNumber}. You can now use SMS as a backup authentication method.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MFASetup;