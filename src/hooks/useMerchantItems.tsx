import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useProfile } from '@/hooks/useProfile';

export interface MerchantItem {
  id: string;
  merchant_id: string;
  name: string;
  description?: string;
  price: number;
  original_price?: number;
  condition: string;
  size?: string[] | string;
  brand?: string;
  category: string;
  color?: string;
  material?: string;
  season?: string;
  occasion?: string;
  photos: string[];
  tags?: string[];
  status: 'available' | 'sold' | 'reserved';
  stock_quantity?: number;
  is_featured?: boolean;
  is_premium?: boolean;
  created_at: string;
  updated_at: string;
}

export const useMerchantItems = () => {
  const [items, setItems] = useState<MerchantItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useProfile();
  const { toast } = useToast();

  const fetchMerchantItems = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('merchant_items')
        .select('*')
        .eq('merchant_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching merchant items:', error);
        toast({
          title: "Error",
          description: "Failed to load your items",
          variant: "destructive"
        });
        return;
      }

      const formattedItems: MerchantItem[] = data?.map(item => ({
        id: item.id,
        merchant_id: item.merchant_id,
        name: item.name,
        description: item.description,
        price: item.price,
        original_price: item.original_price,
        condition: item.condition,
        size: Array.isArray(item.size) ? item.size : [item.size].filter(Boolean),
        brand: item.brand,
        category: item.category,
        color: item.color,
        material: item.material,
        season: item.season,
        occasion: item.occasion,
        photos: item.photos ? (typeof item.photos === 'object' ? Object.values(item.photos).filter(p => typeof p === 'string') as string[] : []) : [],
        tags: item.tags || [],
        status: 'available',
        stock_quantity: item.stock_quantity,
        is_featured: item.is_featured,
        is_premium: item.is_premium,
        created_at: item.created_at,
        updated_at: item.updated_at
      })) || [];

      setItems(formattedItems);
    } catch (error) {
      console.error('Error in fetchMerchantItems:', error);
      toast({
        title: "Error",
        description: "Failed to load merchant items",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addItem = async (itemData: Partial<MerchantItem> & { name: string; category: string; price: number }) => {
    if (!user?.id) return null;

    try {
      const { data, error } = await supabase
        .from('merchant_items')
        .insert([{
          merchant_id: user.id,
          name: itemData.name,
          category: itemData.category,
          price: itemData.price,
          description: itemData.description,
          brand: itemData.brand,
          color: itemData.color,
          size: Array.isArray(itemData.size) ? itemData.size : [itemData.size].filter(Boolean),
          condition: itemData.condition || 'new',
          material: itemData.material,
          season: itemData.season,
          occasion: itemData.occasion,
          photos: itemData.photos ? { main: itemData.photos[0] } : null,
          tags: itemData.tags,
          stock_quantity: itemData.stock_quantity || 1,
          is_featured: itemData.is_featured || false,
          is_premium: itemData.is_premium || false
        }])
        .select()
        .single();

      if (error) {
        console.error('Error adding item:', error);
        toast({
          title: "Error",
          description: "Failed to add item to market",
          variant: "destructive"
        });
        return null;
      }

      await fetchMerchantItems();
      toast({
        title: "Success",
        description: "Item added to market successfully"
      });
      
      return data;
    } catch (error) {
      console.error('Error in addItem:', error);
      return null;
    }
  };

  const updateItem = async (itemId: string, updates: Partial<MerchantItem>) => {
    try {
      const updateData = {
        ...updates,
        size: Array.isArray(updates.size) ? updates.size : (updates.size ? [updates.size] : undefined),
        updated_at: new Date().toISOString()
      };
      
      const { error } = await supabase
        .from('merchant_items')
        .update(updateData)
        .eq('id', itemId)
        .eq('merchant_id', user?.id);

      if (error) {
        console.error('Error updating item:', error);
        toast({
          title: "Error",
          description: "Failed to update item",
          variant: "destructive"
        });
        return false;
      }

      await fetchMerchantItems();
      toast({
        title: "Success",
        description: "Item updated successfully"
      });
      
      return true;
    } catch (error) {
      console.error('Error in updateItem:', error);
      return false;
    }
  };

  const deleteItem = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('merchant_items')
        .delete()
        .eq('id', itemId)
        .eq('merchant_id', user?.id);

      if (error) {
        console.error('Error deleting item:', error);
        toast({
          title: "Error",
          description: "Failed to delete item",
          variant: "destructive"
        });
        return false;
      }

      await fetchMerchantItems();
      toast({
        title: "Success",
        description: "Item deleted successfully"
      });
      
      return true;
    } catch (error) {
      console.error('Error in deleteItem:', error);
      return false;
    }
  };

  const getFeaturedItems = () => {
    return items.filter(item => item.is_featured);
  };

  const getPremiumItems = () => {
    return items.filter(item => item.is_premium);
  };

  const searchItems = (query: string) => {
    if (!query) return items;
    return items.filter(item => 
      item.name.toLowerCase().includes(query.toLowerCase()) ||
      item.description?.toLowerCase().includes(query.toLowerCase()) ||
      item.brand?.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase()) ||
      item.tags?.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
    );
  };

  const getItemsByCategory = (category: string) => {
    if (category === 'all') return items;
    return items.filter(item => item.category.toLowerCase() === category.toLowerCase());
  };

  useEffect(() => {
    fetchMerchantItems();

    // Real-time subscription for merchant items
    const channel = supabase
      .channel('merchant-items-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'merchant_items',
        },
        () => {
          fetchMerchantItems();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const getMerchantItem = (id: string) => {
    return items.find(item => item.id === id);
  };

  const getSimilarItems = (item: MerchantItem) => {
    return items.filter(i => i.id !== item.id && i.category === item.category).slice(0, 4);
  };

  const getItemsByBrand = (brand: string) => {
    return items.filter(item => item.brand?.toLowerCase() === brand.toLowerCase());
  };

  const getItemsBySimilarColor = (color: string) => {
    return items.filter(item => item.color?.toLowerCase() === color?.toLowerCase());
  };

  const getPhotoUrls = (item: MerchantItem) => {
    if (!item.photos) return [];
    if (Array.isArray(item.photos)) return item.photos;
    return [];
  };

  return {
    items,
    loading,
    addItem,
    updateItem,
    deleteItem,
    refetch: fetchMerchantItems,
    getFeaturedItems,
    getPremiumItems,
    searchItems,
    getItemsByCategory,
    getMerchantItem,
    getSimilarItems,
    getItemsByBrand,
    getItemsBySimilarColor,
    getPhotoUrls
  };
};