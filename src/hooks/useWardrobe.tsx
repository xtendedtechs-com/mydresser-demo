import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface WardrobeItem {
  id: string;
  user_id: string;
  wardrobe_id?: string;
  name: string;
  category: string;
  brand?: string;
  color?: string;
  size?: string;
  material?: string;
  season?: string;
  occasion?: string;
  purchase_date?: string;
  purchase_price?: number;
  photos?: any; // Using any for JSONB compatibility
  tags?: string[];
  location_in_wardrobe?: string;
  condition: string;
  last_worn?: string;
  wear_count: number;
  is_favorite: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Wardrobe {
  id: string;
  user_id: string;
  name: string;
  type: string;
  dimensions?: any;
  location?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export const useWardrobe = () => {
  const [items, setItems] = useState<WardrobeItem[]>([]);
  const [wardrobes, setWardrobes] = useState<Wardrobe[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchWardrobes();
    fetchItems();
  }, []);

  const fetchWardrobes = async () => {
    try {
      const { data, error } = await supabase
        .from('wardrobes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWardrobes(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading wardrobes",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const fetchItems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('wardrobe_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Resolve photo URLs for all items to fix display issues after reload
      const itemsWithResolvedPhotos = await Promise.all((data || []).map(async (item) => {
        if (item.photos && typeof item.photos === 'string' && !item.photos.startsWith('http') && !item.photos.startsWith('data:')) {
          // It's a storage path like "bucket/path", resolve it to public URL
          const [bucket, ...pathParts] = item.photos.split('/');
          if (bucket && pathParts.length > 0) {
            const path = pathParts.join('/');
            const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);
            return { ...item, photos: urlData.publicUrl };
          }
        }
        return item;
      }));
      
      setItems(itemsWithResolvedPhotos);
    } catch (error: any) {
      toast({
        title: "Error loading wardrobe items",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addItem = async (itemData: Omit<WardrobeItem, 'id' | 'created_at' | 'updated_at'>, files?: File[]) => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Prepare item data with user_id and normalized category
      const itemToInsert = {
        ...itemData,
        user_id: user.id,
        category: itemData.category.toLowerCase(),
        // Ensure required fields have defaults
        condition: itemData.condition || 'excellent',
        wear_count: 0,
        is_favorite: false
      };

      const { data, error } = await supabase
        .from('wardrobe_items')
        .insert(itemToInsert)
        .select()
        .single();

      if (error) throw error;

      // Upload photos if provided
      if (files && files.length > 0 && data.id) {
        const { fileUploadService } = await import('@/services/fileUploadService');
        const uploadResults = await Promise.all(
          files.map(file => fileUploadService.uploadWardrobePhoto(file, user.id, data.id))
        );
        
        const photoUrls = uploadResults
          .filter(r => r.success)
          .map(r => r.url)
          .filter((url): url is string => url !== undefined);

        if (photoUrls.length > 0) {
          // Update item with photo URLs
          const { error: updateError } = await supabase
            .from('wardrobe_items')
            .update({ photos: { main: photoUrls[0], urls: photoUrls } as any })
            .eq('id', data.id);

          if (updateError) console.error('Error updating photos:', updateError);
        }
      }

      setItems(prev => [data, ...prev]);
      toast({
        title: "Item added successfully",
        description: `${itemData.name} has been added to your wardrobe.`,
      });

      return data;
    } catch (error: any) {
      toast({
        title: "Error adding item",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateItem = async (id: string, updates: Partial<Omit<WardrobeItem, 'id' | 'user_id' | 'created_at'>>) => {
    try {
      const { data, error } = await supabase
        .from('wardrobe_items')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setItems(prev => prev.map(item => 
        item.id === id ? { ...item, ...data } : item
      ));

      toast({
        title: "Item updated",
        description: "Your wardrobe item has been updated.",
      });

      return data;
    } catch (error: any) {
      toast({
        title: "Error updating item",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('wardrobe_items')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setItems(prev => prev.filter(item => item.id !== id));
      toast({
        title: "Item removed",
        description: "The item has been removed from your wardrobe.",
      });
    } catch (error: any) {
      toast({
        title: "Error removing item",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const toggleFavorite = async (id: string, isFavorite: boolean) => {
    return updateItem(id, { is_favorite: isFavorite });
  };

  const markAsWorn = async (id: string) => {
    const item = items.find(i => i.id === id);
    if (!item) return;

    return updateItem(id, {
      last_worn: new Date().toISOString().split('T')[0],
      wear_count: item.wear_count + 1
    });
  };

  const createWardrobe = async (wardrobeData: Omit<Wardrobe, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('wardrobes')
        .insert(wardrobeData)
        .select()
        .single();

      if (error) throw error;

      setWardrobes(prev => [data, ...prev]);
      toast({
        title: "Wardrobe created",
        description: `${wardrobeData.name} has been added.`,
      });

      return data;
    } catch (error: any) {
      toast({
        title: "Error creating wardrobe",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const getItemsByCategory = (category: string) => {
    return items.filter(item => item.category.toLowerCase() === category.toLowerCase());
  };

  const getFavoriteItems = () => {
    return items.filter(item => item.is_favorite);
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

  // Helper function to extract photo URLs from wardrobe items
  const getPhotoUrls = (item: WardrobeItem): string[] => {
    const p = item.photos as any;
    if (!p) return [];

    if (typeof p === 'string') return [p];
    if (Array.isArray(p)) return p.filter(Boolean);

    if (typeof p === 'object') {
      const main = p.main ? [p.main] : [];
      const urls = Array.isArray(p.urls) ? p.urls.filter(Boolean) : [];
      return Array.from(new Set([...main, ...urls]));
    }

    return [];
  };

  const enhanceItemWithMerchantData = async (itemId: string, merchantItem: any) => {
    try {
      const itemToUpdate = items.find(item => item.id === itemId);
      if (!itemToUpdate) {
        throw new Error('Item not found');
      }

      const enhancedData: Partial<WardrobeItem> = {
        name: merchantItem.name || itemToUpdate.name,
        brand: merchantItem.brand || itemToUpdate.brand,
        color: merchantItem.color || itemToUpdate.color,
        material: merchantItem.material || itemToUpdate.material,
        size: merchantItem.size || itemToUpdate.size,
        category: merchantItem.category || itemToUpdate.category,
        tags: [...new Set([...(itemToUpdate.tags || []), ...(merchantItem.tags || [])])],
      };

      await updateItem(itemId, enhancedData);
    } catch (error: any) {
      toast({
        title: "Error enhancing item",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    items,
    wardrobes,
    loading,
    addItem,
    updateItem,
    deleteItem,
    toggleFavorite,
    markAsWorn,
    createWardrobe,
    getItemsByCategory,
    getFavoriteItems,
    searchItems,
    getPhotoUrls,
    enhanceItemWithMerchantData,
    refetch: () => {
      fetchWardrobes();
      fetchItems();
    }
  };
};