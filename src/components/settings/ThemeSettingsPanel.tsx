import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useSettings } from '@/hooks/useSettings';
import type { ThemeSettings } from '@/types/settings';

export const ThemeSettingsPanel = () => {
  const { theme, updateFeatureSettings, saving } = useSettings();

  const handleUpdate = (updates: Partial<ThemeSettings>) => {
    updateFeatureSettings('theme', updates);
  };

  return (
    <div className="space-y-6">
      <div>
        <Label>Theme Mode</Label>
        <Select
          value={theme?.mode || 'system'}
          onValueChange={(value) => handleUpdate({ mode: value as 'light' | 'dark' | 'system' })}
          disabled={saving}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="light">Light</SelectItem>
            <SelectItem value="dark">Dark</SelectItem>
            <SelectItem value="system">System</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Font Size</Label>
        <Select
          value={theme?.fontSize || 'medium'}
          onValueChange={(value) => handleUpdate({ fontSize: value as 'small' | 'medium' | 'large' })}
          disabled={saving}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="small">Small</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="large">Large</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="high-contrast">High Contrast Mode</Label>
        <Switch
          id="high-contrast"
          checked={theme?.highContrast || false}
          onCheckedChange={(checked) => handleUpdate({ highContrast: checked })}
          disabled={saving}
        />
      </div>
    </div>
  );
};
