import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { useStylePreferences } from '@/hooks/useStylePreferences';
import { X } from 'lucide-react';

const commonStyles = ['casual', 'formal', 'streetwear', 'minimalist', 'bohemian', 'vintage', 'athletic', 'elegant'];
const commonColors = ['black', 'white', 'navy', 'gray', 'beige', 'brown', 'red', 'blue', 'green'];
const commonBrands = ['Nike', 'Adidas', 'Zara', 'H&M', 'Uniqlo', 'Gap', 'Levi\'s', 'Calvin Klein'];

export const MyStyleSettingsPanel = () => {
  const { toast } = useToast();
  const { preferences, updatePreferences, loading } = useStylePreferences();
  
  const [stylePreferences, setStylePreferences] = useState<string[]>(preferences?.style_keywords || []);
  const [colorPreferences, setColorPreferences] = useState<string[]>(preferences?.favorite_colors || []);
  const [brandPreferences, setBrandPreferences] = useState<string[]>(preferences?.favorite_brands || []);
  const [budgetRange, setBudgetRange] = useState<[number, number]>([
    preferences?.budget_range?.min || 0,
    preferences?.budget_range?.max || 1000
  ]);
  const [sustainabilityScore, setSustainabilityScore] = useState(preferences?.sustainability_priority || 5);

  const toggleItem = (item: string, list: string[], setList: (items: string[]) => void) => {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  const handleSave = async () => {
    try {
      await updatePreferences({
        style_keywords: stylePreferences,
        favorite_colors: colorPreferences,
        favorite_brands: brandPreferences,
        budget_range: {
          min: budgetRange[0],
          max: budgetRange[1],
        },
        sustainability_priority: sustainabilityScore,
      });

      toast({
        title: 'Style Preferences Saved',
        description: 'Your style preferences have been updated successfully.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Style Preferences</CardTitle>
          <CardDescription>
            Select your preferred fashion styles to get personalized recommendations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {commonStyles.map((style) => (
              <Badge
                key={style}
                variant={stylePreferences.includes(style) ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => toggleItem(style, stylePreferences, setStylePreferences)}
              >
                {style}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Color Preferences</CardTitle>
          <CardDescription>
            Choose your favorite colors for outfit suggestions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {commonColors.map((color) => (
              <Badge
                key={color}
                variant={colorPreferences.includes(color) ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => toggleItem(color, colorPreferences, setColorPreferences)}
              >
                {color}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Brand Preferences</CardTitle>
          <CardDescription>
            Select your favorite brands to personalize marketplace results
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {brandPreferences.map((brand) => (
              <Badge key={brand} variant="default" className="cursor-pointer">
                {brand}
                <X
                  className="w-3 h-3 ml-2"
                  onClick={() => toggleItem(brand, brandPreferences, setBrandPreferences)}
                />
              </Badge>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {commonBrands
              .filter(brand => !brandPreferences.includes(brand))
              .map((brand) => (
                <Badge
                  key={brand}
                  variant="outline"
                  className="cursor-pointer"
                  onClick={() => toggleItem(brand, brandPreferences, setBrandPreferences)}
                >
                  {brand}
                </Badge>
              ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Budget Range</CardTitle>
          <CardDescription>
            Set your preferred price range for shopping recommendations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>${budgetRange[0]}</span>
              <span>${budgetRange[1]}</span>
            </div>
            <Slider
              value={budgetRange}
              onValueChange={(value) => setBudgetRange(value as [number, number])}
              min={0}
              max={2000}
              step={50}
              className="w-full"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sustainability Priority</CardTitle>
          <CardDescription>
            How important is sustainability in your fashion choices?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Low Priority</span>
              <span>High Priority</span>
            </div>
            <Slider
              value={[sustainabilityScore]}
              onValueChange={(value) => setSustainabilityScore(value[0])}
              min={1}
              max={10}
              step={1}
              className="w-full"
            />
            <p className="text-sm text-muted-foreground text-center">
              Priority Level: {sustainabilityScore}/10
            </p>
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={loading} className="w-full">
        {loading ? 'Saving...' : 'Save Preferences'}
      </Button>
    </div>
  );
};
