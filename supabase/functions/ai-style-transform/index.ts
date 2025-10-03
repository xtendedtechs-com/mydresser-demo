import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    const { image, styleTransform } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    console.log('Processing style transformation:', styleTransform);

    // Map style transforms to instructions
    const styleInstructions: Record<string, string> = {
      'vintage': 'Apply a vintage fashion filter to this outfit. Make it look like a retro photograph from the 1970s with warm tones and slight grain.',
      'modern': 'Transform this to a modern, contemporary fashion look with clean lines and fresh styling.',
      'elegant': 'Enhance the elegance of this outfit. Add sophisticated styling, better lighting, and a refined aesthetic.',
      'casual': 'Make this outfit look more casual and relaxed. Adjust the styling for everyday comfort.',
      'professional': 'Transform this into professional business attire. Make it look polished and office-appropriate.',
      'seasonal-summer': 'Adapt this outfit for summer. Adjust colors and styling to bright, light, summery tones.',
      'seasonal-winter': 'Transform this outfit for winter. Add cozy layers and winter-appropriate styling.',
      'color-enhance': 'Enhance and improve the colors in this outfit. Make them more vibrant and visually appealing.',
      'background-studio': 'Place this person in a professional photo studio setting with clean white background and professional lighting.',
      'background-outdoor': 'Place this person in a beautiful outdoor setting with natural lighting.',
    };

    const instruction = styleInstructions[styleTransform] || styleTransform;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image-preview",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: instruction
              },
              {
                type: "image_url",
                image_url: {
                  url: image
                }
              }
            ]
          }
        ],
        modalities: ["image", "text"]
      })
    });

    if (response.status === 429) {
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (response.status === 402) {
      return new Response(
        JSON.stringify({ error: "AI credits depleted. Please add credits to continue." }),
        { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const transformedImage = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!transformedImage) {
      throw new Error('No image returned from AI');
    }

    console.log('Style transformation completed successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        transformedImage,
        message: "Style transformation completed successfully"
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );

  } catch (error) {
    console.error('Style transformation error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error",
        success: false 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
