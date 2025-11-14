import { useCallback, useMemo, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface MerchantAnalyticsDay {
  date: string;
  // Basic metrics
  sales: number;
  orders: number;
  views: number;
  // Extended metrics expected by some components (optional fallbacks)
  total_sales?: number;
  total_orders?: number;
  total_items_sold?: number;
  average_order_value?: number;
  new_customers?: number;
  returning_customers?: number;
  top_selling_items?: Array<{ id: string; name: string; sales: number; revenue: number; quantity?: number }>;
  revenue_by_category?: Record<string, number>;
}

export const useMerchantAnalytics = () => {
  const [analytics, setAnalytics] = useState<MerchantAnalyticsDay[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);

  const fetchAnalytics = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch orders for analytics
      const { data: orders } = await supabase
        .from('orders')
        .select('*')
        .eq('merchant_id', user.id)
        .order('created_at', { ascending: true });

      if (!orders || orders.length === 0) {
        setAnalytics([]);
        return;
      }

      // Group by date and calculate daily metrics
      const dailyData = new Map<string, MerchantAnalyticsDay>();
      
      orders.forEach(order => {
        const date = new Date(order.created_at).toISOString().split('T')[0];
        const existing = dailyData.get(date) || {
          date,
          sales: 0,
          orders: 0,
          views: 0,
          total_sales: 0,
          total_orders: 0,
          total_items_sold: 0,
          average_order_value: 0,
          new_customers: 0,
          returning_customers: 0,
          top_selling_items: [],
          revenue_by_category: {}
        };

        existing.sales += order.total_amount || 0;
        existing.total_sales = existing.sales;
        existing.orders += 1;
        existing.total_orders = existing.orders;
        existing.total_items_sold += (order.items as any[])?.length || 0;

        dailyData.set(date, existing);
      });

      // Calculate average order values
      dailyData.forEach((day, date) => {
        day.average_order_value = day.orders > 0 ? day.sales / day.orders : 0;
        dailyData.set(date, day);
      });

      setAnalytics(Array.from(dailyData.values()));
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setAnalytics([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const calculateDailyAnalytics = useCallback(async () => {
    setIsCalculating(true);
    try {
      await new Promise((res) => setTimeout(res, 200));
      await fetchAnalytics();
    } finally {
      setIsCalculating(false);
    }
  }, [fetchAnalytics]);

  const totals = useMemo(() => {
    return analytics.reduce(
      (acc, d) => ({
        sales: acc.sales + (d.sales ?? d.total_sales ?? 0),
        orders: acc.orders + (d.orders ?? d.total_orders ?? 0),
        views: acc.views + (d.views ?? 0),
      }),
      { sales: 0, orders: 0, views: 0 }
    );
  }, [analytics]);

  return { analytics, totals, isLoading, calculateDailyAnalytics, isCalculating };
};
