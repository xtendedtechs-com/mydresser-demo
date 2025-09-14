import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { Accessibility, Eye, Volume2, Keyboard, MousePointer } from "lucide-react";

const AccessibilitySettings = () => {
  const { preferences, updatePreferences } = useUserPreferences();

  return (
    <div className="space-y-6">
      {/* Visual Accessibility */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Visual Accessibility
          </CardTitle>
          <CardDescription>Settings to improve visual accessibility</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>High Contrast</Label>
              <p className="text-sm text-muted-foreground">Increase contrast for better visibility</p>
            </div>
            <Switch
              checked={preferences.accessibility_settings.high_contrast}
              onCheckedChange={(checked) => updatePreferences({
                accessibility_settings: { ...preferences.accessibility_settings, high_contrast: checked }
              })}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label>Large Text</Label>
              <p className="text-sm text-muted-foreground">Use larger text throughout the app</p>
            </div>
            <Switch
              checked={preferences.accessibility_settings.large_text}
              onCheckedChange={(checked) => updatePreferences({
                accessibility_settings: { ...preferences.accessibility_settings, large_text: checked }
              })}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label>Color Blind Friendly</Label>
              <p className="text-sm text-muted-foreground">Use patterns and shapes in addition to colors</p>
            </div>
            <Switch
              checked={preferences.accessibility_settings.color_blind_friendly}
              onCheckedChange={(checked) => updatePreferences({
                accessibility_settings: { ...preferences.accessibility_settings, color_blind_friendly: checked }
              })}
            />
          </div>
          <Separator />
          <div className="space-y-2">
            <Label>Font Size Multiplier</Label>
            <div className="px-2">
              <Slider
                value={[preferences.accessibility_settings.font_size_multiplier]}
                onValueChange={([value]) => updatePreferences({
                  accessibility_settings: { ...preferences.accessibility_settings, font_size_multiplier: value }
                })}
                max={2}
                min={0.8}
                step={0.1}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-muted-foreground mt-2">
                <span>0.8x</span>
                <span className="font-medium">{preferences.accessibility_settings.font_size_multiplier}x</span>
                <span>2x</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Motion & Animation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MousePointer className="w-4 h-4" />
            Motion & Animation
          </CardTitle>
          <CardDescription>Control animations and motion effects</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Reduce Motion</Label>
              <p className="text-sm text-muted-foreground">Minimize animations and transitions</p>
            </div>
            <Switch
              checked={preferences.accessibility_settings.reduce_motion}
              onCheckedChange={(checked) => updatePreferences({
                accessibility_settings: { ...preferences.accessibility_settings, reduce_motion: checked }
              })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Keyboard className="w-4 h-4" />
            Navigation
          </CardTitle>
          <CardDescription>Keyboard and alternative navigation options</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Keyboard Navigation</Label>
              <p className="text-sm text-muted-foreground">Enhanced keyboard navigation support</p>
            </div>
            <Switch
              checked={preferences.accessibility_settings.keyboard_navigation}
              onCheckedChange={(checked) => updatePreferences({
                accessibility_settings: { ...preferences.accessibility_settings, keyboard_navigation: checked }
              })}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label>Voice Navigation</Label>
              <p className="text-sm text-muted-foreground">Enable voice commands (experimental)</p>
            </div>
            <Switch
              checked={preferences.accessibility_settings.voice_navigation}
              onCheckedChange={(checked) => updatePreferences({
                accessibility_settings: { ...preferences.accessibility_settings, voice_navigation: checked }
              })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Screen Reader Support */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="w-4 h-4" />
            Screen Reader
          </CardTitle>
          <CardDescription>Support for assistive technologies</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Screen Reader Support</Label>
              <p className="text-sm text-muted-foreground">Optimize for screen readers and other assistive tools</p>
            </div>
            <Switch
              checked={preferences.accessibility_settings.screen_reader_support}
              onCheckedChange={(checked) => updatePreferences({
                accessibility_settings: { ...preferences.accessibility_settings, screen_reader_support: checked }
              })}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccessibilitySettings;