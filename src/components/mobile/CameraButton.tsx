import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, Image as ImageIcon } from 'lucide-react';
import { useCamera } from '@/hooks/useCamera';
import { useHaptics } from '@/hooks/useHaptics';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface CameraButtonProps {
  onPhotoTaken: (photoPath: string) => void;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export const CameraButton = ({
  onPhotoTaken,
  variant = 'default',
  size = 'default',
  className = '',
}: CameraButtonProps) => {
  const { takePhoto, pickFromGallery, isLoading } = useCamera();
  const { impact, notification } = useHaptics();
  const [open, setOpen] = useState(false);

  const handleTakePhoto = async () => {
    await impact('light');
    setOpen(false);
    
    const photo = await takePhoto();
    if (photo && photo.webPath) {
      await notification('success');
      onPhotoTaken(photo.webPath);
    }
  };

  const handlePickFromGallery = async () => {
    await impact('light');
    setOpen(false);
    
    const photo = await pickFromGallery();
    if (photo && photo.webPath) {
      await notification('success');
      onPhotoTaken(photo.webPath);
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={className}
          disabled={isLoading}
        >
          <Camera className="w-4 h-4 mr-2" />
          {isLoading ? 'Loading...' : 'Add Photo'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={handleTakePhoto}>
          <Camera className="w-4 h-4 mr-2" />
          Take Photo
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handlePickFromGallery}>
          <ImageIcon className="w-4 h-4 mr-2" />
          Choose from Gallery
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
