import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSettings } from '@/hooks/useSettings';
import { BarChart3, Eye, Users, TrendingUp, Activity } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { useState } from 'react';

export const AnalyticsSettingsPanel = () => {
  const { settings, updateFeatureSettings, saving } = useSettings();
  const [dataRetention, setDataRetention] = useState(365);

  const analyticsSettings = {
    enableTracking: true,
    trackPageViews: true,
    trackUserBehavior: true,
    trackSales: true,
    enableHeatmaps: false,
    dataRetentionDays: 365,
    anonymizeData: false
  };

  const handleToggle = (key: string, value: boolean) => {
    // Settings will be stored in app_settings when table structure is updated
  };

  const handleRetentionChange = (value: number[]) => {
    setDataRetention(value[0]);
  };

  const handleRetentionComplete = () => {
    // Update when structure is ready
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Analytics Tracking
          </CardTitle>
          <CardDescription>Configure what data to track and analyze</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Analytics</Label>
              <p className="text-sm text-muted-foreground">
                Track usage and generate insights
              </p>
            </div>
            <Switch
              checked={analyticsSettings.enableTracking}
              onCheckedChange={(checked) => handleToggle('enableTracking', checked)}
              disabled={saving}
            />
          </div>

          {analyticsSettings.enableTracking && (
            <>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    Page Views
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Track page visits and navigation
                  </p>
                </div>
                <Switch
                  checked={analyticsSettings.trackPageViews}
                  onCheckedChange={(checked) => handleToggle('trackPageViews', checked)}
                  disabled={saving}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    User Behavior
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Track clicks, interactions, and engagement
                  </p>
                </div>
                <Switch
                  checked={analyticsSettings.trackUserBehavior}
                  onCheckedChange={(checked) => handleToggle('trackUserBehavior', checked)}
                  disabled={saving}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Sales & Revenue
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Track purchases and revenue metrics
                  </p>
                </div>
                <Switch
                  checked={analyticsSettings.trackSales}
                  onCheckedChange={(checked) => handleToggle('trackSales', checked)}
                  disabled={saving}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    Heatmaps
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Visual click and scroll tracking
                  </p>
                </div>
                <Switch
                  checked={analyticsSettings.enableHeatmaps}
                  onCheckedChange={(checked) => handleToggle('enableHeatmaps', checked)}
                  disabled={saving}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
          <CardDescription>Configure data retention and privacy</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Data Retention Period</Label>
              <div className="flex items-center gap-4">
                <Slider
                  value={[dataRetention]}
                  onValueChange={handleRetentionChange}
                  onValueCommit={handleRetentionComplete}
                  min={30}
                  max={730}
                  step={30}
                  className="flex-1"
                  disabled={saving}
                />
                <span className="text-sm font-medium w-20 text-right">
                  {dataRetention} days
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Analytics data older than this will be automatically deleted
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Anonymize User Data</Label>
              <p className="text-sm text-muted-foreground">
                Remove personally identifiable information from analytics
              </p>
            </div>
            <Switch
              checked={analyticsSettings.anonymizeData}
              onCheckedChange={(checked) => handleToggle('anonymizeData', checked)}
              disabled={saving}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
