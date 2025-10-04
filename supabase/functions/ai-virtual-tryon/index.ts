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
    const { userImage, clothingItems, instruction } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Normalize user image to a data URL to avoid external fetch failures
    const toDataUrl = async (src: string): Promise<string> => {
      if (typeof src !== 'string' || !src) throw new Error('Invalid user image');
      if (src.startsWith('data:')) return src;
      try {
        const res = await fetch(src);
        if (!res.ok) throw new Error(`Image fetch failed: ${res.status}`);
        const contentType = res.headers.get('content-type') || 'image/jpeg';
        const arrayBuffer = await res.arrayBuffer();
        let binary = '';
        const bytes = new Uint8Array(arrayBuffer);
        for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
        const base64 = btoa(binary);
        return `data:${contentType};base64,${base64}`;
      } catch (e) {
        console.error('Image normalization failed, passing through original URL', e);
        return src;
      }
    };

    const processedImage = await toDataUrl(userImage);

    console.log('Processing virtual try-on request with', clothingItems?.length || 0, 'items...');

    // Build detailed outfit description
    const outfitDescription = clothingItems?.map((item: any) => {
      return `${item.category}: ${item.name}${item.color ? ` in ${item.color}` : ''}${item.brand ? ` by ${item.brand}` : ''}`;
    }).join(', ') || 'outfit';

    // Construct the editing instruction
    const editInstruction = instruction || 
      `Transform this person's clothing to dress them in the following complete outfit: ${outfitDescription}. 
       Make the clothing look natural, properly fitted, and realistic. 
       Ensure all items coordinate well together and match the person's pose, body shape, and the lighting in the photo.
       The result should look like a professional fashion photo where the person is actually wearing these clothes.`;

    // Call Lovable AI Gateway for image editing
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
                text: editInstruction
              },
              {
                type: "image_url",
                image_url: {
                  url: processedImage
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
    const editedImage = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!editedImage) {
      throw new Error('No image returned from AI');
    }

    console.log('Virtual try-on completed successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        editedImageUrl: editedImage,
        message: "Virtual try-on completed successfully"
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );

  } catch (error) {
    console.error('Virtual try-on error:', error);
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
