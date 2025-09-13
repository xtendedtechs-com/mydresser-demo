import { useState } from 'react';
import { Eye, Type, MousePointer, Keyboard, Volume2, Palette, Settings, Save, RotateCcw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useToast } from '@/hooks/use-toast';

const AccessibilitySettings = () => {
  const { preferences, updatePreferences, loading } = useUserPreferences();
  const { toast } = useToast();
  const [localSettings, setLocalSettings] = useState(preferences.accessibility_settings);

  const handleToggle = (key: keyof typeof localSettings, value: boolean) => {
    const newSettings = { ...localSettings, [key]: value };
    setLocalSettings(newSettings);
    
    // Apply immediately to the DOM for instant feedback
    applyAccessibilitySettings(newSettings);
  };

  const handleSliderChange = (key: string, value: number[]) => {
    const newSettings = { ...localSettings, [key]: value[0] };
    setLocalSettings(newSettings);
    applyAccessibilitySettings(newSettings);
  };

  const applyAccessibilitySettings = (settings: typeof localSettings) => {
    const root = document.documentElement;
    
    // High contrast mode
    if (settings.high_contrast) {
      root.classList.add('accessibility-high-contrast');
    } else {
      root.classList.remove('accessibility-high-contrast');
    }

    // Large text
    if (settings.large_text) {
      root.classList.add('accessibility-large-text');
    } else {
      root.classList.remove('accessibility-large-text');
    }

    // Reduce motion
    if (settings.reduce_motion) {
      root.classList.add('accessibility-reduce-motion');
    } else {
      root.classList.remove('accessibility-reduce-motion');
    }

    // Font size multiplier
    root.style.setProperty('--accessibility-font-scale', settings.font_size_multiplier.toString());

    // Keyboard navigation focus
    if (settings.keyboard_navigation) {
      root.classList.add('accessibility-keyboard-focus');
    } else {
      root.classList.remove('accessibility-keyboard-focus');
    }

    // Color blind friendly
    if (settings.color_blind_friendly) {
      root.classList.add('accessibility-color-blind-friendly');
    } else {
      root.classList.remove('accessibility-color-blind-friendly');
    }
  };

  const saveSettings = async () => {
    try {
      await updatePreferences({
        accessibility_settings: localSettings
      });
      
      toast({
        title: "Accessibility settings saved",
        description: "Your accessibility preferences have been updated.",
      });
    } catch (error) {
      toast({
        title: "Error saving settings",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const resetSettings = () => {
    const defaultSettings = {
      high_contrast: false,
      large_text: false,
      reduce_motion: false,
      screen_reader_support: false,
      keyboard_navigation: false,
      color_blind_friendly: false,
      font_size_multiplier: 1.0,
      voice_navigation: false,
    };
    
    setLocalSettings(defaultSettings);
    applyAccessibilitySettings(defaultSettings);
    
    toast({
      title: "Settings reset",
      description: "Accessibility settings have been reset to defaults.",
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Accessibility Settings</h1>
          <p className="text-muted-foreground">
            Customize the app to meet your accessibility needs
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={resetSettings}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
          <Button onClick={saveSettings}>
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Visual Accessibility */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Visual Accessibility
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">High Contrast Mode</h3>
                <p className="text-sm text-muted-foreground">
                  Increase contrast for better visibility
                </p>
              </div>
              <Switch
                checked={localSettings.high_contrast}
                onCheckedChange={(checked) => handleToggle('high_contrast', checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Large Text</h3>
                <p className="text-sm text-muted-foreground">
                  Increase default text size
                </p>
              </div>
              <Switch
                checked={localSettings.large_text}
                onCheckedChange={(checked) => handleToggle('large_text', checked)}
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Font Size Multiplier</h3>
                <span className="text-sm text-muted-foreground">
                  {localSettings.font_size_multiplier.toFixed(1)}x
                </span>
              </div>
              <Slider
                value={[localSettings.font_size_multiplier]}
                onValueChange={(value) => handleSliderChange('font_size_multiplier', value)}
                min={0.8}
                max={2.0}
                step={0.1}
                className="w-full"
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Color Blind Friendly</h3>
                <p className="text-sm text-muted-foreground">
                  Use patterns and shapes alongside colors
                </p>
              </div>
              <Switch
                checked={localSettings.color_blind_friendly}
                onCheckedChange={(checked) => handleToggle('color_blind_friendly', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Motor & Navigation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MousePointer className="h-5 w-5" />
              Motor & Navigation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Reduce Motion</h3>
                <p className="text-sm text-muted-foreground">
                  Minimize animations and transitions
                </p>
              </div>
              <Switch
                checked={localSettings.reduce_motion}
                onCheckedChange={(checked) => handleToggle('reduce_motion', checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Keyboard Navigation</h3>
                <p className="text-sm text-muted-foreground">
                  Enhanced focus indicators for keyboard use
                </p>
              </div>
              <Switch
                checked={localSettings.keyboard_navigation}
                onCheckedChange={(checked) => handleToggle('keyboard_navigation', checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Voice Navigation</h3>
                <p className="text-sm text-muted-foreground">
                  Enable voice commands (coming soon)
                </p>
              </div>
              <Switch
                checked={localSettings.voice_navigation}
                onCheckedChange={(checked) => handleToggle('voice_navigation', checked)}
                disabled
              />
            </div>
          </CardContent>
        </Card>

        {/* Screen Reader Support */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Volume2 className="h-5 w-5" />
              Screen Reader Support
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Screen Reader Optimization</h3>
                <p className="text-sm text-muted-foreground">
                  Optimize for screen readers and ARIA labels
                </p>
              </div>
              <Switch
                checked={localSettings.screen_reader_support}
                onCheckedChange={(checked) => handleToggle('screen_reader_support', checked)}
              />
            </div>

            <div className="rounded-lg border p-4 space-y-2">
              <h4 className="font-medium text-sm">Screen Reader Tips</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Use Tab to navigate between elements</li>
                <li>• Use Arrow keys to navigate lists and menus</li>
                <li>• Use Space or Enter to activate buttons</li>
                <li>• Use Escape to close dialogs and menus</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Additional Support */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Additional Support
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border p-4 space-y-2">
              <h4 className="font-medium text-sm">Need More Help?</h4>
              <p className="text-sm text-muted-foreground">
                If you need additional accessibility features or have suggestions, 
                please contact our support team. We're committed to making this 
                app accessible to everyone.
              </p>
              <Button variant="outline" size="sm" className="mt-2">
                Contact Support
              </Button>
            </div>

            <div className="rounded-lg bg-muted p-4 space-y-2">
              <h4 className="font-medium text-sm">Keyboard Shortcuts</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>Alt + H: Home</div>
                <div>Alt + W: Wardrobe</div>
                <div>Alt + A: Add Item</div>
                <div>Alt + S: Settings</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AccessibilitySettings;