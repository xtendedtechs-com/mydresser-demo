import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Eye, TrendingUp, TrendingDown, RefreshCw, CheckCircle,
  AlertCircle, Settings, BarChart3, Package
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function MerchantVTODashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [roiMetrics, setRoiMetrics] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    loadVTOData();
  }, []);

  const loadVTOData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load VTO settings
      const { data: settingsData } = await supabase
        .from('vto_merchant_settings')
        .select('*')
        .eq('merchant_id', user.id)
        .single();

      setSettings(settingsData || {
        vto_enabled: true,
        auto_generate_vto: true,
        size_recommendation_enabled: true,
        conversion_tracking_enabled: true,
      });

      // Load ROI metrics
      const { data: roiData, error } = await supabase
        .rpc('calculate_vto_roi', { merchant_id_param: user.id });

      if (!error && roiData) {
        setRoiMetrics(roiData);
      }
    } catch (error) {
      console.error('Error loading VTO data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (updates: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('vto_merchant_settings')
        .upsert({
          merchant_id: user.id,
          ...settings,
          ...updates,
        }, {
          onConflict: 'merchant_id'
        });

      if (error) throw error;

      setSettings({ ...settings, ...updates });
      toast({
        title: 'Settings updated',
        description: 'Your VTO settings have been saved.',
      });
    } catch (error) {
      console.error('Error updating settings:', error);
      toast({
        title: 'Update failed',
        description: 'Could not save settings. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="container max-w-7xl py-8">
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">Loading VTO dashboard...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Virtual Try-On Dashboard</h1>
          <p className="text-muted-foreground">Track VTO performance and ROI metrics</p>
        </div>
        <Button variant="outline" onClick={() => navigate('/merchant/terminal')}>
          Back to Terminal
        </Button>
      </div>

      {/* Strategic Impact Banner */}
      <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold mb-2">VTO Strategic Impact</h2>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>✓ 30-40% reduction in returns</li>
              <li>✓ 30% increase in conversion rates</li>
              <li>✓ Up to 8.3% profit increase</li>
            </ul>
          </div>
          <div className="text-right">
            <p className="text-4xl font-bold text-primary">
              ${roiMetrics?.estimated_savings?.toFixed(0) || '0'}
            </p>
            <p className="text-sm text-muted-foreground">Estimated Savings (30 days)</p>
          </div>
        </div>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-muted-foreground">Total VTO Sessions</p>
              <p className="text-3xl font-bold">
                {roiMetrics?.total_sessions || 0}
              </p>
            </div>
            <Eye className="h-8 w-8 text-blue-500" />
          </div>
          <p className="text-xs text-muted-foreground">Last 30 days</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-muted-foreground">VTO Conversions</p>
              <p className="text-3xl font-bold text-green-600">
                {roiMetrics?.total_conversions || 0}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-500" />
          </div>
          <div className="flex items-center gap-1">
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              {roiMetrics?.conversion_rate?.toFixed(1) || 0}% rate
            </Badge>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-muted-foreground">Returns Avoided</p>
              <p className="text-3xl font-bold text-orange-600">
                {roiMetrics?.returns_avoided || 0}
              </p>
            </div>
            <RefreshCw className="h-8 w-8 text-orange-500" />
          </div>
          <p className="text-xs text-muted-foreground">Via accurate sizing</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-muted-foreground">VTO-Ready Items</p>
              <p className="text-3xl font-bold">892</p>
            </div>
            <CheckCircle className="h-8 w-8 text-purple-500" />
          </div>
          <p className="text-xs text-muted-foreground">71% of inventory</p>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="items">Item Status</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Conversion Performance
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium">Industry Baseline</p>
                    <p className="text-sm text-muted-foreground">Without VTO</p>
                  </div>
                  <p className="text-2xl font-bold text-muted-foreground">2.5%</p>
                </div>

                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                  <div>
                    <p className="font-medium">Your Conversion Rate</p>
                    <p className="text-sm text-muted-foreground">With VTO enabled</p>
                  </div>
                  <p className="text-2xl font-bold text-green-600">
                    {roiMetrics?.conversion_rate?.toFixed(1) || 0}%
                  </p>
                </div>

                <div className="border-t pt-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Improvement</p>
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      +{((roiMetrics?.conversion_rate || 0) - 2.5).toFixed(1)}%
                    </Badge>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <RefreshCw className="h-5 w-5" />
                Returns Reduction
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium">Industry Average</p>
                    <p className="text-sm text-muted-foreground">Fashion e-commerce</p>
                  </div>
                  <p className="text-2xl font-bold text-red-500">30.3%</p>
                </div>

                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div>
                    <p className="font-medium">Your Return Rate</p>
                    <p className="text-sm text-muted-foreground">VTO-assisted purchases</p>
                  </div>
                  <p className="text-2xl font-bold text-blue-600">18.2%</p>
                </div>

                <div className="border-t pt-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Reduction</p>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                      -40% vs. baseline
                    </Badge>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="items" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">VTO Item Readiness</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4 bg-green-50 border-green-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">VTO Ready</span>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                  <p className="text-2xl font-bold">892</p>
                  <p className="text-xs text-muted-foreground">All requirements met</p>
                </Card>

                <Card className="p-4 bg-yellow-50 border-yellow-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Needs Review</span>
                    <AlertCircle className="h-5 w-5 text-yellow-500" />
                  </div>
                  <p className="text-2xl font-bold">234</p>
                  <p className="text-xs text-muted-foreground">Missing some data</p>
                </Card>

                <Card className="p-4 bg-red-50 border-red-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Not Ready</span>
                    <Package className="h-5 w-5 text-red-500" />
                  </div>
                  <p className="text-2xl font-bold">121</p>
                  <p className="text-xs text-muted-foreground">Requires attention</p>
                </Card>
              </div>

              <div className="border-t pt-6">
                <h4 className="font-medium mb-4">Required for VTO</h4>
                <ul className="text-sm space-y-2 text-muted-foreground">
                  <li>✓ High-resolution product images (min 1500x1500px)</li>
                  <li>✓ Accurate size measurements (chest, waist, length, etc.)</li>
                  <li>✓ Material composition and stretch information</li>
                  <li>✓ Color variants with accurate names</li>
                  <li>✓ Proper category classification</li>
                </ul>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-6">VTO Configuration</h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="vto-enabled">Enable Virtual Try-On</Label>
                  <p className="text-sm text-muted-foreground">Allow customers to try items virtually</p>
                </div>
                <Switch
                  id="vto-enabled"
                  checked={settings?.vto_enabled}
                  onCheckedChange={(checked) => updateSettings({ vto_enabled: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="auto-generate">Auto-Generate VTO</Label>
                  <p className="text-sm text-muted-foreground">Automatically create VTO for new items</p>
                </div>
                <Switch
                  id="auto-generate"
                  checked={settings?.auto_generate_vto}
                  onCheckedChange={(checked) => updateSettings({ auto_generate_vto: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="size-rec">Size Recommendations</Label>
                  <p className="text-sm text-muted-foreground">Provide AI-powered size suggestions</p>
                </div>
                <Switch
                  id="size-rec"
                  checked={settings?.size_recommendation_enabled}
                  onCheckedChange={(checked) => updateSettings({ size_recommendation_enabled: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="conversion-tracking">Conversion Tracking</Label>
                  <p className="text-sm text-muted-foreground">Track VTO impact on sales</p>
                </div>
                <Switch
                  id="conversion-tracking"
                  checked={settings?.conversion_tracking_enabled}
                  onCheckedChange={(checked) => updateSettings({ conversion_tracking_enabled: checked })}
                />
              </div>

              <div>
                <Label htmlFor="fit-threshold">Fit Confidence Threshold</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Minimum confidence score to show VTO results
                </p>
                <Input
                  id="fit-threshold"
                  type="number"
                  min="0"
                  max="100"
                  value={settings?.fit_confidence_threshold || 70}
                  onChange={(e) => updateSettings({ fit_confidence_threshold: parseInt(e.target.value) })}
                />
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Detailed Analytics</h3>
            <div className="text-center py-12 text-muted-foreground">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Advanced analytics coming soon</p>
              <p className="text-sm">Track VTO impact over time with detailed charts and insights</p>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
