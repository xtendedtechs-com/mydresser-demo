import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Upload, X, Image, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface RealImageUploadProps {
  onFilesSelected: (files: File[]) => void;
  type: 'photo' | 'video';
  maxFiles?: number;
  existingFiles?: File[];
  disabled?: boolean;
}

const RealImageUpload = ({
  onFilesSelected,
  type = 'photo',
  maxFiles = 5,
  existingFiles = [],
  disabled = false
}: RealImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>(existingFiles);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!existingFiles || existingFiles.length === 0) {
      setSelectedFiles([]);
      setPreviewUrls([]);
      return;
    }

    setSelectedFiles(existingFiles);
    const urls = existingFiles.map((file) => URL.createObjectURL(file));
    setPreviewUrls(urls);
  }, [existingFiles]);

  const handleFileSelect = async (files: FileList) => {
    if (disabled || uploading) return;

    const remainingSlots = maxFiles - selectedFiles.length;
    if (files.length > remainingSlots) {
      toast({
        title: 'Too many files',
        description: `You can only upload ${remainingSlots} more ${type}(s)`,
        variant: 'destructive'
      });
      return;
    }

    try {
      const newFiles = Array.from(files);
      const newPreviews = newFiles.map(file => URL.createObjectURL(file));
      
      const updatedFiles = [...selectedFiles, ...newFiles];
      const updatedPreviews = [...previewUrls, ...newPreviews];
      
      setSelectedFiles(updatedFiles);
      setPreviewUrls(updatedPreviews);
      onFilesSelected(updatedFiles);

      toast({
        title: 'Files selected',
        description: `${newFiles.length} ${type}(s) ready to upload`
      });
    } catch (error: any) {
      toast({
        title: 'Selection failed',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const removeFile = (indexToRemove: number) => {
    if (disabled) return;

    // Revoke the preview URL to free memory
    if (previewUrls[indexToRemove]) {
      URL.revokeObjectURL(previewUrls[indexToRemove]);
    }

    const updatedFiles = selectedFiles.filter((_, index) => index !== indexToRemove);
    const updatedPreviews = previewUrls.filter((_, index) => index !== indexToRemove);
    
    setSelectedFiles(updatedFiles);
    setPreviewUrls(updatedPreviews);
    onFilesSelected(updatedFiles);

    toast({
      title: 'File removed',
      description: `${type} has been removed`
    });
  };

  const acceptedTypes = type === 'photo' 
    ? 'image/jpeg,image/png,image/webp,image/gif'
    : 'video/mp4,video/webm,video/mov,video/avi';

  return (
    <div className="space-y-4">
      {/* Upload Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Image className="w-4 h-4" />
          <span className="font-medium">
            {type === 'photo' ? 'Photos' : 'Videos'} ({selectedFiles.length}/{maxFiles})
          </span>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || uploading || selectedFiles.length >= maxFiles}
        >
          <Upload className="w-4 h-4 mr-2" />
          Add {type === 'photo' ? 'Photos' : 'Videos'}
        </Button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptedTypes}
        onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
        className="hidden"
      />

      {/* Preview */}
      {previewUrls.length === 0 ? (
        <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
          <Image className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">No {type}s uploaded yet</p>
          <p className="text-sm text-muted-foreground">
            Click "Add {type === 'photo' ? 'Photos' : 'Videos'}" to get started
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {previewUrls.map((url, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                <img
                  src={url}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder.svg';
                  }}
                />
              </div>
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  onClick={() => removeFile(index)}
                  disabled={disabled}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
              {index === 0 && (
                <Badge className="absolute bottom-2 left-2" variant="secondary">
                  Main
                </Badge>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Guidelines */}
      <Card className="bg-muted/30 p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
          <div className="space-y-2">
            <h4 className="font-medium">Upload Guidelines</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• {type === 'photo' ? 'Photos' : 'Videos'}: Max {type === 'photo' ? '10MB' : '100MB'} each</li>
              <li>• Formats: {type === 'photo' ? 'JPEG, PNG, WebP, GIF' : 'MP4, WebM, MOV, AVI'}</li>
              <li>• Up to {maxFiles} {type}s per item</li>
              <li>• First image will be used as the main photo</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default RealImageUpload;