import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useSettings } from '@/hooks/useSettings';
import type { AccessibilitySettings } from '@/types/settings';

export const AccessibilitySettingsPanel = () => {
  const { accessibility, updateFeatureSettings, saving } = useSettings();

  const handleUpdate = (updates: Partial<AccessibilitySettings>) => {
    updateFeatureSettings('accessibility', updates);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Label htmlFor="screen-reader">Screen Reader Support</Label>
          <p className="text-sm text-muted-foreground">Enhanced ARIA labels</p>
        </div>
        <Switch
          id="screen-reader"
          checked={accessibility?.screenReader || false}
          onCheckedChange={(checked) => handleUpdate({ screenReader: checked })}
          disabled={saving}
        />
      </div>

      <div className="flex items-center justify-between">
        <div>
          <Label htmlFor="keyboard-nav">Keyboard Navigation</Label>
          <p className="text-sm text-muted-foreground">Enhanced keyboard shortcuts</p>
        </div>
        <Switch
          id="keyboard-nav"
          checked={accessibility?.keyboardNavigation || false}
          onCheckedChange={(checked) => handleUpdate({ keyboardNavigation: checked })}
          disabled={saving}
        />
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="high-contrast">High Contrast</Label>
        <Switch
          id="high-contrast"
          checked={accessibility?.highContrast || false}
          onCheckedChange={(checked) => handleUpdate({ highContrast: checked })}
          disabled={saving}
        />
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="reduced-motion">Reduced Motion</Label>
        <Switch
          id="reduced-motion"
          checked={accessibility?.reducedMotion || false}
          onCheckedChange={(checked) => handleUpdate({ reducedMotion: checked })}
          disabled={saving}
        />
      </div>

      <div>
        <Label>Font Size</Label>
        <Select
          value={accessibility?.fontSize || 'medium'}
          onValueChange={(value) => handleUpdate({ fontSize: value as any })}
          disabled={saving}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="small">Small</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="large">Large</SelectItem>
            <SelectItem value="extra-large">Extra Large</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Color Blind Mode</Label>
        <Select
          value={accessibility?.colorBlindMode || 'none'}
          onValueChange={(value) => handleUpdate({ colorBlindMode: value as any })}
          disabled={saving}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            <SelectItem value="deuteranopia">Deuteranopia (Red-Green)</SelectItem>
            <SelectItem value="protanopia">Protanopia (Red-Green)</SelectItem>
            <SelectItem value="tritanopia">Tritanopia (Blue-Yellow)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
