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
    const { wardrobeData, analysisType } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let systemPrompt = "";
    let userPrompt = "";

    if (analysisType === "trends") {
      systemPrompt = `You are a fashion trend analyst for MyDresser. Analyze current fashion trends and provide insights.`;
      userPrompt = `Based on the current fashion landscape and the following wardrobe data: ${JSON.stringify(wardrobeData)}, provide:
      
1. Top 5 current fashion trends with momentum scores (0-100)
2. Which trends are rising vs declining
3. Confidence level for each prediction (0-100%)
4. Specific recommendations for the user

Format your response as a structured JSON with trends array containing: name, momentum, confidence, category, prediction (rising/stable/declining), and reasoning.`;
    } else if (analysisType === "style_evolution") {
      systemPrompt = `You are a personal style evolution analyst for MyDresser. Track and analyze style changes over time.`;
      userPrompt = `Analyze the style evolution based on this wardrobe data: ${JSON.stringify(wardrobeData)}.

Provide insights on:
1. Dominant style periods and transitions
2. Style maturity indicators
3. Key transformations in fashion choices
4. Current style metrics (versatility, sophistication, etc.)
5. Predicted future style direction

Format as JSON with timeline, metrics, and insights.`;
    } else if (analysisType === "predictive") {
      systemPrompt = `You are a predictive fashion AI for MyDresser. Predict future outfit needs and shopping requirements.`;
      userPrompt = `Based on wardrobe data: ${JSON.stringify(wardrobeData)}, predict:

1. Upcoming outfit needs for next 7 days
2. Weather-appropriate recommendations
3. Occasion-based predictions
4. Wardrobe gaps to fill
5. Seasonal preparation items

Format as JSON with predictions array containing: date, occasion, confidence, items, reasoning.`;
    }

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
        temperature: 0.7,
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
    const analysis = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ analysis }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in ai-trend-analysis:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
