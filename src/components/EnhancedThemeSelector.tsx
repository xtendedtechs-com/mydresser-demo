import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { 
  Palette, 
  Droplets, 
  Sun, 
  Moon, 
  Monitor, 
  Sparkles,
  Eye,
  Zap,
  Layers
} from "lucide-react";

const EnhancedThemeSelector = () => {
  const { preferences, updatePreferences } = useUserPreferences();
  const [selectedGradient, setSelectedGradient] = useState(preferences.theme.gradient_preset);

  const gradientPresets = [
    { name: 'warm', label: 'Warm', gradient: 'linear-gradient(135deg, #fd7c2b, #ff9d5c)' },
    { name: 'cool', label: 'Cool', gradient: 'linear-gradient(135deg, #667eea, #764ba2)' },
    { name: 'nature', label: 'Nature', gradient: 'linear-gradient(135deg, #56ab2f, #a8e6cf)' },
    { name: 'sunset', label: 'Sunset', gradient: 'linear-gradient(135deg, #ff6b6b, #ffd93d)' },
    { name: 'ocean', label: 'Ocean', gradient: 'linear-gradient(135deg, #74b9ff, #0984e3)' },
    { name: 'royal', label: 'Royal', gradient: 'linear-gradient(135deg, #8e2de2, #4a00e0)' },
    { name: 'forest', label: 'Forest', gradient: 'linear-gradient(135deg, #134e5e, #71b280)' },
    { name: 'fire', label: 'Fire', gradient: 'linear-gradient(135deg, #f12711, #f5af19)' },
  ];

  const accentColors = [
    { name: 'orange', color: '#fd7c2b', label: 'Fashion Orange' },
    { name: 'blue', color: '#667eea', label: 'Cool Blue' },
    { name: 'purple', color: '#8e2de2', label: 'Royal Purple' },
    { name: 'green', color: '#56ab2f', label: 'Nature Green' },
    { name: 'pink', color: '#ff6b6b', label: 'Sunset Pink' },
    { name: 'teal', color: '#74b9ff', label: 'Ocean Teal' },
  ];

  const handleThemeChange = (key: string, value: any) => {
    updatePreferences({
      theme: {
        ...preferences.theme,
        [key]: value
      }
    });
  };

  const handleGradientSelect = (gradientName: string) => {
    setSelectedGradient(gradientName);
    handleThemeChange('gradient_preset', gradientName);
  };

  const handleCustomColorChange = (colorType: keyof typeof preferences.theme.custom_colors, color: string) => {
    updatePreferences({
      theme: {
        ...preferences.theme,
        custom_colors: {
          ...preferences.theme.custom_colors,
          [colorType]: color
        }
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Theme Mode */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="w-4 h-4" />
            Theme Mode
          </CardTitle>
          <CardDescription>Choose your preferred color scheme</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {[
              { value: 'light', label: 'Light', icon: Sun },
              { value: 'dark', label: 'Dark', icon: Moon },
              { value: 'system', label: 'System', icon: Monitor },
            ].map(({ value, label, icon: Icon }) => (
              <Button
                key={value}
                variant={preferences.theme.mode === value ? "default" : "outline"}
                onClick={() => handleThemeChange('mode', value)}
                className="h-20 flex-col gap-2"
              >
                <Icon className="w-6 h-6" />
                {label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Gradient Presets */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Droplets className="w-4 h-4" />
            Gradient Themes
          </CardTitle>
          <CardDescription>Choose from beautiful gradient presets</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {gradientPresets.map((preset) => (
              <button
                key={preset.name}
                onClick={() => handleGradientSelect(preset.name)}
                className={`aspect-square rounded-lg p-3 transition-all ${
                  selectedGradient === preset.name 
                    ? 'ring-2 ring-primary scale-105' 
                    : 'hover:scale-105'
                }`}
                style={{ background: preset.gradient }}
              >
                <div className="h-full w-full flex items-end">
                  <span className="text-white text-sm font-medium bg-black/20 px-2 py-1 rounded backdrop-blur-sm">
                    {preset.label}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Accent Colors */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Accent Colors
          </CardTitle>
          <CardDescription>Choose your brand accent color</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-6 gap-3">
            {accentColors.map((accent) => (
              <button
                key={accent.name}
                onClick={() => handleThemeChange('accent_color', accent.name)}
                className={`aspect-square rounded-full transition-transform ${
                  preferences.theme.accent_color === accent.name 
                    ? 'ring-2 ring-primary scale-110' 
                    : 'hover:scale-110'
                }`}
                style={{ backgroundColor: accent.color }}
                title={accent.label}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Custom Colors */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Custom Colors
          </CardTitle>
          <CardDescription>Fine-tune your color palette</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Primary Color</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={preferences.theme.custom_colors.primary}
                  onChange={(e) => handleCustomColorChange('primary', e.target.value)}
                  className="w-16 h-10 p-1"
                />
                <Input
                  value={preferences.theme.custom_colors.primary}
                  onChange={(e) => handleCustomColorChange('primary', e.target.value)}
                  className="flex-1 font-mono text-sm"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Secondary Color</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={preferences.theme.custom_colors.secondary}
                  onChange={(e) => handleCustomColorChange('secondary', e.target.value)}
                  className="w-16 h-10 p-1"
                />
                <Input
                  value={preferences.theme.custom_colors.secondary}
                  onChange={(e) => handleCustomColorChange('secondary', e.target.value)}
                  className="flex-1 font-mono text-sm"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Accent Color</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={preferences.theme.custom_colors.accent}
                  onChange={(e) => handleCustomColorChange('accent', e.target.value)}
                  className="w-16 h-10 p-1"
                />
                <Input
                  value={preferences.theme.custom_colors.accent}
                  onChange={(e) => handleCustomColorChange('accent', e.target.value)}
                  className="flex-1 font-mono text-sm"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Visual Effects */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Visual Effects
          </CardTitle>
          <CardDescription>Enhance your visual experience</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label>Blur Effects</Label>
              <p className="text-sm text-muted-foreground">Enable glass morphism and backdrop blur</p>
            </div>
            <Switch 
              checked={preferences.theme.blur_effects}
              onCheckedChange={(checked) => handleThemeChange('blur_effects', checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Compact Mode</Label>
              <p className="text-sm text-muted-foreground">Use more compact interface elements</p>
            </div>
            <Switch 
              checked={preferences.theme.compact_mode}
              onCheckedChange={(checked) => handleThemeChange('compact_mode', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="w-4 h-4" />
            Preview
          </CardTitle>
          <CardDescription>See how your theme looks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div 
              className={`p-6 rounded-lg ${preferences.theme.blur_effects ? 'fashion-card-glass' : 'fashion-card'}`}
              style={{ 
                background: selectedGradient ? gradientPresets.find(g => g.name === selectedGradient)?.gradient : undefined 
              }}
            >
              <div className="text-white space-y-2">
                <h3 className="text-lg font-semibold">Sample Card</h3>
                <p className="text-white/80">This is how your themed cards will look</p>
                <div className="flex gap-2">
                  <Badge className="bg-white/20 text-white border-white/30">Tag 1</Badge>
                  <Badge className="bg-white/20 text-white border-white/30">Tag 2</Badge>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button className="fashion-button-gradient">Gradient Button</Button>
              <Button variant="outline">Outline Button</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedThemeSelector;