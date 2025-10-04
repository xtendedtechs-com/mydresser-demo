import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, Trash2, Edit3, MapPin, Package, DollarSign } from "lucide-react";
import { useShippingZones, ShippingZone } from "@/hooks/useShippingZones";
import { useCurrencySettings } from "@/hooks/useCurrencySettings";

const COUNTRIES = [
  'United States', 'Canada', 'United Kingdom', 'Germany', 'France', 
  'Italy', 'Spain', 'Australia', 'Japan', 'China', 'India', 'Brazil'
];

const ShippingZonesManager = () => {
  const { zones, isLoading, createZone, updateZone, deleteZone, isCreating, isUpdating } = useShippingZones();
  const { settings: currencySettings, supportedCurrencies } = useCurrencySettings();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<ShippingZone | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    countries: [] as string[],
    base_rate: 0,
    per_item_rate: 0,
    currency: currencySettings?.base_currency || 'USD',
    estimated_days_min: 3,
    estimated_days_max: 7,
    free_shipping_threshold: null as number | null,
    is_active: true,
  });

  const handleSubmit = () => {
    if (editingZone) {
      updateZone({
        id: editingZone.id,
        updates: formData,
      });
    } else {
      createZone(formData as any);
    }
    setIsDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      countries: [],
      base_rate: 0,
      per_item_rate: 0,
      currency: currencySettings?.base_currency || 'USD',
      estimated_days_min: 3,
      estimated_days_max: 7,
      free_shipping_threshold: null,
      is_active: true,
    });
    setEditingZone(null);
  };

  const handleEdit = (zone: ShippingZone) => {
    setEditingZone(zone);
    setFormData({
      name: zone.name,
      countries: zone.countries,
      base_rate: zone.base_rate,
      per_item_rate: zone.per_item_rate,
      currency: zone.currency,
      estimated_days_min: zone.estimated_days_min,
      estimated_days_max: zone.estimated_days_max,
      free_shipping_threshold: zone.free_shipping_threshold,
      is_active: zone.is_active,
    });
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin" />
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
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                <CardTitle>Shipping Zones</CardTitle>
              </div>
              <CardDescription className="mt-2">
                Configure shipping rates and delivery times for different regions
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Zone
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingZone ? 'Edit Shipping Zone' : 'Create Shipping Zone'}
                  </DialogTitle>
                  <DialogDescription>
                    Configure shipping rates and delivery times for a region
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Zone Name</Label>
                    <Input
                      placeholder="e.g., North America"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Countries (comma-separated)</Label>
                    <Input
                      placeholder="e.g., United States, Canada, Mexico"
                      value={formData.countries.join(', ')}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        countries: e.target.value.split(',').map(c => c.trim()) 
                      })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Base Rate</Label>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={formData.base_rate}
                        onChange={(e) => setFormData({ ...formData, base_rate: parseFloat(e.target.value) || 0 })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Per Item Rate</Label>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={formData.per_item_rate}
                        onChange={(e) => setFormData({ ...formData, per_item_rate: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Currency</Label>
                    <Select 
                      value={formData.currency} 
                      onValueChange={(value) => setFormData({ ...formData, currency: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {supportedCurrencies.map((curr) => (
                          <SelectItem key={curr.code} value={curr.code}>
                            {curr.symbol} {curr.code}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Min Delivery Days</Label>
                      <Input
                        type="number"
                        min="1"
                        value={formData.estimated_days_min}
                        onChange={(e) => setFormData({ ...formData, estimated_days_min: parseInt(e.target.value) || 1 })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Max Delivery Days</Label>
                      <Input
                        type="number"
                        min="1"
                        value={formData.estimated_days_max}
                        onChange={(e) => setFormData({ ...formData, estimated_days_max: parseInt(e.target.value) || 1 })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Free Shipping Threshold (optional)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Leave empty for no free shipping"
                      value={formData.free_shipping_threshold || ''}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        free_shipping_threshold: e.target.value ? parseFloat(e.target.value) : null 
                      })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Active</Label>
                      <p className="text-xs text-muted-foreground">
                        Enable this shipping zone
                      </p>
                    </div>
                    <Switch
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSubmit} disabled={isCreating || isUpdating}>
                    {(isCreating || isUpdating) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {editingZone ? 'Update' : 'Create'} Zone
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {!zones || zones.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No shipping zones configured yet</p>
              <p className="text-sm">Add your first zone to start shipping internationally</p>
            </div>
          ) : (
            <div className="space-y-3">
              {zones.map((zone) => (
                <Card key={zone.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{zone.name}</h4>
                        {zone.is_active ? (
                          <Badge variant="default" className="text-xs">Active</Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">Inactive</Badge>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap gap-1">
                        {zone.countries.map((country, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {country}
                          </Badge>
                        ))}
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Base Rate:</span>
                          <span className="ml-2 font-medium">
                            {supportedCurrencies.find(c => c.code === zone.currency)?.symbol}
                            {zone.base_rate.toFixed(2)}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Per Item:</span>
                          <span className="ml-2 font-medium">
                            {supportedCurrencies.find(c => c.code === zone.currency)?.symbol}
                            {zone.per_item_rate.toFixed(2)}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Delivery:</span>
                          <span className="ml-2 font-medium">
                            {zone.estimated_days_min}-{zone.estimated_days_max} days
                          </span>
                        </div>
                        {zone.free_shipping_threshold && (
                          <div>
                            <span className="text-muted-foreground">Free Shipping:</span>
                            <span className="ml-2 font-medium">
                              {supportedCurrencies.find(c => c.code === zone.currency)?.symbol}
                              {zone.free_shipping_threshold.toFixed(2)}+
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(zone)}
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteZone(zone.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ShippingZonesManager;
