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
            <div className="flex items-center space-x-4">
              <a href="/terminal">
                <Button variant="ghost" size="sm">
                  Merchant Terminal
                </Button>
              </a>
              <Link to="/auth">
                <Button variant="outline">Sign In</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">MyDresser</h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">Taking care of what you wear.</p>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">Coming soon.</p>
        </div>
      </section>
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      {/* Footer */}
      <footer className="border-t py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30" fill="none">
                <path
                  d="M15 5C13.8397 5 12.7269 5.46094 11.9064 6.28141C11.0859 7.10188 10.625 8.21468 10.625 9.375H13.125C13.125 8.87772 13.3225 8.40081 13.6742 8.04917C14.0258 7.69754 14.5027 7.5 15 7.5C15.4973 7.5 15.9742 7.69754 16.3258 8.04917C16.6775 8.40081 16.875 8.87772 16.875 9.375C16.875 9.87228 16.6775 10.3492 16.3258 10.7008C15.9742 11.0525 15.4973 11.25 15 11.25C14.3125 11.25 13.75 11.8125 13.75 12.5V14.6875L3 22.75C2.79012 22.9074 2.63508 23.1269 2.55686 23.3773C2.47863 23.6277 2.48118 23.8964 2.56415 24.1453C2.64711 24.3942 2.80628 24.6107 3.01911 24.7641C3.23194 24.9175 3.48765 25 3.75 25H26.25C26.5124 25 26.7681 24.9175 26.9809 24.7641C27.1937 24.6107 27.3529 24.3942 27.4359 24.1453C27.5188 23.8964 27.5214 23.6277 27.4431 23.3773C27.3649 23.1269 27.2099 22.9074 27 22.75L16.25 14.6875V13.5625C17.152 13.2936 17.9433 12.7409 18.5063 11.9865C19.0692 11.2321 19.3739 10.3163 19.375 9.375C19.375 8.21468 18.9141 7.10188 18.0936 6.28141C17.2731 5.46094 16.1603 5 15 5ZM15 16.875L22.5 22.5H7.5L15 16.875Z"
                  fill="black"
                />
              </svg>
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
          <div className="mt-8 text-center text-sm text-muted-foreground">© 2025 MyDresser. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
