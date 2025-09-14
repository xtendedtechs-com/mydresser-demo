import { supabase } from '@/integrations/supabase/client';

export interface UploadResult {
  url: string;
  path: string;
  success: boolean;
  error?: string;
}

class ImageService {
  private readonly WARDROBE_BUCKET = 'wardrobe-photos';
  private readonly AVATAR_BUCKET = 'profile-avatars';
  
  async uploadWardrobePhoto(file: File): Promise<UploadResult> {
    return this.uploadFile(file, this.WARDROBE_BUCKET);
  }
  
  async uploadProfileAvatar(file: File): Promise<UploadResult> {
    return this.uploadFile(file, this.AVATAR_BUCKET);
  }

  private async uploadFile(file: File, bucket: string): Promise<UploadResult> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { url: '', path: '', success: false, error: 'User not authenticated' };
      }

      // Validate file
      const validation = this.validateFile(file);
      if (!validation.valid) {
        return { url: '', path: '', success: false, error: validation.error };
      }

      // Generate unique filename
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2);
      const fileExt = file.name.split('.').pop()?.toLowerCase();
      const fileName = `${user.id}/${timestamp}_${randomString}.${fileExt}`;

      // Upload to Supabase storage
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Storage upload error:', error);
        return { url: '', path: '', success: false, error: 'Upload failed: ' + error.message };
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

      return {
        url: urlData.publicUrl,
        path: data.path,
        success: true
      };
    } catch (error: any) {
      console.error('Upload error:', error);
      return { url: '', path: '', success: false, error: error.message };
    }
  }

  private validateFile(file: File): { valid: boolean; error?: string } {
    // Size validation (10MB max)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return { valid: false, error: 'File must be less than 10MB' };
    }

    // Type validation
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'File must be JPEG, PNG, WebP, or GIF format' };
    }

    return { valid: true };
  }

  async deleteFile(path: string, bucket: string): Promise<boolean> {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([path]);

      if (error) {
        console.error('Delete error:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Delete error:', error);
      return false;
    }
  }

  async deleteWardrobePhoto(path: string): Promise<boolean> {
    return this.deleteFile(path, this.WARDROBE_BUCKET);
  }

  async deleteProfileAvatar(path: string): Promise<boolean> {
    return this.deleteFile(path, this.AVATAR_BUCKET);
  }

  // Utility method to extract storage path from public URL
  extractStoragePath(publicUrl: string): string | null {
    try {
      const url = new URL(publicUrl);
      const pathParts = url.pathname.split('/');
      // Remove '/storage/v1/object/public/{bucket}' part
      const relevantParts = pathParts.slice(5);
      return relevantParts.join('/');
    } catch {
      return null;
    }
  }

  // Create image variants/thumbnails
  async createThumbnail(originalUrl: string, width: number = 200, height: number = 200): Promise<string> {
    // For now, return original URL
    // TODO: Implement actual thumbnail generation using Supabase image transformations
    return originalUrl;
  }

  // Batch upload multiple files
  async uploadMultipleFiles(files: File[], bucket: string): Promise<UploadResult[]> {
    const uploadPromises = files.map(file => this.uploadFile(file, bucket));
    return Promise.all(uploadPromises);
  }
}

export const imageService = new ImageService();