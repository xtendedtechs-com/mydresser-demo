import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from '@/hooks/useProfile';
import { useToast } from '@/hooks/use-toast';

export interface MarketItem {
  id: string;
  seller_id: string;
  wardrobe_item_id?: string;
  title: string;
  description?: string;
  price: number;
  original_price?: number;
  condition: 'new' | 'like-new' | 'good' | 'fair';
  size?: string;
  brand?: string;
  category: string;
  color?: string;
  material?: string;
  photos: string[];
  location?: string;
  shipping_options: {
    local_pickup: boolean;
    shipping_available: boolean;
    shipping_cost?: number;
  };
  status: 'available' | 'sold' | 'reserved';
  views_count: number;
  likes_count: number;
  is_featured: boolean;
  sustainability_score?: number;
  tags: string[];
  created_at: string;
  updated_at: string;
  seller?: {
    full_name?: string;
    avatar_url?: string;
  };
}

export const useMarketplace = () => {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<MarketItem[]>([]);
  const [userListings, setUserListings] = useState<MarketItem[]>([]);
  const [likedItems, setLikedItems] = useState<string[]>([]);
  const { user, profile } = useProfile();
  const { toast } = useToast();

  const getMarketItems = async (filters?: {
    category?: string;
    condition?: string;
    priceRange?: { min: number; max: number };
    searchTerm?: string;
  }) => {
    setLoading(true);
    try {
      let query = supabase
        .from('market_items')
        .select('*')
        .eq('status', 'available')
        .order('created_at', { ascending: false });

      if (filters?.category && filters.category !== 'all') {
        query = query.eq('category', filters.category);
      }

      if (filters?.condition && filters.condition !== 'all') {
        query = query.eq('condition', filters.condition);
      }

      if (filters?.priceRange) {
        query = query
          .gte('price', filters.priceRange.min)
          .lte('price', filters.priceRange.max);
      }

      if (filters?.searchTerm) {
        query = query.or(`title.ilike.%${filters.searchTerm}%,brand.ilike.%${filters.searchTerm}%,description.ilike.%${filters.searchTerm}%`);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Get seller profiles separately
      const sellerIds = [...new Set((data || []).map(item => item.seller_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url')
        .in('user_id', sellerIds);

      const profileMap = new Map();
      (profiles || []).forEach(profile => {
        profileMap.set(profile.user_id, profile);
      });

      const formattedItems: MarketItem[] = (data || []).map(item => {
        const seller = profileMap.get(item.seller_id);
        
        return {
          ...item,
          condition: item.condition as 'new' | 'like-new' | 'good' | 'fair',
          status: item.status as 'available' | 'sold' | 'reserved',
          photos: Array.isArray(item.photos) ? (item.photos as string[]) : [],
          shipping_options: typeof item.shipping_options === 'object' 
            ? item.shipping_options as any 
            : { local_pickup: false, shipping_available: true, shipping_cost: 0 },
          tags: Array.isArray(item.tags) ? item.tags : [],
          seller: seller ? {
            full_name: seller.full_name,
            avatar_url: seller.avatar_url
          } : undefined
        };
      });

      setItems(formattedItems);
      return formattedItems;
    } catch (error: any) {
      console.error('Error fetching market items:', error);
      toast({
        title: "Error loading items",
        description: error.message,
        variant: "destructive"
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getFeaturedItems = async () => {
    try {
      const { data, error } = await supabase
        .from('market_items')
        .select('*')
        .eq('status', 'available')
        .eq('is_featured', true)
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) throw error;

      // Get seller profiles
      const sellerIds = [...new Set((data || []).map(item => item.seller_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url')
        .in('user_id', sellerIds);

      const profileMap = new Map();
      (profiles || []).forEach(profile => {
        profileMap.set(profile.user_id, profile);
      });

      return (data || []).map(item => {
        const seller = profileMap.get(item.seller_id);
        
        return {
          ...item,
          condition: item.condition as 'new' | 'like-new' | 'good' | 'fair',
          status: item.status as 'available' | 'sold' | 'reserved',
          photos: Array.isArray(item.photos) ? (item.photos as string[]) : [],
          shipping_options: typeof item.shipping_options === 'object' 
            ? item.shipping_options as any 
            : { local_pickup: false, shipping_available: true, shipping_cost: 0 },
          tags: Array.isArray(item.tags) ? item.tags : [],
          seller: seller ? {
            full_name: seller.full_name,
            avatar_url: seller.avatar_url
          } : undefined
        };
      });
    } catch (error: any) {
      console.error('Error fetching featured items:', error);
      return [];
    }
  };

  const createListing = async (itemData: {
    wardrobe_item_id?: string;
    title: string;
    description?: string;
    price: number;
    original_price?: number;
    condition: string;
    category: string;
    size?: string;
    brand?: string;
    color?: string;
    material?: string;
    photos?: string[];
    location?: string;
    tags?: string[];
    sustainability_score?: number;
  }) => {
    if (!user?.id) throw new Error('User not authenticated');

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('market_items')
        .insert({
          seller_id: user.id,
          ...itemData,
          photos: itemData.photos || [],
          tags: itemData.tags || [],
          shipping_options: {
            local_pickup: true,
            shipping_available: true,
            shipping_cost: 0
          }
        })
        .select()
        .single();

      if (error) throw error;

      const newItem: MarketItem = {
        ...data,
        condition: data.condition as 'new' | 'like-new' | 'good' | 'fair',
        status: data.status as 'available' | 'sold' | 'reserved',
        photos: Array.isArray(data.photos) ? (data.photos as string[]) : [],
        shipping_options: typeof data.shipping_options === 'object' 
          ? data.shipping_options as any 
          : { local_pickup: false, shipping_available: true, shipping_cost: 0 },
        tags: Array.isArray(data.tags) ? data.tags : [],
        seller: {
          full_name: profile?.full_name || 'You',
          avatar_url: profile?.avatar_url
        }
      };

      setItems(prev => [newItem, ...prev]);
      setUserListings(prev => [newItem, ...prev]);

      toast({
        title: "Item listed successfully!",
        description: "Your item is now available on the marketplace"
      });

      return newItem;
    } catch (error: any) {
      console.error('Error creating listing:', error);
      toast({
        title: "Error listing item",
        description: error.message,
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const buyItem = async (itemId: string) => {
    if (!user?.id) throw new Error('User not authenticated');

    setLoading(true);
    try {
      // Update item status to sold
      const { error } = await supabase
        .from('market_items')
        .update({ status: 'sold' })
        .eq('id', itemId)
        .neq('seller_id', user.id); // Prevent buying own items

      if (error) throw error;

      // Update local state
      setItems(prev => prev.map(item => 
        item.id === itemId ? { ...item, status: 'sold' as const } : item
      ));

      toast({
        title: "Purchase successful!",
        description: "The seller will be contacted with your details"
      });

      return { success: true };
    } catch (error: any) {
      console.error('Error buying item:', error);
      toast({
        title: "Purchase failed",
        description: error.message,
        variant: "destructive"
      });
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const likeItem = async (itemId: string) => {
    if (!user?.id) return;

    try {
      const isLiked = likedItems.includes(itemId);
      
      if (isLiked) {
        // Unlike: remove reaction
        await supabase
          .from('reactions')
          .delete()
          .eq('user_id', user.id)
          .eq('target_id', itemId)
          .eq('target_type', 'market_item');

        setLikedItems(prev => prev.filter(id => id !== itemId));
        
        // Decrement likes count
        const item = items.find(i => i.id === itemId);
        if (item && item.likes_count > 0) {
          const { error } = await supabase
            .from('market_items')
            .update({ likes_count: item.likes_count - 1 })
            .eq('id', itemId);
          
          if (error) throw error;
        }

        setItems(prev => prev.map(item => 
          item.id === itemId 
            ? { ...item, likes_count: Math.max(0, item.likes_count - 1) }
            : item
        ));

        toast({ title: "Removed from favorites" });
      } else {
        // Like: add reaction
        await supabase
          .from('reactions')
          .insert({
            user_id: user.id,
            target_id: itemId,
            target_type: 'market_item',
            reaction_type: 'like'
          });

        setLikedItems(prev => [...prev, itemId]);
        
        // Increment likes count
        const item = items.find(i => i.id === itemId);
        if (item) {
          const { error } = await supabase
            .from('market_items')
            .update({ likes_count: item.likes_count + 1 })
            .eq('id', itemId);
          
          if (error) throw error;
        }

        setItems(prev => prev.map(item => 
          item.id === itemId 
            ? { ...item, likes_count: item.likes_count + 1 }
            : item
        ));

        toast({ title: "Added to favorites!" });
      }
    } catch (error: any) {
      console.error('Error liking item:', error);
      toast({
        title: "Error",
        description: "Failed to update like",
        variant: "destructive"
      });
    }
  };

  const incrementViews = async (itemId: string) => {
    try {
      const item = items.find(i => i.id === itemId);
      if (item) {
        await supabase
          .from('market_items')
          .update({ views_count: item.views_count + 1 })
          .eq('id', itemId);
      }
    } catch (error: any) {
      console.error('Error incrementing views:', error);
    }
  };

  const fetchUserListings = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('market_items')
        .select('*')
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedItems: MarketItem[] = (data || []).map(item => ({
        ...item,
        condition: item.condition as 'new' | 'like-new' | 'good' | 'fair',
        status: item.status as 'available' | 'sold' | 'reserved',
        photos: Array.isArray(item.photos) ? (item.photos as string[]) : [],
        shipping_options: typeof item.shipping_options === 'object' 
          ? item.shipping_options as any 
          : { local_pickup: false, shipping_available: true, shipping_cost: 0 },
        tags: Array.isArray(item.tags) ? item.tags : [],
        seller: {
          full_name: profile?.full_name || 'You',
          avatar_url: profile?.avatar_url
        }
      }));

      setUserListings(formattedItems);
    } catch (error: any) {
      console.error('Error fetching user listings:', error);
    }
  };

  const fetchLikedItems = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('reactions')
        .select('target_id')
        .eq('user_id', user.id)
        .eq('target_type', 'market_item')
        .eq('reaction_type', 'like');

      if (error) throw error;

      setLikedItems((data || []).map(reaction => reaction.target_id));
    } catch (error: any) {
      console.error('Error fetching liked items:', error);
    }
  };

  const searchItems = (query: string, category?: string, priceRange?: [number, number]) => {
    return getMarketItems({
      searchTerm: query,
      category,
      priceRange: priceRange ? { min: priceRange[0], max: priceRange[1] } : undefined
    });
  };

  const getItemById = (itemId: string) => {
    return items.find(item => item.id === itemId);
  };

  const getSimilarItems = (item: MarketItem, limit: number = 6) => {
    return items
      .filter(i => i.id !== item.id && i.category === item.category && i.status === 'available')
      .slice(0, limit);
  };

  useEffect(() => {
    getMarketItems();
    if (user?.id) {
      fetchUserListings();
      fetchLikedItems();
    }
  }, [user?.id]);

  return {
    items,
    userListings,
    likedItems,
    loading,
    createListing,
    buyItem,
    likeItem,
    incrementViews,
    searchItems,
    getItemById,
    getSimilarItems,
    getMarketItems,
    getFeaturedItems,
    refetch: () => Promise.all([getMarketItems(), fetchUserListings(), fetchLikedItems()])
  };
};