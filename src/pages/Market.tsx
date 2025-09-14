import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Store, 
  Users2, 
  ShoppingBag, 
  LogIn, 
  UserPlus,
  Crown,
  Recycle,
  TrendingUp,
  Package
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useProfile } from "@/hooks/useProfile";
import { useMerchantProfile } from "@/hooks/useMerchantProfile";
import MyMarket from "@/components/MyMarket";
import SecondDresserMarket from "@/components/SecondDresserMarket";
import MerchantAuth from "@/components/MerchantAuth";

const Market = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useProfile();
  const { profile: merchantProfile, loading: merchantLoading } = useMerchantProfile();
  
  const [activeTab, setActiveTab] = useState("2nddresser");
  const [showMerchantAuth, setShowMerchantAuth] = useState(false);

  // Check if user can access MyMarket (either has merchant profile or is authenticated)
  const canAccessMyMarket = user && (merchantProfile || user);

  useEffect(() => {
    // If user is not authenticated and tries to access MyMarket, show auth
    if (activeTab === "mymarket" && !user) {
      setShowMerchantAuth(true);
      setActiveTab("2nddresser");
    }
  }, [activeTab, user]);

  const handleMerchantLogin = () => {
    setShowMerchantAuth(true);
  };

  const handleAuthSuccess = () => {
    setShowMerchantAuth(false);
    setActiveTab("mymarket");
    toast({
      title: "Welcome to MyMarket",
      description: "You can now manage your merchant listings.",
    });
  };

  if (showMerchantAuth) {
    return (
      <MerchantAuth 
        onSuccess={handleAuthSuccess}
        onCancel={() => {
          setShowMerchantAuth(false);
          setActiveTab("2nddresser");
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/10 border-b">
        <div className="container py-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold tracking-tight">Fashion Marketplace</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Discover unique fashion from verified merchants or find pre-loved treasures from the community
            </p>
          </div>
        </div>
      </div>

      {/* Market Tabs */}
      <div className="container py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex justify-center mb-8">
            <TabsList className="grid w-full max-w-md grid-cols-2 h-12">
              <TabsTrigger value="2nddresser" className="flex items-center gap-2">
                <Recycle className="w-4 h-4" />
                2ndDresser
              </TabsTrigger>
              <TabsTrigger 
                value="mymarket" 
                className="flex items-center gap-2"
                disabled={!user}
              >
                <Store className="w-4 h-4" />
                MyMarket
                {merchantProfile && (
                  <Badge variant="outline" className="ml-1 px-1 py-0 text-xs">
                    {merchantProfile.verification_status}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Market Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users2 className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Community Marketplace</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Buy and sell pre-loved fashion items with other users
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setActiveTab("2nddresser")}
                >
                  Browse 2ndDresser
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Crown className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Premium Merchants</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Shop from verified retailers and fashion brands
                </p>
                {canAccessMyMarket ? (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setActiveTab("mymarket")}
                  >
                    Access MyMarket
                  </Button>
                ) : (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleMerchantLogin}
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    Merchant Login
                  </Button>
                )}
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Trending Now</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Discover what's popular in sustainable fashion
                </p>
                <Badge variant="secondary" className="text-xs">
                  2,847 active listings
                </Badge>
              </CardContent>
            </Card>
          </div>

          {/* Tab Contents */}
          <TabsContent value="2nddresser" className="mt-8">
            <SecondDresserMarket />
          </TabsContent>

          <TabsContent value="mymarket" className="mt-8">
            {!user ? (
              <Card className="max-w-2xl mx-auto">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Store className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-2xl">Access MyMarket</CardTitle>
                  <p className="text-muted-foreground">
                    Sign in or create an account to access the merchant marketplace
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button 
                      onClick={handleMerchantLogin} 
                      className="w-full"
                    >
                      <LogIn className="mr-2 h-4 w-4" />
                      Sign In
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={handleMerchantLogin}
                      className="w-full"
                    >
                      <UserPlus className="mr-2 h-4 w-4" />
                      Create Account
                    </Button>
                  </div>
                  
                  <div className="text-center mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                      <div className="text-center">
                        <Package className="w-8 h-8 mx-auto mb-2 text-primary" />
                        <p className="text-sm font-medium">List Products</p>
                        <p className="text-xs text-muted-foreground">Showcase your inventory</p>
                      </div>
                      <div className="text-center">
                        <TrendingUp className="w-8 h-8 mx-auto mb-2 text-primary" />
                        <p className="text-sm font-medium">Track Sales</p>
                        <p className="text-xs text-muted-foreground">Monitor performance</p>
                      </div>
                      <div className="text-center">
                        <Crown className="w-8 h-8 mx-auto mb-2 text-primary" />
                        <p className="text-sm font-medium">Get Verified</p>
                        <p className="text-xs text-muted-foreground">Build trust & credibility</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : merchantLoading ? (
              <div className="text-center py-12">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading merchant data...</p>
              </div>
            ) : (
              <MyMarket />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Market;