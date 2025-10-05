import { useCallback, useMemo, useState, useEffect } from 'react';

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
    // Stub: provide empty but well-typed data so UI renders without errors
    setIsLoading(true);
    try {
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
