import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  Smartphone, 
  Mail, 
  Key, 
  QrCode, 
  Copy, 
  Check,
  AlertTriangle,
  Download
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MFASetupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MFASetup = ({ open, onOpenChange }: MFASetupProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [mfaMethod, setMfaMethod] = useState<'app' | 'sms' | 'email'>('app');
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [qrCode] = useState('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==');
  const [secretKey] = useState('JBSWY3DPEHPK3PXP');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: 'Copied to clipboard',
      description: 'Secret key copied successfully'
    });
  };

  const generateBackupCodes = () => {
    const codes = Array.from({ length: 10 }, () => 
      Math.random().toString(36).substring(2, 8).toUpperCase()
    );
    setBackupCodes(codes);
  };

  const downloadBackupCodes = () => {
    const content = `MyDresser Backup Codes\n\nGenerated on: ${new Date().toLocaleDateString()}\n\n${backupCodes.map((code, i) => `${i + 1}. ${code}`).join('\n')}\n\nKeep these codes safe! Each can only be used once.`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mydresser-backup-codes.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const verifyMFA = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast({
        title: 'Invalid code',
        description: 'Please enter a 6-digit verification code',
        variant: 'destructive'
      });
      return;
    }

    // Simulate verification
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      generateBackupCodes();
      setCurrentStep(3);
      toast({
        title: 'MFA Enabled',
        description: 'Two-factor authentication has been successfully enabled'
      });
    } catch (error) {
      toast({
        title: 'Verification failed',
        description: 'Invalid verification code. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const completeMFASetup = () => {
    toast({
      title: 'Setup Complete',
      description: 'Multi-factor authentication is now active on your account'
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-600" />
            Enable Two-Factor Authentication
          </DialogTitle>
        </DialogHeader>

        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <Shield className="w-16 h-16 mx-auto text-green-600" />
              <h3 className="text-lg font-semibold">Secure Your Account</h3>
              <p className="text-muted-foreground">
                Add an extra layer of security to your MyDresser account with two-factor authentication
              </p>
            </div>

            <Tabs value={mfaMethod} onValueChange={(value) => setMfaMethod(value as any)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="app" className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4" />
                  Authenticator App
                </TabsTrigger>
                <TabsTrigger value="sms" className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4" />
                  SMS
                </TabsTrigger>
                <TabsTrigger value="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </TabsTrigger>
              </TabsList>

              <TabsContent value="app" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Smartphone className="w-5 h-5" />
                      Authenticator App
                    </CardTitle>
                    <CardDescription>
                      Use an authenticator app like Google Authenticator or Authy
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <h4 className="font-medium">Step 1: Scan QR Code</h4>
                        <div className="bg-white p-4 rounded-lg border">
                          <img src={qrCode} alt="QR Code" className="w-40 h-40 mx-auto bg-gray-200" />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Scan this QR code with your authenticator app
                        </p>
                      </div>
                      
                      <div className="space-y-3">
                        <h4 className="font-medium">Step 2: Manual Entry</h4>
                        <p className="text-sm text-muted-foreground">
                          Or enter this secret key manually:
                        </p>
                        <div className="flex items-center gap-2">
                          <code className="bg-muted px-2 py-1 rounded text-sm font-mono flex-1">
                            {secretKey}
                          </code>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard(secretKey)}
                          >
                            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="sms" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Smartphone className="w-5 h-5" />
                      SMS Verification
                    </CardTitle>
                    <CardDescription>
                      Receive verification codes via SMS
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+1 (555) 123-4567"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                      />
                    </div>
                    <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                        <div className="text-sm">
                          <p className="font-medium text-yellow-800">SMS charges may apply</p>
                          <p className="text-yellow-700">
                            Standard message rates from your carrier may apply for verification codes.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="email" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Mail className="w-5 h-5" />
                      Email Verification
                    </CardTitle>
                    <CardDescription>
                      Receive verification codes via email
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                      <p className="text-sm text-blue-800">
                        Verification codes will be sent to your registered email address.
                        Make sure you have access to your email account.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={() => setCurrentStep(2)} className="flex-1">
                Continue
              </Button>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <Key className="w-16 h-16 mx-auto text-blue-600" />
              <h3 className="text-lg font-semibold">Verify Setup</h3>
              <p className="text-muted-foreground">
                Enter the 6-digit code from your {mfaMethod === 'app' ? 'authenticator app' : mfaMethod === 'sms' ? 'SMS message' : 'email'}
              </p>
            </div>

            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="verification-code">Verification Code</Label>
                  <Input
                    id="verification-code"
                    type="text"
                    placeholder="123456"
                    maxLength={6}
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                    className="text-center text-lg tracking-widest"
                  />
                </div>

                {mfaMethod === 'sms' && (
                  <Button variant="outline" size="sm">
                    Resend SMS Code
                  </Button>
                )}

                {mfaMethod === 'email' && (
                  <Button variant="outline" size="sm">
                    Resend Email Code
                  </Button>
                )}
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setCurrentStep(1)}>
                Back
              </Button>
              <Button onClick={verifyMFA} className="flex-1" disabled={verificationCode.length !== 6}>
                Verify & Enable
              </Button>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <Check className="w-16 h-16 mx-auto text-green-600" />
              <h3 className="text-lg font-semibold">Setup Complete!</h3>
              <p className="text-muted-foreground">
                Two-factor authentication is now enabled on your account
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="w-5 h-5" />
                  Backup Codes
                </CardTitle>
                <CardDescription>
                  Save these backup codes in a safe place. Each code can only be used once.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                  {backupCodes.map((code, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                      <span className="text-muted-foreground">{index + 1}.</span>
                      <span>{code}</span>
                    </div>
                  ))}
                </div>
                
                <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-red-800">Important:</p>
                      <ul className="text-red-700 mt-1 space-y-1">
                        <li>• Save these codes in a secure location</li>
                        <li>• Each code can only be used once</li>
                        <li>• Use them if you lose access to your authenticator</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <Button onClick={downloadBackupCodes} variant="outline" className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Download Backup Codes
                </Button>
              </CardContent>
            </Card>

            <Button onClick={completeMFASetup} className="w-full">
              Finish Setup
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default MFASetup;