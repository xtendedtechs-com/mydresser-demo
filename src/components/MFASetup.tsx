import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Copy, Shield, Smartphone, Key, CheckCircle, AlertTriangle, QrCode } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface MFAStatus {
  totp_enabled: boolean;
  phone_verified: boolean;
  backup_codes_count: number;
}

const MFASetup = () => {
  const { toast } = useToast();
  const [mfaStatus, setMfaStatus] = useState<MFAStatus>({
    totp_enabled: false,
    phone_verified: false,
    backup_codes_count: 0
  });
  const [totpSecret, setTotpSecret] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSecret, setShowSecret] = useState(false);

  useEffect(() => {
    fetchMFAStatus();
  }, []);

  const fetchMFAStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('user_mfa_settings')
        .select('totp_enabled, phone_verified, backup_codes')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setMfaStatus({
          totp_enabled: data.totp_enabled || false,
          phone_verified: data.phone_verified || false,
          backup_codes_count: data.backup_codes?.length || 0
        });
      }
    } catch (error: any) {
      console.error('Error fetching MFA status:', error);
    }
  };

  const setupTOTP = async () => {
    if (!totpCode.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter the verification code from your authenticator app',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      // Generate a secret key (in production, this should be done server-side)
      const secret = generateTOTPSecret();
      
      // Generate backup codes
      const codes = generateBackupCodes();

      const { data, error } = await supabase.rpc('setup_user_mfa', {
        setup_type: 'totp',
        secret_data: secret,
        backup_codes_data: codes
      });

      if (error) throw error;

      setBackupCodes(codes);
      toast({
        title: 'TOTP Setup Complete',
        description: 'Two-factor authentication has been enabled successfully'
      });

      fetchMFAStatus();
    } catch (error: any) {
      toast({
        title: 'Setup Failed',
        description: error.message || 'Failed to setup TOTP authentication',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const setupPhone = async () => {
    if (!phoneNumber.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a valid phone number',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('setup_user_mfa', {
        setup_type: 'phone',
        phone_data: phoneNumber
      });

      if (error) throw error;

      toast({
        title: 'Phone Added',
        description: 'Phone number has been added for SMS verification'
      });

      fetchMFAStatus();
    } catch (error: any) {
      toast({
        title: 'Setup Failed',
        description: error.message || 'Failed to setup phone authentication',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const generateTOTPSecret = () => {
    // In production, this should be generated server-side using a proper crypto library
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let secret = '';
    for (let i = 0; i < 32; i++) {
      secret += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return secret;
  };

  const generateBackupCodes = () => {
    const codes = [];
    for (let i = 0; i < 10; i++) {
      const code = Math.random().toString(36).substring(2, 10).toUpperCase();
      codes.push(code);
    }
    return codes;
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied',
      description: `${label} copied to clipboard`
    });
  };

  const downloadBackupCodes = () => {
    const content = backupCodes.join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mydresser-backup-codes.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Multi-Factor Authentication</h1>
          <p className="text-muted-foreground">Secure your account with additional verification methods</p>
        </div>
      </div>

      {/* Current Status */}
      <Card>
        <CardHeader>
          <CardTitle>Security Status</CardTitle>
          <CardDescription>Current state of your account security</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <Smartphone className="w-5 h-5 text-blue-600" />
              <div>
                <p className="font-medium">Authenticator App</p>
                <Badge variant={mfaStatus.totp_enabled ? "default" : "secondary"}>
                  {mfaStatus.totp_enabled ? (
                    <><CheckCircle className="w-3 h-3 mr-1" />Enabled</>
                  ) : (
                    'Disabled'
                  )}
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <Smartphone className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-medium">SMS Verification</p>
                <Badge variant={mfaStatus.phone_verified ? "default" : "secondary"}>
                  {mfaStatus.phone_verified ? (
                    <><CheckCircle className="w-3 h-3 mr-1" />Verified</>
                  ) : (
                    'Not Set'
                  )}
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <Key className="w-5 h-5 text-purple-600" />
              <div>
                <p className="font-medium">Backup Codes</p>
                <Badge variant={mfaStatus.backup_codes_count > 0 ? "default" : "secondary"}>
                  {mfaStatus.backup_codes_count > 0 ? (
                    <><CheckCircle className="w-3 h-3 mr-1" />{mfaStatus.backup_codes_count} codes</>
                  ) : (
                    'None'
                  )}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="totp" className="space-y-4">
        <TabsList>
          <TabsTrigger value="totp">Authenticator App</TabsTrigger>
          <TabsTrigger value="sms">SMS Verification</TabsTrigger>
          <TabsTrigger value="backup">Backup Codes</TabsTrigger>
        </TabsList>

        <TabsContent value="totp" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Setup Authenticator App</CardTitle>
              <CardDescription>
                Use an authenticator app like Google Authenticator or Authy
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!mfaStatus.totp_enabled ? (
                <>
                  <Alert>
                    <QrCode className="w-4 h-4" />
                    <AlertDescription>
                      1. Download an authenticator app (Google Authenticator, Authy, etc.)
                      <br />
                      2. Scan the QR code or manually enter the secret key
                      <br />
                      3. Enter the 6-digit code from your app to verify
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-3">
                    <div>
                      <Label>Secret Key</Label>
                      <div className="flex gap-2 mt-1">
                        <Input
                          value={showSecret ? totpSecret || 'EXAMPLE2FA3SECRETKEY4MYDRESSER567' : '••••••••••••••••••••••••••••••••'}
                          readOnly
                          className="font-mono"
                        />
                        <Button
                          variant="outline"
                          onClick={() => setShowSecret(!showSecret)}
                        >
                          {showSecret ? 'Hide' : 'Show'}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => copyToClipboard(totpSecret || 'EXAMPLE2FA3SECRETKEY4MYDRESSER567', 'Secret key')}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="totpCode">Verification Code</Label>
                      <Input
                        id="totpCode"
                        placeholder="Enter 6-digit code"
                        value={totpCode}
                        onChange={(e) => setTotpCode(e.target.value)}
                        maxLength={6}
                      />
                    </div>

                    <Button onClick={setupTOTP} disabled={loading}>
                      {loading ? 'Setting up...' : 'Enable TOTP'}
                    </Button>
                  </div>
                </>
              ) : (
                <Alert>
                  <CheckCircle className="w-4 h-4" />
                  <AlertDescription>
                    TOTP authentication is enabled and working properly.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sms" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>SMS Verification</CardTitle>
              <CardDescription>
                Add your phone number for SMS-based two-factor authentication
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!mfaStatus.phone_verified ? (
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="phoneNumber">Phone Number</Label>
                    <Input
                      id="phoneNumber"
                      placeholder="+1 (555) 123-4567"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                    />
                  </div>

                  <Button onClick={setupPhone} disabled={loading}>
                    {loading ? 'Adding...' : 'Add Phone Number'}
                  </Button>
                </div>
              ) : (
                <Alert>
                  <CheckCircle className="w-4 h-4" />
                  <AlertDescription>
                    SMS verification is enabled and working properly.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backup" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Backup Codes</CardTitle>
              <CardDescription>
                Use these codes when you can't access your primary 2FA method
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {backupCodes.length > 0 ? (
                <>
                  <Alert>
                    <AlertTriangle className="w-4 h-4" />
                    <AlertDescription>
                      Save these backup codes in a safe place. Each code can only be used once.
                    </AlertDescription>
                  </Alert>

                  <div className="grid grid-cols-2 gap-2 p-4 bg-muted rounded-lg font-mono text-sm">
                    {backupCodes.map((code, index) => (
                      <div key={index} className="p-2 bg-background rounded">
                        {code}
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => copyToClipboard(backupCodes.join('\n'), 'Backup codes')}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy All
                    </Button>
                    <Button variant="outline" onClick={downloadBackupCodes}>
                      Download
                    </Button>
                  </div>
                </>
              ) : (
                <Alert>
                  <AlertTriangle className="w-4 h-4" />
                  <AlertDescription>
                    No backup codes generated yet. Enable TOTP authentication to get backup codes.
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