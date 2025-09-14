import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { 
  Accessibility, 
  Eye, 
  Volume2, 
  Keyboard, 
  MousePointer, 
  Focus,
  Navigation,
  Hand,
  Headphones,
  Gauge,
  Contrast,
  Type,
  Move,
  Zap,
  Vibrate,
  BookOpen,
  Users
} from "lucide-react";

const AccessibilitySettings = () => {
  const { preferences, updatePreferences } = useUserPreferences();

  const handleAccessibilityChange = (key: keyof typeof preferences.accessibility_settings, value: any) => {
    updatePreferences({
      accessibility_settings: {
        ...preferences.accessibility_settings,
        [key]: value
      }
    });
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="visual" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="visual">Visual</TabsTrigger>
          <TabsTrigger value="motor">Motor</TabsTrigger>
          <TabsTrigger value="cognitive">Cognitive</TabsTrigger>
          <TabsTrigger value="audio">Audio</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="visual" className="space-y-6 mt-6">
          {/* Visual Accessibility */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Visual Accessibility
              </CardTitle>
              <CardDescription>Settings to improve visual accessibility and readability</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="flex items-center gap-2">
                    <Contrast className="w-4 h-4" />
                    High Contrast Mode
                  </Label>
                  <p className="text-sm text-muted-foreground">Increase contrast for better visibility</p>
                </div>
                <Switch
                  checked={preferences.accessibility_settings?.high_contrast || false}
                  onCheckedChange={(checked) => handleAccessibilityChange('high_contrast', checked)}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <Label className="flex items-center gap-2">
                    <Type className="w-4 h-4" />
                    Large Text
                  </Label>
                  <p className="text-sm text-muted-foreground">Use larger text throughout the app</p>
                </div>
                <Switch
                  checked={preferences.accessibility_settings?.large_text || false}
                  onCheckedChange={(checked) => handleAccessibilityChange('large_text', checked)}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Color Blind Friendly</Label>
                  <p className="text-sm text-muted-foreground">Use patterns and shapes in addition to colors</p>
                </div>
                <Switch
                  checked={preferences.accessibility_settings?.color_blind_friendly || false}
                  onCheckedChange={(checked) => handleAccessibilityChange('color_blind_friendly', checked)}
                />
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <Label>Font Size Multiplier</Label>
                <Slider
                  value={[preferences.accessibility_settings?.font_size_multiplier || 1]}
                  onValueChange={([value]) => handleAccessibilityChange('font_size_multiplier', value)}
                  max={3}
                  min={0.8}
                  step={0.1}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>0.8x (Smaller)</span>
                  <Badge variant="outline">{(preferences.accessibility_settings?.font_size_multiplier || 1).toFixed(1)}x</Badge>
                  <span>3x (Larger)</span>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <Label>Contrast Ratio</Label>
                <Slider
                  value={[preferences.accessibility_settings?.contrast_ratio || 4.5]}
                  onValueChange={([value]) => handleAccessibilityChange('contrast_ratio', value)}
                  max={7}
                  min={3}
                  step={0.1}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>3:1 (Minimum)</span>
                  <Badge variant="outline">{(preferences.accessibility_settings?.contrast_ratio || 4.5).toFixed(1)}:1</Badge>
                  <span>7:1 (Enhanced)</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Dyslexia-Friendly Font</Label>
                  <p className="text-sm text-muted-foreground">Use fonts optimized for dyslexia</p>
                </div>
                <Switch
                  checked={preferences.accessibility_settings?.dyslexia_friendly || false}
                  onCheckedChange={(checked) => handleAccessibilityChange('dyslexia_friendly', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="motor" className="space-y-6 mt-6">
          {/* Motor Accessibility */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hand className="w-4 h-4" />
                Motor & Navigation
              </CardTitle>
              <CardDescription>Settings for motor impairments and navigation assistance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="flex items-center gap-2">
                    <Keyboard className="w-4 h-4" />
                    Enhanced Keyboard Navigation
                  </Label>
                  <p className="text-sm text-muted-foreground">Full keyboard navigation support</p>
                </div>
                <Switch
                  checked={preferences.accessibility_settings?.keyboard_navigation || false}
                  onCheckedChange={(checked) => handleAccessibilityChange('keyboard_navigation', checked)}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <Label className="flex items-center gap-2">
                    <Focus className="w-4 h-4" />
                    Enhanced Focus Indicators
                  </Label>
                  <p className="text-sm text-muted-foreground">Visible focus rings and highlights</p>
                </div>
                <Switch
                  checked={preferences.accessibility_settings?.focus_indicators || false}
                  onCheckedChange={(checked) => handleAccessibilityChange('focus_indicators', checked)}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <Label className="flex items-center gap-2">
                    <Navigation className="w-4 h-4" />
                    Skip Navigation Links
                  </Label>
                  <p className="text-sm text-muted-foreground">Quick navigation to main content</p>
                </div>
                <Switch
                  checked={preferences.accessibility_settings?.skip_navigation || false}
                  onCheckedChange={(checked) => handleAccessibilityChange('skip_navigation', checked)}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Click Assistance</Label>
                  <p className="text-sm text-muted-foreground">Larger click targets and assistance</p>
                </div>
                <Switch
                  checked={preferences.accessibility_settings?.click_assistance || false}
                  onCheckedChange={(checked) => handleAccessibilityChange('click_assistance', checked)}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Gesture Controls</Label>
                  <p className="text-sm text-muted-foreground">Alternative gesture-based navigation</p>
                </div>
                <Switch
                  checked={preferences.accessibility_settings?.gesture_controls || false}
                  onCheckedChange={(checked) => handleAccessibilityChange('gesture_controls', checked)}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Cursor Enhancement</Label>
                  <p className="text-sm text-muted-foreground">Enhanced cursor visibility and size</p>
                </div>
                <Switch
                  checked={preferences.accessibility_settings?.cursor_enhancement || false}
                  onCheckedChange={(checked) => handleAccessibilityChange('cursor_enhancement', checked)}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <Label className="flex items-center gap-2">
                    <Move className="w-4 h-4" />
                    Reduce Motion
                  </Label>
                  <p className="text-sm text-muted-foreground">Minimize animations and transitions</p>
                </div>
                <Switch
                  checked={preferences.accessibility_settings?.reduce_motion || false}
                  onCheckedChange={(checked) => handleAccessibilityChange('reduce_motion', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cognitive" className="space-y-6 mt-6">
          {/* Cognitive Accessibility */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Cognitive & Reading Support
              </CardTitle>
              <CardDescription>Settings to support cognitive accessibility and reading comprehension</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Reading Mode</Label>
                  <p className="text-sm text-muted-foreground">Simplified reading experience</p>
                </div>
                <Switch
                  checked={preferences.accessibility_settings?.reading_mode || false}
                  onCheckedChange={(checked) => handleAccessibilityChange('reading_mode', checked)}
                />
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <Label>Reading Speed</Label>
                <Select 
                  value={preferences.accessibility_settings?.reading_speed || 'normal'}
                  onValueChange={(value) => handleAccessibilityChange('reading_speed', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="slow">Slow (More time to read)</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="fast">Fast (Quick reading)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <Label>Content Spacing</Label>
                <Slider
                  value={[preferences.accessibility_settings?.content_spacing || 1]}
                  onValueChange={([value]) => handleAccessibilityChange('content_spacing', value)}
                  max={2}
                  min={0.5}
                  step={0.1}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Tight</span>
                  <Badge variant="outline">{(preferences.accessibility_settings?.content_spacing || 1).toFixed(1)}x</Badge>
                  <span>Spacious</span>
                </div>
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Alternative Text Descriptions</Label>
                  <p className="text-sm text-muted-foreground">Show detailed descriptions for images</p>
                </div>
                <Switch
                  checked={preferences.accessibility_settings?.alternative_text || false}
                  onCheckedChange={(checked) => handleAccessibilityChange('alternative_text', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audio" className="space-y-6 mt-6">
          {/* Audio Accessibility */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Volume2 className="w-4 h-4" />
                Audio & Screen Reader Support
              </CardTitle>
              <CardDescription>Settings for screen readers and audio assistance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Screen Reader Optimization</Label>
                  <p className="text-sm text-muted-foreground">Optimize for screen readers and assistive tools</p>
                </div>
                <Switch
                  checked={preferences.accessibility_settings?.screen_reader_support || false}
                  onCheckedChange={(checked) => handleAccessibilityChange('screen_reader_support', checked)}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <Label className="flex items-center gap-2">
                    <Headphones className="w-4 h-4" />
                    Voice Navigation (Experimental)
                  </Label>
                  <p className="text-sm text-muted-foreground">Navigate using voice commands</p>
                </div>
                <Switch
                  checked={preferences.accessibility_settings?.voice_navigation || false}
                  onCheckedChange={(checked) => handleAccessibilityChange('voice_navigation', checked)}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Captions & Subtitles</Label>
                  <p className="text-sm text-muted-foreground">Enable captions for audio content</p>
                </div>
                <Switch
                  checked={preferences.accessibility_settings?.captions_enabled || false}
                  onCheckedChange={(checked) => handleAccessibilityChange('captions_enabled', checked)}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <Label className="flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Sound Feedback
                  </Label>
                  <p className="text-sm text-muted-foreground">Audio feedback for interactions</p>
                </div>
                <Switch
                  checked={preferences.accessibility_settings?.sound_feedback || false}
                  onCheckedChange={(checked) => handleAccessibilityChange('sound_feedback', checked)}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <Label className="flex items-center gap-2">
                    <Vibrate className="w-4 h-4" />
                    Haptic Feedback
                  </Label>
                  <p className="text-sm text-muted-foreground">Tactile feedback for supported devices</p>
                </div>
                <Switch
                  checked={preferences.accessibility_settings?.haptic_feedback || false}
                  onCheckedChange={(checked) => handleAccessibilityChange('haptic_feedback', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6 mt-6">
          {/* Advanced Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gauge className="w-4 h-4" />
                Advanced Accessibility
              </CardTitle>
              <CardDescription>Advanced settings and compliance options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold">Compliance Standards</h4>
                  <div className="space-y-2">
                    <Badge variant="outline" className="w-full justify-start">WCAG 2.1 AA Compatible</Badge>
                    <Badge variant="outline" className="w-full justify-start">Section 508 Compliant</Badge>
                    <Badge variant="outline" className="w-full justify-start">ADA Guidelines</Badge>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-semibold">Quick Actions</h4>
                  <div className="space-y-2">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => {
                        // Apply high contrast + large text + reduce motion
                        const updates = {
                          high_contrast: true,
                          large_text: true,
                          reduce_motion: true,
                          font_size_multiplier: 1.5
                        };
                        Object.entries(updates).forEach(([key, value]) => {
                          handleAccessibilityChange(key as any, value);
                        });
                      }}
                    >
                      Apply Vision Assistance Profile
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => {
                        // Apply motor assistance settings
                        const updates = {
                          keyboard_navigation: true,
                          focus_indicators: true,
                          click_assistance: true,
                          cursor_enhancement: true
                        };
                        Object.entries(updates).forEach(([key, value]) => {
                          handleAccessibilityChange(key as any, value);
                        });
                      }}
                    >
                      Apply Motor Assistance Profile
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => {
                        // Apply cognitive assistance settings
                        const updates = {
                          reading_mode: true,
                          content_spacing: 1.5,
                          alternative_text: true,
                          dyslexia_friendly: true
                        };
                        Object.entries(updates).forEach(([key, value]) => {
                          handleAccessibilityChange(key as any, value);
                        });
                      }}
                    >
                      Apply Cognitive Assistance Profile
                    </Button>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Accessibility Preview
                </h4>
                <p className="text-sm text-muted-foreground mb-4">
                  This shows how your current accessibility settings affect the interface:
                </p>
                <div className="space-y-3 p-4 bg-background rounded border">
                  <h5 className="font-medium" style={{ 
                    fontSize: `${preferences.accessibility_settings?.font_size_multiplier || 1}rem`,
                    letterSpacing: (preferences.accessibility_settings?.content_spacing || 1) > 1 ? '0.05em' : 'normal'
                  }}>
                    Sample Heading
                  </h5>
                  <p style={{ 
                    fontSize: `${(preferences.accessibility_settings?.font_size_multiplier || 1) * 0.875}rem`,
                    lineHeight: preferences.accessibility_settings?.content_spacing || 1
                  }}>
                    This is how text will appear with your current accessibility settings. 
                    The font size and spacing adjust based on your preferences.
                  </p>
                  <div className="flex gap-2">
                    <Button 
                      size="sm"
                      className={preferences.accessibility_settings?.focus_indicators ? 'ring-2 ring-primary ring-offset-2' : ''}
                    >
                      Sample Button
                    </Button>
                    <Badge>Status</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AccessibilitySettings;