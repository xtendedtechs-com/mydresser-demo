import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark, 
  MoreHorizontal,
  User,
  Calendar,
  MapPin,
  Star,
  TrendingUp
} from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { toast } from 'sonner';

interface SocialFeedCardProps {
  post: {
    id: string;
    user: {
      id: string;
      name: string;
      avatar?: string;
      role?: string;
    };
    content: {
      type: 'outfit' | 'item' | 'style_tip';
      title: string;
      description?: string;
      images: string[];
      tags?: string[];
    };
    engagement: {
      likes: number;
      comments: number;
      shares: number;
    };
    metadata: {
      createdAt: string;
      location?: string;
    };
  };
}

export const SocialFeedCard = ({ post }: SocialFeedCardProps) => {
  const { user } = useProfile();
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [likes, setLikes] = useState(post.engagement.likes);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikes(prev => isLiked ? prev - 1 : prev + 1);
    toast.success(isLiked ? 'Removed from likes' : 'Added to likes');
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
    toast.success(isSaved ? 'Removed from saved' : 'Saved to collection');
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
  };

  const handleComment = () => {
    toast.info('Comments feature coming soon!');
  };

  const getContentIcon = () => {
    switch (post.content.type) {
      case 'outfit': return '👗';
      case 'item': return '👕';
      case 'style_tip': return '💡';
      default: return '📸';
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={post.user.avatar} />
              <AvatarFallback>
                {post.user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center space-x-2">
                <p className="font-medium text-sm">{post.user.name}</p>
                {post.user.role === 'professional' && (
                  <Badge variant="secondary" className="text-xs">
                    <Star className="w-3 h-3 mr-1" />
                    Pro
                  </Badge>
                )}
                {post.user.role === 'merchant' && (
                  <Badge variant="outline" className="text-xs">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Shop
                  </Badge>
                )}
              </div>
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <Calendar className="w-3 h-3" />
                <span>{new Date(post.metadata.createdAt).toLocaleDateString()}</span>
                {post.metadata.location && (
                  <>
                    <span>•</span>
                    <MapPin className="w-3 h-3" />
                    <span>{post.metadata.location}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Content Header */}
        <div className="flex items-center space-x-2">
          <span className="text-lg">{getContentIcon()}</span>
          <div>
            <h3 className="font-medium">{post.content.title}</h3>
            {post.content.description && (
              <p className="text-sm text-muted-foreground">{post.content.description}</p>
            )}
          </div>
        </div>

        {/* Images */}
        <div className="grid grid-cols-2 gap-2 rounded-lg overflow-hidden">
          {post.content.images.slice(0, 4).map((image, index) => (
            <div key={index} className="relative aspect-square">
              <img 
                src={image} 
                alt={`${post.content.title} ${index + 1}`}
                className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
              />
              {index === 3 && post.content.images.length > 4 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-medium">
                  +{post.content.images.length - 4} more
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Tags */}
        {post.content.tags && (
          <div className="flex flex-wrap gap-2">
            {post.content.tags.slice(0, 3).map(tag => (
              <Badge key={tag} variant="outline" className="text-xs">
                #{tag}
              </Badge>
            ))}
            {post.content.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{post.content.tags.length - 3} more
              </Badge>
            )}
          </div>
        )}

        <Separator />

        {/* Engagement Stats */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{likes} likes</span>
          <span>{post.engagement.comments} comments</span>
          <span>{post.engagement.shares} shares</span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={isLiked ? 'text-red-500' : ''}
            >
              <Heart className={`w-4 h-4 mr-2 ${isLiked ? 'fill-current' : ''}`} />
              Like
            </Button>
            
            <Button variant="ghost" size="sm" onClick={handleComment}>
              <MessageCircle className="w-4 h-4 mr-2" />
              Comment
            </Button>
            
            <Button variant="ghost" size="sm" onClick={handleShare}>
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleSave}
            className={isSaved ? 'text-primary' : ''}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
          </Button>
        </div>

        {/* Quick Actions for Professionals */}
        {post.user.role === 'professional' && (
          <Card className="bg-muted/50">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <p className="font-medium">Get this look</p>
                  <p className="text-muted-foreground">Book a styling session</p>
                </div>
                <Button size="sm">
                  Book Now
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions for Merchants */}
        {post.user.role === 'merchant' && (
          <Card className="bg-primary/5">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <p className="font-medium">Shop similar items</p>
                  <p className="text-muted-foreground">Available in store</p>
                </div>
                <Button size="sm" variant="outline">
                  Shop Now
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
};