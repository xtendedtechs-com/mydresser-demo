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
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64" fill="none">
            <path
              d="M32 4C29.0296 4 26.1808 5.17539 24.0804 7.26759C21.98 9.35979 20.8 12.1974 20.8 15.1562H27.2C27.2 13.8882 27.7057 12.6721 28.6059 11.7754C29.5061 10.8787 30.727 10.375 32 10.375C33.273 10.375 34.4939 10.8787 35.3941 11.7754C36.2943 12.6721 36.8 13.8882 36.8 15.1562C36.8 16.4243 36.2943 17.6404 35.3941 18.5371C34.4939 19.4338 33.273 19.9375 32 19.9375C30.24 19.9375 28.8 21.3719 28.8 23.125V28.7031L1.28 49.2625C0.742701 49.6639 0.345813 50.2235 0.145557 50.8621C-0.0546999 51.5007 -0.0481726 52.1858 0.164214 52.8205C0.3766 53.4551 0.784077 54.0072 1.32893 54.3983C1.87378 54.7895 2.52838 55 3.2 55H60.8C61.4716 55 62.1262 54.7895 62.6711 54.3983C63.2159 54.0072 63.6234 53.4551 63.8358 52.8205C64.0482 52.1858 64.0547 51.5007 63.8544 50.8621C63.6542 50.2235 63.2573 49.6639 62.72 49.2625L35.2 28.7031V25.8344C37.5092 25.1486 39.5349 23.7392 40.9761 21.8156C42.4173 19.8919 43.1972 17.5565 43.2 15.1562C43.2 12.1974 42.02 9.35979 39.9196 7.26759C37.8192 5.17539 34.9704 4 32 4ZM32 34.2812L51.2 48.625H12.8L32 34.2812Z"
              fill="black"
            />
          </svg>
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
