import { useState } from 'react';
import { fileUploadService, UploadResult } from '@/services/fileUploadService';
import { useToast } from '@/hooks/use-toast';

export const useFileUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const uploadWardrobePhotos = async (files: File[], userId: string, itemId: string) => {
    setUploading(true);
    setProgress(0);
    
    try {
      const results: UploadResult[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const compressed = await fileUploadService.compressImage(file);
        const result = await fileUploadService.uploadWardrobePhoto(compressed, userId, itemId);
        results.push(result);
        setProgress(((i + 1) / files.length) * 100);
      }

      const failed = results.filter(r => !r.success);
      if (failed.length > 0) {
        toast({
          title: 'Upload Warning',
          description: `${failed.length} photo(s) failed to upload`,
          variant: 'destructive'
        });
      }

      const successful = results.filter(r => r.success);
      if (successful.length > 0) {
        toast({
          title: 'Upload Successful',
          description: `${successful.length} photo(s) uploaded successfully`
        });
      }

      return results;
    } catch (error) {
      toast({
        title: 'Upload Failed',
        description: 'An error occurred during upload',
        variant: 'destructive'
      });
      return [];
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const uploadMerchantPhotos = async (files: File[], merchantId: string, itemId: string) => {
    setUploading(true);
    setProgress(0);
    
    try {
      const results: UploadResult[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const compressed = await fileUploadService.compressImage(file);
        const result = await fileUploadService.uploadMerchantPhoto(compressed, merchantId, itemId);
        results.push(result);
        setProgress(((i + 1) / files.length) * 100);
      }

      return results;
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const uploadAvatar = async (file: File, userId: string) => {
    setUploading(true);
    try {
      const compressed = await fileUploadService.compressImage(file, 500);
      const result = await fileUploadService.uploadAvatar(compressed, userId);
      
      if (result.success) {
        toast({
          title: 'Avatar Updated',
          description: 'Your profile picture has been updated'
        });
      } else {
        toast({
          title: 'Upload Failed',
          description: result.error || 'Could not upload avatar',
          variant: 'destructive'
        });
      }

      return result;
    } finally {
      setUploading(false);
    }
  };

  const uploadMarketPhotos = async (files: File[], userId: string, itemId: string) => {
    setUploading(true);
    setProgress(0);
    
    try {
      const results: UploadResult[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const compressed = await fileUploadService.compressImage(file);
        const result = await fileUploadService.uploadMarketPhoto(compressed, userId, itemId);
        results.push(result);
        setProgress(((i + 1) / files.length) * 100);
      }

      return results;
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return {
    uploading,
    progress,
    uploadWardrobePhotos,
    uploadMerchantPhotos,
    uploadAvatar,
    uploadMarketPhotos
  };
};
