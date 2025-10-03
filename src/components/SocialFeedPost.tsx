import { useState } from 'react';
import { Heart, MessageCircle, Share2, MoreVertical } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';

interface SocialPost {
  id: string;
  user_id: string;
  content: string;
  images: string[];
  outfit_items: string[];
  likes_count: number;
  comments_count: number;
  created_at: string;
  profiles?: {
    full_name: string;
    avatar_url: string;
  };
}

interface SocialFeedPostProps {
  post: SocialPost;
  onLike?: () => void;
  onComment?: () => void;
}

export const SocialFeedPost = ({ post, onLike, onComment }: SocialFeedPostProps) => {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes_count);
  const { toast } = useToast();

  const handleLike = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: 'Login Required',
          description: 'Please log in to like posts',
          variant: 'destructive'
        });
        return;
      }

      if (liked) {
        // Unlike
        await supabase
          .from('reactions')
          .delete()
          .eq('user_id', user.id)
          .eq('target_id', post.id)
          .eq('target_type', 'social_post');
        
        setLikesCount(prev => prev - 1);
        setLiked(false);
      } else {
        // Like
        await supabase
          .from('reactions')
          .insert({
            user_id: user.id,
            target_id: post.id,
            target_type: 'social_post',
            reaction_type: 'like'
          });

        setLikesCount(prev => prev + 1);
        setLiked(true);
      }

      if (onLike) onLike();
    } catch (error) {
      console.error('Like error:', error);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.origin + '/post/' + post.id);
    toast({
      title: 'Link Copied',
      description: 'Post link copied to clipboard'
    });
  };

  return (
    <Card className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={post.profiles?.avatar_url} />
            <AvatarFallback>
              {post.profiles?.full_name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold">{post.profiles?.full_name || 'User'}</p>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="icon">
          <MoreVertical className="w-4 h-4" />
        </Button>
      </div>

      {/* Content */}
      <p className="mb-4 whitespace-pre-wrap">{post.content}</p>

      {/* Images */}
      {post.images && post.images.length > 0 && (
        <div className={`grid gap-2 mb-4 ${
          post.images.length === 1 ? 'grid-cols-1' :
          post.images.length === 2 ? 'grid-cols-2' :
          'grid-cols-2'
        }`}>
          {post.images.slice(0, 4).map((img, idx) => (
            <div key={idx} className="relative aspect-square overflow-hidden rounded-lg">
              <img
                src={img}
                alt={`Post image ${idx + 1}`}
                className="w-full h-full object-cover"
              />
              {idx === 3 && post.images.length > 4 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-lg font-bold">
                  +{post.images.length - 4}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-6 pt-4 border-t border-border">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLike}
          className={liked ? 'text-red-500' : ''}
        >
          <Heart className={`w-5 h-5 mr-2 ${liked ? 'fill-current' : ''}`} />
          {likesCount}
        </Button>
        <Button variant="ghost" size="sm" onClick={onComment}>
          <MessageCircle className="w-5 h-5 mr-2" />
          {post.comments_count}
        </Button>
        <Button variant="ghost" size="sm" onClick={handleShare}>
          <Share2 className="w-5 h-5 mr-2" />
          Share
        </Button>
      </div>
    </Card>
  );
};
