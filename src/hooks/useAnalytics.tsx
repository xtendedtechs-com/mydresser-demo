import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from '@/hooks/useProfile';
import { useMerchantItems } from '@/hooks/useMerchantItems';
import { useOrders } from '@/hooks/useOrders';

export interface AnalyticsData {
  // Sales metrics
  totalRevenue: number;
  monthlyRevenue: number;
  dailyRevenue: number;
  revenueGrowth: number;
  
  // Order metrics
  totalOrders: number;
  monthlyOrders: number;
  averageOrderValue: number;
  ordersGrowth: number;
  
  // Product metrics
  totalProducts: number;
  topSellingProducts: Array<{
    id: string;
    name: string;
    sales: number;
    revenue: number;
  }>;
  
  // Customer metrics
  totalCustomers: number;
  newCustomers: number;
  returningCustomers: number;
  customerRetentionRate: number;
  
  // Performance metrics
  conversionRate: number;
  averageSessionDuration: number;
  bounceRate: number;
  
  // Traffic metrics
  totalViews: number;
  uniqueVisitors: number;
  pageViews: number;
  
  // Inventory metrics
  lowStockItems: number;
  outOfStockItems: number;
  inventoryValue: number;
}

export const useAnalytics = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const { user, profile } = useProfile();
  const { items } = useMerchantItems();
  const { orders } = useOrders();

  const calculateAnalytics = async () => {
    if (!user?.id || profile?.role !== 'merchant') return;

    setLoading(true);
    try {
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

      // Calculate revenue metrics
      const paidOrders = orders.filter(order => order.payment_status === 'paid');
      const totalRevenue = paidOrders.reduce((sum, order) => sum + order.total_amount, 0);
      
      const monthlyOrders = paidOrders.filter(order => {
        const orderDate = new Date(order.created_at);
        return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
      });
      const monthlyRevenue = monthlyOrders.reduce((sum, order) => sum + order.total_amount, 0);
      
      const lastMonthOrders = paidOrders.filter(order => {
        const orderDate = new Date(order.created_at);
        return orderDate.getMonth() === lastMonth && orderDate.getFullYear() === lastMonthYear;
      });
      const lastMonthRevenue = lastMonthOrders.reduce((sum, order) => sum + order.total_amount, 0);
      
      const revenueGrowth = lastMonthRevenue > 0 
        ? ((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
        : 0;

      // Calculate order metrics
      const totalOrders = orders.length;
      const averageOrderValue = totalOrders > 0 ? totalRevenue / paidOrders.length : 0;
      const ordersGrowth = lastMonthOrders.length > 0 
        ? ((monthlyOrders.length - lastMonthOrders.length) / lastMonthOrders.length) * 100 
        : 0;

      // Calculate product metrics
      const totalProducts = items.length;
      
      // Mock top selling products for now
      const topSellingProducts = items.slice(0, 5).map((item, index) => ({
        id: item.id,
        name: item.name,
        sales: Math.floor(Math.random() * 20) + 5,
        revenue: (Math.floor(Math.random() * 20) + 5) * item.price
      }));

      // Calculate customer metrics using mock data since we don't have customer_email in orders
      const totalCustomers = Math.max(20, Math.floor(orders.length * 0.8));
      const newCustomers = Math.floor(totalCustomers * 0.3);
      const returningCustomers = totalCustomers - newCustomers;
      const customerRetentionRate = totalCustomers > 0 ? (returningCustomers / totalCustomers) * 100 : 0;

      // Calculate inventory metrics
      const lowStockItems = items.filter(item => (item.stock_quantity || 0) <= 5).length;
      const outOfStockItems = items.filter(item => (item.stock_quantity || 0) === 0).length;
      const inventoryValue = items.reduce((sum, item) => sum + (item.price * (item.stock_quantity || 0)), 0);

      // Mock traffic metrics
      const totalViews = Math.floor(Math.random() * 1000) + 100;
      const uniqueVisitors = Math.floor(totalViews * 0.7);
      const pageViews = totalViews;
      const averageSessionDuration = Math.floor(Math.random() * 300) + 60; // 1-5 minutes
      const bounceRate = Math.floor(Math.random() * 40) + 30; // 30-70%

      // Calculate conversion rate
      const conversionRate = uniqueVisitors > 0 ? (paidOrders.length / uniqueVisitors) * 100 : 0;

      setAnalytics({
        totalRevenue,
        monthlyRevenue,
        dailyRevenue: monthlyRevenue / new Date().getDate(),
        revenueGrowth,
        
        totalOrders,
        monthlyOrders: monthlyOrders.length,
        averageOrderValue,
        ordersGrowth,
        
        totalProducts,
        topSellingProducts,
        
        totalCustomers,
        newCustomers,
        returningCustomers,
        customerRetentionRate,
        
        conversionRate,
        averageSessionDuration,
        bounceRate,
        
        totalViews,
        uniqueVisitors,
        pageViews,
        
        lowStockItems,
        outOfStockItems,
        inventoryValue
      });

    } catch (error) {
      console.error('Error calculating analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const logPageView = async (page: string, additionalData?: any) => {
    // Mock implementation for now
    console.log('Page view logged:', page, additionalData);
  };

  const logItemView = async (itemId: string, itemName: string) => {
    // Mock implementation for now
    console.log('Item view logged:', itemId, itemName);
  };

  const logPurchase = async (orderId: string, amount: number) => {
    // Mock implementation for now
    console.log('Purchase logged:', orderId, amount);
  };

  const getTopCustomers = (limit: number = 10) => {
    // Mock data for now
    return Array.from({ length: Math.min(limit, 5) }, (_, i) => ({
      name: `Customer ${i + 1}`,
      email: `customer${i + 1}@example.com`,
      total: Math.floor(Math.random() * 1000) + 100,
      orders: Math.floor(Math.random() * 10) + 1
    }));
  };

  useEffect(() => {
    if (user?.id && profile?.role === 'merchant') {
      calculateAnalytics();
    }
  }, [user?.id, profile?.role, items, orders]);

  return {
    analytics,
    loading,
    logPageView,
    logItemView,
    logPurchase,
    getTopCustomers,
    refetch: calculateAnalytics
  };
};