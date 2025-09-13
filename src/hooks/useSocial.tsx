import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface UserFollow {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
}

export interface Emote {
  id: string;
  name: string;
  emoji: string;
  category: string;
  is_premium: boolean;
}

export interface Reaction {
  id: string;
  user_id: string;
  target_type: string;
  target_id: string;
  emote_id?: string;
  reaction_type: string;
  created_at: string;
  emote?: Emote;
}

export const useSocial = () => {
  const [emotes, setEmotes] = useState<Emote[]>([]);
  const [following, setFollowing] = useState<UserFollow[]>([]);
  const [followers, setFollowers] = useState<UserFollow[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchEmotes();
    fetchFollows();
  }, []);

  const fetchEmotes = async () => {
    try {
      const { data, error } = await supabase
        .from('emotes')
        .select('*')
        .order('category', { ascending: true });

      if (error) throw error;
      setEmotes(data || []);
    } catch (error: any) {
      console.error('Error fetching emotes:', error);
    }
  };

  const fetchFollows = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get who current user is following
      const { data: followingData, error: followingError } = await supabase
        .from('user_follows')
        .select('*')
        .eq('follower_id', user.id);

      if (followingError) throw followingError;

      // Get who follows current user
      const { data: followersData, error: followersError } = await supabase
        .from('user_follows')
        .select('*')
        .eq('following_id', user.id);

      if (followersError) throw followersError;

      setFollowing(followingData || []);
      setFollowers(followersData || []);
    } catch (error: any) {
      toast({
        title: "Error loading follows",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const followUser = async (userId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('user_follows')
        .insert([{
          follower_id: user.id,
          following_id: userId
        }])
        .select()
        .single();

      if (error) throw error;

      setFollowing(prev => [...prev, data]);
      toast({
        title: "Following user",
        description: "You are now following this user.",
      });

      return data;
    } catch (error: any) {
      toast({
        title: "Error following user",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const unfollowUser = async (userId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('user_follows')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', userId);

      if (error) throw error;

      setFollowing(prev => prev.filter(follow => follow.following_id !== userId));
      toast({
        title: "Unfollowed user",
        description: "You are no longer following this user.",
      });
    } catch (error: any) {
      toast({
        title: "Error unfollowing user",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const addReaction = async (targetType: string, targetId: string, reactionType: string, emoteId?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // First, try to remove existing reaction of same type
      await supabase
        .from('reactions')
        .delete()
        .eq('user_id', user.id)
        .eq('target_type', targetType)
        .eq('target_id', targetId)
        .eq('reaction_type', reactionType);

      // Then add new reaction
      const { data, error } = await supabase
        .from('reactions')
        .insert([{
          user_id: user.id,
          target_type: targetType,
          target_id: targetId,
          reaction_type: reactionType,
          emote_id: emoteId
        }])
        .select(`
          *,
          emote:emotes(*)
        `)
        .single();

      if (error) throw error;

      return data;
    } catch (error: any) {
      toast({
        title: "Error adding reaction",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const removeReaction = async (targetType: string, targetId: string, reactionType: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('reactions')
        .delete()
        .eq('user_id', user.id)
        .eq('target_type', targetType)
        .eq('target_id', targetId)
        .eq('reaction_type', reactionType);

      if (error) throw error;
    } catch (error: any) {
      toast({
        title: "Error removing reaction",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const getReactions = async (targetType: string, targetId: string) => {
    try {
      const { data, error } = await supabase
        .from('reactions')
        .select(`
          *,
          emote:emotes(*)
        `)
        .eq('target_type', targetType)
        .eq('target_id', targetId);

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('Error fetching reactions:', error);
      return [];
    }
  };

  const isFollowing = (userId: string) => {
    return following.some(follow => follow.following_id === userId);
  };

  const getFollowersCount = () => followers.length;
  const getFollowingCount = () => following.length;

  return {
    emotes,
    following,
    followers,
    loading,
    followUser,
    unfollowUser,
    addReaction,
    removeReaction,
    getReactions,
    isFollowing,
    getFollowersCount,
    getFollowingCount,
    refetch: fetchFollows
  };
};