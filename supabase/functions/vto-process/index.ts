import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

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

    const { userPhotoPath, itemId, itemType } = await req.json();

    // Get user authentication
    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) {
      throw new Error('Unauthorized');
    }

    console.log('Processing VTO for user:', user.id, 'item:', itemId);

    // Get item data based on type
    let itemData;
    if (itemType === 'merchant') {
      const { data } = await supabaseClient
        .from('merchant_items')
        .select('*')
        .eq('id', itemId)
        .single();
      itemData = data;
    } else if (itemType === 'wardrobe') {
      const { data } = await supabaseClient
        .from('wardrobe_items')
        .select('*')
        .eq('id', itemId)
        .single();
      itemData = data;
    } else if (itemType === 'market') {
      const { data } = await supabaseClient
        .from('market_items')
        .select('*')
        .eq('id', itemId)
        .single();
      itemData = data;
    }

    if (!itemData) {
      throw new Error('Item not found');
    }

    // Get user measurements
    const { data: userPrefs } = await supabaseClient
      .from('vto_user_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // Simulate VTO processing (in production, this would call an AI model)
    // For now, we'll return mock data with realistic scores
    const fitScore = Math.floor(Math.random() * 20) + 75; // 75-95
    const confidenceScore = Math.floor(Math.random() * 15) + 80; // 80-95

    // Get user photo URL
    const { data: photoData } = await supabaseClient.storage
      .from('vto-photos')
      .createSignedUrl(userPhotoPath, 3600);

    // Simulate result image (in production, this would be the AI-generated result)
    const resultImageUrl = photoData?.signedUrl || '';

    // Calculate size recommendation
    const sizeRecommendation = fitScore >= 85 ? 'perfect_fit' : 
                              fitScore >= 70 ? 'good_fit' : 'consider_sizing';

    const response = {
      success: true,
      fitScore,
      confidenceScore,
      resultImageUrl,
      sizeRecommendation,
      userMeasurements: userPrefs?.body_measurements || null,
      itemData: {
        name: itemData.name || itemData.title,
        size: itemData.size,
        material: itemData.material,
      },
      processingTime: '2.3s',
      timestamp: new Date().toISOString(),
    };

    // Log the VTO session
    await supabaseClient.from('vto_analytics').insert({
      user_id: user.id,
      item_id: itemId,
      event_type: 'session_start',
      event_data: {
        item_type: itemType,
        fit_score: fitScore,
      },
    });

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('VTO processing error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Failed to process virtual try-on'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
