import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SecureCustomerData {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  billing_address: any;
  shipping_address: any;
}

export const useSecureCustomerData = () => {
  const [customerData, setCustomerData] = useState<SecureCustomerData | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchSecureCustomerData = async (orderId: string) => {
    try {
      setLoading(true);
      
      // Use secure function that returns masked customer data
      const { data, error } = await supabase.rpc('get_customer_data_secure', {
        order_id_param: orderId
      });

      if (error) throw error;

      if (data && data.length > 0) {
        setCustomerData({
          customer_name: data[0].customer_name,
          customer_email: data[0].customer_email,
          customer_phone: data[0].customer_phone,
          billing_address: data[0].billing_address,
          shipping_address: data[0].shipping_address
        });
      } else {
        setCustomerData(null);
      }
    } catch (error: any) {
      console.error('Error fetching secure customer data:', error);
      toast({
        title: 'Access Denied',
        description: 'Unable to access customer data for security reasons',
        variant: 'destructive'
      });
      setCustomerData(null);
    } finally {
      setLoading(false);
    }
  };

  const clearCustomerData = () => {
    setCustomerData(null);
  };

  return {
    customerData,
    loading,
    fetchSecureCustomerData,
    clearCustomerData
  };
};