import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    // Get user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { type, data } = await req.json();

    console.log(`[Payment] Processing ${type} payment for user ${user.id}`);

    switch (type) {
      case 'marketplace_purchase': {
        const { transaction_id, payment_method, amount } = data;

        // Validate transaction exists
        const { data: transaction, error: txError } = await supabaseClient
          .from('marketplace_transactions')
          .select('*')
          .eq('id', transaction_id)
          .eq('buyer_id', user.id)
          .single();

        if (txError || !transaction) {
          throw new Error('Transaction not found');
        }

        // Simulate payment processing (in production, integrate with Stripe, PayPal, etc.)
        const paymentSuccess = Math.random() > 0.1; // 90% success rate

        if (paymentSuccess) {
          // Update transaction status
          const { error: updateError } = await supabaseClient
            .from('marketplace_transactions')
            .update({
              payment_status: 'completed',
              payment_method,
              status: 'processing',
              updated_at: new Date().toISOString(),
            })
            .eq('id', transaction_id);

          if (updateError) throw updateError;

          // Update market item status
          const { error: itemError } = await supabaseClient
            .from('market_items')
            .update({ status: 'sold' })
            .eq('id', transaction.item_id);

          if (itemError) throw itemError;

          console.log(`[Payment] Successfully processed payment for transaction ${transaction_id}`);

          return new Response(
            JSON.stringify({
              success: true,
              transaction_id,
              message: 'Payment processed successfully',
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } else {
          // Payment failed
          const { error: updateError } = await supabaseClient
            .from('marketplace_transactions')
            .update({
              payment_status: 'failed',
              status: 'cancelled',
              updated_at: new Date().toISOString(),
            })
            .eq('id', transaction_id);

          if (updateError) throw updateError;

          throw new Error('Payment processing failed');
        }
      }

      case 'merchant_order': {
        const { order_id, payment_method, amount } = data;

        // Validate order exists
        const { data: order, error: orderError } = await supabaseClient
          .from('orders')
          .select('*')
          .eq('id', order_id)
          .single();

        if (orderError || !order) {
          throw new Error('Order not found');
        }

        // Simulate payment processing
        const paymentSuccess = Math.random() > 0.1;

        if (paymentSuccess) {
          const { error: updateError } = await supabaseClient
            .from('orders')
            .update({
              payment_status: 'paid',
              payment_method,
              status: 'confirmed',
              updated_at: new Date().toISOString(),
            })
            .eq('id', order_id);

          if (updateError) throw updateError;

          console.log(`[Payment] Successfully processed payment for order ${order_id}`);

          return new Response(
            JSON.stringify({
              success: true,
              order_id,
              message: 'Payment processed successfully',
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } else {
          const { error: updateError } = await supabaseClient
            .from('orders')
            .update({
              payment_status: 'failed',
              status: 'cancelled',
              updated_at: new Date().toISOString(),
            })
            .eq('id', order_id);

          if (updateError) throw updateError;

          throw new Error('Payment processing failed');
        }
      }

      default:
        throw new Error('Invalid payment type');
    }
  } catch (error: any) {
    console.error('[Payment] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
