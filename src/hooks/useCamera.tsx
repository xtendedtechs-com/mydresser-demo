import { useState } from 'react';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { useToast } from '@/hooks/use-toast';

export interface PhotoResult {
  webPath?: string;
  base64?: string;
  format: string;
}

export const useCamera = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const checkPermissions = async () => {
    try {
      const permissions = await Camera.checkPermissions();
      if (permissions.camera === 'prompt' || permissions.camera === 'prompt-with-rationale') {
        const request = await Camera.requestPermissions({ permissions: ['camera', 'photos'] });
        return request.camera === 'granted';
      }
      return permissions.camera === 'granted';
    } catch (error) {
      console.error('[Camera] Permission check failed:', error);
      return false;
    }
  };

  const takePhoto = async (): Promise<PhotoResult | null> => {
    setIsLoading(true);
    try {
      const hasPermission = await checkPermissions();
      if (!hasPermission) {
        toast({
          title: 'Camera Permission Required',
          description: 'Please enable camera access in your device settings',
          variant: 'destructive',
        });
        setIsLoading(false);
        return null;
      }

      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera,
        width: 1920,
        height: 1920,
      });

      setIsLoading(false);
      return {
        webPath: image.webPath,
        format: image.format,
      };
    } catch (error: any) {
      console.error('[Camera] Take photo failed:', error);
      
      if (error.message !== 'User cancelled photos app') {
        toast({
          title: 'Camera Error',
          description: 'Failed to take photo. Please try again.',
          variant: 'destructive',
        });
      }
      
      setIsLoading(false);
      return null;
    }
  };

  const pickFromGallery = async (): Promise<PhotoResult | null> => {
    setIsLoading(true);
    try {
      const hasPermission = await checkPermissions();
      if (!hasPermission) {
        toast({
          title: 'Gallery Permission Required',
          description: 'Please enable photos access in your device settings',
          variant: 'destructive',
        });
        setIsLoading(false);
        return null;
      }

      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.Uri,
        source: CameraSource.Photos,
        width: 1920,
        height: 1920,
      });

      setIsLoading(false);
      return {
        webPath: image.webPath,
        format: image.format,
      };
    } catch (error: any) {
      console.error('[Camera] Pick from gallery failed:', error);
      
      if (error.message !== 'User cancelled photos app') {
        toast({
          title: 'Gallery Error',
          description: 'Failed to select photo. Please try again.',
          variant: 'destructive',
        });
      }
      
      setIsLoading(false);
      return null;
    }
  };

  const pickMultiple = async (maxPhotos: number = 10): Promise<PhotoResult[]> => {
    toast({
      title: 'Multiple Selection',
      description: 'Multiple photo selection coming soon!',
    });
    return [];
  };

  return {
    takePhoto,
    pickFromGallery,
    pickMultiple,
    isLoading,
  };
};
