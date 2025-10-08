import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Store, TrendingUp, Users, Shield, BarChart3, Package } from "lucide-react";
import { Link } from "react-router-dom";

const MerchantLanding = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Store className="h-8 w-8 text-primary" />
              <span className="ml-2 text-2xl font-bold">MyDresser Terminal</span>
            </div>
            <div className="flex items-center space-x-4">
              <a href="/">
                <Button variant="ghost" size="sm">
                  Customer App
                </Button>
              </a>
              <Link to="/terminal/auth">
                <Button>Merchant Sign In</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Register and start setup
            <br />
            <span className="text-primary block">Merchant Terminal</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            The world's first FOS - Fashion Operating System
            <br />
            <br />
            Manage your fashion business with powerful tools designed for modern merchants.
            <br />
            Inventory, sales, analytics, and customer relations—all in one place.
          </p>
          <Link to="/terminal/auth">
            <Button size="lg" className="text-lg px-8 py-6">
              Access Terminal
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Everything You Need to Succeed</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Package className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Inventory Management</CardTitle>
                <CardDescription>
                  Real-time stock tracking, automated reordering, and smart categorization
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <BarChart3 className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Advanced Analytics</CardTitle>
                <CardDescription>
                  Sales trends, customer insights, and performance metrics at your fingertips
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Users className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Customer Relations</CardTitle>
                <CardDescription>
                  Build lasting relationships with integrated CRM and communication tools
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <TrendingUp className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Sales Optimization</CardTitle>
                <CardDescription>AI-powered recommendations to maximize revenue and minimize waste</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Store className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Custom Storefront</CardTitle>
                <CardDescription>Beautiful, customizable pages to showcase your brand and products</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Transform Your Business?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join the new fashion business experience, an all-in-one solution.
          </p>
          <Link to="/terminal/auth">
            <Button size="lg" className="text-lg px-8 py-6">
              Get Started Today
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <Store className="h-6 w-6 text-primary" />
              <span className="ml-2 font-semibold">MyDresser Terminal</span>
            </div>
            <div className="flex space-x-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-foreground">
                Terms of Service
              </a>
              <a href="#" className="hover:text-foreground">
                Support
              </a>
            </div>
          </div>
          <div className="mt-8 text-center text-sm text-muted-foreground">
            © 2024 MyDresser Terminal. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MerchantLanding;
