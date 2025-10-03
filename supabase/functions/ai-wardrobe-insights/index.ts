import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { wardrobeItems, analysisType = 'overview' } = await req.json();

    if (!wardrobeItems || wardrobeItems.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No wardrobe items provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Prepare analysis context
    const totalItems = wardrobeItems.length;
    const categories = [...new Set(wardrobeItems.map((i: any) => i.category))];
    const avgWearCount = wardrobeItems.reduce((sum: number, i: any) => sum + (i.wear_count || 0), 0) / totalItems;
    const totalValue = wardrobeItems.reduce((sum: number, i: any) => sum + (i.purchase_price || 0), 0);
    const favoriteCount = wardrobeItems.filter((i: any) => i.is_favorite).length;

    const categoryBreakdown = wardrobeItems.reduce((acc: any, item: any) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {});

    let systemPrompt = '';
    let userPrompt = '';

    if (analysisType === 'overview') {
      systemPrompt = `You are a professional fashion stylist and wardrobe consultant providing comprehensive wardrobe analysis. Analyze the user's wardrobe and provide actionable insights about their style, wardrobe composition, and optimization opportunities.`;
      
      userPrompt = `Analyze this wardrobe:
- Total items: ${totalItems}
- Categories: ${categories.join(', ')}
- Category breakdown: ${JSON.stringify(categoryBreakdown)}
- Average wear count: ${avgWearCount.toFixed(1)}
- Favorite items: ${favoriteCount}
- Total value: $${totalValue.toFixed(2)}

Provide a comprehensive overview including:
1. Wardrobe composition analysis
2. Style patterns and preferences
3. Most/least used categories
4. Optimization recommendations
5. Cost per wear insights`;

    } else if (analysisType === 'gaps') {
      systemPrompt = `You are a fashion consultant specializing in wardrobe gap analysis. Identify missing pieces and suggest strategic additions to complete the user's wardrobe.`;
      
      userPrompt = `Analyze wardrobe gaps:
- Current categories: ${categories.join(', ')}
- Category distribution: ${JSON.stringify(categoryBreakdown)}
- Total items: ${totalItems}

Identify:
1. Missing essential categories
2. Underrepresented categories
3. Suggested additions for versatility
4. Key pieces to complete the wardrobe
5. Priority purchases`;

    } else if (analysisType === 'sustainability') {
      systemPrompt = `You are a sustainable fashion expert. Analyze the wardrobe from an environmental and sustainability perspective.`;
      
      const avgCondition = wardrobeItems.filter((i: any) => i.condition === 'excellent' || i.condition === 'good').length / totalItems * 100;
      const costPerWear = totalValue / Math.max(wardrobeItems.reduce((sum: number, i: any) => sum + (i.wear_count || 1), 0), 1);
      
      userPrompt = `Sustainability analysis:
- Total items: ${totalItems}
- Total value: $${totalValue.toFixed(2)}
- Average wear count: ${avgWearCount.toFixed(1)}
- Cost per wear: $${costPerWear.toFixed(2)}
- Good condition items: ${avgCondition.toFixed(1)}%

Provide:
1. Sustainability score assessment
2. Cost-per-wear analysis
3. Wardrobe longevity insights
4. Recommendations for sustainable practices
5. Tips for maximizing wardrobe value`;
    }

    // Call OpenRouter API with Gemini 2.5 Flash
    const openRouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('OPENROUTER_API_KEY')}`,
        'HTTP-Referer': 'https://mydresser.app',
        'X-Title': 'MyDresser AI Assistant',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!openRouterResponse.ok) {
      const errorText = await openRouterResponse.text();
      console.error('OpenRouter API error:', errorText);
      
      if (openRouterResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (openRouterResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Insufficient AI credits' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      throw new Error('OpenRouter API request failed');
    }

    const aiResponse = await openRouterResponse.json();
    const insights = aiResponse.choices[0]?.message?.content || 'Unable to generate insights at this time.';

    return new Response(
      JSON.stringify({
        insights,
        analysisType,
        metadata: {
          totalItems,
          categories: categories.length,
          avgWearCount: parseFloat(avgWearCount.toFixed(1)),
          totalValue: parseFloat(totalValue.toFixed(2))
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in ai-wardrobe-insights:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
