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
      console.error('LOVABLE_API_KEY is not configured');
      throw new Error('AI service not configured. Please contact support.');
    }

    if (!userImage || !clothingItems || clothingItems.length === 0) {
      throw new Error('Missing required parameters: userImage and clothingItems are required');
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

    console.log('Processing virtual try-on request with', clothingItems.length, 'items...');

    // Build detailed outfit description
    const outfitDescription = clothingItems.map((item: any) => {
      const parts = [item.category, item.name];
      if (item.color) parts.push(`in ${item.color}`);
      if (item.brand) parts.push(`by ${item.brand}`);
      return parts.join(' ');
    }).join(', ');

    console.log('Outfit description:', outfitDescription);

    // Construct the editing instruction - emphasize that we're editing an existing image
    const editInstruction = instruction || 
      `Edit this photo to show the person wearing these clothes: ${outfitDescription}. 
       Make the new clothing look natural and properly fitted to their body. 
       Keep the person's pose, face, and background exactly the same. 
       Only change the clothing to match the described outfit.
       Ensure proper lighting and realistic fabric textures.`;

    console.log('Calling AI Gateway with image editing request...');

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

    console.log('AI Gateway response status:', response.status);

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
      throw new Error(`AI service returned error ${response.status}. Please try again.`);
    }

    const data = await response.json();
    console.log('AI Gateway response structure:', JSON.stringify(data, null, 2).slice(0, 500));

    // Try multiple paths to get the image
    const editedImage = 
      data.choices?.[0]?.message?.images?.[0]?.image_url?.url ||
      data.choices?.[0]?.message?.content?.find((c: any) => c.type === 'image_url')?.image_url?.url ||
      data.data?.[0]?.url ||
      data.image_url;

    if (!editedImage) {
      console.error('No image in response. Full response:', JSON.stringify(data, null, 2));
      throw new Error('AI did not generate an image. This feature may require additional setup. Please try again or contact support.');
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
