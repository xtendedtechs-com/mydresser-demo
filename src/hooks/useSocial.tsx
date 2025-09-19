import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from './useProfile';
import { toast } from 'sonner';

export interface UserFollow {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
}

export interface Reaction {
  id: string;
  user_id: string;
  target_id: string;
  target_type: string;
  reaction_type: string;
  created_at: string;
}

export interface SocialProfile {
  id: string;
  user_id: string;
  full_name: string;
  avatar_url: string;
  role: string;
  bio: string;
  style_score: number;
  created_at: string;
  followers_count?: number;
  following_count?: number;
  is_following?: boolean;
}

export const useSocial = () => {
  const { user } = useProfile();
  const [followers, setFollowers] = useState<string[]>([]);
  const [following, setFollowing] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchSocialData();
    }
  }, [user]);

  const fetchSocialData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Fetch followers
      const { data: followersData, error: followersError } = await supabase
        .from('user_follows')
        .select('follower_id')
        .eq('following_id', user.id);

      // Fetch following
      const { data: followingData, error: followingError } = await supabase
        .from('user_follows')
        .select('following_id')
        .eq('follower_id', user.id);

      if (followersError) throw followersError;
      if (followingError) throw followingError;

      setFollowers(followersData?.map(f => f.follower_id) || []);
      setFollowing(followingData?.map(f => f.following_id) || []);
    } catch (error: any) {
      console.error('Error fetching social data:', error);
      toast.error('Failed to load social data');
    } finally {
      setLoading(false);
    }
  };

  const followUser = async (targetUserId: string) => {
    if (!user) {
      toast.error('Please sign in to follow users');
      return false;
    }

    try {
      const { error } = await supabase
        .from('user_follows')
        .insert({
          follower_id: user.id,
          following_id: targetUserId
        });

      if (error) throw error;

      setFollowing(prev => [...prev, targetUserId]);
      toast.success('User followed successfully');
      return true;
    } catch (error: any) {
      console.error('Error following user:', error);
      toast.error('Failed to follow user');
      return false;
    }
  };

  const unfollowUser = async (targetUserId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('user_follows')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', targetUserId);

      if (error) throw error;

      setFollowing(prev => prev.filter(id => id !== targetUserId));
      toast.success('User unfollowed');
      return true;
    } catch (error: any) {
      console.error('Error unfollowing user:', error);
      toast.error('Failed to unfollow user');
      return false;
    }
  };

  const isFollowing = (targetUserId: string) => {
    return following.includes(targetUserId);
  };

  const addReaction = async (targetId: string, targetType: string, reactionType: string = 'like') => {
    if (!user) {
      toast.error('Please sign in to react');
      return false;
    }

    try {
      const { error } = await supabase
        .from('reactions')
        .insert({
          user_id: user.id,
          target_id: targetId,
          target_type: targetType,
          reaction_type: reactionType
        });

      if (error) throw error;
      return true;
    } catch (error: any) {
      console.error('Error adding reaction:', error);
      toast.error('Failed to add reaction');
      return false;
    }
  };

  const removeReaction = async (targetId: string, targetType: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('reactions')
        .delete()
        .eq('user_id', user.id)
        .eq('target_id', targetId)
        .eq('target_type', targetType);

      if (error) throw error;
      return true;
    } catch (error: any) {
      console.error('Error removing reaction:', error);
      toast.error('Failed to remove reaction');
      return false;
    }
  };

  const getReactions = async (targetId: string, targetType: string = 'outfit'): Promise<Reaction[]> => {
    try {
      const { data, error } = await supabase
        .from('reactions')
        .select('*')
        .eq('target_id', targetId)
        .eq('target_type', targetType);

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('Error fetching reactions:', error);
      return [];
    }
  };

  return {
    followers,
    following,
    loading,
    followUser,
    unfollowUser,
    isFollowing,
    addReaction,
    removeReaction,
    getReactions,
    refreshSocialData: fetchSocialData
  };
};