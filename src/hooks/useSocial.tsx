import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from '@/hooks/useProfile';
import { useToast } from '@/hooks/use-toast';

export interface Reaction {
  id: string;
  user_id: string;
  target_id: string;
  target_type: string;
  reaction_type: string;
  created_at: string;
}

export interface SocialPost {
  id: string;
  user_id: string;
  content: string;
  images: string[];
  outfit_items: string[];
  likes_count: number;
  comments_count: number;
  created_at: string;
  user_profile: {
    full_name: string;
    avatar_url: string;
  };
  user_has_liked: boolean;
}

export const useSocial = () => {
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [following, setFollowing] = useState<string[]>([]);
  const [followers, setFollowers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useProfile();
  const { toast } = useToast();

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('social_posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      // Get user profiles separately to avoid join issues
      const userIds = [...new Set((data || []).map(post => post.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url')
        .in('user_id', userIds);

      const profileMap = new Map();
      (profiles || []).forEach(profile => {
        profileMap.set(profile.user_id, profile);
      });

      const formattedPosts: SocialPost[] = (data || []).map(post => {
        const profile = profileMap.get(post.user_id);
        
        return {
          id: post.id,
          user_id: post.user_id,
          content: post.content,
          images: Array.isArray(post.images) ? post.images : [],
          outfit_items: Array.isArray(post.outfit_items) ? post.outfit_items : [],
          likes_count: post.likes_count || 0,
          comments_count: post.comments_count || 0,
          created_at: post.created_at,
          user_profile: {
            full_name: profile?.full_name || 'Anonymous',
            avatar_url: profile?.avatar_url || '/placeholder.svg'
          },
          user_has_liked: false // We'll implement this with reactions table later
        };
      });

      setPosts(formattedPosts);
    } catch (error: any) {
      console.error('Error fetching posts:', error);
      toast({
        title: "Error loading posts",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchFollowData = async () => {
    if (!user?.id) return;

    try {
      // Get following
      const { data: followingData } = await supabase
        .from('user_follows')
        .select('following_id')
        .eq('follower_id', user.id);

      // Get followers
      const { data: followersData } = await supabase
        .from('user_follows')
        .select('follower_id')
        .eq('following_id', user.id);

      setFollowing(followingData?.map(f => f.following_id) || []);
      setFollowers(followersData?.map(f => f.follower_id) || []);
    } catch (error) {
      console.error('Error fetching follow data:', error);
    }
  };

  const createPost = async (content: string, images: string[] = [], outfitItems: string[] = []) => {
    if (!user?.id) return null;

    try {
      const { data, error } = await supabase
        .from('social_posts')
        .insert({
          user_id: user.id,
          content,
          images,
          outfit_items: outfitItems
        })
        .select('*')
        .single();

      if (error) throw error;

      // Get user profile separately
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('user_id', user.id)
        .single();

      const newPost: SocialPost = {
        id: data.id,
        user_id: data.user_id,
        content: data.content,
        images: Array.isArray(data.images) ? data.images : [],
        outfit_items: Array.isArray(data.outfit_items) ? data.outfit_items : [],
        likes_count: 0,
        comments_count: 0,
        created_at: data.created_at,
        user_profile: {
          full_name: profile?.full_name || 'You',
          avatar_url: profile?.avatar_url || '/placeholder.svg'
        },
        user_has_liked: false
      };

      setPosts(prev => [newPost, ...prev]);
      toast({
        title: "Success",
        description: "Post created successfully"
      });

      return newPost;
    } catch (error: any) {
      console.error('Error creating post:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
      return null;
    }
  };

  const likePost = async (postId: string) => {
    if (!user?.id) return;

    try {
      const post = posts.find(p => p.id === postId);
      if (!post) return;

      if (post.user_has_liked) {
        // Unlike: remove reaction and decrement count
        await supabase
          .from('reactions')
          .delete()
          .eq('user_id', user.id)
          .eq('target_id', postId)
          .eq('target_type', 'social_post');

        await supabase
          .from('social_posts')
          .update({ likes_count: Math.max(0, post.likes_count - 1) })
          .eq('id', postId);

        setPosts(prev => prev.map(p => 
          p.id === postId 
            ? { ...p, user_has_liked: false, likes_count: Math.max(0, p.likes_count - 1) }
            : p
        ));
      } else {
        // Like: add reaction and increment count
        await supabase
          .from('reactions')
          .insert({
            user_id: user.id,
            target_id: postId,
            target_type: 'social_post',
            reaction_type: 'like'
          });

        await supabase
          .from('social_posts')
          .update({ likes_count: post.likes_count + 1 })
          .eq('id', postId);

        setPosts(prev => prev.map(p => 
          p.id === postId 
            ? { ...p, user_has_liked: true, likes_count: p.likes_count + 1 }
            : p
        ));
      }
    } catch (error: any) {
      console.error('Error liking post:', error);
      toast({
        title: "Error",
        description: "Failed to update like",
        variant: "destructive"
      });
    }
  };

  const followUser = async (userId: string): Promise<boolean> => {
    if (!user?.id || userId === user.id) return false;

    try {
      const { error } = await supabase
        .from('user_follows')
        .insert([{
          follower_id: user.id,
          following_id: userId
        }]);

      if (error) {
        console.error('Error following user:', error);
        return false;
      }

      await fetchFollowData();
      toast({
        title: "Success",
        description: "Now following user"
      });
      return true;
    } catch (error) {
      console.error('Error in followUser:', error);
      return false;
    }
  };

  const unfollowUser = async (userId: string): Promise<boolean> => {
    if (!user?.id) return false;

    try {
      const { error } = await supabase
        .from('user_follows')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', userId);

      if (error) {
        console.error('Error unfollowing user:', error);
        return false;
      }

      await fetchFollowData();
      toast({
        title: "Success",
        description: "Unfollowed user"
      });
      return true;
    } catch (error) {
      console.error('Error in unfollowUser:', error);
      return false;
    }
  };

  const isFollowing = (userId: string) => {
    return following.includes(userId);
  };

  const refreshSocialData = async () => {
    await Promise.all([fetchPosts(), fetchFollowData()]);
  };

  useEffect(() => {
    fetchPosts();
    if (user?.id) {
      fetchFollowData();
    }
  }, [user?.id]);

  const addReaction = async (targetId: string, targetType: string, reactionType: string = 'like') => {
    if (!user?.id) return false;

    try {
      await supabase
        .from('reactions')
        .insert([{
          user_id: user.id,
          target_id: targetId,
          target_type: targetType,
          reaction_type: reactionType
        }]);
      return true;
    } catch (error) {
      console.error('Error adding reaction:', error);
      return false;
    }
  };

  const removeReaction = async (targetId: string, targetType: string) => {
    if (!user?.id) return false;

    try {
      await supabase
        .from('reactions')
        .delete()
        .eq('user_id', user.id)
        .eq('target_id', targetId)
        .eq('target_type', targetType);
      return true;
    } catch (error) {
      console.error('Error removing reaction:', error);
      return false;
    }
  };

  const getReactions = async (targetId: string, targetType: string) => {
    try {
      const { data } = await supabase
        .from('reactions')
        .select('*')
        .eq('target_id', targetId)
        .eq('target_type', targetType);
      return data || [];
    } catch (error) {
      console.error('Error getting reactions:', error);
      return [];
    }
  };

  return {
    posts,
    following,
    followers,
    loading,
    followUser,
    unfollowUser,
    isFollowing,
    likePost,
    createPost,
    addReaction,
    removeReaction,
    getReactions,
    refreshSocialData
  };
};