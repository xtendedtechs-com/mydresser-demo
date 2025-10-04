import { useState } from 'react';
import { OptimizedImage } from './OptimizedImage';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { Maximize2 } from 'lucide-react';

interface ResponsiveImageProps {
  src: string;
  alt: string;
  className?: string;
  aspectRatio?: 'square' | '3/4' | '16/9' | '4/3';
  zoomable?: boolean;
  priority?: boolean;
}

export const ResponsiveImage = ({
  src,
  alt,
  className,
  aspectRatio = 'square',
  zoomable = false,
  priority = false,
}: ResponsiveImageProps) => {
  const [isZoomed, setIsZoomed] = useState(false);

  return (
    <>
      <div className={cn('relative group', className)}>
        <OptimizedImage
          src={src}
          alt={alt}
          aspectRatio={aspectRatio}
          priority={priority}
          className="w-full"
        />
        
        {zoomable && (
          <button
            onClick={() => setIsZoomed(true)}
            className="absolute top-2 right-2 p-2 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-black/70"
            aria-label="Zoom image"
          >
            <Maximize2 className="w-4 h-4 text-white" />
          </button>
        )}
      </div>

      {zoomable && (
        <Dialog open={isZoomed} onOpenChange={setIsZoomed}>
          <DialogContent className="max-w-4xl p-2">
            <img
              src={src}
              alt={alt}
              className="w-full h-auto max-h-[90vh] object-contain"
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};
