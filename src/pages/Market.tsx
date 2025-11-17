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


const Market = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useProfile();
  const { profile: merchantProfile, loading: merchantLoading } = useMerchantProfile();
  
  const [activeTab, setActiveTab] = useState("mymarket");

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-secondary/20 to-background">
      {/* Hero Section - iOS Design */}
      <div className="glass-card border-b border-border/50 shadow-[var(--shadow-md)]">
        <div className="container py-8">
          <div className="text-center space-y-4 animate-fade-in">
            <h1 className="text-4xl font-bold tracking-tight fashion-text-gradient">Fashion Marketplace</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Discover unique fashion from verified merchants or find pre-loved treasures from the community
            </p>
          </div>
        </div>
      </div>

      {/* Market Tabs - iOS Style */}
      <div className="container py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex justify-center mb-8 animate-scale-in">
            <TabsList className="glass-card grid w-full max-w-md grid-cols-2 h-12 p-1 shadow-[var(--shadow-sm)]">
              <TabsTrigger value="mymarket" className="flex items-center gap-2 rounded-[12px]">
                <Store className="w-4 h-4" />
                MyMarket
              </TabsTrigger>
              <TabsTrigger value="2nddresser" className="flex items-center gap-2 rounded-[12px]">
                <Recycle className="w-4 h-4" />
                2ndDresser
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Market Overview Cards - iOS Floating Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="glass-card hover-lift transition-smooth animate-fade-in">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4 shadow-[var(--shadow-sm)]">
                  <Users2 className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Community Marketplace</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Buy and sell pre-loved fashion items with other users
                </p>
                <Button 
                  variant="secondary" 
                  size="sm"
                  onClick={() => setActiveTab("2nddresser")}
                  className="transition-smooth"
                >
                  Browse 2ndDresser
                </Button>
              </CardContent>
            </div>

            <div className="glass-card hover-lift transition-smooth animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-4 shadow-[var(--shadow-sm)]">
                  <Crown className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Premium Merchants</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Shop from verified retailers and fashion brands
                </p>
                <Button 
                  variant="secondary" 
                  size="sm"
                  onClick={() => setActiveTab("mymarket")}
                  className="transition-smooth"
                >
                  Browse MyMarket
                </Button>
              </CardContent>
            </div>

            <div className="glass-card hover-lift transition-smooth animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4 shadow-[var(--shadow-sm)]">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Trending Now</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Discover what's popular in sustainable fashion
                </p>
                <Badge variant="secondary" className="text-xs shadow-[var(--shadow-sm)]">
                  2,847 active listings
                </Badge>
              </CardContent>
            </div>
          </div>

          {/* Tab Contents */}
          <TabsContent value="mymarket" className="mt-8">
            <MyMarket />
          </TabsContent>

          <TabsContent value="2nddresser" className="mt-8">
            <SecondDresserMarket />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Market;