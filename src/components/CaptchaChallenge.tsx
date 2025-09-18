import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface CaptchaChallengeProps {
  onSuccess: (token: string) => void;
  onError: (error: string) => void;
  requestCount?: number;
}

export const CaptchaChallenge: React.FC<CaptchaChallengeProps> = ({
  onSuccess,
  onError,
  requestCount = 1
}) => {
  const [challenge, setChallenge] = useState<string>('');
  const [answer, setAnswer] = useState('');
  const [token, setToken] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [showCaptcha, setShowCaptcha] = useState(false);

  const generateCaptcha = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('captcha-verification', {
        body: { 
          action: 'generate',
          userAgent: navigator.userAgent,
          requestCount
        }
      });
      
      if (error) throw error;
      
      if (data?.requireCaptcha) {
        setChallenge(data.challenge);
        setToken(data.token);
        setShowCaptcha(true);
      } else {
        setShowCaptcha(false);
        onSuccess(''); // No CAPTCHA required
      }
    } catch (error: any) {
      console.error('Error generating CAPTCHA:', error);
      onError('Failed to generate CAPTCHA challenge');
    } finally {
      setLoading(false);
    }
  };

  const verifyCaptcha = async () => {
    if (!challenge || !answer) {
      onError('Please solve the math problem');
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('captcha-verification', {
        body: {
          action: 'verify',
          challenge,
          answer
        }
      });
      
      if (error) throw error;
      
      if (data?.valid) {
        onSuccess(token);
      } else {
        onError('Incorrect answer. Please try again.');
        setAnswer('');
      }
    } catch (error: any) {
      console.error('Error verifying CAPTCHA:', error);
      onError('Failed to verify CAPTCHA');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  if (!showCaptcha) {
    return null;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          Security Verification
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={generateCaptcha}
            disabled={loading}
          >
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <Label className="text-lg font-mono bg-muted p-3 rounded border-2 border-dashed">
            {challenge} = ?
          </Label>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="captcha-answer">Enter the answer:</Label>
          <div className="flex gap-2">
            <Input
              id="captcha-answer"
              type="number"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Your answer"
              disabled={loading}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  verifyCaptcha();
                }
              }}
            />
            <Button
              type="button"
              onClick={verifyCaptcha}
              disabled={loading || !answer}
              size="sm"
            >
              {loading ? 'Verifying...' : 'Verify'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};