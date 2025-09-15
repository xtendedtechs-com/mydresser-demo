import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useProfile } from '@/hooks/useProfile';

export interface Order {
  id: string;
  buyer_id: string;
  seller_id: string;
  item_id: string;
  quantity: number;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'completed' | 'cancelled';
  shipping_address?: any;
  payment_method?: string;
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
  tracking_number?: string;
  notes?: string;
  customer_name?: string;
  created_at: string;
  updated_at: string;
}

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, profile } = useProfile();
  const { toast } = useToast();

  const fetchOrders = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      let query = supabase
        .from('orders')
        .select(`
          *,
          market_items(title, price),
          buyer_profile:profiles!orders_buyer_id_fkey(display_name),
          seller_profile:profiles!orders_seller_id_fkey(display_name)
        `)
        .order('created_at', { ascending: false });

      // If user is a merchant, get orders for their items
      // If user is a customer, get their purchases
      if (profile?.role === 'merchant' || profile?.role === 'professional') {
        query = query.eq('seller_id', user.id);
      } else {
        query = query.eq('buyer_id', user.id);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching orders:', error);
        toast({
          title: "Error",
          description: "Failed to load orders",
          variant: "destructive"
        });
        return;
      }

      const formattedOrders: Order[] = data?.map(order => ({
        id: order.id,
        buyer_id: order.buyer_id,
        seller_id: order.seller_id,
        item_id: order.item_id,
        quantity: order.quantity || 1,
        total_amount: order.total_amount,
        status: order.status,
        shipping_address: order.shipping_address,
        payment_method: order.payment_method,
        payment_status: order.payment_status,
        tracking_number: order.tracking_number,
        notes: order.notes,
        customer_name: order.buyer_profile?.display_name || order.seller_profile?.display_name || 'Unknown',
        created_at: order.created_at,
        updated_at: order.updated_at
      })) || [];

      setOrders(formattedOrders);
    } catch (error) {
      console.error('Error in fetchOrders:', error);
      toast({
        title: "Error",
        description: "Failed to load orders",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createOrder = async (orderData: {
    seller_id: string;
    item_id: string;
    quantity?: number;
    total_amount: number;
    shipping_address?: any;
    payment_method?: string;
  }) => {
    if (!user?.id) return null;

    try {
      const { data, error } = await supabase
        .from('orders')
        .insert([{
          buyer_id: user.id,
          ...orderData,
          quantity: orderData.quantity || 1,
          status: 'pending',
          payment_status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating order:', error);
        toast({
          title: "Error",
          description: "Failed to create order",
          variant: "destructive"
        });
        return null;
      }

      await fetchOrders(); // Refresh the list
      toast({
        title: "Success",
        description: "Order created successfully"
      });
      
      return data;
    } catch (error) {
      console.error('Error in createOrder:', error);
      return null;
    }
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) {
        console.error('Error updating order status:', error);
        toast({
          title: "Error",
          description: "Failed to update order status",
          variant: "destructive"
        });
        return false;
      }

      await fetchOrders(); // Refresh the list
      toast({
        title: "Success",
        description: "Order status updated successfully"
      });
      
      return true;
    } catch (error) {
      console.error('Error in updateOrderStatus:', error);
      return false;
    }
  };

  const updatePaymentStatus = async (orderId: string, payment_status: Order['payment_status']) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({
          payment_status,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) {
        console.error('Error updating payment status:', error);
        toast({
          title: "Error",
          description: "Failed to update payment status",
          variant: "destructive"
        });
        return false;
      }

      await fetchOrders(); // Refresh the list
      toast({
        title: "Success",
        description: "Payment status updated successfully"
      });
      
      return true;
    } catch (error) {
      console.error('Error in updatePaymentStatus:', error);
      return false;
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user?.id, profile?.role]);

  return {
    orders,
    loading,
    createOrder,
    updateOrderStatus,
    updatePaymentStatus,
    refetch: fetchOrders
  };
};