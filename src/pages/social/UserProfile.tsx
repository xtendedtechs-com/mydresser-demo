import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Link as LinkIcon, Calendar, UserPlus, UserMinus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function UserProfile() {
  const { userId } = useParams();
  const [profile, setProfile] = useState<any>(null);
  const [socialProfile, setSocialProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (userId) {
      loadProfile();
      loadPosts();
      checkFollowStatus();
    }
  }, [userId]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      
      // Load basic profile
      const { data: profileData, error: profileError } = await (supabase as any)
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      // Load social profile
      const { data: socialData } = await (supabase as any)
        .from('social_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      setSocialProfile(socialData);
    } catch (error: any) {
      toast({
        title: "Error loading profile",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadPosts = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('social_posts')
        .select('*')
        .eq('user_id', userId)
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error: any) {
      console.error('Error loading posts:', error);
    }
  };

  const checkFollowStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await (supabase as any)
        .from('user_follows')
        .select('id')
        .eq('follower_id', user.id)
        .eq('following_id', userId)
        .single();

      setIsFollowing(!!data);
    } catch (error) {
      // Not following
    }
  };

  const handleFollow = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Please sign in",
          description: "You need to be signed in to follow users",
          variant: "destructive"
        });
        return;
      }

      if (isFollowing) {
        await (supabase as any)
          .from('user_follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', userId);
        setIsFollowing(false);
        toast({ title: "Unfollowed" });
      } else {
        await (supabase as any)
          .from('user_follows')
          .insert({
            follower_id: user.id,
            following_id: userId
          });
        setIsFollowing(true);
        toast({ title: "Following!" });
      }

      loadProfile();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6">
            <Avatar className="w-32 h-32">
              <AvatarImage src={profile?.avatar_url} />
              <AvatarFallback className="text-4xl">
                {profile?.full_name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold">{profile?.full_name || 'User'}</h1>
                  {socialProfile?.verified && (
                    <Badge variant="secondary" className="mt-1">Verified</Badge>
                  )}
                </div>
                <Button 
                  onClick={handleFollow}
                  variant={isFollowing ? 'outline' : 'default'}
                >
                  {isFollowing ? (
                    <>
                      <UserMinus className="w-4 h-4 mr-2" />
                      Unfollow
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Follow
                    </>
                  )}
                </Button>
              </div>

              <div className="flex gap-6 mb-4">
                <div className="text-center">
                  <div className="font-bold text-lg">{socialProfile?.post_count || 0}</div>
                  <div className="text-sm text-muted-foreground">Posts</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-lg">{socialProfile?.follower_count || 0}</div>
                  <div className="text-sm text-muted-foreground">Followers</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-lg">{socialProfile?.following_count || 0}</div>
                  <div className="text-sm text-muted-foreground">Following</div>
                </div>
              </div>

              {socialProfile?.bio && (
                <p className="text-sm mb-4">{socialProfile.bio}</p>
              )}

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                {socialProfile?.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {socialProfile.location}
                  </div>
                )}
                {socialProfile?.website && (
                  <a 
                    href={socialProfile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:underline"
                  >
                    <LinkIcon className="w-4 h-4" />
                    Website
                  </a>
                )}
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Joined {new Date(profile?.created_at).toLocaleDateString()}
                </div>
              </div>

              {socialProfile?.style_tags && socialProfile.style_tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {socialProfile.style_tags.map((tag: string, idx: number) => (
                    <Badge key={idx} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="posts">
        <TabsList>
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="outfits">Outfits</TabsTrigger>
          <TabsTrigger value="saved">Saved</TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {posts.length === 0 ? (
              <div className="col-span-3 text-center py-12 text-muted-foreground">
                No posts yet
              </div>
            ) : (
              posts.map(post => (
                <Card key={post.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardContent className="p-0">
                    {post.images && post.images.length > 0 ? (
                      <img
                        src={post.images[0]}
                        alt={post.title || 'Post'}
                        className="w-full aspect-square object-cover"
                      />
                    ) : (
                      <div className="w-full aspect-square bg-muted flex items-center justify-center">
                        <p className="text-sm text-muted-foreground p-4 text-center">
                          {post.caption?.substring(0, 100)}...
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}