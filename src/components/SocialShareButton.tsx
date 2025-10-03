import { useState } from 'react';
import { Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface SocialShareButtonProps {
  itemId?: string;
  outfitId?: string;
  itemType: 'wardrobe_item' | 'outfit' | 'market_item';
  currentlyPublic?: boolean;
}

export const SocialShareButton = ({
  itemId,
  outfitId,
  itemType,
  currentlyPublic = false,
}: SocialShareButtonProps) => {
  const [open, setOpen] = useState(false);
  const [isPublic, setIsPublic] = useState(currentlyPublic);
  const [caption, setCaption] = useState('');
  const [isSharing, setIsSharing] = useState(false);
  const { toast } = useToast();

  const handleShare = async () => {
    setIsSharing(true);
    try {
      const targetId = itemType === 'outfit' ? outfitId : itemId;
      
      if (!targetId) {
        throw new Error('No item to share');
      }

      // Update visibility
      let table = 'wardrobe_items';
      if (itemType === 'outfit') table = 'outfits';
      if (itemType === 'market_item') table = 'market_items';

      const { error: updateError } = await supabase
        .from(table as any)
        .update({ is_public: isPublic })
        .eq('id', targetId);

      if (updateError) throw updateError;

      // Create social post
      if (isPublic && caption) {
        const { error: postError } = await supabase
          .from('social_posts' as any)
          .insert({
            user_id: (await supabase.auth.getUser()).data.user?.id,
            content: caption,
            post_type: itemType,
            item_id: targetId,
            outfit_id: itemType === 'outfit' ? outfitId : null,
          });

        if (postError) throw postError;
      }

      toast({
        title: 'Success!',
        description: isPublic ? 'Shared to your profile' : 'Made private',
      });

      setOpen(false);
      setCaption('');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share to Social Feed</DialogTitle>
          <DialogDescription>
            Make this visible on your public profile and social feed
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="public">Make Public</Label>
            <Switch
              id="public"
              checked={isPublic}
              onCheckedChange={setIsPublic}
            />
          </div>

          {isPublic && (
            <div className="space-y-2">
              <Label htmlFor="caption">Caption (Optional)</Label>
              <Textarea
                id="caption"
                placeholder="Share your style story..."
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                rows={3}
              />
            </div>
          )}

          <Button
            onClick={handleShare}
            disabled={isSharing}
            className="w-full"
          >
            {isSharing ? 'Sharing...' : isPublic ? 'Share' : 'Make Private'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
