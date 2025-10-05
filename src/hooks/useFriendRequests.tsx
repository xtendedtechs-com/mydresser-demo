import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from '@/hooks/useProfile';
import { useToast } from '@/hooks/use-toast';

export interface FriendRequest {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  sender_profile?: {
    full_name: string;
    avatar_url: string;
    bio?: string;
  };
  receiver_profile?: {
    full_name: string;
    avatar_url: string;
    bio?: string;
  };
}

export const useFriendRequests = () => {
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<FriendRequest[]>([]);
  const [friends, setFriends] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useProfile();
  const { toast } = useToast();

  const fetchFriendRequests = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);

      // Fetch sent requests
      const { data: sent } = await supabase
        .from('friend_requests')
        .select('*')
        .eq('sender_id', user.id);

      // Fetch received requests
      const { data: received } = await supabase
        .from('friend_requests')
        .select('*')
        .eq('receiver_id', user.id)
        .eq('status', 'pending');

      // Get profiles for all users in requests
      const userIds = new Set<string>();
      sent?.forEach(req => userIds.add(req.receiver_id));
      received?.forEach(req => userIds.add(req.sender_id));

      if (userIds.size > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, full_name, avatar_url, bio')
          .in('user_id', Array.from(userIds));

        const profileMap = new Map();
        profiles?.forEach(p => profileMap.set(p.user_id, p));

        setSentRequests(sent?.map(req => ({
          ...req,
          status: req.status as 'pending' | 'accepted' | 'rejected',
          receiver_profile: profileMap.get(req.receiver_id)
        })) || []);

        setReceivedRequests(received?.map(req => ({
          ...req,
          status: req.status as 'pending' | 'accepted' | 'rejected',
          sender_profile: profileMap.get(req.sender_id)
        })) || []);
      } else {
        setSentRequests((sent || []).map(req => ({ ...req, status: req.status as 'pending' | 'accepted' | 'rejected' })));
        setReceivedRequests((received || []).map(req => ({ ...req, status: req.status as 'pending' | 'accepted' | 'rejected' })));
      }

      // Fetch friends (accepted requests)
      const { data: acceptedRequests } = await supabase
        .from('friend_requests')
        .select('sender_id, receiver_id')
        .eq('status', 'accepted')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`);

      const friendIds = new Set<string>();
      acceptedRequests?.forEach(req => {
        if (req.sender_id === user.id) friendIds.add(req.receiver_id);
        if (req.receiver_id === user.id) friendIds.add(req.sender_id);
      });
      setFriends(Array.from(friendIds));

    } catch (error) {
      console.error('Error fetching friend requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendFriendRequest = async (receiverId: string): Promise<boolean> => {
    if (!user?.id || receiverId === user.id) return false;

    try {
      const { error } = await supabase
        .from('friend_requests')
        .insert({
          sender_id: user.id,
          receiver_id: receiverId,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Friend request sent",
        description: "Your friend request has been sent"
      });

      await fetchFriendRequests();
      return true;
    } catch (error: any) {
      console.error('Error sending friend request:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
      return false;
    }
  };

  const acceptFriendRequest = async (requestId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('friend_requests')
        .update({ status: 'accepted', updated_at: new Date().toISOString() })
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: "Friend request accepted",
        description: "You are now friends!"
      });

      await fetchFriendRequests();
      return true;
    } catch (error: any) {
      console.error('Error accepting friend request:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
      return false;
    }
  };

  const rejectFriendRequest = async (requestId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('friend_requests')
        .update({ status: 'rejected', updated_at: new Date().toISOString() })
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: "Friend request rejected",
        description: "Friend request has been declined"
      });

      await fetchFriendRequests();
      return true;
    } catch (error: any) {
      console.error('Error rejecting friend request:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
      return false;
    }
  };

  const cancelFriendRequest = async (requestId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('friend_requests')
        .delete()
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: "Request cancelled",
        description: "Friend request has been cancelled"
      });

      await fetchFriendRequests();
      return true;
    } catch (error: any) {
      console.error('Error cancelling friend request:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
      return false;
    }
  };

  const removeFriend = async (friendId: string): Promise<boolean> => {
    if (!user?.id) return false;

    try {
      const { error } = await supabase
        .from('friend_requests')
        .delete()
        .eq('status', 'accepted')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${friendId}),and(sender_id.eq.${friendId},receiver_id.eq.${user.id})`);

      if (error) throw error;

      toast({
        title: "Friend removed",
        description: "You are no longer friends"
      });

      await fetchFriendRequests();
      return true;
    } catch (error: any) {
      console.error('Error removing friend:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
      return false;
    }
  };

  const isFriend = (userId: string): boolean => {
    return friends.includes(userId);
  };

  const hasPendingRequest = (userId: string): boolean => {
    return sentRequests.some(req => 
      req.receiver_id === userId && req.status === 'pending'
    );
  };

  useEffect(() => {
    if (user?.id) {
      fetchFriendRequests();

      // Real-time subscription
      const channel = supabase
        .channel('friend-requests-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'friend_requests',
            filter: `sender_id=eq.${user.id},receiver_id=eq.${user.id}`
          },
          () => {
            fetchFriendRequests();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user?.id]);

  return {
    sentRequests,
    receivedRequests,
    friends,
    loading,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    cancelFriendRequest,
    removeFriend,
    isFriend,
    hasPendingRequest,
    refreshRequests: fetchFriendRequests
  };
};
