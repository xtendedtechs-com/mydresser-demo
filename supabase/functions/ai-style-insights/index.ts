import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { wardrobeData, recentOutfits, preferences } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = `You are an expert fashion AI stylist analyzing a user's wardrobe and style patterns. 
Provide personalized insights about their style, wardrobe composition, and actionable recommendations for improvement.
Focus on being specific, practical, and encouraging.`;

    const userPrompt = `Analyze this wardrobe data and provide comprehensive style insights:

Wardrobe Summary:
- Total Items: ${wardrobeData.totalItems}
- Categories: ${JSON.stringify(wardrobeData.categories)}
- Colors: ${JSON.stringify(wardrobeData.colors)}
- Brands: ${JSON.stringify(wardrobeData.brands)}

Recent Outfits: ${JSON.stringify(recentOutfits)}
User Preferences: ${JSON.stringify(preferences)}

Provide insights in the following structure:
1. Style Identity: What their wardrobe says about their style
2. Wardrobe Strengths: What they're doing well
3. Gaps & Opportunities: What's missing or underutilized
4. Color Analysis: How they use color and suggestions
5. Personalized Tips: 3-5 specific actionable recommendations`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), 
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Payment required. Please add credits to your workspace.' }), 
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const insights = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ insights }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in ai-style-insights:', error);
    return new Response(
      JSON.stringify({ error: error.message }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
