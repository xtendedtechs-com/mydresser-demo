import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Upload, 
  X, 
  Sparkles, 
  Eye, 
  CheckCircle,
  AlertCircle,
  ImageIcon
} from 'lucide-react';
import { toast } from 'sonner';

interface SmartImageUploadProps {
  onUpload: (file: File, analysis: ImageAnalysis) => void;
  maxSize?: number;
  acceptedTypes?: string[];
  className?: string;
}

interface ImageAnalysis {
  category: string;
  color: string;
  material: string;
  season: string;
  occasion: string;
  style: string[];
  confidence: number;
  description: string;
}

export const SmartImageUpload = ({ 
  onUpload, 
  maxSize = 5 * 1024 * 1024, // 5MB
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp'],
  className = ""
}: SmartImageUploadProps) => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<ImageAnalysis | null>(null);
  const [progress, setProgress] = useState(0);

  const analyzeImage = async (file: File): Promise<ImageAnalysis> => {
    // Simulate AI image analysis
    setProgress(20);
    await new Promise(resolve => setTimeout(resolve, 800));
    
    setProgress(60);
    await new Promise(resolve => setTimeout(resolve, 600));
    
    setProgress(90);
    await new Promise(resolve => setTimeout(resolve, 400));
    
    // Mock AI analysis results based on filename/type
    const mockAnalysis: ImageAnalysis = {
      category: detectCategory(file.name),
      color: detectColor(file.name),
      material: detectMaterial(file.name),
      season: 'all-season',
      occasion: 'casual',
      style: ['contemporary', 'versatile'],
      confidence: Math.floor(Math.random() * 20) + 80, // 80-100%
      description: generateDescription(file.name)
    };
    
    setProgress(100);
    return mockAnalysis;
  };

  const detectCategory = (filename: string): string => {
    const name = filename.toLowerCase();
    if (name.includes('shirt') || name.includes('blouse') || name.includes('top')) return 'tops';
    if (name.includes('pant') || name.includes('jean') || name.includes('trouser')) return 'bottoms';
    if (name.includes('dress')) return 'dresses';
    if (name.includes('jacket') || name.includes('coat') || name.includes('blazer')) return 'outerwear';
    if (name.includes('shoe') || name.includes('sneaker') || name.includes('boot')) return 'shoes';
    return 'tops'; // Default
  };

  const detectColor = (filename: string): string => {
    const name = filename.toLowerCase();
    const colors = ['black', 'white', 'blue', 'red', 'green', 'yellow', 'brown', 'gray', 'pink', 'purple'];
    for (const color of colors) {
      if (name.includes(color)) return color;
    }
    return 'neutral';
  };

  const detectMaterial = (filename: string): string => {
    const name = filename.toLowerCase();
    if (name.includes('cotton')) return 'Cotton';
    if (name.includes('silk')) return 'Silk';
    if (name.includes('wool')) return 'Wool';
    if (name.includes('leather')) return 'Leather';
    if (name.includes('denim')) return 'Denim';
    return 'Cotton Blend';
  };

  const generateDescription = (filename: string): string => {
    const category = detectCategory(filename);
    const color = detectColor(filename);
    return `A ${color} ${category.slice(0, -1)} with contemporary styling and versatile appeal.`;
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Validate file
    if (file.size > maxSize) {
      toast.error(`File too large. Maximum size is ${maxSize / (1024 * 1024)}MB`);
      return;
    }

    if (!acceptedTypes.includes(file.type)) {
      toast.error('Invalid file type. Please upload JPEG, PNG, or WebP images.');
      return;
    }

    // Set preview
    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);
    setUploadedFile(file);
    
    // Analyze image
    try {
      setAnalyzing(true);
      setProgress(0);
      const imageAnalysis = await analyzeImage(file);
      setAnalysis(imageAnalysis);
      toast.success('Image analyzed successfully!');
    } catch (error) {
      toast.error('Failed to analyze image');
      console.error('Image analysis error:', error);
    } finally {
      setAnalyzing(false);
    }
  }, [maxSize, acceptedTypes]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': acceptedTypes.map(type => type.split('/')[1])
    },
    multiple: false,
    maxSize
  });

  const clearUpload = () => {
    setUploadedFile(null);
    setPreview('');
    setAnalysis(null);
    setProgress(0);
    if (preview) {
      URL.revokeObjectURL(preview);
    }
  };

  const handleConfirm = () => {
    if (uploadedFile && analysis) {
      onUpload(uploadedFile, analysis);
      clearUpload();
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {!uploadedFile ? (
        <Card className="border-2 border-dashed transition-colors hover:border-primary/50">
          <CardContent 
            {...getRootProps()} 
            className={`p-8 text-center cursor-pointer transition-colors ${
              isDragActive ? 'bg-primary/5' : 'hover:bg-muted/50'
            }`}
          >
            <input {...getInputProps()} />
            <div className="space-y-4">
              <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center transition-colors ${
                isDragActive ? 'bg-primary text-primary-foreground' : 'bg-muted'
              }`}>
                <Upload className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-medium text-lg mb-2">
                  {isDragActive ? 'Drop your image here' : 'Upload clothing image'}
                </h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Drag & drop an image or click to browse
                </p>
                <p className="text-xs text-muted-foreground">
                  JPEG, PNG, WebP up to {maxSize / (1024 * 1024)}MB
                </p>
              </div>
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Sparkles className="w-4 h-4" />
                <span>AI-powered analysis included</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Image Preview */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className="relative">
                  <img 
                    src={preview} 
                    alt="Preview" 
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 h-6 w-6"
                    onClick={clearUpload}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" />
                    <span className="font-medium">{uploadedFile.name}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {(uploadedFile.size / 1024).toFixed(1)} KB
                  </p>
                  {analyzing && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Sparkles className="w-4 h-4 animate-spin" />
                        <span>Analyzing image...</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Analysis Results */}
          {analysis && (
            <Card>
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <h3 className="font-medium">AI Analysis Complete</h3>
                  <Badge variant="secondary" className="ml-auto">
                    {analysis.confidence}% confidence
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Category:</span>
                    <p className="font-medium capitalize">{analysis.category}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Color:</span>
                    <p className="font-medium capitalize">{analysis.color}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Material:</span>
                    <p className="font-medium">{analysis.material}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Season:</span>
                    <p className="font-medium capitalize">{analysis.season}</p>
                  </div>
                </div>

                <div>
                  <span className="text-muted-foreground text-sm">Style Tags:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {analysis.style.map((style, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {style}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-muted-foreground text-sm">Description:</span>
                  <p className="text-sm mt-1">{analysis.description}</p>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button onClick={handleConfirm} className="flex-1">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Confirm & Add Item
                  </Button>
                  <Button variant="outline" onClick={() => setAnalysis(null)}>
                    <Eye className="w-4 h-4 mr-2" />
                    Reanalyze
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};