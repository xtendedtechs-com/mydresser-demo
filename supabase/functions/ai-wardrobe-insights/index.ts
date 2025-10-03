import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { wardrobeItems, analysisType } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Aggregate wardrobe statistics
    const stats = {
      totalItems: wardrobeItems.length,
      categories: {} as Record<string, number>,
      colors: {} as Record<string, number>,
      brands: {} as Record<string, number>,
      conditions: {} as Record<string, number>,
      seasons: {} as Record<string, number>,
      avgWearCount: 0,
      favoriteCount: 0
    };

    let totalWearCount = 0;
    
    wardrobeItems.forEach((item: any) => {
      stats.categories[item.category] = (stats.categories[item.category] || 0) + 1;
      if (item.color) stats.colors[item.color] = (stats.colors[item.color] || 0) + 1;
      if (item.brand) stats.brands[item.brand] = (stats.brands[item.brand] || 0) + 1;
      stats.conditions[item.condition] = (stats.conditions[item.condition] || 0) + 1;
      if (item.season) stats.seasons[item.season] = (stats.seasons[item.season] || 0) + 1;
      totalWearCount += item.wear_count || 0;
      if (item.is_favorite) stats.favoriteCount++;
    });

    stats.avgWearCount = wardrobeItems.length > 0 ? totalWearCount / wardrobeItems.length : 0;

    const systemPrompt = `You are MyDresser AI Analytics Expert. Analyze wardrobe data and provide actionable insights.
Focus on:
- Wardrobe balance and gaps
- Usage patterns and underutilized items
- Style cohesion and versatility
- Sustainable practices and cost per wear
- Recommendations for optimization`;

    let userPrompt = '';
    
    if (analysisType === 'overview') {
      userPrompt = `Analyze this wardrobe overview:
Total Items: ${stats.totalItems}
Categories: ${JSON.stringify(stats.categories)}
Top Colors: ${JSON.stringify(stats.colors)}
Top Brands: ${JSON.stringify(stats.brands)}
Condition Distribution: ${JSON.stringify(stats.conditions)}
Season Distribution: ${JSON.stringify(stats.seasons)}
Average Wear Count: ${stats.avgWearCount.toFixed(1)}
Favorite Items: ${stats.favoriteCount}

Provide:
1. Overall wardrobe assessment
2. Strengths and gaps
3. Usage insights
4. Specific recommendations for improvement`;
    } else if (analysisType === 'gaps') {
      userPrompt = `Identify wardrobe gaps based on:
${JSON.stringify(stats, null, 2)}

Provide:
1. Essential missing items
2. Style versatility opportunities
3. Seasonal coverage gaps
4. Prioritized shopping list`;
    } else if (analysisType === 'sustainability') {
      userPrompt = `Analyze wardrobe sustainability:
${JSON.stringify(stats, null, 2)}

Consider:
- Cost per wear calculations
- Underutilized items (low wear count)
- Quality vs quantity balance
- Repair vs replace recommendations`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.6,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits depleted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      throw new Error(`AI Gateway returned ${response.status}`);
    }

    const data = await response.json();
    const insights = data.choices[0]?.message?.content;

    return new Response(
      JSON.stringify({ 
        insights, 
        stats,
        model: "google/gemini-2.5-flash" 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in ai-wardrobe-insights:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error occurred" 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
