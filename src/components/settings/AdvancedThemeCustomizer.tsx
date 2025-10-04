import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { Palette, Type, Layout, Sparkles, Shapes, Paintbrush } from "lucide-react";
import { toast } from "sonner";

interface ThemeCustomization {
  // Colors
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  
  // Typography
  fontFamily: string;
  fontSize: number;
  fontWeight: string;
  lineHeight: number;
  letterSpacing: number;
  
  // Layout
  borderRadius: number;
  spacing: number;
  containerWidth: string;
  
  // Effects
  shadowIntensity: number;
  glassEffect: boolean;
  gradientStyle: string;
  blurAmount: number;
  
  // Animations
  animationSpeed: string;
  hoverEffects: boolean;
  transitionEasing: string;
  
  // Advanced
  customCSS: string;
}

const defaultTheme: ThemeCustomization = {
  primaryColor: '#000000',
  secondaryColor: '#ffffff',
  accentColor: '#666666',
  backgroundColor: '#fafafa',
  fontFamily: 'Inter',
  fontSize: 16,
  fontWeight: '400',
  lineHeight: 1.5,
  letterSpacing: 0,
  borderRadius: 8,
  spacing: 16,
  containerWidth: '1280px',
  shadowIntensity: 50,
  glassEffect: false,
  gradientStyle: 'none',
  blurAmount: 0,
  animationSpeed: 'normal',
  hoverEffects: true,
  transitionEasing: 'ease-in-out',
  customCSS: '',
};

