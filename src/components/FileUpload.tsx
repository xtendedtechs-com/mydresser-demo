import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Upload, X, Image, Video } from 'lucide-react';

interface FileUploadProps {
  onUpload: (url: string) => void;
  accept?: string;
  maxSize?: number; // in MB
  type: 'image' | 'video';
  className?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onUpload,
  accept = 'image/*,video/*',
  maxSize = 10,
  type,
  className = ''
}) => {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const { toast } = useToast();

  const uploadFile = async (file: File) => {
    if (!file) return;

    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      toast({
        title: "File too large",
        description: `File size must be less than ${maxSize}MB`,
        variant: "destructive"
      });
      return;
    }

    // Check file type
    const isValidType = type === 'image' 
      ? file.type.startsWith('image/')
      : file.type.startsWith('video/');

    if (!isValidType) {
      toast({
        title: "Invalid file type",
        description: `Please select a valid ${type} file`,
        variant: "destructive"
      });
      return;
    }

    setUploading(true);

    try {
      // Get current user from session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        throw new Error('User not authenticated');
      }
      const user = session.user;

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${user.id}/merchant-items/${type}s/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('merchant-uploads')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('merchant-uploads')
        .getPublicUrl(filePath);

      if (urlData.publicUrl) {
        onUpload(urlData.publicUrl);
        toast({
          title: "Success",
          description: `${type} uploaded successfully`
        });
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Upload failed",
        description: `Failed to upload ${type}. Please try again.`,
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      uploadFile(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  return (
    <div className={className}>
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          className="hidden"
          id={`file-upload-${type}`}
          disabled={uploading}
        />
        
        <div className="space-y-4">
          <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center">
            {type === 'image' ? (
              <Image className="w-6 h-6 text-muted-foreground" />
            ) : (
              <Video className="w-6 h-6 text-muted-foreground" />
            )}
          </div>
          
          <div>
            <p className="text-sm font-medium">
              {uploading ? `Uploading ${type}...` : `Upload ${type} file`}
            </p>
            <p className="text-xs text-muted-foreground">
              Drag and drop or click to browse (Max {maxSize}MB)
            </p>
          </div>
          
          <Label htmlFor={`file-upload-${type}`}>
            <Button
              type="button"
              variant="outline"
              disabled={uploading}
              className="cursor-pointer"
              asChild
            >
              <span>
                <Upload className="w-4 h-4 mr-2" />
                {uploading ? 'Uploading...' : 'Choose File'}
              </span>
            </Button>
          </Label>
        </div>
      </div>
    </div>
  );
};