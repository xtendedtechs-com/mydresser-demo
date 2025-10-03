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
    const { itemToAnalyze, wardrobeData, budget } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are a smart purchase decision analyzer for MyDresser. Analyze purchases based on:

1. Value for money and quality
2. Versatility with existing wardrobe
3. Wardrobe gap filling
4. Cost-per-wear estimates
5. Style compatibility

Return a JSON object with:
- recommendation: "buy" | "wait" | "skip"
- score: number (0-100)
- reasons: string[] (3-5 key reasons)
- alternativeSuggestions: string[] (2-3 alternatives)
- costPerWear: number (estimated)
- wardrobeGapFill: string (explanation)
- versatilityScore: number (0-100)`;

    const userPrompt = `Analyze this purchase:

Item: ${itemToAnalyze.name}
Price: $${itemToAnalyze.price}
Description: ${itemToAnalyze.description || 'N/A'}

Current Wardrobe Summary:
- Total items: ${wardrobeData.length}
- Categories: ${[...new Set(wardrobeData.map((i: any) => i.category))].join(', ')}
- Average wear count: ${Math.round(wardrobeData.reduce((sum: number, i: any) => sum + (i.wear_count || 0), 0) / wardrobeData.length)}

Budget:
- Monthly: $${budget.monthly}
- Price range: $${budget.preferred_price_range[0]}-$${budget.preferred_price_range[1]}

Provide detailed analysis in JSON format.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded" }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits depleted" }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    
    // Parse the AI response
    let analysisResult;
    try {
      const content = data.choices[0].message.content;
      analysisResult = typeof content === 'string' ? JSON.parse(content) : content;
    } catch {
      // Fallback if parsing fails
      analysisResult = {
        recommendation: 'wait',
        score: 50,
        reasons: ['Unable to complete full analysis'],
        alternativeSuggestions: [],
        costPerWear: itemToAnalyze.price / 20,
        wardrobeGapFill: 'Analysis incomplete',
        versatilityScore: 50
      };
    }

    return new Response(
      JSON.stringify(analysisResult),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in ai-purchase-analyzer:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
