import { Button } from '@/components/ui/button';
import { Share2 } from 'lucide-react';
import { useShare } from '@/hooks/useShare';
import { useHaptics } from '@/hooks/useHaptics';

interface ShareButtonProps {
  title: string;
  text: string;
  url?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export const ShareButton = ({
  title,
  text,
  url,
  variant = 'outline',
  size = 'sm',
  className = '',
}: ShareButtonProps) => {
  const { shareContent } = useShare();
  const { impact, notification } = useHaptics();

  const handleShare = async () => {
    await impact('light');
    
    const success = await shareContent({ title, text, url });
    
    if (success) {
      await notification('success');
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleShare}
      className={className}
    >
      <Share2 className="w-4 h-4 mr-2" />
      Share
    </Button>
  );
};
