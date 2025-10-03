import { useState } from 'react';
import { CheckCircle, Upload, AlertCircle, Shield, Award } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const ProfessionalVerification = () => {
  const { toast } = useToast();
  const [applying, setApplying] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState<'none' | 'pending' | 'approved' | 'rejected'>('none');
  const [verificationProgress, setVerificationProgress] = useState(0);

  const [formData, setFormData] = useState({
    experienceYears: '',
    qualifications: '',
    portfolioUrl: '',
    instagramHandle: '',
    tiktokHandle: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApplying(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Submit professional application
      const { error } = await supabase
        .from('professional_applications')
        .insert({
          user_id: user.id,
          experience_years: parseInt(formData.experienceYears) || 0,
          qualifications: formData.qualifications,
          portfolio_url: formData.portfolioUrl || null,
          social_verification: {
            instagram: formData.instagramHandle,
            tiktok: formData.tiktokHandle
          },
          application_status: 'pending'
        });

      if (error) throw error;

      setApplicationStatus('pending');
      toast({
        title: 'Application submitted! 🎉',
        description: 'We\'ll review your application within 2-3 business days'
      });

      // Simulate verification progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        setVerificationProgress(progress);
        if (progress >= 100) {
          clearInterval(interval);
        }
      }, 300);

    } catch (error) {
      console.error('Application error:', error);
      toast({
        title: 'Application failed',
        description: error instanceof Error ? error.message : 'Please try again',
        variant: 'destructive'
      });
    } finally {
      setApplying(false);
    }
  };

  if (applicationStatus === 'pending') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-yellow-600" />
            Application Under Review
          </CardTitle>
          <CardDescription>
            Your professional verification is being processed
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto">
              <Shield className="h-8 w-8 text-yellow-600" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Application Submitted</h3>
              <p className="text-sm text-muted-foreground mt-1">
                We're reviewing your credentials and portfolio
              </p>
            </div>
            <Progress value={verificationProgress} className="h-2" />
            <p className="text-xs text-muted-foreground">
              Verification Progress: {verificationProgress}%
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div className="flex-1">
                <p className="text-sm font-medium">Application Received</p>
                <p className="text-xs text-muted-foreground">Your details are in our system</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <div className="flex-1">
                <p className="text-sm font-medium">Credentials Verification</p>
                <p className="text-xs text-muted-foreground">Checking your qualifications</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <div className="h-5 w-5 rounded-full border-2 border-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">Social Verification</p>
                <p className="text-xs text-muted-foreground">Pending review</p>
              </div>
            </div>
          </div>

          <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200">
            <CardContent className="pt-4">
              <p className="text-sm">
                <strong>What happens next?</strong><br />
                Our team will verify your credentials within 2-3 business days. You'll receive an email once your application is approved.
              </p>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    );
  }

  if (applicationStatus === 'approved') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-green-600" />
            Professional Verified
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Congratulations! 🎉</h3>
            <p className="text-sm text-muted-foreground mt-1">
              You're now a verified MyDresser Professional
            </p>
          </div>
          <Badge className="bg-green-600 text-white">
            <Award className="h-3 w-3 mr-1" />
            Verified Professional
          </Badge>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Become a Verified Professional
        </CardTitle>
        <CardDescription>
          Unlock advanced features and build credibility as a fashion expert
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Benefits */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <Award className="h-6 w-6 mx-auto mb-2 text-primary" />
            <p className="text-sm font-medium">Verified Badge</p>
            <p className="text-xs text-muted-foreground mt-1">Stand out with verified status</p>
          </div>
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <Shield className="h-6 w-6 mx-auto mb-2 text-primary" />
            <p className="text-sm font-medium">Priority Support</p>
            <p className="text-xs text-muted-foreground mt-1">Get help when you need it</p>
          </div>
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <CheckCircle className="h-6 w-6 mx-auto mb-2 text-primary" />
            <p className="text-sm font-medium">Advanced Tools</p>
            <p className="text-xs text-muted-foreground mt-1">Access pro features</p>
          </div>
        </div>

        {/* Application Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="experienceYears">Years of Experience *</Label>
            <Input
              id="experienceYears"
              type="number"
              min="0"
              value={formData.experienceYears}
              onChange={(e) => setFormData({ ...formData, experienceYears: e.target.value })}
              placeholder="5"
              required
            />
          </div>

          <div>
            <Label htmlFor="qualifications">Qualifications & Certifications *</Label>
            <Textarea
              id="qualifications"
              value={formData.qualifications}
              onChange={(e) => setFormData({ ...formData, qualifications: e.target.value })}
              placeholder="Fashion Design Degree, Styling Certification, etc."
              rows={3}
              required
            />
          </div>

          <div>
            <Label htmlFor="portfolioUrl">Portfolio URL</Label>
            <Input
              id="portfolioUrl"
              type="url"
              value={formData.portfolioUrl}
              onChange={(e) => setFormData({ ...formData, portfolioUrl: e.target.value })}
              placeholder="https://yourportfolio.com"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="instagramHandle">Instagram Handle</Label>
              <Input
                id="instagramHandle"
                value={formData.instagramHandle}
                onChange={(e) => setFormData({ ...formData, instagramHandle: e.target.value })}
                placeholder="@yourusername"
              />
            </div>
            <div>
              <Label htmlFor="tiktokHandle">TikTok Handle</Label>
              <Input
                id="tiktokHandle"
                value={formData.tiktokHandle}
                onChange={(e) => setFormData({ ...formData, tiktokHandle: e.target.value })}
                placeholder="@yourusername"
              />
            </div>
          </div>

          <Button type="submit" disabled={applying} className="w-full" size="lg">
            {applying ? 'Submitting...' : 'Submit Application'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
