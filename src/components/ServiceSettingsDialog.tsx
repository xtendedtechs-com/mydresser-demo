import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { useToast } from "@/hooks/use-toast";
import SecurityDashboard from "./SecurityDashboard";
import PrivacyComplianceManager from "./PrivacyComplianceManager";
import { 
  Cloud, 
  Shirt, 
  ShoppingBag, 
  Bot, 
  Palette,
  Thermometer,
  Calendar,
  DollarSign,
  Heart,
  MapPin,
  Tag
} from "lucide-react";

interface ServiceSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  serviceType: string;
  title: string;
  description: string;
}

const ServiceSettingsDialog = ({ open, onOpenChange, serviceType, title, description }: ServiceSettingsDialogProps) => {
  const { preferences, updatePreferences } = useUserPreferences();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    await updatePreferences(preferences);
    setLoading(false);
    onOpenChange(false);
  };

  const renderWeatherSettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Thermometer className="w-4 h-4" />
            Weather Integration
          </CardTitle>
          <CardDescription>Configure weather-based outfit recommendations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Weather-Based Suggestions</Label>
              <p className="text-sm text-muted-foreground">Get outfit suggestions based on weather</p>
            </div>
            <Switch 
              checked={preferences.suggestion_settings.weather_based}
              onCheckedChange={(checked) => updatePreferences({
                suggestion_settings: { ...preferences.suggestion_settings, weather_based: checked }
              })}
            />
          </div>
          <div className="space-y-2">
            <Label>Location</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Enter your city"
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Weather Alerts</Label>
              <p className="text-sm text-muted-foreground">Get notified about weather changes</p>
            </div>
            <Switch 
              checked={preferences.notifications.weather_alerts}
              onCheckedChange={(checked) => updatePreferences({
                notifications: { ...preferences.notifications, weather_alerts: checked }
              })}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderOutfitSettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shirt className="w-4 h-4" />
            Daily Outfit Generation
          </CardTitle>
          <CardDescription>Customize your daily outfit recommendations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Daily Suggestions</Label>
              <p className="text-sm text-muted-foreground">Get daily outfit recommendations</p>
            </div>
            <Switch 
              checked={preferences.notifications.outfit_suggestions}
              onCheckedChange={(checked) => updatePreferences({
                notifications: { ...preferences.notifications, outfit_suggestions: checked }
              })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Occasion-Based</Label>
              <p className="text-sm text-muted-foreground">Consider your calendar events</p>
            </div>
            <Switch 
              checked={preferences.suggestion_settings.occasion_based}
              onCheckedChange={(checked) => updatePreferences({
                suggestion_settings: { ...preferences.suggestion_settings, occasion_based: checked }
              })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Color Matching</Label>
              <p className="text-sm text-muted-foreground">Smart color coordination</p>
            </div>
            <Switch 
              checked={preferences.suggestion_settings.color_matching}
              onCheckedChange={(checked) => updatePreferences({
                suggestion_settings: { ...preferences.suggestion_settings, color_matching: checked }
              })}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderWardrobeSettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4" />
            Wardrobe Management
          </CardTitle>
          <CardDescription>Configure your wardrobe organization</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Show Wardrobe Publicly</Label>
              <p className="text-sm text-muted-foreground">Allow others to see your wardrobe</p>
            </div>
            <Switch 
              checked={preferences.privacy.show_wardrobe}
              onCheckedChange={(checked) => updatePreferences({
                privacy: { ...preferences.privacy, show_wardrobe: checked }
              })}
            />
          </div>
          <div className="space-y-2">
            <Label>Style Preferences</Label>
            <div className="flex flex-wrap gap-2">
              {['Casual', 'Formal', 'Streetwear', 'Minimalist', 'Vintage', 'Boho'].map((style) => (
                <Badge key={style} variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
                  {style}
                </Badge>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Budget Range</Label>
            <div className="px-2">
              <Slider
                value={preferences.suggestion_settings.budget_range}
                onValueChange={(value) => updatePreferences({
                  suggestion_settings: { ...preferences.suggestion_settings, budget_range: value as [number, number] }
                })}
                max={2000}
                min={0}
                step={50}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-muted-foreground mt-2">
                <span>${preferences.suggestion_settings.budget_range[0]}</span>
                <span>${preferences.suggestion_settings.budget_range[1]}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderMarketSettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4" />
            Market & 2ndDresser
          </CardTitle>
          <CardDescription>Configure marketplace and second-hand settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>New Item Alerts</Label>
              <p className="text-sm text-muted-foreground">Get notified about new items that match your style</p>
            </div>
            <Switch 
              checked={preferences.notifications.new_items}
              onCheckedChange={(checked) => updatePreferences({
                notifications: { ...preferences.notifications, new_items: checked }
              })}
            />
          </div>
          <div className="space-y-2">
            <Label>Preferred Brands</Label>
            <div className="flex flex-wrap gap-2">
              {['Nike', 'Adidas', 'Zara', 'H&M', 'Uniqlo', 'Levi\'s'].map((brand) => (
                <Badge key={brand} variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
                  {brand}
                </Badge>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Size Preferences</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select your size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="xs">XS</SelectItem>
                <SelectItem value="s">S</SelectItem>
                <SelectItem value="m">M</SelectItem>
                <SelectItem value="l">L</SelectItem>
                <SelectItem value="xl">XL</SelectItem>
                <SelectItem value="xxl">XXL</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderAIAssistantSettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="w-4 h-4" />
            AI Styling Assistant
          </CardTitle>
          <CardDescription>Configure your AI assistant preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Assistant Personality</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Choose assistant style" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="professional">Professional Stylist</SelectItem>
                <SelectItem value="friendly">Friendly Helper</SelectItem>
                <SelectItem value="trendy">Trendy Influencer</SelectItem>
                <SelectItem value="minimalist">Minimalist Guide</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Proactive Suggestions</Label>
              <p className="text-sm text-muted-foreground">Get unsolicited styling tips</p>
            </div>
            <Switch />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Learning Mode</Label>
              <p className="text-sm text-muted-foreground">AI learns from your choices</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderContent = () => {
    switch (serviceType) {
      case 'security':
        return <SecurityDashboard />;
      case 'privacy':
        return <PrivacyComplianceManager />;
      case 'data':
        return <PrivacyComplianceManager />;
      case 'weather':
        return renderWeatherSettings();
      case 'outfit':
        return renderOutfitSettings();
      case 'wardrobe':
        return renderWardrobeSettings();
      case 'market':
        return renderMarketSettings();
      case 'assistant':
        return renderAIAssistantSettings();
      default:
        return (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <Palette className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Service Configuration</h3>
            <p className="text-muted-foreground">Advanced settings for this service coming soon.</p>
          </div>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {renderContent()}
        </div>

        {/* Only show save/cancel buttons for non-security/privacy dialogs */}
        {!['security', 'privacy', 'data'].includes(serviceType) && (
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ServiceSettingsDialog;