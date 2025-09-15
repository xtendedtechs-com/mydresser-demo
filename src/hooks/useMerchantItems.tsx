import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useProfile } from '@/hooks/useProfile';

export interface MerchantItem {
  id: string;
  seller_id: string;
  item_id?: string;
  name: string;
  description?: string;
  price: number;
  original_price?: number;
  condition: string;
  size?: string;
  brand?: string;
  category: string;
  color?: string;
  material?: string;
  season?: string;
  occasion?: string;
  photos: string[];
  tags?: string[];
  status: 'available' | 'sold' | 'reserved';
  views?: number;
  likes?: number;
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
      // Use wardrobe_items as merchant items until market_items table is created
      const { data, error } = await supabase
        .from('wardrobe_items')
        .select('*')
        .eq('user_id', user.id)
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
        seller_id: item.user_id,
        item_id: item.id,
        name: item.name,
        description: item.notes,
        price: Math.floor(Math.random() * 200) + 20,
        original_price: Math.floor(Math.random() * 300) + 50,
        condition: item.condition,
        size: item.size,
        brand: item.brand,
        category: item.category,
        color: item.color,
        material: item.material,
        season: item.season,
        occasion: item.occasion,
        photos: Array.isArray(item.photos) ? item.photos : [],
        tags: item.tags || [],
        status: 'available',
        views: Math.floor(Math.random() * 100),
        likes: Math.floor(Math.random() * 20),
        stock_quantity: 1,
        is_featured: false,
        is_premium: false,
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

  const addItem = async (itemData: Partial<MerchantItem>) => {
    if (!user?.id) return null;

    try {
      const { data, error } = await supabase
        .from('market_items')
        .insert([{
          seller_id: user.id,
          ...itemData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
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

      await fetchMerchantItems(); // Refresh the list
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
      const { error } = await supabase
        .from('market_items')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', itemId)
        .eq('seller_id', user?.id); // Ensure user can only update their own items

      if (error) {
        console.error('Error updating item:', error);
        toast({
          title: "Error",
          description: "Failed to update item",
          variant: "destructive"
        });
        return false;
      }

      await fetchMerchantItems(); // Refresh the list
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
        .from('market_items')
        .delete()
        .eq('id', itemId)
        .eq('seller_id', user?.id); // Ensure user can only delete their own items

      if (error) {
        console.error('Error deleting item:', error);
        toast({
          title: "Error",
          description: "Failed to delete item",
          variant: "destructive"
        });
        return false;
      }

      await fetchMerchantItems(); // Refresh the list
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
  }, [user?.id]);

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
    getItemsByCategory
  };
};