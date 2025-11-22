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
    const startTime = Date.now();
    const { userImage, clothingItems, instruction } = await req.json();
    
    if (!userImage || !clothingItems || clothingItems.length === 0) {
      throw new Error('Missing required parameters: userImage and clothingItems are required');
    }

    // OpenAI API Key
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      console.error('No OpenAI API key configured');
      throw new Error('OpenAI API key not configured. Please add OPENAI_API_KEY secret.');
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
        
        // Check data URL size (max ~4MB for OpenAI)
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

    // Construct detailed VTO prompt for image generation
    const vtoPrompt = instruction || 
      `Create a photorealistic virtual try-on image. Edit the person in the provided image to be wearing these exact clothing items: ${outfitDescription}. 
      
IMPORTANT: Preserve the person's face, facial features, hair, skin tone, body pose, and background exactly as they appear in the original photo. Only modify the clothing to match the specified items. Ensure realistic lighting, shadows, fabric textures, proper fit, natural proportions, and perspective matching the original photo.`;

    console.log('Calling OpenAI gpt-image-1 for virtual try-on...');

    // Call OpenAI image generation API with gpt-image-1
    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-image-1",
        prompt: `${vtoPrompt}\n\nBase image to edit: ${processedImage}`,
        n: 1,
        size: "1024x1024",
        quality: "high",
        output_format: "png"
      })
    });

    console.log('OpenAI response status:', response.status);

    if (response.status === 429) {
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (response.status === 402) {
      return new Response(
        JSON.stringify({ error: "Insufficient credits. Please add credits to your OpenAI account." }),
        { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI error:', response.status, errorText);
      throw new Error(`OpenAI returned error ${response.status}. Please check your API key and try again.`);
    }

    const data = await response.json();
    console.log('OpenAI response structure:', JSON.stringify(data, null, 2).slice(0, 500));

    // Extract the generated image URL or base64
    let editedImage = null;
    
    if (data.data?.[0]?.url) {
      editedImage = data.data[0].url;
    } else if (data.data?.[0]?.b64_json) {
      editedImage = `data:image/png;base64,${data.data[0].b64_json}`;
    }

    if (!editedImage) {
      console.error('No image in OpenAI response. Full response:', JSON.stringify(data, null, 2));
      throw new Error('OpenAI did not generate an image. Please try again.');
    }

    console.log('Virtual try-on completed successfully with OpenAI');

    return new Response(
      JSON.stringify({ 
        imageUrl: editedImage,
        processingTime: Date.now() - startTime,
        sizeRecommendations: { top: 'M', bottom: 'M', confidence: 0.7 },
        bodyShape: 'rectangle'
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
        imageUrl: null
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
