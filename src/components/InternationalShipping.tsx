import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Plane, Package, Truck, Clock,
  DollarSign, MapPin, Calculator
} from 'lucide-react';

interface ShippingOption {
  id: string;
  name: string;
  icon: any;
  estimatedDays: string;
  price: number;
  tracking: boolean;
  insurance: boolean;
}

const countries = [
  { code: 'US', name: 'United States', region: 'North America' },
  { code: 'CA', name: 'Canada', region: 'North America' },
  { code: 'GB', name: 'United Kingdom', region: 'Europe' },
  { code: 'FR', name: 'France', region: 'Europe' },
  { code: 'DE', name: 'Germany', region: 'Europe' },
  { code: 'IT', name: 'Italy', region: 'Europe' },
  { code: 'ES', name: 'Spain', region: 'Europe' },
  { code: 'JP', name: 'Japan', region: 'Asia' },
  { code: 'CN', name: 'China', region: 'Asia' },
  { code: 'AU', name: 'Australia', region: 'Oceania' },
  { code: 'BR', name: 'Brazil', region: 'South America' },
  { code: 'MX', name: 'Mexico', region: 'North America' },
];

export const InternationalShipping = () => {
  const [fromCountry, setFromCountry] = useState('US');
  const [toCountry, setToCountry] = useState('GB');
  const [weight, setWeight] = useState('1');
  const [showEstimate, setShowEstimate] = useState(false);

  const shippingOptions: ShippingOption[] = [
    {
      id: 'standard',
      name: 'Standard International',
      icon: Package,
      estimatedDays: '10-15',
      price: 15.99,
      tracking: true,
      insurance: false
    },
    {
      id: 'express',
      name: 'Express International',
      icon: Plane,
      estimatedDays: '3-5',
      price: 45.99,
      tracking: true,
      insurance: true
    },
    {
      id: 'economy',
      name: 'Economy Shipping',
      icon: Truck,
      estimatedDays: '15-30',
      price: 9.99,
      tracking: false,
      insurance: false
    }
  ];

  const calculateShipping = () => {
    setShowEstimate(true);
    // In reality, this would call an API to calculate actual shipping costs
  };

  const fromCountryObj = countries.find(c => c.code === fromCountry);
  const toCountryObj = countries.find(c => c.code === toCountry);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plane className="h-5 w-5" />
          International Shipping Calculator
        </CardTitle>
        <CardDescription>
          Estimate shipping costs and delivery times for international orders
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Origin & Destination */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="from-country">Ship From</Label>
            <Select value={fromCountry} onValueChange={setFromCountry}>
              <SelectTrigger id="from-country">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {countries.map((country) => (
                  <SelectItem key={country.code} value={country.code}>
                    {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="to-country">Ship To</Label>
            <Select value={toCountry} onValueChange={setToCountry}>
              <SelectTrigger id="to-country">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {countries.map((country) => (
                  <SelectItem key={country.code} value={country.code}>
                    {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Package Details */}
        <div className="space-y-2">
          <Label htmlFor="weight">Package Weight (kg)</Label>
          <Input
            id="weight"
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="1.0"
            step="0.1"
            min="0.1"
          />
        </div>

        {/* Route Information */}
        <div className="p-4 bg-muted rounded-lg space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Route:</span>
            <div className="flex items-center gap-2">
              <span className="font-medium">{fromCountryObj?.name}</span>
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{toCountryObj?.name}</span>
            </div>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Regions:</span>
            <span className="font-medium">
              {fromCountryObj?.region} → {toCountryObj?.region}
            </span>
          </div>
        </div>

        <Button onClick={calculateShipping} className="w-full">
          <Calculator className="mr-2 h-4 w-4" />
          Calculate Shipping
        </Button>

        {/* Shipping Options */}
        {showEstimate && (
          <div className="space-y-4 animate-fade-in">
            <Separator />
            <h3 className="font-semibold">Available Shipping Options</h3>
            
            {shippingOptions.map((option) => (
              <Card key={option.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-3 flex-1">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <option.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1">{option.name}</h4>
                        <div className="flex flex-wrap gap-2 mb-2">
                          <Badge variant="outline" className="gap-1">
                            <Clock className="h-3 w-3" />
                            {option.estimatedDays} days
                          </Badge>
                          {option.tracking && (
                            <Badge variant="outline">Tracking</Badge>
                          )}
                          {option.insurance && (
                            <Badge variant="outline">Insurance</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Estimated delivery: {option.estimatedDays} business days
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">${option.price}</p>
                      <Button size="sm" className="mt-2">
                        Select
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Additional Information */}
            <div className="p-4 bg-muted rounded-lg space-y-2 text-sm">
              <p className="font-semibold">Important Information:</p>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Customs fees and import duties may apply</li>
                <li>• Delivery times are estimates and not guaranteed</li>
                <li>• Items must clear customs in destination country</li>
                <li>• Prohibited items cannot be shipped internationally</li>
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
