import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Cloud, Sparkles, Package, Store, Shield, Settings } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useProfile } from '@/hooks/useProfile';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import SecurityDashboard from '@/components/SecurityDashboard';

const ServiceSettingsPage = () => {
  const { service } = useParams();
  const navigate = useNavigate();
  const { profile } = useProfile();
  const { preferences, updatePreferences, loading } = useUserPreferences();
  const { toast } = useToast();

  const getPageTitle = () => {
    switch (service) {
      case 'weather': return 'Weather Settings';
      case 'outfit': return 'Outfit Settings';
      case 'wardrobe': return 'Wardrobe Settings';
      case 'market': return 'Market Settings';
      case 'assistant': return 'AI Assistant Settings';
      case 'security': return 'Security Dashboard';
      default: return 'Service Settings';
    }
  };

  const getPageIcon = () => {
    switch (service) {
      case 'weather': return Cloud;
      case 'outfit': return Sparkles;
      case 'wardrobe': return Package;
      case 'market': return Store;
      case 'assistant': return Sparkles;
      case 'security': return Shield;
      default: return Settings;
    }
  };

  const renderContent = () => {
    switch (service) {
      case 'weather':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Weather-Based Recommendations</CardTitle>
              <CardDescription>Configure how weather affects your outfit suggestions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="enableWeather">Enable Weather Integration</Label>
                <Switch
                  id="enableWeather"
                  checked={preferences.suggestion_settings?.weather_based || false}
                  onCheckedChange={(checked) => updatePreferences({
                    suggestion_settings: { 
                      ...preferences.suggestion_settings, 
                      weather_based: checked 
                    }
                  })}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <Label htmlFor="occasionBased">Occasion-Based Suggestions</Label>
                <Switch
                  id="occasionBased"
                  checked={preferences.suggestion_settings?.occasion_based || false}
                  onCheckedChange={(checked) => updatePreferences({
                    suggestion_settings: { 
                      ...preferences.suggestion_settings, 
                      occasion_based: checked 
                    }
                  })}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <Label htmlFor="colorMatching">Color Matching</Label>
                <Switch
                  id="colorMatching"
                  checked={preferences.suggestion_settings?.color_matching || false}
                  onCheckedChange={(checked) => updatePreferences({
                    suggestion_settings: { 
                      ...preferences.suggestion_settings, 
                      color_matching: checked 
                    }
                  })}
                />
              </div>
            </CardContent>
          </Card>
        );

      case 'outfit':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Daily Outfit Generation</CardTitle>
              <CardDescription>Customize your daily outfit recommendations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="occasionBased">Occasion-Based Outfits</Label>
                <Switch
                  id="occasionBased"
                  checked={preferences.suggestion_settings?.occasion_based || false}
                  onCheckedChange={(checked) => updatePreferences({
                    suggestion_settings: { 
                      ...preferences.suggestion_settings, 
                      occasion_based: checked 
                    }
                  })}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <Label htmlFor="colorMatching">Color Matching</Label>
                <Switch
                  id="colorMatching"
                  checked={preferences.suggestion_settings?.color_matching || false}
                  onCheckedChange={(checked) => updatePreferences({
                    suggestion_settings: { 
                      ...preferences.suggestion_settings, 
                      color_matching: checked 
                    }
                  })}
                />
              </div>
            </CardContent>
          </Card>
        );

      case 'wardrobe':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Wardrobe Management</CardTitle>
              <CardDescription>Configure your wardrobe organization preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="autoSave">Auto Save Items</Label>
                <Switch
                  id="autoSave"
                  checked={preferences.app_behavior?.auto_save || false}
                  onCheckedChange={(checked) => updatePreferences({
                    app_behavior: { 
                      ...preferences.app_behavior, 
                      auto_save: checked 
                    }
                  })}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <Label htmlFor="smartLaundry">Smart Laundry Tracking</Label>
                <Switch
                  id="smartLaundry"
                  checked={preferences.laundry_settings?.smart_suggestions || false}
                  onCheckedChange={(checked) => updatePreferences({
                    laundry_settings: { 
                      ...preferences.laundry_settings, 
                      smart_suggestions: checked 
                    }
                  })}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <Label htmlFor="showTips">Show Tips</Label>
                <Switch
                  id="showTips"
                  checked={preferences.app_behavior?.show_tips || false}
                  onCheckedChange={(checked) => updatePreferences({
                    app_behavior: { 
                      ...preferences.app_behavior, 
                      show_tips: checked 
                    }
                  })}
                />
              </div>
            </CardContent>
          </Card>
        );

      case 'market':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Marketplace Settings</CardTitle>
              <CardDescription>Configure your buying and selling preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="allowSelling">Enable Selling</Label>
                <Switch
                  id="allowSelling"
                  checked={preferences.marketplace_settings?.allow_selling || false}
                  onCheckedChange={(checked) => updatePreferences({
                    marketplace_settings: { 
                      ...preferences.marketplace_settings, 
                      allow_selling: checked 
                    }
                  })}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <Label htmlFor="priceHistory">Show Price History</Label>
                <Switch
                  id="priceHistory"
                  checked={preferences.marketplace_settings?.show_price_history || false}
                  onCheckedChange={(checked) => updatePreferences({
                    marketplace_settings: { 
                      ...preferences.marketplace_settings, 
                      show_price_history: checked 
                    }
                  })}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <Label htmlFor="autoSuggestPrices">Auto Suggest Prices</Label>
                <Switch
                  id="autoSuggestPrices"
                  checked={preferences.marketplace_settings?.auto_suggest_prices || false}
                  onCheckedChange={(checked) => updatePreferences({
                    marketplace_settings: { 
                      ...preferences.marketplace_settings, 
                      auto_suggest_prices: checked 
                    }
                  })}
                />
              </div>
            </CardContent>
          </Card>
        );

      case 'assistant':
        return (
          <Card>
            <CardHeader>
              <CardTitle>AI Assistant Settings</CardTitle>
              <CardDescription>Customize your AI styling assistant</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="weatherBased">Weather-Based Suggestions</Label>
                <Switch
                  id="weatherBased"
                  checked={preferences.suggestion_settings?.weather_based || false}
                  onCheckedChange={(checked) => updatePreferences({
                    suggestion_settings: { 
                      ...preferences.suggestion_settings, 
                      weather_based: checked 
                    }
                  })}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <Label htmlFor="occasionBased">Occasion-Based Recommendations</Label>
                <Switch
                  id="occasionBased"
                  checked={preferences.suggestion_settings?.occasion_based || false}
                  onCheckedChange={(checked) => updatePreferences({
                    suggestion_settings: { 
                      ...preferences.suggestion_settings, 
                      occasion_based: checked 
                    }
                  })}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <Label htmlFor="colorMatching">Color Matching</Label>
                <Switch
                  id="colorMatching"
                  checked={preferences.suggestion_settings?.color_matching || false}
                  onCheckedChange={(checked) => updatePreferences({
                    suggestion_settings: { 
                      ...preferences.suggestion_settings, 
                      color_matching: checked 
                    }
                  })}
                />
              </div>
            </CardContent>
          </Card>
        );

      case 'security':
        return <SecurityDashboard />;

      default:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Service Settings</CardTitle>
              <CardDescription>Configure service-specific preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Select a specific service to configure its settings.
              </p>
            </CardContent>
          </Card>
        );
    }
  };

  const PageIcon = getPageIcon();

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/account')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <PageIcon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{getPageTitle()}</h1>
              <p className="text-sm text-muted-foreground">
                Configure {service || 'service'} preferences and behavior
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        {renderContent()}
      </div>
    </div>
  );
};

export default ServiceSettingsPage;