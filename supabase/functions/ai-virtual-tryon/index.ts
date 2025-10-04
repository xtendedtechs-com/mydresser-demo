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

    // Validate and process user image
    const processImage = async (src: string): Promise<string> => {
      if (typeof src !== 'string' || !src) {
        throw new Error('Invalid user image: must be a non-empty string');
      }
      
      // If already a data URL, validate format and size
      if (src.startsWith('data:')) {
        const match = src.match(/^data:image\/(jpeg|jpg|png|webp);base64,/);
        if (!match) {
          throw new Error('Unsupported image format. Please use JPEG, PNG, or WebP.');
        }
        
        // Check data URL size (max ~4MB for Gemini)
        const base64Data = src.split(',')[1];
        const sizeInBytes = (base64Data.length * 3) / 4;
        const sizeInMB = sizeInBytes / (1024 * 1024);
        
        if (sizeInMB > 4) {
          throw new Error(`Image too large (${sizeInMB.toFixed(1)}MB). Please use an image under 4MB.`);
        }
        
        console.log(`Image size: ${sizeInMB.toFixed(2)}MB`);
        return src;
      }
      
      // For HTTP(S) URLs, fetch and convert
      try {
        console.log('Fetching image from URL:', src.substring(0, 100));
        const res = await fetch(src);
        if (!res.ok) {
          throw new Error(`Image fetch failed with status ${res.status}`);
        }
        
        const contentType = res.headers.get('content-type');
        if (!contentType || !contentType.startsWith('image/')) {
          throw new Error(`Invalid content type: ${contentType}. Expected image/*`);
        }
        
        const arrayBuffer = await res.arrayBuffer();
        const sizeInMB = arrayBuffer.byteLength / (1024 * 1024);
        
        if (sizeInMB > 4) {
          throw new Error(`Image too large (${sizeInMB.toFixed(1)}MB). Please use an image under 4MB.`);
        }
        
        console.log(`Fetched image: ${sizeInMB.toFixed(2)}MB, type: ${contentType}`);
        
        // Convert to base64
        let binary = '';
        const bytes = new Uint8Array(arrayBuffer);
        for (let i = 0; i < bytes.length; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        const base64 = btoa(binary);
        return `data:${contentType};base64,${base64}`;
      } catch (e) {
        console.error('Image processing failed:', e);
        throw new Error(`Failed to process image: ${e instanceof Error ? e.message : 'Unknown error'}`);
      }
    };

    const processedImage = await processImage(userImage);

    console.log('Processing virtual try-on request with', clothingItems.length, 'items...');

    // Build detailed outfit description
    const outfitDescription = clothingItems.map((item: any) => {
      const parts = [item.category, item.name];
      if (item.color) parts.push(`in ${item.color}`);
      if (item.brand) parts.push(`by ${item.brand}`);
      return parts.join(' ');
    }).join(', ');

    console.log('Outfit description:', outfitDescription);

    // Construct the editing instruction with clear, specific guidance
    const editInstruction = instruction || 
      `Create a realistic photo showing the person wearing these specific clothing items: ${outfitDescription}.
       
       Requirements:
       - Keep the person's face, body pose, and background EXACTLY as shown in the original photo
       - Replace ONLY the clothing with the items described
       - Ensure the new clothes fit naturally on the person's body
       - Match the lighting and quality of the original photo
       - Make fabric textures and colors look realistic
       - Maintain proper proportions and perspective
       
       Generate a single edited photo where the person is wearing the described outfit.`;

    console.log('Calling AI Gateway for image generation...');
    console.log('Image format:', processedImage.substring(0, 30) + '...');

    // Call Lovable AI Gateway for image generation (not editing)
    // Gemini image preview works better with generation than editing
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
                type: "image_url",
                image_url: {
                  url: processedImage
                }
              },
              {
                type: "text",
                text: editInstruction
              }
            ]
          }
        ],
        modalities: ["image", "text"],
        max_tokens: 4096
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
