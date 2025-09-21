import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Palette, 
  Monitor, 
  Sun, 
  Moon, 
  Sparkles, 
  Save, 
  RotateCcw,
  Eye,
  Wand2
} from 'lucide-react';
import { useThemeSettings } from '@/hooks/useThemeSettings';
import { useToast } from '@/hooks/use-toast';

const ThemeCustomizer = () => {
  const { themeSettings, loading, updateThemeSettings } = useThemeSettings();
  const { toast } = useToast();
  const [previewSettings, setPreviewSettings] = useState(themeSettings);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const presetThemes = [
    {
      name: 'Dark Elegance',
      primary_color: '#000000',
      secondary_color: '#ffffff',
      accent_color: '#6366f1',
      background_style: 'dark'
    },
    {
      name: 'Fashion Pink',
      primary_color: '#ec4899',
      secondary_color: '#fce7f3',
      accent_color: '#be185d',
      background_style: 'light'
    },
    {
      name: 'Minimalist',
      primary_color: '#374151',
      secondary_color: '#f9fafb',
      accent_color: '#10b981',
      background_style: 'light'
    },
    {
      name: 'Luxury Gold',
      primary_color: '#d97706',
      secondary_color: '#fef3c7',
      accent_color: '#f59e0b',
      background_style: 'warm'
    }
  ];

  const fontOptions = [
    { value: 'system', label: 'System Font' },
    { value: 'Inter', label: 'Inter' },
    { value: 'Roboto', label: 'Roboto' },
    { value: 'Open Sans', label: 'Open Sans' },
    { value: 'Playfair Display', label: 'Playfair Display' },
    { value: 'Montserrat', label: 'Montserrat' }
  ];

  const borderRadiusOptions = [
    { value: 'none', label: 'Sharp (0px)' },
    { value: 'small', label: 'Small (4px)' },
    { value: 'medium', label: 'Medium (8px)' },
    { value: 'large', label: 'Large (12px)' },
    { value: 'full', label: 'Rounded (9999px)' }
  ];

  const backgroundStyles = [
    { value: 'default', label: 'Default' },
    { value: 'dark', label: 'Dark Mode' },
    { value: 'light', label: 'Light Mode' },
    { value: 'warm', label: 'Warm' },
    { value: 'cool', label: 'Cool' }
  ];

  const handleInputChange = (field: string, value: any) => {
    if (!themeSettings) return;
    
    const updated = { ...themeSettings, [field]: value };
    setPreviewSettings(updated);
    
    // Apply preview changes immediately if in preview mode
    if (isPreviewMode) {
      applyPreviewToDOM(updated);
    }
  };

  const applyPreviewToDOM = (theme: any) => {
    const root = document.documentElement;
    
    const hexToHsl = (hex: string) => {
      const r = parseInt(hex.slice(1, 3), 16) / 255;
      const g = parseInt(hex.slice(3, 5), 16) / 255;
      const b = parseInt(hex.slice(5, 7), 16) / 255;

      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      let h = 0, s = 0, l = (max + min) / 2;

      if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case r: h = (g - b) / d + (g < b ? 6 : 0); break;
          case g: h = (b - r) / d + 2; break;
          case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
      }

      return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
    };

    // Apply colors immediately
    root.style.setProperty('--primary', hexToHsl(theme.primary_color || '#000000'));
    root.style.setProperty('--secondary', hexToHsl(theme.secondary_color || '#ffffff'));
    root.style.setProperty('--accent', hexToHsl(theme.accent_color || '#6366f1'));
    
    // Apply background style
    root.className = root.className.replace(/theme-\w+/g, '');
    if (theme.background_style && theme.background_style !== 'default') {
      root.classList.add(`theme-${theme.background_style}`);
    }
    
    // Apply border radius
    const radiusMap = {
      'none': '0px',
      'small': '4px', 
      'medium': '8px',
      'large': '12px',
      'full': '9999px'
    };
    root.style.setProperty('--radius', radiusMap[theme.border_radius as keyof typeof radiusMap] || '8px');
  };

  const applyPreset = (preset: any) => {
    if (!themeSettings) return;
    
    const updated = {
      ...themeSettings,
      ...preset
    };
    setPreviewSettings(updated);
    
    // Apply preset immediately in preview mode
    if (isPreviewMode) {
      applyPreviewToDOM(updated);
    }
  };

  const saveSettings = async () => {
    if (!previewSettings) return;
    
    try {
      await updateThemeSettings(previewSettings);
      setIsPreviewMode(false);
      toast({
        title: "Theme saved",
        description: "Your custom theme has been applied successfully.",
      });
    } catch (error) {
      toast({
        title: "Save failed",
        description: "Failed to save theme settings.",
        variant: "destructive",
      });
    }
  };

  const resetToDefault = () => {
    const defaultTheme = {
      theme_name: 'system',
      primary_color: '#000000',
      secondary_color: '#ffffff',
      accent_color: '#6366f1',
      background_style: 'default',
      font_family: 'system',
      border_radius: 'medium',
      animations_enabled: true
    };
    
    setPreviewSettings({ ...themeSettings, ...defaultTheme });
    updateThemeSettings(defaultTheme);
  };

  if (loading || !themeSettings) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="h-20 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Theme Customization
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Personalize your MyDresser experience
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const newMode = !isPreviewMode;
                  setIsPreviewMode(newMode);
                  if (newMode && previewSettings) {
                    applyPreviewToDOM(previewSettings);
                  }
                }}
              >
                <Eye className="w-4 h-4 mr-1" />
                {isPreviewMode ? 'Exit Preview' : 'Preview Mode'}
              </Button>
              <Button onClick={saveSettings} size="sm">
                <Save className="w-4 h-4 mr-1" />
                Save Theme
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="colors" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="colors">Colors</TabsTrigger>
          <TabsTrigger value="presets">Presets</TabsTrigger>
          <TabsTrigger value="typography">Typography</TabsTrigger>
          <TabsTrigger value="layout">Layout</TabsTrigger>
        </TabsList>

        <TabsContent value="colors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Color Palette</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Primary Color</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={previewSettings?.primary_color || '#000000'}
                      onChange={(e) => handleInputChange('primary_color', e.target.value)}
                      className="w-12 h-12 rounded border"
                    />
                    <Input
                      value={previewSettings?.primary_color || '#000000'}
                      onChange={(e) => handleInputChange('primary_color', e.target.value)}
                      placeholder="#000000"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Secondary Color</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={previewSettings?.secondary_color || '#ffffff'}
                      onChange={(e) => handleInputChange('secondary_color', e.target.value)}
                      className="w-12 h-12 rounded border"
                    />
                    <Input
                      value={previewSettings?.secondary_color || '#ffffff'}
                      onChange={(e) => handleInputChange('secondary_color', e.target.value)}
                      placeholder="#ffffff"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Accent Color</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={previewSettings?.accent_color || '#6366f1'}
                      onChange={(e) => handleInputChange('accent_color', e.target.value)}
                      className="w-12 h-12 rounded border"
                    />
                    <Input
                      value={previewSettings?.accent_color || '#6366f1'}
                      onChange={(e) => handleInputChange('accent_color', e.target.value)}
                      placeholder="#6366f1"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Background Style</Label>
                <Select 
                  value={previewSettings?.background_style || 'default'} 
                  onValueChange={(value) => handleInputChange('background_style', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {backgroundStyles.map((style) => (
                      <SelectItem key={style.value} value={style.value}>
                        {style.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="presets" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Theme Presets</CardTitle>
              <p className="text-sm text-muted-foreground">
                Quick start with professionally designed themes
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {presetThemes.map((preset) => (
                  <div
                    key={preset.name}
                    className="p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => applyPreset(preset)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium">{preset.name}</h3>
                      <Button variant="ghost" size="sm">
                        <Wand2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      <div
                        className="w-6 h-6 rounded-full border"
                        style={{ backgroundColor: preset.primary_color }}
                      />
                      <div
                        className="w-6 h-6 rounded-full border"
                        style={{ backgroundColor: preset.secondary_color }}
                      />
                      <div
                        className="w-6 h-6 rounded-full border"
                        style={{ backgroundColor: preset.accent_color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="typography" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Typography</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Font Family</Label>
                <Select 
                  value={previewSettings?.font_family || 'system'} 
                  onValueChange={(value) => handleInputChange('font_family', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {fontOptions.map((font) => (
                      <SelectItem key={font.value} value={font.value}>
                        {font.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="layout" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Layout & Effects</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Border Radius</Label>
                <Select 
                  value={previewSettings?.border_radius || 'medium'} 
                  onValueChange={(value) => handleInputChange('border_radius', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {borderRadiusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Animations</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable smooth transitions and animations
                  </p>
                </div>
                <Switch
                  checked={previewSettings?.animations_enabled ?? true}
                  onCheckedChange={(checked) => handleInputChange('animations_enabled', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex gap-3">
        <Button variant="outline" onClick={resetToDefault} className="flex-1">
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset to Default
        </Button>
        <Button onClick={saveSettings} className="flex-1">
          <Save className="w-4 h-4 mr-2" />
          Apply & Save Theme
        </Button>
      </div>
    </div>
  );
};

export default ThemeCustomizer;