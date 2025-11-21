/**
 * MyDresser File Upload Service
 * Handles all file uploads to Supabase Storage with proper security
 */

import { supabase } from '@/integrations/supabase/client';

export interface UploadResult {
  success: boolean;
  url?: string;
  path?: string;
  error?: string;
}

class FileUploadService {
  private static instance: FileUploadService;

  static getInstance(): FileUploadService {
    if (!FileUploadService.instance) {
      FileUploadService.instance = new FileUploadService();
    }
    return FileUploadService.instance;
  }

  /**
   * Upload wardrobe item photo
   */
  async uploadWardrobePhoto(file: File, userId: string, itemId: string): Promise<UploadResult> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${itemId}-${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('wardrobe')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('wardrobe')
        .getPublicUrl(data.path);

      return {
        success: true,
        url: publicUrl,
        path: data.path
      };
    } catch (error) {
      console.error('Wardrobe photo upload error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed'
      };
    }
  }

  /**
   * Upload multiple wardrobe photos
   */
  async uploadWardrobePhotos(files: File[], userId: string, itemId: string): Promise<UploadResult[]> {
    const uploads = files.map(file => this.uploadWardrobePhoto(file, userId, itemId));
    return Promise.all(uploads);
  }

  /**
   * Delete wardrobe photo
   */
  async deleteWardrobePhoto(path: string): Promise<boolean> {
    try {
      const { error } = await supabase.storage
        .from('wardrobe')
        .remove([path]);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Delete photo error:', error);
      return false;
    }
  }

  /**
   * Upload merchant product photo
   */
  async uploadMerchantPhoto(file: File, merchantId: string, itemId: string): Promise<UploadResult> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${merchantId}/${itemId}-${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('merchant-products')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('merchant-products')
        .getPublicUrl(data.path);

      return {
        success: true,
        url: publicUrl,
        path: data.path
      };
    } catch (error) {
      console.error('Merchant photo upload error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed'
      };
    }
  }

  /**
   * Upload outfit photo
   */
  async uploadOutfitPhoto(file: File, userId: string, outfitId: string): Promise<UploadResult> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${outfitId}-${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('outfits')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('outfits')
        .getPublicUrl(data.path);

      return {
        success: true,
        url: publicUrl,
        path: data.path
      };
    } catch (error) {
      console.error('Outfit photo upload error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed'
      };
    }
  }

  /**
   * Upload user avatar
   */
  async uploadAvatar(file: File, userId: string): Promise<UploadResult> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/avatar.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('user-avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('user-avatars')
        .getPublicUrl(data.path);

      return {
        success: true,
        url: publicUrl,
        path: data.path
      };
    } catch (error) {
      console.error('Avatar upload error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed'
      };
    }
  }

  /**
   * Upload market item photo
   */
  async uploadMarketPhoto(file: File, userId: string, itemId: string): Promise<UploadResult> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${itemId}-${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('market-items')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('market-items')
        .getPublicUrl(data.path);

      return {
        success: true,
        url: publicUrl,
        path: data.path
      };
    } catch (error) {
      console.error('Market photo upload error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed'
      };
    }
  }

  /**
   * Compress image before upload (optional optimization)
   */
  async compressImage(file: File, maxWidth: number = 1920): Promise<File> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          canvas.toBlob((blob) => {
            if (blob) {
              resolve(new File([blob], file.name, { type: 'image/jpeg' }));
            } else {
              resolve(file);
            }
          }, 'image/jpeg', 0.85);
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  }
}

export const fileUploadService = FileUploadService.getInstance();
