import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { useToast } from "@/hooks/use-toast";
import { Bell, Mail, MessageSquare, Smartphone, Calendar, ShoppingBag, TrendingUp, Users } from "lucide-react";

const ServiceSettings = () => {
  const { preferences, updatePreferences, loading } = useUserPreferences();
  const { toast } = useToast();

  const handleToggle = async (setting: string, value: boolean) => {
    try {
      await updatePreferences({ [setting]: value });
      toast({
        title: "Notification setting updated",
        description: "Your preferences have been saved."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update notification setting.",
        variant: "destructive"
      });
    }
  };

  const notifications = preferences || {};

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notification Preferences
          </CardTitle>
          <CardDescription>
            Control how and when you receive notifications from MyDresser
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email Notifications
            </h4>
            
            <div className="space-y-3 pl-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="daily-outfit">Daily Outfit Suggestions</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive daily outfit recommendations
                  </p>
                </div>
                <Switch
                  id="daily-outfit"
                  checked={notifications.daily_outfit !== false}
                  onCheckedChange={(checked) => handleToggle("daily_outfit", checked)}
                  disabled={loading}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="wardrobe-tips">Wardrobe Tips</Label>
                  <p className="text-sm text-muted-foreground">
                    Get styling tips and wardrobe organization advice
                  </p>
                </div>
                <Switch
                  id="wardrobe-tips"
                  checked={notifications.wardrobe_tips !== false}
                  onCheckedChange={(checked) => handleToggle("wardrobe_tips", checked)}
                  disabled={loading}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="market-updates">Market Updates</Label>
                  <p className="text-sm text-muted-foreground">
                    New arrivals and deals from your favorite merchants
                  </p>
                </div>
                <Switch
                  id="market-updates"
                  checked={notifications.market_updates !== false}
                  onCheckedChange={(checked) => handleToggle("market_updates", checked)}
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Smartphone className="w-4 h-4" />
              Push Notifications
            </h4>
            
            <div className="space-y-3 pl-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="outfit-reminders">Outfit Reminders</Label>
                  <p className="text-sm text-muted-foreground">
                    Reminders to check your daily outfit
                  </p>
                </div>
                <Switch
                  id="outfit-reminders"
                  checked={notifications.outfit_reminders === true}
                  onCheckedChange={(checked) => handleToggle("outfit_reminders", checked)}
                  disabled={loading}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="social-activity">Social Activity</Label>
                  <p className="text-sm text-muted-foreground">
                    Likes, comments, and follows on your outfits
                  </p>
                </div>
                <Switch
                  id="social-activity"
                  checked={notifications.social_activity === true}
                  onCheckedChange={(checked) => handleToggle("social_activity", checked)}
                  disabled={loading}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            Marketplace Services
          </CardTitle>
          <CardDescription>
            Configure your marketplace preferences and merchant connections
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-recommendations">Automatic Recommendations</Label>
              <p className="text-sm text-muted-foreground">
                Let AI suggest items from the marketplace based on your wardrobe
              </p>
            </div>
            <Switch
              id="auto-recommendations"
              checked={preferences?.auto_recommendations !== false}
              onCheckedChange={(checked) => handleToggle("auto_recommendations", checked)}
              disabled={loading}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="price-alerts">Price Alerts</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when items in your wishlist go on sale
              </p>
            </div>
            <Switch
              id="price-alerts"
              checked={preferences?.price_alerts === true}
              onCheckedChange={(checked) => handleToggle("price_alerts", checked)}
              disabled={loading}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="merchant-updates">Merchant Updates</Label>
              <p className="text-sm text-muted-foreground">
                Receive updates from merchants you follow
              </p>
            </div>
            <Switch
              id="merchant-updates"
              checked={preferences?.merchant_updates !== false}
              onCheckedChange={(checked) => handleToggle("merchant_updates", checked)}
              disabled={loading}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            AI Services
          </CardTitle>
          <CardDescription>
            Configure AI-powered features and personalization
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5 flex-1">
              <div className="flex items-center gap-2">
                <Label htmlFor="ai-styling">AI Styling Assistant</Label>
                <Badge variant="secondary">Premium</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Get personalized styling advice and outfit suggestions
              </p>
            </div>
            <Switch
              id="ai-styling"
              checked={preferences?.ai_styling === true}
              onCheckedChange={(checked) => handleToggle("ai_styling", checked)}
              disabled={loading}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="weather-integration">Weather Integration</Label>
              <p className="text-sm text-muted-foreground">
                Automatically adjust outfit suggestions based on weather
              </p>
            </div>
            <Switch
              id="weather-integration"
              checked={preferences?.weather_integration !== false}
              onCheckedChange={(checked) => handleToggle("weather_integration", checked)}
              disabled={loading}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="trend-analysis">Trend Analysis</Label>
              <p className="text-sm text-muted-foreground">
                Analyze fashion trends to suggest relevant items
              </p>
            </div>
            <Switch
              id="trend-analysis"
              checked={preferences?.trend_analysis === true}
              onCheckedChange={(checked) => handleToggle("trend_analysis", checked)}
              disabled={loading}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Social Features
          </CardTitle>
          <CardDescription>
            Manage your social interactions and community features
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="public-outfits">Public Outfits</Label>
              <p className="text-sm text-muted-foreground">
                Allow others to see and interact with your outfit posts
              </p>
            </div>
            <Switch
              id="public-outfits"
              checked={preferences?.public_outfits !== false}
              onCheckedChange={(checked) => handleToggle("public_outfits", checked)}
              disabled={loading}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="follow-suggestions">Follow Suggestions</Label>
              <p className="text-sm text-muted-foreground">
                Get suggestions for users with similar style
              </p>
            </div>
            <Switch
              id="follow-suggestions"
              checked={preferences?.follow_suggestions === true}
              onCheckedChange={(checked) => handleToggle("follow_suggestions", checked)}
              disabled={loading}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ServiceSettings;