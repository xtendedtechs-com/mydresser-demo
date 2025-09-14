import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Users, Zap, Lock } from "lucide-react";
import { Link } from "react-router-dom";

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-primary" />
              <span className="ml-2 text-2xl font-bold">MyDresser</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/auth">
                <Button variant="outline">Sign In</Button>
              </Link>
              <Link to="/auth">
                <Button>Get Invited</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Your Personal Fashion
            <span className="text-primary block">Intelligence Platform</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Join our exclusive community of fashion enthusiasts. By invitation only during our launch phase.
          </p>
          <Link to="/auth">
            <Button size="lg" className="text-lg px-8 py-6">
              Request Your Invitation
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Why Fashion Leaders Choose Us</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Shield className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Enterprise Security</CardTitle>
                <CardDescription>
                  Bank-level encryption, audit logging, and compliance with GDPR/CCPA
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Users className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Exclusive Community</CardTitle>
                <CardDescription>
                  Invitation-only access ensures quality interactions and premium content
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Zap className="h-12 w-12 text-primary mb-4" />
                <CardTitle>AI-Powered Insights</CardTitle>
                <CardDescription>
                  Smart wardrobe management and personalized style recommendations
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Security Statement */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Lock className="h-16 w-16 text-primary mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-6">Privacy & Security First</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Your data is protected by enterprise-grade security measures including end-to-end encryption, 
            comprehensive audit trails, and strict compliance with global privacy regulations.
          </p>
          <div className="grid md:grid-cols-2 gap-6 text-left">
            <div>
              <h3 className="font-semibold mb-2">🔒 Data Protection</h3>
              <p className="text-sm text-muted-foreground">
                All personal information encrypted at rest and in transit
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">📋 GDPR Compliant</h3>
              <p className="text-sm text-muted-foreground">
                Full data portability and right to erasure
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">🛡️ Bot Protection</h3>
              <p className="text-sm text-muted-foreground">
                Advanced rate limiting and automated threat detection
              </p>
            </div>
            <div>
              <h3 className="font-semibent mb-2">📊 Audit Trails</h3>
              <p className="text-sm text-muted-foreground">
                Complete logging of all data access and modifications
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <Shield className="h-6 w-6 text-primary" />
              <span className="ml-2 font-semibold">MyDresser</span>
            </div>
            <div className="flex space-x-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground">Privacy Policy</a>
              <a href="#" className="hover:text-foreground">Terms of Service</a>
              <a href="#" className="hover:text-foreground">Security</a>
            </div>
          </div>
          <div className="mt-8 text-center text-sm text-muted-foreground">
            © 2024 MyDresser. All rights reserved. Invitation-only platform.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;