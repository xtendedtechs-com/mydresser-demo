import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMerchantItems } from '@/hooks/useMerchantItems';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Palette, Wand2, User, BookOpen, TrendingUp, Download, Share2 } from 'lucide-react';

export const MyStylistAI = () => {
  const [selectedItem, setSelectedItem] = useState<string>('');
  const [theme, setTheme] = useState('formal');
  const [persona, setPersona] = useState('minimalist');
  const [generating, setGenerating] = useState(false);
  const [generatedOutfits, setGeneratedOutfits] = useState<any[]>([]);
  const { items } = useMerchantItems();
  const { toast } = useToast();

  const generateOutfit = async (mode: 'item' | 'theme' | 'persona') => {
    if (mode === 'item' && !selectedItem) {
      toast({
        title: 'Item Required',
        description: 'Please select an item to build an outfit around',
        variant: 'destructive',
      });
      return;
    }

    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-outfit-suggestions', {
        body: {
          mode,
          itemId: selectedItem,
          theme,
          persona,
          merchantContext: true
        }
      });

      if (error) throw error;

      const newOutfit = {
        id: Date.now().toString(),
        mode,
        items: data?.items || [],
        theme: mode === 'theme' ? theme : undefined,
        persona: mode === 'persona' ? persona : undefined,
        createdAt: new Date()
      };

      setGeneratedOutfits([newOutfit, ...generatedOutfits]);
      toast({
        title: 'Outfit Generated',
        description: 'AI styling complete',
      });
    } catch (error) {
      console.error('Error generating outfit:', error);
      toast({
        title: 'Generation Failed',
        description: 'Failed to generate outfit. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Palette className="h-6 w-6 text-primary" />
            MyStylist AI
          </h2>
          <p className="text-muted-foreground">
            Professional AI styling for your products
          </p>
        </div>
      </div>

      <Tabs defaultValue="item-centric" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="item-centric">Item-Centric</TabsTrigger>
          <TabsTrigger value="theme-based">Theme-Based</TabsTrigger>
          <TabsTrigger value="persona">User Persona</TabsTrigger>
          <TabsTrigger value="gallery">Outfit Gallery</TabsTrigger>
        </TabsList>

        {/* Item-Centric Generation */}
        <TabsContent value="item-centric" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Generate Outfit Around Item</CardTitle>
              <CardDescription>
                Select one of your items and AI will create complete outfits featuring it
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Select value={selectedItem} onValueChange={setSelectedItem}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an item from your inventory" />
                  </SelectTrigger>
                  <SelectContent>
                    {items?.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name} - ${item.price}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={() => generateOutfit('item')}
                disabled={generating || !selectedItem}
                className="w-full"
                size="lg"
              >
                <Wand2 className="mr-2 h-5 w-5" />
                {generating ? 'Generating...' : 'Generate Outfits'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Theme-Based Generation */}
        <TabsContent value="theme-based" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Theme-Based Outfit Generation</CardTitle>
              <CardDescription>
                Create outfits from your inventory based on a theme
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Select value={theme} onValueChange={setTheme}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="formal">Formal Wear</SelectItem>
                    <SelectItem value="casual">Casual Style</SelectItem>
                    <SelectItem value="business">Business Casual</SelectItem>
                    <SelectItem value="street">Street Style</SelectItem>
                    <SelectItem value="evening">Evening Wear</SelectItem>
                    <SelectItem value="athletic">Athletic/Sporty</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={() => generateOutfit('theme')}
                disabled={generating}
                className="w-full"
                size="lg"
              >
                <Palette className="mr-2 h-5 w-5" />
                {generating ? 'Generating...' : 'Generate Theme Outfits'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Persona-Based Generation */}
        <TabsContent value="persona" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Persona Styling</CardTitle>
              <CardDescription>
                Generate outfits tailored to specific MyDresser user personas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Select value={persona} onValueChange={setPersona}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="minimalist">The Minimalist</SelectItem>
                    <SelectItem value="trendsetter">The Trendsetter</SelectItem>
                    <SelectItem value="classic">The Classic</SelectItem>
                    <SelectItem value="bold">The Bold Experimenter</SelectItem>
                    <SelectItem value="sustainable">The Eco-Conscious</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={() => generateOutfit('persona')}
                disabled={generating}
                className="w-full"
                size="lg"
              >
                <User className="mr-2 h-5 w-5" />
                {generating ? 'Generating...' : 'Generate Persona Outfits'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Outfit Gallery */}
        <TabsContent value="gallery" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Generated Outfits</CardTitle>
              <CardDescription>
                View, export, and use your AI-generated outfits
              </CardDescription>
            </CardHeader>
            <CardContent>
              {generatedOutfits.length === 0 ? (
                <div className="text-center py-12">
                  <Palette className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No outfits yet</h3>
                  <p className="text-muted-foreground">
                    Generate outfits to see them here
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {generatedOutfits.map((outfit) => (
                    <Card key={outfit.id} className="overflow-hidden">
                      <div className="aspect-[3/4] bg-muted flex items-center justify-center">
                        <Palette className="h-12 w-12 text-muted-foreground" />
                      </div>
                      <CardContent className="p-4 space-y-3">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary">
                              {outfit.mode === 'item' ? 'Item-Based' : 
                               outfit.mode === 'theme' ? 'Theme-Based' : 'Persona-Based'}
                            </Badge>
                          </div>
                          {outfit.theme && (
                            <p className="text-sm text-muted-foreground">Theme: {outfit.theme}</p>
                          )}
                          {outfit.persona && (
                            <p className="text-sm text-muted-foreground">Persona: {outfit.persona}</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="flex-1">
                            <Download className="mr-1 h-3 w-3" />
                            Export
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1">
                            <Share2 className="mr-1 h-3 w-3" />
                            Use in Campaign
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button variant="outline" className="w-full justify-start">
            <BookOpen className="mr-2 h-4 w-4" />
            Create Style Guide
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <TrendingUp className="mr-2 h-4 w-4" />
            Validate Against Trends
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <User className="mr-2 h-4 w-4" />
            Generate Marketing Visuals
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
