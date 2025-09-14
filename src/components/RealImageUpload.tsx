import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { X, Upload, FileImage, FileVideo } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface FileUploadProps {
  onFilesSelected: (files: string[]) => void;
  maxFiles?: number;
  type?: 'photo' | 'video' | 'both';
  existingFiles?: string[];
  className?: string;
}

interface UploadingFile {
  file: File;
  progress: number;
  url?: string;
  error?: string;
}

export default function RealImageUpload({ 
  onFilesSelected, 
  maxFiles = 5, 
  type = 'photo',
  existingFiles = [],
  className = ''
}: FileUploadProps) {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>(existingFiles);

  const uploadToStorage = async (file: File, bucket: string): Promise<string> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Create unique filename with timestamp
    const timestamp = Date.now();
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${timestamp}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Storage upload error:', error);
      throw new Error('Failed to upload file');
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  };

  const processFiles = useCallback(async (files: File[]) => {
    // Validate file count
    if (uploadedUrls.length + files.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} files allowed`);
      return;
    }

    // Validate and process each file
    const validFiles: File[] = [];
    
    for (const file of files) {
      // File size validation
      const maxSize = type === 'photo' ? 10 * 1024 * 1024 : 100 * 1024 * 1024; // 10MB for photos, 100MB for videos
      if (file.size > maxSize) {
        toast.error(`${type === 'photo' ? 'Photo' : 'Video'} must be less than ${type === 'photo' ? '10MB' : '100MB'}`);
        continue;
      }

      // File type validation
      if (type === 'photo' || type === 'both') {
        if (file.type.startsWith('image/') && ['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
          validFiles.push(file);
          continue;
        }
      }
      
      if (type === 'video' || type === 'both') {
        if (file.type.startsWith('video/') && ['video/mp4', 'video/webm', 'video/mov', 'video/avi'].includes(file.type)) {
          validFiles.push(file);
          continue;
        }
      }

      toast.error(`Invalid file type: ${file.name}`);
    }

    if (validFiles.length === 0) return;

    // Initialize uploading state
    const initialUploads = validFiles.map(file => ({
      file,
      progress: 0
    }));
    
    setUploadingFiles(initialUploads);

    // Upload files
    const uploadPromises = validFiles.map(async (file, index) => {
      try {
        const bucket = 'wardrobe-photos'; // Always use wardrobe-photos bucket
        
        // Simulate progress for better UX
        const progressInterval = setInterval(() => {
          setUploadingFiles(prev => prev.map((upload, i) => 
            i === index ? { ...upload, progress: Math.min(upload.progress + 10, 90) } : upload
          ));
        }, 200);

        const url = await uploadToStorage(file, bucket);
        
        clearInterval(progressInterval);
        
        // Complete progress
        setUploadingFiles(prev => prev.map((upload, i) => 
          i === index ? { ...upload, progress: 100, url } : upload
        ));

        return url;
      } catch (error: any) {
        console.error(`Upload failed for ${file.name}:`, error);
        
        setUploadingFiles(prev => prev.map((upload, i) => 
          i === index ? { ...upload, error: error.message } : upload
        ));
        
        throw error;
      }
    });

    try {
      const urls = await Promise.all(uploadPromises);
      const newUrls = [...uploadedUrls, ...urls];
      
      setUploadedUrls(newUrls);
      onFilesSelected(newUrls);
      
      // Clear uploading state after a brief delay
      setTimeout(() => {
        setUploadingFiles([]);
      }, 1000);
      
      toast.success(`${urls.length} file(s) uploaded successfully!`);
    } catch (error) {
      toast.error('Some uploads failed. Please try again.');
    }
  }, [uploadedUrls, maxFiles, type, onFilesSelected]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: processFiles,
    accept: type === 'photo' 
      ? { 'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif'] }
      : type === 'video'
      ? { 'video/*': ['.mp4', '.webm', '.mov', '.avi'] }
      : { 
          'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif'],
          'video/*': ['.mp4', '.webm', '.mov', '.avi']
        },
    maxFiles: maxFiles - uploadedUrls.length,
    disabled: uploadingFiles.length > 0
  });

  const removeFile = (urlToRemove: string) => {
    const newUrls = uploadedUrls.filter(url => url !== urlToRemove);
    setUploadedUrls(newUrls);
    onFilesSelected(newUrls);
  };

  const removeUploadingFile = (indexToRemove: number) => {
    setUploadingFiles(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}
          ${uploadingFiles.length > 0 ? 'pointer-events-none opacity-50' : 'hover:border-primary hover:bg-primary/5'}
        `}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center gap-2">
          {type === 'photo' ? <FileImage className="w-8 h-8 text-muted-foreground" /> : 
           type === 'video' ? <FileVideo className="w-8 h-8 text-muted-foreground" /> :
           <Upload className="w-8 h-8 text-muted-foreground" />}
          
          <div className="text-sm">
            {isDragActive ? (
              <p>Drop the files here...</p>
            ) : (
              <div>
                <p className="font-medium">
                  Click to upload or drag and drop
                </p>
                <p className="text-muted-foreground mt-1">
                  {type === 'photo' && 'PNG, JPG, WEBP up to 10MB'}
                  {type === 'video' && 'MP4, WEBM, MOV up to 100MB'}
                  {type === 'both' && 'Images (10MB) or Videos (100MB)'}
                </p>
                <p className="text-muted-foreground">
                  {maxFiles - uploadedUrls.length} of {maxFiles} files remaining
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Uploading Files */}
      {uploadingFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Uploading...</h4>
          {uploadingFiles.map((upload, index) => (
            <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
              <div className="flex-1">
                <p className="text-sm font-medium truncate">{upload.file.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Progress value={upload.progress} className="flex-1 h-2" />
                  <span className="text-xs text-muted-foreground">{upload.progress}%</span>
                </div>
                {upload.error && (
                  <p className="text-xs text-destructive mt-1">{upload.error}</p>
                )}
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="w-6 h-6"
                onClick={() => removeUploadingFile(index)}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Uploaded Files */}
      {uploadedUrls.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Uploaded Files</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {uploadedUrls.map((url, index) => (
              <div key={url} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                  <img
                    src={url}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <Button
                  size="icon"
                  variant="destructive"
                  className="absolute -top-2 -right-2 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeFile(url)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}