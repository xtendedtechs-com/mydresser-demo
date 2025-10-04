import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, DollarSign, Globe, TrendingUp } from "lucide-react";
import { useCurrencySettings } from "@/hooks/useCurrencySettings";

const TAX_REGIONS = [
  { code: 'US', name: 'United States', rate: 7.0 },
  { code: 'EU', name: 'European Union', rate: 20.0 },
  { code: 'UK', name: 'United Kingdom', rate: 20.0 },
  { code: 'CA', name: 'Canada', rate: 13.0 },
  { code: 'AU', name: 'Australia', rate: 10.0 },
  { code: 'JP', name: 'Japan', rate: 10.0 },
  { code: 'CN', name: 'China', rate: 13.0 },
  { code: 'IN', name: 'India', rate: 18.0 },
];

const MultiCurrencySettings = () => {
  const {
    settings,
    isLoading,
    updateSettings,
    isUpdating,
    supportedCurrencies,
  } = useCurrencySettings();

  const [baseCurrency, setBaseCurrency] = useState(settings?.base_currency || 'USD');
  const [displayCurrency, setDisplayCurrency] = useState(settings?.display_currency || 'USD');
  const [autoConvert, setAutoConvert] = useState(settings?.auto_convert ?? true);
  const [taxRegion, setTaxRegion] = useState(settings?.tax_region || 'US');
  const [customTaxRate, setCustomTaxRate] = useState<string>(
    settings?.tax_rate?.toString() || '0'
  );

  const handleSave = () => {
    const taxRegionData = TAX_REGIONS.find(r => r.code === taxRegion);
    
    updateSettings({
      base_currency: baseCurrency,
      display_currency: displayCurrency,
      auto_convert: autoConvert,
      tax_region: taxRegion,
      tax_rate: parseFloat(customTaxRate) || taxRegionData?.rate || 0,
    });
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
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-primary" />
            <CardTitle>Currency Settings</CardTitle>
          </div>
          <CardDescription>
            Configure your preferred currencies and automatic conversion
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Base Currency */}
          <div className="space-y-2">
            <Label>Base Currency</Label>
            <Select value={baseCurrency} onValueChange={setBaseCurrency}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {supportedCurrencies.map((currency) => (
                  <SelectItem key={currency.code} value={currency.code}>
                    {currency.symbol} {currency.code} - {currency.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              The currency you use for pricing your items
            </p>
          </div>

          {/* Display Currency */}
          <div className="space-y-2">
            <Label>Display Currency</Label>
            <Select value={displayCurrency} onValueChange={setDisplayCurrency}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {supportedCurrencies.map((currency) => (
                  <SelectItem key={currency.code} value={currency.code}>
                    {currency.symbol} {currency.code} - {currency.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              How prices are shown to you in the app
            </p>
          </div>

          {/* Auto Convert */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Automatic Conversion</Label>
              <p className="text-xs text-muted-foreground">
                Automatically convert prices to your display currency
              </p>
            </div>
            <Switch
              checked={autoConvert}
              onCheckedChange={setAutoConvert}
            />
          </div>

          {baseCurrency !== displayCurrency && (
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
              <div className="flex items-center gap-2 text-sm">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span className="font-medium">Currency Conversion Active</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Prices will be converted from {baseCurrency} to {displayCurrency}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            <CardTitle>Regional Settings</CardTitle>
          </div>
          <CardDescription>
            Configure tax rates and regional preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Tax Region */}
          <div className="space-y-2">
            <Label>Tax Region</Label>
            <Select value={taxRegion} onValueChange={setTaxRegion}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TAX_REGIONS.map((region) => (
                  <SelectItem key={region.code} value={region.code}>
                    {region.name} ({region.rate}%)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Select your region for accurate tax calculations
            </p>
          </div>

          {/* Custom Tax Rate */}
          <div className="space-y-2">
            <Label>Custom Tax Rate (%)</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              max="100"
              value={customTaxRate}
              onChange={(e) => setCustomTaxRate(e.target.value)}
              placeholder="Enter custom tax rate"
            />
            <p className="text-xs text-muted-foreground">
              Override the default rate for your region (optional)
            </p>
          </div>

          {/* Tax Info */}
          <div className="bg-muted/50 rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Current Tax Rate:</span>
              <Badge variant="secondary">
                {customTaxRate || TAX_REGIONS.find(r => r.code === taxRegion)?.rate || 0}%
              </Badge>
            </div>
            <div className="text-xs text-muted-foreground">
              This rate will be applied to all taxable transactions
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={isUpdating}
          size="lg"
        >
          {isUpdating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Save Currency Settings
        </Button>
      </div>
    </div>
  );
};

export default MultiCurrencySettings;
