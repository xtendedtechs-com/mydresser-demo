import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, Upload, Image as ImageIcon, Loader2, TrendingUp } from 'lucide-react';

export const AIImageStyleAnalyzer = () => {
  const { toast } = useToast();
  const [imageUrl, setImageUrl] = useState('');
  const [analysisType, setAnalysisType] = useState<'style' | 'outfit' | 'trend'>('style');
  const [analysis, setAnalysis] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImageUrl(result);
        setPreviewUrl(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async () => {
    if (!imageUrl) {
      toast({
        title: 'No Image',
        description: 'Please provide an image URL or upload an image',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-image-style-analysis', {
        body: { 
          imageUrl,
          analysisType 
        }
      });

      if (error) throw error;

      setAnalysis(data.analysis);
      
      toast({
        title: 'Analysis Complete',
        description: 'Image has been analyzed',
      });
    } catch (error: any) {
      console.error('Analysis error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to analyze image',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-primary" />
            AI Image Style Analyzer
          </CardTitle>
          <CardDescription>
            Upload or paste an image URL to get AI-powered style insights and recommendations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Image Input */}
          <Tabs value={analysisType} onValueChange={(v: any) => setAnalysisType(v)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="style">Style Analysis</TabsTrigger>
              <TabsTrigger value="outfit">Outfit Matching</TabsTrigger>
              <TabsTrigger value="trend">Trend Detection</TabsTrigger>
            </TabsList>

            <TabsContent value="style" className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Identify style categories, key elements, and get personalized recommendations
              </p>
            </TabsContent>
            <TabsContent value="outfit" className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Get suggestions on what to pair this item with and styling tips
              </p>
            </TabsContent>
            <TabsContent value="trend" className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Discover current trends and how to incorporate them into your style
              </p>
            </TabsContent>
          </Tabs>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Image URL</Label>
              <Input
                placeholder="https://example.com/fashion-image.jpg"
                value={imageUrl}
                onChange={(e) => {
                  setImageUrl(e.target.value);
                  setPreviewUrl(e.target.value);
                }}
              />
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Upload Image</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="cursor-pointer"
                />
                <Button variant="outline" size="icon" asChild>
                  <label className="cursor-pointer">
                    <Upload className="h-4 w-4" />
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                </Button>
              </div>
            </div>
          </div>

          {/* Image Preview */}
          {previewUrl && (
            <div className="rounded-lg border overflow-hidden">
              <img 
                src={previewUrl} 
                alt="Preview" 
                className="w-full h-64 object-cover"
                onError={() => {
                  setPreviewUrl('');
                  toast({
                    title: 'Invalid Image',
                    description: 'Could not load image',
                    variant: 'destructive',
                  });
                }}
              />
            </div>
          )}

          <Button 
            onClick={analyzeImage} 
            disabled={loading || !imageUrl}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Analyze Image
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {analysis && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Analysis Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              <p className="whitespace-pre-wrap text-sm">{analysis}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};