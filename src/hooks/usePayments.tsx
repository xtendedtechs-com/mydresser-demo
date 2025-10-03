import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { myDresserPayments, PaymentMethod, Transaction } from '@/services/myDresserPayments';
import { supabase } from '@/integrations/supabase/client';

export const usePayments = () => {
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  const processPayment = async (
    amount: number,
    currency: string,
    paymentMethod: PaymentMethod,
    description: string,
    metadata?: Record<string, any>
  ) => {
    try {
      setProcessing(true);
      
      const result = await myDresserPayments.processPayment(
        amount,
        currency,
        paymentMethod,
        description,
        metadata
      );

      if (result.success) {
        toast({
          title: 'Payment Successful',
          description: `Transaction ID: ${result.transactionId}`,
        });
        return { success: true, transactionId: result.transactionId };
      } else {
        throw new Error(result.error || 'Payment failed');
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      toast({
        title: 'Payment Failed',
        description: error.message,
        variant: 'destructive',
      });
      return { success: false, error: error.message };
    } finally {
      setProcessing(false);
    }
  };

  const processMarketplaceSale = async (
    sellerId: string,
    buyerId: string,
    itemId: string,
    amount: number,
    paymentMethod: PaymentMethod
  ) => {
    try {
      setProcessing(true);
      
      const result = await myDresserPayments.processMarketplaceSale(
        sellerId,
        buyerId,
        itemId,
        amount,
        paymentMethod
      );

      if (result.success) {
        // Update marketplace transaction in database
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        await supabase
          .from('marketplace_transactions')
          .update({
            payment_status: 'completed',
            status: 'confirmed',
            updated_at: new Date().toISOString(),
          })
          .eq('item_id', itemId)
          .eq('buyer_id', buyerId);

        toast({
          title: 'Purchase Complete',
          description: 'Your payment has been processed successfully',
        });
        
        return { success: true, transactionId: result.transactionId };
      } else {
        throw new Error(result.error || 'Transaction failed');
      }
    } catch (error: any) {
      console.error('Marketplace sale error:', error);
      toast({
        title: 'Transaction Failed',
        description: error.message,
        variant: 'destructive',
      });
      return { success: false, error: error.message };
    } finally {
      setProcessing(false);
    }
  };

  const processOrderPayment = async (
    orderId: string,
    amount: number,
    paymentMethod: PaymentMethod,
    merchantId: string
  ) => {
    try {
      setProcessing(true);
      
      const result = await myDresserPayments.processPayment(
        amount,
        'USD',
        paymentMethod,
        `Order Payment - ${orderId}`,
        { orderId, merchantId, type: 'order' }
      );

      if (result.success) {
        // Update order payment status
        await supabase
          .from('orders')
          .update({
            payment_status: 'completed',
            status: 'confirmed',
            updated_at: new Date().toISOString(),
          })
          .eq('id', orderId)
          .eq('merchant_id', merchantId);

        // Record payment
        await supabase
          .from('payment_records')
          .insert({
            merchant_id: merchantId,
            order_id: orderId,
            amount,
            payment_method: paymentMethod.type,
            payment_status: 'completed',
            transaction_id: result.transactionId,
            payment_gateway: 'mydresser',
            processed_at: new Date().toISOString(),
          });

        toast({
          title: 'Payment Successful',
          description: 'Order payment has been processed',
        });
        
        return { success: true, transactionId: result.transactionId };
      } else {
        throw new Error(result.error || 'Payment failed');
      }
    } catch (error: any) {
      console.error('Order payment error:', error);
      toast({
        title: 'Payment Failed',
        description: error.message,
        variant: 'destructive',
      });
      return { success: false, error: error.message };
    } finally {
      setProcessing(false);
    }
  };

  const getUserTransactions = async (limit?: number): Promise<Transaction[]> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      
      return await myDresserPayments.getUserTransactions(user.id, limit);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      return [];
    }
  };

  return {
    processing,
    processPayment,
    processMarketplaceSale,
    processOrderPayment,
    getUserTransactions,
  };
};
