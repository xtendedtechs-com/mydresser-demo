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
              <svg xmlns="http://www.w3.org/2000/svg" width="397" height="317" viewBox="0 0 397 317" fill="none">
                <path
                  d="M198.5 0.166748C180.128 0.166748 162.509 7.46491 149.518 20.4557C136.527 33.4465 129.229 51.0658 129.229 69.4376H168.813C168.813 61.564 171.94 54.0128 177.508 48.4453C183.075 42.8779 190.626 39.7501 198.5 39.7501C206.374 39.7501 213.925 42.8779 219.492 48.4453C225.06 54.0128 228.188 61.564 228.188 69.4376C228.188 77.3112 225.06 84.8623 219.492 90.4298C213.925 95.9973 206.374 99.1251 198.5 99.1251C187.615 99.1251 178.708 108.031 178.708 118.917V153.552L8.50004 281.208C5.1769 283.701 2.72219 287.176 1.48363 291.141C0.245061 295.105 0.285432 299.36 1.59902 303.3C2.9126 307.241 5.43281 310.669 8.80265 313.098C12.1725 315.526 16.2211 316.833 20.375 316.833H376.625C380.779 316.833 384.828 315.526 388.197 313.098C391.567 310.669 394.087 307.241 395.401 303.3C396.715 299.36 396.755 295.105 395.516 291.141C394.278 287.176 391.823 283.701 388.5 281.208L218.292 153.552V135.74C232.574 131.481 245.102 122.73 254.016 110.786C262.93 98.8419 267.753 84.3413 267.771 69.4376C267.771 51.0658 260.473 33.4465 247.482 20.4557C234.491 7.46491 216.872 0.166748 198.5 0.166748ZM198.5 188.188L317.25 277.25H79.75L198.5 188.188Z"
                  fill="black"
                />
              </svg>
              <span className="ml-2 text-2xl font-bold">MyDresser</span>
            </div>
            <div className="flex items-center space-x-4">
              <a href="/terminal">
                <Button variant="ghost" size="sm">
                  Merchant Terminal
                </Button>
              </a>
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
                <CardDescription>Bank-level encryption, audit logging, and compliance with GDPR/CCPA</CardDescription>
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
                <CardDescription>Smart wardrobe management and personalized style recommendations</CardDescription>
              </CardHeader>
            </Card>
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
              <a href="#" className="hover:text-foreground">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-foreground">
                Terms of Service
              </a>
              <a href="#" className="hover:text-foreground">
                Security
              </a>
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
