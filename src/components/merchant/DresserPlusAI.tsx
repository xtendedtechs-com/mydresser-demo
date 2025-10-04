import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, Image, Wand2, TrendingUp, Copy, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const DresserPlusAI = () => {
  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generatedDesigns, setGeneratedDesigns] = useState<any[]>([]);
  const [selectedStyle, setSelectedStyle] = useState('modern');
  const [selectedCategory, setSelectedCategory] = useState('tops');
  const { toast } = useToast();

  const generateDesign = async () => {
    if (!prompt.trim()) {
      toast({
        title: 'Prompt Required',
        description: 'Please enter a design prompt',
        variant: 'destructive',
      });
      return;
    }

    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-style-transform', {
        body: {
          prompt: `Generate a fashion design: ${prompt}. Style: ${selectedStyle}, Category: ${selectedCategory}`,
          style: selectedStyle,
          category: selectedCategory
        }
      });

      if (error) throw error;

      const newDesign = {
        id: Date.now().toString(),
        prompt,
        style: selectedStyle,
        category: selectedCategory,
        seed: Math.random().toString(36).substring(7),
        createdAt: new Date(),
        imageUrl: data?.imageUrl || '/placeholder.svg'
      };

      setGeneratedDesigns([newDesign, ...generatedDesigns]);
      toast({
        title: 'Design Generated',
        description: 'Your AI design has been created successfully',
      });
    } catch (error) {
      console.error('Error generating design:', error);
      toast({
        title: 'Generation Failed',
        description: 'Failed to generate design. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setGenerating(false);
    }
  };

  const generateVariation = (design: any) => {
    toast({
      title: 'Generating Variation',
      description: 'Creating a new variation from this design...',
    });
    // Would use the seed to generate variations
  };

  const copyPrompt = (designPrompt: string) => {
    navigator.clipboard.writeText(designPrompt);
    toast({
      title: 'Copied',
      description: 'Prompt copied to clipboard',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            Dresser+ AI Design Studio
          </h2>
          <p className="text-muted-foreground">
            Generate innovative fashion designs with advanced AI
          </p>
        </div>
      </div>

      <Tabs defaultValue="generate" className="space-y-6">
        <TabsList>
          <TabsTrigger value="generate">Generate Design</TabsTrigger>
          <TabsTrigger value="trends">Trend Analysis</TabsTrigger>
          <TabsTrigger value="gallery">My Designs</TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Create New Design</CardTitle>
              <CardDescription>
                Describe your vision and let AI bring it to life
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Design Prompt</Label>
                <Textarea
                  placeholder="e.g., A futuristic streetwear jacket with chrome details and sustainable fabric..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Style Category</Label>
                  <Select value={selectedStyle} onValueChange={setSelectedStyle}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="modern">Modern</SelectItem>
                      <SelectItem value="vintage">Vintage</SelectItem>
                      <SelectItem value="streetwear">Streetwear</SelectItem>
                      <SelectItem value="formal">Formal</SelectItem>
                      <SelectItem value="casual">Casual</SelectItem>
                      <SelectItem value="avant-garde">Avant-garde</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Product Category</Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tops">Tops</SelectItem>
                      <SelectItem value="bottoms">Bottoms</SelectItem>
                      <SelectItem value="outerwear">Outerwear</SelectItem>
                      <SelectItem value="dresses">Dresses</SelectItem>
                      <SelectItem value="accessories">Accessories</SelectItem>
                      <SelectItem value="shoes">Shoes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button 
                onClick={generateDesign} 
                disabled={generating}
                className="w-full"
                size="lg"
              >
                <Wand2 className="mr-2 h-5 w-5" />
                {generating ? 'Generating...' : 'Generate Design'}
              </Button>
            </CardContent>
          </Card>

          {generatedDesigns.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Generations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {generatedDesigns.map((design) => (
                    <Card key={design.id} className="overflow-hidden">
                      <div className="aspect-square bg-muted flex items-center justify-center">
                        <Image className="h-12 w-12 text-muted-foreground" />
                      </div>
                      <CardContent className="p-4 space-y-3">
                        <div>
                          <p className="text-sm font-medium line-clamp-2">{design.prompt}</p>
                          <div className="flex gap-2 mt-2">
                            <Badge variant="secondary">{design.style}</Badge>
                            <Badge variant="outline">{design.category}</Badge>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Seed: {design.seed}</span>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => generateVariation(design)}
                          >
                            <Sparkles className="mr-1 h-3 w-3" />
                            Variation
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyPrompt(design.prompt)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                          >
                            <Download className="h-3 w-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Fashion Trend Analysis
              </CardTitle>
              <CardDescription>
                AI-powered insights into current and emerging trends
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-semibold mb-2">Trending Styles</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Oversized Silhouettes</span>
                        <Badge>+24%</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Sustainable Materials</span>
                        <Badge>+31%</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Vintage Revival</span>
                        <Badge>+18%</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-semibold mb-2">Color Trends</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Earth Tones</span>
                        <Badge variant="secondary">Hot</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Neon Accents</span>
                        <Badge variant="secondary">Rising</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Pastel Palettes</span>
                        <Badge variant="outline">Stable</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Button className="w-full">
                <TrendingUp className="mr-2 h-4 w-4" />
                Generate Trend-Based Design
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gallery">
          <Card>
            <CardHeader>
              <CardTitle>Design Gallery</CardTitle>
              <CardDescription>
                View and manage all your AI-generated designs
              </CardDescription>
            </CardHeader>
            <CardContent>
              {generatedDesigns.length === 0 ? (
                <div className="text-center py-12">
                  <Sparkles className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No designs yet</h3>
                  <p className="text-muted-foreground">
                    Start generating to build your collection
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
                  {generatedDesigns.map((design) => (
                    <Card key={design.id} className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow">
                      <div className="aspect-square bg-muted flex items-center justify-center">
                        <Image className="h-12 w-12 text-muted-foreground" />
                      </div>
                      <CardContent className="p-3">
                        <p className="text-sm font-medium line-clamp-1">{design.prompt}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(design.createdAt).toLocaleDateString()}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
