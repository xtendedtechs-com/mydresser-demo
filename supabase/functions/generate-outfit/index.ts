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
    const { userId, occasion, weather, timeSlot, preferences } = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch user's wardrobe items
    const { data: wardrobeItems, error: wardrobeError } = await supabase
      .from("wardrobe_items")
      .select("*")
      .eq("user_id", userId)
      .eq("is_favorite", false); // Get available items

    if (wardrobeError) throw wardrobeError;

    if (!wardrobeItems || wardrobeItems.length === 0) {
      return new Response(
        JSON.stringify({ 
          error: "No wardrobe items found. Please add items to your wardrobe first." 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Get AI settings for user
    const { data: aiSettings } = await supabase
      .from("ai_service_settings")
      .select("*")
      .eq("user_id", userId)
      .single();

    const selectedModel = aiSettings?.recommendation_model || "google/gemini-2.5-flash";

    // Build AI prompt
    const prompt = `You are a professional fashion stylist. Create an outfit suggestion based on:

Occasion: ${occasion}
Time: ${timeSlot}
Weather: ${weather ? `${weather.temperature}°C, ${weather.condition}` : 'Not specified'}
${preferences?.colors ? `Preferred colors: ${preferences.colors.join(', ')}` : ''}
${preferences?.styles ? `Preferred styles: ${preferences.styles.join(', ')}` : ''}

Available wardrobe items:
${wardrobeItems.map((item: any, idx: number) => 
  `${idx + 1}. ${item.name} - ${item.category} - ${item.color} - ${item.brand || 'No brand'}`
).join('\n')}

Create a complete outfit by selecting items from the wardrobe. Return ONLY valid JSON with this exact structure:
{
  "outfit_name": "string",
  "description": "string",
  "selected_items": ["item_id_1", "item_id_2"],
  "confidence_score": number (0-100),
  "reasoning": "string explaining why this outfit works",
  "style_tags": ["tag1", "tag2"]
}`;

    // Call Lovable AI
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: selectedModel,
        messages: [
          { 
            role: "system", 
            content: "You are a professional fashion stylist. Always respond with valid JSON only." 
          },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI API Error:", aiResponse.status, errorText);
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiResult = await aiResponse.json();
    const content = aiResult.choices[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    // Parse AI response - strip markdown code blocks if present
    let outfitData;
    try {
      let cleanContent = content.trim();
      
      // Remove markdown code block markers
      if (cleanContent.startsWith('```json')) {
        cleanContent = cleanContent.replace(/^```json\s*\n/, '').replace(/\n```\s*$/, '');
      } else if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.replace(/^```\s*\n/, '').replace(/\n```\s*$/, '');
      }
      
      outfitData = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      throw new Error("Invalid AI response format");
    }

    // Create outfit in database
    const { data: outfit, error: outfitError } = await supabase
      .from("outfits")
      .insert({
        user_id: userId,
        name: outfitData.outfit_name,
        description: outfitData.description,
        occasion: occasion,
        season: getSeason(weather?.temperature),
        style_tags: outfitData.style_tags || [],
        photos: { main: wardrobeItems[0]?.photos?.main || "/placeholder.svg" }
      })
      .select()
      .single();

    if (outfitError) throw outfitError;

    // Create outfit items relationships
    const outfitItems = outfitData.selected_items.map((itemId: string) => ({
      outfit_id: outfit.id,
      wardrobe_item_id: itemId
    }));

    const { error: itemsError } = await supabase
      .from("outfit_items")
      .insert(outfitItems);

    if (itemsError) console.error("Error creating outfit items:", itemsError);

    // Create daily suggestion record
    const { data: suggestion, error: suggestionError } = await supabase
      .from("daily_outfit_suggestions")
      .insert({
        user_id: userId,
        outfit_id: outfit.id,
        occasion: occasion,
        time_slot: timeSlot,
        confidence_score: outfitData.confidence_score,
        weather_data: weather,
        suggestion_date: new Date().toISOString().split('T')[0]
      })
      .select()
      .single();

    if (suggestionError) throw suggestionError;

    return new Response(
      JSON.stringify({
        id: suggestion.id,
        items: wardrobeItems.filter((item: any) => 
          outfitData.selected_items.includes(item.id)
        ),
        confidenceScore: outfitData.confidence_score,
        reasoning: outfitData.reasoning,
        weatherData: weather,
        occasion: occasion,
        date: new Date().toISOString(),
        timeSlot: timeSlot
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

function getSeason(temperature?: number): string {
  if (!temperature) return 'all-season';
  if (temperature < 10) return 'winter';
  if (temperature < 20) return 'spring';
  if (temperature < 28) return 'summer';
  return 'fall';
}
