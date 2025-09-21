import { useState, useEffect } from 'react';
import { useProfile } from '@/hooks/useProfile';
import { useToast } from '@/hooks/use-toast';

export interface MarketItem {
  id: string;
  seller_id: string;
  title: string;
  description?: string;
  price: number;
  original_price?: number;
  condition: 'new' | 'like-new' | 'good' | 'fair' | 'poor';
  size?: string;
  brand?: string;
  category: string;
  color?: string;
  material?: string;
  photos: string[];
  status: 'available' | 'sold' | 'reserved';
  shipping_options: string[];
  seller_name: string;
  seller_rating: number;
  location?: string;
  views: number;
  likes: number;
  created_at: string;
  updated_at: string;
}

export const useMarketplace = () => {
  const [items, setItems] = useState<MarketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [userListings, setUserListings] = useState<MarketItem[]>([]);
  const [likedItems, setLikedItems] = useState<string[]>([]);
  const { user, profile } = useProfile();
  const { toast } = useToast();

  const fetchMarketItems = async () => {
    setLoading(true);
    try {
      // Mock data for now since market_items table doesn't exist yet
      const mockItems: MarketItem[] = [
        {
          id: '1',
          seller_id: 'user1',
          title: 'Designer Black Leather Jacket',
          description: 'Barely worn, excellent condition. Perfect for fall weather.',
          price: 150,
          original_price: 300,
          condition: 'excellent' as any,
          size: 'M',
          brand: 'Zara',
          category: 'outerwear',
          color: 'Black',
          photos: ['/placeholder.svg'],
          status: 'available',
          shipping_options: ['standard', 'express'],
          seller_name: 'StyleGuru',
          seller_rating: 4.8,
          location: 'New York, NY',
          views: 24,
          likes: 8,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '2',
          seller_id: 'user2',
          title: 'Vintage Blue Denim Jeans',
          description: 'Classic fit, great for casual wear.',
          price: 45,
          original_price: 89,
          condition: 'good',
          size: '32',
          brand: 'Levi\'s',
          category: 'bottoms',
          color: 'Blue',
          photos: ['/placeholder.svg'],
          status: 'available',
          shipping_options: ['standard'],
          seller_name: 'DenimLover',
          seller_rating: 4.5,
          location: 'Los Angeles, CA',
          views: 15,
          likes: 3,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];

      setItems(mockItems);
    } catch (error) {
      console.error('Error in fetchMarketItems:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserListings = async () => {
    if (!user?.id) return;
    // Mock implementation for now
    setUserListings([]);
  };

  const fetchLikedItems = async () => {
    if (!user?.id) return;
    // Mock implementation for now
    setLikedItems([]);
  };

  const createListing = async (itemData: any) => {
    if (!user?.id) return null;

    const newItem: MarketItem = {
      id: Date.now().toString(),
      seller_id: user.id,
      title: itemData.title,
      description: itemData.description,
      price: itemData.price,
      original_price: itemData.original_price,
      condition: itemData.condition,
      size: itemData.size,
      brand: itemData.brand,
      category: itemData.category,
      color: itemData.color,
      material: itemData.material,
      photos: itemData.photos,
      status: 'available',
      shipping_options: itemData.shipping_options || ['standard'],
      seller_name: profile?.full_name || 'Anonymous',
      seller_rating: 4.5,
      location: itemData.location,
      views: 0,
      likes: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    setItems(prev => [newItem, ...prev]);
    setUserListings(prev => [newItem, ...prev]);
    
    toast({
      title: "Success",
      description: "Listing created successfully"
    });

    return newItem;
  };

  const likeItem = async (itemId: string) => {
    if (!user?.id) return;

    const isLiked = likedItems.includes(itemId);
    
    if (isLiked) {
      setLikedItems(prev => prev.filter(id => id !== itemId));
    } else {
      setLikedItems(prev => [...prev, itemId]);
    }

    // Update likes count in items
    setItems(prev => prev.map(item => 
      item.id === itemId 
        ? { ...item, likes: isLiked ? Math.max(0, item.likes - 1) : item.likes + 1 }
        : item
    ));
  };

  const searchItems = (query: string, category?: string, priceRange?: [number, number]) => {
    let filtered = items;

    if (query) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.description?.toLowerCase().includes(query.toLowerCase()) ||
        item.brand?.toLowerCase().includes(query.toLowerCase()) ||
        item.category.toLowerCase().includes(query.toLowerCase())
      );
    }

    if (category && category !== 'all') {
      filtered = filtered.filter(item => item.category === category);
    }

    if (priceRange) {
      filtered = filtered.filter(item => 
        item.price >= priceRange[0] && item.price <= priceRange[1]
      );
    }

    return filtered;
  };

  const getItemById = (itemId: string) => {
    return items.find(item => item.id === itemId);
  };

  const getSimilarItems = (item: MarketItem, limit: number = 6) => {
    return items
      .filter(i => i.id !== item.id && i.category === item.category)
      .slice(0, limit);
  };

  useEffect(() => {
    fetchMarketItems();
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
    likeItem,
    searchItems,
    getItemById,
    getSimilarItems,
    refetch: () => Promise.all([fetchMarketItems(), fetchUserListings(), fetchLikedItems()])
  };
};