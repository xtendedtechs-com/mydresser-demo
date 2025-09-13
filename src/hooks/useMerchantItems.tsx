import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface MerchantItem {
  id: string;
  merchant_id: string;
  name: string;
  description?: string;
  category: string;
  brand?: string;
  color?: string;
  size?: string[];
  material?: string;
  season?: string;
  occasion?: string;
  price: number;
  original_price?: number;
  photos?: any;
  tags?: string[];
  condition: string;
  stock_quantity: number;
  is_featured: boolean;
  is_premium: boolean;
  style_tags?: string[];
  created_at: string;
  updated_at: string;
}

export interface ItemMatch {
  id: string;
  user_id: string;
  user_item_id: string;
  merchant_item_id: string;
  match_score: number;
  match_reasons?: string[];
  status: 'suggested' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
}

export const useMerchantItems = () => {
  const [items, setItems] = useState<MerchantItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchMerchantItems();
  }, []);

  const fetchMerchantItems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('merchant_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading merchant items",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getMerchantItem = async (id: string): Promise<MerchantItem | null> => {
    try {
      const { data, error } = await supabase
        .from('merchant_items')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error: any) {
      toast({
        title: "Error loading item",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }
  };

  const getItemsByCategory = (category: string) => {
    return items.filter(item => item.category.toLowerCase() === category.toLowerCase());
  };

  const getFeaturedItems = () => {
    return items.filter(item => item.is_featured);
  };

  const getPremiumItems = () => {
    return items.filter(item => item.is_premium);
  };

  const searchItems = (query: string) => {
    const searchTerm = query.toLowerCase();
    return items.filter(item =>
      item.name.toLowerCase().includes(searchTerm) ||
      item.brand?.toLowerCase().includes(searchTerm) ||
      item.category.toLowerCase().includes(searchTerm) ||
      item.tags?.some(tag => tag.toLowerCase().includes(searchTerm))
    );
  };

  const getItemsBySimilarColor = (color: string, limit?: number) => {
    const filtered = items.filter(item =>
      item.color?.toLowerCase().includes(color.toLowerCase())
    );
    return limit ? filtered.slice(0, limit) : filtered;
  };

  const getItemsByBrand = (brand: string, limit?: number) => {
    const filtered = items.filter(item =>
      item.brand?.toLowerCase() === brand.toLowerCase()
    );
    return limit ? filtered.slice(0, limit) : filtered;
  };

  const getSimilarItems = (item: MerchantItem, limit: number = 8) => {
    return items
      .filter(i => i.id !== item.id)
      .filter(i => 
        i.category === item.category ||
        i.brand === item.brand ||
        i.color === item.color
      )
      .slice(0, limit);
  };

  const getRecommendedItems = (userPreferences?: string[], limit: number = 12) => {
    if (!userPreferences || userPreferences.length === 0) {
      return items.filter(item => item.is_featured).slice(0, limit);
    }

    return items
      .filter(item =>
        userPreferences.some(pref =>
          item.tags?.includes(pref) ||
          item.style_tags?.includes(pref) ||
          item.category.toLowerCase().includes(pref.toLowerCase())
        )
      )
      .slice(0, limit);
  };

  const getPhotoUrls = (item: MerchantItem): string[] => {
    if (!item.photos) return [];
    if (Array.isArray(item.photos)) return item.photos;
    if (typeof item.photos === 'string') return [item.photos];
    return [];
  };

  return {
    items,
    loading,
    getMerchantItem,
    getItemsByCategory,
    getFeaturedItems,
    getPremiumItems,
    searchItems,
    getItemsBySimilarColor,
    getItemsByBrand,
    getSimilarItems,
    getRecommendedItems,
    getPhotoUrls,
    refetch: fetchMerchantItems
  };
};