export const AdvancedThemeCustomizer = () => {
  const [theme, setTheme] = useState<ThemeCustomization>(() => {
    const saved = localStorage.getItem('advanced-theme');
    return saved ? JSON.parse(saved) : defaultTheme;
  });

  useEffect(() => {
    localStorage.setItem('advanced-theme', JSON.stringify(theme));
    applyTheme(theme);
  }, [theme]);

  const applyTheme = (customTheme: ThemeCustomization) => {
    const root = document.documentElement;
    
    // Apply colors
    root.style.setProperty('--custom-primary', customTheme.primaryColor);
    root.style.setProperty('--custom-secondary', customTheme.secondaryColor);
    root.style.setProperty('--custom-accent', customTheme.accentColor);
    root.style.setProperty('--custom-bg', customTheme.backgroundColor);
    
    // Apply typography
    root.style.setProperty('--custom-font-family', customTheme.fontFamily);
    root.style.setProperty('--custom-font-size', `${customTheme.fontSize}px`);
    root.style.setProperty('--custom-font-weight', customTheme.fontWeight);
    root.style.setProperty('--custom-line-height', customTheme.lineHeight.toString());
    root.style.setProperty('--custom-letter-spacing', `${customTheme.letterSpacing}px`);
    
    // Apply layout
    root.style.setProperty('--custom-radius', `${customTheme.borderRadius}px`);
    root.style.setProperty('--custom-spacing', `${customTheme.spacing}px`);
    root.style.setProperty('--custom-container-width', customTheme.containerWidth);
    
    // Apply effects
    root.style.setProperty('--custom-shadow-intensity', (customTheme.shadowIntensity / 100).toString());
    root.style.setProperty('--custom-blur', `${customTheme.blurAmount}px`);
    
    // Apply animation speed
    const speeds = { fast: '0.15s', normal: '0.3s', slow: '0.6s' };
    root.style.setProperty('--custom-transition-speed', speeds[customTheme.animationSpeed as keyof typeof speeds] || '0.3s');
    root.style.setProperty('--custom-transition-easing', customTheme.transitionEasing);
    
    // Apply custom CSS
    let styleEl = document.getElementById('custom-theme-styles');
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'custom-theme-styles';
      document.head.appendChild(styleEl);
    }
    styleEl.textContent = customTheme.customCSS;
  };

  const updateTheme = (key: keyof ThemeCustomization, value: any) => {
    setTheme(prev => ({ ...prev, [key]: value }));
  };

  const resetTheme = () => {
    setTheme(defaultTheme);
    toast.success("Theme reset to defaults");
  };

  const presets = [
    { name: 'Minimal', values: { primaryColor: '#000000', secondaryColor: '#ffffff', borderRadius: 4, shadowIntensity: 10 } },
    { name: 'Vibrant', values: { primaryColor: '#8b5cf6', secondaryColor: '#ec4899', borderRadius: 16, shadowIntensity: 80 } },
    { name: 'Nature', values: { primaryColor: '#10b981', secondaryColor: '#059669', borderRadius: 12, shadowIntensity: 40 } },
    { name: 'Ocean', values: { primaryColor: '#0ea5e9', secondaryColor: '#06b6d4', borderRadius: 20, shadowIntensity: 60 } },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Paintbrush className="w-5 h-5" />
          Advanced Theme Customization
        </CardTitle>
        <CardDescription>
          Complete control over your app's appearance
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="colors" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="colors">
              <Palette className="w-4 h-4 mr-2" />
              Colors
            </TabsTrigger>
            <TabsTrigger value="typography">
              <Type className="w-4 h-4 mr-2" />
              Type
            </TabsTrigger>
            <TabsTrigger value="layout">
              <Layout className="w-4 h-4 mr-2" />
              Layout
            </TabsTrigger>
            <TabsTrigger value="effects">
              <Sparkles className="w-4 h-4 mr-2" />
              Effects
            </TabsTrigger>
            <TabsTrigger value="animations">
              <Shapes className="w-4 h-4 mr-2" />
              Motion
            </TabsTrigger>
            <TabsTrigger value="presets">
              Presets
            </TabsTrigger>
          </TabsList>

          <TabsContent value="colors" className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="primary-color">Primary Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="primary-color"
                    type="color"
                    value={theme.primaryColor}
                    onChange={(e) => updateTheme('primaryColor', e.target.value)}
                    className="w-20 h-10"
                  />
                  <Input
                    value={theme.primaryColor}
                    onChange={(e) => updateTheme('primaryColor', e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="secondary-color">Secondary Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="secondary-color"
                    type="color"
                    value={theme.secondaryColor}
                    onChange={(e) => updateTheme('secondaryColor', e.target.value)}
                    className="w-20 h-10"
                  />
                  <Input
                    value={theme.secondaryColor}
                    onChange={(e) => updateTheme('secondaryColor', e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="accent-color">Accent Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="accent-color"
                    type="color"
                    value={theme.accentColor}
                    onChange={(e) => updateTheme('accentColor', e.target.value)}
                    className="w-20 h-10"
                  />
                  <Input
                    value={theme.accentColor}
                    onChange={(e) => updateTheme('accentColor', e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="bg-color">Background Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="bg-color"
                    type="color"
                    value={theme.backgroundColor}
                    onChange={(e) => updateTheme('backgroundColor', e.target.value)}
                    className="w-20 h-10"
                  />
                  <Input
                    value={theme.backgroundColor}
                    onChange={(e) => updateTheme('backgroundColor', e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="typography" className="space-y-6">
            <div>
              <Label htmlFor="font-family">Font Family</Label>
              <Select value={theme.fontFamily} onValueChange={(v) => updateTheme('fontFamily', v)}>
                <SelectTrigger id="font-family">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Inter">Inter</SelectItem>
                  <SelectItem value="Arial">Arial</SelectItem>
                  <SelectItem value="Helvetica">Helvetica</SelectItem>
                  <SelectItem value="Georgia">Georgia</SelectItem>
                  <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                  <SelectItem value="Courier New">Courier New</SelectItem>
                  <SelectItem value="Verdana">Verdana</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Font Size: {theme.fontSize}px</Label>
              <Slider
                value={[theme.fontSize]}
                onValueChange={([v]) => updateTheme('fontSize', v)}
                min={12}
                max={24}
                step={1}
              />
            </div>

            <div>
              <Label htmlFor="font-weight">Font Weight</Label>
              <Select value={theme.fontWeight} onValueChange={(v) => updateTheme('fontWeight', v)}>
                <SelectTrigger id="font-weight">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="300">Light (300)</SelectItem>
                  <SelectItem value="400">Regular (400)</SelectItem>
                  <SelectItem value="500">Medium (500)</SelectItem>
                  <SelectItem value="600">Semi-Bold (600)</SelectItem>
                  <SelectItem value="700">Bold (700)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Line Height: {theme.lineHeight}</Label>
              <Slider
                value={[theme.lineHeight]}
                onValueChange={([v]) => updateTheme('lineHeight', v)}
                min={1}
                max={2.5}
                step={0.1}
              />
            </div>

            <div>
              <Label>Letter Spacing: {theme.letterSpacing}px</Label>
              <Slider
                value={[theme.letterSpacing]}
                onValueChange={([v]) => updateTheme('letterSpacing', v)}
                min={-2}
                max={4}
                step={0.1}
              />
            </div>
          </TabsContent>

          <TabsContent value="layout" className="space-y-6">
            <div>
              <Label>Border Radius: {theme.borderRadius}px</Label>
              <Slider
                value={[theme.borderRadius]}
                onValueChange={([v]) => updateTheme('borderRadius', v)}
                min={0}
                max={32}
                step={2}
              />
            </div>

            <div>
              <Label>Spacing Scale: {theme.spacing}px</Label>
              <Slider
                value={[theme.spacing]}
                onValueChange={([v]) => updateTheme('spacing', v)}
                min={8}
                max={32}
                step={2}
              />
            </div>

            <div>
              <Label htmlFor="container-width">Container Width</Label>
              <Select value={theme.containerWidth} onValueChange={(v) => updateTheme('containerWidth', v)}>
                <SelectTrigger id="container-width">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1024px">Small (1024px)</SelectItem>
                  <SelectItem value="1280px">Medium (1280px)</SelectItem>
                  <SelectItem value="1536px">Large (1536px)</SelectItem>
                  <SelectItem value="100%">Full Width</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          <TabsContent value="effects" className="space-y-6">
            <div>
              <Label>Shadow Intensity: {theme.shadowIntensity}%</Label>
              <Slider
                value={[theme.shadowIntensity]}
                onValueChange={([v]) => updateTheme('shadowIntensity', v)}
                min={0}
                max={100}
                step={5}
              />
            </div>

            <div>
              <Label>Blur Amount: {theme.blurAmount}px</Label>
              <Slider
                value={[theme.blurAmount]}
                onValueChange={([v]) => updateTheme('blurAmount', v)}
                min={0}
                max={20}
                step={1}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="glass-effect">Glass Morphism Effect</Label>
              <Switch
                id="glass-effect"
                checked={theme.glassEffect}
                onCheckedChange={(checked) => updateTheme('glassEffect', checked)}
              />
            </div>

            <div>
              <Label htmlFor="gradient-style">Gradient Style</Label>
              <Select value={theme.gradientStyle} onValueChange={(v) => updateTheme('gradientStyle', v)}>
                <SelectTrigger id="gradient-style">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="linear">Linear</SelectItem>
                  <SelectItem value="radial">Radial</SelectItem>
                  <SelectItem value="conic">Conic</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          <TabsContent value="animations" className="space-y-6">
            <div>
              <Label htmlFor="animation-speed">Animation Speed</Label>
              <Select value={theme.animationSpeed} onValueChange={(v) => updateTheme('animationSpeed', v)}>
                <SelectTrigger id="animation-speed">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fast">Fast (0.15s)</SelectItem>
                  <SelectItem value="normal">Normal (0.3s)</SelectItem>
                  <SelectItem value="slow">Slow (0.6s)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="transition-easing">Transition Easing</Label>
              <Select value={theme.transitionEasing} onValueChange={(v) => updateTheme('transitionEasing', v)}>
                <SelectTrigger id="transition-easing">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="linear">Linear</SelectItem>
                  <SelectItem value="ease">Ease</SelectItem>
                  <SelectItem value="ease-in">Ease In</SelectItem>
                  <SelectItem value="ease-out">Ease Out</SelectItem>
                  <SelectItem value="ease-in-out">Ease In Out</SelectItem>
                  <SelectItem value="cubic-bezier(0.4, 0, 0.2, 1)">Custom Bezier</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="hover-effects">Enable Hover Effects</Label>
              <Switch
                id="hover-effects"
                checked={theme.hoverEffects}
                onCheckedChange={(checked) => updateTheme('hoverEffects', checked)}
              />
            </div>
          </TabsContent>

          <TabsContent value="presets" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {presets.map((preset) => (
                <Card key={preset.name} className="cursor-pointer hover:border-primary transition-colors" onClick={() => setTheme(prev => ({ ...prev, ...preset.values }))}>
                  <CardHeader>
                    <CardTitle className="text-lg">{preset.name}</CardTitle>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex gap-4 mt-6">
          <Button onClick={resetTheme} variant="outline" className="flex-1">
            Reset to Defaults
          </Button>
          <Button onClick={() => toast.success("Theme applied!")} className="flex-1">
            Apply Theme
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
