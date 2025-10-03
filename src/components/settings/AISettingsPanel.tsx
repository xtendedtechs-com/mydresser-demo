import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useAISettings } from '@/hooks/useAISettings';
import { Bot, Sparkles, TrendingUp, Image } from 'lucide-react';

export const AISettingsPanel = () => {
  const { settings, updateSettings, isUpdating } = useAISettings();

  if (!settings) return null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5" />
            AI Model Preferences
          </CardTitle>
          <CardDescription>Choose which AI models to use for different features</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="chat-model">Style Chat Model</Label>
            <Select
              value={settings.chat_model}
              onValueChange={(value) => updateSettings({ chat_model: value })}
            >
              <SelectTrigger id="chat-model">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="google/gemini-2.5-flash">Gemini 2.5 Flash (Fast & Free)</SelectItem>
                <SelectItem value="google/gemini-2.5-pro">Gemini 2.5 Pro (Most Capable)</SelectItem>
                <SelectItem value="google/gemini-2.5-flash-lite">Gemini 2.5 Flash Lite (Fastest)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="recommendation-model">Recommendation Model</Label>
            <Select
              value={settings.recommendation_model}
              onValueChange={(value) => updateSettings({ recommendation_model: value })}
            >
              <SelectTrigger id="recommendation-model">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="google/gemini-2.5-flash">Gemini 2.5 Flash</SelectItem>
                <SelectItem value="google/gemini-2.5-pro">Gemini 2.5 Pro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="daily-limit">Daily Request Limit</Label>
            <Input
              id="daily-limit"
              type="number"
              value={settings.daily_request_limit}
              onChange={(e) => updateSettings({ daily_request_limit: parseInt(e.target.value) })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            AI Features
          </CardTitle>
          <CardDescription>Enable or disable AI-powered features</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="style-chat">Style Chat</Label>
              <p className="text-sm text-muted-foreground">
                AI-powered style consultation
              </p>
            </div>
            <Switch
              id="style-chat"
              checked={settings.enable_style_chat}
              onCheckedChange={(checked) => updateSettings({ enable_style_chat: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="outfit-suggestions">Outfit Suggestions</Label>
              <p className="text-sm text-muted-foreground">
                Smart outfit recommendations
              </p>
            </div>
            <Switch
              id="outfit-suggestions"
              checked={settings.enable_outfit_suggestions}
              onCheckedChange={(checked) => updateSettings({ enable_outfit_suggestions: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="wardrobe-insights">Wardrobe Insights</Label>
              <p className="text-sm text-muted-foreground">
                AI analysis of your wardrobe
              </p>
            </div>
            <Switch
              id="wardrobe-insights"
              checked={settings.enable_wardrobe_insights}
              onCheckedChange={(checked) => updateSettings({ enable_wardrobe_insights: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="virtual-tryon">Virtual Try-On</Label>
              <p className="text-sm text-muted-foreground">
                AI-powered virtual fitting
              </p>
            </div>
            <Switch
              id="virtual-tryon"
              checked={settings.enable_virtual_tryon}
              onCheckedChange={(checked) => updateSettings({ enable_virtual_tryon: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="usage-alerts">Usage Alerts</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when approaching limits
              </p>
            </div>
            <Switch
              id="usage-alerts"
              checked={settings.enable_usage_alerts}
              onCheckedChange={(checked) => updateSettings({ enable_usage_alerts: checked })}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
