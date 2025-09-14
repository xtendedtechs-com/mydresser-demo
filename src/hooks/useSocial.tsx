import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Reaction {
  id: string;
  user_id: string;
  post_id: string;
  type: string;
  created_at: string;
}

interface SocialUser {
  id: string;
  display_name: string;
  avatar_url?: string;
  bio?: string;
  followers_count: number;
  following_count: number;
  is_following?: boolean;
}

interface SocialPost {
  id: string;
  user_id: string;
  content: string;
  image_urls: string[];
  likes_count: number;
  comments_count: number;
  created_at: string;
  user: SocialUser;
  is_liked?: boolean;
}

interface SocialComment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user: SocialUser;
}

export const useSocial = () => {
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [followers, setFollowers] = useState<SocialUser[]>([]);
  const [following, setFollowing] = useState<SocialUser[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchPosts = async () => {
    setLoading(true);
    try {
      // Mock data for now - in real implementation, fetch from Supabase
      const mockPosts: SocialPost[] = [
        {
          id: '1',
          user_id: 'user1',
          content: 'Love this new outfit combination! Perfect for the office.',
          image_urls: ['/api/placeholder/400/500'],
          likes_count: 24,
          comments_count: 5,
          created_at: new Date().toISOString(),
          user: {
            id: 'user1',
            display_name: 'Sarah Johnson',
            avatar_url: '/api/placeholder/40/40',
            bio: 'Fashion enthusiast',
            followers_count: 120,
            following_count: 95
          }
        }
      ];
      setPosts(mockPosts);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch posts',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const likePost = async (postId: string) => {
    try {
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { ...post, is_liked: !post.is_liked, likes_count: post.is_liked ? post.likes_count - 1 : post.likes_count + 1 }
          : post
      ));
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to like post',
        variant: 'destructive'
      });
    }
  };

  const followUser = async (userId: string) => {
    try {
      // Implementation for following/unfollowing users
      toast({
        title: 'Success',
        description: 'Following status updated'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update following status',
        variant: 'destructive'
      });
    }
  };

  const createPost = async (content: string, images: File[]) => {
    try {
      // Implementation for creating posts
      toast({
        title: 'Success',
        description: 'Post created successfully'
      });
      fetchPosts();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create post',
        variant: 'destructive'
      });
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const addReaction = async (postId: string, type: string) => {
    // Implementation for adding reactions
  };

  const removeReaction = async (postId: string, type: string) => {
    // Implementation for removing reactions
  };

  const getReactions = (postId: string) => {
    // Implementation for getting reactions
    return [];
  };

  return {
    posts,
    followers,
    following,
    loading,
    likePost,
    followUser,
    createPost,
    fetchPosts,
    addReaction,
    removeReaction,
    getReactions
  };
};