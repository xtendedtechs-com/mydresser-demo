import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface CartItem {
  id: string;
  itemId: string;
  itemType: 'market' | 'merchant';
  name: string;
  price: number;
  image?: string;
  quantity: number;
  merchantId?: string;
}

interface CartState {
  items: CartItem[];
  isLoading: boolean;
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  loadCart: () => Promise<void>;
  syncToDatabase: () => Promise<void>;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,

      addItem: (item) => {
        const existingItem = get().items.find(i => i.itemId === item.itemId);
        
        if (existingItem) {
          set({
            items: get().items.map(i =>
              i.itemId === item.itemId
                ? { ...i, quantity: i.quantity + 1 }
                : i
            )
          });
        } else {
          set({
            items: [...get().items, { ...item, quantity: 1 }]
          });
        }

        // Sync to database
        get().syncToDatabase();
      },

      removeItem: (id) => {
        set({
          items: get().items.filter(item => item.id !== id)
        });
        get().syncToDatabase();
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }

        set({
          items: get().items.map(item =>
            item.id === id ? { ...item, quantity } : item
          )
        });
        get().syncToDatabase();
      },

      clearCart: () => {
        set({ items: [] });
        get().syncToDatabase();
      },

      loadCart: async () => {
        set({ isLoading: true });
        
        try {
          const { data: { user } } = await supabase.auth.getUser();
          
          if (!user) {
            set({ isLoading: false });
            return;
          }

          const { data, error } = await supabase
            .from('cart_items')
            .select('*')
            .eq('user_id', user.id);

          if (error) throw error;

          if (data) {
            const cartItems: CartItem[] = data.map(item => ({
              id: item.id,
              itemId: item.item_id,
              itemType: item.item_type as 'market' | 'merchant',
              name: item.item_name,
              price: item.price,
              image: item.item_image,
              quantity: item.quantity,
              merchantId: item.merchant_id
            }));

            set({ items: cartItems });
          }
        } catch (error) {
          console.error('Error loading cart:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      syncToDatabase: async () => {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          
          if (!user) return;

          const items = get().items;

          // Delete all existing cart items
          await supabase
            .from('cart_items')
            .delete()
            .eq('user_id', user.id);

          // Insert current cart items
          if (items.length > 0) {
            const dbItems = items.map(item => ({
              user_id: user.id,
              item_id: item.itemId,
              item_type: item.itemType,
              item_name: item.name,
              price: item.price,
              item_image: item.image,
              quantity: item.quantity,
              merchant_id: item.merchantId
            }));

            const { error } = await supabase
              .from('cart_items')
              .insert(dbItems);

            if (error) throw error;
          }
        } catch (error) {
          console.error('Error syncing cart:', error);
        }
      },

      getTotalPrice: () => {
        return get().items.reduce((total, item) => total + (item.price * item.quantity), 0);
      },

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      }
    }),
    {
      name: 'mydresser-cart'
    }
  )
);
