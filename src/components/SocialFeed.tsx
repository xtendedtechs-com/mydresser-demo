import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Users, 
  TrendingUp,
  Sparkles,
  Clock,
  User
} from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { useSocial } from '@/hooks/useSocial';
import ReactionButton from '@/components/ReactionButton';
import { toast } from 'sonner';

interface OutfitPost {
  id: string;
  user_id: string;
  user: {
    full_name: string;
    avatar_url: string;
  };
  caption: string;
  outfit_image: string;
  items: string[];
  occasion: string;
  created_at: string;
  likes_count: number;
  comments_count: number;
  user_has_liked: boolean;
}

export const SocialFeed = () => {
  const { profile, user } = useProfile();
  const { 
    posts: socialPosts, 
    following, 
    followers, 
    followUser, 
    unfollowUser, 
    isFollowing, 
    likePost, 
    loading: socialLoading,
    createPost
  } = useSocial();
  const [activeTab, setActiveTab] = useState('feed');
  const [posts, setPosts] = useState<OutfitPost[]>([]);
  const [loading, setLoading] = useState(true);

  // Use real social posts data
  useEffect(() => {
    if (socialPosts.length > 0) {
      const formattedPosts: OutfitPost[] = socialPosts.map(post => ({
        id: post.id,
        user_id: post.user_id,
        user: post.user_profile,
        caption: post.content,
        outfit_image: post.images[0] || '/placeholder.svg',
        items: post.outfit_items,
        occasion: 'casual', // Default, could be enhanced
        created_at: new Date(post.created_at).toLocaleString(),
        likes_count: post.likes_count,
        comments_count: post.comments_count,
        user_has_liked: post.user_has_liked
      }));
      setPosts(formattedPosts);
    }
    setLoading(socialLoading);
  }, [socialPosts, socialLoading]);

  const handleLike = (postId: string) => {
    likePost(postId);
  };

  const suggestedUsers = [
    { id: '1', name: 'Style Guru', avatar: '/placeholder.svg', followers: 1240 },
    { id: '2', name: 'Fashion Forward', avatar: '/placeholder.svg', followers: 856 },
    { id: '3', name: 'Trendsetter', avatar: '/placeholder.svg', followers: 623 }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-2xl mx-auto space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-10 h-10 bg-muted rounded-full"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded w-24"></div>
                    <div className="h-3 bg-muted rounded w-16"></div>
                  </div>
                </div>
                <div className="h-64 bg-muted rounded-lg mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-full"></div>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border z-10">
          <div className="px-4 py-4">
            <h1 className="text-2xl font-bold mb-4">Fashion Community</h1>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="feed">Feed</TabsTrigger>
              <TabsTrigger value="discover">Discover</TabsTrigger>
              <TabsTrigger value="following">Following</TabsTrigger>
            </TabsList>
          </div>
        </div>

        <TabsContent value="feed" className="px-4 py-6 pb-24">
          <div className="max-w-2xl mx-auto space-y-6">
            {posts.map((post) => (
              <Card key={post.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={post.user.avatar_url} />
                        <AvatarFallback>
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-sm">{post.user.full_name}</p>
                        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{post.created_at}</span>
                          <Badge variant="secondary" className="text-xs">
                            {post.occasion}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="mb-4">
                    <img 
                      src={post.outfit_image} 
                      alt="Outfit"
                      className="w-full h-64 object-cover rounded-lg bg-muted"
                    />
                  </div>
                  
                  <p className="text-sm mb-3">{post.caption}</p>
                  
                  <div className="flex flex-wrap gap-1 mb-4">
                    {post.items.map((item, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {item}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <ReactionButton
                        targetId={post.id}
                        targetType="outfit_post"
                        reactionType="like"
                        showCount={true}
                      />
                      <Button variant="ghost" size="sm" className="text-muted-foreground">
                        <MessageCircle className="h-4 w-4 mr-1" />
                        {post.comments_count}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="discover" className="px-4 py-6 pb-24">
          <div className="max-w-2xl mx-auto space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Trending Now</h3>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                    <p className="text-sm text-muted-foreground">#FallLayers</p>
                  </div>
                  <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                    <p className="text-sm text-muted-foreground">#WorkWear</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Suggested Stylists</h3>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {suggestedUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback>
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{user.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {user.followers} followers
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant={isFollowing(user.id) ? "secondary" : "default"}
                      onClick={() => {
                        if (isFollowing(user.id)) {
                          unfollowUser(user.id);
                        } else {
                          followUser(user.id);
                        }
                      }}
                    >
                      {isFollowing(user.id) ? 'Following' : 'Follow'}
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="following" className="px-4 py-6 pb-24">
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Your Fashion Network</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Following {following.length} • {followers.length} Followers
              </p>
              <Button onClick={() => setActiveTab('discover')}>
                <Sparkles className="h-4 w-4 mr-2" />
                Discover New Stylists
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};