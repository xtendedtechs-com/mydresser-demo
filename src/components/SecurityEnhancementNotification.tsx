import { useState, useEffect } from "react";
import { CheckCircle, Shield, Lock, Eye } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const SecurityEnhancementNotification = () => {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if user has already seen this notification
    const hasSeenNotification = localStorage.getItem('security_enhancement_seen_v1');
    if (hasSeenNotification) {
      setDismissed(true);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem('security_enhancement_seen_v1', 'true');
    setDismissed(true);
  };

  if (dismissed) return null;

  const securityFeatures = [
    {
      icon: <Lock className="h-4 w-4" />,
      title: "Customer Data Encryption",
      description: "All customer payment and personal data is now encrypted and masked"
    },
    {
      icon: <Shield className="h-4 w-4" />,
      title: "Enhanced Authentication",
      description: "Robust session validation and admin action logging implemented"
    },
    {
      icon: <Eye className="h-4 w-4" />,
      title: "Secure Token Management", 
      description: "Invitation tokens are cryptographically hashed for maximum security"
    }
  ];

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <CheckCircle className="h-5 w-5" />
          Security Enhancements Applied
          <Badge variant="outline" className="ml-auto">
            NEW
          </Badge>
        </CardTitle>
        <CardDescription>
          Your MyDresser platform now includes advanced security measures to protect user data and privacy.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 mb-4">
          {securityFeatures.map((feature, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className="flex-shrink-0 text-primary mt-0.5">
                {feature.icon}
              </div>
              <div>
                <div className="font-medium text-sm">{feature.title}</div>
                <div className="text-xs text-muted-foreground">{feature.description}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={handleDismiss}>
            Got it
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SecurityEnhancementNotification;