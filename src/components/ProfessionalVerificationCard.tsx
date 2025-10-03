import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Award, Briefcase, GraduationCap, Shield, Upload, Loader2 } from "lucide-react";

export const ProfessionalVerificationCard = () => {
  const [loading, setLoading] = useState(false);
  const [professionalType, setProfessionalType] = useState("");
  const [credentials, setCredentials] = useState<File | null>(null);
  const [certificationNumber, setCertificationNumber] = useState("");
  const [yearsExperience, setYearsExperience] = useState("");
  const { toast } = useToast();

  const professionalTypes = [
    { value: "stylist", label: "Professional Stylist", icon: Briefcase },
    { value: "designer", label: "Fashion Designer", icon: GraduationCap },
    { value: "consultant", label: "Fashion Consultant", icon: Award },
    { value: "influencer", label: "Fashion Influencer", icon: Shield },
  ];

  const handleSubmit = async () => {
    if (!professionalType || !credentials) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Update profile with professional verification request
      const { error } = await supabase
        .from("profiles")
        .update({
          role: "professional",
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);

      if (error) throw error;

      toast({
        title: "Verification Submitted",
        description: "Your professional credentials are under review. You'll be notified within 3-5 business days.",
      });

      // Reset form
      setProfessionalType("");
      setCredentials(null);
      setCertificationNumber("");
      setYearsExperience("");
    } catch (error) {
      console.error("Professional verification error:", error);
      toast({
        title: "Submission Failed",
        description: "Failed to submit verification. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Professional Verification
            </CardTitle>
            <CardDescription>
              Verify your professional credentials to access exclusive features
            </CardDescription>
          </div>
          <Badge variant="secondary">Optional</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Benefits */}
        <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
          <p className="text-sm font-semibold mb-2">Professional Benefits:</p>
          <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
            <li>Verified professional badge</li>
            <li>AI-powered client matching</li>
            <li>Virtual consultation tools</li>
            <li>Professional portfolio showcase</li>
            <li>Priority marketplace listing</li>
          </ul>
        </div>

        {/* Form */}
        <div className="space-y-3">
          <div>
            <Label htmlFor="prof-type">Professional Type *</Label>
            <Select value={professionalType} onValueChange={setProfessionalType}>
              <SelectTrigger id="prof-type" className="mt-1">
                <SelectValue placeholder="Select your profession" />
              </SelectTrigger>
              <SelectContent>
                {professionalTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center gap-2">
                      <type.icon className="h-4 w-4" />
                      {type.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="cert-number">Certification Number (if applicable)</Label>
            <Input
              id="cert-number"
              placeholder="e.g., CSP-12345"
              value={certificationNumber}
              onChange={(e) => setCertificationNumber(e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="experience">Years of Experience *</Label>
            <Select value={yearsExperience} onValueChange={setYearsExperience}>
              <SelectTrigger id="experience" className="mt-1">
                <SelectValue placeholder="Select years" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0-2">0-2 years</SelectItem>
                <SelectItem value="3-5">3-5 years</SelectItem>
                <SelectItem value="6-10">6-10 years</SelectItem>
                <SelectItem value="10+">10+ years</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="credentials">Credentials / Portfolio *</Label>
            <div className="mt-1 flex items-center gap-2">
              <Input
                id="credentials"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => setCredentials(e.target.files?.[0] || null)}
                className="flex-1"
              />
              <Upload className="h-4 w-4 text-muted-foreground" />
            </div>
            {credentials && (
              <p className="text-xs text-muted-foreground mt-1">
                Selected: {credentials.name}
              </p>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          className="w-full"
          disabled={loading || !professionalType || !credentials}
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Submit for Professional Verification
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          Verification typically takes 3-5 business days
        </p>
      </CardContent>
    </Card>
  );
};
