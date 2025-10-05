import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { itemId, merchantId, amount } = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get authenticated user
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check rate limit
    const { data: rateLimitData, error: rateLimitError } = await supabase.rpc(
      'check_market_purchase_limit',
      { p_user_id: user.id, p_amount: amount }
    );

    if (rateLimitError) {
      console.error('Rate limit check error:', rateLimitError);
    }

    const rateLimit = rateLimitData?.[0];
    if (!rateLimit?.allowed) {
      return new Response(
        JSON.stringify({ 
          error: "Purchase limit exceeded", 
          reason: rateLimit?.reason 
        }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check merchant verification
    const { data: merchantData, error: merchantError } = await supabase
      .from('market_merchant_verification')
      .select('is_suspended, trust_score')
      .eq('user_id', merchantId)
      .single();

    if (merchantError) {
      console.error('Merchant verification error:', merchantError);
    }

    if (merchantData?.is_suspended) {
      return new Response(
        JSON.stringify({ error: "Merchant is suspended" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Calculate fraud score (simple version)
    let fraudScore = 0;
    if (merchantData && merchantData.trust_score < 40) {
      fraudScore += 30;
    }
    if (amount > 1000) {
      fraudScore += 20;
    }

    // Log transaction
    const { data: transactionData, error: transactionError } = await supabase.rpc(
      'log_market_transaction',
      {
        p_buyer_id: user.id,
        p_merchant_id: merchantId,
        p_item_id: itemId,
        p_amount: amount,
        p_status: 'completed',
        p_fraud_score: fraudScore
      }
    );

    if (transactionError) {
      console.error('Transaction logging error:', transactionError);
      throw new Error('Failed to log transaction');
    }

    // If fraud score is high, flag for review
    if (fraudScore > 70) {
      await supabase.from('market_fraud_detection').insert({
        user_id: user.id,
        transaction_id: transactionData,
        fraud_type: 'amount',
        risk_score: fraudScore,
        action_taken: 'review',
        details: { reason: 'High fraud score on purchase' }
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        transaction_id: transactionData,
        message: "Purchase completed successfully"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error" 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
