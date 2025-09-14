import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Upload, X, Image, Video, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface UploadedFile {
  id: string;
  name: string;
  url: string;
  type: 'photo' | 'video';
  size: number;
}

interface FileUploadProps {
  photos: UploadedFile[];
  videos: UploadedFile[];
  onPhotosChange: (photos: UploadedFile[]) => void;
  onVideosChange: (videos: UploadedFile[]) => void;
  maxPhotos?: number;
  maxVideos?: number;
  disabled?: boolean;
}

export const FileUpload = ({
  photos,
  videos,
  onPhotosChange,
  onVideosChange,
  maxPhotos = 20,
  maxVideos = 2,
  disabled = false
}: FileUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const validateFile = (file: File, type: 'photo' | 'video') => {
    const maxSize = type === 'photo' ? 10 * 1024 * 1024 : 100 * 1024 * 1024; // 10MB for photos, 100MB for videos
    
    if (file.size > maxSize) {
      throw new Error(`${type === 'photo' ? 'Photo' : 'Video'} must be less than ${type === 'photo' ? '10MB' : '100MB'}`);
    }

    if (type === 'photo') {
      const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        throw new Error('Photo must be JPEG, PNG, WebP, or GIF format');
      }
    } else {
      const validTypes = ['video/mp4', 'video/webm', 'video/mov', 'video/avi'];
      if (!validTypes.includes(file.type)) {
        throw new Error('Video must be MP4, WebM, MOV, or AVI format');
      }
    }
  };

  const uploadFile = async (file: File, type: 'photo' | 'video') => {
    try {
      validateFile(file, type);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const bucketName = type === 'photo' ? 'merchant-item-photos' : 'merchant-item-videos';

      setUploadProgress(0);

      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(fileName);

      const uploadedFile: UploadedFile = {
        id: fileName,
        name: file.name,
        url: publicUrl,
        type,
        size: file.size
      };

      return uploadedFile;
    } catch (error: any) {
      throw error;
    }
  };

  const handleFileSelect = async (files: FileList, type: 'photo' | 'video') => {
    if (disabled) return;

    const currentCount = type === 'photo' ? photos.length : videos.length;
    const maxCount = type === 'photo' ? maxPhotos : maxVideos;
    const remainingSlots = maxCount - currentCount;

    if (files.length > remainingSlots) {
      toast({
        title: 'Too many files',
        description: `You can only upload ${remainingSlots} more ${type}(s)`,
        variant: 'destructive'
      });
      return;
    }

    setUploading(true);

    try {
      const uploadPromises = Array.from(files).map(async (file, index) => {
        setUploadProgress(((index + 1) / files.length) * 100);
        return await uploadFile(file, type);
      });

      const uploadedFiles = await Promise.all(uploadPromises);

      if (type === 'photo') {
        onPhotosChange([...photos, ...uploadedFiles]);
      } else {
        onVideosChange([...videos, ...uploadedFiles]);
      }

      toast({
        title: 'Upload successful',
        description: `${uploadedFiles.length} ${type}(s) uploaded successfully`
      });
    } catch (error: any) {
      toast({
        title: 'Upload failed',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const removeFile = async (file: UploadedFile) => {
    if (disabled) return;

    try {
      // Delete from storage
      const bucketName = file.type === 'photo' ? 'merchant-item-photos' : 'merchant-item-videos';
      await supabase.storage.from(bucketName).remove([file.id]);

      // Update state
      if (file.type === 'photo') {
        onPhotosChange(photos.filter(p => p.id !== file.id));
      } else {
        onVideosChange(videos.filter(v => v.id !== file.id));
      }

      toast({
        title: 'File removed',
        description: `${file.name} has been deleted`
      });
    } catch (error: any) {
      toast({
        title: 'Error removing file',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Upload Progress */}
      {uploading && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Uploading...</span>
                <span>{Math.round(uploadProgress)}%</span>
              </div>
              <Progress value={uploadProgress} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Photo Upload Section */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium flex items-center gap-2">
                <Image className="w-4 h-4" />
                Photos ({photos.length}/{maxPhotos})
              </h4>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => photoInputRef.current?.click()}
                disabled={disabled || uploading || photos.length >= maxPhotos}
              >
                <Upload className="w-4 h-4 mr-2" />
                Add Photos
              </Button>
            </div>

            <input
              ref={photoInputRef}
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={(e) => e.target.files && handleFileSelect(e.target.files, 'photo')}
              className="hidden"
            />

            {photos.length === 0 ? (
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                <Image className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">No photos uploaded yet</p>
                <p className="text-sm text-muted-foreground">Support: JPEG, PNG, WebP, GIF (max 10MB each)</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {photos.map((photo) => (
                  <div key={photo.id} className="relative group">
                    <img
                      src={photo.url}
                      alt={photo.name}
                      className="w-full aspect-square object-cover rounded-lg"
                    />
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        onClick={() => removeFile(photo)}
                        disabled={disabled}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-black/75 text-white p-2 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-xs truncate">{photo.name}</p>
                      <p className="text-xs text-gray-300">{formatFileSize(photo.size)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Video Upload Section */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium flex items-center gap-2">
                <Video className="w-4 h-4" />
                Videos ({videos.length}/{maxVideos})
              </h4>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => videoInputRef.current?.click()}
                disabled={disabled || uploading || videos.length >= maxVideos}
              >
                <Upload className="w-4 h-4 mr-2" />
                Add Videos
              </Button>
            </div>

            <input
              ref={videoInputRef}
              type="file"
              multiple
              accept="video/mp4,video/webm,video/mov,video/avi"
              onChange={(e) => e.target.files && handleFileSelect(e.target.files, 'video')}
              className="hidden"
            />

            {videos.length === 0 ? (
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                <Video className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">No videos uploaded yet</p>
                <p className="text-sm text-muted-foreground">Support: MP4, WebM, MOV, AVI (max 100MB each)</p>
              </div>
            ) : (
              <div className="space-y-4">
                {videos.map((video) => (
                  <Card key={video.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-muted rounded">
                            <Video className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-medium">{video.name}</p>
                            <p className="text-sm text-muted-foreground">{formatFileSize(video.size)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">Video</Badge>
                          <Button
                            type="button"
                            size="sm"
                            variant="destructive"
                            onClick={() => removeFile(video)}
                            disabled={disabled}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      <video
                        src={video.url}
                        className="w-full mt-4 rounded max-h-60"
                        controls
                        preload="metadata"
                      />
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Upload Guidelines */}
      <Card className="bg-muted/30">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
            <div className="space-y-2">
              <h4 className="font-medium">Upload Guidelines</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Photos: Max 10MB each, formats: JPEG, PNG, WebP, GIF</li>
                <li>• Videos: Max 100MB each, formats: MP4, WebM, MOV, AVI</li>
                <li>• Up to {maxPhotos} photos and {maxVideos} videos per item</li>
                <li>• High-quality images improve sales conversion</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};