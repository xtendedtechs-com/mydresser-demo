import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { useSettings } from "@/hooks/useSettings";

const MyMirrorSettingsPanel = () => {
  const { settings, updateSettings, isLoading } = useSettings();

  const mirrorSettings = settings?.mymirror || {};

  const handleToggle = (key: string, value: boolean) => {
    updateSettings({
      mymirror: { ...mirrorSettings, [key]: value }
    });
  };

  const handleSelectChange = (key: string, value: string) => {
    updateSettings({
      mymirror: { ...mirrorSettings, [key]: value }
    });
  };

  const handleSliderChange = (key: string, value: number[]) => {
    updateSettings({
      mymirror: { ...mirrorSettings, [key]: value[0] }
    });
  };

  if (isLoading) {
    return <div className="text-muted-foreground">Loading settings...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Virtual Try-On Preferences</h3>
        <Card className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Virtual Try-On</Label>
              <p className="text-sm text-muted-foreground">
                Use VTO for wardrobe and marketplace items
              </p>
            </div>
            <Switch
              checked={mirrorSettings.enable_vto !== false}
              onCheckedChange={(checked) => handleToggle('enable_vto', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Show Fit Score</Label>
              <p className="text-sm text-muted-foreground">
                Display AI-calculated fit scores
              </p>
            </div>
            <Switch
              checked={mirrorSettings.show_fit_score !== false}
              onCheckedChange={(checked) => handleToggle('show_fit_score', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto-Save Results</Label>
              <p className="text-sm text-muted-foreground">
                Automatically save try-on sessions
              </p>
            </div>
            <Switch
              checked={mirrorSettings.auto_save_sessions === true}
              onCheckedChange={(checked) => handleToggle('auto_save_sessions', checked)}
            />
          </div>

          <div className="space-y-2">
            <Label>VTO Quality</Label>
            <Select
              value={mirrorSettings.vto_quality || 'high'}
              onValueChange={(value) => handleSelectChange('vto_quality', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">Standard (Faster)</SelectItem>
                <SelectItem value="high">High Quality</SelectItem>
                <SelectItem value="ultra">Ultra (Slower)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Size & Fit</h3>
        <Card className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Size Recommendations</Label>
              <p className="text-sm text-muted-foreground">
                Get AI-powered size suggestions
              </p>
            </div>
            <Switch
              checked={mirrorSettings.enable_size_recommendations !== false}
              onCheckedChange={(checked) => handleToggle('enable_size_recommendations', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Show Alternative Sizes</Label>
              <p className="text-sm text-muted-foreground">
                Display nearby size recommendations
              </p>
            </div>
            <Switch
              checked={mirrorSettings.show_alternative_sizes === true}
              onCheckedChange={(checked) => handleToggle('show_alternative_sizes', checked)}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Fit Preference</Label>
              <span className="text-sm text-muted-foreground">
                {mirrorSettings.fit_preference === 0 ? 'Fitted' : 
                 mirrorSettings.fit_preference === 50 ? 'Regular' : 
                 mirrorSettings.fit_preference === 100 ? 'Loose' : 'Regular'}
              </span>
            </div>
            <Slider
              value={[mirrorSettings.fit_preference || 50]}
              onValueChange={(value) => handleSliderChange('fit_preference', value)}
              min={0}
              max={100}
              step={25}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Fitted</span>
              <span>Regular</span>
              <span>Loose</span>
            </div>
          </div>
        </Card>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Privacy & Data</h3>
        <Card className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Save Body Measurements</Label>
              <p className="text-sm text-muted-foreground">
                Store measurements for better recommendations
              </p>
            </div>
            <Switch
              checked={mirrorSettings.save_measurements !== false}
              onCheckedChange={(checked) => handleToggle('save_measurements', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Share VTO Analytics</Label>
              <p className="text-sm text-muted-foreground">
                Help improve VTO accuracy with anonymous data
              </p>
            </div>
            <Switch
              checked={mirrorSettings.share_vto_analytics === true}
              onCheckedChange={(checked) => handleToggle('share_vto_analytics', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Delete Photos After Session</Label>
              <p className="text-sm text-muted-foreground">
                Automatically delete uploaded photos
              </p>
            </div>
            <Switch
              checked={mirrorSettings.auto_delete_photos === true}
              onCheckedChange={(checked) => handleToggle('auto_delete_photos', checked)}
            />
          </div>
        </Card>
      </div>
    </div>
  );
};

export default MyMirrorSettingsPanel;
