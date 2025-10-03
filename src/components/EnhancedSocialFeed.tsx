import { useState, useEffect } from 'react';
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, TrendingUp, Users } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Post {
  id: string;
  user_id: string;
  content: string;
  images: string[];
  outfit_items: string[];
  likes_count: number;
  comments_count: number;
  created_at: string;
  user?: {
    full_name: string;
    avatar_url: string;
  };
}

interface TrendingStyle {
  name: string;
  count: number;
  growth: number;
}

export const EnhancedSocialFeed = () => {
  const { toast } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [savedPosts, setSavedPosts] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('following');

  const trendingStyles: TrendingStyle[] = [
    { name: 'Minimalist', count: 2847, growth: 12 },
    { name: 'Y2K', count: 1892, growth: 24 },
    { name: 'Cottagecore', count: 1547, growth: 8 },
    { name: 'Street Style', count: 3241, growth: 15 },
  ];

  useEffect(() => {
    fetchPosts();
  }, [activeTab]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('social_posts')
        .select(`
          *,
          profiles:user_id (
            full_name,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      setPosts(data?.map(post => ({
        ...post,
        user: Array.isArray(post.profiles) ? post.profiles[0] : post.profiles
      })) || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({
        title: 'Error loading feed',
        description: 'Could not load social feed',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      const isLiked = likedPosts.has(postId);
      
      if (isLiked) {
        // Unlike
        const { error } = await supabase
          .from('reactions')
          .delete()
          .eq('target_id', postId)
          .eq('target_type', 'post');

        if (error) throw error;

        setLikedPosts(prev => {
          const next = new Set(prev);
          next.delete(postId);
          return next;
        });

        // Update local post likes count
        setPosts(prev => prev.map(p => 
          p.id === postId ? { ...p, likes_count: p.likes_count - 1 } : p
        ));
      } else {
        // Like
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { error } = await supabase
          .from('reactions')
          .insert({
            user_id: user.id,
            target_id: postId,
            target_type: 'post',
            reaction_type: 'like'
          });

        if (error) throw error;

        setLikedPosts(prev => new Set(prev).add(postId));

        setPosts(prev => prev.map(p => 
          p.id === postId ? { ...p, likes_count: p.likes_count + 1 } : p
        ));
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleSave = (postId: string) => {
    setSavedPosts(prev => {
      const next = new Set(prev);
      if (next.has(postId)) {
        next.delete(postId);
        toast({ title: 'Removed from saved' });
      } else {
        next.add(postId);
        toast({ title: 'Saved to collection' });
      }
      return next;
    });
  };

  const handleShare = (post: Post) => {
    if (navigator.share) {
      navigator.share({
        title: `Post by ${post.user?.full_name || 'User'}`,
        text: post.content,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({ title: 'Link copied to clipboard' });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Trending Styles */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            <h3 className="font-semibold">Trending Styles</h3>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {trendingStyles.map((style) => (
              <button
                key={style.name}
                className="p-3 text-left rounded-lg border hover:border-primary transition-colors"
              >
                <p className="font-medium text-sm">{style.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground">{style.count.toLocaleString()}</span>
                  <Badge variant="outline" className="text-xs bg-green-50">
                    +{style.growth}%
                  </Badge>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Feed Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="following">
            <Users className="h-4 w-4 mr-2" />
            Following
          </TabsTrigger>
          <TabsTrigger value="discover">
            <TrendingUp className="h-4 w-4 mr-2" />
            Discover
          </TabsTrigger>
          <TabsTrigger value="saved">
            <Bookmark className="h-4 w-4 mr-2" />
            Saved
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4 mt-6">
          {loading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading posts...</p>
            </div>
          ) : posts.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">No posts to show</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Follow users to see their style posts here
                </p>
              </CardContent>
            </Card>
          ) : (
            posts.map((post) => (
              <Card key={post.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={post.user?.avatar_url} />
                        <AvatarFallback>
                          {post.user?.full_name?.[0] || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-sm">
                          {post.user?.full_name || 'Anonymous'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(post.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm">{post.content}</p>
                  
                  {post.images && post.images.length > 0 && (
                    <div className="grid grid-cols-2 gap-2">
                      {post.images.slice(0, 4).map((img, idx) => (
                        <div key={idx} className="aspect-square rounded-lg overflow-hidden bg-muted">
                          <img src={img} alt="" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleLike(post.id)}
                        className={likedPosts.has(post.id) ? 'text-red-500' : ''}
                      >
                        <Heart className="h-4 w-4 mr-1" fill={likedPosts.has(post.id) ? 'currentColor' : 'none'} />
                        {post.likes_count}
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MessageCircle className="h-4 w-4 mr-1" />
                        {post.comments_count}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleShare(post)}>
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSave(post.id)}
                      className={savedPosts.has(post.id) ? 'text-primary' : ''}
                    >
                      <Bookmark className="h-4 w-4" fill={savedPosts.has(post.id) ? 'currentColor' : 'none'} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
