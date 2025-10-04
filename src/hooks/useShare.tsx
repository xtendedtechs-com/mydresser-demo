import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';
import { useToast } from '@/hooks/use-toast';

export interface ShareOptions {
  title: string;
  text: string;
  url?: string;
  files?: string[];
}

export const useShare = () => {
  const { toast } = useToast();
  const isAvailable = Capacitor.isNativePlatform();

  const canShare = async (): Promise<boolean> => {
    try {
      const result = await Share.canShare();
      return result.value;
    } catch (error) {
      console.error('[Share] Can share check failed:', error);
      return false;
    }
  };

  const shareContent = async (options: ShareOptions): Promise<boolean> => {
    try {
      if (!isAvailable) {
        // Fallback to Web Share API
        if (navigator.share) {
          await navigator.share({
            title: options.title,
            text: options.text,
            url: options.url,
          });
          return true;
        } else {
          // Fallback: copy to clipboard
          await navigator.clipboard.writeText(
            `${options.title}\n${options.text}\n${options.url || ''}`
          );
          toast({
            title: 'Copied to Clipboard',
            description: 'Content copied. You can now paste it anywhere.',
          });
          return true;
        }
      }

      await Share.share({
        title: options.title,
        text: options.text,
        url: options.url,
        dialogTitle: 'Share via',
      });

      return true;
    } catch (error: any) {
      console.error('[Share] Share failed:', error);
      
      // User cancelled share dialog
      if (error.message && error.message.includes('cancel')) {
        return false;
      }

      toast({
        title: 'Share Failed',
        description: 'Could not share content. Please try again.',
        variant: 'destructive',
      });
      
      return false;
    }
  };

  const shareOutfit = async (outfitId: string, outfitName: string, imageUrl?: string) => {
    const appUrl = window.location.origin;
    const outfitUrl = `${appUrl}/outfits/${outfitId}`;

    return shareContent({
      title: `Check out this outfit: ${outfitName}`,
      text: `I created this amazing outfit on MyDresser! 👔✨`,
      url: outfitUrl,
    });
  };

  const shareWardrobeItem = async (itemId: string, itemName: string) => {
    const appUrl = window.location.origin;
    const itemUrl = `${appUrl}/wardrobe/${itemId}`;

    return shareContent({
      title: itemName,
      text: `Check out this item from my wardrobe on MyDresser!`,
      url: itemUrl,
    });
  };

  const shareMerchantPage = async (merchantId: string, businessName: string) => {
    const appUrl = window.location.origin;
    const merchantUrl = `${appUrl}/merchant/${merchantId}`;

    return shareContent({
      title: businessName,
      text: `Discover ${businessName} on MyDresser!`,
      url: merchantUrl,
    });
  };

  return {
    canShare,
    shareContent,
    shareOutfit,
    shareWardrobeItem,
    shareMerchantPage,
    isAvailable,
  };
};
