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
    const { wardrobeItems, occasion, weather, preferences } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const wardrobeSummary = wardrobeItems.map((item: any) => 
      `${item.name} (${item.category}, ${item.color}, ${item.brand || 'no brand'})`
    ).join(", ");

    const systemPrompt = `You are an AI outfit recommendation engine for MyDresser. 
Analyze wardrobe items and create perfect outfit combinations.

Guidelines:
- Create 3-5 complete outfit suggestions
- Consider color harmony and style coherence
- Match outfits to the occasion and weather
- Ensure all items work well together
- Rate each outfit with a confidence score (0-100)
- Provide styling tips for each outfit

Return structured recommendations.`;

    const userPrompt = `
Wardrobe: ${wardrobeSummary}
Occasion: ${occasion || 'casual'}
Weather: ${weather ? `${weather.temperature}°C, ${weather.condition}` : 'mild'}
Preferences: ${preferences || 'none specified'}

Create outfit recommendations.`;

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
        tools: [{
          type: "function",
          function: {
            name: "suggest_outfits",
            description: "Generate outfit recommendations",
            parameters: {
              type: "object",
              properties: {
                outfits: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      items: { type: "array", items: { type: "string" } },
                      confidence_score: { type: "number" },
                      styling_tips: { type: "string" },
                      occasion_match: { type: "number" },
                      weather_appropriate: { type: "boolean" }
                    },
                    required: ["name", "items", "confidence_score", "styling_tips"]
                  }
                }
              },
              required: ["outfits"]
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "suggest_outfits" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits depleted. Please add credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      throw new Error("Failed to generate recommendations");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall) {
      throw new Error("No recommendations generated");
    }

    const recommendations = JSON.parse(toolCall.function.arguments);

    return new Response(
      JSON.stringify(recommendations),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in ai-outfit-recommendations:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
