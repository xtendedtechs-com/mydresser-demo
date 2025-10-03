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
    const { itemData, wardrobeContext } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are a smart purchase decision analyzer for MyDresser. Your job is to help users make informed buying decisions by analyzing:

1. Item quality and value-for-money
2. Versatility and outfit potential
3. Wardrobe gap analysis
4. Price-to-value ratio
5. Sustainability factors
6. Cost-per-wear projections

Provide objective, data-driven analysis with specific scores and actionable recommendations.`;

    const userPrompt = `Analyze this potential purchase:

Item Details:
- Name: ${itemData.name}
- Price: $${itemData.price}
- Category: ${itemData.category}
- Quality: ${itemData.quality}
- Versatility: ${itemData.versatility}

Current Wardrobe Context:
${JSON.stringify(wardrobeContext)}

Provide a detailed analysis with:
1. Overall purchase score (0-100)
2. Factor-by-factor breakdown (quality, versatility, wardrobe fit, price-value, sustainability)
3. Each factor score (0-30 points) with reasoning
4. Final recommendation (buy/reconsider/skip)
5. Summary explanation

Format as JSON with: score, recommendation, factors (array with name, score, impact, details), summary.`;

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
        response_format: { type: "json_object" },
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
    let analysis;
    
    try {
      analysis = JSON.parse(data.choices[0].message.content);
    } catch {
      // If JSON parsing fails, return the content as-is
      analysis = { raw: data.choices[0].message.content };
    }

    return new Response(
      JSON.stringify({ analysis }),
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
