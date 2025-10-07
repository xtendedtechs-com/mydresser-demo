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
              <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 50 50" fill="none">
                <path
                  d="M25.0001 8.33325C23.0662 8.33325 21.2115 9.10148 19.8441 10.4689C18.4766 11.8364 17.7084 13.691 17.7084 15.6249H21.8751C21.8751 14.7961 22.2043 14.0013 22.7904 13.4152C23.3764 12.8292 24.1713 12.4999 25.0001 12.4999C25.8289 12.4999 26.6237 12.8292 27.2098 13.4152C27.7958 14.0013 28.1251 14.7961 28.1251 15.6249C28.1251 16.4537 27.7958 17.2486 27.2098 17.8346C26.6237 18.4207 25.8289 18.7499 25.0001 18.7499C23.8542 18.7499 22.9167 19.6874 22.9167 20.8333V24.4791L5.00008 37.9166C4.65028 38.1789 4.39189 38.5447 4.26151 38.9621C4.13114 39.3794 4.13539 39.8272 4.27366 40.2421C4.41193 40.6569 4.67721 41.0177 5.03193 41.2733C5.38665 41.529 5.81283 41.6666 6.25008 41.6666H43.7501C44.1873 41.6666 44.6135 41.529 44.9682 41.2733C45.3229 41.0177 45.5882 40.6569 45.7265 40.2421C45.8648 39.8272 45.869 39.3794 45.7386 38.9621C45.6083 38.5447 45.3499 38.1789 45.0001 37.9166L27.0834 24.4791V22.6041C28.5868 22.1559 29.9056 21.2347 30.8439 19.9774C31.7821 18.7201 32.2899 17.1937 32.2917 15.6249C32.2917 13.691 31.5235 11.8364 30.1561 10.4689C28.7886 9.10148 26.9339 8.33325 25.0001 8.33325ZM25.0001 28.1249L37.5001 37.4999H12.5001L25.0001 28.1249Z"
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
