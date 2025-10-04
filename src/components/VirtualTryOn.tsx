import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, User, Loader2, X, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface VirtualTryOnProps {
  onPhotoUploaded?: (photoUrl: string) => void;
  currentPhoto?: string | null;
}

const VirtualTryOn = ({ onPhotoUploaded, currentPhoto }: VirtualTryOnProps) => {
  const [uploading, setUploading] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(currentPhoto || null);
  const { toast } = useToast();

  useEffect(() => {
    loadSavedPhoto();
  }, []);

  const loadSavedPhoto = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load from user preferences or profile
      const { data } = await supabase
        .from('user_preferences')
        .select('vto_photo_url')
        .eq('user_id', user.id)
        .maybeSingle();

      if (data?.vto_photo_url) {
        setPhotoUrl(data.vto_photo_url);
      }
    } catch (error) {
      console.error('Error loading VTO photo:', error);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload an image file',
        variant: 'destructive'
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please upload an image smaller than 5MB',
        variant: 'destructive'
      });
      return;
    }

    setUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Upload to Supabase storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/vto-photo-${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('user-photos')
        .upload(fileName, file, {
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('user-photos')
        .getPublicUrl(fileName);

      // Save to user preferences
      await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          vto_photo_url: publicUrl
        }, {
          onConflict: 'user_id'
        });

      setPhotoUrl(publicUrl);
      onPhotoUploaded?.(publicUrl);

      toast({
        title: 'Photo uploaded successfully',
        description: 'Your photo will be used for virtual try-on'
      });
    } catch (error: any) {
      console.error('Error uploading photo:', error);
      toast({
        title: 'Upload failed',
        description: error.message || 'Failed to upload photo',
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemovePhoto = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Remove from user preferences
      await supabase
        .from('user_preferences')
        .update({ vto_photo_url: null })
        .eq('user_id', user.id);

      setPhotoUrl(null);
      onPhotoUploaded?.(null);

      toast({
        title: 'Photo removed',
        description: 'VTO photo has been removed'
      });
    } catch (error) {
      console.error('Error removing photo:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          Virtual Try-On Photo
        </CardTitle>
        <CardDescription>
          Upload your photo for personalized outfit visualization
        </CardDescription>
      </CardHeader>
      <CardContent>
        {photoUrl ? (
          <div className="space-y-4">
            <div className="relative aspect-[3/4] w-full max-w-sm mx-auto rounded-lg overflow-hidden border-2 border-primary">
              <img
                src={photoUrl}
                alt="Virtual try-on photo"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2">
                <Badge className="bg-green-500">
                  <Check className="w-3 h-3 mr-1" />
                  Active
                </Badge>
              </div>
            </div>
            
            <div className="flex gap-2 justify-center">
              <Button
                variant="outline"
                onClick={handleRemovePhoto}
              >
                <X className="w-4 h-4 mr-2" />
                Remove Photo
              </Button>
              
              <Button
                variant="default"
                onClick={() => document.getElementById('vto-upload')?.click()}
                disabled={uploading}
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Change Photo
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-4">
            <div className="aspect-[3/4] w-full max-w-sm mx-auto rounded-lg border-2 border-dashed border-border flex items-center justify-center bg-muted/50">
              <div className="text-center p-8">
                <User className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-4">
                  No photo uploaded yet
                </p>
                <p className="text-xs text-muted-foreground">
                  Upload a full-body photo for best results
                </p>
              </div>
            </div>
            
            <Button
              onClick={() => document.getElementById('vto-upload')?.click()}
              disabled={uploading}
              size="lg"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Photo
                </>
              )}
            </Button>
          </div>
        )}
        
        <input
          id="vto-upload"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileUpload}
          disabled={uploading}
        />
        
        <div className="mt-4 p-4 bg-muted rounded-lg">
          <h4 className="text-sm font-semibold mb-2">Tips for best results:</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Use a full-body photo with good lighting</li>
            <li>• Stand against a plain background</li>
            <li>• Wear form-fitting clothes</li>
            <li>• Face the camera directly</li>
            <li>• Photo will be used for all outfit suggestions</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default VirtualTryOn;