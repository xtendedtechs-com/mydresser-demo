import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface MerchantAnalytics {
  id: string;
  merchant_id: string;
  date: string;
  total_sales: number;
  total_orders: number;
  total_items_sold: number;
  average_order_value: number;
  new_customers: number;
  returning_customers: number;
  revenue_by_category: Record<string, number>;
  top_selling_items: Array<{ id: string; name: string; quantity: number; revenue: number }>;
  created_at: string;
  updated_at: string;
}

export const useMerchantAnalytics = (dateRange?: { start: string; end: string }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch analytics data
  const { data: analytics, isLoading, error } = useQuery({
    queryKey: ['merchant-analytics', dateRange],
    queryFn: async () => {
      let query = supabase
        .from('merchant_analytics')
        .select('*')
        .order('date', { ascending: false });

      if (dateRange) {
        query = query
          .gte('date', dateRange.start)
          .lte('date', dateRange.end);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as MerchantAnalytics[];
    },
  });

  // Calculate daily analytics
  const calculateDailyAnalytics = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get today's orders
      const today = new Date().toISOString().split('T')[0];
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('merchant_id', user.id)
        .gte('created_at', `${today}T00:00:00`)
        .lte('created_at', `${today}T23:59:59`);

      if (ordersError) throw ordersError;

      // Calculate metrics
      const totalSales = orders?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;
      const totalOrders = orders?.length || 0;
      const totalItemsSold = orders?.reduce((sum, order) => 
        sum + (order.order_items?.reduce((itemSum, item) => itemSum + item.quantity, 0) || 0), 0) || 0;
      const avgOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

      // Get customer data
      const customerEmails = orders?.map(o => o.customer_email) || [];
      const { data: existingCustomers } = await supabase
        .from('merchant_customers')
        .select('customer_email')
        .eq('merchant_id', user.id)
        .in('customer_email', customerEmails);

      const existingEmails = new Set(existingCustomers?.map(c => c.customer_email) || []);
      const newCustomers = customerEmails.filter(email => !existingEmails.has(email)).length;
      const returningCustomers = customerEmails.filter(email => existingEmails.has(email)).length;

      // Revenue by category
      const revenueByCategory: Record<string, number> = {};
      orders?.forEach(order => {
        order.order_items?.forEach(item => {
          const category = item.description || 'Uncategorized';
          revenueByCategory[category] = (revenueByCategory[category] || 0) + Number(item.price) * item.quantity;
        });
      });

      // Top selling items
      const itemSales: Record<string, { name: string; quantity: number; revenue: number }> = {};
      orders?.forEach(order => {
        order.order_items?.forEach(item => {
          if (!itemSales[item.merchant_item_id || item.name]) {
            itemSales[item.merchant_item_id || item.name] = {
              name: item.name,
              quantity: 0,
              revenue: 0
            };
          }
          itemSales[item.merchant_item_id || item.name].quantity += item.quantity;
          itemSales[item.merchant_item_id || item.name].revenue += Number(item.price) * item.quantity;
        });
      });

      const topSellingItems = Object.entries(itemSales)
        .map(([id, data]) => ({ id, ...data }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10);

      // Upsert analytics
      const { error } = await supabase
        .from('merchant_analytics')
        .upsert({
          merchant_id: user.id,
          date: today,
          total_sales: totalSales,
          total_orders: totalOrders,
          total_items_sold: totalItemsSold,
          average_order_value: avgOrderValue,
          new_customers: newCustomers,
          returning_customers: returningCustomers,
          revenue_by_category: revenueByCategory,
          top_selling_items: topSellingItems
        });

      if (error) throw error;
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchant-analytics'] });
      toast({
        title: 'Analytics Updated',
        description: 'Daily analytics have been calculated successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    analytics,
    isLoading,
    error,
    calculateDailyAnalytics: calculateDailyAnalytics.mutate,
    isCalculating: calculateDailyAnalytics.isPending,
  };
};
