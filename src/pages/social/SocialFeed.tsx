import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Heart, MessageCircle, Share2, Bookmark, Users, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export default function SocialFeed() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('following');
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadPosts();
  }, [activeTab]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      let query = (supabase as any)
        .from('social_posts')
        .select(`
          *,
          profiles:user_id (
            user_id,
            full_name,
            avatar_url
          ),
          post_reactions (
            reaction_type,
            user_id
          )
        `)
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(20);

      if (activeTab === 'following' && user) {
        // Get posts from users the current user follows
        const { data: following } = await (supabase as any)
          .from('user_follows')
          .select('following_id')
          .eq('follower_id', user.id);
        
        const followingIds = following?.map((f: any) => f.following_id) || [];
        if (followingIds.length > 0) {
          query = query.in('user_id', followingIds);
        }
      }

      const { data, error } = await query;
      if (error) throw error;
      
      setPosts(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading feed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReaction = async (postId: string, reactionType: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Please sign in",
          description: "You need to be signed in to react to posts",
          variant: "destructive"
        });
        return;
      }

      const { error } = await (supabase as any)
        .from('post_reactions')
        .insert({
          user_id: user.id,
          target_type: 'social_post',
          target_id: postId,
          reaction_type: reactionType
        });

      if (error) {
        if (error.code === '23505') {
          // Already reacted, remove reaction
          await (supabase as any)
            .from('post_reactions')
            .delete()
            .eq('user_id', user.id)
            .eq('target_id', postId)
            .eq('reaction_type', reactionType);
        } else {
          throw error;
        }
      }

      loadPosts();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const PostCard = ({ post }: { post: any }) => {
    const hasLiked = post.post_reactions?.some((r: any) => 
      r.reaction_type === 'like' && r.user_id === post.user_id
    );

    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <Avatar className="cursor-pointer" onClick={() => navigate(`/profile/${post.user_id}`)}>
              <AvatarImage src={post.profiles?.avatar_url} />
              <AvatarFallback>
                {post.profiles?.full_name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-semibold text-sm cursor-pointer hover:underline" 
                  onClick={() => navigate(`/profile/${post.user_id}`)}>
                {post.profiles?.full_name || 'Anonymous'}
              </h3>
              <p className="text-xs text-muted-foreground">
                {new Date(post.created_at).toLocaleDateString()}
              </p>
            </div>
            <Badge variant="outline">{post.post_type}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {post.title && (
            <h4 className="font-semibold">{post.title}</h4>
          )}
          <p className="text-sm">{post.caption}</p>
          
          {post.images && Array.isArray(post.images) && post.images.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {post.images.slice(0, 4).map((img: string, idx: number) => (
                <img
                  key={idx}
                  src={img}
                  alt={`Post image ${idx + 1}`}
                  className="w-full aspect-square object-cover rounded-lg"
                />
              ))}
            </div>
          )}

          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {post.tags.map((tag: string, idx: number) => (
                <Badge key={idx} variant="secondary" className="text-xs">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}

          <div className="flex items-center gap-4 pt-2 border-t">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleReaction(post.id, 'like')}
              className={hasLiked ? 'text-red-500' : ''}
            >
              <Heart className={`w-4 h-4 mr-1 ${hasLiked ? 'fill-current' : ''}`} />
              {post.like_count || 0}
            </Button>
            <Button variant="ghost" size="sm">
              <MessageCircle className="w-4 h-4 mr-1" />
              {post.comment_count || 0}
            </Button>
            <Button variant="ghost" size="sm">
              <Share2 className="w-4 h-4 mr-1" />
              {post.share_count || 0}
            </Button>
            <Button variant="ghost" size="sm" className="ml-auto">
              <Bookmark className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Style Community</h1>
        <Button onClick={() => navigate('/social/create-post')}>
          Create Post
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="following">
            <Users className="w-4 h-4 mr-2" />
            Following
          </TabsTrigger>
          <TabsTrigger value="discover">
            <TrendingUp className="w-4 h-4 mr-2" />
            Discover
          </TabsTrigger>
          <TabsTrigger value="trending">
            <TrendingUp className="w-4 h-4 mr-2" />
            Trending
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-6 mt-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : posts.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  {activeTab === 'following' 
                    ? 'Follow some users to see their posts here!' 
                    : 'No posts found'}
                </p>
              </CardContent>
            </Card>
          ) : (
            posts.map(post => <PostCard key={post.id} post={post} />)
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}