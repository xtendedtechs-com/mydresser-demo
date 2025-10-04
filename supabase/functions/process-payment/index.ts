import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { type, data } = await req.json();

    switch (type) {
      case 'marketplace_purchase': {
        const { transactionId, itemId, sellerId, buyerId, amount } = data;

        const { data: transaction } = await supabaseClient
          .from('marketplace_transactions')
          .select('*')
          .eq('id', transactionId)
          .single();

        if (!transaction) {
          throw new Error('Transaction not found');
        }

        await new Promise(resolve => setTimeout(resolve, 1000));

        const { error: updateError } = await supabaseClient
          .from('marketplace_transactions')
          .update({
            payment_status: 'completed',
            status: 'confirmed',
            updated_at: new Date().toISOString(),
          })
          .eq('id', transactionId);

        if (updateError) throw updateError;

        await supabaseClient
          .from('market_items')
          .update({ status: 'sold' })
          .eq('id', itemId);

        return new Response(
          JSON.stringify({ success: true, transactionId }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'merchant_order': {
        const { orderId, merchantId, amount, paymentMethod } = data;

        const { data: order } = await supabaseClient
          .from('orders')
          .select('*')
          .eq('id', orderId)
          .eq('merchant_id', merchantId)
          .single();

        if (!order) {
          throw new Error('Order not found');
        }

        await new Promise(resolve => setTimeout(resolve, 1000));

        const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        const { error: updateError } = await supabaseClient
          .from('orders')
          .update({
            payment_status: 'completed',
            status: 'confirmed',
            updated_at: new Date().toISOString(),
          })
          .eq('id', orderId);

        if (updateError) throw updateError;

        await supabaseClient
          .from('payment_records')
          .insert({
            merchant_id: merchantId,
            order_id: orderId,
            amount,
            payment_method: paymentMethod,
            payment_status: 'completed',
            transaction_id: transactionId,
            payment_gateway: 'mydresser',
            processed_at: new Date().toISOString(),
          });

        return new Response(
          JSON.stringify({ success: true, transactionId }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        throw new Error('Invalid payment type');
    }
  } catch (error) {
    console.error('Payment processing error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Payment processing failed' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    );
  }
});
