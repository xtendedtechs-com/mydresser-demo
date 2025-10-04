import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useVTOPhotos } from '@/hooks/useVTOPhotos';
import { useUserSettings } from '@/hooks/useUserSettings';
import { Camera, Trash2, Check, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const VTOPhotoSettings = () => {
  const { photos, uploadPhoto, deletePhoto, togglePhotoActive, isUploading } = useVTOPhotos();
  const { settings, updateSettings } = useUserSettings();
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'File Too Large',
          description: 'Please select an image under 5MB',
          variant: 'destructive',
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      uploadPhoto(selectedFile);
      setSelectedFile(null);
      // Reset file input
      const fileInput = document.getElementById('vto-photo-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    }
  };

  const handleRandomToggle = (checked: boolean) => {
    updateSettings({ enable_random_vto_photo: checked });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Virtual Try-On Photos</CardTitle>
          <CardDescription>
            Manage your photos for daily outfit virtual try-on previews
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Upload Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <input
                id="vto-photo-input"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <Button
                variant="outline"
                onClick={() => document.getElementById('vto-photo-input')?.click()}
                className="flex-1"
              >
                <Camera className="w-4 h-4 mr-2" />
                Select Photo
              </Button>
              {selectedFile && (
                <Button onClick={handleUpload} disabled={isUploading}>
                  <Upload className="w-4 h-4 mr-2" />
                  {isUploading ? 'Uploading...' : 'Upload'}
                </Button>
              )}
            </div>
            {selectedFile && (
              <p className="text-sm text-muted-foreground">
                Selected: {selectedFile.name}
              </p>
            )}

            {/* Tips Section */}
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="text-sm font-semibold mb-2">Tips for best results:</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Use a full-body photo with good lighting</li>
                <li>• Stand against a plain background</li>
                <li>• Wear form-fitting clothes</li>
                <li>• Face the camera directly</li>
                <li>• Photos will be used for all outfit suggestions</li>
              </ul>
            </div>
          </div>

          {/* Random Selection Toggle */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-0.5">
              <Label htmlFor="random-vto">Random Photo Selection</Label>
              <p className="text-sm text-muted-foreground">
                Randomly select from active photos for variety
              </p>
            </div>
            <Switch
              id="random-vto"
              checked={settings?.enable_random_vto_photo || false}
              onCheckedChange={handleRandomToggle}
            />
          </div>

          {/* Photo Gallery */}
          <div>
            <h4 className="font-medium mb-3">Your VTO Photos ({photos.length})</h4>
            {photos.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No photos uploaded yet. Upload your first photo to get started!
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {photos.map((photo) => (
                  <div
                    key={photo.id}
                    className={`relative group rounded-lg overflow-hidden border-2 ${
                      photo.is_active ? 'border-primary' : 'border-border'
                    }`}
                  >
                    <img
                      src={photo.photo_url}
                      alt="VTO Photo"
                      className="w-full aspect-square object-cover"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button
                        size="sm"
                        variant={photo.is_active ? 'default' : 'secondary'}
                        onClick={() => togglePhotoActive({ photoId: photo.id, isActive: !photo.is_active })}
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deletePhoto(photo.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    {photo.is_active && (
                      <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                        Active
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
