import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { useSettings } from "@/hooks/useSettings";

const MyMirrorSettingsPanel = () => {
  const { settings, updateSettings, loading } = useSettings();

  const mirrorSettings = settings?.myMirror;

  const handleToggle = (key: string, value: boolean) => {
    updateSettings({
      myMirror: { ...mirrorSettings, [key]: value }
    });
  };

  const handleSelectChange = (key: string, value: string) => {
    updateSettings({
      myMirror: { ...mirrorSettings, [key]: value }
    });
  };

  const handleSliderChange = (key: string, value: number[]) => {
    updateSettings({
      myMirror: { ...mirrorSettings, [key]: value[0] }
    });
  };

  if (loading) {
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
              checked={mirrorSettings?.enableARTryOn !== false}
              onCheckedChange={(checked) => handleToggle('enableARTryOn', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Show Size Recommendations</Label>
              <p className="text-sm text-muted-foreground">
                Display AI-powered size suggestions
              </p>
            </div>
            <Switch
              checked={mirrorSettings?.showSizeRecommendations !== false}
              onCheckedChange={(checked) => handleToggle('showSizeRecommendations', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Save Try-On History</Label>
              <p className="text-sm text-muted-foreground">
                Keep a record of virtual try-ons
              </p>
            </div>
            <Switch
              checked={mirrorSettings?.saveTryOnHistory !== false}
              onCheckedChange={(checked) => handleToggle('saveTryOnHistory', checked)}
            />
          </div>

          <div className="space-y-2">
            <Label>Photo Quality</Label>
            <Select
              value={mirrorSettings?.photoQuality || 'medium'}
              onValueChange={(value) => handleSelectChange('photoQuality', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low (Faster)</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High Quality</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Size & Fit</h3>
        <Card className="p-4 space-y-4">
          <div className="space-y-2">
            <Label>Preferred Camera</Label>
            <Select
              value={mirrorSettings?.preferredCamera || 'front'}
              onValueChange={(value) => handleSelectChange('preferredCamera', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="front">Front Camera</SelectItem>
                <SelectItem value="back">Back Camera</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Privacy & Data</h3>
        <Card className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto-Delete Photos</Label>
              <p className="text-sm text-muted-foreground">
                Automatically delete photos after try-on
              </p>
            </div>
            <Switch
              checked={mirrorSettings?.autoDeletePhotos === true}
              onCheckedChange={(checked) => handleToggle('autoDeletePhotos', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto-Capture</Label>
              <p className="text-sm text-muted-foreground">
                Automatically take photo when ready
              </p>
            </div>
            <Switch
              checked={mirrorSettings?.autoCapture === true}
              onCheckedChange={(checked) => handleToggle('autoCapture', checked)}
            />
          </div>
        </Card>
      </div>
    </div>
  );
};

export default MyMirrorSettingsPanel;
