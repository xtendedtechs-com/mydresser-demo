import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from '@/hooks/useProfile';
import { useToast } from '@/hooks/use-toast';

export interface Order {
  id: string;
  merchant_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'completed';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_method?: string;
  subtotal: number;
  tax_amount: number;
  shipping_amount: number;
  discount_amount: number;
  total_amount: number;
  items: any[];
  shipping_address?: any;
  billing_address?: any;
  tracking_number?: string;
  notes?: string;
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
          order_items (*)
        `)
        .order('created_at', { ascending: false });

      // Only merchants see their orders
      if (profile?.role === 'merchant') {
        query = query.eq('merchant_id', user.id);
      } else {
        // Regular users would see their purchase orders (not implemented yet)
        setOrders([]);
        setLoading(false);
        return;
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
        ...order,
        status: order.status as Order['status'],
        payment_status: order.payment_status as Order['payment_status'],
        items: Array.isArray(order.items) ? order.items : []
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
    customer_name: string;
    customer_email: string;
    customer_phone?: string;
    items: Array<{
      merchant_item_id?: string;
      name: string;
      description?: string;
      price: number;
      quantity: number;
      size?: string;
      color?: string;
      image_url?: string;
    }>;
    shipping_address?: any;
    billing_address?: any;
    payment_method?: string;
    notes?: string;
  }) => {
    if (!user?.id) return null;

    try {
      // Calculate totals
      const subtotal = orderData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const tax_amount = subtotal * 0.08; // 8% tax
      const shipping_amount = subtotal > 100 ? 0 : 9.99; // Free shipping over $100
      const total_amount = subtotal + tax_amount + shipping_amount;

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([{
          merchant_id: user.id,
          customer_name: orderData.customer_name,
          customer_email: orderData.customer_email,
          customer_phone: orderData.customer_phone,
          status: 'pending',
          payment_status: 'pending',
          payment_method: orderData.payment_method,
          subtotal,
          tax_amount,
          shipping_amount,
          discount_amount: 0,
          total_amount,
          items: orderData.items,
          shipping_address: orderData.shipping_address,
          billing_address: orderData.billing_address,
          notes: orderData.notes
        }])
        .select()
        .single();

      if (orderError) {
        console.error('Error creating order:', orderError);
        toast({
          title: "Error",
          description: "Failed to create order",
          variant: "destructive"
        });
        return null;
      }

      // Create order items
      if (orderData.items.length > 0) {
        const orderItems = orderData.items.map(item => ({
          order_id: order.id,
          merchant_item_id: item.merchant_item_id,
          name: item.name,
          description: item.description,
          price: item.price,
          quantity: item.quantity,
          size: item.size,
          color: item.color,
          image_url: item.image_url
        }));

        const { error: itemsError } = await supabase
          .from('order_items')
          .insert(orderItems);

        if (itemsError) {
          console.error('Error creating order items:', itemsError);
        }
      }

      await fetchOrders();
      toast({
        title: "Success",
        description: "Order created successfully"
      });

      return order;
    } catch (error) {
      console.error('Error in createOrder:', error);
      return null;
    }
  };

  const updateOrderStatus = async (orderId: string, status: Order['status'], notes?: string) => {
    if (!user?.id) return false;

    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          status, 
          notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .eq('merchant_id', user.id);

      if (error) {
        console.error('Error updating order status:', error);
        toast({
          title: "Error",
          description: "Failed to update order status",
          variant: "destructive"
        });
        return false;
      }

      // Log status history
      await supabase
        .from('order_status_history')
        .insert([{
          order_id: orderId,
          new_status: status,
          changed_by: user.id,
          notes
        }]);

      await fetchOrders();
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

  const getTotalRevenue = () => {
    return orders
      .filter(order => order.payment_status === 'paid')
      .reduce((sum, order) => sum + order.total_amount, 0);
  };

  useEffect(() => {
    if (user?.id) {
      fetchOrders();
    }
  }, [user?.id, profile?.role]);

  return {
    orders,
    loading,
    createOrder,
    updateOrderStatus,
    getTotalRevenue,
    refetch: fetchOrders
  };
};