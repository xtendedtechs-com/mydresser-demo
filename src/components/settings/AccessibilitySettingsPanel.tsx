import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Eye, Type, Mouse, Volume2 } from "lucide-react";
import { useState } from "react";
import { Slider } from "@/components/ui/slider";

const AccessibilitySettingsPanel = () => {
  const [highContrast, setHighContrast] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [screenReader, setScreenReader] = useState(false);
  const [keyboardNav, setKeyboardNav] = useState(true);
  const [fontSize, setFontSize] = useState([100]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Visual Accessibility
          </CardTitle>
          <CardDescription>
            Adjust visual settings for better readability
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="high-contrast">High Contrast Mode</Label>
              <p className="text-sm text-muted-foreground">
                Increase contrast for better visibility
              </p>
            </div>
            <Switch
              id="high-contrast"
              checked={highContrast}
              onCheckedChange={setHighContrast}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="reduced-motion">Reduce Motion</Label>
              <p className="text-sm text-muted-foreground">
                Minimize animations and transitions
              </p>
            </div>
            <Switch
              id="reduced-motion"
              checked={reducedMotion}
              onCheckedChange={setReducedMotion}
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="font-size" className="flex items-center gap-2">
              <Type className="w-4 h-4" />
              Font Size: {fontSize[0]}%
            </Label>
            <Slider
              id="font-size"
              min={80}
              max={150}
              step={10}
              value={fontSize}
              onValueChange={setFontSize}
            />
            <p className="text-sm text-muted-foreground">
              Adjust text size for better readability
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mouse className="w-5 h-5" />
            Navigation & Input
          </CardTitle>
          <CardDescription>
            Control how you interact with the app
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="keyboard-nav">Keyboard Navigation</Label>
              <p className="text-sm text-muted-foreground">
                Enable keyboard shortcuts and navigation
              </p>
            </div>
            <Switch
              id="keyboard-nav"
              checked={keyboardNav}
              onCheckedChange={setKeyboardNav}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="screen-reader" className="flex items-center gap-2">
                <Volume2 className="w-4 h-4" />
                Screen Reader Support
              </Label>
              <p className="text-sm text-muted-foreground">
                Optimize for screen reader use
              </p>
            </div>
            <Switch
              id="screen-reader"
              checked={screenReader}
              onCheckedChange={setScreenReader}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccessibilitySettingsPanel;
