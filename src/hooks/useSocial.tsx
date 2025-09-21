import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from '@/hooks/useProfile';
import { useToast } from '@/hooks/use-toast';

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
    // Mock data for now since social_posts table doesn't exist yet
    const mockPosts: SocialPost[] = [
      {
        id: '1',
        user_id: 'user1',
        content: 'Perfect autumn look for a coffee date ☕️ #FallFashion #CasualChic',
        images: ['/placeholder.svg'],
        outfit_items: ['Knitted Sweater', 'Dark Jeans', 'Ankle Boots'],
        likes_count: 24,
        comments_count: 3,
        created_at: new Date().toISOString(),
        user_profile: {
          full_name: 'Emma Style',
          avatar_url: '/placeholder.svg'
        },
        user_has_liked: false
      },
      {
        id: '2',
        user_id: 'user2',
        content: 'Business meeting ready! Confidence is the best accessory ✨',
        images: ['/placeholder.svg'],
        outfit_items: ['Blazer', 'White Shirt', 'Trousers', 'Oxfords'],
        likes_count: 42,
        comments_count: 7,
        created_at: new Date(Date.now() - 3600000).toISOString(),
        user_profile: {
          full_name: 'Alex Fashion',
          avatar_url: '/placeholder.svg'
        },
        user_has_liked: true
      }
    ];

    setPosts(mockPosts);
    setLoading(false);
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

    // Mock implementation for now
    const newPost: SocialPost = {
      id: Date.now().toString(),
      user_id: user.id,
      content,
      images,
      outfit_items: outfitItems,
      likes_count: 0,
      comments_count: 0,
      created_at: new Date().toISOString(),
      user_profile: {
        full_name: 'You',
        avatar_url: '/placeholder.svg'
      },
      user_has_liked: false
    };

    setPosts(prev => [newPost, ...prev]);
    toast({
      title: "Success",
      description: "Post created successfully"
    });

    return newPost;
  };

  const likePost = async (postId: string) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? {
            ...post,
            user_has_liked: !post.user_has_liked,
            likes_count: post.user_has_liked 
              ? post.likes_count - 1 
              : post.likes_count + 1
          }
        : post
    ));
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