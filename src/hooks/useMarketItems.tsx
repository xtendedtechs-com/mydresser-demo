import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface MarketItem {
  id: string;
  seller_id: string;
  title: string;
  description?: string;
  category: string;
  brand?: string;
  price: number;
  original_price?: number;
  condition: string;
  color?: string;
  material?: string;
  size?: string;
  photos?: any;
  tags?: string[];
  status: string;
  location?: string;
  created_at: string;
  updated_at: string;
  is_featured?: boolean;
  likes_count?: number;
  views_count?: number;
  sustainability_score?: number;
  shipping_options?: any;
}

export const useMarketItems = () => {
  const [items, setItems] = useState<MarketItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMarketItems = async () => {
    try {
      const { data, error } = await supabase
        .from('market_items')
        .select('*')
        .eq('status', 'available')
        .order('created_at', { ascending: false });

      if (error) throw error;
      console.log('Fetched market items:', data?.length, 'items');
      setItems(data || []);
    } catch (error) {
      console.error('Error fetching market items:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMarketItem = async (id: string): Promise<MarketItem | null> => {
    try {
      const { data, error } = await supabase
        .from('market_items')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching market item:', error);
      return null;
    }
  };

  const getFeaturedItems = () => {
    return items.filter(item => item.is_featured);
  };

  const searchItems = (query: string) => {
    const lowerQuery = query.toLowerCase();
    return items.filter(item =>
      item.title.toLowerCase().includes(lowerQuery) ||
      item.description?.toLowerCase().includes(lowerQuery) ||
      item.brand?.toLowerCase().includes(lowerQuery) ||
      item.category.toLowerCase().includes(lowerQuery) ||
      item.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  };

  const getItemsByCategory = (category: string) => {
    return items.filter(item => item.category.toLowerCase() === category.toLowerCase());
  };

  const getSimilarItems = (item: MarketItem) => {
    return items
      .filter(i => i.category === item.category && i.id !== item.id)
      .slice(0, 4);
  };

  const getItemsByBrand = (brand: string) => {
    return items.filter(item => item.brand?.toLowerCase() === brand.toLowerCase());
  };

  const getItemsBySimilarColor = (color: string) => {
    return items.filter(item => item.color?.toLowerCase() === color.toLowerCase());
  };

  const getPhotoUrls = (photos: any): string[] => {
    const { getAllPhotoUrls } = require('@/utils/photoHelpers');
    return getAllPhotoUrls(photos as any);
  };

  useEffect(() => {
    fetchMarketItems();
  }, []);

  return {
    items,
    loading,
    refetch: fetchMarketItems,
    getMarketItem,
    getFeaturedItems,
    searchItems,
    getItemsByCategory,
    getSimilarItems,
    getItemsByBrand,
    getItemsBySimilarColor,
    getPhotoUrls,
  };
};