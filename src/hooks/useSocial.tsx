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
  const [followers, setFollowers] = useState<SocialProfile[]>([]);
  const [following, setFollowing] = useState<SocialProfile[]>([]);
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
      // Simple fetch for now - avoiding complex joins
      setFollowers([]);
      setFollowing([]);
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

      toast.success('User followed successfully');
      fetchSocialData();
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

      toast.success('User unfollowed');
      fetchSocialData();
      return true;
    } catch (error: any) {
      console.error('Error unfollowing user:', error);
      toast.error('Failed to unfollow user');
      return false;
    }
  };

  const isFollowing = (targetUserId: string) => {
    return following.some(f => f.user_id === targetUserId);
  };

  const getPublicProfiles = async () => {
    try {
      const { data, error } = await supabase.rpc('get_public_profiles');
      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('Error fetching public profiles:', error);
      return [];
    }
  };

  const getFollowCounts = async (userId: string) => {
    try {
      const [followersRes, followingRes] = await Promise.all([
        supabase
          .from('user_follows')
          .select('id', { count: 'exact', head: true })
          .eq('following_id', userId),
        supabase
          .from('user_follows')
          .select('id', { count: 'exact', head: true })
          .eq('follower_id', userId)
      ]);

      return {
        followers_count: followersRes.count || 0,
        following_count: followingRes.count || 0
      };
    } catch (error: any) {
      console.error('Error fetching follow counts:', error);
      return { followers_count: 0, following_count: 0 };
    }
  };

  const suggestUsers = async (limit = 10) => {
    try {
      // Get users that current user is NOT following
      const { data: publicProfiles, error } = await supabase.rpc('get_public_profiles');
      if (error) throw error;

      // Filter out current user and users already being followed
      const followingIds = following.map(f => f.user_id);
      const suggestions = (publicProfiles || [])
        .filter(profile => 
          profile.user_id !== user?.id && 
          !followingIds.includes(profile.user_id)
        )
        .slice(0, limit);

      return suggestions;
    } catch (error: any) {
      console.error('Error getting user suggestions:', error);
      return [];
    }
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
    getFollowCounts,
    suggestUsers,
    addReaction,
    removeReaction,
    getReactions,
    refreshSocialData: fetchSocialData
  };
};