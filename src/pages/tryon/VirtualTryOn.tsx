import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, Upload, Image as ImageIcon, Save, Share2, Camera } from 'lucide-react';
import { useWardrobe } from '@/hooks/useWardrobe';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import RealImageUpload from '@/components/RealImageUpload';

export default function VirtualTryOn() {
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [rateLimit, setRateLimit] = useState<any>(null);
  const { items } = useWardrobe();
  const { toast } = useToast();

  useEffect(() => {
    loadRateLimit();
  }, []);

  const loadRateLimit = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (userData.user) {
        const { data: limitData } = await (supabase as any)
          .rpc('check_vto_rate_limit', { p_user_id: userData.user.id });
        if (limitData) {
          setRateLimit(limitData.daily_remaining);
        }
      }
    } catch (error) {
      console.error('Error loading rate limit:', error);
    }
  };

  const handlePhotoUpload = (urls: string[]) => {
    if (urls.length > 0) {
      setUserPhoto(urls[0]);
    }
  };

  const toggleItemSelection = (item: any) => {
    setSelectedItems(prev => {
      const exists = prev.find(i => i.id === item.id);
      if (exists) {
        return prev.filter(i => i.id !== item.id);
      }
      return [...prev, item];
    });
  };

  const generateTryOn = async () => {
    if (!userPhoto || selectedItems.length === 0) {
      toast({
        title: "Missing requirements",
        description: "Please upload your photo and select at least one item",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-virtual-tryon', {
        body: {
          userImage: userPhoto,
          clothingItems: selectedItems,
        }
      });

      if (error) throw error;

      const url = data?.imageUrl || data?.editedImageUrl;
      if (!url) {
        throw new Error(data?.error || 'Generation failed');
      }

      setGeneratedImage(url);
      
      // Get updated rate limit
      const { data: userData } = await supabase.auth.getUser();
      if (userData.user) {
        const { data: limitData } = await (supabase as any)
          .rpc('check_vto_rate_limit', { p_user_id: userData.user.id });
        if (limitData) {
          setRateLimit(limitData.daily_remaining);
        }
      }
      
      toast({
        title: "Try-on generated!",
        description: "Your virtual outfit is ready"
      });
    } catch (error: any) {
      console.error('Try-on error:', error);
      toast({
        title: "Generation failed",
        description: error.message || "Please try again",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const saveLook = async () => {
    if (!generatedImage) return;

    try {
      const { error } = await (supabase as any)
        .from('saved_tryon_looks')
        .insert({
          user_id: (await supabase.auth.getUser()).data.user?.id,
          look_name: `Outfit ${new Date().toLocaleDateString()}`,
          items: selectedItems,
          image_url: generatedImage,
          share_token: crypto.randomUUID()
        });

      if (error) throw error;

      toast({
        title: "Look saved!",
        description: "Added to your virtual wardrobe"
      });
    } catch (error: any) {
      toast({
        title: "Save failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-primary" />
            Virtual Try-On
          </h1>
          <p className="text-muted-foreground mt-2">
            See how outfits look on you before wearing them
          </p>
        </div>
        {rateLimit !== null && (
          <Badge variant="secondary">
            {rateLimit} tries remaining today
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5" />
                Your Photo
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!userPhoto ? (
                <RealImageUpload
                  onFilesSelected={handlePhotoUpload}
                  type="photo"
                  maxFiles={1}
                />
              ) : (
                <div className="space-y-4">
                  <img 
                    src={userPhoto} 
                    alt="Your photo" 
                    className="w-full rounded-lg"
                  />
                  <Button 
                    variant="outline" 
                    onClick={() => setUserPhoto(null)}
                    className="w-full"
                  >
                    Change Photo
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Select Items to Try On</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="tops">Tops</TabsTrigger>
                  <TabsTrigger value="bottoms">Bottoms</TabsTrigger>
                  <TabsTrigger value="shoes">Shoes</TabsTrigger>
                </TabsList>
                <TabsContent value="all" className="mt-4">
                  <div className="grid grid-cols-3 gap-2 max-h-96 overflow-y-auto">
                    {items.map(item => (
                      <div
                        key={item.id}
                        onClick={() => toggleItemSelection(item)}
                        className={`relative cursor-pointer rounded-lg border-2 overflow-hidden transition-all ${
                          selectedItems.find(i => i.id === item.id)
                            ? 'border-primary ring-2 ring-primary'
                            : 'border-transparent hover:border-muted'
                        }`}
                      >
                        <img
                          src={typeof item.photos === 'string' ? item.photos : '/placeholder.svg'}
                          alt={item.name}
                          className="w-full aspect-square object-cover"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                          <p className="text-white text-xs truncate">{item.name}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
              
              {selectedItems.length > 0 && (
                <Alert className="mt-4">
                  <AlertDescription>
                    {selectedItems.length} item(s) selected
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          <Button
            onClick={generateTryOn}
            disabled={isGenerating || !userPhoto || selectedItems.length === 0}
            className="w-full"
            size="lg"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Try-On
              </>
            )}
          </Button>
        </div>

        {/* Result Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5" />
              Virtual Try-On Result
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!generatedImage ? (
              <div className="aspect-[3/4] bg-muted rounded-lg flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Your virtual try-on will appear here</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <img
                  src={generatedImage}
                  alt="Virtual try-on result"
                  className="w-full rounded-lg"
                />
                <div className="flex gap-2">
                  <Button onClick={saveLook} className="flex-1">
                    <Save className="w-4 h-4 mr-2" />
                    Save Look
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}