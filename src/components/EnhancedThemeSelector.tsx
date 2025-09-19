import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
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
  Layers,
  Type,
  Layout,
  Brush,
  Grid,
  Mountain,
  Circle,
  Square,
  Triangle,
  Wand2,
  Settings2,
  Code,
  Download,
  Upload
} from "lucide-react";

const EnhancedThemeSelector = () => {
  const { preferences, updatePreferences } = useUserPreferences();
  const [selectedGradient, setSelectedGradient] = useState(preferences.theme?.gradient_preset || 'default');
  
  // Provide safe defaults for extended_theme
  const extendedTheme = preferences?.extended_theme || {
    gradient_backgrounds: true,
    animated_transitions: true,
    card_style: 'default',
    border_radius: 'medium',
    shadow_intensity: 'medium',
    button_style: 'default',
    icon_style: 'outline',
    component_density: 'normal',
    color_scheme_type: 'vibrant',
    custom_css: ''
  };

  const gradientPresets = [
    { name: 'aurora', label: 'Aurora', gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' },
    { name: 'sunset', label: 'Sunset', gradient: 'linear-gradient(135deg, #ff6b6b, #ffd93d)' },
    { name: 'ocean', label: 'Ocean', gradient: 'linear-gradient(135deg, #74b9ff, #0984e3)' },
    { name: 'forest', label: 'Forest', gradient: 'linear-gradient(135deg, #134e5e, #71b280)' },
    { name: 'royal', label: 'Royal', gradient: 'linear-gradient(135deg, #8e2de2, #4a00e0)' },
    { name: 'fire', label: 'Fire', gradient: 'linear-gradient(135deg, #f12711, #f5af19)' },
    { name: 'miami', label: 'Miami', gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
    { name: 'lavender', label: 'Lavender', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    { name: 'peach', label: 'Peach', gradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)' },
    { name: 'mint', label: 'Mint', gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' },
    { name: 'cosmic', label: 'Cosmic', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    { name: 'neon', label: 'Neon', gradient: 'linear-gradient(135deg, #00c9ff 0%, #92fe9d 100%)' }
  ];

  const colorSchemes = [
    { name: 'vibrant', label: 'Vibrant', colors: ['#ff4757', '#5352ed', '#20bf6b', '#ffa502'] },
    { name: 'muted', label: 'Muted', colors: ['#a4b0be', '#747d8c', '#57606f', '#2f3542'] },
    { name: 'pastel', label: 'Pastel', colors: ['#ffeaa7', '#fab1a0', '#fd79a8', '#e17055'] },
    { name: 'monochrome', label: 'Monochrome', colors: ['#2c2c54', '#40407a', '#706fd3', '#f7f1e3'] },
    { name: 'high_contrast', label: 'High Contrast', colors: ['#000000', '#ffffff', '#ff0000', '#00ff00'] }
  ];

  const fontFamilies = [
    { value: 'system', label: 'System Default' },
    { value: 'inter', label: 'Inter (Modern)' },
    { value: 'roboto', label: 'Roboto (Clean)' },
    { value: 'poppins', label: 'Poppins (Friendly)' },
    { value: 'playfair', label: 'Playfair (Elegant)' },
    { value: 'mono', label: 'Monospace (Code)' }
  ];

  const patternTypes = [
    { value: 'dots', label: 'Dots', icon: Circle },
    { value: 'grid', label: 'Grid', icon: Grid },
    { value: 'diagonal', label: 'Diagonal', icon: Square },
    { value: 'waves', label: 'Waves', icon: Mountain },
    { value: 'geometric', label: 'Geometric', icon: Triangle }
  ];

  const handleThemeChange = (category: string, key: string, value: any) => {
    if (category === 'mode') {
      updatePreferences({
        theme: {
          ...preferences.theme,
          mode: value
        }
      });
    } else if (['typography', 'layout', 'effects', 'patterns'].includes(category)) {
      updatePreferences({
        theme: {
          ...preferences.theme,
          [category]: {
            ...(preferences.theme as any)?.[category],
            [key]: value,
          },
        },
      });
    } else {
      updatePreferences({
        theme: {
          ...preferences.theme,
          [key]: value
        }
      });
    }
  };

  const handleExtendedThemeChange = (key: string, value: any) => {
    updatePreferences({
      extended_theme: {
        ...preferences.extended_theme,
        [key]: value
      }
    });
  };

  const handleColorChange = (colorType: keyof typeof preferences.theme.custom_colors, color: string) => {
    updatePreferences({
      theme: {
        ...preferences.theme,
        custom_colors: {
          ...preferences.theme?.custom_colors,
          [colorType]: color
        }
      }
    });
  };

  const exportTheme = () => {
    const themeData = {
      theme: preferences.theme,
      extended_theme: preferences.extended_theme
    };
    const blob = new Blob([JSON.stringify(themeData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'my-theme.json';
    a.click();
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="colors" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="colors">Colors</TabsTrigger>
          <TabsTrigger value="typography">Typography</TabsTrigger>
          <TabsTrigger value="layout">Layout</TabsTrigger>
          <TabsTrigger value="effects">Effects</TabsTrigger>
          <TabsTrigger value="patterns">Patterns</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="colors" className="space-y-6 mt-6">
          {/* Theme Mode */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="w-4 h-4" />
                Theme Mode & Color Scheme
              </CardTitle>
              <CardDescription>Choose your preferred color scheme and theme mode</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-4 gap-4">
                {[
                  { value: 'light', label: 'Light', icon: Sun },
                  { value: 'dark', label: 'Dark', icon: Moon },
                  { value: 'system', label: 'System', icon: Monitor },
                  { value: 'auto', label: 'Auto', icon: Wand2 },
                ].map(({ value, label, icon: Icon }) => (
                  <Button
                    key={value}
                    variant={preferences.theme?.mode === value ? "default" : "outline"}
                    onClick={() => updatePreferences({
                      theme: { ...preferences.theme, mode: value as any }
                    })}
                    className="h-20 flex-col gap-2"
                  >
                    <Icon className="w-6 h-6" />
                    {label}
                  </Button>
                ))}
              </div>
              
              <Separator />
              
              <div>
                <Label className="text-base font-medium mb-4 block">Color Schemes</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {colorSchemes.map((scheme) => (
                    <button
                      key={scheme.name}
                      onClick={() => handleExtendedThemeChange('color_scheme_type', scheme.name)}
                      className={`p-4 rounded-lg border transition-all ${
                        extendedTheme.color_scheme_type === scheme.name
                          ? 'border-primary ring-2 ring-primary/20'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">{scheme.label}</span>
                        <div className="flex gap-1">
                          {scheme.colors.map((color, i) => (
                            <div
                              key={i}
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
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
              <CardDescription>Beautiful gradient presets for your interface</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                {gradientPresets.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => {
                      setSelectedGradient(preset.name);
                      updatePreferences({
                        theme: { ...preferences.theme, gradient_preset: preset.name }
                      });
                    }}
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

          {/* Custom Color Palette */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-4 h-4" />
                Custom Color Palette
              </CardTitle>
              <CardDescription>Fine-tune your color palette with custom colors</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(preferences.theme?.custom_colors || {}).map(([key, value]) => (
                  <div key={key} className="space-y-2">
                    <Label className="capitalize">{key.replace('_', ' ')}</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={value}
                        onChange={(e) => handleColorChange(key as any, e.target.value)}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        value={value}
                        onChange={(e) => handleColorChange(key as any, e.target.value)}
                        className="flex-1 font-mono text-sm"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="typography" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Type className="w-4 h-4" />
                Typography Settings
              </CardTitle>
              <CardDescription>Customize fonts, spacing, and text appearance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Font Family</Label>
                  <Select 
                    value={preferences.theme?.typography?.font_family || 'system'}
                    onValueChange={(value) => handleThemeChange('typography', 'font_family', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {fontFamilies.map(font => (
                        <SelectItem key={font.value} value={font.value}>{font.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Font Weight</Label>
                  <Select 
                    value={preferences.theme?.typography?.font_weight || 'normal'}
                    onValueChange={(value) => handleThemeChange('typography', 'font_weight', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="semibold">Semi Bold</SelectItem>
                      <SelectItem value="bold">Bold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Letter Spacing</Label>
                  <Select 
                    value={preferences.theme?.typography?.letter_spacing || 'normal'}
                    onValueChange={(value) => handleThemeChange('typography', 'letter_spacing', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tight">Tight</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="wide">Wide</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Line Height</Label>
                  <Select 
                    value={preferences.theme?.typography?.line_height || 'normal'}
                    onValueChange={(value) => handleThemeChange('typography', 'line_height', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tight">Tight</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="relaxed">Relaxed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2">Typography Preview</h4>
                <p className="text-lg">The quick brown fox jumps over the lazy dog.</p>
                <p className="text-sm text-muted-foreground">This is how your text will appear with the selected settings.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="layout" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layout className="w-4 h-4" />
                Layout & Spacing
              </CardTitle>
              <CardDescription>Configure layout, spacing, and component styles</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label>Content Spacing</Label>
                  <Select 
                    value={preferences.theme?.layout?.spacing || 'normal'}
                    onValueChange={(value) => handleThemeChange('layout', 'spacing', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="compact">Compact</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="comfortable">Comfortable</SelectItem>
                      <SelectItem value="spacious">Spacious</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Content Width</Label>
                  <Select 
                    value={preferences.theme?.layout?.content_width || 'normal'}
                    onValueChange={(value) => handleThemeChange('layout', 'content_width', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="narrow">Narrow</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="wide">Wide</SelectItem>
                      <SelectItem value="full">Full Width</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Component Density</Label>
                  <Select 
                    value={extendedTheme.component_density}
                    onValueChange={(value) => handleExtendedThemeChange('component_density', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="compact">Compact</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="comfortable">Comfortable</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label>Border Radius</Label>
                  <Select 
                    value={extendedTheme.border_radius}
                    onValueChange={(value) => handleExtendedThemeChange('border_radius', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="small">Small</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="large">Large</SelectItem>
                      <SelectItem value="xl">Extra Large</SelectItem>
                      <SelectItem value="full">Full</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Shadow Intensity</Label>
                  <Select 
                    value={extendedTheme.shadow_intensity}
                    onValueChange={(value) => handleExtendedThemeChange('shadow_intensity', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="subtle">Subtle</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="strong">Strong</SelectItem>
                      <SelectItem value="dramatic">Dramatic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Card Style</Label>
                  <Select 
                    value={extendedTheme.card_style}
                    onValueChange={(value) => handleExtendedThemeChange('card_style', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default</SelectItem>
                      <SelectItem value="minimal">Minimal</SelectItem>
                      <SelectItem value="elevated">Elevated</SelectItem>
                      <SelectItem value="outlined">Outlined</SelectItem>
                      <SelectItem value="glass">Glass</SelectItem>
                      <SelectItem value="neumorphism">Neumorphism</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="effects" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Visual Effects & Animations
              </CardTitle>
              <CardDescription>Enhance your experience with visual effects</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {Object.entries(preferences.theme?.effects || {}).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <Label className="capitalize">{key.replace('_', ' ')}</Label>
                    <p className="text-sm text-muted-foreground">
                      {key === 'glass_morphism' && 'Enable glass morphism and backdrop blur'}
                      {key === 'particle_effects' && 'Add subtle particle animations'}
                      {key === 'hover_animations' && 'Smooth hover effects on interactive elements'}
                      {key === 'page_transitions' && 'Smooth transitions between pages'}
                      {key === 'loading_animations' && 'Enhanced loading animations'}
                    </p>
                  </div>
                  <Switch 
                    checked={value}
                    onCheckedChange={(checked) => handleThemeChange('effects', key, checked)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patterns" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Grid className="w-4 h-4" />
                Background Patterns
              </CardTitle>
              <CardDescription>Add subtle patterns to your background</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Use Patterns</Label>
                  <p className="text-sm text-muted-foreground">Enable background patterns</p>
                </div>
                <Switch 
                  checked={preferences.theme?.patterns?.use_patterns || false}
                  onCheckedChange={(checked) => handleThemeChange('patterns', 'use_patterns', checked)}
                />
              </div>
              
              {preferences.theme?.patterns?.use_patterns && (
                <>
                  <div className="space-y-4">
                    <Label>Pattern Type</Label>
                    <div className="grid grid-cols-5 gap-4">
                      {patternTypes.map(({ value, label, icon: Icon }) => (
                        <Button
                          key={value}
                          variant={preferences.theme?.patterns?.pattern_type === value ? "default" : "outline"}
                          onClick={() => handleThemeChange('patterns', 'pattern_type', value)}
                          className="h-16 flex-col gap-2"
                        >
                          <Icon className="w-5 h-5" />
                          <span className="text-xs">{label}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Pattern Opacity</Label>
                    <Slider
                      value={[preferences.theme?.patterns?.pattern_opacity || 0.1]}
                      onValueChange={([value]) => handleThemeChange('patterns', 'pattern_opacity', value)}
                      max={0.5}
                      min={0.05}
                      step={0.05}
                      className="w-full"
                    />
                    <div className="text-sm text-muted-foreground text-center">
                      {Math.round((preferences.theme?.patterns?.pattern_opacity || 0.1) * 100)}%
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings2 className="w-4 h-4" />
                Advanced Settings
              </CardTitle>
              <CardDescription>Fine-tune advanced theme options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Button Style</Label>
                  <Select 
                    value={extendedTheme.button_style}
                    onValueChange={(value) => handleExtendedThemeChange('button_style', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default</SelectItem>
                      <SelectItem value="rounded">Rounded</SelectItem>
                      <SelectItem value="pill">Pill</SelectItem>
                      <SelectItem value="sharp">Sharp</SelectItem>
                      <SelectItem value="gradient">Gradient</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Icon Style</Label>
                  <Select 
                    value={extendedTheme.icon_style}
                    onValueChange={(value) => handleExtendedThemeChange('icon_style', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="outline">Outline</SelectItem>
                      <SelectItem value="filled">Filled</SelectItem>
                      <SelectItem value="duotone">Duotone</SelectItem>
                      <SelectItem value="animated">Animated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Custom CSS</Label>
                <Textarea
                  placeholder="Add your custom CSS rules here..."
                  value={extendedTheme.custom_css || ''}
                  onChange={(e) => handleExtendedThemeChange('custom_css', e.target.value)}
                  className="font-mono text-sm"
                  rows={6}
                />
              </div>
              
              <Separator />
              
              <div className="flex gap-4">
                <Button onClick={exportTheme} variant="outline" className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Export Theme
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  Import Theme
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Live Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Live Preview
              </CardTitle>
              <CardDescription>See your theme in action</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 p-6 rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Sample Interface</h3>
                  <Badge>New</Badge>
                </div>
                <p className="text-muted-foreground">
                  This preview shows how your theme customizations will look across the application.
                </p>
                <div className="flex gap-2">
                  <Button>Primary Button</Button>
                  <Button variant="outline">Secondary</Button>
                  <Button variant="ghost">Ghost</Button>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="p-4">
                      <div className="space-y-2">
                        <div className="h-4 bg-muted rounded animate-pulse" />
                        <div className="h-3 bg-muted/70 rounded animate-pulse" />
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedThemeSelector;