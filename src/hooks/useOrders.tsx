import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Order {
  id: string;
  merchant_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string | null;
  items: any;
  subtotal: number;
  tax_amount: number;
  shipping_amount: number;
  discount_amount: number;
  total_amount: number;
  status: string;
  payment_method?: string | null;
  payment_status: string;
  shipping_address?: any;
  billing_address?: any;
  notes?: string | null;
  tracking_number?: string | null;
  created_at: string;
  updated_at: string;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface OrderItem {
  id: string;
  order_id: string;
  merchant_item_id?: string;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
  image_url?: string;
  created_at: string;
}

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Fetch orders with masked customer data for security
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          merchant_id,
          items,
          subtotal,
          tax_amount,
          shipping_amount,
          discount_amount,
          total_amount,
          status,
          payment_method,
          payment_status,
          notes,
          tracking_number,
          created_at,
          updated_at
        `)
        .eq('merchant_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Add masked customer info for display
      const ordersWithMaskedData = (data || []).map(order => ({
        ...order,
        customer_name: 'Customer Data Protected',
        customer_email: 'Protected',
        customer_phone: null,
        shipping_address: null,
        billing_address: null
      }));

      setOrders(ordersWithMaskedData);
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch orders',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const createOrder = async (orderData: {
    customer_name: string;
    customer_email: string;
    customer_phone?: string;
    items: any;
    subtotal: number;
    tax_amount?: number;
    shipping_amount?: number;
    discount_amount?: number;
    total_amount: number;
    status?: string;
    payment_method?: string;
    payment_status?: string;
    shipping_address?: any;
    billing_address?: any;
    notes?: string;
  }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('orders')
        .insert({
          merchant_id: user.id,
          customer_name: orderData.customer_name,
          customer_email: orderData.customer_email,
          customer_phone: orderData.customer_phone || null,
          items: orderData.items,
          subtotal: orderData.subtotal,
          tax_amount: orderData.tax_amount || 0,
          shipping_amount: orderData.shipping_amount || 0,
          discount_amount: orderData.discount_amount || 0,
          total_amount: orderData.total_amount,
          status: orderData.status || 'pending',
          payment_method: orderData.payment_method || null,
          payment_status: orderData.payment_status || 'pending',
          shipping_address: orderData.shipping_address || null,
          billing_address: orderData.billing_address || null,
          notes: orderData.notes || null
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Order created successfully'
      });

      fetchOrders();
      return data;
    } catch (error: any) {
      console.error('Error creating order:', error);
      toast({
        title: 'Error',
        description: 'Failed to create order',
        variant: 'destructive'
      });
      throw error;
    }
  };

  const updateOrderStatus = async (orderId: string, status: Order['status'], notes?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Get current order to record status history
      const { data: currentOrder } = await supabase
        .from('orders')
        .select('status')
        .eq('id', orderId)
        .single();

      // Update order status
      const { error: updateError } = await supabase
        .from('orders')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .eq('merchant_id', user.id);

      if (updateError) throw updateError;

      // Record status history
      const { error: historyError } = await supabase
        .from('order_status_history')
        .insert({
          order_id: orderId,
          previous_status: currentOrder?.status,
          new_status: status,
          changed_by: user.id,
          notes
        });

      if (historyError) throw historyError;

      toast({
        title: 'Success',
        description: 'Order status updated successfully'
      });

      fetchOrders();
    } catch (error: any) {
      console.error('Error updating order status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update order status',
        variant: 'destructive'
      });
    }
  };

  const updateTrackingNumber = async (orderId: string, trackingNumber: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('orders')
        .update({ 
          tracking_number: trackingNumber,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .eq('merchant_id', user.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Tracking number updated successfully'
      });

      fetchOrders();
    } catch (error: any) {
      console.error('Error updating tracking number:', error);
      toast({
        title: 'Error',
        description: 'Failed to update tracking number',
        variant: 'destructive'
      });
    }
  };

  const getOrderItems = async (orderId: string): Promise<OrderItem[]> => {
    try {
      const { data, error } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      return data || [];
    } catch (error: any) {
      console.error('Error fetching order items:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch order items',
        variant: 'destructive'
      });
      return [];
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return {
    orders,
    loading,
    fetchOrders,
    createOrder,
    updateOrderStatus,
    updateTrackingNumber,
    getOrderItems
  };
};